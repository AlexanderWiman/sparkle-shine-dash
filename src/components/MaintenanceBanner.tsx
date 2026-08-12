import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function MaintenanceBanner() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadMaintenanceMode();

    // Subscribe to changes in maintenance mode
    const channel = supabase
      .channel('maintenance_mode_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'system_settings',
          filter: 'key=eq.maintenance_mode'
        },
        (payload: any) => {
          const value = payload.new.value as { enabled: boolean; message: string };
          setIsEnabled(value.enabled);
          setMessage(value.message);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadMaintenanceMode = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'maintenance_mode')
        .single();

      if (error) throw error;
      const value = data.value as { enabled: boolean; message: string };
      setIsEnabled(value.enabled);
      setMessage(value.message);
    } catch (error) {
      console.error('Error loading maintenance mode:', error);
    }
  };

  if (!isEnabled) return null;

  return (
    <Alert className="rounded-none border-x-0 border-t-0 bg-yellow-500/10 border-yellow-500/50">
      <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
      <AlertTitle className="text-yellow-800 dark:text-yellow-400">Underhållsarbete pågår</AlertTitle>
      <AlertDescription className="text-yellow-700 dark:text-yellow-500">
        {message || "Vi utför för närvarande underhållsarbete på servern. Vissa funktioner kan vara tillfälligt begränsade."}
      </AlertDescription>
    </Alert>
  );
}
