import { HeroContent } from "@/lib/landingContentApi";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";
import heroImage from "@/assets/hero-carwash.jpg";

interface HeroPreviewProps {
  data: HeroContent | null;
}

const HeroPreview = ({ data }: HeroPreviewProps) => {
  if (!data) return <PreviewPlaceholder section="Hero" />;

  const backgroundImage = data.backgroundImage || heroImage;

  const videoSource = data.backgroundVideo || data.backgroundVideoUrl;

  return (
    <section className="relative min-h-[400px] flex items-center justify-center overflow-hidden">
      {/* Background Image or Video */}
      {videoSource ? (
        <video
          src={videoSource}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background/90" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          {data.title}{" "}
          <span className="text-primary">{data.highlightedText}</span>
        </h1>
        <p className="text-muted-foreground text-lg mb-6 max-w-xl mx-auto">
          {data.subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            {data.ctaText}
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            {data.secondaryCtaText}
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

export default HeroPreview;
