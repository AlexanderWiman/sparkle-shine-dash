import { Check } from "lucide-react";

const points = [
  {
    title: "Up to 95% less water per wash",
    description:
      "Industry-leading water efficiency without compromising on cleaning quality.",
  },
  {
    title: "Zero harmful runoff",
    description:
      "Biodegradable formulas mean no petrochemicals or solvents flowing into storm drains.",
  },
  {
    title: "Lower carbon footprint per wash",
    description:
      "Less water heated, less wastewater treated, less energy consumed end-to-end.",
  },
  {
    title: "Compliant with strict drought policy",
    description:
      "Operates in regions where traditional car wash facilities are restricted or banned.",
  },
  {
    title: "ESG-aligned investment thesis",
    description:
      "Quantifiable environmental impact reportable to LPs and stakeholders.",
  },
];

const SustainabilityDeepDive = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
          <div className="lg:sticky lg:top-24">
            <p className="text-sm uppercase tracking-widest text-primary font-semibold mb-3">
              Sustainability
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Built green. Built to last.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Sustainability isn't a marketing layer — it's the engineering foundation
              of every wash we deliver. Each facility is designed to minimize resource
              use while maximizing throughput and customer experience.
            </p>
          </div>

          <div className="space-y-5">
            {points.map((p, i) => (
              <div key={i} className="flex gap-4 bg-card border border-border rounded-2xl p-5">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {p.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SustainabilityDeepDive;
