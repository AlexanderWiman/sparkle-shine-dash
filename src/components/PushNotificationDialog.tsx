import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface PushNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Location {
  id: string;
  name: string;
  city: string;
}


type TargetType = "all" | "user" | "booking" | "location";

export function PushNotificationDialog({ open, onOpenChange }: PushNotificationDialogProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState<TargetType>("all");
  const [userEmail, setUserEmail] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  
  // Scheduling fields
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [scheduledTime, setScheduledTime] = useState("12:00");

  // Fetch locations when target is location
  useEffect(() => {
    if (target === "location" && open) {
      fetchLocations();
    }
  }, [target, open]);

  const fetchLocations = async () => {
    setLoadingLocations(true);
    try {
      const response = await supabase.functions.invoke("bookings", {
        body: { resource: "facilities" },
      });
      
      if (response.data?.success) {
        setLocations(response.data.data);
      } else {
        toast.error("Kunde inte hämta anläggningar");
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast.error("Kunde inte hämta anläggningar");
    } finally {
      setLoadingLocations(false);
    }
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      toast.error("Titel krävs");
      return false;
    }
    if (!message.trim()) {
      toast.error("Meddelande krävs");
      return false;
    }
    if (target === "user" && !userEmail.trim()) {
      toast.error("E-post krävs för specifik användare");
      return false;
    }
    if (target === "booking" && !bookingId.trim()) {
      toast.error("Boknings-ID krävs");
      return false;
    }
    if (target === "location" && !locationId) {
      toast.error("Anläggning måste väljas");
      return false;
    }
    if (isScheduled && !scheduledDate) {
      toast.error("Datum krävs för schemalagd notis");
      return false;
    }
    if (isScheduled && scheduledDate) {
      const scheduledDateTime = new Date(scheduledDate);
      const [hours, minutes] = scheduledTime.split(":");
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));
      
      if (scheduledDateTime <= new Date()) {
        toast.error("Schemaläggningstiden måste vara i framtiden");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isScheduled && scheduledDate) {
        // Save to database for scheduled sending
        const scheduledDateTime = new Date(scheduledDate);
        const [hours, minutes] = scheduledTime.split(":");
        scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));

        const { error } = await supabase.from("scheduled_notifications").insert({
          title: title.trim(),
          message: message.trim(),
          target,
          user_id: target === "user" ? userEmail : null,
          booking_id: target === "booking" ? bookingId : null,
          location_id: target === "location" ? locationId : null,
          scheduled_for: scheduledDateTime.toISOString(),
          status: "pending",
        });

        if (error) {
          console.error("Error scheduling notification:", error);
          toast.error("Kunde inte schemalägga notifikation");
        } else {
          toast.success(`Push-notis schemalagd för ${format(scheduledDateTime, "PPP 'kl.' HH:mm", { locale: sv })}`);
          resetForm();
          onOpenChange(false);
        }
      } else {
        // Send immediately via edge function
        const payload = {
          title: title.trim(),
          message: message.trim(),
          target,
          userId: target === "user" ? userEmail : null,
          bookingId: target === "booking" ? bookingId : null,
          locationId: target === "location" ? locationId : null,
        };

        const { data, error } = await supabase.functions.invoke("send-push-notification", {
          body: payload,
        });

        if (error) {
          console.error("Error sending push notification:", error);
          toast.error(error.message || "Kunde inte skicka push-notifikation");
        } else if (data?.success) {
          toast.success("Push-notifikation skickad!");
          resetForm();
          onOpenChange(false);
        } else {
          toast.error(data?.error || "Kunde inte skicka push-notifikation");
        }
      }
    } catch (error) {
      console.error("Error with push notification:", error);
      toast.error("Ett fel uppstod");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setMessage("");
    setTarget("all");
    setUserEmail("");
    setBookingId("");
    setLocationId("");
    setIsScheduled(false);
    setScheduledDate(undefined);
    setScheduledTime("12:00");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Skicka push-notis</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
              📌 Bra att tänka på när du skickar pushnotiser
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li className="flex gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span><strong>Skicka inte för ofta</strong> - Begränsa till viktiga meddelanden för att undvika att användare stänger av notiser</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span><strong>Undvik nattid</strong> - Schemalägg notiser mellan 08:00-21:00 om det inte är akut</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span><strong>Var specifik och kort</strong> - Skriv tydligt vad meddelandet handlar om (max 500 tecken)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span><strong>Relevant mottagare</strong> - Skicka endast till de användare som berörs istället för alla</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span><strong>Testa först</strong> - Använd "Specifik användare" för att testa notiser innan du skickar till alla</span>
              </li>
            </ul>
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              placeholder="T.ex. Påminnelse om din bokning"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              required
            />
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <Label htmlFor="message">Meddelande *</Label>
            <Textarea
              id="message"
              placeholder="Skriv ditt meddelande här..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={500}
              required
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/500 tecken
            </p>
          </div>

          {/* Target Selector */}
          <div className="space-y-2">
            <Label htmlFor="target">Mottagare *</Label>
            <Select value={target} onValueChange={(value) => setTarget(value as TargetType)}>
              <SelectTrigger id="target">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla användare</SelectItem>
                <SelectItem value="user">Specifik användare (e-post)</SelectItem>
                <SelectItem value="booking">Specifik bokning</SelectItem>
                <SelectItem value="location">Specifik anläggning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional Fields Based on Target */}
          {target === "user" && (
            <div className="space-y-2">
              <Label htmlFor="userEmail">E-postadress *</Label>
              <Input
                id="userEmail"
                type="email"
                placeholder="exempel@email.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                required
              />
            </div>
          )}

          {target === "booking" && (
            <div className="space-y-2">
              <Label htmlFor="bookingId">Boknings-ID *</Label>
              <Input
                id="bookingId"
                placeholder="Ange boknings-ID"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                required
              />
            </div>
          )}

          {target === "location" && (
            <div className="space-y-2">
              <Label htmlFor="locationId">Anläggning *</Label>
              {loadingLocations ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Select value={locationId} onValueChange={setLocationId}>
                  <SelectTrigger id="locationId">
                    <SelectValue placeholder="Välj anläggning" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name} - {location.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Scheduling Toggle */}
          <div className="flex items-center justify-between space-y-2 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="scheduled" className="cursor-pointer">
                Schemalägg för senare
              </Label>
            </div>
            <Switch
              id="scheduled"
              checked={isScheduled}
              onCheckedChange={setIsScheduled}
            />
          </div>

          {/* Scheduling Date & Time */}
          {isScheduled && (
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <div className="space-y-2">
                <Label>Datum *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !scheduledDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledDate ? format(scheduledDate, "PPP", { locale: sv }) : "Välj datum"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const checkDate = new Date(date);
                        checkDate.setHours(0, 0, 0, 0);
                        return checkDate < today;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledTime">Tid *</Label>
                <Input
                  id="scheduledTime"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  required
                />
              </div>

              {scheduledDate && (
                <div className="text-sm text-muted-foreground bg-background p-2 rounded border">
                  <strong>Schemaläggs för:</strong>{" "}
                  {format(
                    new Date(
                      scheduledDate.setHours(
                        parseInt(scheduledTime.split(":")[0]),
                        parseInt(scheduledTime.split(":")[1])
                      )
                    ),
                    "PPP 'kl.' HH:mm",
                    { locale: sv }
                  )}
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Avbryt
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isScheduled ? "Schemalägger..." : "Skickar..."}
                </>
              ) : (
                isScheduled ? "Schemalägg notis" : "Skicka notis"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
