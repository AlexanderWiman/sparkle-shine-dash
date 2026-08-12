import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import carwashapLogo from "@/assets/carwashap-logo.png";

const PublicHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLandingPage = location.pathname === "/";

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const hash = href.includes("#") ? href.split("#")[1] : "";

    if (isLandingPage) {
      // Already on landing page, just scroll
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // Navigate to landing page with hash
      navigate("/" + (hash ? `#${hash}` : ""));
      // Wait for navigation then scroll
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  };

  const navItems = [
    { label: "Tjänster", href: isLandingPage ? "#tjanster" : "/#tjanster", isPage: false },
    { label: "Priser", href: "/priser", isPage: true },
    { label: "FAQ", href: isLandingPage ? "#faq" : "/#faq", isPage: false },
    { label: "Om oss", href: "/om", isPage: true },
    { label: "Press", href: "/press", isPage: true },
    { label: "Kontakt", href: isLandingPage ? "#kontakt" : "/#kontakt", isPage: false },
  ];

  const isActive = (href: string) => {
    if (href.startsWith("#") || href.startsWith("/#")) return false;
    return location.pathname === href;
  };

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-md">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={carwashapLogo} alt="Car Washap - Professionell biltvätt" className="h-10 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) =>
            item.isPage ? (
              <Link
                key={item.href}
                to={item.href}
                className={`transition-colors ${
                  isActive(item.href)
                    ? "text-primary-foreground font-medium"
                    : "text-primary-foreground/80 hover:text-primary-foreground"
                }`}
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleAnchorClick(e, item.href)}
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors cursor-pointer"
              >
                {item.label}
              </a>
            ),
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <Button
            asChild
            size="lg"
            className="font-semibold hidden sm:flex bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          >
            <Link to="/boka">Boka nu</Link>
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-primary-foreground/20 bg-primary">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {navItems.map((item) =>
              item.isPage ? (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`block py-2 transition-colors ${
                    isActive(item.href) ? "text-primary-foreground font-medium" : "text-primary-foreground/80"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.href}
                  href={item.href}
                  className="block py-2 text-primary-foreground/80 cursor-pointer"
                  onClick={(e) => {
                    handleAnchorClick(e, item.href);
                    setMobileMenuOpen(false);
                  }}
                >
                  {item.label}
                </a>
              ),
            )}
            <Button asChild className="w-full mt-4 bg-primary-foreground text-primary hover:bg-primary-foreground/90">
              <Link to="/boka" onClick={() => setMobileMenuOpen(false)}>
                Boka nu
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicHeader;
