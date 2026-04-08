import { useAiStream } from "@/hooks/useAiStream";
import { useTransactions } from "@/hooks/useTransactions";
import { useBadges } from "@/hooks/useBadges";
import { useSavingsGoals } from "@/hooks/useSavingsGoals";
import { useBudgets } from "@/hooks/useBudgets";
import { useStreaks } from "@/hooks/useStreaks";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Award, Download, RefreshCw, Share2, Trophy, Target, Flame } from "lucide-react";
import { BADGE_DEFINITIONS } from "@/types/finance";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export default function AchievementReport() {
  const { transactions } = useTransactions();
  const { badges } = useBadges();
  const { goals } = useSavingsGoals();
  const { budgets } = useBudgets();
  const { currentStreak, longestStreak } = useStreaks();
  const { result, isLoading, stream } = useAiStream();

  const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const totalExpenses = transactions.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const totalSaved = goals.reduce((s, g) => s + Number(g.current_amount), 0);
  const totalTarget = goals.reduce((s, g) => s + Number(g.target_amount), 0);

  // Discipline score: based on badges, streak, savings rate
  const savingsRate = totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0;
  const disciplineScore = Math.min(100, Math.round(
    (badges.length / Object.keys(BADGE_DEFINITIONS).length) * 30 +
    Math.min(30, currentStreak * 3) +
    savingsRate * 40
  ));

  const downloadReport = () => {
    if (!result) { toast.error("Generate a report first"); return; }
    const blob = new Blob([result], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `achievement-report-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded!");
  };

  const shareReport = async () => {
    if (!result) { toast.error("Generate a report first"); return; }
    if (navigator.share) {
      await navigator.share({ title: "My Financial Achievement Report", text: result.slice(0, 200) + "..." });
    } else {
      await navigator.clipboard.writeText(result);
      toast.success("Report copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="relative bg-card px-4 pt-6 pb-5 border-b border-border/40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/5" />
        <div className="relative flex items-center gap-3">
          <Trophy className="w-6 h-6 text-accent" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">Achievement Report</h1>
            <p className="text-sm text-muted-foreground">Your financial discipline summary</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-5 max-w-lg mx-auto">
        {/* Discipline Score */}
        <Card className="shadow-lg bg-gradient-to-br from-accent/5 to-primary/5">
          <CardContent className="pt-5 pb-4 text-center">
            <Award className="w-10 h-10 text-accent mx-auto mb-2" />
            <p className="text-5xl font-extrabold tabular-nums">{disciplineScore}</p>
            <p className="text-sm text-muted-foreground mt-1">Discipline Score</p>
            <Progress value={disciplineScore} className="h-2 mt-3 max-w-[200px] mx-auto" />
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="shadow-sm">
            <CardContent className="p-3 text-center">
              <Flame className="w-4 h-4 text-destructive mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Current Streak</p>
              <p className="text-lg font-bold">{currentStreak} days</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-3 text-center">
              <Target className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Goals Progress</p>
              <p className="text-lg font-bold">{totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Badges Earned */}
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-3">
            <h2 className="text-sm font-semibold mb-3">🎖️ Badges ({badges.length}/{Object.keys(BADGE_DEFINITIONS).length})</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(BADGE_DEFINITIONS).map(([key, def]) => {
                const earned = badges.some(b => b.badge_name === key);
                return (
                  <span key={key} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium ${
                    earned ? "bg-accent/10 text-accent" : "bg-muted/50 text-muted-foreground opacity-40"
                  }`}>
                    {def.icon} {def.name}
                  </span>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* AI Report */}
        <Card className="shadow-sm border-accent/20">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-accent" />
                <h2 className="text-sm font-semibold">Full Report</h2>
              </div>
              <Button
                size="sm" variant="outline"
                onClick={() => stream("achievement-report")}
                disabled={isLoading}
                className="h-7 text-xs gap-1.5"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
                {isLoading ? "Generating..." : "Generate"}
              </Button>
            </div>
            {result ? (
              <>
                <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed mb-3">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={downloadReport} className="flex-1 h-8 text-xs">
                    <Download className="w-3 h-3 mr-1" /> Download
                  </Button>
                  <Button size="sm" variant="outline" onClick={shareReport} className="flex-1 h-8 text-xs">
                    <Share2 className="w-3 h-3 mr-1" /> Share
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">Click "Generate" for your complete achievement report.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
