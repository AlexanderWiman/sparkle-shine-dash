import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MapPin, Loader2 } from "lucide-react";

interface FacilityMapPickerProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
}

const fetchMapboxToken = async (): Promise<string | null> => {
  try {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/public-config?key=mapbox_token`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch Mapbox token");
      return null;
    }

    const data = await response.json();
    return data.success ? data.value : null;
  } catch (error) {
    console.error("Error fetching Mapbox token:", error);
    return null;
  }
};

export function FacilityMapPicker({ latitude, longitude, onLocationChange }: FacilityMapPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);

  // Fetch token on mount
  useEffect(() => {
    const loadToken = async () => {
      setIsLoading(true);
      const token = await fetchMapboxToken();
      setMapboxToken(token);
      setIsLoading(false);
    };
    loadToken();
  }, []);

  // Initialize map when token is available
  useEffect(() => {
    if (mapContainer.current && !mapInitialized && mapboxToken) {
      initializeMap(mapboxToken);
    }
  }, [mapboxToken, mapInitialized]);

  const initializeMap = (token: string) => {
    if (!mapContainer.current) return;

    try {
      mapboxgl.accessToken = token;

      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [longitude || 18.0686, latitude || 59.3293],
        zoom: 13,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Add marker
      marker.current = new mapboxgl.Marker({
        draggable: true,
        color: "#FF0000",
      })
        .setLngLat([longitude || 18.0686, latitude || 59.3293])
        .addTo(map.current);

      // Update coordinates when marker is dragged
      marker.current.on("dragend", () => {
        if (marker.current) {
          const lngLat = marker.current.getLngLat();
          // Format to 6 decimals and ensure dot notation
          const formattedLat = parseFloat(lngLat.lat.toFixed(6));
          const formattedLng = parseFloat(lngLat.lng.toFixed(6));
          onLocationChange(formattedLat, formattedLng);
          toast.success("Koordinater uppdaterade");
        }
      });

      // Add click handler to move marker
      map.current.on("click", (e) => {
        if (marker.current) {
          marker.current.setLngLat(e.lngLat);
          // Format to 6 decimals and ensure dot notation
          const formattedLat = parseFloat(e.lngLat.lat.toFixed(6));
          const formattedLng = parseFloat(e.lngLat.lng.toFixed(6));
          onLocationChange(formattedLat, formattedLng);
          toast.success("Koordinater uppdaterade");
        }
      });

      setMapInitialized(true);
      toast.success("Karta initierad!");
    } catch (error) {
      console.error("Error initializing map:", error);
      toast.error("Kunde inte initiera karta.");
    }
  };

  // Update marker position when coordinates change externally
  useEffect(() => {
    if (marker.current && mapInitialized) {
      marker.current.setLngLat([longitude, latitude]);
      map.current?.flyTo({ center: [longitude, latitude], zoom: 13 });
    }
  }, [latitude, longitude, mapInitialized]);

  // Cleanup
  useEffect(() => {
    return () => {
      map.current?.remove();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="w-full h-[400px] rounded-lg border shadow-sm flex items-center justify-center bg-muted">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Laddar karta...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div className="space-y-4">
        <div className="w-full h-[400px] rounded-lg border shadow-sm flex items-center justify-center bg-muted">
          <div className="text-center text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2" />
            <p>Kunde inte ladda kartan</p>
            <p className="text-sm">Mapbox-token saknas</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>Klicka på kartan eller dra markören för att sätta koordinater</span>
        </div>
        <div
          ref={mapContainer}
          className="w-full h-[400px] rounded-lg border shadow-sm"
        />
      </div>
    </div>
  );
}
