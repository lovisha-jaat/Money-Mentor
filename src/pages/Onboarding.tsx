import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFinancialProfile } from "@/hooks/useFinancialProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Wallet, ArrowRight, ArrowLeft, Loader2, IndianRupee, Shield, Target } from "lucide-react";
import { toast } from "sonner";
import { formatINR } from "@/lib/inr";

export default function Onboarding() {
  const navigate = useNavigate();
  const { upsert } = useFinancialProfile();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    age: 28,
    monthly_income: 50000,
    monthly_expenses: 30000,
    current_savings: 100000,
    current_investments: 50000,
    current_debt: 0,
    has_emergency_fund: false,
    has_health_insurance: false,
    has_term_insurance: false,
    retirement_age_target: 60,
    expected_return_pct: 12,
    inflation_pct: 6,
    risk_tolerance: "moderate",
  });

  const TOTAL = 4;
  const update = (k: keyof typeof data, v: any) => setData(p => ({ ...p, [k]: v }));

  const next = () => setStep(s => Math.min(TOTAL, s + 1));
  const back = () => setStep(s => Math.max(1, s - 1));

  const handleFinish = async () => {
    setSaving(true);
    const { error } = await upsert(data);
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile saved! Welcome to FinMentor 🎉");
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground grid place-items-center">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="font-bold">FinMentor AI</span>
          </div>
          <h1 className="text-2xl font-bold">Let's build your plan</h1>
          <p className="text-sm text-muted-foreground mt-1">Step {step} of {TOTAL} • takes 2 minutes</p>
          <div className="mt-4 flex gap-1.5 justify-center">
            {[...Array(TOTAL)].map((_, i) => (
              <div key={i} className={`h-1.5 w-10 rounded-full transition-colors ${i + 1 <= step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
        </div>

        <Card className="border-border/60 shadow-lg">
          <CardContent className="p-6 space-y-5">
            {step === 1 && (
              <>
                <h2 className="text-xl font-semibold">About you</h2>
                <div className="space-y-2">
                  <Label>Your age</Label>
                  <div className="flex items-center gap-4">
                    <Slider min={18} max={70} step={1} value={[data.age]} onValueChange={([v]) => update("age", v)} className="flex-1" />
                    <span className="w-12 text-right font-bold text-primary">{data.age}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Target retirement age</Label>
                  <div className="flex items-center gap-4">
                    <Slider min={Math.max(35, data.age + 1)} max={75} step={1} value={[data.retirement_age_target]} onValueChange={([v]) => update("retirement_age_target", v)} className="flex-1" />
                    <span className="w-12 text-right font-bold text-primary">{data.retirement_age_target}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Risk tolerance</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {["conservative", "moderate", "aggressive"].map(r => (
                      <button
                        key={r}
                        onClick={() => update("risk_tolerance", r)}
                        className={`p-2.5 rounded-lg text-sm font-medium border capitalize transition-colors ${
                          data.risk_tolerance === r ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"
                        }`}
                      >{r}</button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-primary" /> Cash flow
                </h2>
                {[
                  { k: "monthly_income", label: "Monthly take-home income" },
                  { k: "monthly_expenses", label: "Monthly expenses (rent, food, EMIs)" },
                ].map(({ k, label }) => (
                  <div key={k} className="space-y-2">
                    <Label>{label}</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                      <Input
                        type="number"
                        value={(data as any)[k]}
                        onChange={e => update(k as any, parseFloat(e.target.value) || 0)}
                        className="pl-8 h-11 text-base font-medium"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{formatINR((data as any)[k])}</p>
                  </div>
                ))}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm">
                  Monthly surplus: <strong className="text-primary">{formatINR(data.monthly_income - data.monthly_expenses)}</strong>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" /> Net worth today
                </h2>
                {[
                  { k: "current_savings", label: "Bank savings + FDs" },
                  { k: "current_investments", label: "Investments (MFs, stocks, EPF, PPF)" },
                  { k: "current_debt", label: "Total debt (loans, credit card)" },
                ].map(({ k, label }) => (
                  <div key={k} className="space-y-2">
                    <Label>{label}</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                      <Input
                        type="number"
                        value={(data as any)[k]}
                        onChange={e => update(k as any, parseFloat(e.target.value) || 0)}
                        className="pl-8 h-11 text-base font-medium"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{formatINR((data as any)[k])}</p>
                  </div>
                ))}
              </>
            )}

            {step === 4 && (
              <>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" /> Safety net
                </h2>
                <p className="text-sm text-muted-foreground">Quick checks — affects your Money Health Score.</p>
                {[
                  { k: "has_emergency_fund", label: "Emergency fund (≥3 months)" },
                  { k: "has_health_insurance", label: "Health insurance" },
                  { k: "has_term_insurance", label: "Term life insurance" },
                ].map(({ k, label }) => (
                  <div key={k} className="flex items-center justify-between p-3 rounded-lg border border-border/60">
                    <Label className="cursor-pointer">{label}</Label>
                    <Switch checked={(data as any)[k]} onCheckedChange={(v) => update(k as any, v)} />
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          {step > 1 && (
            <Button variant="outline" onClick={back} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          )}
          {step < TOTAL ? (
            <Button onClick={next} className="flex-1">
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleFinish} disabled={saving} className="flex-1">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Finish setup <ArrowRight className="w-4 h-4 ml-2" /></>}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
