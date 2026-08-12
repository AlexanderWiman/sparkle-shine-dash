import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Car, ArrowRight } from "lucide-react";

interface CTABandProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
}

const CTABand = ({ 
  title = "Redo att ge din bil den omvårdnad den förtjänar?",
  subtitle = "Boka din tid idag och upplev skillnaden med professionell handtvätt.",
  buttonText = "Boka tid nu"
}: CTABandProps) => {
  return (
    <section className="relative py-16 md:py-20 overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary" />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary-foreground rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary-foreground rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4 animate-fade-in">
            {title}
          </h2>
          <p className="text-lg md:text-xl text-primary-foreground/90 mb-8">
            {subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-lg px-8 py-6 pulse-glow"
            >
              <Link to="/boka">
                <Car className="mr-2 h-5 w-5" />
                {buttonText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 text-lg px-8 py-6 bg-transparent"
            >
              <Link to="/priser">Se våra priser</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTABand;
