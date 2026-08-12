import { Button } from "@/components/ui/button";
import { ArrowRight, Droplets } from "lucide-react";

const InvestorHero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-accent to-primary text-primary-foreground">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary-foreground blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-primary-foreground blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-20 md:py-32 relative">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-foreground/15 backdrop-blur-sm text-sm font-medium mb-6">
            <Droplets className="h-4 w-4" />
            Investor Relations · US Expansion
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6">
            Saving 95% of the water used in traditional car washes.
          </h1>

          <p className="text-lg md:text-2xl text-primary-foreground/90 max-w-3xl mb-10 leading-relaxed">
            Car Washap is a sustainable car care company replacing the
            water-intensive, chemical-heavy car wash with a low-water,
            eco-certified system. Just <span className="font-semibold">5–10 liters per wash</span> — compared
            to 150+ liters at a conventional facility.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              asChild
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold"
            >
              <a href="#contact">
                Contact Investor Relations
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <a href="#contact">Request Pitch Deck</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InvestorHero;
