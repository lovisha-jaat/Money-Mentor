import { useState } from "react";
import { useUserData } from "@/context/UserDataContext";
import { Navigate } from "react-router-dom";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Receipt, ArrowRight, CheckCircle2, IndianRupee, TrendingDown, Scale } from "lucide-react";
import {
  TaxInput,
  calculateOldRegimeTax,
  calculateNewRegimeTax,
  getTaxSavingSuggestions,
} from "@/lib/tax-calculations";

export default function TaxPlanner() {
  const { userData, isOnboarded } = useUserData();
  const [showResults, setShowResults] = useState(false);
  const [input, setInput] = useState<TaxInput>({
    basicSalary: 0,
    hra: 0,
    specialAllowance: 0,
    lta: 0,
    rentPaid: 0,
    isMetro: true,
    section80C: 0,
    section80D: 0,
    nps80CCD: 0,
    homeLoanInterest: 0,
  });

  if (!isOnboarded || !userData) return <Navigate to="/" replace />;

  // Initialize defaults from userData on first render if input is all zeros
  if (input.basicSalary === 0 && userData) {
    const annualIncome = userData.monthlyIncome * 12;
    input.basicSalary = Math.round(annualIncome * 0.5);
    input.hra = Math.round(annualIncome * 0.2);
    input.specialAllowance = Math.round(annualIncome * 0.25);
    input.lta = Math.round(annualIncome * 0.05);
    input.rentPaid = Math.round(userData.monthlyExpenses * 12 * 0.3);
  }

  const update = (field: keyof TaxInput, value: string | boolean) => {
    setInput((p) => ({ ...p, [field]: typeof value === "boolean" ? value : parseFloat(value) || 0 }));
    setShowResults(false);
  };

  const formatCur = (v: number) => `₹${v.toLocaleString("en-IN")}`;

  const oldResult = calculateOldRegimeTax(input);
  const newResult = calculateNewRegimeTax(input);
  const suggestions = getTaxSavingSuggestions(input);
  const better = oldResult.totalTax <= newResult.totalTax ? "old" : "new";
  const savings = Math.abs(oldResult.totalTax - newResult.totalTax);

  const fields: { label: string; key: keyof TaxInput; hint?: string }[] = [
    { label: "Basic Salary (Annual)", key: "basicSalary" },
    { label: "HRA (Annual)", key: "hra" },
    { label: "Special Allowance", key: "specialAllowance" },
    { label: "LTA", key: "lta" },
    { label: "Rent Paid (Annual)", key: "rentPaid", hint: "For HRA exemption" },
    { label: "80C Investments", key: "section80C", hint: "PPF, ELSS, EPF, etc. (max ₹1.5L)" },
    { label: "80D Health Insurance", key: "section80D", hint: "Self + parents (max ₹75K)" },
    { label: "NPS 80CCD(1B)", key: "nps80CCD", hint: "Extra ₹50K deduction" },
    { label: "Home Loan Interest", key: "homeLoanInterest", hint: "Section 24 (max ₹2L)" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-card px-4 pt-6 pb-5 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-chart-2" />
          <h1 className="text-xl font-bold tracking-tight">Tax Planner</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">FY 2024–25 · Old vs New Regime</p>
      </div>

      <div className="px-4 py-6 space-y-5 max-w-lg mx-auto">
        {/* Salary Input */}
        <Card className="shadow-sm">
          <CardContent className="p-4 space-y-4">
            <h2 className="text-base font-semibold">Salary & Deductions</h2>
            {fields.map(({ label, key, hint }) => (
              <div key={key}>
                <Label className="text-sm mb-1.5 block">{label}</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={input[key] as number || ""}
                  onChange={(e) => update(key, e.target.value)}
                  className="h-11"
                  placeholder="0"
                />
                {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
              </div>
            ))}
            <div className="flex items-center justify-between">
              <Label className="text-sm">Living in Metro City?</Label>
              <Switch checked={input.isMetro} onCheckedChange={(v) => update("isMetro", v)} />
            </div>
          </CardContent>
        </Card>

        <Button
          className="w-full h-12 text-base font-semibold active:scale-[0.98] transition-transform"
          onClick={() => setShowResults(true)}
        >
          <Scale className="w-5 h-5 mr-2" /> Compare Tax Regimes
        </Button>

        {showResults && (
          <>
            {/* Regime Comparison */}
            <div className="grid grid-cols-2 gap-3">
              <Card className={`shadow-md ${better === "old" ? "ring-2 ring-primary" : ""}`}>
                <CardContent className="p-4 text-center">
                  {better === "old" && (
                    <Badge className="mb-2 bg-primary/10 text-primary border-0 text-[10px]">Recommended</Badge>
                  )}
                  <p className="text-xs text-muted-foreground mb-1">Old Regime</p>
                  <p className="text-xl font-bold tabular-nums text-foreground">{formatCur(oldResult.totalTax)}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Taxable: {formatCur(oldResult.taxableIncome)}
                  </p>
                </CardContent>
              </Card>
              <Card className={`shadow-md ${better === "new" ? "ring-2 ring-primary" : ""}`}>
                <CardContent className="p-4 text-center">
                  {better === "new" && (
                    <Badge className="mb-2 bg-primary/10 text-primary border-0 text-[10px]">Recommended</Badge>
                  )}
                  <p className="text-xs text-muted-foreground mb-1">New Regime</p>
                  <p className="text-xl font-bold tabular-nums text-foreground">{formatCur(newResult.totalTax)}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Taxable: {formatCur(newResult.taxableIncome)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Savings highlight */}
            <Card className="shadow-sm bg-primary/5 border-primary/15">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    You save {formatCur(savings)} with the {better === "old" ? "Old" : "New"} Regime
                  </p>
                  <p className="text-xs text-muted-foreground">
                    That's {formatCur(Math.round(savings / 12))}/month extra in your pocket
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Old Regime Breakdown */}
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <h2 className="text-base font-semibold mb-3">Old Regime Deductions</h2>
                <div className="space-y-2">
                  {[
                    { label: "Standard Deduction", val: oldResult.breakdown.standardDeduction },
                    { label: "HRA Exemption", val: oldResult.breakdown.hraExemption },
                    { label: "Section 80C", val: oldResult.breakdown.sec80C },
                    { label: "Section 80D", val: oldResult.breakdown.sec80D },
                    { label: "NPS 80CCD(1B)", val: oldResult.breakdown.nps },
                    { label: "Home Loan Interest", val: oldResult.breakdown.homeLoan },
                  ]
                    .filter((d) => d.val > 0)
                    .map(({ label, val }) => (
                      <div key={label} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium tabular-nums">{formatCur(val)}</span>
                      </div>
                    ))}
                  <div className="border-t pt-2 flex justify-between text-sm font-semibold">
                    <span>Total Deductions</span>
                    <span className="text-primary tabular-nums">{formatCur(oldResult.totalDeductions)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tax Saving Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-base font-semibold px-1">💡 Tax-Saving Opportunities</h2>
                {suggestions.map((s) => (
                  <Card key={s.section} className="shadow-sm border-border/60">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold">{s.title}</p>
                          <p className="text-xs text-muted-foreground">Section {s.section}</p>
                        </div>
                        <Badge variant="outline" className="text-xs tabular-nums">
                          {formatCur(s.remaining)} left
                        </Badge>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-3">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${(s.currentUsed / s.maxLimit) * 100}%` }}
                        />
                      </div>
                      <ul className="space-y-1.5">
                        {s.suggestions.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
