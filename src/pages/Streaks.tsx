import { useStreaks } from "@/hooks/useStreaks";
import { useBadges } from "@/hooks/useBadges";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Trophy, Calendar, Zap, Star } from "lucide-react";

const STREAK_MILESTONES = [
  { days: 3, label: "Getting Started", icon: "🌱" },
  { days: 7, label: "One Week!", icon: "🔥" },
  { days: 14, label: "Two Weeks!", icon: "⚡" },
  { days: 30, label: "One Month!", icon: "🏆" },
  { days: 60, label: "Two Months!", icon: "👑" },
  { days: 100, label: "Century!", icon: "💎" },
];

export default function Streaks() {
  const { currentStreak, longestStreak, streakDays, motivationalMessage } = useStreaks();
  const { badges } = useBadges();

  // Generate last 28 days grid
  const today = new Date();
  const calendarDays = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (27 - i));
    const dateStr = d.toISOString().slice(0, 10);
    return { date: dateStr, active: streakDays.includes(dateStr), label: d.getDate().toString() };
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="relative bg-card px-4 pt-6 pb-5 border-b border-border/40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 via-transparent to-accent/5" />
        <div className="relative flex items-center gap-3">
          <Flame className="w-6 h-6 text-destructive" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">Financial Streaks</h1>
            <p className="text-sm text-muted-foreground">Build daily money tracking habits</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-5 max-w-lg mx-auto">
        {/* Current Streak */}
        <Card className="shadow-lg border-border/40 bg-gradient-to-br from-destructive/5 to-accent/5">
          <CardContent className="pt-5 pb-4 text-center">
            <Flame className="w-10 h-10 text-destructive mx-auto mb-2" />
            <p className="text-5xl font-extrabold tabular-nums">{currentStreak}</p>
            <p className="text-sm text-muted-foreground mt-1">day streak</p>
            <p className="text-xs text-accent font-medium mt-2">{motivationalMessage}</p>
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="shadow-sm">
            <CardContent className="p-3 text-center">
              <Trophy className="w-4 h-4 text-accent mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Longest Streak</p>
              <p className="text-lg font-bold tabular-nums">{longestStreak} days</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-3 text-center">
              <Star className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Badges Earned</p>
              <p className="text-lg font-bold tabular-nums">{badges.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Calendar */}
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-chart-2" />
              <h2 className="text-sm font-semibold">Last 28 Days</h2>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((d, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-md flex items-center justify-center text-[10px] font-medium ${
                    d.active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground"
                  }`}
                  title={d.date}
                >
                  {d.label}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end gap-3 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm bg-muted/50" /> No activity</span>
              <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm bg-primary" /> Tracked</span>
            </div>
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-semibold">Streak Milestones</h2>
            </div>
            <div className="space-y-2">
              {STREAK_MILESTONES.map((m, i) => {
                const reached = longestStreak >= m.days;
                return (
                  <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg ${reached ? "bg-primary/5 border border-primary/20" : "bg-muted/30 opacity-50"}`}>
                    <span className="text-xl">{m.icon}</span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold">{m.label}</p>
                      <p className="text-[10px] text-muted-foreground">{m.days} days</p>
                    </div>
                    {reached && <span className="text-xs text-primary font-semibold">✓ Done</span>}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
