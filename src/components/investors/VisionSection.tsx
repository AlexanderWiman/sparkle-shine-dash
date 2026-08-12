import { Quote, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const VisionSection = () => {
  return (
    <section className="py-20 bg-section-alt">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Quote className="h-10 w-10 text-primary mx-auto mb-6 opacity-60" />
          <blockquote className="text-2xl md:text-3xl font-medium text-foreground leading-snug mb-8">
            "We're challenging the car wash industry with a unique concept that uses
            only 5 to 10 liters of water per wash — and we're just getting started."
          </blockquote>
          <div className="text-muted-foreground">
            <div className="font-semibold text-foreground">Car Washap AB</div>
            <a
              href="https://www.dagensinfrastruktur.se/2025/12/02/car-washap-ab-utmanar-biltvattsmarknaden-med-unikt-koncept-med-bara-5-10-liter-vatten-per-tvatt/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-1"
            >
              As featured in Dagens Infrastruktur
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="mt-10">
            <Link
              to="/om"
              className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
            >
              Learn more about our story →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisionSection;
