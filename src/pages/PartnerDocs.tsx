import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import SEOHead from "@/components/SEOHead";

const BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/partner-api`;

const CodeBlock = ({ children }: { children: string }) => {
  const copy = async () => {
    await navigator.clipboard.writeText(children);
    toast.success("Kopierat");
  };
  return (
    <div className="relative group">
      <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs font-mono whitespace-pre-wrap break-all">
        {children}
      </pre>
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
        onClick={copy}
      >
        <Copy className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default function PartnerDocs() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Partner-API – Dokumentation | Car Washap"
        description="Teknisk dokumentation för Car Washap Partner-API. Hämta lediga tider och skapa bokningar via REST."
        noIndex
      />
      <div className="container mx-auto p-6 max-w-4xl space-y-6">
        <div>
          {user && (
            <Button variant="ghost" size="sm" asChild className="mb-2">
              <Link to="/partners">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Tillbaka
              </Link>
            </Button>
          )}
          <h1 className="text-3xl font-bold">Partner-API – Dokumentation</h1>
          <p className="text-muted-foreground mt-1">
            Teknisk integrationsguide för partners som vill bygga bokningar via Car Washap API.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Översikt</CardTitle>
            <CardDescription>
              Partner-API:t låter externa firmor (t.ex. marknadsföringsbyråer) hämta lediga tider
              och skapa bokningar åt sina kunder, utan tillgång till hela admin-panelen.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p><strong>Bas-URL:</strong></p>
            <CodeBlock>{BASE_URL}</CodeBlock>
            <p>
              <strong>Autentisering:</strong> Skicka API-nyckeln i headern{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs">X-API-Key</code> på varje
              anrop.
            </p>
            <p className="text-muted-foreground">
              Anläggning väljs automatiskt – ni behöver inte ange något <code>facilityId</code>.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="outline">GET</Badge>
              <CardTitle className="text-lg">/availability</CardTitle>
            </div>
            <CardDescription>Hämta lediga tider för ett datum.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm font-medium">Parametrar:</p>
            <ul className="text-sm space-y-1 list-disc pl-5">
              <li><code className="bg-muted px-1.5 py-0.5 rounded text-xs">date</code> – format YYYY-MM-DD (obligatoriskt)</li>
            </ul>
            <p className="text-sm font-medium">Exempel:</p>
            <CodeBlock>{`curl -H "X-API-Key: pk_live_xxxxx" \\
  "${BASE_URL}/availability?date=2026-05-15"`}</CodeBlock>
            <p className="text-sm font-medium">Svar:</p>
            <CodeBlock>{`{
  "success": true,
  "partner": "Facebook Marketing AB",
  "date": "2026-05-15",
  "availableTimes": ["09:00", "10:00", "13:00", "14:00", "16:00"]
}`}</CodeBlock>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="outline">POST</Badge>
              <CardTitle className="text-lg">/bookings</CardTitle>
            </div>
            <CardDescription>Skapa en ny bokning åt en kund.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm font-medium">Body (JSON) – obligatoriska fält:</p>
            <CodeBlock>{`{
  "customerName": "Anna Andersson",
  "email": "anna@example.com",
  "phone": "0701234567",
  "vehicleMake": "Volvo",
  "vehicleModel": "XC60",
  "vehicleRegistration": "ABC123",
  "serviceType": "exterior-basic",
  "date": "2026-05-15",
  "time": "10:00"
}`}</CodeBlock>
            <p className="text-xs text-muted-foreground">
              Alla fält ovan är <strong>obligatoriska</strong>.{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded">addons</code> och{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded">extras</code> är valfria. Se giltiga
              ID:n längre ner. Källa (<code className="bg-muted px-1.5 py-0.5 rounded">source</code>)
              sätts automatiskt baserat på din API-nyckel.
            </p>
            <p className="text-sm font-medium">Exempel (curl):</p>
            <CodeBlock>{`curl -X POST \\
  -H "X-API-Key: pk_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"customerName":"Anna Andersson","phone":"0701234567","email":"anna@example.com","vehicleMake":"Volvo","vehicleModel":"XC60","vehicleRegistration":"ABC123","serviceType":"exterior-basic","date":"2026-05-15","time":"10:00"}' \\
  ${BASE_URL}/bookings`}</CodeBlock>
            <p className="text-sm font-medium">Svar (201 Created):</p>
            <CodeBlock>{`{
  "success": true,
  "partner": "Facebook Marketing AB",
  "booking": {
    "id": "booking-uuid",
    "bookingNumber": "CW-2026-0123",
    "date": "2026-05-15",
    "time": "10:00",
    "customerName": "Anna Andersson",
    "totalPrice": 599,
    "status": "pending"
  }
}`}</CodeBlock>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Felmeddelanden</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex gap-3">
              <Badge variant="destructive">401</Badge>
              <span>Ogiltig eller saknad API-nyckel</span>
            </div>
            <div className="flex gap-3">
              <Badge variant="destructive">400</Badge>
              <span>Validering misslyckades – kolla <code>details</code>-fältet</span>
            </div>
            <div className="flex gap-3">
              <Badge variant="destructive">404</Badge>
              <span>Okänd endpoint</span>
            </div>
            <div className="flex gap-3">
              <Badge variant="destructive">500</Badge>
              <span>Internt fel – kontakta oss</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Giltiga ID:n</CardTitle>
            <CardDescription>
              Använd exakt dessa värden för <code>serviceType</code>, <code>addons</code> och{" "}
              <code>extras</code>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-sm">
            <div>
              <p className="font-medium mb-2">serviceType (obligatoriskt, ett värde)</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4">ID</th>
                      <th className="text-left py-2 pr-4">Namn</th>
                      <th className="text-right py-2">Pris</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    <tr className="border-b"><td className="py-1.5 pr-4">exterior-basic</td><td className="py-1.5 pr-4 font-sans">Utvändigt – Bas</td><td className="py-1.5 text-right font-sans">370 kr</td></tr>
                    <tr className="border-b"><td className="py-1.5 pr-4">interior-basic</td><td className="py-1.5 pr-4 font-sans">Invändigt – Bas</td><td className="py-1.5 text-right font-sans">370 kr</td></tr>
                    <tr className="border-b"><td className="py-1.5 pr-4">complete-basic</td><td className="py-1.5 pr-4 font-sans">In- och utvändig tvätt – Bas</td><td className="py-1.5 text-right font-sans">690 kr</td></tr>
                    <tr><td className="py-1.5 pr-4">complete-recond</td><td className="py-1.5 pr-4 font-sans">Invändig rekond med utvändig tvätt</td><td className="py-1.5 text-right font-sans">2 500 kr</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <p className="font-medium mb-2">addons (valfritt, array)</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4">ID</th>
                      <th className="text-left py-2 pr-4">Namn</th>
                      <th className="text-left py-2 pr-4">Tillgängligt för</th>
                      <th className="text-right py-2">Pris</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    <tr className="border-b"><td className="py-1.5 pr-4">asphalt</td><td className="py-1.5 pr-4 font-sans">Asfaltsborttagning</td><td className="py-1.5 pr-4">exterior-basic, complete-basic</td><td className="py-1.5 text-right font-sans">80 kr</td></tr>
                    <tr className="border-b"><td className="py-1.5 pr-4">trunk</td><td className="py-1.5 pr-4 font-sans">Baklucka</td><td className="py-1.5 pr-4">exterior-basic, complete-basic</td><td className="py-1.5 text-right font-sans">50 kr</td></tr>
                    <tr className="border-b"><td className="py-1.5 pr-4">spray-wax</td><td className="py-1.5 pr-4 font-sans">Sprayvax</td><td className="py-1.5 pr-4">exterior-basic, complete-basic</td><td className="py-1.5 text-right font-sans">150 kr</td></tr>
                    <tr className="border-b"><td className="py-1.5 pr-4">seat-front</td><td className="py-1.5 pr-4 font-sans">Sätestvätt framstol</td><td className="py-1.5 pr-4">interior-basic, complete-basic</td><td className="py-1.5 text-right font-sans">250 kr</td></tr>
                    <tr><td className="py-1.5 pr-4">seat-back</td><td className="py-1.5 pr-4 font-sans">Sätestvätt baksäte</td><td className="py-1.5 pr-4">interior-basic, complete-basic</td><td className="py-1.5 text-right font-sans">450 kr</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <p className="font-medium mb-2">extras (valfritt, array)</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4">ID</th>
                      <th className="text-left py-2 pr-4">Namn</th>
                      <th className="text-left py-2 pr-4">Tillgängligt för</th>
                      <th className="text-right py-2">Pris</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    <tr className="border-b"><td className="py-1.5 pr-4">engine</td><td className="py-1.5 pr-4 font-sans">Motortvätt</td><td className="py-1.5 pr-4">exterior-basic, complete-basic, complete-recond</td><td className="py-1.5 text-right font-sans">395 kr</td></tr>
                    <tr className="border-b"><td className="py-1.5 pr-4">extra-dirty</td><td className="py-1.5 pr-4 font-sans">Extra smutsig bil</td><td className="py-1.5 pr-4">exterior-basic, complete-basic, interior-basic</td><td className="py-1.5 text-right font-sans">+25%</td></tr>
                    <tr><td className="py-1.5 pr-4">sanitation</td><td className="py-1.5 pr-4 font-sans">Sanering hund-/katthår</td><td className="py-1.5 pr-4">interior-basic, complete-basic</td><td className="py-1.5 text-right font-sans">På förfrågan</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>JavaScript-exempel</CardTitle>
          </CardHeader>
          <CardContent>
            <CodeBlock>{`const API_KEY = 'pk_live_xxxxx';
const BASE = '${BASE_URL}';

async function bookCustomer(data) {
  const res = await fetch(\`\${BASE}/bookings\`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!result.success) throw new Error(result.error);
  return result.booking;
}`}</CodeBlock>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
