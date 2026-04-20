import { useFinancialProfile } from "@/hooks/useFinancialProfile";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import BottomNav from "@/components/layout/BottomNav";
import { fireCorpusNeeded, projectWealthOverTime, sipFutureValue } from "@/lib/finance";
import { formatINR } from "@/lib/inr";
import { Loader2, TrendingUp } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

export default function WhatIf() {
  const { profile, loading } = useFinancialProfile();
  const navigate = useNavigate();

  useEffect(() => { if (!loading && !profile) navigate("/onboarding"); }, [loading, profile, navigate]);

  const baselineSurplus = profile ? Math.max(0, profile.monthly_income - profile.monthly_expenses) : 0;
  const [extraSIP, setExtraSIP] = useState(0);
  const [extraExpenseCut, setExtraExpenseCut] = useState(0);
  const [retireAge, setRetireAge] = useState(profile?.retirement_age_target ?? 60);

  useEffect(() => { if (profile) setRetireAge(profile.retirement_age_target); }, [profile]);

  const adjusted = useMemo(() => {
    if (!profile) return null;
    const newSurplus = baselineSurplus + extraExpenseCut + extraSIP;
    const adjustedProfile = { ...profile, retirement_age_target: retireAge, monthly_expenses: Math.max(0, profile.monthly_expenses - extraExpenseCut) };
    const projection = projectWealthOverTime(adjustedProfile, newSurplus * 0.85);
    const years = retireAge - profile.age;
    const finalWealth = sipFutureValue(newSurplus * 0.85, profile.expected_return_pct, years * 12) + profile.current_investments * Math.pow(1 + profile.expected_return_pct / 100, years);
    const corpus = fireCorpusNeeded(adjustedProfile.monthly_expenses, profile.age, retireAge, profile.inflation_pct);
    return { projection, finalWealth, corpus, newSurplus };
  }, [profile, baselineSurplus, extraSIP, extraExpenseCut, retireAge]);

  if (loading || !profile || !adjusted) return <div className="min-h-screen grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  const onTrack = adjusted.finalWealth >= adjusted.corpus;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-card border-b border-border/60">
        <div className="max-w-2xl mx-auto px-5 py-5">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">What-If Simulator</p>
          <h1 className="text-2xl font-bold flex items-center gap-2"><TrendingUp className="w-6 h-6 text-primary" /> Play with your future</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6 space-y-5">
        <Card className="border-border/60">
          <CardContent className="p-5 space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <label className="text-sm font-medium">Cut monthly expenses by</label>
                <span className="text-sm font-bold text-primary">{formatINR(extraExpenseCut)}</span>
              </div>
              <Slider min={0} max={Math.round(profile.monthly_expenses * 0.5)} step={500} value={[extraExpenseCut]} onValueChange={([v]) => setExtraExpenseCut(v)} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <label className="text-sm font-medium">Extra monthly investment</label>
                <span className="text-sm font-bold text-primary">{formatINR(extraSIP)}</span>
              </div>
              <Slider min={0} max={Math.round(profile.monthly_income * 0.5)} step={500} value={[extraSIP]} onValueChange={([v]) => setExtraSIP(v)} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <label className="text-sm font-medium">Target retirement age</label>
                <span className="text-sm font-bold text-primary">{retireAge}</span>
              </div>
              <Slider min={profile.age + 1} max={75} step={1} value={[retireAge]} onValueChange={([v]) => setRetireAge(v)} />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground font-semibold">Projected wealth</div>
              <div className="text-xl font-bold mt-1">{formatINR(adjusted.finalWealth, { compact: true })}</div>
            </CardContent>
          </Card>
          <Card className={`border ${onTrack ? "border-primary/40 bg-primary/5" : "border-destructive/30 bg-destructive/5"}`}>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground font-semibold">Status</div>
              <div className={`text-xl font-bold mt-1 ${onTrack ? "text-primary" : "text-destructive"}`}>
                {onTrack ? "✓ On track" : "✗ Short"}
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Need {formatINR(adjusted.corpus, { compact: true })}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/60">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-3 text-sm">Wealth trajectory</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={adjusted.projection}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis dataKey="age" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => formatINR(v, { compact: true })} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} formatter={(v: number) => formatINR(v)} />
                <Line type="monotone" dataKey="wealth" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
