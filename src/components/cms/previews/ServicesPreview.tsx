import { ServicesContent } from "@/lib/landingContentApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, Droplets, Sparkles, Shield, Star, Clock, Timer, CheckCircle, Hand, Calendar } from "lucide-react";

interface ServicesPreviewProps {
  data: ServicesContent | null;
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

const ServicesPreview = ({ data }: ServicesPreviewProps) => {
  if (!data) return <PreviewPlaceholder section="Tjänster" />;

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">{data.title}</h2>
          <p className="text-muted-foreground">{data.subtitle}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.items.map((service) => {
            const IconComponent = iconMap[service.icon] || Car;
            return (
              <Card key={service.id} className="relative overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                {service.popular && (
                  <Badge className="absolute top-3 right-3">Populär</Badge>
                )}
                <CardHeader className="pb-2 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                  <CardDescription className="text-sm">{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 mt-auto">
                  <p className="text-xl font-bold text-primary">{service.price}</p>
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

export default ServicesPreview;
