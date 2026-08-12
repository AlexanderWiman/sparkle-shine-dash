import {
  HeroContent,
  ServicesContent,
  BenefitsContent,
  CTAContent,
  FAQContent,
  PricingContent,
  AboutContent,
  PressContent,
  ContactContent,
} from "@/lib/landingContentApi";
import HeroPreview from "./previews/HeroPreview";
import ServicesPreview from "./previews/ServicesPreview";
import BenefitsPreview from "./previews/BenefitsPreview";
import CTAPreview from "./previews/CTAPreview";
import FAQPreview from "./previews/FAQPreview";
import PricingPreview from "./previews/PricingPreview";
import AboutPreview from "./previews/AboutPreview";
import PressPreview from "./previews/PressPreview";
import ContactPreview from "./previews/ContactPreview";

interface SectionPreviewProps {
  activeTab: string;
  heroData: HeroContent | null;
  servicesData: ServicesContent | null;
  benefitsData: BenefitsContent | null;
  ctaData: CTAContent | null;
  faqData: FAQContent | null;
  pricingData: PricingContent | null;
  aboutData: AboutContent | null;
  pressData: PressContent | null;
  contactData: ContactContent | null;
}

const SectionPreview = ({
  activeTab,
  heroData,
  servicesData,
  benefitsData,
  ctaData,
  faqData,
  pricingData,
  aboutData,
  pressData,
  contactData,
}: SectionPreviewProps) => {
  const getActivePreview = () => {
    switch (activeTab) {
      case "hero":
        return <HeroPreview data={heroData} />;
      case "services":
        return <ServicesPreview data={servicesData} />;
      case "benefits":
        return <BenefitsPreview data={benefitsData} />;
      case "cta":
        return <CTAPreview data={ctaData} />;
      case "faq":
        return <FAQPreview data={faqData} />;
      case "pricing":
        return <PricingPreview data={pricingData} />;
      case "about":
        return <AboutPreview data={aboutData} />;
      case "press":
        return <PressPreview data={pressData} />;
      case "contact":
        return <ContactPreview data={contactData} />;
      default:
        return <HeroPreview data={heroData} />;
    }
  };

  const getTabLabel = () => {
    const labels: Record<string, string> = {
      hero: "Hero",
      services: "Tjänster",
      benefits: "Fördelar",
      cta: "CTA",
      faq: "FAQ",
      pricing: "Priser",
      about: "Om oss",
      press: "Press",
      contact: "Kontakt",
    };
    return labels[activeTab] || activeTab;
  };

  return (
    <div className="h-full flex flex-col bg-muted/20">
      {/* Preview Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-background">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs text-muted-foreground ml-2">
            Förhandsvisning: {getTabLabel()}
          </span>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto">
        <div className="min-h-full">
          {getActivePreview()}
        </div>
      </div>
    </div>
  );
};

export default SectionPreview;
