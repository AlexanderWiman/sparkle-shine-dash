import { LucideIcon } from "lucide-react";

interface BenefitCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}

const BenefitCard = ({ icon: Icon, title, description, index }: BenefitCardProps) => {
  return (
    <div
      className={`animate-on-scroll stagger-${index + 1} text-center p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover-lift`}
    >
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center mx-auto mb-4 group">
        <Icon className="h-7 w-7 text-primary animate-bounce-subtle" style={{ animationDelay: `${index * 0.2}s` }} />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
};

export default BenefitCard;
