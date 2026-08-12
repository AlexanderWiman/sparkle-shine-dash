import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Building2, Trash2, Edit, Loader2, MapPin, Clock, Phone, Mail, Eye } from "lucide-react";
import { fetchFacilities, deleteFacility, type Facility } from "@/lib/facilityApi";
import { AddFacilityDialog } from "@/components/AddFacilityDialog";

// Get today's opening hours based on day of week
const getTodayOpeningHours = (facility: Facility): string => {
  const today = new Date().getDay(); // 0 = Sunday, 6 = Saturday
  
  if (today === 0) {
    return facility.openingHoursSunday || "Stängt";
  } else if (today === 6) {
    return facility.openingHoursSaturday || "Stängt";
  } else {
    return facility.openingHoursWeekdays || "Ej angiven";
  }
};

const getDayLabel = (): string => {
  const today = new Date().getDay();
  if (today === 0) return "sön";
  if (today === 6) return "lör";
  return "idag";
};

const FacilityManagement = () => {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    loadFacilities();
  }, []);

  const loadFacilities = async () => {
    setLoading(true);
    console.log("Loading facilities from API...");
    try {
      const data = await fetchFacilities(false); // Show all facilities including inactive
      console.log("Facilities loaded:", data);
      setFacilities(data);
    } catch (error) {
      console.error("Error loading facilities:", error);
      toast.error("Kunde inte hämta anläggningar");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      await deleteFacility(deleteId);
      toast.success("Anläggning borttagen");
      loadFacilities();
    } catch (error) {
      console.error("Error deleting facility:", error);
      toast.error("Kunde inte ta bort anläggning");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/5 p-2 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-2xl md:text-3xl">Hantera anläggningar</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Översikt och hantering av alla anläggningar
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
                  <Building2 className="h-4 w-4 mr-2" />
                  Lägg till anläggning
                </Button>
              </div>
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">Laddar anläggningar...</p>
                </div>
              ) : facilities.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Inga anläggningar</p>
                  <p className="text-sm">Lägg till din första anläggning för att komma igång</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Namn</TableHead>
                        <TableHead>Adress</TableHead>
                        <TableHead>Kontakt</TableHead>
                        <TableHead>Öppet idag</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Åtgärder</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {facilities.map((facility) => (
                        <TableRow key={facility.id}>
                          <TableCell>
                            <button
                              onClick={() => navigate(`/facility/${facility.id}`)}
                              className="flex items-center gap-2 hover:text-primary transition-colors text-left"
                            >
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium hover:underline">{facility.name}</span>
                            </button>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-start gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div>
                                <div>{facility.streetAddress}</div>
                                <div className="text-muted-foreground">
                                  {facility.postalCode} {facility.city}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 text-sm">
                              {facility.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3 w-3 text-muted-foreground" />
                                  <span>{facility.phone}</span>
                                </div>
                              )}
                              {facility.email && (
                                <div className="flex items-center gap-2">
                                  <Mail className="h-3 w-3 text-muted-foreground" />
                                  <span>{facility.email}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span>{getTodayOpeningHours(facility)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={facility.isActive ? "default" : "secondary"}>
                              {facility.isActive ? "Aktiv" : "Inaktiv"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/facility/${facility.id}`)}
                                title="Visa dashboard"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/facility/${facility.id}/edit`)}
                                title="Redigera"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteId(facility.id)}
                                title="Ta bort"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AddFacilityDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={() => {
          toast.success("Anläggning tillagd!");
          loadFacilities();
        }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ta bort anläggning?</AlertDialogTitle>
            <AlertDialogDescription>
              Denna åtgärd kan inte ångras. Anläggningen kommer att markeras som borttagen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Tar bort...
                </>
              ) : (
                "Ta bort"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default FacilityManagement;
