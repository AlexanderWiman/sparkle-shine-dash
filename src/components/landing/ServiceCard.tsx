import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

export interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  price: string;
  popular?: boolean;
  index: number;
  serviceId?: string;
}

const ServiceCard = ({ icon: Icon, title, description, price, popular = false, index, serviceId }: ServiceCardProps) => {
  const linkTo = serviceId ? `/boka?service=${serviceId}` : "/boka";

  return (
    <div 
      className={`animate-on-scroll stagger-${index + 1}`}
      style={{ animationDelay: `${index * 0.15}s` }}
    >
      <Link to={linkTo} className="block h-full">
        <Card className={`group hover-lift relative overflow-hidden h-full flex flex-col cursor-pointer ${popular ? "gradient-border" : ""}`}>
          {popular && (
            <div className="absolute top-4 right-4 z-10">
              <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                Populär
              </span>
            </div>
          )}
          <CardContent className="p-6 text-center relative z-10 flex flex-col flex-1">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">
              {title}
            </h3>
            <p className="text-muted-foreground mb-4 leading-relaxed">{description}</p>
            <span className="inline-flex items-center text-lg text-primary font-bold bg-primary/10 px-4 py-2 rounded-full mt-auto mx-auto">
              {price}
            </span>
          </CardContent>
          {/* Hover gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Card>
      </Link>
    </div>
  );
};

export default ServiceCard;
