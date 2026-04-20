import { useState, useRef, useEffect } from "react";
import { useFinancialProfile } from "@/hooks/useFinancialProfile";
import { calcMoneyHealthScore } from "@/lib/finance";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import BottomNav from "@/components/layout/BottomNav";
import { Send, MessageCircle, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface Msg { role: "user" | "assistant"; content: string; }

const SUGGESTIONS = [
  "Should I prepay home loan or invest in ELSS?",
  "How much SIP do I need to save ₹1 Cr in 10 years?",
  "Old vs new tax regime — which is better for me?",
  "Build me a monthly budget plan",
];

export default function Chat() {
  const { user } = useAuth();
  const { profile } = useFinancialProfile();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load past messages
  useEffect(() => {
    if (!user) return;
    supabase.from("chat_messages").select("role, content").eq("user_id", user.id).order("created_at").limit(50)
      .then(({ data }) => {
        if (data?.length) setMessages(data.map(d => ({ role: d.role as "user" | "assistant", content: d.content })));
      });
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  const send = async (text: string) => {
    if (!text.trim() || loading || !user) return;
    const userMsg: Msg = { role: "user", content: text };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);

    // Persist user msg
    await supabase.from("chat_messages").insert({ user_id: user.id, role: "user", content: text });

    let healthScore: number | null = null;
    if (profile) healthScore = calcMoneyHealthScore(profile).total;

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-mentor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: newMsgs.slice(-12).map(m => ({ role: m.role, content: m.content })),
          profile,
          healthScore,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Failed" }));
        toast.error(err.error || "AI error");
        setLoading(false);
        return;
      }

      setStreaming(true);
      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantText += delta;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantText } : m);
                }
                return [...prev, { role: "assistant", content: assistantText }];
              });
            }
          } catch {/* partial */}
        }
      }

      // Persist assistant
      if (assistantText) await supabase.from("chat_messages").insert({ user_id: user.id, role: "assistant", content: assistantText });
    } catch (e) {
      console.error(e);
      toast.error("Could not reach AI mentor");
    }
    setStreaming(false);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-16">
      <header className="bg-card border-b border-border/60 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground grid place-items-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h1 className="font-bold flex items-center gap-2">FinMentor <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold">AI</span></h1>
            <p className="text-[11px] text-muted-foreground">Online • Personalized to you</p>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-3">
          {messages.length === 0 && (
            <div className="text-center pt-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 grid place-items-center mx-auto">
                <MessageCircle className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Hi there 👋</h2>
                <p className="text-sm text-muted-foreground mt-1">Ask me anything about your money.</p>
              </div>
              <div className="space-y-2 pt-2 max-w-md mx-auto">
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => send(s)} className="w-full text-left p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 text-sm transition-all">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "bg-secondary text-secondary-foreground rounded-tl-sm"
              }`}>
                {m.role === "assistant"
                  ? <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-strong:text-foreground prose-ul:my-1.5 prose-li:my-0"><ReactMarkdown>{m.content}</ReactMarkdown></div>
                  : <span className="whitespace-pre-wrap">{m.content}</span>}
              </div>
            </div>
          ))}

          {loading && !streaming && (
            <div className="flex justify-start">
              <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-3 max-w-[82%] space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Thinking...
                </div>
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border/60 bg-card px-4 py-3 sticky bottom-16">
        <div className="max-w-2xl mx-auto flex gap-2">
          <Input
            placeholder="Ask about SIPs, taxes, FIRE..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send(input)}
            disabled={loading}
            className="h-11"
          />
          <Button onClick={() => send(input)} disabled={loading || !input.trim()} className="h-11 px-4">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
