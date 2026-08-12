import { AboutContent } from "@/lib/landingContentApi";
import { Card, CardContent } from "@/components/ui/card";
import { Car, Droplets, Sparkles, Shield, Star, Clock, Timer, CheckCircle, Hand, Calendar, Heart, Users, Leaf, Target } from "lucide-react";

interface AboutPreviewProps {
  data: AboutContent | null;
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
  heart: Heart,
  users: Users,
  leaf: Leaf,
  target: Target,
};

const AboutPreview = ({ data }: AboutPreviewProps) => {
  if (!data) return <PreviewPlaceholder section="Om oss" />;

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="py-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">{data.heroTitle}</h1>
          <p className="text-muted-foreground">{data.heroSubtitle}</p>
        </div>
      </section>

      {/* Story */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="space-y-6 max-w-2xl mx-auto">
            {data.storySections.map((section, index) => {
              const IconComponent = iconMap[section.icon] || Star;
              return (
                <div key={index} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{section.title}</h3>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-center mb-6">{data.valuesTitle}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {data.values.map((value, index) => {
              const IconComponent = iconMap[value.icon] || Star;
              return (
                <Card key={index} className="text-center">
                  <CardContent className="pt-4 pb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{value.title}</h3>
                    <p className="text-xs text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tagline */}
      <section className="py-8">
        <div className="container mx-auto px-4 text-center">
          <blockquote className="text-lg italic text-foreground mb-2">
            "{data.tagline}"
          </blockquote>
          <p className="text-muted-foreground text-sm">— {data.taglineAuthor}</p>
        </div>
      </section>
    </div>
  );
};

const PreviewPlaceholder = ({ section }: { section: string }) => (
  <div className="flex items-center justify-center h-64 bg-muted/50 rounded-lg border-2 border-dashed">
    <p className="text-muted-foreground">Laddar {section}...</p>
  </div>
);

export default AboutPreview;
