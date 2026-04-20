import { useState } from "react";
import { useGoals } from "@/hooks/useGoals";
import { useFinancialProfile } from "@/hooks/useFinancialProfile";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import BottomNav from "@/components/layout/BottomNav";
import { sipRequired } from "@/lib/finance";
import { formatINR } from "@/lib/inr";
import { Plus, Target, Trash2, Car, Home, Plane, GraduationCap, Sparkles } from "lucide-react";
import { toast } from "sonner";

const TYPES = [
  { value: "car", label: "Car", icon: Car },
  { value: "house", label: "House", icon: Home },
  { value: "travel", label: "Travel", icon: Plane },
  { value: "education", label: "Education", icon: GraduationCap },
  { value: "other", label: "Other", icon: Target },
];

export default function Goals() {
  const { goals, addGoal, deleteGoal } = useGoals();
  const { profile } = useFinancialProfile();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", goal_type: "other", target_amount: 100000, current_amount: 0, target_date: "" });

  const handleAdd = async () => {
    if (!form.name || form.target_amount <= 0) { toast.error("Fill name & target amount"); return; }
    const months = form.target_date ? Math.max(1, Math.round((new Date(form.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30))) : 60;
    const sip = sipRequired(form.target_amount - form.current_amount, profile?.expected_return_pct ?? 12, months);
    const { error } = await addGoal({ ...form, target_date: form.target_date || null, monthly_sip_required: Math.round(sip) });
    if (error) toast.error(error.message); else { toast.success("Goal added 🎯"); setOpen(false); setForm({ name: "", goal_type: "other", target_amount: 100000, current_amount: 0, target_date: "" }); }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-card border-b border-border/60">
        <div className="max-w-2xl mx-auto px-5 py-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Goal Planner</p>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Target className="w-6 h-6 text-primary" /> Big dreams, monthly steps</h1>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="w-4 h-4 mr-1" />New</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New financial goal</DialogTitle></DialogHeader>
              <div className="space-y-3 mt-2">
                <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Honda City" /></div>
                <div>
                  <Label>Type</Label>
                  <div className="grid grid-cols-5 gap-2 mt-1.5">
                    {TYPES.map(t => (
                      <button
                        key={t.value}
                        onClick={() => setForm({ ...form, goal_type: t.value })}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-[10px] font-medium transition-colors ${form.goal_type === t.value ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"}`}
                      >
                        <t.icon className="w-4 h-4" />{t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div><Label>Target amount (₹)</Label><Input type="number" value={form.target_amount} onChange={e => setForm({ ...form, target_amount: parseFloat(e.target.value) || 0 })} /></div>
                <div><Label>Already saved (₹)</Label><Input type="number" value={form.current_amount} onChange={e => setForm({ ...form, current_amount: parseFloat(e.target.value) || 0 })} /></div>
                <div><Label>Target date</Label><Input type="date" value={form.target_date} onChange={e => setForm({ ...form, target_date: e.target.value })} /></div>
                <Button onClick={handleAdd} className="w-full">Add goal</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6 space-y-3">
        {goals.length === 0 ? (
          <Card className="border-dashed border-2"><CardContent className="p-8 text-center text-sm text-muted-foreground">
            <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
            No goals yet. Add your first dream — car, house, vacation. We'll calculate the monthly SIP for you.
          </CardContent></Card>
        ) : goals.map(g => {
          const Icon = TYPES.find(t => t.value === g.goal_type)?.icon ?? Target;
          const progress = g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0;
          return (
            <Card key={g.id} className="border-border/60">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary grid place-items-center"><Icon className="w-4 h-4" /></div>
                    <div>
                      <h3 className="font-semibold">{g.name}</h3>
                      {g.target_date && <p className="text-xs text-muted-foreground">By {new Date(g.target_date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</p>}
                    </div>
                  </div>
                  <button onClick={() => deleteGoal(g.id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="w-4 h-4" /></button>
                </div>
                <Progress value={Math.min(100, progress)} className="h-1.5 my-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatINR(g.current_amount, { compact: true })} of {formatINR(g.target_amount, { compact: true })}</span>
                  <span className="text-primary font-semibold">SIP {formatINR(g.monthly_sip_required ?? 0, { compact: true })}/mo</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </main>
      <BottomNav />
    </div>
  );
}
