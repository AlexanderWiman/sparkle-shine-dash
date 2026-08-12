import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Car,
  Clock,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  Droplets,
  Leaf,
  ArrowRight,
  Star,
  Sparkles,
  ShoppingBag,
  Shield,
} from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";
import { useLandingContent, usePublicOpeningHours } from "@/hooks/useLandingContent";

const BiltvattKupolen = () => {
  const { data: cmsContent } = useLandingContent();
  const { data: facilityOpeningHours } = usePublicOpeningHours();

  const contact = cmsContent?.contact || {
    companyName: "Car Washap AB",
    phone: "076-946 03 03",
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
  };

  const openingHours = facilityOpeningHours || contact.openingHours;

  const faqItems = [
    {
      id: "1",
      question: "Var finns biltvätten vid Kupolen?",
      answer:
        "Car Washap ligger i parkeringsgaraget vid Kupolen köpcentrum i Borlänge, vid ingång 3 & 4. Du kör enkelt in och lämnar bilen direkt hos oss.",
    },
    {
      id: "2",
      question: "Kan jag shoppa medan bilen tvättas vid Kupolen?",
      answer:
        "Absolut! Det är hela vår idé. Lämna bilen hos oss och utnyttja tiden i Kupolens butiker, restauranger eller gym. Vi meddelar dig när bilen är klar.",
    },
    {
      id: "3",
      question: "Hur bokar jag biltvätt vid Kupolen?",
      answer:
        "Du bokar enkelt online via vår hemsida. Välj tid, tjänst och kör till Kupolen. Det går också bra att ringa oss direkt.",
    },
    {
      id: "4",
      question: "Vad kostar det att tvätta bilen vid Kupolen?",
      answer:
        "Utvändig handtvätt kostar från 370 kr, invändig från 370 kr, och komplett in- och utvändig tvätt från 690 kr. Se alla priser på vår prissida.",
    },
    {
      id: "5",
      question: "Vilka tvättalternativ finns vid Kupolen i Borlänge?",
      answer:
        "Vi erbjuder utvändig ångtvätt, invändig städning, komplett in- och utvändig tvätt samt fullständig rekonditionering. Alla utförda för hand.",
    },
    {
      id: "6",
      question: "Är biltvätten vid Kupolen miljövänlig?",
      answer:
        "Ja! Vi använder ångteknik som bara kräver 5-10 liter vatten per tvätt jämfört med 150-200 liter i en vanlig tvätthall. Alla produkter är miljöcertifierade.",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Biltvätt Kupolen Borlänge – Tvätta Bilen vid Kupolen | Car Washap"
        description="Tvätta bilen vid Kupolen i Borlänge! Car Washap erbjuder professionell handtvätt i parkeringsgaraget. ✓ Shoppa medan vi tvättar ✓ Miljövänligt ✓ Boka online."
        canonicalPath="/biltvatt-kupolen"
        keywords="biltvätt kupolen, tvätta bilen borlänge, biltvätt kupolen borlänge, tvätta bilen kupolen, car wash kupolen, biltvätt vid kupolen, kupolen biltvätt, handtvätt kupolen borlänge"
      />

      {/* LocalBusiness Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AutoWash",
            "@id": "https://carwashap.com/biltvatt-kupolen#localbusiness",
            name: "Car Washap - Biltvätt vid Kupolen",
            alternateName: [
              "Biltvätt Kupolen",
              "Tvätta bilen Kupolen",
              "Kupolen biltvätt Borlänge",
              "Tvätta bilen Borlänge",
            ],
            image: "https://carwashap.com/carwashap-logo.png",
            description:
              "Tvätta bilen vid Kupolen köpcentrum i Borlänge. Professionell handtvätt med ångteknik – shoppa medan vi tvättar din bil.",
            url: "https://carwashap.com/biltvatt-kupolen",
            telephone: contact.phone,
            email: contact.email,
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
              { "@type": "City", name: "Säter" },
              { "@type": "State", name: "Dalarna" },
            ],
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
            containedInPlace: {
              "@type": "ShoppingCenter",
              name: "Kupolen Köpcentrum",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Borlänge",
                addressRegion: "Dalarna",
                addressCountry: "SE",
              },
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.8",
              reviewCount: "127",
            },
          }),
        }}
      />

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqItems.map((item) => ({
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

      {/* BreadcrumbList Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Hem",
                item: "https://carwashap.com/",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Biltvätt Kupolen",
                item: "https://carwashap.com/biltvatt-kupolen",
              },
            ],
          }),
        }}
      />

      <PublicHeader />

      <main className="flex-1">
        {/* Breadcrumb Navigation */}
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Hem</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Biltvätt Kupolen</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Tvätta Bilen vid Kupolen i Borlänge
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Lämna bilen hos Car Washap i Kupolens parkering och shoppa medan vi tvättar. 
                Professionell handtvätt med miljövänlig ångteknik – helt utan automatborstar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="text-lg px-8">
                  <Link to="/boka">
                    <Car className="mr-2 h-5 w-5" />
                    Boka biltvätt vid Kupolen
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8">
                  <a href={`tel:${contact.phone.replace(/[^0-9+]/g, "")}`}>
                    <Phone className="mr-2 h-5 w-5" />
                    Ring oss
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content - SEO Text */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                Biltvätt vid Kupolen köpcentrum – Shoppa medan vi tvättar
              </h2>
              
              <p className="text-muted-foreground leading-relaxed mb-6">
                Vill du <strong>tvätta bilen i Borlänge</strong> på ett smart sätt? Car Washap ligger i 
                parkeringsgaraget vid <strong>Kupolen köpcentrum</strong>, vilket gör det möjligt att kombinera 
                biltvätten med shopping, lunch eller träning. Du lämnar enkelt bilen hos oss vid ingång 3 & 4, 
                och hämtar en skinande ren bil när du är klar med dina ärenden.
              </p>

              <p className="text-muted-foreground leading-relaxed mb-6">
                Vår <strong>biltvätt vid Kupolen</strong> utförs helt för hand med innovativ ångteknik. 
                Det innebär att din bil behandlas skonsamt utan automatborstar som kan repa lacken. 
                Vi är det perfekta valet för dig som söker en <strong>professionell biltvätt i Borlänge</strong> med 
                hög kvalitet och bekvämlighet.
              </p>

              <div className="bg-accent/30 border border-accent rounded-lg p-6 my-8">
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  Perfekt läge – mitt i Kupolen
                </h3>
                <p className="text-muted-foreground text-sm mb-0">
                  Kupolen är Borlänges största köpcentrum med över 80 butiker, restauranger och service. 
                  Medan Car Washap tar hand om din bil kan du passa på att handla, äta eller besöka gymmet. 
                  Aldrig har det varit så enkelt att <strong>tvätta bilen i Borlänge</strong>!
                </p>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 mt-12">
                Varför välja Car Washap vid Kupolen?
              </h2>

              <div className="grid md:grid-cols-2 gap-6 not-prose mb-8">
                <Card className="bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <ShoppingBag className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Shoppa & tvätta</h3>
                        <p className="text-sm text-muted-foreground">
                          Lämna bilen i Kupolens parkering och utnyttja tiden effektivt. Vi meddelar dig när bilen är klar.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Leaf className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Miljövänlig ångtvätt</h3>
                        <p className="text-sm text-muted-foreground">
                          Sparar 95% vatten jämfört med vanliga tvätthallar. Miljöcertifierade produkter utan skadliga kemikalier.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Sparkles className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Handtvätt – inga borstar</h3>
                        <p className="text-sm text-muted-foreground">
                          Erfarna biltvättare som tvättar för hand. Skonsammare mot lacken och bättre resultat.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Boka online enkelt</h3>
                        <p className="text-sm text-muted-foreground">
                          Välj tid och tjänst online. Kör till Kupolen vid din bokade tid – klart! Inga köer.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                Oavsett om du söker "<strong>biltvätt Kupolen</strong>", "<strong>tvätta bilen Borlänge</strong>" 
                eller "<strong>handtvätt vid Kupolen</strong>" – du hittar oss i parkeringsgaraget vid ingång 3 & 4. 
                Vi tar emot kunder från hela Dalarna-regionen och erbjuder en bekväm biltvätt utan att du behöver 
                vänta. Läs mer om vår{" "}
                <Link to="/biltvatt-borlange" className="text-primary hover:underline">
                  biltvätt i Borlänge
                </Link>.
              </p>
            </div>
          </div>
        </section>

        {/* Services Quick Overview */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-8">
              Tjänster vid Kupolen
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <Card className="bg-card text-center">
                <CardContent className="p-6">
                  <Droplets className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">Utvändig bas</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ångtvätt av kaross, glas, fälgar och dörrgångar
                  </p>
                  <p className="text-xl font-bold text-primary">370:-</p>
                </CardContent>
              </Card>

              <Card className="bg-card text-center">
                <CardContent className="p-6">
                  <Sparkles className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">Invändig bas</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Dammsugning, paneler, fönsterputs och mattor
                  </p>
                  <p className="text-xl font-bold text-primary">370:-</p>
                </CardContent>
              </Card>

              <Card className="bg-card text-center border-primary border-2">
                <CardContent className="p-6">
                  <div className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full inline-block mb-4">
                    Populär
                  </div>
                  <Car className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">In- & utvändig</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Komplett tvätt för en helren bil
                  </p>
                  <p className="text-xl font-bold text-primary">fr. 690:-</p>
                </CardContent>
              </Card>

              <Card className="bg-card text-center">
                <CardContent className="p-6">
                  <Star className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">Rekond</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Invändig rekond med utvändig tvätt
                  </p>
                  <p className="text-xl font-bold text-primary">fr. 2500:-</p>
                </CardContent>
              </Card>
            </div>
            <div className="text-center mt-8">
              <Button asChild variant="outline" size="lg">
                <Link to="/priser">Se alla priser och tjänster</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-8">
                Vanliga frågor om biltvätt vid Kupolen
              </h2>
              <Accordion type="single" collapsible className="space-y-3">
                {faqItems.map((item) => (
                  <AccordionItem
                    key={item.id}
                    value={item.id}
                    className="bg-card border rounded-lg px-4"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-4">
                      <span className="font-medium">{item.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* NAP Block & Map */}
        <section className="py-12 bg-muted/30" id="kontakt">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-8">
                Hitta oss vid Kupolen i Borlänge
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="bg-card">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-6">Kontaktuppgifter</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">Car Washap</p>
                          <p className="text-muted-foreground">{contact.address.street}</p>
                          <p className="text-muted-foreground">
                            {contact.address.postalCode} {contact.address.city}
                          </p>
                          <p className="text-muted-foreground">{contact.address.region}, Sverige</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                        <a
                          href={`tel:${contact.phone.replace(/[^0-9+]/g, "")}`}
                          className="text-foreground hover:text-primary transition-colors"
                        >
                          {contact.phone}
                        </a>
                      </div>

                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-foreground hover:text-primary transition-colors"
                        >
                          {contact.email}
                        </a>
                      </div>

                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-foreground mb-1">Öppettider</p>
                          <p className="text-sm text-muted-foreground">
                            Måndag–Fredag: {openingHours.weekdays}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Lördag: {openingHours.saturday}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Söndag: {openingHours.sunday}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t">
                      <Button asChild className="w-full">
                        <Link to="/boka">
                          <Car className="mr-2 h-4 w-4" />
                          Boka biltvätt vid Kupolen
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card overflow-hidden">
                  <div className="h-full min-h-[300px] bg-muted flex items-center justify-center">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1789.8768832457927!2d15.432187!3d60.485672!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46674f5c7eda31c9%3A0x7e8e3e8e8e8e8e8e!2sKupolen!5e0!3m2!1ssv!2sse!4v1234567890"
                      width="100%"
                      height="100%"
                      style={{ border: 0, minHeight: "300px" }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Car Washap vid Kupolen köpcentrum Borlänge"
                    />
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Redo att tvätta bilen vid Kupolen?
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Boka online, kör till Kupolen och shoppa medan vi tar hand om din bil. Enklare blir det inte!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                <Link to="/boka">
                  <Car className="mr-2 h-5 w-5" />
                  Boka biltvätt nu
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                <a href={`tel:${contact.phone.replace(/[^0-9+]/g, "")}`}>
                  <Phone className="mr-2 h-5 w-5" />
                  Ring oss
                </a>
              </Button>
            </div>
            <p className="mt-4 opacity-70">
              Läs mer om vår{" "}
              <Link to="/biltvatt-borlange" className="underline hover:opacity-100">
                biltvätt i Borlänge
              </Link>
            </p>
          </div>
        </section>
      </main>

      <PublicFooter variant="full" />
    </div>
  );
};

export default BiltvattKupolen;
