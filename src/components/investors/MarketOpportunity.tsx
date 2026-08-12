import AnimatedCounter from "@/components/landing/AnimatedCounter";

const stats = [
  { value: 17, prefix: "$", suffix: "B+", label: "US car wash market" },
  { value: 280, suffix: "M+", label: "Registered vehicles in the US" },
  { value: 66, suffix: "%", label: "Of US car owners wash their cars 1–2 times per month" },
];

const MarketOpportunity = () => {
  return (
    <section id="market" className="py-20 bg-background scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div>
            <p className="text-sm uppercase tracking-widest text-primary font-semibold mb-3">
              Market Opportunity
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              A multi-billion dollar industry, ready for disruption.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              The US car wash market is large, fragmented, and increasingly pressured by
              water restrictions, ESG regulations, and shifting consumer preference toward
              sustainable services.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Car Washap brings a proven, low-water model from Sweden — a market with
              some of the world's strictest environmental standards — to American operators
              and end customers.
            </p>
          </div>

          <div className="space-y-4">
            {stats.map((s, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-2xl p-6 flex items-center justify-between hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl md:text-5xl font-bold text-primary tabular-nums">
                  <AnimatedCounter end={s.value} prefix={s.prefix} suffix={s.suffix} />
                </div>
                <div className="text-sm md:text-base text-muted-foreground text-right max-w-[55%]">
                  {s.label}
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground text-right">
              Industry estimates. Internal projections available on request.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketOpportunity;
