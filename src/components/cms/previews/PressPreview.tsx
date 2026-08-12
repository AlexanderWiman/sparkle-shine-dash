import { PressContent } from "@/lib/landingContentApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Newspaper, Mail } from "lucide-react";

interface PressPreviewProps {
  data: PressContent | null;
}

const PressPreview = ({ data }: PressPreviewProps) => {
  if (!data) return <PreviewPlaceholder section="Press" />;

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="py-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">{data.heroTitle}</h1>
          <p className="text-muted-foreground">{data.heroSubtitle}</p>
        </div>
      </section>

      {/* Articles */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-center mb-6">{data.articlesTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {data.articles.slice(0, 4).map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Newspaper className="h-3 w-3" />
                    <span>{article.source}</span>
                    <span>•</span>
                    <span>{article.dateFormatted}</span>
                  </div>
                  <CardTitle className="text-base">{article.title}</CardTitle>
                  <CardDescription className="text-xs line-clamp-2">
                    {article.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs gap-1">
                    Läs artikel
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl font-bold mb-2">{data.contactTitle}</h2>
          <p className="text-muted-foreground text-sm mb-4">{data.contactDescription}</p>
          <div className="text-sm">
            <p className="font-medium">{data.contactCompany}</p>
            <Button variant="link" size="sm" className="h-auto p-0 gap-1">
              <Mail className="h-3 w-3" />
              {data.contactEmail}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

const PreviewPlaceholder = ({ section }: { section: string }) => (
  <div className="flex items-center justify-center h-64 bg-muted/50 rounded-lg border-2 border-dashed">
    <p className="text-muted-foreground">Laddar {section}...</p>
  </div>
);

export default PressPreview;
