import { Link } from "react-router-dom";

const InvestorFooter = () => {
  return (
    <footer className="bg-foreground text-background py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div className="text-background/70">
            © {new Date().getFullYear()} Car Washap AB. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Link to="/" className="text-background/70 hover:text-background transition-colors">
              Home
            </Link>
            <Link to="/om" className="text-background/70 hover:text-background transition-colors">
              About
            </Link>
            <Link to="/press" className="text-background/70 hover:text-background transition-colors">
              Press
            </Link>
            <a
              href="mailto:info@carwashap.com"
              className="text-background/70 hover:text-background transition-colors"
            >
              IR Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default InvestorFooter;
