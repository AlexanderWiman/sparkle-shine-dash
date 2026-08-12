import { PricingContent } from "@/lib/landingContentApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Star, ArrowRight, Plus } from "lucide-react";

interface PricingPreviewProps {
  data: PricingContent | null;
}

const PricingPreview = ({ data }: PricingPreviewProps) => {
  if (!data) return <PreviewPlaceholder section="Priser" />;

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="py-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">{data.heroTitle}</h1>
          <p className="text-muted-foreground">{data.heroSubtitle}</p>
        </div>
      </section>

      {/* Base Services - Exterior & Interior */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-center mb-6">Bastjänster</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {/* Exterior Service */}
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-2 flex-1">
                <CardTitle className="text-lg">{data.exteriorService.title}</CardTitle>
                <CardDescription className="text-xs">{data.exteriorService.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <p className="text-2xl font-bold text-primary mb-3">{data.exteriorService.price} kr</p>
                {data.exteriorService.addons && data.exteriorService.addons.length > 0 && (
                  <div className="space-y-1 border-t pt-2">
                    <p className="text-xs font-medium text-muted-foreground">Tillägg:</p>
                    {data.exteriorService.addons.map((addon, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="flex items-center gap-1">
                          <Plus className="h-3 w-3" />
                          {addon.name}
                        </span>
                        <span className="text-primary">+{addon.price} kr</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interior Service */}
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-2 flex-1">
                <CardTitle className="text-lg">{data.interiorService.title}</CardTitle>
                <CardDescription className="text-xs">{data.interiorService.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <p className="text-2xl font-bold text-primary mb-3">{data.interiorService.price} kr</p>
                {data.interiorService.addons && data.interiorService.addons.length > 0 && (
                  <div className="space-y-1 border-t pt-2">
                    <p className="text-xs font-medium text-muted-foreground">Tillägg:</p>
                    {data.interiorService.addons.map((addon, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="flex items-center gap-1">
                          <Plus className="h-3 w-3" />
                          {addon.name}
                        </span>
                        <span className="text-primary">+{addon.price} kr</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Combo Packages */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-center mb-6">Paketpriser</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {data.comboServices.map((combo, index) => (
              <Card 
                key={index} 
                className={`relative h-full flex flex-col ${combo.popular ? 'border-primary shadow-lg' : ''}`}
              >
                {combo.popular && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 gap-1">
                    <Star className="h-3 w-3" />
                    Populär
                  </Badge>
                )}
                <CardHeader className="pb-2 pt-4 flex-1">
                  <CardTitle className="text-lg">{combo.title}</CardTitle>
                  <CardDescription className="text-xs">{combo.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <p className="text-2xl font-bold text-primary mb-3">{combo.price}</p>
                  <Button size="sm" className="w-full" variant={combo.popular ? "default" : "outline"}>
                    Boka nu
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Extra Services */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-center mb-6">Tilläggstjänster</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
            {data.extraServices.map((service, index) => (
              <div 
                key={index}
                className="bg-muted/50 rounded-lg p-3 text-center border"
              >
                <p className="font-medium text-sm">{service.name}</p>
                <p className="text-primary font-bold">{service.price}</p>
              </div>
            ))}
          </div>
          {data.note && (
            <p className="text-center text-xs text-muted-foreground mt-4">{data.note}</p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-8 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl font-bold mb-2">{data.ctaTitle}</h2>
          <p className="text-muted-foreground text-sm mb-4">{data.ctaSubtitle}</p>
          <Button size="sm" className="gap-2">
            {data.ctaButtonText}
            <ArrowRight className="h-4 w-4" />
          </Button>
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

export default PricingPreview;
