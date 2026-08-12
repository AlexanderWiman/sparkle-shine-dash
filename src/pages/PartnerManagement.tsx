import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchPartnerKeys,
  createPartnerKey,
  togglePartnerKey,
  deletePartnerKey,
  type PartnerKey,
  type CreatedPartnerKey,
} from "@/lib/partnerApi";
import { toast } from "sonner";
import { Copy, Loader2, Plus, Power, Trash2, FileText, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { sv } from "date-fns/locale";

export default function PartnerManagement() {
  const [keys, setKeys] = useState<PartnerKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [sourceTag, setSourceTag] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [newKey, setNewKey] = useState<CreatedPartnerKey | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setKeys(await fetchPartnerKeys());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Kunde inte ladda partner-nycklar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!name.trim() || !sourceTag.trim()) {
      toast.error("Fyll i både namn och källtagg");
      return;
    }
    setSubmitting(true);
    try {
      const { key } = await createPartnerKey(name.trim(), sourceTag.trim());
      setNewKey(key);
      setCreateOpen(false);
      setName("");
      setSourceTag("");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Kunde inte skapa nyckel");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (k: PartnerKey) => {
    try {
      await togglePartnerKey(k.id, !k.is_active);
      toast.success(k.is_active ? "Nyckel inaktiverad" : "Nyckel aktiverad");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Kunde inte uppdatera");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePartnerKey(deleteId);
      toast.success("Nyckel borttagen");
      setDeleteId(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Kunde inte ta bort");
    }
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Kopierat till urklipp");
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Partner-API</h1>
            <p className="text-muted-foreground mt-1">
              Hantera externa firmor som kan boka in kunder via API
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/partners/docs">
                <FileText className="h-4 w-4 mr-2" />
                Dokumentation
              </Link>
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ny partner
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Aktiva partners</CardTitle>
            <CardDescription>
              Varje partner får en unik API-nyckel som ger åtkomst till att se lediga tider och
              skapa bokningar. Bokningar märks automatiskt med partnerns källtagg.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : keys.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Inga partners ännu. Klicka på "Ny partner" för att skapa den första nyckeln.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Namn</TableHead>
                    <TableHead>Källtagg</TableHead>
                    <TableHead>Nyckelprefix</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Antal anrop</TableHead>
                    <TableHead>Senast använd</TableHead>
                    <TableHead className="text-right">Åtgärder</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keys.map((k) => (
                    <TableRow key={k.id}>
                      <TableCell className="font-medium">{k.name}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{k.source_tag}</code>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{k.api_key_prefix}…</code>
                      </TableCell>
                      <TableCell>
                        {k.is_active ? (
                          <Badge variant="default">Aktiv</Badge>
                        ) : (
                          <Badge variant="secondary">Inaktiv</Badge>
                        )}
                      </TableCell>
                      <TableCell>{k.usage_count}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {k.last_used_at
                          ? format(new Date(k.last_used_at), "d MMM yyyy HH:mm", { locale: sv })
                          : "Aldrig"}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggle(k)}
                          title={k.is_active ? "Inaktivera" : "Aktivera"}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteId(k.id)}
                          title="Ta bort"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Skapa ny partner</DialogTitle>
            <DialogDescription>
              En unik API-nyckel genereras. Du kan bara se nyckeln en gång – kopiera den direkt!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="name">Partnerns namn</Label>
              <Input
                id="name"
                placeholder="t.ex. Facebook Marketing AB"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="source">Källtagg</Label>
              <Input
                id="source"
                placeholder="t.ex. facebook_ads"
                value={sourceTag}
                onChange={(e) => setSourceTag(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Används för att märka deras bokningar. Endast bokstäver, siffror, _ och -.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={submitting}>
              Avbryt
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Skapa nyckel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Show new key dialog */}
      <Dialog open={!!newKey} onOpenChange={(o) => !o && setNewKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🔑 Din nya API-nyckel</DialogTitle>
            <DialogDescription>
              Kopiera nyckeln NU och skicka till partnern. Den visas aldrig igen!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="bg-muted p-3 rounded-md flex items-center gap-2">
              <code className="flex-1 text-xs break-all">{newKey?.api_key}</code>
              <Button size="sm" variant="ghost" onClick={() => newKey && copy(newKey.api_key)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm space-y-1">
              <p><strong>Partner:</strong> {newKey?.name}</p>
              <p><strong>Källtagg:</strong> <code className="text-xs">{newKey?.source_tag}</code></p>
            </div>
            <div className="bg-muted border border-border rounded-md p-3 text-sm">
              ⚠️ Skicka nyckeln till partnern via en säker kanal. Vi sparar bara en hashad version
              och kan aldrig visa den igen.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" asChild>
              <Link to="/partners/docs">
                <ExternalLink className="h-4 w-4 mr-2" />
                Visa dokumentation
              </Link>
            </Button>
            <Button onClick={() => setNewKey(null)}>Klar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ta bort partner-nyckel?</AlertDialogTitle>
            <AlertDialogDescription>
              Detta kan inte ångras. Partnern kommer omedelbart förlora tillgång till API:t.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Ta bort</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
