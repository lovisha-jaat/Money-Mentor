import { Link, NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, MessageCircle, Target, Calculator, FlameKindling, MoreHorizontal, Receipt, Brain, Shield, User, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const MAIN = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/fire", label: "FIRE", icon: FlameKindling },
  { to: "/chat", label: "Mentor", icon: MessageCircle },
  { to: "/goals", label: "Goals", icon: Target },
];

const MORE = [
  { to: "/tax", label: "Tax Planner", icon: Receipt },
  { to: "/whatif", label: "What-If Simulator", icon: TrendingUp },
  { to: "/personality", label: "Money Personality", icon: Brain },
  { to: "/emergency", label: "Emergency Fund", icon: Shield },
  { to: "/profile", label: "Profile & Settings", icon: User },
];

export default function BottomNav() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const moreActive = MORE.some(n => location.pathname === n.to);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border/60 z-50">
      <div className="flex items-center justify-around h-16 max-w-2xl mx-auto px-2">
        {MAIN.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 transition-all active:scale-95 rounded-lg",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", active && "stroke-[2.4]")} />
              <span className="text-[10px] font-semibold tracking-wide">{label}</span>
            </NavLink>
          );
        })}

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors active:scale-95",
                moreActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <MoreHorizontal className={cn("w-5 h-5", moreActive && "stroke-[2.4]")} />
              <span className="text-[10px] font-semibold tracking-wide">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl pb-8">
            <SheetHeader>
              <SheetTitle className="text-left">More tools</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {MORE.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to;
                return (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all hover:shadow-sm active:scale-[0.97]",
                      active ? "border-primary bg-primary/5 text-primary" : "border-border/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] font-semibold text-center leading-tight">{label}</span>
                  </NavLink>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
