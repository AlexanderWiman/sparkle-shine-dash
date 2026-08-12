import { z } from "zod";

// Swedish phone number validation - accepts formats like:
// 0701234567, 070-123 45 67, +46701234567, +46 70 123 45 67
const phoneRegex = /^(\+46|0)[\s-]?[1-9]\d{0,2}[\s-]?\d{2,3}[\s-]?\d{2}[\s-]?\d{2}$/;

// Swedish vehicle registration - ABC 123 or ABC123 format
const registrationRegex = /^[A-Z]{3}\s?\d{2}[A-Z0-9]$/i;

// Email validation with proper format
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const customerInfoSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Namn måste vara minst 2 tecken")
    .max(100, "Namn får vara max 100 tecken"),
  
  customerEmail: z
    .string()
    .trim()
    .min(1, "E-post krävs")
    .max(255, "E-post får vara max 255 tecken")
    .regex(emailRegex, "Ogiltig e-postadress"),
  
  customerPhone: z
    .string()
    .trim()
    .min(1, "Telefonnummer krävs")
    .regex(phoneRegex, "Ogiltigt svenskt telefonnummer (t.ex. 070-123 45 67)"),
  
  vehicleBrand: z
    .string()
    .trim()
    .min(1, "Bilmärke krävs")
    .max(50, "Bilmärke får vara max 50 tecken"),
  
  vehicleModel: z
    .string()
    .trim()
    .min(1, "Modell krävs")
    .max(50, "Modell får vara max 50 tecken"),
  
  vehicleRegistration: z
    .string()
    .trim()
    .min(1, "Registreringsnummer krävs")
    .regex(registrationRegex, "Ogiltigt format (t.ex. ABC123 eller ABC 123)"),
});

export type CustomerInfoData = z.infer<typeof customerInfoSchema>;

export interface ValidationErrors {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleRegistration?: string;
}

export function validateCustomerInfo(data: Partial<CustomerInfoData>): {
  isValid: boolean;
  errors: ValidationErrors;
} {
  const result = customerInfoSchema.safeParse(data);
  
  if (result.success) {
    return { isValid: true, errors: {} };
  }
  
  const errors: ValidationErrors = {};
  result.error.issues.forEach((issue) => {
    const field = issue.path[0] as keyof ValidationErrors;
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  });
  
  return { isValid: false, errors };
}

export function validateField(
  field: keyof CustomerInfoData,
  value: string
): string | undefined {
  const testData = {
    customerName: field === 'customerName' ? value : 'Test',
    customerEmail: field === 'customerEmail' ? value : 'test@test.com',
    customerPhone: field === 'customerPhone' ? value : '0701234567',
    vehicleBrand: field === 'vehicleBrand' ? value : 'Test',
    vehicleModel: field === 'vehicleModel' ? value : 'Test',
    vehicleRegistration: field === 'vehicleRegistration' ? value : 'ABC123',
  };
  
  const result = customerInfoSchema.safeParse(testData);
  
  if (result.success) return undefined;
  
  const fieldError = result.error.issues.find(
    (issue) => issue.path[0] === field
  );
  
  return fieldError?.message;
}

// Format phone number for display
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('46') && cleaned.length >= 11) {
    return `+46 ${cleaned.slice(2, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9, 11)}`;
  }
  
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
  }
  
  return phone;
}

// Format registration number
export function formatRegistration(reg: string): string {
  const cleaned = reg.replace(/\s/g, '').toUpperCase();
  if (cleaned.length === 6) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  }
  return cleaned;
}
