import { useNavigate } from "react-router-dom";
import { useFinancialProfile } from "@/hooks/useFinancialProfile";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import BottomNav from "@/components/layout/BottomNav";
import { calcMoneyHealthScore, fireCorpusNeeded, sipFutureValue } from "@/lib/finance";
import { formatINR } from "@/lib/inr";
import { Loader2, AlertTriangle, TrendingUp, Wallet, Target as TargetIcon, Shield, Sparkles, ArrowUpRight, FlameKindling, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect } from "react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, loading } = useFinancialProfile();

  useEffect(() => {
    if (!loading && !profile) navigate("/onboarding");
  }, [loading, profile, navigate]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const score = calcMoneyHealthScore(profile);
  const surplus = Math.max(0, profile.monthly_income - profile.monthly_expenses);
  const savingsRatePct = profile.monthly_income > 0 ? (surplus / profile.monthly_income) * 100 : 0;
  const corpus = fireCorpusNeeded(profile.monthly_expenses, profile.age, profile.retirement_age_target, profile.inflation_pct);
  const months = (profile.retirement_age_target - profile.age) * 12;
  const projected = sipFutureValue(surplus * 0.7, profile.expected_return_pct, months) + profile.current_investments * Math.pow(1 + profile.expected_return_pct / 100, (profile.retirement_age_target - profile.age));

  const scoreColor = score.total >= 75 ? "text-primary" : score.total >= 50 ? "text-accent" : "text-destructive";
  const scoreLabel = score.total >= 75 ? "Excellent" : score.total >= 50 ? "Good" : score.total >= 25 ? "Needs work" : "Critical";

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-card border-b border-border/60">
        <div className="max-w-2xl mx-auto px-5 py-5">
          <p className="text-xs text-muted-foreground font-medium">Welcome back</p>
          <h1 className="text-2xl font-bold tracking-tight">Your money snapshot</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6 space-y-5">
        {/* HEALTH SCORE */}
        <Card className="border-border/60 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Money Health Score</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-5xl font-extrabold ${scoreColor}`}>{score.total}</span>
                  <span className="text-muted-foreground">/100</span>
                </div>
                <p className={`text-sm font-semibold ${scoreColor} mt-1`}>{scoreLabel}</p>
              </div>
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 grid place-items-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
            </div>
            <Progress value={score.total} className="h-2" />
            <div className="mt-5 grid grid-cols-5 gap-2 text-center">
              {[
                { label: "Emergency", val: score.emergencyFund, max: 25 },
                { label: "Savings", val: score.savingsRate, max: 25 },
                { label: "Debt", val: score.debt, max: 15 },
                { label: "Invest", val: score.investmentDiversification, max: 15 },
                { label: "Retire", val: score.retirementReadiness, max: 20 },
              ].map(p => (
                <div key={p.label} className="space-y-1">
                  <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{p.label}</div>
                  <div className="text-sm font-bold">{p.val}<span className="text-muted-foreground font-normal text-xs">/{p.max}</span></div>
                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${(p.val / p.max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* QUICK STATS */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold mb-1">
                <Wallet className="w-3.5 h-3.5" /> Net worth
              </div>
              <div className="text-xl font-bold">{formatINR(profile.current_savings + profile.current_investments - profile.current_debt, { compact: true })}</div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold mb-1">
                <TrendingUp className="w-3.5 h-3.5" /> Savings rate
              </div>
              <div className="text-xl font-bold">{savingsRatePct.toFixed(0)}%</div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold mb-1">
                <FlameKindling className="w-3.5 h-3.5" /> FIRE target
              </div>
              <div className="text-xl font-bold">{formatINR(corpus, { compact: true })}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">at age {profile.retirement_age_target}</p>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold mb-1">
                <TargetIcon className="w-3.5 h-3.5" /> Projected
              </div>
              <div className="text-xl font-bold text-primary">{formatINR(projected, { compact: true })}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">at current pace</p>
            </CardContent>
          </Card>
        </div>

        {/* SMART INSIGHTS */}
        {score.weakSpots.length > 0 && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <h3 className="font-semibold text-sm">Smart insights for you</h3>
              </div>
              <ul className="space-y-2">
                {score.weakSpots.map((w, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="text-destructive">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/fire">
            <Card className="border-border/60 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-4">
                <FlameKindling className="w-5 h-5 text-primary mb-2" />
                <div className="font-semibold text-sm">Plan FIRE</div>
                <p className="text-xs text-muted-foreground mt-0.5">See SIP needed for retirement</p>
                <ArrowUpRight className="w-3 h-3 text-muted-foreground mt-2" />
              </CardContent>
            </Card>
          </Link>
          <Link to="/tax">
            <Card className="border-border/60 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-4">
                <Receipt className="w-5 h-5 text-primary mb-2" />
                <div className="font-semibold text-sm">Save tax</div>
                <p className="text-xs text-muted-foreground mt-0.5">Compare regimes & deductions</p>
                <ArrowUpRight className="w-3 h-3 text-muted-foreground mt-2" />
              </CardContent>
            </Card>
          </Link>
          <Link to="/emergency">
            <Card className="border-border/60 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-4">
                <Shield className="w-5 h-5 text-primary mb-2" />
                <div className="font-semibold text-sm">Emergency fund</div>
                <p className="text-xs text-muted-foreground mt-0.5">Calculate your safety net</p>
                <ArrowUpRight className="w-3 h-3 text-muted-foreground mt-2" />
              </CardContent>
            </Card>
          </Link>
          <Link to="/chat">
            <Card className="border-primary/40 bg-primary/5 hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-4">
                <Sparkles className="w-5 h-5 text-primary mb-2" />
                <div className="font-semibold text-sm">Ask AI mentor</div>
                <p className="text-xs text-muted-foreground mt-0.5">Get personalized advice</p>
                <ArrowUpRight className="w-3 h-3 text-muted-foreground mt-2" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
