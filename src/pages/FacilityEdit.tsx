import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Building2, Loader2, ArrowLeft } from "lucide-react";
import { fetchFacility, updateFacility, type Facility } from "@/lib/facilityApi";
import { FacilityMapPicker } from "@/components/FacilityMapPicker";

const FacilityEdit = () => {
  const { facilityId } = useParams<{ facilityId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [facility, setFacility] = useState<Partial<Facility>>({
    name: "",
    streetAddress: "",
    postalCode: "",
    city: "",
    latitude: 0,
    longitude: 0,
    geofenceRadius: 300,
    capacity: 2,
    phone: "",
    email: "",
    openingHoursWeekdays: "",
    openingHoursSaturday: "",
    openingHoursSunday: "",
    isActive: true,
  });

  useEffect(() => {
    if (facilityId) {
      loadFacility();
    }
  }, [facilityId]);

  const loadFacility = async () => {
    try {
      setLoading(true);
      const data = await fetchFacility(facilityId!);
      setFacility(data);
    } catch (error) {
      console.error("Error loading facility:", error);
      toast.error("Kunde inte ladda anläggning");
      navigate("/facilities");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSaving(true);
    try {
      // Validate with zod schema
      const { facilityUpdateSchema, formatZodErrors } = await import('@/lib/validationSchemas');
      
      // Prepare data for validation
      const validationData = {
        name: facility.name,
        streetAddress: facility.streetAddress,
        postalCode: facility.postalCode,
        city: facility.city,
        latitude: facility.latitude,
        longitude: facility.longitude,
        geofenceRadius: facility.geofenceRadius,
        phone: facility.phone || '',
        email: facility.email || '',
        openingHoursWeekdays: facility.openingHoursWeekdays,
        openingHoursSaturday: facility.openingHoursSaturday,
        openingHoursSunday: facility.openingHoursSunday,
        isActive: facility.isActive ?? true,
      };

      try {
        facilityUpdateSchema.parse(validationData);
      } catch (error) {
        if (error instanceof Error && 'errors' in error) {
          toast.error(formatZodErrors(error as any));
          setSaving(false);
          return;
        }
        throw error;
      }

      // Only send updatable fields, normalisera tomma/ogiltiga värden
      const hasValidEmail = facility.email && /.+@.+\..+/.test(facility.email);

      const updateData = {
        name: facility.name,
        streetAddress: facility.streetAddress,
        postalCode: facility.postalCode,
        city: facility.city,
        latitude: facility.latitude,
        longitude: facility.longitude,
        geofenceRadius: facility.geofenceRadius,
        capacity: facility.capacity || 2,
        openingHoursWeekdays: facility.openingHoursWeekdays,
        openingHoursSaturday: facility.openingHoursSaturday,
        // Skicka bara söndagstid om något är angivet
        openingHoursSunday: facility.openingHoursSunday?.trim() ? facility.openingHoursSunday : undefined,
        // Backend vill inte ha null för telefon
        phone: facility.phone == null ? "" : facility.phone,
        // Skicka bara e-post om den är giltig, annars låt backend behålla befintligt värde
        email: hasValidEmail ? facility.email : undefined,
        isActive: facility.isActive,
      };
      
      await updateFacility(facilityId!, updateData);
      toast.success("Anläggning uppdaterad!");
      navigate("/facilities");
    } catch (error) {
      console.error("Error updating facility:", error);
      toast.error("Kunde inte uppdatera anläggning");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof Facility, value: string | boolean | number) => {
    setFacility(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/5 py-8 px-4">
          <div className="container mx-auto max-w-2xl">
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Laddar anläggning...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/5 py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/facilities")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tillbaka till anläggningar
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Building2 className="h-8 w-8" />
                Redigera anläggning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Namn *</Label>
                  <Input
                    id="name"
                    value={facility.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Anläggningens namn"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="streetAddress">Gatuadress *</Label>
                  <Input
                    id="streetAddress"
                    value={facility.streetAddress}
                    onChange={(e) => handleChange("streetAddress", e.target.value)}
                    placeholder="Gatuadress"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postnummer</Label>
                    <Input
                      id="postalCode"
                      value={facility.postalCode}
                      onChange={(e) => handleChange("postalCode", e.target.value)}
                      placeholder="123 45"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Stad *</Label>
                    <Input
                      id="city"
                      value={facility.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      placeholder="Stad"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Koordinater & Geofence</h3>
                  
                  <FacilityMapPicker
                    latitude={facility.latitude || 59.3293}
                    longitude={facility.longitude || 18.0686}
                    onLocationChange={(lat, lng) => {
                      setFacility(prev => ({
                        ...prev,
                        latitude: lat,
                        longitude: lng,
                      }));
                    }}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={facility.latitude || 0}
                        onChange={(e) => handleChange("latitude", parseFloat(e.target.value) || 0)}
                        placeholder="59.3293"
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
                        value={facility.longitude || 0}
                        onChange={(e) => handleChange("longitude", parseFloat(e.target.value) || 0)}
                        placeholder="18.0686"
                        min="-180"
                        max="180"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="geofenceRadius">Geofence-radie (meter)</Label>
                    <Input
                      id="geofenceRadius"
                      type="number"
                      value={facility.geofenceRadius || 300}
                      onChange={(e) => handleChange("geofenceRadius", parseInt(e.target.value) || 300)}
                      placeholder="300"
                      min="50"
                      max="5000"
                    />
                    <p className="text-sm text-muted-foreground">
                      Radie i meter för geografisk avgränsning
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capacity">Kapacitet per timslot</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={facility.capacity || 2}
                      onChange={(e) => handleChange("capacity", parseInt(e.target.value) || 2)}
                      placeholder="2"
                      min="1"
                      max="20"
                    />
                    <p className="text-sm text-muted-foreground">
                      Antal samtidiga bokningar som kan hanteras per tidslucka
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={facility.phone || ""}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="070-123 45 67"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-post</Label>
                    <Input
                      id="email"
                      type="email"
                      value={facility.email || ""}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="kontakt@anlaggning.se"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Öppettider</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="weekdays">Vardagar</Label>
                    <Input
                      id="weekdays"
                      value={facility.openingHoursWeekdays || ""}
                      onChange={(e) => handleChange("openingHoursWeekdays", e.target.value)}
                      placeholder="08:00 - 17:00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="saturday">Lördag</Label>
                    <Input
                      id="saturday"
                      value={facility.openingHoursSaturday || ""}
                      onChange={(e) => handleChange("openingHoursSaturday", e.target.value)}
                      placeholder="09:00 - 15:00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sunday">Söndag</Label>
                    <Input
                      id="sunday"
                      value={facility.openingHoursSunday || ""}
                      onChange={(e) => handleChange("openingHoursSunday", e.target.value)}
                      placeholder="Stängt"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="active">Aktiv anläggning</Label>
                    <p className="text-sm text-muted-foreground">
                      Endast aktiva anläggningar visas för bokningar
                    </p>
                  </div>
                  <Switch
                    id="active"
                    checked={facility.isActive}
                    onCheckedChange={(checked) => handleChange("isActive", checked)}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/facilities")}
                    disabled={saving}
                  >
                    Avbryt
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sparar...
                      </>
                    ) : (
                      "Spara ändringar"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default FacilityEdit;
