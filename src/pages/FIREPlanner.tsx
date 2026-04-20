import { useFinancialProfile } from "@/hooks/useFinancialProfile";
import { Card, CardContent } from "@/components/ui/card";
import BottomNav from "@/components/layout/BottomNav";
import { fireCorpusNeeded, projectWealthOverTime, sipRequired } from "@/lib/finance";
import { formatINR } from "@/lib/inr";
import { Loader2, FlameKindling, TrendingUp, Calendar } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function FIREPlanner() {
  const { profile, loading } = useFinancialProfile();
  const navigate = useNavigate();

  useEffect(() => { if (!loading && !profile) navigate("/onboarding"); }, [loading, profile, navigate]);

  if (loading || !profile) return <div className="min-h-screen grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  const yearsToRetire = profile.retirement_age_target - profile.age;
  const monthsToRetire = yearsToRetire * 12;
  const corpus = fireCorpusNeeded(profile.monthly_expenses, profile.age, profile.retirement_age_target, profile.inflation_pct);
  const requiredSIP = sipRequired(corpus - (profile.current_investments * Math.pow(1 + profile.expected_return_pct / 100, yearsToRetire)), profile.expected_return_pct, monthsToRetire);
  const surplus = Math.max(0, profile.monthly_income - profile.monthly_expenses);
  const projection = projectWealthOverTime(profile, surplus * 0.7);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-card border-b border-border/60">
        <div className="max-w-2xl mx-auto px-5 py-5">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">FIRE Planner</p>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FlameKindling className="w-6 h-6 text-primary" /> Retire on your terms
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6 space-y-5">
        {/* HEADLINE STATS */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold mb-1">
                <Calendar className="w-3 h-3" /> Years left
              </div>
              <div className="text-2xl font-bold">{yearsToRetire}</div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold mb-1">
                <TrendingUp className="w-3 h-3" /> Corpus needed
              </div>
              <div className="text-2xl font-bold">{formatINR(corpus, { compact: true })}</div>
            </CardContent>
          </Card>
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="text-xs text-primary font-semibold mb-1">Monthly SIP</div>
              <div className="text-2xl font-bold text-primary">{formatINR(Math.max(0, requiredSIP), { compact: true })}</div>
            </CardContent>
          </Card>
        </div>

        {/* CHART */}
        <Card className="border-border/60">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4">Wealth growth over time</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={projection}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis dataKey="age" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => formatINR(v, { compact: true })} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  formatter={(v: number) => formatINR(v)}
                  labelFormatter={(v) => `Age ${v}`}
                />
                <Line type="monotone" dataKey="wealth" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* PLAYBOOK */}
        <Card className="border-border/60">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-3">Your FIRE playbook</h3>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-bold flex-shrink-0">1</div>
                <p>Start a monthly SIP of <strong>{formatINR(Math.max(0, requiredSIP))}</strong> in equity mutual funds (60% large-cap, 30% mid-cap, 10% international).</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-bold flex-shrink-0">2</div>
                <p>Step up your SIP by <strong>10% every year</strong> as your income grows.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-bold flex-shrink-0">3</div>
                <p>Use ELSS funds for 80C — saves tax + builds wealth.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-bold flex-shrink-0">4</div>
                <p>Try the <a href="/whatif" className="text-primary underline">What-If Simulator</a> to see how saving more shifts your retirement age.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
