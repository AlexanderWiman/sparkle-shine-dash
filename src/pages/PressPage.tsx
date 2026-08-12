import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Newspaper, Calendar } from "lucide-react";
import { fetchPressContent, PressContent, PressArticle } from "@/lib/landingContentApi";

// Default content
const defaultArticles: PressArticle[] = [
  {
    id: "1",
    title: "Car Washap AB utmanar biltvättsmarknaden med unikt koncept – med bara 5-10 liter vatten per tvätt",
    source: "Dagens Infrastruktur",
    date: "2025-12-02",
    dateFormatted: "2 december 2025",
    description:
      "Car Washap erbjuder vatteneffektiv handtvätt medan kunderna shoppar. Målet är att expandera till 120 anläggningar i Sverige inom fyra år.",
    url: "https://www.dagensinfrastruktur.se/2025/12/02/car-washap-ab-utmanar-biltvattsmarknaden-med-unikt-koncept-med-bara-5-10-liter-vatten-per-tvatt/",
  },
  {
    id: "2",
    title: "Car Washap utmanar biltvättsmarknaden med unikt koncept – utan utsläpp och med minimal vattenåtgång",
    source: "Movexum",
    date: "2025-12-02",
    dateFormatted: "2 december 2025",
    description:
      "Ove och Malin Lindholms startup erbjuder miljövänlig handtvätt vid köpcentrum, med bara 5-10 liter vatten jämfört med traditionella 300 liter.",
    url: "https://movexum.se/nyheter/washap-utmanar-biltvattsmarknaden-med-unikt-koncept/",
  },
  {
    id: "3",
    title: "Malin öppnar biltvätt vid Kupolen – första i Sverige",
    source: "Borlänge Tidning",
    date: "2025-10-15",
    dateFormatted: "Oktober 2025",
    description:
      "En ny biltvättsanläggning har öppnat vid köpcentret Kupolen i Borlänge, med fyra anställda som första steget i en planerad nationell expansion.",
    url: "https://www.borlangetidning.se/artikel/malin-oppnar-biltvatt-vid-kupolen-forsta-i-sverige/",
  },
  {
    id: "4",
    title: "Här kan bilar handtvättas – nya planer vid Kupolen",
    source: "Borlänge Tidning",
    date: "2025-09-01",
    dateFormatted: "2025",
    description:
      "Tidiga rapporter om ansökan om tillfälligt bygglov för att etablera en vatteneffektiv handtvättsanläggning med fyra anställda på Kupolens parkering.",
    url: "https://www.borlangetidning.se/artikel/har-kan-bilar-handtvattas-nya-planer-vid-kupolen/",
  },
];

const defaultContent: PressContent = {
  heroTitle: "Car Washap i Nyheterna",
  heroSubtitle:
    "Vi är stolta över att uppmärksammas för vårt arbete med att revolutionera biltvättsbranschen genom hållbara och miljövänliga metoder.",
  articlesTitle: "Senaste Nyheterna",
  articles: defaultArticles,
  contactTitle: "Presskontakt",
  contactDescription:
    "Är du journalist och vill veta mer om Car Washap? Kontakta oss för intervjuer, pressbilder eller mer information.",
  contactCompany: "Car Washap AB",
  contactEmail: "info@carwashap.com",
};

// Generate JSON-LD schema for press articles
const generateArticleSchema = (articles: PressArticle[]) => {
  const itemListElements = articles.map((article, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "NewsArticle",
      headline: article.title,
      description: article.description,
      datePublished: article.date,
      url: article.url,
      publisher: {
        "@type": "Organization",
        name: article.source,
      },
      about: {
        "@type": "Organization",
        name: "Car Washap AB",
        url: "https://carwashap.se",
      },
    },
  }));

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Car Washap i Media",
    description: "Nyhetsartiklar om Car Washap och vår miljövänliga biltvättstjänst",
    numberOfItems: articles.length,
    itemListElement: itemListElements,
  };
};

const PressPage = () => {
  const { data: content, isLoading } = useQuery({
    queryKey: ["press-content"],
    queryFn: fetchPressContent,
  });

  const press = content || defaultContent;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const articleSchema = generateArticleSchema(press.articles);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <PublicHeader />
        <main className="flex-1 container mx-auto px-4 py-16 space-y-8">
          <Skeleton className="h-12 w-64 mx-auto" />
          <Skeleton className="h-6 w-96 mx-auto" />
          <div className="space-y-6 max-w-4xl mx-auto">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </main>
        <PublicFooter variant="full" />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`Press & Media – ${press.heroTitle}`}
        description={press.heroSubtitle}
        canonicalPath="/press"
        keywords="Car Washap press, nyheter biltvätt, miljövänlig biltvätt media, hållbar biltvätt Borlänge"
      />

      {/* Article Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <div className="min-h-screen flex flex-col bg-background">
        <PublicHeader />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-primary/10 via-background to-accent/5 py-16 md:py-24">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
                  <Newspaper className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-primary">Press & Media</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                  {press.heroTitle}
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground">{press.heroSubtitle}</p>
              </div>
            </div>
          </section>

          {/* Press Articles */}
          <section className="py-16 md:py-24">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
                  {press.articlesTitle}
                </h2>

                <div className="space-y-6">
                  {press.articles.map((article) => (
                    <Card
                      key={article.id}
                      className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30"
                    >
                      <CardContent className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                              <span className="font-medium text-primary">{article.source}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {article.dateFormatted}
                              </span>
                            </div>
                            <h3 className="text-xl md:text-2xl font-semibold mb-3 group-hover:text-primary transition-colors">
                              {article.title}
                            </h3>

                            <p className="text-muted-foreground mb-4">{article.description}</p>

                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                            >
                              Läs artikeln
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Press Contact */}
          <section className="py-16 md:py-24 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-6">{press.contactTitle}</h2>
                <p className="text-muted-foreground mb-8">{press.contactDescription}</p>
                <div className="bg-background rounded-xl p-6 shadow-sm border border-border/50">
                  <p className="font-semibold text-lg mb-2">{press.contactCompany}</p>
                  <a href={`mailto:${press.contactEmail}`} className="text-primary hover:underline">
                    {press.contactEmail}
                  </a>
                </div>
              </div>
            </div>
          </section>
        </main>

        <PublicFooter variant="full" />
      </div>
    </>
  );
};

export default PressPage;