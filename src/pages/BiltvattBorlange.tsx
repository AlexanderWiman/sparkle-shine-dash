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
  Shield,
  Sparkles,
} from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";
import { useLandingContent, usePublicOpeningHours } from "@/hooks/useLandingContent";

const BiltvattBorlange = () => {
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
      question: "Var ligger Car Washap i Borlänge?",
      answer:
        "Vi finns vid Kupolen köpcentrum i Borlänge, parkering vid ingång 3 & 4. Det är enkelt att hitta oss – lämna bilen och shoppa medan vi tvättar!",
    },
    {
      id: "2",
      question: "Vad kostar biltvätt hos Car Washap i Borlänge?",
      answer:
        "Utvändig handtvätt kostar från 370 kr, invändig från 370 kr, och komplett in- och utvändig tvätt från 690 kr. Se alla priser på vår prissida.",
    },
    {
      id: "3",
      question: "Är Car Washap samma som Wash Up i Borlänge?",
      answer:
        "Ja! Många söker efter 'Wash Up Borlänge' eller 'Washap Borlänge' – båda sökningar leder till oss. Car Washap är det officiella namnet på vår biltvätt vid Kupolen.",
    },
    {
      id: "4",
      question: "Är biltvätten miljövänlig?",
      answer:
        "Absolut! Vi använder ångteknik som bara förbrukar 5-10 liter vatten per tvätt, jämfört med 150-200 liter i traditionella tvätthallar. Vi använder endast miljöcertifierade produkter.",
    },
    {
      id: "5",
      question: "Behöver jag boka tid för biltvätt i Borlänge?",
      answer:
        "Vi rekommenderar att du bokar online för att garantera en tid som passar dig. Du kan enkelt boka via vår bokningssida.",
    },
    {
      id: "6",
      question: "Hur lång tid tar en biltvätt?",
      answer:
        "En utvändig handtvätt tar cirka 45 minuter, komplett tvätt upp till 90 minuter. Perfekt tid att shoppa på Kupolen!",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Biltvätt Borlänge – Handtvätt vid Kupolen | Car Washap"
        description="Letar du efter biltvätt i Borlänge? Car Washap erbjuder miljövänlig handtvätt vid Kupolen. ✓ Ångteknik ✓ Handtvätt ✓ Boka online. Tvätta bilen i Borlänge enkelt!"
        canonicalPath="/biltvatt-borlange"
        keywords="biltvätt borlänge, tvätta bilen borlänge, biltvätt kupolen, wash up borlänge, washap borlänge, car wash borlänge, biltvätt nära mig, miljövänlig biltvätt borlänge, handtvätt borlänge, bilrekond borlänge, tvätta bilen kupolen"
      />

      {/* LocalBusiness Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AutoWash",
            "@id": "https://carwashap.com/biltvatt-borlange#localbusiness",
            name: "Car Washap - Biltvätt Borlänge",
            alternateName: [
              "Washap Borlänge",
              "Wash Up Borlänge",
              "Biltvätt Kupolen",
              "Handtvätt Borlänge",
            ],
            image: "https://carwashap.com/carwashap-logo.png",
            description:
              "Professionell biltvätt i Borlänge vid Kupolen köpcentrum. Miljövänlig handtvätt med ångteknik. Lämna bilen medan du shoppar.",
            url: "https://carwashap.com/biltvatt-borlange",
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
              { "@type": "City", name: "Ludvika" },
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
                name: "Biltvätt Borlänge",
                item: "https://carwashap.com/biltvatt-borlange",
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
                <BreadcrumbPage>Biltvätt Borlänge</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Biltvätt i Borlänge – Professionell Handtvätt vid Kupolen
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Välkommen till Car Washap, Borlänges moderna biltvätt vid Kupolen köpcentrum. 
                Vi erbjuder miljövänlig handtvätt med ångteknik medan du shoppar eller tar en fika.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="text-lg px-8">
                  <Link to="/boka">
                    <Car className="mr-2 h-5 w-5" />
                    Boka biltvätt nu
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8">
                  <Link to="/priser">Se våra priser</Link>
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
                Din lokala biltvätt i Borlänge, Dalarna
              </h2>
              
              <p className="text-muted-foreground leading-relaxed mb-6">
                Letar du efter en <strong>biltvätt i Borlänge</strong>? Car Washap är det självklara valet för dig som värdesätter 
                kvalitet och miljö. Vi finns strategiskt placerade vid <strong>Kupolen köpcentrum</strong>, vilket gör det enkelt 
                att kombinera biltvätten med shopping eller lunch. Vår <strong>miljövänliga biltvätt i Borlänge</strong> använder 
                innovativ ångteknik som sparar upp till 95% vatten jämfört med traditionella tvätthallar.
              </p>

              <p className="text-muted-foreground leading-relaxed mb-6">
                Som den ledande <strong>car wash i Borlänge</strong> erbjuder vi professionell handtvätt utförd av erfarna 
                biltvättare. Till skillnad från automatiska tvätthallar tar vi hand om din bil för hand, vilket är skonsammare 
                mot lacken och ger ett betydligt bättre resultat. Vi är stolta över att vara det miljövänliga alternativet för 
                <strong> biltvätt nära mig</strong> i Dalarna-regionen.
              </p>

              <div className="bg-accent/30 border border-accent rounded-lg p-6 my-8">
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Washap eller Wash Up – samma biltvätt!
                </h3>
                <p className="text-muted-foreground text-sm mb-0">
                  Många söker efter "<strong>Wash Up Borlänge</strong>" eller "<strong>Washap Borlänge</strong>" – båda 
                  sökningarna leder till oss! Car Washap är det officiella namnet på vår populära biltvätt vid Kupolen. 
                  Oavsett hur du stavar det hittar du Borlänges bästa handtvättsanläggning här.
                </p>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 mt-12">
                Varför välja vår biltvätt vid Kupolen?
              </h2>

              <div className="grid md:grid-cols-2 gap-6 not-prose mb-8">
                <Card className="bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Leaf className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Miljövänlig ångtvätt</h3>
                        <p className="text-sm text-muted-foreground">
                          Endast 5-10 liter vatten per tvätt. Miljöcertifierade produkter utan skadliga kemikalier.
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
                        <h3 className="font-semibold text-foreground mb-2">Professionell handtvätt</h3>
                        <p className="text-sm text-muted-foreground">
                          Erfarna biltvättare med öga för detaljer. Ingen automatisk borste som sliter på lacken.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Clock className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Spara tid vid Kupolen</h3>
                        <p className="text-sm text-muted-foreground">
                          Lämna bilen hos oss och shoppa, ät lunch eller träna. Hämta en skinande ren bil efteråt!
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
                        <h3 className="font-semibold text-foreground mb-2">Kvalitetsgaranti</h3>
                        <p className="text-sm text-muted-foreground">
                          Nöjd-kund-garanti på alla våra tjänster. 4.8 i betyg från våra kunder i Borlänge.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                Vårt läge vid <strong>Kupolen i Borlänge</strong> gör oss till det perfekta valet för alla som vill 
                <strong> tvätta bilen i Borlänge</strong>. Vi tar emot kunder från Borlänge, Falun, Säter, Ludvika och hela länet. Oavsett om du 
                söker efter <strong>biltvätt nära mig</strong> eller specifikt efter{" "}
                <Link to="/biltvatt-kupolen" className="text-primary hover:underline">biltvätt Kupolen</Link> – 
                vi finns här för dig med öppettider som passar din vardag.
              </p>
            </div>
          </div>
        </section>

        {/* Services Quick Overview */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-8">
              Våra biltvättstjänster i Borlänge
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
                Vanliga frågor om biltvätt i Borlänge
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
                Hitta till Car Washap i Borlänge
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                {/* NAP Block */}
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
                          Boka din biltvätt
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Google Maps Embed Placeholder */}
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
                      title="Car Washap Borlänge - Kupolen köpcentrum"
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
              Redo att ge din bil den bästa tvätten i Borlänge?
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Boka online och lämna bilen vid Kupolen. Vi tar hand om resten medan du gör dina ärenden.
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
          </div>
        </section>
      </main>

      <PublicFooter variant="full" />
    </div>
  );
};

export default BiltvattBorlange;
