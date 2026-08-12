import { ContactContent } from "@/lib/landingContentApi";
import { Instagram, Facebook, Linkedin, Mail } from "lucide-react";
import { Link } from "react-router-dom";

interface ContactPreviewProps {
  data: ContactContent | null;
}

// TikTok icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const ContactPreview = ({ data }: ContactPreviewProps) => {
  if (!data) return <PreviewPlaceholder section="Footer" />;

  return (
    <div className="bg-background flex flex-col">
      {/* Info section showing what data is being edited */}
      <div className="p-4 border-b bg-muted/30">
        <h3 className="font-semibold text-sm mb-2">Redigerar: Sidfot & Kontaktuppgifter</h3>
        <p className="text-xs text-muted-foreground">
          Denna information visas i sidfoten på alla sidor samt i kontaktsektionen på landningssidan.
        </p>
      </div>

      {/* Contact info summary */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Företagsnamn</p>
            <p>{data.companyName}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Telefon</p>
            <p>{data.phone}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">E-post</p>
            <p>{data.email}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Adress</p>
            <p className="text-xs">
              {data.address.street}<br />
              {data.address.postalCode} {data.address.city}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Öppettider</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Vardag:</span>
              <p>{data.openingHours.weekdays}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Lördag:</span>
              <p>{data.openingHours.saturday}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Söndag:</span>
              <p>{data.openingHours.sunday}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to push footer down */}
      <div className="flex-1 min-h-[100px]" />

      {/* Footer Preview - Full variant (Landing page) */}
      <div className="border-t">
        <p className="text-xs font-medium text-muted-foreground p-2 bg-muted/50 text-center">
          Förhandsgranskning: Sidfot (Landningssidan)
        </p>
        <footer className="bg-foreground text-background py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-xs font-bold">
                  CW
                </div>
                <span className="text-xs opacity-80">
                  {data.footerTagline || "Smart care for your car. More time for you."}
                </span>
              </div>
              <div className="flex items-center gap-4">
                {data.socialMedia.instagram && (
                  <span className="opacity-80 hover:opacity-100 transition-opacity">
                    <Instagram className="h-4 w-4" />
                  </span>
                )}
                {data.socialMedia.facebook && (
                  <span className="opacity-80 hover:opacity-100 transition-opacity">
                    <Facebook className="h-4 w-4" />
                  </span>
                )}
                {data.socialMedia.linkedin && (
                  <span className="opacity-80 hover:opacity-100 transition-opacity">
                    <Linkedin className="h-4 w-4" />
                  </span>
                )}
                {data.socialMedia.tiktok && (
                  <span className="opacity-80 hover:opacity-100 transition-opacity">
                    <TikTokIcon className="h-4 w-4" />
                  </span>
                )}
                <span className="opacity-80 hover:opacity-100 transition-opacity">
                  <Mail className="h-4 w-4" />
                </span>
              </div>
            </div>
            {data.footerLinks && data.footerLinks.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-4">
                {data.footerLinks.map((link, idx) => (
                  <span key={idx} className="text-xs opacity-80 hover:opacity-100 cursor-pointer">
                    {link.label}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-6 pt-6 border-t border-background/20 text-center text-xs opacity-60">
              © {new Date().getFullYear()} {data.companyName.replace(" AB", "")}. Alla rättigheter förbehållna.
            </div>
          </div>
        </footer>
      </div>

      {/* Footer Preview - Simple variant (Subpages) */}
      <div className="border-t">
        <p className="text-xs font-medium text-muted-foreground p-2 bg-muted/50 text-center">
          Förhandsgranskning: Sidfot (Undersidor)
        </p>
        <footer className="bg-foreground text-background py-6">
          <div className="container mx-auto px-4 text-center text-xs opacity-60">
            © {new Date().getFullYear()} {data.companyName.replace(" AB", "")}. Alla rättigheter förbehållna.
          </div>
        </footer>
      </div>
    </div>
  );
};

const PreviewPlaceholder = ({ section }: { section: string }) => (
  <div className="flex items-center justify-center h-64 bg-muted/50 rounded-lg border-2 border-dashed">
    <p className="text-muted-foreground">Laddar {section}...</p>
  </div>
);

export default ContactPreview;
