import { z } from 'zod';

// Common validation patterns
const phoneRegex = /^[\d\s+\-()]+$/;
const usernameRegex = /^[a-z0-9_]+$/;
const postalCodeRegex = /^\d{5}$/;
const vehicleRegex = /^[A-ZÅÄÖ0-9]+$/;

// Password validation - requires minimum 8 characters with complexity
const passwordMinLength = 8;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;

// User validation schemas
export const userCreationSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Användarnamn måste vara minst 3 tecken')
    .max(50, 'Användarnamn får inte vara längre än 50 tecken')
    .regex(usernameRegex, 'Användarnamn får bara innehålla små bokstäver, siffror och understreck')
    .toLowerCase(),
  display_name: z
    .string()
    .trim()
    .min(2, 'Namn måste vara minst 2 tecken')
    .max(100, 'Namn får inte vara längre än 100 tecken'),
  phone: z
    .string()
    .trim()
    .max(20, 'Telefonnummer får inte vara längre än 20 tecken')
    .regex(phoneRegex, 'Ogiltigt telefonnummer')
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(passwordMinLength, `Lösenord måste vara minst ${passwordMinLength} tecken`)
    .regex(
      passwordRegex,
      'Lösenord måste innehålla minst en stor bokstav, en liten bokstav, en siffra och ett specialtecken (@$!%*?&.)'
    ),
  role: z.enum(['admin', 'chef', 'arbetare'], {
    errorMap: () => ({ message: 'Ogiltig roll' }),
  }),
  facility_id: z
    .string()
    .uuid('Ogiltigt anläggnings-ID')
    .optional()
    .or(z.literal('')),
});

export const userDeletionSchema = z.object({
  userId: z.string().uuid('Ogiltigt användar-ID'),
});

export type UserCreationData = z.infer<typeof userCreationSchema>;

// Booking validation schemas
export const bookingSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, 'Namn måste vara minst 2 tecken')
    .max(100, 'Namn får inte vara längre än 100 tecken'),
  customerEmail: z
    .string()
    .trim()
    .email('Ogiltig e-postadress')
    .max(255, 'E-post får inte vara längre än 255 tecken'),
  customerPhone: z
    .string()
    .trim()
    .max(20, 'Telefonnummer får inte vara längre än 20 tecken')
    .regex(phoneRegex, 'Ogiltigt telefonnummer')
    .optional()
    .or(z.literal('')),
  vehicleBrand: z
    .string()
    .trim()
    .min(1, 'Märke krävs')
    .max(50, 'Märke får inte vara längre än 50 tecken'),
  vehicleModel: z
    .string()
    .trim()
    .min(1, 'Modell krävs')
    .max(50, 'Modell får inte vara längre än 50 tecken'),
  vehicleRegistration: z
    .string()
    .trim()
    .toUpperCase()
    .min(1, 'Registreringsnummer krävs')
    .max(10, 'Registreringsnummer får inte vara längre än 10 tecken')
    .regex(vehicleRegex, 'Ogiltigt registreringsnummer'),
  serviceType: z
    .string()
    .trim()
    .min(1, 'Tjänstetyp krävs')
    .max(100, 'Tjänstetyp får inte vara längre än 100 tecken'),
  bookingDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ogiltigt datum (format: ÅÅÅÅ-MM-DD)'),
  bookingTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Ogiltig tid (format: HH:MM)'),
  facility_id: z.string().uuid('Ogiltigt anläggnings-ID'),
  status: z
    .enum(['pending', 'paid', 'completed', 'cancelled'], {
      errorMap: () => ({ message: 'Ogiltig status' }),
    })
    .optional(),
});

export type BookingData = z.infer<typeof bookingSchema>;

// Facility validation schemas
export const facilitySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Namn måste vara minst 2 tecken')
    .max(100, 'Namn får inte vara längre än 100 tecken'),
  streetAddress: z
    .string()
    .trim()
    .min(3, 'Gatuadress måste vara minst 3 tecken')
    .max(200, 'Gatuadress får inte vara längre än 200 tecken'),
  postalCode: z
    .string()
    .trim()
    .regex(postalCodeRegex, 'Postnummer måste vara 5 siffror'),
  city: z
    .string()
    .trim()
    .min(2, 'Stad måste vara minst 2 tecken')
    .max(100, 'Stad får inte vara längre än 100 tecken'),
  latitude: z
    .number()
    .min(-90, 'Latitud måste vara mellan -90 och 90')
    .max(90, 'Latitud måste vara mellan -90 och 90'),
  longitude: z
    .number()
    .min(-180, 'Longitud måste vara mellan -180 och 180')
    .max(180, 'Longitud måste vara mellan -180 och 180'),
  geofenceRadius: z
    .number()
    .int('Geofence-radie måste vara ett heltal')
    .min(50, 'Geofence-radie måste vara minst 50 meter')
    .max(5000, 'Geofence-radie får inte vara större än 5000 meter'),
  phone: z
    .string()
    .trim()
    .max(20, 'Telefonnummer får inte vara längre än 20 tecken')
    .regex(phoneRegex, 'Ogiltigt telefonnummer')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .trim()
    .email('Ogiltig e-postadress')
    .max(255, 'E-post får inte vara längre än 255 tecken')
    .optional()
    .or(z.literal('')),
  openingHoursWeekdays: z
    .string()
    .trim()
    .max(50, 'Öppettider får inte vara längre än 50 tecken')
    .optional()
    .or(z.literal('')),
  openingHoursSaturday: z
    .string()
    .trim()
    .max(50, 'Öppettider får inte vara längre än 50 tecken')
    .optional()
    .or(z.literal('')),
  openingHoursSunday: z
    .string()
    .trim()
    .max(50, 'Öppettider får inte vara längre än 50 tecken')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean(),
});

export const facilityUpdateSchema = facilitySchema.partial().extend({
  name: z
    .string()
    .trim()
    .min(2, 'Namn måste vara minst 2 tecken')
    .max(100, 'Namn får inte vara längre än 100 tecken'),
  streetAddress: z
    .string()
    .trim()
    .min(3, 'Gatuadress måste vara minst 3 tecken')
    .max(200, 'Gatuadress får inte vara längre än 200 tecken'),
  city: z
    .string()
    .trim()
    .min(2, 'Stad måste vara minst 2 tecken')
    .max(100, 'Stad får inte vara längre än 100 tecken'),
});

export type FacilityData = z.infer<typeof facilitySchema>;
export type FacilityUpdateData = z.infer<typeof facilityUpdateSchema>;

// Setup admin validation
export const setupAdminSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Användarnamn måste vara minst 3 tecken')
    .max(50, 'Användarnamn får inte vara längre än 50 tecken')
    .regex(usernameRegex, 'Användarnamn får bara innehålla små bokstäver, siffror och understreck')
    .toLowerCase(),
  display_name: z
    .string()
    .trim()
    .min(2, 'Namn måste vara minst 2 tecken')
    .max(100, 'Namn får inte vara längre än 100 tecken'),
  password: z
    .string()
    .min(passwordMinLength, `Lösenord måste vara minst ${passwordMinLength} tecken`)
    .regex(
      passwordRegex,
      'Lösenord måste innehålla minst en stor bokstav, en liten bokstav, en siffra och ett specialtecken (@$!%*?&.)'
    ),
});

export type SetupAdminData = z.infer<typeof setupAdminSchema>;

// Helper function to format zod errors for user display
export function formatZodErrors(error: z.ZodError): string {
  return error.errors.map(err => err.message).join(', ');
}
