import { Instagram, Mail, Facebook, Linkedin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchContactContent, ContactContent } from "@/lib/landingContentApi";
import carwashapLogo from "@/assets/carwashap-logo.png";
import { Link } from "react-router-dom";

interface PublicFooterProps {
  variant?: "simple" | "full";
}

const defaultContact: ContactContent = {
  companyName: "Car Washap AB",
  phone: "+46-XXX-XXX-XXX",
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
    sunday: "10:00 - 18:00",
  },
  socialMedia: {
    instagram: "https://www.instagram.com/carwashap/",
  },
  footerTagline: "Smart care for your car. More time for you.",
  footerLinks: [],
};

// TikTok icon component since lucide doesn't have one
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const PublicFooter = ({ variant = "simple" }: PublicFooterProps) => {
  const { data: contactData } = useQuery({
    queryKey: ["contact-content"],
    queryFn: fetchContactContent,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const contact = contactData || defaultContact;

  if (variant === "full") {
    return (
      <footer className="mt-auto bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <img
                src={carwashapLogo}
                alt="Car Washap"
                className="h-8 w-auto brightness-0 invert"
              />
              <span className="text-sm opacity-80">
                {contact.footerTagline || "Smart care for your car. More time for you."}
              </span>
            </div>
            <div className="flex items-center gap-6">
              {contact.socialMedia.instagram && (
                <a
                  href={contact.socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-80 hover:opacity-100 transition-opacity hover:text-primary"
                  aria-label="Följ oss på Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {contact.socialMedia.facebook && (
                <a
                  href={contact.socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-80 hover:opacity-100 transition-opacity hover:text-primary"
                  aria-label="Följ oss på Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {contact.socialMedia.linkedin && (
                <a
                  href={contact.socialMedia.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-80 hover:opacity-100 transition-opacity hover:text-primary"
                  aria-label="Följ oss på LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {contact.socialMedia.tiktok && (
                <a
                  href={contact.socialMedia.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-80 hover:opacity-100 transition-opacity hover:text-primary"
                  aria-label="Följ oss på TikTok"
                >
                  <TikTokIcon className="h-5 w-5" />
                </a>
              )}
              <a
                href={`mailto:${contact.email}`}
                className="opacity-80 hover:opacity-100 transition-opacity hover:text-primary"
                aria-label="Skicka e-post"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-6">
            <Link
              to="/biltvatt-borlange"
              className="text-sm opacity-80 hover:opacity-100 transition-opacity hover:text-primary"
            >
              Biltvätt Borlänge
            </Link>
            <Link
              to="/biltvatt-kupolen"
              className="text-sm opacity-80 hover:opacity-100 transition-opacity hover:text-primary"
            >
              Biltvätt Kupolen
            </Link>
            <Link
              to="/priser"
              className="text-sm opacity-80 hover:opacity-100 transition-opacity hover:text-primary"
            >
              Priser
            </Link>
            <Link
              to="/boka"
              className="text-sm opacity-80 hover:opacity-100 transition-opacity hover:text-primary"
            >
              Boka tid
            </Link>
            <Link
              to="/om"
              className="text-sm opacity-80 hover:opacity-100 transition-opacity hover:text-primary"
            >
              Om oss
            </Link>
            {contact.footerLinks && contact.footerLinks.map((link, idx) => (
              <Link
                key={idx}
                to={link.url}
                className="text-sm opacity-80 hover:opacity-100 transition-opacity hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-8 pt-8 border-t border-background/20 text-center text-sm opacity-60">
            © {new Date().getFullYear()} {contact.companyName.replace(" AB", "")}. Alla rättigheter förbehållna.
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="mt-auto bg-foreground text-background py-8">
      <div className="container mx-auto px-4 text-center text-sm opacity-60">
        © {new Date().getFullYear()} {contact.companyName.replace(" AB", "")}. Alla rättigheter förbehållna.
      </div>
    </footer>
  );
};

export default PublicFooter;
