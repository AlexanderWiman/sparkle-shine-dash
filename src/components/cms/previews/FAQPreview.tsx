import { FAQContent } from "@/lib/landingContentApi";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQPreviewProps {
  data: FAQContent | null;
}

const FAQPreview = ({ data }: FAQPreviewProps) => {
  if (!data) return <PreviewPlaceholder section="FAQ" />;

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">{data.title}</h2>
          <p className="text-muted-foreground">{data.subtitle}</p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <Accordion type="single" collapsible className="space-y-2">
            {data.items.map((item) => (
              <AccordionItem 
                key={item.id} 
                value={item.id}
                className="bg-card border rounded-lg px-4"
              >
                <AccordionTrigger className="text-left hover:no-underline py-3">
                  <span className="font-medium text-sm">{item.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm pb-3">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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

export default FAQPreview;
