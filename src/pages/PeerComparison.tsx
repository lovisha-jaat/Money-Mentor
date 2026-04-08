import { useMemo } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, TrendingUp, PiggyBank, ShoppingBag } from "lucide-react";

// Average student benchmarks (based on general student spending data)
const BENCHMARKS = {
  monthlyExpense: 1200,
  savingsRate: 15,
  foodPercent: 35,
  transportPercent: 15,
  shoppingPercent: 20,
  entertainmentPercent: 10,
  educationPercent: 10,
  topCategories: ["Food & Drinks", "Transport", "Shopping"],
};

export default function PeerComparison() {
  const { transactions } = useTransactions();

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
  const userSavingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;

  // Category breakdown
  const categorySpend = useMemo(() => {
    const map: Record<string, number> = {};
    monthlyTx.filter(t => t.type === "expense").forEach(t => {
      map[t.category] = (map[t.category] || 0) + Number(t.amount);
    });
    return map;
  }, [monthlyTx]);

  // Percentile calculation (simplified)
  const spendingPercentile = useMemo(() => {
    if (expenses === 0) return 50;
    const ratio = expenses / BENCHMARKS.monthlyExpense;
    if (ratio < 0.5) return 90; // Top 10% saver
    if (ratio < 0.8) return 75;
    if (ratio < 1.0) return 55;
    if (ratio < 1.3) return 35;
    return 15;
  }, [expenses]);

  const savingsPercentile = useMemo(() => {
    if (userSavingsRate > 30) return 90;
    if (userSavingsRate > 20) return 75;
    if (userSavingsRate > 10) return 50;
    if (userSavingsRate > 0) return 30;
    return 10;
  }, [userSavingsRate]);

  const comparisons = [
    {
      label: "Monthly Spending",
      yours: `$${expenses.toLocaleString()}`,
      avg: `$${BENCHMARKS.monthlyExpense.toLocaleString()}`,
      good: expenses <= BENCHMARKS.monthlyExpense,
      icon: ShoppingBag,
    },
    {
      label: "Savings Rate",
      yours: `${userSavingsRate}%`,
      avg: `${BENCHMARKS.savingsRate}%`,
      good: userSavingsRate >= BENCHMARKS.savingsRate,
      icon: PiggyBank,
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="relative bg-card px-4 pt-6 pb-5 border-b border-border/40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-chart-2/5" />
        <div className="relative flex items-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">Peer Comparison</h1>
            <p className="text-sm text-muted-foreground">See how you compare to other students</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-5 max-w-lg mx-auto">
        {/* Percentile Ranking */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="shadow-lg bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="pt-5 pb-4 text-center">
              <TrendingUp className="w-6 h-6 text-primary mx-auto mb-1" />
              <p className="text-3xl font-extrabold tabular-nums text-primary">{spendingPercentile}th</p>
              <p className="text-xs text-muted-foreground">Spending Rank</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {spendingPercentile > 70 ? "Better than most!" : spendingPercentile > 40 ? "Around average" : "Room to improve"}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-lg bg-gradient-to-br from-accent/5 to-transparent">
            <CardContent className="pt-5 pb-4 text-center">
              <PiggyBank className="w-6 h-6 text-accent mx-auto mb-1" />
              <p className="text-3xl font-extrabold tabular-nums text-accent">{savingsPercentile}th</p>
              <p className="text-xs text-muted-foreground">Savings Rank</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {savingsPercentile > 70 ? "Top saver!" : savingsPercentile > 40 ? "Around average" : "Start saving more"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* You vs Average */}
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-3">
            <h2 className="text-sm font-semibold mb-3">📊 You vs Average Student</h2>
            <div className="space-y-4">
              {comparisons.map((c, i) => (
                <div key={i}>
                  <div className="flex items-center gap-2 mb-1">
                    <c.icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium flex-1">{c.label}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className={`p-2.5 rounded-lg text-center ${c.good ? "bg-primary/10" : "bg-destructive/10"}`}>
                      <p className="text-[10px] text-muted-foreground">You</p>
                      <p className={`text-sm font-bold ${c.good ? "text-primary" : "text-destructive"}`}>{c.yours}</p>
                    </div>
                    <div className="p-2.5 rounded-lg text-center bg-muted/50">
                      <p className="text-[10px] text-muted-foreground">Average</p>
                      <p className="text-sm font-bold">{c.avg}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Comparison */}
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-3">
            <h2 className="text-sm font-semibold mb-3">📂 Category Spending vs Average</h2>
            <div className="space-y-3">
              {[
                { cat: "Food & Drinks", avgPct: BENCHMARKS.foodPercent },
                { cat: "Transport", avgPct: BENCHMARKS.transportPercent },
                { cat: "Shopping", avgPct: BENCHMARKS.shoppingPercent },
                { cat: "Entertainment", avgPct: BENCHMARKS.entertainmentPercent },
              ].map((item, i) => {
                const userSpend = categorySpend[item.cat] || 0;
                const userPct = expenses > 0 ? Math.round((userSpend / expenses) * 100) : 0;
                const diff = userPct - item.avgPct;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">{item.cat}</span>
                      <span className={diff > 5 ? "text-destructive" : diff < -5 ? "text-primary" : "text-muted-foreground"}>
                        You: {userPct}% · Avg: {item.avgPct}%
                        {diff > 5 && " ⬆️"}
                        {diff < -5 && " ⬇️"}
                      </span>
                    </div>
                    <div className="relative h-2 bg-muted/50 rounded-full overflow-hidden">
                      <div className="absolute inset-y-0 left-0 bg-primary/30 rounded-full" style={{ width: `${item.avgPct}%` }} />
                      <div className={`absolute inset-y-0 left-0 rounded-full ${userPct > item.avgPct ? "bg-destructive/60" : "bg-primary/60"}`} style={{ width: `${Math.min(userPct, 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <p className="text-[10px] text-muted-foreground text-center px-4">
          📊 Comparisons are based on general student spending benchmarks. Your data is never shared.
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
