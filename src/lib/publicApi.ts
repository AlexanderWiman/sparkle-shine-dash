// Public API functions that don't require authentication

const FUNCTIONS_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bookings`;

export interface FacilityOpeningHours {
  weekdays: string;
  saturday: string;
  sunday: string;
}

interface Facility {
  id: string;
  name: string;
  openingHoursWeekdays: string;
  openingHoursSaturday: string;
  openingHoursSunday?: string | null;
  phone?: string | null;
  isActive: boolean;
}

// Fetch opening hours from the first active facility
export const fetchPublicOpeningHours = async (): Promise<FacilityOpeningHours | null> => {
  try {
    const url = new URL(FUNCTIONS_BASE_URL);
    url.searchParams.set("resource", "facilities");
    url.searchParams.set("activeOnly", "true");

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch public facilities");
      return null;
    }

    const data = await response.json();
    
    if (!data.success || !data.data || data.data.length === 0) {
      return null;
    }

    // Get the first active facility
    const facility: Facility = data.data[0];

    return {
      weekdays: facility.openingHoursWeekdays || "10:00 - 19:00",
      saturday: facility.openingHoursSaturday || "10:00 - 18:00",
      sunday: facility.openingHoursSunday || "11:00 - 18:00",
    };
  } catch (error) {
    console.error("Error fetching public opening hours:", error);
    return null;
  }
};
