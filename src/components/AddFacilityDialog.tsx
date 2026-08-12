import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createFacility } from "@/lib/facilityApi";
import { toast } from "sonner";

interface AddFacilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddFacilityDialog({ open, onOpenChange, onSuccess }: AddFacilityDialogProps) {
  const [name, setName] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [latitude, setLatitude] = useState("59.3293");
  const [longitude, setLongitude] = useState("18.0686");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createFacility({
        name,
        streetAddress,
        postalCode,
        city,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        openingHoursWeekdays: "10:00 - 19:00",
        openingHoursSaturday: "10:00 - 18:00",
        openingHoursSunday: "10:00 - 18:00",
        phone: phone || undefined,
        email: email || undefined,
        isActive: true,
      });

      toast.success("Anläggning skapad!", {
        description: `${name} har lagts till`,
      });

      setName("");
      setStreetAddress("");
      setPostalCode("");
      setCity("");
      setLatitude("59.3293");
      setLongitude("18.0686");
      setPhone("");
      setEmail("");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error creating facility:", error);
      toast.error("Kunde inte skapa anläggning", {
        description: error instanceof Error ? error.message : "Försök igen senare",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Lägg till ny anläggning</DialogTitle>
          <DialogDescription>
            Skapa en ny anläggning för WASH'AP
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Namn</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="t.ex. Borlänge"
              required
              minLength={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="streetAddress">Gatuadress</Label>
            <Input
              id="streetAddress"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              placeholder="t.ex. Kupolen 53"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postnummer</Label>
              <Input
                id="postalCode"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="78170"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Stad</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Borlänge"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="59.3293"
                required
                min="-90"
                max="90"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="18.0686"
                required
                min="-180"
                max="180"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon (valfritt)</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="t.ex. 0762184308"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-post (valfritt)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="t.ex. info@washap.se"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Skapar..." : "Skapa anläggning"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
