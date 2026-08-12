# Flytta backend från Railway till Lovable Cloud

Idag ligger bokningar, anläggningar, erbjudanden och push på en extern Railway-server. Edge-funktionerna är bara proxys mot den. Målet är att all data och logik ligger i projektets egen databas, så kunden får ett samlat system utan extern serverkostnad.

## Vad som flyttas

| Område | Idag | Efter |
|---|---|---|
| Bokningar | Railway `/api/bookings` | Tabell `bookings` |
| Tillgängliga tider | Railway availability-endpoint | Beräknas i edge-funktion mot `bookings` + `facilities` |
| Anläggningar | Railway `/api/facilities` | Tabell `facilities` |
| Erbjudanden | Railway `/api/offers` | Tabell `offers` |
| Partner-API | Proxy mot Railway | Läser/skriver direkt i databasen |
| Push-notiser | Railway `/api/push/send` | Tas bort (mobilappen avvecklas) |
| Användare/roller | Redan i Cloud | Oförändrat |
| E-post (Resend) | Redan i edge-funktion | Oförändrat |

## Steg

1. **Databasschema** – nya tabeller `facilities`, `bookings`, `offers` med RLS:
   - Publik: kan skapa bokning och läsa aktiva anläggningar/erbjudanden.
   - Personal (admin/chef/arbetare): läsa och ändra bokningar; chef begränsad till sin anläggning.
   - Bokningsnummer (`BW-ÅÅÅÅ-NNNNNN`) genereras i databasen via sekvens.
2. **Dataimport** – ni exporterar allt från Railway (JSON/CSV), jag mappar fälten och importerar historiken.
3. **Skriv om edge-funktionerna** – `bookings`, `offers`, `partner-api` läser/skriver mot databasen istället för att proxa. Samma svarsformat (`{success, data}`) behålls så frontend inte behöver skrivas om.
4. **Affärslogik flyttas in** – kapacitetskontroll, 1h framförhållning, öppettider/slotgenerering, blockeringar ("Hall stängd"), stängning av Borlänge, Make.com-webhook och bekräftelsemail körs i edge-funktionen.
5. **Rensa bort push** – ta bort `send-push-notification`, `scheduled-notifications` och notis-sidan i adminpanelen.
6. **Verifiering** – testa hela flödet: publik bokning, admin-ändring, avbokning, hallschema, kundlistan, partner-API-nyckel, e-postutskick. Jämför bokningsantal mot exporten.
7. **Avveckla Railway** – när allt är verifierat kan servern och `API_KEY`-secreten stängas av.

## Tekniska detaljer

- Fältnamn normaliseras till databaskonvention (`vehicle_make`, `service_id` osv.); edge-funktionen mappar mot frontendens camelCase, inklusive nuvarande `vehicleBrand` → `vehicleMake`.
- `source`-fältet för partnerbokningar blir en riktig kolumn (löser problemet med att Railway ignorerade det).
- Datum lagras som `date` + `time` separat, så nuvarande 'YYYY-MM-DD'-regel består.
- Cache/dedupe/429-retry i `src/lib/bookingApi.ts` kan förenklas efteråt, eftersom rate limit-problemet från Railway försvinner.
- Ingen frontend-designändring ingår.

## Risk

Bokningsflödet är verksamhetskritiskt. Jag föreslår att vi kör importen och testar allt innan Railway stängs av, så vi kan falla tillbaka vid problem.
