import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, ArrowRight, TrendingUp, Receipt, Shield, Brain, FlameKindling, Target, MessageCircle } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <header className="relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <nav className="relative max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground grid place-items-center">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg">FinMentor AI</span>
          </div>
          <Link to="/auth">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
        </nav>

        <div className="relative max-w-4xl mx-auto px-6 pt-12 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-semibold mb-6 border border-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            AI-powered for Indian investors
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.05]">
            Your pocket
            <span className="block text-primary">financial mentor.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            FIRE planning, tax savings, SIP calculators, and a personal AI advisor — all built for the Indian middle class. No jargon, just clarity.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/auth">
              <Button size="lg" className="h-12 px-8 text-base font-semibold w-full sm:w-auto">
                Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base font-semibold w-full sm:w-auto">
                See features
              </Button>
            </a>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">No credit card • 2-min setup • ₹0 forever</p>
        </div>
      </header>

      {/* FEATURE GRID */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Everything you need. Nothing you don't.</h2>
          <p className="mt-3 text-muted-foreground">Built around the 95% of Indians who don't have a financial plan.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: TrendingUp, title: "Money Health Score", desc: "0-100 score across 5 pillars: emergency, savings, debt, investments, retirement." },
            { icon: FlameKindling, title: "FIRE Planner", desc: "Find your retirement age and the SIP needed to get there. With wealth growth charts." },
            { icon: Receipt, title: "Tax Planner", desc: "Old vs New regime — see which saves you more. 80C, 80D, NPS suggestions." },
            { icon: Target, title: "Goal Planner", desc: "Car, home, vacation — calculate the monthly SIP for any goal automatically." },
            { icon: Shield, title: "Emergency Fund", desc: "Calculate your 6-month buffer and see exactly how far you are." },
            { icon: Brain, title: "Money Personality", desc: "Saver, Spender, or Investor? 6 questions, personalized strategy." },
          ].map((f) => (
            <Card key={f.title} className="border-border/60 hover:shadow-lg hover:border-primary/30 transition-all">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* AI MENTOR HIGHLIGHT */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden">
          <CardContent className="p-8 sm:p-12 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
                <MessageCircle className="w-3 h-3" /> AI MENTOR
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">Chat like WhatsApp. Advice like a CFP.</h3>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Ask anything: "Should I prepay my home loan or invest in ELSS?" Get answers personalized to your numbers — never generic.
              </p>
              <Link to="/auth"><Button className="mt-6 h-11 font-semibold">Try the mentor <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 space-y-3 shadow-lg">
              <div className="bg-primary text-primary-foreground rounded-2xl rounded-tl-sm p-3 text-sm max-w-[80%]">
                Should I invest ₹10K extra in NPS or ELSS?
              </div>
              <div className="bg-secondary rounded-2xl rounded-tr-sm p-3 text-sm max-w-[90%] ml-auto">
                Given your age (28) and 30% tax bracket, <strong>ELSS</strong> wins: same 80C benefit, better liquidity (3-yr lock vs 60), 12% returns vs 9%. Start a ₹10K SIP today. 🚀
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        Built with care for Indian families. © {new Date().getFullYear()} FinMentor AI.
      </footer>
    </div>
  );
}
