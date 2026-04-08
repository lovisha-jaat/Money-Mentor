import { useMemo } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { useAiStream } from "@/hooks/useAiStream";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, RefreshCw, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import ReactMarkdown from "react-markdown";

export default function LifestyleSimulator() {
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
  const savings = Math.max(0, income - expenses);

  // Generate scenario projections
  const scenarios = useMemo(() => {
    const months = [3, 6, 12];
    const frugalRate = expenses * 0.7;
    const balancedRate = expenses * 0.85;
    const splurgeRate = expenses * 1.2;

    return months.map(m => ({
      month: `${m}mo`,
      Current: Math.round(savings * m),
      Frugal: Math.round((income - frugalRate) * m),
      Balanced: Math.round((income - balancedRate) * m),
      Splurge: Math.round(Math.max(0, income - splurgeRate) * m),
    }));
  }, [income, expenses, savings]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="relative bg-card px-4 pt-6 pb-5 border-b border-border/40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-chart-2/10 via-transparent to-chart-4/5" />
        <div className="relative flex items-center gap-3">
          <Layers className="w-6 h-6 text-chart-2" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">Lifestyle Simulator</h1>
            <p className="text-sm text-muted-foreground">See how spending choices affect your future</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-5 max-w-lg mx-auto">
        {/* Scenario Chart */}
        {income > 0 && (
          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-3">
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Projected Savings
              </h2>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scenarios} barGap={2}>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={50} />
                    <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="Current" fill="hsl(199,89%,56%)" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Frugal" fill="hsl(152,58%,48%)" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Balanced" fill="hsl(38,92%,50%)" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Splurge" fill="hsl(0,72%,59%)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scenario Cards */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { title: "🏠 Frugal", desc: "Cut 30% spending", saved: Math.round((income - expenses * 0.7) * 12), color: "text-primary" },
            { title: "⚖️ Balanced", desc: "Cut 15% spending", saved: Math.round((income - expenses * 0.85) * 12), color: "text-accent" },
            { title: "📊 Current", desc: "No changes", saved: Math.round(savings * 12), color: "text-chart-2" },
            { title: "🎉 Splurge", desc: "+20% spending", saved: Math.round(Math.max(0, income - expenses * 1.2) * 12), color: "text-destructive" },
          ].map((s, i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="p-3">
                <p className="text-sm font-semibold">{s.title}</p>
                <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                <p className={`text-lg font-bold tabular-nums mt-1 ${s.color}`}>${s.saved.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">in 12 months</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Deep Analysis */}
        <Card className="shadow-sm border-chart-2/20">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-chart-2" />
                <h2 className="text-sm font-semibold">AI Lifestyle Analysis</h2>
              </div>
              <Button
                size="sm" variant="outline"
                onClick={() => stream("lifestyle-simulator")}
                disabled={isLoading || transactions.length === 0}
                className="h-7 text-xs gap-1.5"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
                {isLoading ? "Simulating..." : "Simulate"}
              </Button>
            </div>
            {result ? (
              <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Click "Simulate" for a detailed AI analysis of different lifestyle scenarios.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
