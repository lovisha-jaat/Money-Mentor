import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BottomNav from "@/components/layout/BottomNav";
import { newRegimeTax, oldRegimeTax } from "@/lib/finance";
import { formatINR } from "@/lib/inr";
import { Receipt, CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import { useFinancialProfile } from "@/hooks/useFinancialProfile";

export default function TaxPlanner() {
  const { profile } = useFinancialProfile();
  const defaultIncome = profile ? profile.monthly_income * 12 : 1200000;
  const [income, setIncome] = useState(defaultIncome);
  const [sec80c, setSec80c] = useState(150000);
  const [sec80d, setSec80d] = useState(25000);
  const [nps, setNps] = useState(50000);
  const [hra, setHra] = useState(0);

  const newTax = newRegimeTax(income);
  const oldTax = oldRegimeTax(income, { sec80c, sec80d, nps, hra });
  const winner = newTax <= oldTax ? "new" : "old";
  const savings = Math.abs(newTax - oldTax);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-card border-b border-border/60">
        <div className="max-w-2xl mx-auto px-5 py-5">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Tax Planner • FY 2025-26</p>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Receipt className="w-6 h-6 text-primary" /> Pay less tax. Legally.</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6 space-y-5">
        {/* INCOME INPUT */}
        <Card className="border-border/60">
          <CardContent className="p-5 space-y-4">
            <div className="space-y-2">
              <Label>Annual gross income</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                <Input type="number" value={income} onChange={(e) => setIncome(parseFloat(e.target.value) || 0)} className="pl-8 h-11 font-medium" />
              </div>
              <p className="text-xs text-muted-foreground">{formatINR(income)}</p>
            </div>
          </CardContent>
        </Card>

        {/* COMPARISON */}
        <div className="grid grid-cols-2 gap-3">
          <Card className={`border ${winner === "new" ? "border-primary/40 bg-primary/5" : "border-border/60"}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">New Regime</h3>
                {winner === "new" && <CheckCircle2 className="w-4 h-4 text-primary" />}
              </div>
              <div className="text-2xl font-bold">{formatINR(newTax, { compact: true })}</div>
              <p className="text-xs text-muted-foreground mt-1">Tax payable</p>
            </CardContent>
          </Card>
          <Card className={`border ${winner === "old" ? "border-primary/40 bg-primary/5" : "border-border/60"}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">Old Regime</h3>
                {winner === "old" && <CheckCircle2 className="w-4 h-4 text-primary" />}
              </div>
              <div className="text-2xl font-bold">{formatINR(oldTax, { compact: true })}</div>
              <p className="text-xs text-muted-foreground mt-1">Tax payable</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 flex items-center gap-3">
            <Lightbulb className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-sm">
              <strong className="capitalize">{winner} regime</strong> saves you <strong className="text-primary">{formatINR(savings)}</strong> for FY 2025-26.
            </p>
          </CardContent>
        </Card>

        {/* DEDUCTIONS (OLD REGIME) */}
        <Card className="border-border/60">
          <CardContent className="p-5 space-y-4">
            <h3 className="font-semibold text-sm">Old regime deductions (only)</h3>
            {[
              { k: "sec80c", label: "Section 80C (ELSS, PPF, EPF, life insurance)", val: sec80c, max: 150000, set: setSec80c, hint: "Limit ₹1.5L" },
              { k: "sec80d", label: "Section 80D (health insurance premium)", val: sec80d, max: 50000, set: setSec80d, hint: "Limit ₹25K (₹50K for parents 60+)" },
              { k: "nps", label: "Section 80CCD(1B) — NPS", val: nps, max: 50000, set: setNps, hint: "Extra ₹50K above 80C" },
              { k: "hra", label: "HRA exemption (annual)", val: hra, max: 600000, set: setHra, hint: "Computed from rent + city" },
            ].map(({ k, label, val, set, hint }) => (
              <div key={k} className="space-y-1.5">
                <Label className="text-xs">{label}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                  <Input type="number" value={val} onChange={(e) => set(parseFloat(e.target.value) || 0)} className="pl-8 h-9 text-sm" />
                </div>
                <p className="text-[11px] text-muted-foreground">{hint}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* RECOMMENDATIONS */}
        <Card className="border-border/60">
          <CardContent className="p-5">
            <h3 className="font-semibold text-sm mb-3">Tax-saving picks</h3>
            <div className="space-y-3 text-sm">
              {sec80c < 150000 && (
                <div className="flex gap-3"><XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" /><p>You're missing <strong>{formatINR(150000 - sec80c)}</strong> in 80C. Start an ELSS SIP — saves tax and builds wealth (12% historic returns).</p></div>
              )}
              {sec80d < 25000 && (
                <div className="flex gap-3"><XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" /><p>Buy health insurance — saves up to <strong>₹7,500/yr</strong> in tax (₹25K premium @ 30% slab).</p></div>
              )}
              {nps < 50000 && (
                <div className="flex gap-3"><XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" /><p>NPS Tier 1 gives an <strong>extra ₹50K deduction</strong> on top of 80C. Worth it if you're in 20-30% slab.</p></div>
              )}
              {sec80c >= 150000 && sec80d >= 25000 && nps >= 50000 && (
                <div className="flex gap-3"><CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" /><p>Excellent — you've maxed out all major deductions!</p></div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
