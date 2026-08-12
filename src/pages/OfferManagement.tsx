import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import {
  fetchOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  type Offer,
  type CreateOfferData,
} from "@/lib/offerApi";
import { Layout } from "@/components/Layout";

const OfferManagement = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discount: "",
    discountAmount: "",
    validFrom: "",
    validTo: "",
    isActive: true,
  });

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const data = await fetchOffers();
      setOffers(data);
    } catch (error) {
      console.error("Error loading offers:", error);
      toast({
        title: "Fel",
        description: "Kunde inte ladda erbjudanden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.discount && !formData.discountAmount) {
      toast({
        title: "Validering misslyckades",
        description: "Ange antingen procentuell rabatt eller fast rabatt",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      const offerData: CreateOfferData = {
        title: formData.title,
        description: formData.description,
        discount: formData.discount ? parseInt(formData.discount) : undefined,
        discountAmount: formData.discountAmount
          ? parseInt(formData.discountAmount)
          : undefined,
        validFrom: new Date(formData.validFrom).toISOString(),
        validTo: new Date(formData.validTo).toISOString(),
        isActive: formData.isActive,
      };

      if (editingOffer) {
        await updateOffer(editingOffer, offerData);
        toast({
          title: "Uppdaterat",
          description: "Erbjudandet har uppdaterats",
        });
      } else {
        await createOffer(offerData);
        toast({
          title: "Skapat",
          description: "Nytt erbjudande har skapats",
        });
      }

      resetForm();
      await loadOffers();
    } catch (error) {
      console.error("Error saving offer:", error);
      toast({
        title: "Fel",
        description: error instanceof Error ? error.message : "Kunde inte spara erbjudande",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (offer: Offer) => {
    setEditingOffer(offer.id);
    setFormData({
      title: offer.title,
      description: offer.description,
      discount: offer.discount?.toString() || "",
      discountAmount: offer.discountAmount
        ? offer.discountAmount.toString()
        : "",
      validFrom: new Date(offer.validFrom).toISOString().slice(0, 16),
      validTo: new Date(offer.validTo).toISOString().slice(0, 16),
      isActive: offer.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Är du säker på att du vill ta bort detta erbjudande?")) {
      return;
    }

    try {
      await deleteOffer(id);
      toast({
        title: "Borttaget",
        description: "Erbjudandet har tagits bort",
      });
      await loadOffers();
    } catch (error) {
      console.error("Error deleting offer:", error);
      toast({
        title: "Fel",
        description: "Kunde inte ta bort erbjudande",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      discount: "",
      discountAmount: "",
      validFrom: "",
      validTo: "",
      isActive: true,
    });
    setShowForm(false);
    setEditingOffer(null);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/5 p-2 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-6">Hantera Erbjudanden</h1>

        <Card className="mb-6">
          <CardHeader>
            <div>
              <CardTitle>Erbjudanden</CardTitle>
              <CardDescription>
                Skapa och hantera kampanjerbjudanden för dina kunder
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Button
                onClick={() => {
                  if (showForm) {
                    resetForm();
                  } else {
                    setShowForm(true);
                  }
                }}
                className="w-full sm:w-auto"
              >
                {showForm ? "Avbryt" : <><Plus className="h-4 w-4 mr-2" /> Nytt erbjudande</>}
              </Button>
            </div>
          {showForm && (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Titel *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Beskrivning *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discount">Rabatt (%)</Label>
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discount: e.target.value,
                          discountAmount: "",
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="discountAmount">Rabatt (kr)</Label>
                    <Input
                      id="discountAmount"
                      type="number"
                      min="0"
                      value={formData.discountAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountAmount: e.target.value,
                          discount: "",
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="validFrom">Giltigt från *</Label>
                    <Input
                      id="validFrom"
                      type="datetime-local"
                      value={formData.validFrom}
                      onChange={(e) =>
                        setFormData({ ...formData, validFrom: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="validTo">Giltigt till *</Label>
                    <Input
                      id="validTo"
                      type="datetime-local"
                      value={formData.validTo}
                      onChange={(e) =>
                        setFormData({ ...formData, validTo: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                  <Label htmlFor="isActive">Aktivt erbjudande</Label>
                </div>

                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingOffer ? "Uppdatera" : "Skapa"} erbjudande
                </Button>
              </form>
            </>
          )}
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : offers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Inga erbjudanden hittades. Skapa ditt första erbjudande!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {offers.map((offer) => (
              <Card key={offer.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{offer.title}</h3>
                      <p className="text-muted-foreground mb-4">{offer.description}</p>
                      
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Rabatt:</span>{" "}
                          {offer.discount
                            ? `${offer.discount}%`
                            : offer.discountAmount
                            ? `${offer.discountAmount} kr`
                            : "Ingen rabatt angiven"}
                        </p>
                        <p>
                          <span className="font-medium">Giltigt:</span>{" "}
                          {new Date(offer.validFrom).toLocaleDateString("sv-SE")} -{" "}
                          {new Date(offer.validTo).toLocaleDateString("sv-SE")}
                        </p>
                        <p>
                          <span className="font-medium">Status:</span>{" "}
                          <span className={offer.isActive ? "text-green-600" : "text-red-600"}>
                            {offer.isActive ? "Aktiv" : "Inaktiv"}
                          </span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(offer)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(offer.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
    </Layout>
  );
};

export default OfferManagement;
