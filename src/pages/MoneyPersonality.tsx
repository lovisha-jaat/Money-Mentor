import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/layout/BottomNav";
import { classifyPersonality } from "@/lib/finance";
import { Brain, ArrowRight, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const QUESTIONS = [
  {
    q: "When you get an unexpected ₹10,000 bonus, you usually...",
    options: [
      { label: "Save it in the bank", scores: { saver: 2, spender: 0, investor: 0 } },
      { label: "Treat yourself or family", scores: { saver: 0, spender: 2, investor: 0 } },
      { label: "Top up an existing SIP / invest", scores: { saver: 0, spender: 0, investor: 2 } },
    ],
  },
  {
    q: "Your monthly SIP / investment habit looks like...",
    options: [
      { label: "I don't invest yet", scores: { saver: 1, spender: 1, investor: 0 } },
      { label: "Mostly FDs and savings", scores: { saver: 2, spender: 0, investor: 0 } },
      { label: "Equity MFs / stocks every month", scores: { saver: 0, spender: 0, investor: 2 } },
    ],
  },
  {
    q: "When markets drop 20%, you...",
    options: [
      { label: "Panic and stop SIPs", scores: { saver: 1, spender: 1, investor: 0 } },
      { label: "Wait it out, do nothing", scores: { saver: 1, spender: 0, investor: 1 } },
      { label: "Buy more — sale time!", scores: { saver: 0, spender: 0, investor: 2 } },
    ],
  },
  {
    q: "Your monthly expenses vs income ratio is...",
    options: [
      { label: "Above 80% — barely save", scores: { saver: 0, spender: 2, investor: 0 } },
      { label: "Around 60-70%", scores: { saver: 1, spender: 1, investor: 1 } },
      { label: "Below 50% — high savings", scores: { saver: 2, spender: 0, investor: 1 } },
    ],
  },
  {
    q: "You see a ₹5,000 gadget on sale. You...",
    options: [
      { label: "Buy it instantly", scores: { saver: 0, spender: 2, investor: 0 } },
      { label: "Sleep on it 24 hours", scores: { saver: 1, spender: 0, investor: 1 } },
      { label: "Skip it — invest the ₹5K instead", scores: { saver: 1, spender: 0, investor: 2 } },
    ],
  },
  {
    q: "Your idea of a great financial goal is...",
    options: [
      { label: "₹1 Cr in FDs by 50", scores: { saver: 2, spender: 0, investor: 0 } },
      { label: "Owning a luxury car", scores: { saver: 0, spender: 2, investor: 0 } },
      { label: "FIRE by 45 with passive income", scores: { saver: 0, spender: 0, investor: 2 } },
    ],
  },
];

export default function MoneyPersonality() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState({ saver: 0, spender: 0, investor: 0 });
  const [done, setDone] = useState(false);

  const handlePick = (s: { saver: number; spender: number; investor: number }) => {
    const next = { saver: scores.saver + s.saver, spender: scores.spender + s.spender, investor: scores.investor + s.investor };
    setScores(next);
    if (step + 1 >= QUESTIONS.length) {
      setDone(true);
      const result = classifyPersonality(next);
      if (user) {
        supabase.from("personality_results").insert({ user_id: user.id, personality_type: result.type, scores: next as any });
      }
    } else {
      setStep(step + 1);
    }
  };

  const reset = () => { setStep(0); setScores({ saver: 0, spender: 0, investor: 0 }); setDone(false); };

  const result = done ? classifyPersonality(scores) : null;
  const typeColor: Record<string, string> = { saver: "text-blue-500", spender: "text-amber-500", investor: "text-primary", balanced: "text-purple-500" };
  const typeEmoji: Record<string, string> = { saver: "🏦", spender: "💸", investor: "📈", balanced: "⚖️" };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-card border-b border-border/60">
        <div className="max-w-2xl mx-auto px-5 py-5">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Money Personality</p>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Brain className="w-6 h-6 text-primary" /> Discover your type</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6 space-y-5">
        {!done ? (
          <>
            <div className="flex gap-1.5">
              {QUESTIONS.map((_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>
            <Card className="border-border/60">
              <CardContent className="p-6 space-y-4">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Question {step + 1} of {QUESTIONS.length}</p>
                <h2 className="text-xl font-bold leading-tight">{QUESTIONS[step].q}</h2>
                <div className="space-y-2 pt-2">
                  {QUESTIONS[step].options.map((o, i) => (
                    <button
                      key={i}
                      onClick={() => handlePick(o.scores)}
                      className="w-full text-left p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-between group"
                    >
                      <span className="font-medium">{o.label}</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-3">{typeEmoji[result!.type]}</div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">You are a</p>
                <h2 className={`text-3xl font-extrabold capitalize ${typeColor[result!.type]}`}>{result!.type}</h2>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardContent className="p-5">
                <h3 className="font-semibold text-sm mb-3">Your personalized strategy</h3>
                <ul className="space-y-2 text-sm">
                  {result!.insights.map((i, idx) => (
                    <li key={idx} className="flex gap-2"><span className="text-primary font-bold">✓</span><span>{i}</span></li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Button variant="outline" onClick={reset} className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" /> Retake quiz
            </Button>
          </>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
