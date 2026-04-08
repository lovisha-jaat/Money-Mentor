import { useMemo } from "react";
import { useTransactions } from "@/hooks/useTransactions";

export function useStreaks() {
  const { transactions } = useTransactions();

  const { currentStreak, longestStreak, streakDays } = useMemo(() => {
    if (transactions.length === 0) return { currentStreak: 0, longestStreak: 0, streakDays: [] as string[] };

    // Get unique dates with transactions, sorted desc
    const dates = [...new Set(transactions.map(t => t.transaction_date))].sort((a, b) => b.localeCompare(a));

    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    // Calculate current streak
    let current = 0;
    let checkDate = dates[0] === today || dates[0] === yesterday ? new Date(dates[0]) : null;

    if (checkDate) {
      for (const date of dates) {
        const expected = checkDate.toISOString().slice(0, 10);
        if (date === expected) {
          current++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (date < expected) {
          break;
        }
      }
    }

    // Calculate longest streak
    let longest = 0;
    let tempStreak = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diff = (prev.getTime() - curr.getTime()) / 86400000;
      if (Math.round(diff) === 1) {
        tempStreak++;
      } else {
        longest = Math.max(longest, tempStreak);
        tempStreak = 1;
      }
    }
    longest = Math.max(longest, tempStreak, current);

    return { currentStreak: current, longestStreak: longest, streakDays: dates.slice(0, 30) };
  }, [transactions]);

  const motivationalMessage = useMemo(() => {
    if (currentStreak === 0) return "Start tracking today to begin your streak! 🚀";
    if (currentStreak <= 2) return "Good start! Keep it going! 💪";
    if (currentStreak <= 6) return "You're building a great habit! 🔥";
    if (currentStreak <= 13) return "Incredible consistency! You're a finance pro! ⭐";
    if (currentStreak <= 29) return "Amazing streak! You're unstoppable! 🏆";
    return "Legendary! 30+ day streak — you're a financial master! 👑";
  }, [currentStreak]);

  return { currentStreak, longestStreak, streakDays, motivationalMessage };
}
