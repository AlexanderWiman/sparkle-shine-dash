import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import carwashapLogo from "@/assets/carwashap-logo.png";

const InvestorHeader = () => {
  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-md">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={carwashapLogo} alt="Car Washap" className="h-10 w-auto" />
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm">
          <a href="#impact" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Impact</a>
          <a href="#solution" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Solution</a>
          <a href="#market" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Market</a>
          <a href="#traction" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Traction</a>
          <a href="#contact" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Contact</a>
        </div>
        <Button
          asChild
          size="sm"
          className="font-semibold bg-primary-foreground text-primary hover:bg-primary-foreground/90"
        >
          <a href="#contact">Contact IR</a>
        </Button>
      </nav>
    </header>
  );
};

export default InvestorHeader;
