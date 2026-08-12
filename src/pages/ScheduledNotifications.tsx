import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PushNotificationDialog } from "@/components/PushNotificationDialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { Clock, Trash2, CheckCircle, XCircle, Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ScheduledNotification {
  id: string;
  title: string;
  message: string;
  target: string;
  user_id: string | null;
  booking_id: string | null;
  location_id: string | null;
  scheduled_for: string;
  status: "pending" | "sent" | "failed" | "cancelled";
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
}

const ScheduledNotifications = () => {
  const [notifications, setNotifications] = useState<ScheduledNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    fetchNotifications();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('scheduled_notifications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scheduled_notifications',
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("scheduled_notifications")
        .select("*")
        .order("scheduled_for", { ascending: true });

      if (error) {
        console.error("Error fetching notifications:", error);
        toast.error("Kunde inte hämta schemalagda notiser");
      } else {
        setNotifications((data || []) as ScheduledNotification[]);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Ett fel uppstod");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    setCancelling(id);
    try {
      const { error } = await supabase
        .from("scheduled_notifications")
        .update({ status: "cancelled" })
        .eq("id", id);

      if (error) {
        console.error("Error cancelling notification:", error);
        toast.error("Kunde inte avbryta notis");
      } else {
        toast.success("Notis avbruten");
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Ett fel uppstod");
    } finally {
      setCancelling(null);
      setDeleteId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string, icon: any }> = {
      pending: { variant: "secondary", label: "Väntande", icon: Clock },
      sent: { variant: "default", label: "Skickad", icon: CheckCircle },
      failed: { variant: "destructive", label: "Misslyckades", icon: XCircle },
      cancelled: { variant: "outline", label: "Avbruten", icon: XCircle },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getTargetLabel = (notification: ScheduledNotification) => {
    switch (notification.target) {
      case "all":
        return "Alla användare";
      case "user":
        return `Användare: ${notification.user_id}`;
      case "booking":
        return `Bokning: ${notification.booking_id}`;
      case "location":
        return `Anläggning: ${notification.location_id}`;
      default:
        return notification.target;
    }
  };

  const isPending = (notification: ScheduledNotification) => 
    notification.status === "pending";

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/5 p-2 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-2xl md:text-3xl">Schemalagda notiser</CardTitle>
                <CardDescription>
                  Översikt över alla schemalagda push-notiser. Kom ihåg att inte schemalägga för många notiser och undvik nattid.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col sm:flex-row gap-2">
                <Button onClick={() => setShowDialog(true)} size="sm" className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Skapa ny notis
                </Button>
                <Button onClick={fetchNotifications} variant="outline" size="sm" className="w-full sm:w-auto">
                  Uppdatera
                </Button>
              </div>
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">Laddar notiser...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Inga schemalagda notiser</p>
                  <p className="text-sm">Schemalägg en notis från push-notis-dialogen</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titel</TableHead>
                        <TableHead>Mottagare</TableHead>
                        <TableHead>Schemalagd tid</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Skickad</TableHead>
                        <TableHead>Åtgärd</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notifications.map((notification) => (
                        <TableRow key={notification.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{notification.title}</div>
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {notification.message}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {getTargetLabel(notification)}
                          </TableCell>
                          <TableCell>
                            {format(new Date(notification.scheduled_for), "PPP 'kl.' HH:mm", {
                              locale: sv,
                            })}
                          </TableCell>
                          <TableCell>{getStatusBadge(notification.status)}</TableCell>
                          <TableCell>
                            {notification.sent_at
                              ? format(new Date(notification.sent_at), "PPp", { locale: sv })
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {isPending(notification) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteId(notification.id)}
                                disabled={cancelling === notification.id}
                              >
                                {cancelling === notification.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Avbryt
                                  </>
                                )}
                              </Button>
                            )}
                            {notification.status === "failed" && notification.error_message && (
                              <div className="text-xs text-destructive">
                                {notification.error_message}
                              </div>
                            )}
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

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Avbryt schemalagd notis?</AlertDialogTitle>
            <AlertDialogDescription>
              Denna åtgärd kan inte ångras. Den schemalagda notisen kommer inte att skickas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Nej, behåll</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleCancel(deleteId)}>
              Ja, avbryt notis
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PushNotificationDialog open={showDialog} onOpenChange={setShowDialog} />
    </Layout>
  );
};

export default ScheduledNotifications;
