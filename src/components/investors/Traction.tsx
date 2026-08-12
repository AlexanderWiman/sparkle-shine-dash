import { Building2, Users, Handshake, Newspaper } from "lucide-react";

const items = [
  { icon: Building2, value: "Multiple", label: "Facilities operating in Sweden" },
  { icon: Users, value: "Thousands", label: "Customer bookings processed" },
  { icon: Handshake, value: "Partner API", label: "Integrated B2B partners" },
  { icon: Newspaper, value: "Featured", label: "In Swedish industry press" },
];

const Traction = () => {
  return (
    <section id="traction" className="py-20 bg-section-alt scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-sm uppercase tracking-widest text-primary font-semibold mb-3">
            Traction
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Proven model. Real revenue. Ready to scale.
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="bg-card border border-border rounded-2xl p-6 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-xl font-bold text-foreground mb-1">{item.value}</div>
                <div className="text-xs md:text-sm text-muted-foreground">{item.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Traction;
