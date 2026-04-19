import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { transactions, goals, budgets, action, purchaseItem, purchaseAmount } = body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompts: Record<string, string> = {
      "saving-plan": `You are a friendly AI Money Coach for students. Based on the user's financial data, generate a personalized Monthly Saving Plan:

1. **💰 Recommended Monthly Savings**: Calculate how much they should save (aim for 20-30% of income)
2. **✂️ Areas to Cut**: Identify 3-5 specific categories where spending can be reduced, with dollar amounts
3. **📋 Actionable Steps**: Give 5 concrete, numbered steps they can take THIS month
4. **🎯 Mini Goals**: Suggest 2-3 quick savings challenges (like "No-spend weekdays" or "Cook 4x this week")
5. **📊 Projected Savings**: Show what they could save in 1, 3, and 6 months if they follow the plan

Keep it motivational, simple, and student-friendly. Use emojis. Format with markdown.`,

      "ask-before-spending": `You are a wise AI Money Coach for students. The user wants to make a purchase. Evaluate it based on their financial data:

1. **Can they afford it?** - Check against their balance and savings goals
2. **Is it necessary?** - Rate necessity 1-5
3. **Impact on goals** - How does this affect their savings goals?
4. **Verdict** - Clear BUY ✅ or SKIP ❌ or WAIT ⏳ recommendation
5. **Reasoning** - Brief explanation of your recommendation
6. **Alternative** - Suggest a cheaper alternative if applicable

Be honest but supportive. Use emojis. Keep it brief and clear.`,

      "emotional-spending": `You are a caring AI Money Coach specializing in behavioral finance for students. Analyze their spending patterns for emotional spending:

1. **🧠 Spending Patterns**: Identify time-based patterns (late night shopping, weekend splurges, post-exam spending)
2. **🚨 Impulse Indicators**: Flag categories with many small, frequent purchases
3. **📊 Stress Spending Score**: Rate their emotional spending tendency (Low/Medium/High)
4. **🔍 Triggers Detected**: Identify likely emotional triggers
5. **💡 Better Habits**: Suggest 5 specific strategies to manage emotional spending
6. **🧘 Mindful Money Tips**: Give 3 mindfulness techniques before making purchases

Be empathetic, not judgmental. Use emojis. Format with markdown.`,

      "weekly-summary": `You are a friendly AI Money Coach for students. Generate a concise weekly financial summary:

1. **📊 This Week's Snapshot**: Total income, expenses, and net for the past 7 days
2. **📈 Progress Update**: How they're tracking against budgets and goals
3. **⭐ Win of the Week**: Highlight something positive about their finances
4. **⚠️ Watch Out**: One area that needs attention
5. **💪 Challenge for Next Week**: One specific actionable challenge

Keep it short, motivational, and fun. Use emojis.`,

      "lifestyle-simulator": `You are an AI Financial Simulator for students. Based on their current financial data, simulate different lifestyle scenarios:

1. **Current Path 📊**: Project their savings in 3, 6, 12 months at current rate
2. **Frugal Mode 🏠**: What if they cut spending by 30%? Show projected savings
3. **Balanced Mode ⚖️**: What if they cut spending by 15%? Show projected savings
4. **Splurge Mode 🎉**: What if spending increases by 20%? Show the impact
5. **Side Hustle Mode 💼**: What if they earned 30% more? Show the projection

Present each scenario with clear numbers. Include a recommendation. Use emojis and markdown.`,

      "achievement-report": `You are an AI Financial Achievement Reporter for students. Generate a comprehensive achievement report:

1. **🏆 Financial Discipline Score**: Rate 1-100 based on consistency, budget adherence, and savings
2. **📊 Key Metrics**: Total saved, budget adherence rate, transaction consistency
3. **🎯 Goals Progress**: Summarize progress toward each savings goal
4. **⭐ Top Achievements**: List 3-5 financial wins
5. **📈 Growth Areas**: Where they've improved most
6. **🎖️ Badges Summary**: What they've earned and what's next
7. **💡 Next Month's Focus**: One key focus area

Make it feel like a report card but fun and encouraging. Use emojis and markdown.`,
    };

    const systemPrompt = prompts[action] || prompts["weekly-summary"];

    const txSummary = JSON.stringify((transactions || []).slice(0, 80).map((t: any) => ({
      type: t.type, amount: t.amount, category: t.category,
      date: t.transaction_date, description: t.description,
    })));

    const goalsSummary = JSON.stringify((goals || []).map((g: any) => ({
      name: g.name, target: g.target_amount, current: g.current_amount, deadline: g.deadline,
    })));

    const budgetsSummary = JSON.stringify((budgets || []).map((b: any) => ({
      category: b.category, amount: b.amount, month: b.month, year: b.year,
    })));

    let userMessage = `Here's my financial data:\n\nTransactions:\n${txSummary}\n\nSavings Goals:\n${goalsSummary}\n\nBudgets:\n${budgetsSummary}`;

    if (action === "ask-before-spending" && purchaseItem) {
      userMessage += `\n\nI want to buy: ${purchaseItem} for $${purchaseAmount}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("money-coach error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
