import { supabase } from "@/integrations/supabase/client";
import { handleSessionExpiry, isSessionExpiredError } from "./sessionHandler";

const FUNCTIONS_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bookings`;

const getHeaders = async () => {
  // First try getSession - this uses cached session
  let { data: { session } } = await supabase.auth.getSession();
  
  // If no session or token looks expired, force refresh
  if (!session?.access_token) {
    console.log("No session found, attempting refresh...");
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) {
      console.error("Session refresh failed:", refreshError.message);
    }
    session = refreshData.session;
  } else {
    // Check if token is about to expire (within 60 seconds)
    const expiresAt = session.expires_at;
    if (expiresAt) {
      const now = Math.floor(Date.now() / 1000);
      if (expiresAt - now < 60) {
        console.log("Token expiring soon, refreshing...");
        const { data: refreshData } = await supabase.auth.refreshSession();
        if (refreshData.session) {
          session = refreshData.session;
        }
      }
    }
  }
  
  if (!session?.access_token) {
    console.warn("No valid session available for API call");
  }
  
  return {
    apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    "Content-Type": "application/json",
    ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
  };
};

export interface Facility {
  id: string;
  name: string;
  streetAddress: string;
  postalCode: string;
  city: string;
  latitude: number;
  longitude: number;
  geofenceRadius: number;
  capacity: number;
  openingHoursWeekdays: string;
  openingHoursSaturday: string;
  openingHoursSunday?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  error?: string;
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  let data: ApiResponse<T> | null = null;

  try {
    const text = await response.text();
    if (text) {
      data = JSON.parse(text) as ApiResponse<T>;
    }
  } catch (parseError) {
    console.error("Failed to parse facilities response JSON", parseError);
  }

  if (!response.ok) {
    console.error("Facilities edge error (non-OK status)", { status: response.status, data });
    
    // Check for session expiry (401 status or auth-related errors)
    if (response.status === 401 || isSessionExpiredError(new Error(data?.error || ''))) {
      handleSessionExpiry();
      throw new Error('SESSION_EXPIRED');
    }
    
    throw new Error(data?.error || `Failed to call facilities API (status ${response.status})`);
  }

  if (!data) {
    // No body but request succeeded (e.g. 204 No Content). Callers usually don't need the payload.
    return undefined as unknown as T;
  }

  if (!data.success) {
    if (isSessionExpiredError(new Error(data.error || ''))) {
      handleSessionExpiry();
      throw new Error('SESSION_EXPIRED');
    }
    throw new Error(data.error || "Facilities API returned error");
  }

  return data.data;
};

// Fetch all facilities
export const fetchFacilities = async (activeOnly = false): Promise<Facility[]> => {
  const url = new URL(FUNCTIONS_BASE_URL);
  url.searchParams.set("resource", "facilities");
  if (activeOnly) {
    url.searchParams.set("activeOnly", "true");
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: await getHeaders(),
  });

  return handleResponse<Facility[]>(response);
};

// Fetch a specific facility
export const fetchFacility = async (id: string): Promise<Facility> => {
  const url = new URL(FUNCTIONS_BASE_URL);
  url.searchParams.set("resource", "facilities");
  url.searchParams.set("id", id);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: await getHeaders(),
  });

  return handleResponse<Facility>(response);
};

// Create a new facility
export const createFacility = async (facilityData: Partial<Facility>): Promise<Facility> => {
  const url = new URL(FUNCTIONS_BASE_URL);
  url.searchParams.set("resource", "facilities");

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: await getHeaders(),
    body: JSON.stringify(facilityData),
  });

  return handleResponse<Facility>(response);
};

// Update a facility
export const updateFacility = async (id: string, updates: Partial<Facility>): Promise<Facility> => {
  const url = new URL(FUNCTIONS_BASE_URL);
  url.searchParams.set("resource", "facilities");
  url.searchParams.set("id", id);

  const response = await fetch(url.toString(), {
    method: "PUT",
    headers: await getHeaders(),
    body: JSON.stringify(updates),
  });

  return handleResponse<Facility>(response);
};

// Delete a facility (soft delete)
export const deleteFacility = async (id: string): Promise<Facility> => {
  const url = new URL(FUNCTIONS_BASE_URL);
  url.searchParams.set("resource", "facilities");
  url.searchParams.set("id", id);

  const response = await fetch(url.toString(), {
    method: "DELETE",
    headers: await getHeaders(),
  });

  return handleResponse<Facility>(response);
};
