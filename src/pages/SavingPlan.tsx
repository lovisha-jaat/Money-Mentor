import { useAiStream } from "@/hooks/useAiStream";
import { useTransactions } from "@/hooks/useTransactions";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, RefreshCw, Sparkles, TrendingDown, Wallet } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useMemo } from "react";

export default function SavingPlan() {
  const { transactions } = useTransactions();
  const { result, isLoading, stream } = useAiStream();

  const now = new Date();
  const cm = now.getMonth() + 1;
  const cy = now.getFullYear();

  const monthlyTx = useMemo(() =>
    transactions.filter(t => {
      const d = new Date(t.transaction_date);
      return d.getMonth() + 1 === cm && d.getFullYear() === cy;
    }), [transactions, cm, cy]);

  const income = monthlyTx.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const expenses = monthlyTx.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const potentialSavings = Math.max(0, income - expenses);
  const savingsRate = income > 0 ? Math.round((potentialSavings / income) * 100) : 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="relative bg-card px-4 pt-6 pb-5 border-b border-border/40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5" />
        <div className="relative flex items-center gap-3">
          <CalendarDays className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">Monthly Saving Plan</h1>
            <p className="text-sm text-muted-foreground">AI-generated personalized plan</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-5 max-w-lg mx-auto">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="shadow-sm">
            <CardContent className="p-3 text-center">
              <Wallet className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Income</p>
              <p className="text-sm font-bold text-primary">${income.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-3 text-center">
              <TrendingDown className="w-4 h-4 text-destructive mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Expenses</p>
              <p className="text-sm font-bold text-destructive">${expenses.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-3 text-center">
              <Sparkles className="w-4 h-4 text-accent mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Can Save</p>
              <p className="text-sm font-bold text-accent">{savingsRate}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Generate Plan */}
        <Card className="shadow-sm border-primary/20">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold">Your Saving Plan</h2>
              </div>
              <Button
                size="sm" variant="outline"
                onClick={() => stream("saving-plan")}
                disabled={isLoading || transactions.length === 0}
                className="h-7 text-xs gap-1.5"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
                {isLoading ? "Generating..." : "Generate Plan"}
              </Button>
            </div>
            {result ? (
              <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                {transactions.length === 0
                  ? "Add transactions first to get a personalized saving plan!"
                  : "Click \"Generate Plan\" to get your AI-powered monthly saving strategy."}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
