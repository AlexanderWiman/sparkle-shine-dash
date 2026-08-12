import AnimatedCounter from "@/components/landing/AnimatedCounter";
import { Droplets, Leaf, TrendingDown, Sparkles } from "lucide-react";

const stats = [
  {
    icon: Droplets,
    value: 10,
    suffix: " L",
    label: "Water per wash",
    sub: "vs. 150+ L industry standard",
  },
  {
    icon: TrendingDown,
    value: 95,
    suffix: "%",
    label: "Less water used",
    sub: "Compared to traditional washes",
  },
  {
    icon: Leaf,
    value: 100,
    suffix: "%",
    label: "Biodegradable products",
    sub: "Eco-certified chemistry",
  },
  {
    icon: Sparkles,
    value: 40000,
    suffix: "+",
    label: "Liters saved (and counting)",
    sub: "Across all washes performed",
  },
];

const ImpactCounters = () => {
  return (
    <section id="impact" className="py-20 bg-section-alt scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-sm uppercase tracking-widest text-primary font-semibold mb-3">
            Measurable Impact
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Numbers that move the industry.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="bg-card rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-border"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="font-semibold text-foreground mb-1">{stat.label}</div>
                <div className="text-sm text-muted-foreground">{stat.sub}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ImpactCounters;
