import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Profile {
  age?: number;
  monthly_income?: number;
  monthly_expenses?: number;
  current_savings?: number;
  current_investments?: number;
  current_debt?: number;
  has_emergency_fund?: boolean;
  has_health_insurance?: boolean;
  has_term_insurance?: boolean;
  retirement_age_target?: number;
  expected_return_pct?: number;
}

function buildSystemPrompt(profile: Profile | null, healthScore: number | null) {
  const ctx = profile
    ? `
USER FINANCIAL CONTEXT (always reference this in answers):
- Age: ${profile.age}
- Monthly income: ₹${profile.monthly_income?.toLocaleString("en-IN")}
- Monthly expenses: ₹${profile.monthly_expenses?.toLocaleString("en-IN")}
- Current savings: ₹${profile.current_savings?.toLocaleString("en-IN")}
- Current investments: ₹${profile.current_investments?.toLocaleString("en-IN")}
- Current debt: ₹${profile.current_debt?.toLocaleString("en-IN")}
- Retirement target age: ${profile.retirement_age_target}
- Has emergency fund: ${profile.has_emergency_fund ? "yes" : "no"}
- Has health insurance: ${profile.has_health_insurance ? "yes" : "no"}
- Has term insurance: ${profile.has_term_insurance ? "yes" : "no"}
- Money Health Score: ${healthScore ?? "n/a"}/100
`
    : "USER HAS NOT COMPLETED ONBOARDING YET — politely ask them to set up their profile first.";

  return `You are FinMentor AI, a friendly financial mentor for middle-class Indian users. Audience: salaried professionals, beginners. Use ₹ symbol and Indian terms (SIP, ELSS, PPF, NPS, 80C, 80D, EPF, FD, Mutual Funds, RBI rules).

RULES:
- Always personalize using the user's numbers below. Reference specific figures.
- Give actionable, step-by-step advice. NEVER generic.
- Use simple language. No jargon without a 1-line explanation.
- Recommend SIPs, tax-saving instruments, insurance amounts in ₹.
- Format with short paragraphs, bullets, and bold key numbers.
- Stay focused on personal finance. Politely deflect off-topic questions.
- Be warm, like a trusted friend who happens to be a CFP.

${ctx}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, profile, healthScore } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = buildSystemPrompt(profile ?? null, healthScore ?? null);

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5-mini",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!upstream.ok) {
      if (upstream.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit hit. Please wait a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (upstream.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in workspace settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const txt = await upstream.text();
      console.error("AI gateway error", upstream.status, txt);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(upstream.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (err) {
    console.error("ai-mentor error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
