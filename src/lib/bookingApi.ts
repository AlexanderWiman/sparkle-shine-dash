import { supabase } from "@/integrations/supabase/client";
import { handleSessionExpiry, isSessionExpiredError } from "./sessionHandler";

interface TimeSlot {
  time: string;
  bookedCount: number;
  available: number;
}

interface AvailabilityResponse {
  capacity: number;
  timeSlots: TimeSlot[];
  bookedTimes?: string[]; // Backward compatibility
}

interface Booking {
  id: string;
  bookingNumber?: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  addons?: Array<{ id: string; name: string; price: number }>;
  extras?: Array<{ id: string; name: string; price?: number; percentage?: number }>;
  totalPrice: number;
  date: string;
  time: string;
  location: string;
  installationId?: string;
  customerName: string;
  email: string;
  phone: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleRegistration: string;
  status: 'pending' | 'paid' | 'cancelled' | 'completed';
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Simple in-memory cache + in-flight dedupe + retry-with-backoff for fetchBookings
// Reason: backend rate-limits per IP (429). Multiple components mounting at once
// (Dashboard, Tabs, WeekOverview, Customers) would each trigger their own request.
const BOOKINGS_CACHE_TTL_MS = 8000;
let bookingsCache: { data: Booking[]; ts: number } | null = null;
let bookingsInFlight: Promise<Booking[]> | null = null;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const isRateLimitError = (msg: string) =>
  /429|too many requests/i.test(msg || '');

const doFetchBookings = async (attempt = 0): Promise<Booking[]> => {
  const { data, error } = await supabase.functions.invoke<ApiResponse<Booking[]>>('bookings', {
    method: 'GET',
  });

  const errMsg = error?.message || (!data?.success ? data?.error || '' : '');
  if (errMsg && isRateLimitError(errMsg) && attempt < 3) {
    const delay = 800 * Math.pow(2, attempt) + Math.random() * 300;
    console.warn(`[bookings] 429 rate limited, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/3)`);
    await sleep(delay);
    return doFetchBookings(attempt + 1);
  }

  if (error) {
    console.error('Error fetching bookings:', error);
    throw new Error(error.message || 'Failed to fetch bookings');
  }
  if (!data?.success) {
    throw new Error(data?.error || 'Failed to fetch bookings');
  }
  return data.data;
};

// Fetch all bookings (cached + deduped + auto-retry on 429)
export const fetchBookings = async (options?: { force?: boolean }): Promise<Booking[]> => {
  if (!options?.force && bookingsCache && Date.now() - bookingsCache.ts < BOOKINGS_CACHE_TTL_MS) {
    return bookingsCache.data;
  }
  if (bookingsInFlight) return bookingsInFlight;

  bookingsInFlight = (async () => {
    try {
      const result = await doFetchBookings();
      bookingsCache = { data: result, ts: Date.now() };
      return result;
    } finally {
      bookingsInFlight = null;
    }
  })();

  return bookingsInFlight;
};

// Invalidate the bookings cache (call after mutations)
export const invalidateBookingsCache = () => {
  bookingsCache = null;
};


// Fetch a specific booking
export const fetchBooking = async (id: string): Promise<Booking> => {
  const { data, error } = await supabase.functions.invoke<ApiResponse<Booking>>('bookings', {
    method: 'GET',
    body: { id },
  });

  if (error) {
    console.error('Error fetching booking:', error);
    throw new Error(error.message || 'Failed to fetch booking');
  }

  if (!data?.success) {
    throw new Error(data?.error || 'Failed to fetch booking');
  }

  return data.data;
};

// Create a new booking
export const createBooking = async (bookingData: Partial<Booking>): Promise<Booking> => {
  const { data, error } = await supabase.functions.invoke<ApiResponse<Booking>>('bookings', {
    method: 'POST',
    body: bookingData,
  });

  if (error) {
    console.error('Error creating booking:', error);
    throw new Error(error.message || 'Failed to create booking');
  }

  if (!data?.success) {
    throw new Error(data?.error || 'Failed to create booking');
  }

  invalidateBookingsCache();
  return data.data;
};


// Update a booking
export const updateBooking = async (id: string, updates: Partial<Booking>): Promise<Booking> => {
  // Get the current session token
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  
  if (!token) {
    const authError = new Error('SESSION_EXPIRED');
    authError.name = 'AuthenticationError';
    throw authError;
  }

  const { data, error } = await supabase.functions.invoke<ApiResponse<Booking>>('bookings', {
    method: 'PUT',
    body: { ...updates, id },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (error) {
    console.error('Error updating booking:', error);
    if (isSessionExpiredError(error) || isSessionExpiredError(new Error(error.message))) {
      handleSessionExpiry();
      throw new Error('SESSION_EXPIRED');
    }
    throw new Error(error.message || 'Failed to update booking');
  }

  if (!data?.success) {
    if (isSessionExpiredError(new Error(data?.error || ''))) {
      handleSessionExpiry();
      throw new Error('SESSION_EXPIRED');
    }
    throw new Error(data?.error || 'Failed to update booking');
  }

  invalidateBookingsCache();
  return data.data;
};


// Delete a booking
export const deleteBooking = async (id: string): Promise<void> => {
  // Get the current session token
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  
  if (!token) {
    const authError = new Error('SESSION_EXPIRED');
    authError.name = 'AuthenticationError';
    throw authError;
  }

  const { data, error } = await supabase.functions.invoke<ApiResponse<null>>('bookings', {
    method: 'DELETE',
    body: { id },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (error) {
    console.error('Error deleting booking:', error);
    if (isSessionExpiredError(error) || isSessionExpiredError(new Error(error.message))) {
      handleSessionExpiry();
      throw new Error('SESSION_EXPIRED');
    }
    throw new Error(error.message || 'Failed to delete booking');
  }

  if (!data?.success) {
    if (isSessionExpiredError(new Error(data?.error || ''))) {
      handleSessionExpiry();
      throw new Error('SESSION_EXPIRED');
    }
    throw new Error(data?.error || 'Failed to delete booking');
  }
  invalidateBookingsCache();
};



// Fetch available times for a specific date and location
export const fetchAvailableTimes = async (date: string, location: string): Promise<AvailabilityResponse> => {
  const ALL_TIMES = [
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
  ];

  const { data, error } = await supabase.functions.invoke<ApiResponse<AvailabilityResponse | { bookedTimes: string[] }>>(
    `bookings?date=${encodeURIComponent(date)}&location=${encodeURIComponent(location)}`,
    {
      method: 'GET',
    }
  );

  if (error) {
    console.error('Error fetching available times:', error);
    throw new Error(error.message || 'Failed to fetch available times');
  }

  if (!data?.success) {
    throw new Error(data?.error || 'Failed to fetch available times');
  }

  // Check if we have the new format with capacity and timeSlots
  if ('capacity' in data.data && 'timeSlots' in data.data) {
    return data.data as AvailabilityResponse;
  }

  // Fallback: Convert old format (bookedTimes) to new format
  const bookedTimes = (data.data as { bookedTimes: string[] }).bookedTimes || [];
  const timeSlots: TimeSlot[] = ALL_TIMES.map((time) => ({
    time,
    bookedCount: bookedTimes.includes(time) ? 1 : 0,
    available: bookedTimes.includes(time) ? 0 : 1,
  }));

  return {
    capacity: 1, // Default capacity for backward compatibility
    timeSlots,
    bookedTimes,
  };
};

// Resend confirmation email to customer
export const resendConfirmationEmail = async (bookingId: string): Promise<void> => {
  const { data, error } = await supabase.functions.invoke<ApiResponse<{ message: string }>>(
    'bookings?resource=resend-email',
    {
      method: 'POST',
      body: { bookingId },
    }
  );

  if (error) {
    console.error('Error resending email:', error);
    throw new Error(error.message || 'Failed to resend email');
  }

  if (!data?.success) {
    throw new Error(data?.error || 'Failed to resend email');
  }
};
