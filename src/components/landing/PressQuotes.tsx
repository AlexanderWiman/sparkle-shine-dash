import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Quote, ArrowRight, Newspaper } from "lucide-react";

const pressQuotes = [
  {
    id: 1,
    quote: "Car Washap satsar på miljövänlig biltvätt med ångteknik – en innovativ metod som sparar vatten och ger skinande resultat.",
    source: "Arbetarbladet",
    date: "December 2025",
  },
  {
    id: 2,
    quote: "Car Wash'ap erbjuder vatteneffektiv handtvätt medan kunderna shoppar. Målet är att expandera till 120 anläggningar i Sverige inom fyra år.",
    source: "Dagens Infrastruktur",
    date: "December 2025",
  },
  {
    id: 3,
    quote: "Ove och Malin Lindholms startup erbjuder miljövänlig handtvätt vid köpcentrum, med bara 5-10 liter vatten jämfört med traditionella 300 liter.",
    source: "Movexum",
    date: "December 2025",
  },
];

const PressQuotes = () => {
  return (
    <section className="py-20 md:py-28 bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 animate-on-scroll">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-2 block">
            I Media
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Vad media säger om oss
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Vi är stolta över att uppmärksammas för vårt arbete med hållbar biltvätt.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {pressQuotes.map((item, index) => (
            <Card 
              key={item.id} 
              className={`animate-on-scroll stagger-${index + 1} hover-lift bg-card border-border/50 hover:border-primary/30 transition-all duration-300 relative`}
            >
              <CardContent className="p-6 md:p-8">
                <Quote className="h-8 w-8 text-primary/30 mb-4" />
                <blockquote className="text-foreground text-lg leading-relaxed mb-6">
                  "{item.quote}"
                </blockquote>
                <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Newspaper className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{item.source}</p>
                    <p className="text-sm text-muted-foreground">{item.date}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12 animate-on-scroll">
          <Button asChild variant="outline" size="lg" className="text-lg">
            <Link to="/press">
              Se alla pressartiklar
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PressQuotes;
