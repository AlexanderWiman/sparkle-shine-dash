import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clock,
  Leaf,
  MapPin,
  Heart,
  Target,
  Lightbulb,
  Star,
  Timer,
  CheckCircle,
  Droplets,
  Car,
  Shield,
  Sparkles,
  Hand,
  Calendar,
  type LucideIcon,
} from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";
import { fetchAboutContent, AboutContent } from "@/lib/landingContentApi";

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  clock: Clock,
  leaf: Leaf,
  heart: Heart,
  target: Target,
  lightbulb: Lightbulb,
  star: Star,
  timer: Timer,
  "check-circle": CheckCircle,
  droplets: Droplets,
  car: Car,
  shield: Shield,
  sparkles: Sparkles,
  hand: Hand,
  calendar: Calendar,
};

// Default content
const defaultContent: AboutContent = {
  heroTitle: "Om Car Washap",
  heroSubtitle: "En modern och hållbar bilvårdstjänst skapad för människor som värdesätter både sin tid och vårt klimat.",
  storySections: [
    {
      icon: "lightbulb",
      title: "Idén bakom Car Washap",
      description: "Idén föddes ur en enkel insikt: bilen är en av våra största investeringar men tiden att ta hand om den är begränsad. Samtidigt blir miljökraven allt större och traditionella tvättmetoder är ofta både tidskrävande och resursintensiva.",
    },
    {
      icon: "target",
      title: "Vår lösning",
      description: "Vi placerar våra handtvättstationer där bilägare redan befinner sig, till exempel vid köpcentrum och knutpunkter. Det innebär att du kan göra dina ärenden, träna, handla eller bara ta en paus, medan vi tar hand om bilen på ett miljösäkert, skonsamt och professionellt sätt.",
    },
    {
      icon: "leaf",
      title: "Resultat",
      description: "På så sätt sparar du tid, energi och bidrar till en mer hållbar framtid – helt utan att kompromissa med resultatet.",
    },
  ],
  valuesTitle: "Våra värderingar",
  values: [
    {
      icon: "clock",
      title: "Spara tid",
      description: "Vi placerar våra stationer där du redan befinner dig, så du kan utnyttja tiden smartare.",
    },
    {
      icon: "leaf",
      title: "Hållbarhet",
      description: "Miljösäkra metoder och produkter för att minimera vår påverkan på klimatet.",
    },
    {
      icon: "heart",
      title: "Omsorg",
      description: "Professionell handtvätt som är skonsam mot din bil och ger ett perfekt resultat.",
    },
  ],
  locationTitle: "Hitta oss",
  locationDescription: "Vi finns vid Kupolen köpcentrum i Borlänge, parkering ingång 3 & 4.",
  tagline: "Smart care for your car. More time for you.",
  taglineAuthor: "– Car Washap",
};

// Organization schema for SEO
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "AutoWash",
  "@id": "https://carwashap.com/#localbusiness",
  name: "Car Washap AB",
  alternateName: "Car Washap",
  description: "Modern och hållbar bilvårdstjänst med miljövänlig handtvätt som endast använder 5-10 liter vatten per tvätt.",
  url: "https://carwashap.com",
  logo: "https://carwashap.com/og-image.jpg",
  image: "https://carwashap.com/og-image.jpg",
  telephone: "+46-XXX-XXX-XXX",
  email: "info@carwashap.com",
  foundingDate: "2025",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Kupolen Köpcentrum, Parkering ingång 3 & 4",
    addressLocality: "Borlänge",
    addressRegion: "Dalarna",
    postalCode: "784 50",
    addressCountry: "SE",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "60.4856",
    longitude: "15.4329",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "10:00",
      closes: "16:00",
    },
  ],
  priceRange: "$$",
  currenciesAccepted: "SEK",
  paymentAccepted: "Swish, Kort, Kontant",
  areaServed: {
    "@type": "City",
    name: "Borlänge",
  },
  serviceType: "Biltvätt",
  slogan: "Smart care for your car. More time for you.",
  knowsAbout: ["Handtvätt", "Miljövänlig biltvätt", "Bilvård", "Ångtvätt"],
  sameAs: [],
};

const AboutPage = () => {
  const { data: content, isLoading } = useQuery({
    queryKey: ["about-content"],
    queryFn: fetchAboutContent,
  });

  const about = content || defaultContent;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <div className="container mx-auto px-4 py-16 space-y-8">
          <Skeleton className="h-12 w-64 mx-auto" />
          <Skeleton className="h-6 w-96 mx-auto" />
          <div className="space-y-8 max-w-3xl mx-auto">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${about.heroTitle} – Hållbar Biltvätt i Borlänge`}
        description={about.heroSubtitle}
        canonicalPath="/om"
        keywords="om car washap, biltvätt borlänge, hållbar biltvätt, miljövänlig biltvätt, kupolen borlänge"
      />

      {/* Organization Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <PublicHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/5 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              {about.heroTitle}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {about.heroSubtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-8">
            {about.storySections.map((section, index) => {
              const IconComponent = iconMap[section.icon] || Lightbulb;
              return (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-4">
                      {section.title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {section.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {about.valuesTitle}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {about.values.map((value, index) => {
              const IconComponent = iconMap[value.icon] || Star;
              return (
                <Card key={index} className="text-center">
                  <CardContent className="pt-8 pb-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {about.locationTitle}
            </h2>
            <p className="text-muted-foreground mb-6">
              {about.locationDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Kupolen+Borl%C3%A4nge+Parkering"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visa på karta
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link to="/boka">Boka tid</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tagline */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <blockquote className="text-2xl md:text-3xl font-medium italic max-w-2xl mx-auto">
            "{about.tagline}"
          </blockquote>
          <p className="mt-4 text-primary-foreground/70">{about.taglineAuthor}</p>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default AboutPage;