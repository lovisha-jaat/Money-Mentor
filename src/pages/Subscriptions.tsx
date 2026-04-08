import { useMemo } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, AlertCircle, Repeat, DollarSign } from "lucide-react";

export default function Subscriptions() {
  const { transactions } = useTransactions();

  // Detect recurring: same category+description combo appearing 2+ months
  const recurring = useMemo(() => {
    const expenses = transactions.filter(t => t.type === "expense" && t.description);
    const grouped: Record<string, { months: Set<string>; amounts: number[]; category: string; description: string }> = {};

    expenses.forEach(t => {
      const key = `${t.category}|${(t.description || "").toLowerCase().trim()}`;
      if (!grouped[key]) grouped[key] = { months: new Set(), amounts: [], category: t.category, description: t.description || "" };
      const month = t.transaction_date.slice(0, 7);
      grouped[key].months.add(month);
      grouped[key].amounts.push(Number(t.amount));
    });

    return Object.values(grouped)
      .filter(g => g.months.size >= 2)
      .map(g => ({
        category: g.category,
        description: g.description,
        avgAmount: Math.round(g.amounts.reduce((a, b) => a + b, 0) / g.amounts.length),
        frequency: g.months.size,
      }))
      .sort((a, b) => b.avgAmount - a.avgAmount);
  }, [transactions]);

  // Also detect by category frequency for single-description items
  const frequentCategories = useMemo(() => {
    const expenses = transactions.filter(t => t.type === "expense");
    const catCount: Record<string, { count: number; total: number }> = {};
    expenses.forEach(t => {
      if (!catCount[t.category]) catCount[t.category] = { count: 0, total: 0 };
      catCount[t.category].count++;
      catCount[t.category].total += Number(t.amount);
    });
    return Object.entries(catCount)
      .filter(([_, v]) => v.count >= 5)
      .map(([cat, v]) => ({ category: cat, count: v.count, total: Math.round(v.total), avgPerTx: Math.round(v.total / v.count) }))
      .sort((a, b) => b.total - a.total);
  }, [transactions]);

  const totalRecurring = recurring.reduce((s, r) => s + r.avgAmount, 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="relative bg-card px-4 pt-6 pb-5 border-b border-border/40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-chart-2/10 via-transparent to-chart-4/5" />
        <div className="relative flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-chart-2" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">Subscription Tracker</h1>
            <p className="text-sm text-muted-foreground">Identify and manage recurring expenses</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-5 max-w-lg mx-auto">
        {/* Total Recurring */}
        <Card className="shadow-lg border-border/40 bg-gradient-to-br from-chart-2/5 to-transparent">
          <CardContent className="pt-5 pb-4">
            <p className="text-sm text-muted-foreground mb-1">Estimated Monthly Recurring</p>
            <p className="text-3xl font-extrabold tabular-nums text-chart-2">
              ${totalRecurring.toLocaleString()}
              <span className="text-base font-normal ml-1 text-muted-foreground">/month</span>
            </p>
          </CardContent>
        </Card>

        {/* Detected Subscriptions */}
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-3">
              <Repeat className="w-4 h-4 text-chart-4" />
              <h2 className="text-sm font-semibold">Detected Recurring Expenses</h2>
            </div>
            {recurring.length > 0 ? (
              <div className="space-y-2">
                {recurring.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{r.description}</p>
                      <p className="text-xs text-muted-foreground">{r.category} · {r.frequency} months</p>
                    </div>
                    <p className="text-sm font-bold tabular-nums">${r.avgAmount}/mo</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No recurring expenses detected yet. Add notes to your expenses with subscription names to help identify them.</p>
            )}
          </CardContent>
        </Card>

        {/* Frequent Categories */}
        {frequentCategories.length > 0 && (
          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-accent" />
                <h2 className="text-sm font-semibold">Frequent Spending Categories</h2>
              </div>
              <div className="space-y-2">
                {frequentCategories.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{c.category}</p>
                      <p className="text-xs text-muted-foreground">{c.count} transactions · avg ${c.avgPerTx}/tx</p>
                    </div>
                    <p className="text-sm font-bold tabular-nums">${c.total} total</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="shadow-sm bg-accent/5">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-semibold">Subscription Tips</h2>
            </div>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p>💡 Add clear notes like "Netflix" or "Spotify" when logging subscriptions</p>
              <p>📅 Review subscriptions every month — cancel ones you don't actively use</p>
              <p>🔄 Look for student discounts on services you already pay for</p>
              {totalRecurring > 0 && (
                <p>💰 Cutting just one ${Math.round(totalRecurring / recurring.length)} subscription saves ${Math.round(totalRecurring / recurring.length) * 12}/year!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
