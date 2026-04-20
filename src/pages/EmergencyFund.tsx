import { useFinancialProfile } from "@/hooks/useFinancialProfile";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import BottomNav from "@/components/layout/BottomNav";
import { formatINR } from "@/lib/inr";
import { Loader2, Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function EmergencyFund() {
  const { profile, loading } = useFinancialProfile();
  const navigate = useNavigate();

  useEffect(() => { if (!loading && !profile) navigate("/onboarding"); }, [loading, profile, navigate]);
  if (loading || !profile) return <div className="min-h-screen grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  const target = profile.monthly_expenses * 6;
  const minimum = profile.monthly_expenses * 3;
  const current = profile.current_savings;
  const gap = Math.max(0, target - current);
  const ratio = target > 0 ? Math.min(current / target, 1) : 0;
  const status = current >= target ? "Fully funded" : current >= minimum ? "Partially safe" : "At risk";
  const monthsCovered = profile.monthly_expenses > 0 ? current / profile.monthly_expenses : 0;
  const Icon = current >= target ? CheckCircle2 : AlertTriangle;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-card border-b border-border/60">
        <div className="max-w-2xl mx-auto px-5 py-5">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Emergency Fund</p>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="w-6 h-6 text-primary" /> Your safety net</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6 space-y-5">
        <Card className="border-border/60">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Months of expenses covered</p>
                <div className="text-5xl font-extrabold text-primary mt-1">{monthsCovered.toFixed(1)}</div>
                <p className="text-sm text-muted-foreground">out of recommended 6 months</p>
              </div>
              <div className={`w-12 h-12 rounded-full grid place-items-center ${current >= target ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
            <Progress value={ratio * 100} className="h-2.5" />
            <div className="grid grid-cols-3 gap-3 mt-5 text-center">
              <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Saved</p><p className="font-bold text-sm">{formatINR(current, { compact: true })}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Target (6m)</p><p className="font-bold text-sm">{formatINR(target, { compact: true })}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Gap</p><p className="font-bold text-sm text-destructive">{formatINR(gap, { compact: true })}</p></div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border ${current >= target ? "border-primary/30 bg-primary/5" : "border-accent/30 bg-accent/5"}`}>
          <CardContent className="p-5">
            <p className="font-semibold mb-1">Status: {status}</p>
            <p className="text-sm text-muted-foreground">
              {current >= target
                ? "Excellent! You're protected for 6+ months. Consider moving any excess to investments for better returns."
                : current >= minimum
                ? "You have a partial buffer. Keep adding monthly until you hit the 6-month mark."
                : "Critical: a job loss or medical emergency could derail you. Start building this fund first — before any investments."}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-5">
            <h3 className="font-semibold text-sm mb-3">Where to park it (in priority)</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2"><span className="text-primary font-bold">1.</span><span><strong>Liquid mutual funds</strong> — 6-7% returns, withdraw in 1 day, better than savings account.</span></li>
              <li className="flex gap-2"><span className="text-primary font-bold">2.</span><span><strong>Sweep-in FDs</strong> — auto-converts savings to FD, full liquidity.</span></li>
              <li className="flex gap-2"><span className="text-primary font-bold">3.</span><span><strong>High-yield savings account</strong> — IDFC, AU Small Finance pay 6-7%.</span></li>
            </ul>
          </CardContent>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
