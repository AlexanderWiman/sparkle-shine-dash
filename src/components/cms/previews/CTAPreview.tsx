import { CTAContent } from "@/lib/landingContentApi";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";

interface CTAPreviewProps {
  data: CTAContent | null;
}

const CTAPreview = ({ data }: CTAPreviewProps) => {
  if (!data) return <PreviewPlaceholder section="CTA" />;

  return (
    <section className="py-12 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          {data.title}
        </h2>
        <p className="text-muted-foreground text-lg mb-6 max-w-xl mx-auto">
          {data.subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="sm" className="gap-2 shadow-lg">
            <Calendar className="h-4 w-4" />
            {data.buttonText}
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            Se priser
            <ArrowRight className="h-4 w-4" />
          </Button>
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

export default CTAPreview;
