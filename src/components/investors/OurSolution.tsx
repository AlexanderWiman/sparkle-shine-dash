import { Droplets, Leaf, MapPin, Calendar } from "lucide-react";

const items = [
  {
    icon: Droplets,
    title: "Low-water wash technology",
    description:
      "Proprietary process delivering a deep clean using only 5–10 liters of water per vehicle.",
  },
  {
    icon: Leaf,
    title: "Eco-certified chemistry",
    description:
      "Biodegradable detergents safe for surfaces, surroundings, and waterways.",
  },
  {
    icon: MapPin,
    title: "Scalable facility model",
    description:
      "Capital-light buildouts that fit existing real estate — malls, gas stations, fleet hubs.",
  },
  {
    icon: Calendar,
    title: "Digital booking platform",
    description:
      "Owned booking, CRM and operations stack — optimized utilization from day one.",
  },
];

const OurSolution = () => {
  return (
    <section id="solution" className="py-20 bg-section-alt scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm uppercase tracking-widest text-primary font-semibold mb-3">
            Our Solution
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            A defensible, technology-led car care platform.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default OurSolution;
