import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  BookOpen,
  Shield,
  TrendingUp,
  Brain,
  Target,
  PiggyBank,
  BarChart3,
  MessageCircle,
  Sparkles,
  ChevronRight,
  IndianRupee,
  Zap,
  Mic,
  Globe,
  Rocket,
  Code,
  Database,
  Palette,
  Layers,
  Lightbulb,
  Users,
  Smartphone,
} from "lucide-react";

const FEATURES = [
  {
    icon: BarChart3,
    title: "Money Health Score",
    desc: "Get a score out of 100 based on your savings, expenses, investments & retirement readiness.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Brain,
    title: "AI Chat Mentor",
    desc: "Ask anything about SIP, PPF, NPS, taxes — get personalized answers using your data.",
    color: "text-chart-2",
    bg: "bg-chart-2/10",
  },
  {
    icon: TrendingUp,
    title: "FIRE Planner",
    desc: "See when you can retire early and how much SIP you need to get there.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Shield,
    title: "Tax Optimizer",
    desc: "Compare old vs new tax regime. Discover savings under 80C, 80D, NPS & more.",
    color: "text-chart-4",
    bg: "bg-chart-4/10",
  },
  {
    icon: Target,
    title: "Goal Planner",
    desc: "Plan for a car, house, or vacation — we calculate the monthly SIP needed.",
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  {
    icon: PiggyBank,
    title: "Emergency Fund",
    desc: "Know exactly how much you need for a 6-month safety net and track your progress.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Tell us about yourself",
    desc: "Enter your age, income, expenses, savings & goals in under 2 minutes.",
    icon: Sparkles,
  },
  {
    step: "02",
    title: "Get your health score",
    desc: "We instantly analyze your finances and generate a personalized dashboard.",
    icon: BarChart3,
  },
  {
    step: "03",
    title: "Take action with AI",
    desc: "Chat with your AI mentor, optimize taxes, plan goals & build wealth.",
    icon: MessageCircle,
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative px-4 pt-12 pb-16 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-accent/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

        <div className="relative max-w-lg mx-auto text-center space-y-6">
          {/* Logo / Brand */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
            <IndianRupee className="w-4 h-4" />
            FinMentor AI
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1]">
            Your Personal
            <span className="block text-primary">Finance Mentor</span>
          </h1>

          <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
            AI-powered financial planning built for India. Get your money health score, save taxes, plan retirement & build wealth — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              size="lg"
              className="h-13 px-8 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-[0.98]"
              onClick={() => navigate("/onboarding")}
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-13 px-8 text-base"
              onClick={() => {
                document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              See How It Works
            </Button>
          </div>
          <Button
            variant="ghost"
            className="text-sm text-muted-foreground hover:text-primary"
            onClick={() => navigate("/guide")}
          >
            <BookOpen className="w-4 h-4 mr-1.5" />
            Beginner's Guide
          </Button>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 pt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-accent" /> 2 min setup
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-primary" /> 100% free
            </span>
            <span className="flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-chart-4" /> AI-powered
            </span>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-4 py-14 bg-card/50 border-y border-border/40">
        <div className="max-w-lg mx-auto space-y-8">
          <div className="text-center space-y-2">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider">How It Works</p>
            <h2 className="text-2xl font-bold tracking-tight">Start in 3 simple steps</h2>
          </div>

          <div className="space-y-4">
            {HOW_IT_WORKS.map((item, i) => (
              <Card key={i} className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex gap-4 items-start">
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-[10px] font-bold text-primary/60">{item.step}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-base mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-14">
        <div className="max-w-lg mx-auto space-y-8">
          <div className="text-center space-y-2">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider">Features</p>
            <h2 className="text-2xl font-bold tracking-tight">Everything you need to master money</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FEATURES.map((f, i) => (
              <Card key={i} className="border-border/60 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                <CardContent className="p-4 space-y-3">
                  <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center`}>
                    <f.icon className={`w-5 h-5 ${f.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Unique Features */}
      <section className="px-4 py-14 bg-card/50 border-y border-border/40">
        <div className="max-w-lg mx-auto space-y-8">
          <div className="text-center space-y-2">
            <p className="text-sm font-semibold text-chart-2 uppercase tracking-wider">What Makes Us Different</p>
            <h2 className="text-2xl font-bold tracking-tight">Unique Features</h2>
          </div>
          <div className="space-y-3">
            {[
              { icon: Mic, title: "Voice-Powered AI Chat", desc: "Speak to your financial mentor — hands-free input with Speech-to-Text and AI responses read aloud in an Indian accent.", color: "text-chart-2", bg: "bg-chart-2/10" },
              { icon: Brain, title: "Hyper-Personalized Advice", desc: "Every response uses YOUR real income, expenses, savings & goals — never generic tips.", color: "text-primary", bg: "bg-primary/10" },
              { icon: IndianRupee, title: "India-First Design", desc: "Built around Indian tax laws (80C, 80D, NPS), SIP culture, and ₹ formatting with lakhs & crores.", color: "text-accent", bg: "bg-accent/10" },
              { icon: Lightbulb, title: "What-If Simulator", desc: "Instantly see how changing your savings or expenses impacts your retirement age and wealth.", color: "text-chart-4", bg: "bg-chart-4/10" },
              { icon: Users, title: "Money Personality Quiz", desc: "Discover if you're a Saver, Spender, or Investor — get tailored strategies for your type.", color: "text-destructive", bg: "bg-destructive/10" },
            ].map((f, i) => (
              <Card key={i} className="border-border/60 shadow-sm">
                <CardContent className="p-4 flex gap-4 items-start">
                  <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center shrink-0`}>
                    <f.icon className={`w-5 h-5 ${f.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How the App Works (Workflow) */}
      <section className="px-4 py-14">
        <div className="max-w-lg mx-auto space-y-8">
          <div className="text-center space-y-2">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider">Workflow</p>
            <h2 className="text-2xl font-bold tracking-tight">Your journey to financial freedom</h2>
          </div>
          <div className="relative">
            <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-border/60" />
            {[
              { step: "1", title: "Sign Up & Onboard", desc: "Create an account and enter your basic financial info in under 2 minutes." },
              { step: "2", title: "Get Your Health Score", desc: "Instantly see a score out of 100 covering savings, investments, emergency fund & more." },
              { step: "3", title: "Explore Tools", desc: "Use FIRE Planner, Tax Optimizer, Goal Planner, and What-If Simulator for deep insights." },
              { step: "4", title: "Chat with AI Mentor", desc: "Ask any finance question via text or voice — get personalized, actionable advice." },
              { step: "5", title: "Track & Improve", desc: "Revisit your dashboard, update data, and watch your financial health grow over time." },
            ].map((item, i) => (
              <div key={i} className="relative pl-12 pb-6 last:pb-0">
                <div className="absolute left-2 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="px-4 py-14 bg-card/50 border-y border-border/40">
        <div className="max-w-lg mx-auto space-y-8">
          <div className="text-center space-y-2">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider">Under the Hood</p>
            <h2 className="text-2xl font-bold tracking-tight">Tech Stack</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Code, label: "React + TypeScript", desc: "Modern, type-safe frontend" },
              { icon: Palette, label: "Tailwind CSS", desc: "Beautiful, responsive design" },
              { icon: Database, label: "Lovable Cloud", desc: "Secure auth & database" },
              { icon: Brain, label: "Gemini AI", desc: "Intelligent financial advice" },
              { icon: Layers, label: "Edge Functions", desc: "Serverless backend logic" },
              { icon: Globe, label: "Web Speech API", desc: "Voice input & output" },
            ].map((t, i) => (
              <Card key={i} className="border-border/60 shadow-sm">
                <CardContent className="p-4 text-center space-y-2">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                    <t.icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-xs">{t.label}</h3>
                  <p className="text-[11px] text-muted-foreground">{t.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Future Scope */}
      <section className="px-4 py-14">
        <div className="max-w-lg mx-auto space-y-8">
          <div className="text-center space-y-2">
            <p className="text-sm font-semibold text-chart-4 uppercase tracking-wider">Coming Soon</p>
            <h2 className="text-2xl font-bold tracking-tight">Future Scope</h2>
          </div>
          <div className="space-y-3">
            {[
              { icon: Smartphone, title: "Mobile App (PWA)", desc: "Install FinMentor AI on your phone like a native app with offline support." },
              { icon: Globe, title: "Multi-Language Support", desc: "Use the app in Hindi, Tamil, Telugu, Marathi & more regional languages." },
              { icon: Users, title: "Family Finance Mode", desc: "Track finances for your entire household — parents, spouse & kids in one place." },
              { icon: TrendingUp, title: "Live Market Integration", desc: "Real-time mutual fund NAVs, stock prices, and portfolio tracking." },
              { icon: Rocket, title: "AI Auto-Rebalancing", desc: "Get automated suggestions to rebalance your portfolio based on market conditions." },
              { icon: Shield, title: "Insurance Advisor", desc: "AI-powered recommendations for health, life & term insurance plans." },
            ].map((f, i) => (
              <Card key={i} className="border-border/60 border-dashed shadow-sm">
                <CardContent className="p-4 flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <f.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-14 bg-card/50 border-t border-border/40">
        <div className="max-w-lg mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Built for India
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Ready to take control of your finances?
          </h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Join thousands of Indians who are building a smarter financial future with AI-powered guidance.
          </p>
          <Button
            size="lg"
            className="h-13 px-10 text-base font-semibold shadow-lg shadow-primary/25 active:scale-[0.98] transition-all"
            onClick={() => navigate("/onboarding")}
          >
            Start Your Free Analysis
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-6 text-center text-xs text-muted-foreground border-t border-border/40">
        <p>© 2026 FinMentor AI · Your AI-powered financial companion for India</p>
      </footer>
    </div>
  );
}
