import { useEffect, useState, useRef } from "react";
import { Droplets, Leaf, Recycle } from "lucide-react";

const SustainabilitySection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="hallbarhet" className="py-20 md:py-28 bg-gradient-to-br from-primary/5 via-background to-primary/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 animate-on-scroll">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-2 block">
            Hållbarhet
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Miljövänlig biltvätt
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Vi tar ansvar för miljön genom att minimera vattenförbrukningen och använda miljöcertifierade produkter
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
          {/* Water Comparison Card */}
          <div 
            ref={sectionRef}
            className="bg-card border border-border rounded-3xl p-8 shadow-xl animate-on-scroll"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Droplets className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Vattenförbrukning</h3>
                <p className="text-sm text-muted-foreground">per tvätt</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Car Washap */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-foreground flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-primary" />
                    Car Washap
                  </span>
                  <span className="text-primary font-bold text-lg">5-10 liter</span>
                </div>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-1500 ease-out ${
                      isVisible ? "w-[5%]" : "w-0"
                    }`}
                    style={{ transitionDuration: "1.5s" }}
                  />
                </div>
              </div>
              
              {/* Vanlig biltvätt */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Vanlig biltvätt</span>
                  <span className="text-muted-foreground font-medium">150-200 liter</span>
                </div>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-muted-foreground/30 rounded-full transition-all duration-1500 ease-out ${
                      isVisible ? "w-[50%]" : "w-0"
                    }`}
                    style={{ transitionDuration: "2s", transitionDelay: "0.3s" }}
                  />
                </div>
              </div>

              {/* Automatisk tvätt */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Automatisk tvätt</span>
                  <span className="text-muted-foreground font-medium">300-400 liter</span>
                </div>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-destructive/40 rounded-full transition-all duration-1500 ease-out ${
                      isVisible ? "w-full" : "w-0"
                    }`}
                    style={{ transitionDuration: "2.5s", transitionDelay: "0.6s" }}
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <p className="text-sm text-foreground font-medium text-center">
                🌿 Vi sparar upp till <span className="text-primary font-bold">95% vatten</span> jämfört med traditionella biltvättar
              </p>
            </div>
          </div>

          {/* Sustainability Points */}
          <div className="space-y-6 animate-on-scroll">
            <div className="flex gap-4 p-6 bg-card border border-border rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Droplets className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-foreground mb-1">Minimal vattenförbrukning</h4>
                <p className="text-muted-foreground text-sm">
                  Genom ångtvätt och effektiva metoder använder vi endast 5-10 liter vatten per tvätt istället för hundratals liter.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-card border border-border rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-foreground mb-1">Miljöcertifierade produkter</h4>
                <p className="text-muted-foreground text-sm">
                  Vi använder endast miljövänliga och biologiskt nedbrytbara rengöringsprodukter som är skonsamma mot naturen.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-card border border-border rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Recycle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-foreground mb-1">Hållbart tankesätt</h4>
                <p className="text-muted-foreground text-sm">
                  Vi strävar ständigt efter att minska vår miljöpåverkan och bidra till en renare framtid.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SustainabilitySection;
