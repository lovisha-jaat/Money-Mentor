import { useFinancialProfile } from "@/hooks/useFinancialProfile";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import BottomNav from "@/components/layout/BottomNav";
import { Loader2, User, LogOut, Moon, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatINR } from "@/lib/inr";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Profile() {
  const { user, signOut } = useAuth();
  const { profile, loading } = useFinancialProfile();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleReset = async () => {
    if (!confirm("Delete your financial profile and all goals? This cannot be undone.")) return;
    await supabase.from("financial_goals").delete().eq("user_id", user!.id);
    await supabase.from("personality_results").delete().eq("user_id", user!.id);
    await supabase.from("chat_messages").delete().eq("user_id", user!.id);
    await supabase.from("financial_profile").delete().eq("user_id", user!.id);
    toast.success("Reset complete");
    navigate("/onboarding");
  };

  if (loading) return <div className="min-h-screen grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-card border-b border-border/60">
        <div className="max-w-2xl mx-auto px-5 py-5">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Settings</p>
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6 space-y-4">
        <Card className="border-border/60">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary grid place-items-center"><User className="w-5 h-5" /></div>
            <div>
              <p className="font-semibold">{user?.email}</p>
              <p className="text-xs text-muted-foreground">Member since {new Date(user?.created_at ?? Date.now()).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
            </div>
          </CardContent>
        </Card>

        {profile && (
          <Card className="border-border/60">
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-sm">Your numbers</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Age</p><p className="font-bold">{profile.age}</p></div>
                <div><p className="text-xs text-muted-foreground">Retire by</p><p className="font-bold">{profile.retirement_age_target}</p></div>
                <div><p className="text-xs text-muted-foreground">Income</p><p className="font-bold">{formatINR(profile.monthly_income, { compact: true })}</p></div>
                <div><p className="text-xs text-muted-foreground">Expenses</p><p className="font-bold">{formatINR(profile.monthly_expenses, { compact: true })}</p></div>
                <div><p className="text-xs text-muted-foreground">Savings</p><p className="font-bold">{formatINR(profile.current_savings, { compact: true })}</p></div>
                <div><p className="text-xs text-muted-foreground">Investments</p><p className="font-bold">{formatINR(profile.current_investments, { compact: true })}</p></div>
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => navigate("/onboarding")}>
                <Edit className="w-3.5 h-3.5 mr-2" /> Update profile
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium">Dark mode</span>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
          </CardContent>
        </Card>

        <Button variant="outline" className="w-full" onClick={async () => { await signOut(); navigate("/"); }}>
          <LogOut className="w-4 h-4 mr-2" /> Sign out
        </Button>
        <Button variant="ghost" size="sm" className="w-full text-destructive hover:text-destructive" onClick={handleReset}>
          <Trash2 className="w-4 h-4 mr-2" /> Reset financial data
        </Button>
      </main>
      <BottomNav />
    </div>
  );
}
