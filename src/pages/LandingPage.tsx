import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Car,
  Clock,
  Shield,
  Sparkles,
  MapPin,
  Mail,
  Instagram,
  CheckCircle,
  Star,
  Droplets,
  Timer,
  ArrowRight,
  Phone,
  LucideIcon,
} from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";
import ServiceCard from "@/components/landing/ServiceCard";
import BenefitCard from "@/components/landing/BenefitCard";
import TrustSection from "@/components/landing/TrustSection";
import CTABand from "@/components/landing/CTABand";
import SustainabilitySection from "@/components/landing/SustainabilitySection";
import PressQuotes from "@/components/landing/PressQuotes";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useLandingContent, usePublicOpeningHours } from "@/hooks/useLandingContent";
import heroImage from "@/assets/hero-carwash.jpg";

// Icon mapping for dynamic content
const iconMap: Record<string, LucideIcon> = {
  Droplets,
  Car,
  Sparkles,
  Shield,
  Timer,
  CheckCircle,
  Star,
  Clock,
};

const LandingPage = () => {
  useScrollAnimation();
  const { data: cmsContent, isLoading } = useLandingContent();
  const { data: facilityOpeningHours } = usePublicOpeningHours();

  // Fallback static content
  const defaultServices = [
    {
      id: "1",
      icon: "Droplets",
      title: "Utvändigt bas",
      description: "Exteriör ångtvätt av kaross, glas och fälgar",
      price: "370:-",
      popular: false,
    },
    {
      id: "2",
      icon: "Car",
      title: "Invändigt bas",
      description: "Dammsugning, avtorkning av paneler, fönsterputs och avspolning av mattor",
      price: "370:-",
      popular: false,
    },
    {
      id: "3",
      icon: "Sparkles",
      title: "In- och Utvändigt",
      description: "Komplett tvätt både in- och utvändigt för en helren bil",
      price: "fr. 690:-",
      popular: true,
    },
    {
      id: "4",
      icon: "Shield",
      title: "Rekond",
      description: "Fullständig rekonditionering för en bil som ny",
      price: "fr. 2500:-",
      popular: false,
    },
  ];

  const defaultBenefits = [
    {
      id: "1",
      icon: "Timer",
      title: "Spara Tid",
      description: "Vi tvättar din bil medan du gör dina ärenden i Kupolen",
    },
    {
      id: "2",
      icon: "CheckCircle",
      title: "Handtvätt",
      description: "Inga automatiska borstar som sliter på lacken",
    },
    {
      id: "3",
      icon: "Star",
      title: "Professionellt",
      description: "Erfarna biltvättare med öga för detaljer",
    },
    {
      id: "4",
      icon: "Shield",
      title: "Miljövänligt",
      description: "Vi använder miljöcertifierade produkter",
    },
  ];

  const defaultHero = {
    title: "När du gör ärenden tvättar vi din bil",
    highlightedText: "för hand",
    subtitle:
      "Professionell handtvätt vid Kupolen köpcentrum i Borlänge. Lämna bilen hos oss och hämta den skinande ren efter din shopping.",
    ctaText: "Boka biltvätt",
    secondaryCtaText: "Se våra tjänster",
    backgroundImage: null,
    backgroundVideo: null,
    backgroundVideoUrl: null,
  };

  const defaultCTA = {
    title: "Redo att ge din bil den omvårdnad den förtjänar?",
    subtitle: "Boka din tid idag och upplev skillnaden med professionell handtvätt.",
    buttonText: "Boka tid nu",
  };

  const defaultFAQ = {
    title: "Vanliga frågor",
    subtitle: "Har du frågor? Här hittar du svar på de vanligaste frågorna om våra tjänster.",
    items: [
      {
        id: "1",
        question: "Var kan jag tvätta bilen i Borlänge?",
        answer:
          "Du kan tvätta bilen hos Car Washap vid Kupolen köpcentrum i Borlänge. Vi erbjuder professionell handtvätt och finns på parkeringen vid ingång 3 & 4. Det är enkelt att hitta oss – lämna bilen och shoppa medan vi tvättar!",
      },
      {
        id: "2",
        question: "Vad kostar det att tvätta bilen i Borlänge?",
        answer:
          "Våra priser börjar på 370 kr för utvändig eller invändig bastvätt. En komplett in- och utvändig tvätt kostar från 690 kr. Vi erbjuder även rekond från 2500 kr. Se alla våra priser på prissidan.",
      },
      {
        id: "3",
        question: "Finns det handtvätt för bilar i Borlänge?",
        answer:
          "Ja! Car Washap är Borlänges handtvättsexperter. Till skillnad från automatiska tvätthallar tvättar vi alltid för hand, vilket är skonsammare mot lacken och ger ett bättre resultat.",
      },
      {
        id: "4",
        question: "Hur lång tid tar en biltvätt?",
        answer:
          "Det beror på vilken tjänst du väljer. En utvändig handtvätt tar cirka 45 minuter, medan en komplett tvätt tar upp till 90 minuter. Premium detailing kan ta upp till 3 timmar.",
      },
      {
        id: "5",
        question: "Var lämnar jag min bil vid Kupolen?",
        answer:
          "Vi finns på Kupolen köpcentrum, parkering ingång 3 & 4. Du lämnar helt enkelt bilen hos oss och kan sedan shoppa eller äta lunch medan vi arbetar.",
      },
      {
        id: "6",
        question: "Behöver jag boka tid i förväg?",
        answer:
          "Ja, vi rekommenderar att du bokar tid för att garantera att vi kan ta emot dig. Du kan enkelt boka online via vår bokningssida.",
      },
      {
        id: "7",
        question: "Vilka betalningsmetoder accepterar ni?",
        answer: "Vi accepterar Swish, kortbetalning och faktura. Betalning sker efter utförd tvätt.",
      },
      {
        id: "8",
        question: "Är er biltvätt miljövänlig?",
        answer:
          "Ja, vi använder miljöcertifierade produkter och förbrukar endast 5-10 liter vatten per tvätt, jämfört med 150-200 liter i en vanlig tvätthall. Vår ångtvätt är ett hållbart val för miljömedvetna bilägare i Borlänge.",
      },
      {
        id: "9",
        question: "Erbjuder ni bilrekond i Borlänge?",
        answer:
          "Ja, vi erbjuder fullständig bilrekond i Borlänge. Vår rekonditioneringstjänst inkluderar djuprengöring, polering och behandling för att få din bil att se ut som ny igen. Priser från 2500 kr.",
      },
      {
        id: "10",
        question: "Kan jag tvätta bilen när jag shoppar på Kupolen?",
        answer:
          "Absolut! Det är just det som är vår idé. Lämna bilen hos oss när du kommer till Kupolen, shoppa eller ät lunch, och hämta en skinande ren bil när du är klar. Perfekt för dig som vill spara tid!",
      },
    ],
  };
  // Use CMS content or fallback to defaults
  const hero = cmsContent?.hero || defaultHero;
  const services = cmsContent?.services?.items || defaultServices;
  const servicesTitle = cmsContent?.services?.title || "Välj den tvätt som passar dig";
  const servicesSubtitle =
    cmsContent?.services?.subtitle ||
    "Vi erbjuder allt från snabb utvändig tvätt till fullständig detailing. Alla våra tjänster utförs för hand av erfarna biltvättare.";
  const benefits = cmsContent?.benefits?.items || defaultBenefits;
  const benefitsTitle = cmsContent?.benefits?.title || "Varför välja Car Washap?";
  const cta = cmsContent?.cta || defaultCTA;
  const faq = cmsContent?.faq || defaultFAQ;
  const contact = cmsContent?.contact || {
    companyName: "Car Washap AB",
    phone: "+46-XXX-XXX-XXX",
    email: "info@carwashap.com",
    address: {
      street: "Kupolen Köpcentrum, Parkering ingång 3 & 4",
      city: "Borlänge",
      region: "Dalarna",
      postalCode: "784 50",
      country: "SE",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Kupolen+Borl%C3%A4nge+Parkering",
    },
    openingHours: {
      weekdays: "10:00 - 19:00",
      saturday: "10:00 - 18:00",
      sunday: "11:00 - 18:00",
    },
    socialMedia: {
      instagram: "https://www.instagram.com/carwashap/",
    },
  };

  // Use opening hours from Railway backend if available, otherwise fallback to CMS/default
  const openingHours = facilityOpeningHours || contact.openingHours;

  // Hero background: use CMS image if available, only fallback after loading completes
  const heroBackground = isLoading ? null : (hero.backgroundImage || heroImage);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SEOHead
        title="Car Washap | Biltvätt Borlänge – Handtvätt Kupolen"
        description="Bästa biltvätten i Borlänge! Professionell handtvätt vid Kupolen köpcentrum. Lämna bilen medan du shoppar. ✓ Miljövänlig ✓ Handtvätt ✓ Snabb service. Boka online!"
        canonicalPath="/"
        keywords="biltvätt borlänge, biltvätt i borlänge, handtvätt borlänge, bilrekond borlänge, kupolen biltvätt, biltvätt dalarna, tvätta bilen borlänge, bilvård borlänge, car wash borlänge, professionell biltvätt borlänge"
      />
      {/* JSON-LD Structured Data - LocalBusiness */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AutoWash",
            "@id": "https://carwashap.com/#localbusiness",
            name: "Car Washap - Biltvätt Borlänge",
            alternateName: ["Biltvätt Borlänge", "Car Washap", "Handtvätt Borlänge"],
            image: "https://carwashap.com/logo.png",
            description:
              "Professionell biltvätt i Borlänge. Handtvätt av bilar vid Kupolen köpcentrum. Vi tvättar din bil medan du shoppar. Miljövänlig biltvätt med minimal vattenförbrukning.",
            address: {
              "@type": "PostalAddress",
              streetAddress: contact.address.street,
              addressLocality: "Borlänge",
              addressRegion: "Dalarna",
              postalCode: contact.address.postalCode,
              addressCountry: "SE",
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: 60.4856,
              longitude: 15.4329,
            },
            areaServed: [
              { "@type": "City", name: "Borlänge" },
              { "@type": "City", name: "Falun" },
              { "@type": "State", name: "Dalarna" },
            ],
            telephone: contact.phone,
            email: contact.email,
            url: "https://carwashap.com",
            sameAs: [contact.socialMedia?.instagram || "https://www.instagram.com/carwashap/"],
            openingHoursSpecification: [
              {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                opens: openingHours.weekdays.split(" - ")[0],
                closes: openingHours.weekdays.split(" - ")[1],
              },
              {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: "Saturday",
                opens: openingHours.saturday.split(" - ")[0],
                closes: openingHours.saturday.split(" - ")[1],
              },
              {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: "Sunday",
                opens: openingHours.sunday.split(" - ")[0],
                closes: openingHours.sunday.split(" - ")[1],
              },
            ],
            priceRange: "$$",
            currenciesAccepted: "SEK",
            paymentAccepted: "Swish, Kort, Faktura",
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.8",
              reviewCount: "127",
            },
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: "Biltvättstjänster i Borlänge",
              itemListElement: [
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Utvändig Handtvätt",
                    description: "Professionell utvändig handtvätt av bil i Borlänge",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Invändig Biltvätt",
                    description: "Komplett invändig rengöring av bil i Borlänge",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Bilrekond Borlänge",
                    description: "Fullständig rekonditionering av bilar i Borlänge",
                  },
                },
              ],
            },
          }),
        }}
      />
      {/* JSON-LD Structured Data - WebSite with SearchAction */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Car Washap - Biltvätt Borlänge",
            url: "https://carwashap.com",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://carwashap.com/priser?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
      {/* JSON-LD Structured Data - FAQPage for Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.items.map((item: { question: string; answer: string }) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
              },
            })),
          }),
        }}
      />

      <PublicHeader />

      <main>
      {/* Hero Section — split editorial layout */}
      <section className="relative bg-background overflow-hidden">
        {/* Subtle decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        {/* Soft accent blob */}
        <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 pt-16 pb-20 lg:pt-24 lg:pb-28 relative">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* LEFT: Text */}
            <div className="lg:col-span-6 xl:col-span-7 order-2 lg:order-1">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-medium uppercase tracking-wider mb-6 animate-fade-in"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Miljöcertifierad biltvätt · Borlänge
              </div>

              <h1
                className="font-bold tracking-tight text-foreground mb-6 animate-fade-in-up leading-[1.05] text-5xl md:text-6xl lg:text-6xl xl:text-7xl"
                style={{ animationDelay: "0.1s" }}
              >
                {hero.title}{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-primary">{hero.highlightedText}</span>
                  <span className="absolute left-0 right-0 bottom-1 h-3 bg-primary/15 -z-0 rounded-sm" />
                </span>
              </h1>

              <p
                className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl animate-fade-in-up"
                style={{ animationDelay: "0.25s" }}
              >
                {hero.subtitle}
              </p>

              <div
                className="flex flex-col sm:flex-row gap-3 animate-fade-in-up"
                style={{ animationDelay: "0.4s" }}
              >
                <Button asChild size="lg" className="text-base px-7 py-6">
                  <Link to="/boka">
                    <Car className="mr-2 h-5 w-5" />
                    {hero.ctaText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="lg" className="text-base px-7 py-6 text-foreground hover:bg-foreground/5">
                  <a href="#tjanster">{hero.secondaryCtaText}</a>
                </Button>
              </div>

              <div
                className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground animate-fade-in-up"
                style={{ animationDelay: "0.55s" }}
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Mån–Fre {openingHours.weekdays.replace(" - ", "–").replace(":00", "")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Kupolen, Borlänge</span>
                </div>
              </div>
            </div>

            {/* RIGHT: Image card with floating stat */}
            <div className="lg:col-span-6 xl:col-span-5 relative animate-fade-in-up order-1 lg:order-2" style={{ animationDelay: "0.3s" }}>
              <div className="relative aspect-[4/3] sm:aspect-[5/4] lg:aspect-[5/6] w-full max-w-md mx-auto lg:ml-auto lg:mr-0">
                {/* Decorative offset frame */}
                <div className="absolute -inset-3 rounded-[2rem] border border-primary/30 -z-0 translate-x-3 translate-y-3" />

                {/* Image / video */}
                <div className="relative h-full w-full rounded-[2rem] overflow-hidden shadow-2xl bg-muted">
                  {hero.backgroundVideo || hero.backgroundVideoUrl ? (
                    <video
                      src={hero.backgroundVideo || hero.backgroundVideoUrl || undefined}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : heroBackground ? (
                    <img src={heroBackground} alt="Skonsam biltvätt med minimal vattenåtgång" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent" />
                </div>

                {/* Floating stat card — water savings */}
                <div className="absolute -left-4 sm:-left-8 bottom-8 bg-card border border-border rounded-2xl shadow-xl p-4 pr-5 flex items-center gap-3 max-w-[220px]">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Droplets className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground leading-none">5–10L</div>
                    <div className="text-xs text-muted-foreground mt-1">vatten per tvätt — vs 150L traditionellt</div>
                  </div>
                </div>

                {/* Floating eco badge top-right */}
                <div className="absolute -right-2 sm:-right-4 top-6 bg-foreground text-background rounded-full px-4 py-2 text-xs font-semibold shadow-lg flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  95% mindre vatten
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Stats Section */}
      <TrustSection />

      {/* Services Section */}
      <section id="tjanster" className="py-20 md:py-28 bg-background relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-on-scroll">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-2 block">
              Våra tjänster
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">{servicesTitle}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{servicesSubtitle}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {services.map((service, index) => {
              // Map CMS service titles to booking service IDs
              const serviceIdMap: Record<string, string> = {
                "Utvändigt bas": "exterior-basic",
                "Invändigt bas": "interior-basic",
                "In- och Utvändigt": "complete-basic",
                "Invändig rekond med utvändig tvätt": "complete-recond",
              };
              const serviceId = serviceIdMap[service.title] || undefined;

              return (
                <ServiceCard
                  key={service.id}
                  icon={iconMap[service.icon] || Sparkles}
                  title={service.title}
                  description={service.description}
                  price={service.price}
                  popular={service.popular}
                  index={index}
                  serviceId={serviceId}
                />
              );
            })}
          </div>

          <div className="text-center mt-12 animate-on-scroll">
            <Button asChild size="lg" variant="outline" className="text-lg">
              <Link to="/priser">
                Se alla priser
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="fordelar" className="py-20 md:py-28 bg-muted relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-on-scroll">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-2 block">Fördelar</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">{benefitsTitle}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Smart care for your car. More time for you.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <BenefitCard
                key={benefit.id}
                icon={iconMap[benefit.icon] || Star}
                title={benefit.title}
                description={benefit.description}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Sustainability Section */}
      <SustainabilitySection />

      {/* Press Quotes / Social Proof */}
      <PressQuotes />

      {/* CTA Band */}
      <CTABand title={cta.title} subtitle={cta.subtitle} buttonText={cta.buttonText} />

      {/* FAQ Section */}
      <section id="faq" className="py-20 md:py-28 bg-background relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-on-scroll">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-2 block">FAQ</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">{faq.title}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{faq.subtitle}</p>
          </div>

          <div className="max-w-3xl mx-auto animate-on-scroll">
            <Accordion type="single" collapsible className="space-y-4">
              {faq.items.map((item, index) => (
                <AccordionItem
                  key={item.id}
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-xl px-6 hover:border-primary/30 transition-colors"
                >
                  <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <div className="text-center mt-8">
              <Link to="/biltvatt-borlange" className="text-primary hover:underline font-medium">
                Läs mer om biltvätt i Borlänge →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="kontakt" className="py-20 md:py-28 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-on-scroll">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-2 block">Kontakt</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">Hitta oss</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Vi finns centralt beläget vid Kupolen köpcentrum i Borlänge.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="animate-on-scroll hover-lift">
              <CardContent className="p-8 space-y-6">
                <div>
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2 text-lg">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    Adress
                  </h3>
                  <a
                    href={contact.address.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors block ml-12"
                  >
                    {contact.address.street}
                    <br />
                    {contact.address.city}
                  </a>
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2 text-lg">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    Öppettider
                  </h3>
                  <div className="text-muted-foreground space-y-1 ml-12">
                    <p>Måndag - Fredag: {openingHours.weekdays}</p>
                    <p>Lördag: {openingHours.saturday}</p>
                    <p>Söndag: {openingHours.sunday}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-on-scroll stagger-2 hover-lift">
              <CardContent className="p-8 space-y-6">
                {contact.phone && (
                  <div>
                    <h3 className="font-bold text-foreground mb-4 flex items-center gap-2 text-lg">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      Telefon
                    </h3>
                    <a
                      href={`tel:${contact.phone.replace(/\s/g, '')}`}
                      className="text-muted-foreground hover:text-primary transition-colors ml-12 block"
                    >
                      {contact.phone}
                    </a>
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2 text-lg">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    E-post
                  </h3>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-muted-foreground hover:text-primary transition-colors ml-12 block"
                  >
                    {contact.email}
                  </a>
                </div>
                {contact.socialMedia.instagram && (
                  <div>
                    <h3 className="font-bold text-foreground mb-4 flex items-center gap-2 text-lg">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Instagram className="h-5 w-5 text-primary" />
                      </div>
                      Följ oss
                    </h3>
                    <a
                      href={contact.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors ml-12 block"
                    >
                      @{contact.socialMedia.instagram.split("/").filter(Boolean).pop()}
                    </a>
                  </div>
                )}
                <Button asChild className="w-full mt-4" size="lg">
                  <Link to="/boka">
                    Boka tid nu
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      </main>

      <PublicFooter variant="full" />
    </div>
  );
};

export default LandingPage;
