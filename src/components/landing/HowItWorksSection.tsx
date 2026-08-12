import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Car, Calendar, ShoppingBag, Sparkles, ArrowRight } from "lucide-react";

const steps = [
  {
    id: 1,
    icon: Calendar,
    title: "Boka online",
    description: "Välj tid och plats som passar dig via vår enkla bokningssida.",
  },
  {
    id: 2,
    icon: Car,
    title: "Lämna bilen",
    description: "Kör till vår anläggning och lämna nycklarna hos oss.",
  },
  {
    id: 3,
    icon: ShoppingBag,
    title: "Passa på att handla",
    description: "Utnyttja tiden medan vi tvättar - shoppa eller ta en fika.",
  },
  {
    id: 4,
    icon: Sparkles,
    title: "Hämta en ren bil",
    description: "Din bil är skinande ren och klar när du är färdig.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-20 md:py-28 bg-muted/30 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-1/2 right-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 animate-on-scroll">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-2 block">
            Enkelt & Smidigt
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Så fungerar det
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Boka, lämna bilen och hämta den skinande ren – så enkelt är det.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Desktop: Horizontal timeline */}
          <div className="hidden md:block">
            <div className="relative">
              {/* Connection line */}
              <div className="absolute top-16 left-[10%] right-[10%] h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 rounded-full" />
              
              <div className="grid grid-cols-4 gap-6">
                {steps.map((step, index) => (
                  <div 
                    key={step.id} 
                    className={`animate-on-scroll stagger-${index + 1} text-center relative`}
                  >
                    {/* Step number badge */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center z-20 shadow-lg">
                      {step.id}
                    </div>
                    
                    {/* Icon circle */}
                    <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-background border-4 border-primary/20 flex items-center justify-center relative z-10 shadow-lg hover:border-primary/50 hover:scale-105 transition-all duration-300 group">
                      <step.icon className="h-12 w-12 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile: Vertical timeline */}
          <div className="md:hidden">
            <div className="relative">
              {/* Vertical connection line */}
              <div className="absolute top-0 bottom-0 left-10 w-1 bg-gradient-to-b from-primary/20 via-primary to-primary/20 rounded-full" />
              
              <div className="space-y-8">
                {steps.map((step, index) => (
                  <div 
                    key={step.id} 
                    className={`animate-on-scroll stagger-${index + 1} flex items-start gap-6 relative`}
                  >
                    {/* Icon circle */}
                    <div className="w-20 h-20 flex-shrink-0 rounded-full bg-background border-4 border-primary/20 flex items-center justify-center relative z-10 shadow-lg">
                      {/* Step number badge */}
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-lg">
                        {step.id}
                      </div>
                      <step.icon className="h-8 w-8 text-primary" />
                    </div>
                    
                    <div className="pt-2">
                      <h3 className="text-xl font-bold text-foreground mb-1">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-12 animate-on-scroll">
          <Button asChild size="lg" className="text-lg shadow-lg hover:shadow-xl transition-shadow">
            <Link to="/boka">
              Boka din tid nu
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
