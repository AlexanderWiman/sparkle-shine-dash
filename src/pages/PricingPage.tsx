import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Car, Sparkles, Info } from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";
import { fetchPricingContent, PricingContent } from "@/lib/landingContentApi";

// Default content fallback
const defaultContent: PricingContent = {
  heroTitle: "Prislista för Biltvätt i Borlänge",
  heroSubtitle: "Transparenta priser utan dolda avgifter. Vi ser till att du får mer kvalitetstid i livet.",
  exteriorService: {
    title: "Utvändigt bas",
    price: 370,
    description: "Exteriör ångtvätt av kaross, glas och fälgar",
    addons: [
      { name: "Asfaltsbortagning", price: 80 },
      { name: "Ångtvätt av dörrgångar", price: 50 },
      { name: "Sprayvax", price: 150 },
    ],
  },
  interiorService: {
    title: "Invändigt bas",
    price: 370,
    description: "Dammsugning, avtorkning av paneler, fönsterputs invändigt, avspolning av gummimattor/dammsugning av textilmattor",
    addons: [
      { name: "Sätestvätt framstol", price: 250 },
      { name: "Sätestvätt baksäte", price: 450 },
    ],
  },
  comboServices: [
    { title: "In- och Utvändigt Bas", price: "fr. 690", numericPrice: 690, description: "Komplett utvändig och invändig rengöring", popular: true },
    { title: "Rekond", price: "fr. 2500", numericPrice: 2500, description: "Fullständig rekonditionering av din bil", popular: false },
  ],
  extraServices: [
    { name: "Motortvätt", price: "395:-" },
    { name: "Storbilstillägg (SUV, skåpbil)", price: "+25%" },
    { name: "Extra smutsig bil", price: "+25%" },
  ],
  note: "OBS! Sanering av hund/katthår ingår inte i vanlig tvätt. Pris offereras separat.",
  ctaTitle: "Redo att boka din biltvätt?",
  ctaSubtitle: "Boka din tid online och lämna bilen hos oss medan du gör dina ärenden vid Kupolen.",
  ctaButtonText: "Boka biltvätt nu",
};

const PricingPage = () => {
  const { data: content, isLoading } = useQuery({
    queryKey: ["pricing-content"],
    queryFn: fetchPricingContent,
  });

  const pricing = content || defaultContent;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Build all services for structured data
  const allServices = [
    {
      name: pricing.exteriorService.title,
      description: pricing.exteriorService.description,
      price: pricing.exteriorService.price,
    },
    {
      name: pricing.interiorService.title,
      description: pricing.interiorService.description,
      price: pricing.interiorService.price,
    },
    ...pricing.comboServices.map((s) => ({
      name: s.title,
      description: s.description,
      price: s.numericPrice,
    })),
  ];

  // JSON-LD structured data for services
  const servicesSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Car Washap",
    description: "Professionell handtvätt av bilar vid Kupolen köpcentrum i Borlänge",
    url: "https://carwashap.com",
    telephone: "+46-XXX-XXXXXX",
    email: "info@carwashap.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Kupolen, Parkering ingång 3 & 4",
      addressLocality: "Borlänge",
      addressRegion: "Dalarna",
      postalCode: "784 50",
      addressCountry: "SE",
    },
    priceRange: `${pricing.exteriorService.price} SEK - ${pricing.comboServices[pricing.comboServices.length - 1]?.numericPrice || 2500} SEK`,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Biltvättstjänster",
      itemListElement: allServices.map((service, index) => ({
        "@type": "Offer",
        position: index + 1,
        itemOffered: {
          "@type": "Service",
          name: service.name,
          description: service.description,
        },
        price: service.price,
        priceCurrency: "SEK",
      })),
    },
  };

  // FAQ Schema for pricing questions
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Vad kostar en utvändig biltvätt hos Car Washap?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `En utvändig bastvätt kostar ${pricing.exteriorService.price} kr och inkluderar ${pricing.exteriorService.description.toLowerCase()}. Tillägg finns också.`,
        },
      },
      {
        "@type": "Question",
        name: "Vad kostar en invändig biltvätt?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `En invändig bastvätt kostar ${pricing.interiorService.price} kr och inkluderar ${pricing.interiorService.description.toLowerCase()}.`,
        },
      },
      {
        "@type": "Question",
        name: "Finns det paketpriser för in- och utvändig tvätt?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Ja! ${pricing.comboServices.map(s => `${s.title} finns ${s.price}`).join(". ")}.`,
        },
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <div className="container mx-auto px-4 py-16 space-y-8">
          <Skeleton className="h-12 w-96 mx-auto" />
          <Skeleton className="h-6 w-64 mx-auto" />
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Priser Biltvätt Borlänge – Car Washap"
        description={`Se våra priser för professionell handtvätt vid Kupolen. Utvändig tvätt från ${pricing.exteriorService.price} kr, invändig från ${pricing.interiorService.price} kr. Transparenta priser utan dolda avgifter.`}
        canonicalPath="/priser"
        keywords="biltvätt pris borlänge, handtvätt kostnad, bilrekond pris, kupolen biltvätt prislista, utvändig tvätt pris, invändig biltvätt"
      />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <PublicHeader />

      {/* Hero */}
      <header className="bg-gradient-to-br from-primary/10 via-background to-accent/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {pricing.heroTitle}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {pricing.heroSubtitle}
          </p>
        </div>
      </header>

      <main>
        {/* Main Services */}
        <section className="py-16" aria-labelledby="main-services-heading">
          <div className="container mx-auto px-4">
            <h2 id="main-services-heading" className="sr-only">
              Våra huvudtjänster
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Exterior */}
              <article>
                <Card className="relative overflow-hidden h-full">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"
                          aria-hidden="true"
                        >
                          <Car className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">
                            {pricing.exteriorService.title}
                          </CardTitle>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-bold text-primary">
                          {pricing.exteriorService.price}:-
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{pricing.exteriorService.description}</p>
                    <div className="border-t border-border pt-4">
                      <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                        Tillägg
                      </h4>
                      <ul className="space-y-2" role="list">
                        {pricing.exteriorService.addons.map((addon, index) => (
                          <li key={index} className="flex items-center justify-between text-sm">
                            <span>{addon.name}</span>
                            <span className="font-medium">+{addon.price}:-</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </article>

              {/* Interior */}
              <article>
                <Card className="relative overflow-hidden h-full">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"
                          aria-hidden="true"
                        >
                          <Sparkles className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">
                            {pricing.interiorService.title}
                          </CardTitle>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-bold text-primary">
                          {pricing.interiorService.price}:-
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{pricing.interiorService.description}</p>
                    <div className="border-t border-border pt-4">
                      <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                        Tillägg
                      </h4>
                      <ul className="space-y-2" role="list">
                        {pricing.interiorService.addons.map((addon, index) => (
                          <li key={index} className="flex items-center justify-between text-sm">
                            <span>{addon.name}</span>
                            <span className="font-medium">{addon.price}:-</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </article>
            </div>
          </div>
        </section>

        {/* Combo Packages */}
        <section className="py-16 bg-muted/30" aria-labelledby="combo-heading">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 id="combo-heading" className="text-3xl font-bold text-foreground mb-4">
                In- och Utvändigt Paket
              </h2>
              <p className="text-muted-foreground">Spara pengar med våra kombinationspaket</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {pricing.comboServices.map((service, index) => (
                <article key={index}>
                  <Card
                    className={`relative overflow-hidden h-full ${
                      service.popular ? "border-primary border-2" : ""
                    }`}
                  >
                    {service.popular && (
                      <Badge className="absolute top-4 right-4 bg-primary">Populär</Badge>
                    )}
                    <CardHeader>
                      <CardTitle className="text-xl">
                        {service.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-primary mb-2">{service.price}</div>
                      <p className="text-muted-foreground">{service.description}</p>
                      <Button asChild className="w-full mt-6">
                        <Link to="/boka" aria-label={`Boka ${service.title}`}>
                          Boka
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Extra Services */}
        <section className="py-16" aria-labelledby="extra-services-heading">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2
                id="extra-services-heading"
                className="text-2xl font-bold text-foreground mb-8 text-center"
              >
                Övriga tjänster och tillägg
              </h2>
              <Card>
                <CardContent className="p-6">
                  <ul className="divide-y divide-border" role="list">
                    {pricing.extraServices.map((service, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                      >
                        <span className="font-medium">{service.name}</span>
                        <span className="text-primary font-semibold">{service.price}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Note */}
              <aside className="mt-8 p-4 bg-muted rounded-lg flex gap-3" role="note">
                <Info
                  className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <p className="text-sm text-muted-foreground">
                  <strong>OBS!</strong> {pricing.note.replace("OBS!", "").trim()}
                </p>
              </aside>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary text-primary-foreground" aria-labelledby="cta-heading">
          <div className="container mx-auto px-4 text-center">
            <h2 id="cta-heading" className="text-3xl font-bold mb-4">
              {pricing.ctaTitle}
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              {pricing.ctaSubtitle}
            </p>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link to="/boka">{pricing.ctaButtonText}</Link>
            </Button>
            <p className="mt-4 text-primary-foreground/70">
              Läs mer om vår{" "}
              <Link to="/biltvatt-borlange" className="underline hover:text-primary-foreground">
                biltvätt i Borlänge
              </Link>
            </p>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};

export default PricingPage;