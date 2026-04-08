import { useState } from "react";
import { useAiStream } from "@/hooks/useAiStream";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, RefreshCw, CalendarDays, Lightbulb, AlertTriangle, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";

const ACTIONS = [
  { key: "weekly-summary", label: "Weekly Summary", icon: CalendarDays, desc: "Get a recap of your week" },
  { key: "saving-plan", label: "Saving Tips", icon: Lightbulb, desc: "Personalized saving advice" },
  { key: "emotional-spending", label: "Spending Habits", icon: AlertTriangle, desc: "Detect impulse patterns" },
];

export default function MoneyCoach() {
  const { result, isLoading, stream, setResult } = useAiStream();
  const [purchaseItem, setPurchaseItem] = useState("");
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const handleAction = (action: string) => {
    setActiveAction(action);
    stream(action);
  };

  const handleAskBeforeSpending = () => {
    if (!purchaseItem.trim() || !purchaseAmount) return;
    setActiveAction("ask-before-spending");
    stream("ask-before-spending", { purchaseItem: purchaseItem.trim(), purchaseAmount: parseFloat(purchaseAmount) });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="relative bg-card px-4 pt-6 pb-5 border-b border-border/40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-chart-4/10 via-transparent to-primary/5" />
        <div className="relative flex items-center gap-3">
          <Brain className="w-6 h-6 text-chart-4" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">AI Money Coach</h1>
            <p className="text-sm text-muted-foreground">Your personal financial advisor</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-5 max-w-lg mx-auto">
        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2">
          {ACTIONS.map(a => (
            <button
              key={a.key}
              onClick={() => handleAction(a.key)}
              disabled={isLoading}
              className={`p-3 rounded-xl border text-center transition-all hover:shadow-md active:scale-[0.97] ${
                activeAction === a.key ? "border-primary bg-primary/5" : "border-border/60 bg-card"
              }`}
            >
              <a.icon className="w-5 h-5 mx-auto mb-1.5 text-primary" />
              <p className="text-[10px] font-semibold leading-tight">{a.label}</p>
            </button>
          ))}
        </div>

        {/* Ask Before Spending */}
        <Card className="shadow-sm border-accent/20">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-semibold">Ask Before Spending</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Thinking of buying something? Let AI evaluate if you should.</p>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="What do you want to buy?"
                value={purchaseItem}
                onChange={e => setPurchaseItem(e.target.value)}
                className="flex-1 h-9 text-sm"
              />
              <Input
                type="number"
                placeholder="$"
                value={purchaseAmount}
                onChange={e => setPurchaseAmount(e.target.value)}
                className="w-20 h-9 text-sm"
              />
            </div>
            <Button
              size="sm"
              onClick={handleAskBeforeSpending}
              disabled={isLoading || !purchaseItem.trim() || !purchaseAmount}
              className="w-full h-8 text-xs"
            >
              {isLoading && activeAction === "ask-before-spending" ? (
                <><RefreshCw className="w-3 h-3 animate-spin mr-1" /> Evaluating...</>
              ) : (
                "Should I Buy This?"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* AI Response */}
        {(result || isLoading) && (
          <Card className="shadow-sm border-chart-4/20">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-chart-4" />
                <h2 className="text-sm font-semibold">Coach's Response</h2>
                {isLoading && <RefreshCw className="w-3 h-3 animate-spin text-muted-foreground ml-auto" />}
              </div>
              {result ? (
                <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Thinking...
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Daily Tip */}
        <Card className="shadow-sm bg-accent/5">
          <CardContent className="pt-4 pb-3">
            <h2 className="text-sm font-semibold mb-2">💡 Daily Tip</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Before buying anything, wait 24 hours. If you still want it tomorrow, it's probably worth it. This simple rule can save you hundreds each month! 🎯
            </p>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
