import { BenefitsContent } from "@/lib/landingContentApi";
import { Card, CardContent } from "@/components/ui/card";
import { Car, Droplets, Sparkles, Shield, Star, Clock, Timer, CheckCircle, Hand, Calendar } from "lucide-react";

interface BenefitsPreviewProps {
  data: BenefitsContent | null;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  car: Car,
  droplets: Droplets,
  sparkles: Sparkles,
  shield: Shield,
  star: Star,
  clock: Clock,
  timer: Timer,
  "check-circle": CheckCircle,
  hand: Hand,
  calendar: Calendar,
};

const BenefitsPreview = ({ data }: BenefitsPreviewProps) => {
  if (!data) return <PreviewPlaceholder section="Fördelar" />;

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">{data.title}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.items.map((benefit) => {
            const IconComponent = iconMap[benefit.icon] || Star;
            return (
              <Card key={benefit.id} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const PreviewPlaceholder = ({ section }: { section: string }) => (
  <div className="flex items-center justify-center h-64 bg-muted/50 rounded-lg border-2 border-dashed">
    <p className="text-muted-foreground">Laddar {section}...</p>
  </div>
);

export default BenefitsPreview;
