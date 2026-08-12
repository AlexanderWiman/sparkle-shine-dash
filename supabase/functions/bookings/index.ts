// Deno edge function
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from 'https://esm.sh/resend@2.0.0';

const NOTIFICATION_EMAIL = 'info@carwashap.com';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

// Make.com webhook for Google Calendar integration
const MAKE_WEBHOOK_URL = 'https://hook.eu2.make.com/pcp17i8vi6r0pv36d4usqascv5h3cyz6';

const ALLOWED_ORIGINS = [
  'https://carwashap.com',
  'https://www.carwashap.com',
  'https://carwashap.se',
  'https://www.carwashap.se',
  'https://washap.bullascentral.se',
  'https://kxojnodttpeeesjwclpv.supabase.co',
];

function getCorsHeaders(origin: string | null): HeadersInit {
  const isDev = Deno.env.get('DEV_MODE') === 'true';
  const devOrigins = ['http://localhost:5173', 'http://localhost:8910', 'http://localhost:3000'];
  const allAllowedOrigins = isDev ? [...ALLOWED_ORIGINS, ...devOrigins] : ALLOWED_ORIGINS;
  const isLovablePreview = origin?.includes('.lovableproject.com') || origin?.includes('.lovable.app');
  const allowedOrigin = origin && (allAllowedOrigins.includes(origin) || isLovablePreview) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
  };
}


// Minimum booking lead time in hours
const MINIMUM_LEAD_TIME_HOURS = 1;

// Query parameter validation schemas
const dateParamSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format');
const locationParamSchema = z.string().max(200, 'Location too long');

// Helper to validate booking date/time is in the future
const validateBookingTime = (dateStr: string, timeStr: string): { valid: boolean; error?: string } => {
  const now = new Date();
  const minimumTime = new Date(now.getTime() + MINIMUM_LEAD_TIME_HOURS * 60 * 60 * 1000);
  
  // Parse the booking date and time
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  const bookingDate = new Date(year, month - 1, day, hours, minutes);
  
  if (bookingDate < minimumTime) {
    const isPast = bookingDate < now;
    return {
      valid: false,
      error: isPast 
        ? 'Den valda tiden har redan passerat'
        : `Du måste boka minst ${MINIMUM_LEAD_TIME_HOURS} timme i förväg`
    };
  }
  
  return { valid: true };
};

// Validation schema for booking data
const bookingSchema = z.object({
  customerName: z.string().trim().min(2, 'Customer name must be at least 2 characters').max(100, 'Customer name too long'),
  email: z.string().email('Invalid email address').max(255, 'Email too long'),
  phone: z.string().max(20, 'Phone number too long').optional(),
  vehicleMake: z.string().trim().min(1, 'Vehicle make is required').max(50, 'Vehicle make too long'),
  vehicleModel: z.string().trim().min(1, 'Vehicle model is required').max(50, 'Vehicle model too long'),
  vehicleRegistration: z.string().trim().min(1, 'Registration is required').max(20, 'Registration too long'),
  serviceType: z.string().min(1, 'Service type is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  facilityId: z.string().uuid('Invalid facility ID'),
  status: z.enum(['pending', 'paid', 'completed', 'cancelled']).optional(),
});

interface BackendBooking {
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
  customerName: string;
  email: string;
  phone: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleRegistration: string;
  status: 'pending' | 'paid' | 'cancelled' | 'completed';
  createdAt: string;
}

interface TimeSlot {
  time: string;
  bookedCount: number;
  available: number;
}

interface Facility {
  id: string;
  name: string;
  streetAddress: string;
  postalCode: string;
  city: string;
  latitude: number;
  longitude: number;
  geofenceRadius: number;
  openingHoursWeekdays: string;
  openingHoursSaturday: string;
  openingHoursSunday?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Send booking notification email
async function sendBookingNotificationEmail(
  booking: BackendBooking,
  type: 'new' | 'updated' | 'cancelled'
): Promise<void> {
  // Don't send emails for block bookings (hall closures)
  if (booking.serviceId === 'block' || booking.serviceName === 'Hall stängd') {
    console.log('Skipping email for block booking');
    return;
  }

  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    console.error('RESEND_API_KEY not configured, skipping email');
    return;
  }

  const formattedDateForSubject = formatSwedishDate(booking.date);
  const subjectMap: Record<string, string> = {
    new: `Ny bokning: ${booking.customerName} - ${formattedDateForSubject} kl ${booking.time}`,
    updated: `Ändrad bokning: ${booking.customerName} - ${formattedDateForSubject} kl ${booking.time}`,
    cancelled: `Avbokad tid ${formattedDateForSubject} kl ${booking.time}`,
  };
  const subject = subjectMap[type] || subjectMap.updated;

  const statusText: Record<string, string> = {
    pending: 'Bokad',
    paid: 'Betald',
    cancelled: 'Avbokad',
    completed: 'Slutförd',
  };

  const addonsHtml = booking.addons && booking.addons.length > 0
    ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Tillägg:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.addons.map(a => `${a.name} (${a.price} kr)`).join(', ')}</td></tr>`
    : '';

  const extrasHtml = booking.extras && booking.extras.length > 0
    ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Extra:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.extras.map(e => e.name).join(', ')}</td></tr>`
    : '';

  const headerColor = type === 'cancelled' ? '#EF4444' : (type === 'new' ? '#10B981' : '#3B82F6');
  const headerTitle = type === 'cancelled' ? '❌ Avbokad Tid' : (type === 'new' ? '🚗 Ny Bokning!' : '📝 Bokning Ändrad');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: ${headerColor}; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">${headerTitle}</h1>
      </div>
      
      <div style="padding: 20px; background: #f9f9f9;">
        <h2 style="color: #333; border-bottom: 2px solid #10B981; padding-bottom: 10px;">Kundinformation</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Namn:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.customerName}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>E-post:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.email}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Telefon:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.phone || 'Ej angivet'}</td></tr>
        </table>
        
        <h2 style="color: #333; border-bottom: 2px solid #10B981; padding-bottom: 10px; margin-top: 20px;">Bokning</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Bokningsnummer:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.bookingNumber || booking.id}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Datum:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.date}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Tid:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.time}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Anläggning:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.location}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Status:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${statusText[booking.status] || booking.status}</td></tr>
        </table>
        
        <h2 style="color: #333; border-bottom: 2px solid #10B981; padding-bottom: 10px; margin-top: 20px;">Tjänst</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Tjänst:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.serviceName}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Pris:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.servicePrice} kr</td></tr>
          ${addonsHtml}
          ${extrasHtml}
          <tr style="background: #e8f5e9;"><td style="padding: 12px; font-weight: bold;">Totalpris:</td><td style="padding: 12px; font-weight: bold; font-size: 18px;">${booking.totalPrice} kr</td></tr>
        </table>
        
        <h2 style="color: #333; border-bottom: 2px solid #10B981; padding-bottom: 10px; margin-top: 20px;">Fordon</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Märke:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.vehicleBrand}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Modell:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.vehicleModel}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Registreringsnummer:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.vehicleRegistration}</td></tr>
        </table>
      </div>
      
      <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">Detta är ett automatiskt meddelande från Car Washap bokningssystem</p>
      </div>
    </div>
  `;

  try {
    const emailResponse = await resend.emails.send({
      from: 'Car Washap Bokningar <bokningar@carwashap.com>',
      to: [NOTIFICATION_EMAIL],
      subject,
      html,
    });

    console.log('Booking notification email sent:', emailResponse);
  } catch (error) {
    console.error('Failed to send booking notification email:', error);
    // Don't throw - email failure shouldn't break the booking
  }
}

// Helper to format date nicely in Swedish
function formatSwedishDate(dateStr: string): string {
  const months = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 
                  'juli', 'augusti', 'september', 'oktober', 'november', 'december'];
  
  // Handle ISO format like "2026-01-20T12:00:00.000Z" or simple "2026-01-20"
  const dateOnly = dateStr.split('T')[0];
  const [year, month, day] = dateOnly.split('-').map(Number);
  
  return `${day} ${months[month - 1]} ${year}`;
}

// Send customer confirmation email with branding
async function sendCustomerConfirmationEmail(
  booking: BackendBooking,
  type: 'new' | 'updated'
): Promise<void> {
  // Don't send emails for block bookings (hall closures)
  if (booking.serviceId === 'block' || booking.serviceName === 'Hall stängd') {
    console.log('Skipping customer email for block booking');
    return;
  }

  // Don't send if no customer email
  if (!booking.email) {
    console.log('No customer email, skipping confirmation');
    return;
  }

  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    console.error('RESEND_API_KEY not configured, skipping customer email');
    return;
  }

  // Format date nicely for Swedish
  const formattedDate = formatSwedishDate(booking.date);

  const subject = type === 'new' 
    ? `Bokningsbekräftelse - ${formattedDate} kl ${booking.time}`
    : `Din bokning har uppdaterats - ${formattedDate} kl ${booking.time}`;

  const addonsHtml = booking.addons && booking.addons.length > 0
    ? booking.addons.map(a => `<li style="padding: 4px 0;">${a.name} - ${a.price} kr</li>`).join('')
    : '';

  const extrasHtml = booking.extras && booking.extras.length > 0
    ? booking.extras.map(e => `<li style="padding: 4px 0;">${e.name}</li>`).join('')
    : '';
  
  // Logo URL from production site
  const logoUrl = 'https://carwashap.com/assets/carwashap-logo-B6WUPqpL.png';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header with logo -->
        <div style="background: linear-gradient(135deg, #4c9141 0%, #3d7a35 100%); padding: 30px 20px; text-align: center;">
          <img src="${logoUrl}" alt="Car Washap" style="max-width: 180px; height: auto; margin-bottom: 10px;" />
          <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 14px;">
            Miljövänlig biltvätt med minimal vattenförbrukning
          </p>
        </div>

        <!-- Main content -->
        <div style="padding: 30px 25px;">
          
          <!-- Greeting -->
          <h2 style="color: #333; margin: 0 0 20px 0; font-size: 22px;">
            ${type === 'new' ? 'Tack för din bokning!' : 'Din bokning har uppdaterats'}
          </h2>
          
          <p style="color: #666; line-height: 1.6; margin: 0 0 25px 0;">
            Hej ${booking.customerName}! ${type === 'new' 
              ? 'Vi har mottagit din bokning och ser fram emot att ta hand om din bil.' 
              : 'Din bokning har ändrats enligt nedan.'}
          </p>

          <!-- Booking details card -->
          <div style="background: #f8faf8; border-radius: 12px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #4c9141;">
            <h3 style="color: #4c9141; margin: 0 0 15px 0; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">
              📅 Bokningsdetaljer
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #888; width: 40%;">Bokningsnummer</td>
                <td style="padding: 8px 0; color: #333; font-weight: 600;">${booking.bookingNumber || booking.id}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888;">Datum</td>
                <td style="padding: 8px 0; color: #333; font-weight: 600;">${formattedDate}</td>
              </tr>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888;">Tid</td>
                <td style="padding: 8px 0; color: #333; font-weight: 600;">${booking.time}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888;">Plats</td>
                <td style="padding: 8px 0; color: #333; font-weight: 600;">${booking.location}</td>
              </tr>
            </table>
          </div>

          <!-- Service details card -->
          <div style="background: #f8faf8; border-radius: 12px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #4c9141;">
            <h3 style="color: #4c9141; margin: 0 0 15px 0; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">
              ✨ Vald tjänst
            </h3>
            <div style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
              <span style="color: #333; font-weight: 600; font-size: 16px;">${booking.serviceName}</span>
              <span style="float: right; color: #4c9141; font-weight: 600;">${booking.servicePrice} kr</span>
            </div>
            ${addonsHtml ? `
              <div style="padding: 10px 0;">
                <span style="color: #888; font-size: 14px;">Tillägg:</span>
                <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #555;">
                  ${addonsHtml}
                </ul>
              </div>
            ` : ''}
            ${extrasHtml ? `
              <div style="padding: 10px 0;">
                <span style="color: #888; font-size: 14px;">Extra:</span>
                <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #555;">
                  ${extrasHtml}
                </ul>
              </div>
            ` : ''}
            <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #4c9141;">
              <span style="color: #333; font-weight: 700; font-size: 18px;">Totalt att betala</span>
              <span style="float: right; color: #4c9141; font-weight: 700; font-size: 20px;">${booking.totalPrice} kr</span>
            </div>
          </div>

          <!-- Vehicle info -->
          <div style="background: #f8faf8; border-radius: 12px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #4c9141;">
            <h3 style="color: #4c9141; margin: 0 0 15px 0; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">
              🚙 Fordon
            </h3>
            <p style="margin: 0; color: #333;">
              <strong>${booking.vehicleBrand} ${booking.vehicleModel}</strong><br>
              <span style="color: #666;">Reg.nr: ${booking.vehicleRegistration}</span>
            </p>
          </div>

          <!-- Info box -->
          <div style="background: #e8f5e9; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
            <p style="margin: 0; color: #2e7d32; font-size: 14px; line-height: 1.6;">
              💡 <strong>Bra att veta:</strong> Betalning sker på plats. Kom gärna i tid så vi kan ge din bil den bästa behandlingen!
            </p>
          </div>

          <!-- Contact info -->
          <p style="color: #888; font-size: 14px; line-height: 1.6; margin: 0;">
            Har du frågor? Kontakta oss på <a href="mailto:info@carwashap.com" style="color: #4c9141;">info@carwashap.com</a>
          </p>

        </div>

        <!-- Footer -->
        <div style="background: #333; padding: 25px 20px; text-align: center;">
          <p style="margin: 0 0 10px 0; color: #fff; font-weight: 600; font-size: 16px;">Car Washap</p>
          <p style="margin: 0; color: #aaa; font-size: 12px;">
            Miljövänlig biltvätt • Endast 5-10 liter vatten per tvätt
          </p>
          <p style="margin: 15px 0 0 0; color: #666; font-size: 11px;">
            Detta är ett automatiskt meddelande. Svara inte på detta mail.
          </p>
        </div>

      </div>
    </body>
    </html>
  `;

  try {
    const emailResponse = await resend.emails.send({
      from: 'Car Washap <bokningar@carwashap.com>',
      to: [booking.email],
      
      subject,
      html,
    });

    console.log('Customer confirmation email sent:', emailResponse);
  } catch (error) {
    console.error('Failed to send customer confirmation email:', error);
    // Don't throw - email failure shouldn't break the booking
  }
}

// Send cancellation email to customer
async function sendCancellationEmail(booking: BackendBooking): Promise<void> {
  if (booking.serviceId === 'block' || booking.serviceName === 'Hall stängd') {
    console.log('Skipping cancellation email for block booking');
    return;
  }
  if (!booking.email) {
    console.log('No customer email, skipping cancellation email');
    return;
  }
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    console.error('RESEND_API_KEY not configured, skipping cancellation email');
    return;
  }

  const logoUrl = 'https://carwashap.com/assets/carwashap-logo-B6WUPqpL.png';
  const formattedDate = formatSwedishDate(booking.date);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header with logo -->
        <div style="background: linear-gradient(135deg, #4c9141 0%, #3d7a35 100%); padding: 30px 20px; text-align: center;">
          <img src="${logoUrl}" alt="Car Washap" style="max-width: 180px; height: auto; margin-bottom: 10px;" />
          <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 14px;">
            Miljövänlig biltvätt med minimal vattenförbrukning
          </p>
        </div>

        <!-- Main content -->
        <div style="padding: 30px 25px;">
          
          <h2 style="color: #333; margin: 0 0 20px 0; font-size: 22px;">
            Din bokning har avbokats
          </h2>
          
          <p style="color: #666; line-height: 1.6; margin: 0 0 25px 0;">
            Hej ${booking.customerName}! Vi vill informera dig om att din bokning har blivit avbokad.
          </p>

          <!-- Booking details card -->
          <div style="background: #fef2f2; border-radius: 12px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #ef4444;">
            <h3 style="color: #dc2626; margin: 0 0 15px 0; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">
              ❌ Avbokad tid
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #888; width: 40%;">Bokningsnummer</td>
                <td style="padding: 8px 0; color: #333; font-weight: 600;">${booking.bookingNumber || booking.id}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888;">Datum</td>
                <td style="padding: 8px 0; color: #333; font-weight: 600;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888;">Tid</td>
                <td style="padding: 8px 0; color: #333; font-weight: 600;">${booking.time}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888;">Plats</td>
                <td style="padding: 8px 0; color: #333; font-weight: 600;">${booking.location}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888;">Tjänst</td>
                <td style="padding: 8px 0; color: #333; font-weight: 600;">${booking.serviceName}</td>
              </tr>
            </table>
          </div>

          <!-- Rebook CTA -->
          <div style="background: #e8f5e9; border-radius: 8px; padding: 15px; margin-bottom: 25px; text-align: center;">
            <p style="margin: 0 0 15px 0; color: #2e7d32; font-size: 15px;">
              Vill du boka en ny tid? Det går snabbt och enkelt!
            </p>
            <a href="https://carwashap.com/boka" 
               style="display: inline-block; background: linear-gradient(135deg, #4c9141 0%, #3d7a35 100%); 
                      color: white; text-decoration: none; padding: 12px 28px; border-radius: 8px; 
                      font-weight: 600; font-size: 15px;">
              Boka ny tid
            </a>
          </div>

          <!-- Contact info -->
          <p style="color: #888; font-size: 14px; line-height: 1.6; margin: 0;">
            Har du frågor? Kontakta oss på <a href="mailto:info@carwashap.com" style="color: #4c9141;">info@carwashap.com</a>
          </p>

        </div>

        <!-- Footer -->
        <div style="background: #333; padding: 25px 20px; text-align: center;">
          <p style="margin: 0 0 10px 0; color: #fff; font-weight: 600; font-size: 16px;">Car Washap</p>
          <p style="margin: 0; color: #aaa; font-size: 12px;">
            Miljövänlig biltvätt • Endast 5-10 liter vatten per tvätt
          </p>
          <p style="margin: 15px 0 0 0; color: #666; font-size: 11px;">
            Detta är ett automatiskt meddelande. Svara inte på detta mail.
          </p>
        </div>

      </div>
    </body>
    </html>
  `;

  try {
    const emailResponse = await resend.emails.send({
      from: 'Car Washap <bokningar@carwashap.com>',
      to: [booking.email],
      subject: `Avbokad tid - ${formattedDate} kl ${booking.time}`,
      html,
    });
    console.log('Cancellation email sent to customer:', emailResponse);
  } catch (error) {
    console.error('Failed to send cancellation email:', error);
  }
}

// Send thank you email when booking is completed
async function sendThankYouEmail(booking: BackendBooking): Promise<void> {
  // Don't send emails for block bookings
  if (booking.serviceId === 'block' || booking.serviceName === 'Hall stängd') {
    console.log('Skipping thank you email for block booking');
    return;
  }

  // Don't send if no customer email
  if (!booking.email) {
    console.log('No customer email, skipping thank you email');
    return;
  }

  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    console.error('RESEND_API_KEY not configured, skipping thank you email');
    return;
  }

  const logoUrl = 'https://carwashap.com/assets/carwashap-logo-B6WUPqpL.png';
  const formattedDate = formatSwedishDate(booking.date);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header with logo -->
        <div style="background: linear-gradient(135deg, #4c9141 0%, #3d7a35 100%); padding: 30px 20px; text-align: center;">
          <img src="${logoUrl}" alt="Car Washap" style="max-width: 180px; height: auto; margin-bottom: 10px;" />
        </div>

        <!-- Main content -->
        <div style="padding: 40px 30px; text-align: center;">
          
          <!-- Big thank you -->
          <div style="font-size: 48px; margin-bottom: 20px;">✨🚗✨</div>
          
          <h1 style="color: #4c9141; margin: 0 0 20px 0; font-size: 28px; font-weight: 600;">
            Tack för att du valde oss!
          </h1>
          
          <p style="color: #555; line-height: 1.8; margin: 0 0 25px 0; font-size: 16px;">
            Hej ${booking.customerName}!<br><br>
            Vi hoppas att du är nöjd med din ${booking.serviceName.toLowerCase()} den ${formattedDate}. 
            Din bil förtjänar det bästa, och vi är glada att vi fick ta hand om den!
          </p>

          <!-- Highlight box -->
          <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border-radius: 16px; padding: 25px; margin: 30px 0;">
            <p style="margin: 0; color: #2e7d32; font-size: 18px; font-weight: 500;">
              🌱 Visste du att vi bara använde 5-10 liter vatten?
            </p>
            <p style="margin: 10px 0 0 0; color: #558b2f; font-size: 14px;">
              Tack för att du väljer miljövänlig biltvätt!
            </p>
          </div>

          <!-- CTA -->
          <p style="color: #666; line-height: 1.6; margin: 25px 0; font-size: 15px;">
            Vi ser fram emot att välkomna dig tillbaka nästa gång din bil behöver lite extra kärlek!
          </p>
          
          <a href="https://carwashap.com/boka" 
             style="display: inline-block; background: linear-gradient(135deg, #4c9141 0%, #3d7a35 100%); 
                    color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; 
                    font-weight: 600; font-size: 16px; margin-top: 10px;">
            Boka nästa tvätt
          </a>

        </div>

        <!-- Footer -->
        <div style="background: #f8f8f8; padding: 25px; text-align: center; border-top: 1px solid #eee;">
          <p style="margin: 0; color: #888; font-size: 13px;">
            Med vänliga hälsningar,<br>
            <strong style="color: #4c9141;">Teamet på Car Washap</strong>
          </p>
          <p style="margin: 15px 0 0 0; color: #aaa; font-size: 11px;">
            Miljövänlig biltvätt • Endast 5-10 liter vatten per tvätt
          </p>
        </div>

      </div>
    </body>
    </html>
  `;

  try {
    const emailResponse = await resend.emails.send({
      from: 'Car Washap <bokningar@carwashap.com>',
      to: [booking.email],
      subject: `Tack för ditt besök hos Car Washap! ✨`,
      html,
    });

    console.log('Thank you email sent:', emailResponse);
  } catch (error) {
    console.error('Failed to send thank you email:', error);
  }
}

// Send booking data to Make.com webhook for Google Calendar integration
// Service durations for webhook (in minutes)
const WEBHOOK_SERVICE_DURATIONS: Record<string, number> = {
  'complete-basic': 90,
  'exterior-basic': 45,
  'interior-basic': 45,
  'complete-recond': 120,
};

async function sendToMakeWebhook(
  booking: BackendBooking,
  action: 'created' | 'updated' | 'cancelled'
): Promise<void> {
  // Don't send webhook for block bookings (hall closures)
  if (booking.serviceId === 'block' || booking.serviceName === 'Hall stängd') {
    console.log('Skipping Make.com webhook for block booking');
    return;
  }

  try {
    // Create full ISO datetime strings for Make.com/Google Calendar
    const dateStr = booking.date.split('T')[0]; // YYYY-MM-DD
    const timeStr = booking.time; // HH:mm
    const startDateTime = `${dateStr}T${timeStr}:00`;
    
    // Calculate end time based on service duration
    const [hours, minutes] = timeStr.split(':').map(Number);
    const durationMinutes = WEBHOOK_SERVICE_DURATIONS[booking.serviceId] || 60;
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
    const endMinutes = (totalMinutes % 60).toString().padStart(2, '0');
    const endDateTime = `${dateStr}T${endHours}:${endMinutes}:00`;

    console.log(`[Webhook] Preparing ${action} webhook for booking ${booking.bookingNumber || booking.id}`);
    console.log(`[Webhook] Service: ${booking.serviceId}, Duration: ${durationMinutes} min`);
    console.log(`[Webhook] Time: ${startDateTime} -> ${endDateTime}`);

    const webhookData = {
      action,
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber || booking.id,
      customerName: booking.customerName,
      email: booking.email,
      phone: booking.phone || '',
      startDateTime, // Full ISO datetime for Make.com: 2026-01-17T13:30:00
      endDateTime,   // End time based on service duration
      durationMinutes, // Explicit duration for Make.com
      location: booking.location,
      serviceName: booking.serviceName,
      serviceId: booking.serviceId, // Include serviceId for routing
      servicePrice: booking.servicePrice,
      totalPrice: booking.totalPrice,
      vehicleBrand: booking.vehicleBrand,
      vehicleModel: booking.vehicleModel,
      vehicleRegistration: booking.vehicleRegistration,
      status: booking.status,
      addons: booking.addons || [],
      extras: booking.extras || [],
    };

    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookData),
    });

    if (response.ok) {
      console.log(`[Webhook] Successfully sent ${action} for ${booking.bookingNumber || booking.id}`);
    } else {
      console.error(`[Webhook] Failed (${response.status}):`, await response.text());
    }
  } catch (error) {
    console.error('[Webhook] Error sending to Make.com:', error);
    // Don't throw - webhook failure shouldn't break the booking
  }
}


// ---------------------------------------------------------------------------
// Database layer (Lovable Cloud) — replaces the previous Railway proxy
// ---------------------------------------------------------------------------

const db = () =>
  createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

const json = (body: unknown, status: number, corsHeaders: HeadersInit) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const toDateOnly = (v: string) => (v?.includes('T') ? v.split('T')[0] : v);

function mapFacility(row: any): Facility {
  return {
    id: row.id,
    name: row.name,
    streetAddress: row.street_address,
    postalCode: row.postal_code,
    city: row.city,
    latitude: row.latitude,
    longitude: row.longitude,
    geofenceRadius: row.geofence_radius,
    capacity: row.capacity,
    openingHoursWeekdays: row.opening_hours_weekdays,
    openingHoursSaturday: row.opening_hours_saturday,
    openingHoursSunday: row.opening_hours_sunday,
    phone: row.phone,
    email: row.email,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as Facility;
}

function facilityToRow(input: any): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  const map: Record<string, string> = {
    name: 'name',
    streetAddress: 'street_address',
    postalCode: 'postal_code',
    city: 'city',
    latitude: 'latitude',
    longitude: 'longitude',
    geofenceRadius: 'geofence_radius',
    capacity: 'capacity',
    openingHoursWeekdays: 'opening_hours_weekdays',
    openingHoursSaturday: 'opening_hours_saturday',
    openingHoursSunday: 'opening_hours_sunday',
    phone: 'phone',
    email: 'email',
    isActive: 'is_active',
  };
  for (const [k, col] of Object.entries(map)) {
    if (input[k] !== undefined) row[col] = input[k];
  }
  return row;
}

function mapBooking(row: any): BackendBooking & Record<string, unknown> {
  return {
    id: row.id,
    bookingNumber: row.booking_number,
    serviceId: row.service_id,
    serviceName: row.service_name,
    servicePrice: Number(row.service_price ?? 0),
    addons: row.addons ?? [],
    extras: row.extras ?? [],
    totalPrice: Number(row.total_price ?? 0),
    date: row.date,
    time: row.time,
    location: row.location,
    facilityId: row.facility_id,
    installationId: row.facility_id,
    customerName: row.customer_name,
    email: row.email,
    phone: row.phone,
    vehicleBrand: row.vehicle_brand,
    vehicleModel: row.vehicle_model,
    vehicleRegistration: row.vehicle_registration,
    vehicleSize: row.vehicle_size,
    status: row.status,
    paymentStatus: row.payment_status,
    paymentMethod: row.payment_method,
    notes: row.notes,
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as BackendBooking & Record<string, unknown>;
}

function bookingToRow(input: any): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  const set = (col: string, val: unknown) => {
    if (val !== undefined) row[col] = val;
  };
  set('service_id', input.serviceId ?? input.serviceType);
  set('service_name', input.serviceName);
  set('service_price', input.servicePrice);
  set('addons', input.addons);
  set('extras', input.extras);
  set('total_price', input.totalPrice);
  if (input.date !== undefined) row.date = toDateOnly(input.date);
  set('time', input.time);
  set('location', input.location);
  set('facility_id', input.facilityId ?? input.installationId);
  set('customer_name', input.customerName);
  if (input.email !== undefined) row.email = String(input.email).toLowerCase();
  set('phone', input.phone);
  set('vehicle_brand', input.vehicleBrand ?? input.vehicleMake ?? input.vehicle?.brand);
  set('vehicle_model', input.vehicleModel ?? input.vehicle?.model);
  set(
    'vehicle_registration',
    (input.vehicleRegistration ?? input.registrationNumber ?? input.vehicle?.registrationNumber) as string
  );
  set('vehicle_size', input.vehicleSize);
  set('status', input.status);
  set('payment_status', input.paymentStatus);
  set('payment_method', input.paymentMethod);
  set('notes', input.notes);
  set('source', input.source ?? input.bookingSource ?? input.sourceTag ?? input.source_tag);
  set('gdpr_consent', input.gdprConsent);
  return row;
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const resource = url.searchParams.get('resource') || 'bookings';

    if (resource === 'resend-email') {
      return await handleResendEmailRequest(req, url, corsHeaders);
    } else if (resource === 'facilities') {
      return await handleFacilitiesRequest(req, url, corsHeaders);
    }
    return await handleBookingsRequest(req, url, corsHeaders);
  } catch (error) {
    console.error('Edge function error:', error instanceof Error ? error.message : 'Unknown error');
    return json({ success: false, error: 'Internal server error' }, 500, corsHeaders);
  }
});

async function handleResendEmailRequest(req: Request, _url: URL, corsHeaders: HeadersInit) {
  if (req.method !== 'POST') {
    return json({ success: false, error: 'Method not allowed' }, 405, corsHeaders);
  }

  const authResult = await verifyAdminOrChef(req);
  if (!authResult.authorized) {
    return json({ success: false, error: authResult.error }, 401, corsHeaders);
  }

  try {
    const body = await req.json();
    const bookingId = body.bookingId;
    if (!bookingId) {
      return json({ success: false, error: 'Booking ID required' }, 400, corsHeaders);
    }

    const { data: row, error } = await db().from('bookings').select('*').eq('id', bookingId).maybeSingle();
    if (error || !row) {
      return json({ success: false, error: 'Booking not found' }, 404, corsHeaders);
    }

    await sendCustomerConfirmationEmail(mapBooking(row), 'new');
    return json({ success: true, message: 'Email sent successfully' }, 200, corsHeaders);
  } catch (error) {
    console.error('Resend email error:', error);
    return json({ success: false, error: 'Failed to send email' }, 500, corsHeaders);
  }
}

async function verifyAdminOrChef(req: Request): Promise<{ authorized: boolean; error?: string }> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return { authorized: false, error: 'Authorization header required' };
  }

  const token = authHeader.replace('Bearer ', '');
  const supabase = db();

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return { authorized: false, error: 'Invalid or expired authentication token' };
  }

  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);

  if (rolesError || !roles) {
    return { authorized: false, error: 'Failed to fetch user roles' };
  }

  const hasPermission = roles.some((r: { role: string }) =>
    ['admin', 'chef', 'arbetare'].includes(r.role)
  );
  if (!hasPermission) {
    return { authorized: false, error: 'Insufficient permissions' };
  }

  return { authorized: true };
}

async function handleFacilitiesRequest(req: Request, url: URL, corsHeaders: HeadersInit) {
  const method = req.method;
  const facilityId = url.searchParams.get('id');
  const activeOnly = url.searchParams.get('activeOnly') === 'true';

  if (facilityId && !z.string().uuid().safeParse(facilityId).success) {
    return json({ success: false, error: 'Invalid facility ID format' }, 400, corsHeaders);
  }

  if (method !== 'GET' && method !== 'HEAD') {
    const authResult = await verifyAdminOrChef(req);
    if (!authResult.authorized) {
      return json({ success: false, error: authResult.error }, 401, corsHeaders);
    }
  }

  const supabase = db();

  if (method === 'GET') {
    if (facilityId) {
      const { data, error } = await supabase.from('facilities').select('*').eq('id', facilityId).maybeSingle();
      if (error) return json({ success: false, error: error.message }, 500, corsHeaders);
      if (!data) return json({ success: false, error: 'Facility not found' }, 404, corsHeaders);
      return json({ success: true, data: mapFacility(data) }, 200, corsHeaders);
    }
    let query = supabase.from('facilities').select('*').order('name');
    if (activeOnly) query = query.eq('is_active', true);
    const { data, error } = await query;
    if (error) return json({ success: false, error: error.message }, 500, corsHeaders);
    return json({ success: true, data: (data ?? []).map(mapFacility), count: data?.length ?? 0 }, 200, corsHeaders);
  }

  if (method === 'POST') {
    const body = await req.json();
    const { data, error } = await supabase.from('facilities').insert(facilityToRow(body)).select().single();
    if (error) return json({ success: false, error: error.message }, 400, corsHeaders);
    return json({ success: true, data: mapFacility(data) }, 201, corsHeaders);
  }

  if (method === 'PUT' && facilityId) {
    const body = await req.json();
    const { data, error } = await supabase
      .from('facilities')
      .update(facilityToRow(body))
      .eq('id', facilityId)
      .select()
      .single();
    if (error) return json({ success: false, error: error.message }, 400, corsHeaders);
    return json({ success: true, data: mapFacility(data) }, 200, corsHeaders);
  }

  if (method === 'DELETE' && facilityId) {
    // Soft delete
    const { data, error } = await supabase
      .from('facilities')
      .update({ is_active: false })
      .eq('id', facilityId)
      .select()
      .single();
    if (error) return json({ success: false, error: error.message }, 400, corsHeaders);
    return json({ success: true, data: mapFacility(data) }, 200, corsHeaders);
  }

  return json({ success: false, error: 'Method not allowed' }, 405, corsHeaders);
}

// Service durations (in minutes)
const SERVICE_DURATIONS: Record<string, number> = {
  'complete-basic': 90,
  'exterior-basic': 45,
  'interior-basic': 45,
  'complete-recond': 120,
};

const parseOpeningHours = (hoursString: string | null | undefined): { open: number; close: number } | null => {
  if (!hoursString) return null;
  const match = hoursString.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return { open: parseInt(match[1], 10), close: parseInt(match[3], 10) };
};

async function handleAvailability(date: string, location: string, corsHeaders: HeadersInit) {
  const supabase = db();

  const { data: facilities } = await supabase.from('facilities').select('*');
  const matching = (facilities ?? []).find((f: any) => {
    const facilityLocation = `${f.street_address}, ${f.postal_code} ${f.city}`;
    return facilityLocation === location || f.name === location;
  });

  let openHour = 10;
  let closeHour = 18;
  let capacity = 2;

  if (matching) {
    capacity = matching.capacity || 2;
    const bookingDate = new Date(date + 'T12:00:00');
    const dayOfWeek = bookingDate.getDay();
    let hoursString = matching.opening_hours_weekdays;
    if (dayOfWeek === 0 && matching.opening_hours_sunday) hoursString = matching.opening_hours_sunday;
    else if (dayOfWeek === 6) hoursString = matching.opening_hours_saturday;
    const parsed = parseOpeningHours(hoursString);
    if (parsed) {
      openHour = parsed.open;
      closeHour = parsed.close;
    }
  }

  const { data: bookingRows } = await supabase
    .from('bookings')
    .select('*')
    .eq('date', date)
    .neq('status', 'cancelled');

  const dateBookings = (bookingRows ?? []).filter((b: any) => b.location === location);

  const timeToMinutes = (time: string): number => {
    const [hour, minute] = time.split(':').map(Number);
    return hour * 60 + minute;
  };

  const overlaps = (slotTime: string, booking: any): boolean => {
    const slotMinutes = timeToMinutes(slotTime);
    const bookingMinutes = timeToMinutes(booking.time);
    const duration = SERVICE_DURATIONS[booking.service_id] || 60;
    return slotMinutes >= bookingMinutes && slotMinutes < bookingMinutes + duration;
  };

  const timeSlots: TimeSlot[] = [];
  for (let hour = openHour; hour <= closeHour; hour++) {
    for (const minute of ['00', '30']) {
      if (hour === closeHour && minute === '30') continue;
      const time = `${hour.toString().padStart(2, '0')}:${minute}`;
      const bookedCount = dateBookings.filter((b: any) => overlaps(time, b)).length;
      timeSlots.push({ time, bookedCount, available: Math.max(0, capacity - bookedCount) });
    }
  }

  return json(
    {
      success: true,
      data: {
        date,
        location,
        capacity,
        timeSlots,
        bookedTimes: dateBookings.map((b: any) => b.time),
      },
    },
    200,
    corsHeaders
  );
}

async function handleBookingsRequest(req: Request, url: URL, corsHeaders: HeadersInit) {
  const method = req.method;
  const supabase = db();

  // Availability (public)
  if (url.searchParams.has('date') && url.searchParams.has('location')) {
    const dateResult = dateParamSchema.safeParse(url.searchParams.get('date'));
    const locationResult = locationParamSchema.safeParse(url.searchParams.get('location'));
    if (!dateResult.success || !locationResult.success) {
      return json({ success: false, error: 'Invalid query parameters' }, 400, corsHeaders);
    }
    return await handleAvailability(dateResult.data, locationResult.data, corsHeaders);
  }

  let body: any = null;
  if (method === 'POST' || method === 'PUT' || method === 'DELETE' || method === 'GET') {
    try {
      body = await req.json();
    } catch {
      body = null;
    }
  }

  const pathParts = url.pathname.split('/').filter(Boolean);
  let bookingId: string | null = pathParts.length > 2 ? pathParts[2] : null;
  if (!bookingId) bookingId = url.searchParams.get('id') || body?.id || null;
  if (bookingId && !z.string().uuid().safeParse(bookingId).success) {
    return json({ success: false, error: 'Invalid booking ID format' }, 400, corsHeaders);
  }

  // Staff auth for reads/mutations (POST is public — customers book online)
  if (method === 'GET' || method === 'PUT' || method === 'DELETE') {
    const authResult = await verifyAdminOrChef(req);
    if (!authResult.authorized) {
      return json({ success: false, error: authResult.error }, 401, corsHeaders);
    }
  }

  if (method === 'GET') {
    if (bookingId) {
      const { data, error } = await supabase.from('bookings').select('*').eq('id', bookingId).maybeSingle();
      if (error) return json({ success: false, error: error.message }, 500, corsHeaders);
      if (!data) return json({ success: false, error: 'Booking not found' }, 404, corsHeaders);
      return json({ success: true, data: mapBooking(data) }, 200, corsHeaders);
    }
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('date', { ascending: false })
      .order('time', { ascending: false })
      .limit(5000);
    if (error) return json({ success: false, error: error.message }, 500, corsHeaders);
    return json({ success: true, data: (data ?? []).map(mapBooking), count: data?.length ?? 0 }, 200, corsHeaders);
  }

  if (method === 'POST') {
    if (!body) return json({ success: false, error: 'Missing request body' }, 400, corsHeaders);

    const isBlockBooking = body.serviceId === 'block' || body.serviceName === 'Hall stängd';

    // Staff bypass the lead-time rule
    let isAuthenticatedStaff = false;
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const check = await verifyAdminOrChef(req);
      isAuthenticatedStaff = check.authorized;
    }

    if (body.date && body.time && !isBlockBooking && !isAuthenticatedStaff) {
      const timeValidation = validateBookingTime(toDateOnly(body.date), body.time);
      if (!timeValidation.valid) {
        return json({ success: false, error: timeValidation.error }, 400, corsHeaders);
      }
    }

    const row = bookingToRow(body);
    if (!row.status) row.status = 'pending';

    const { data, error } = await supabase.from('bookings').insert(row).select().single();
    if (error) {
      console.error('Create booking failed:', error.message);
      return json({ success: false, error: error.message }, 400, corsHeaders);
    }

    const booking = mapBooking(data);

    if (!isBlockBooking) {
      sendBookingNotificationEmail(booking, 'new').catch((e) => console.error('Staff email failed:', e));
      sendCustomerConfirmationEmail(booking, 'new').catch((e) => console.error('Customer email failed:', e));
      sendToMakeWebhook(booking, 'created').catch((e) => console.error('Webhook failed:', e));
    }

    return json({ success: true, data: booking }, 201, corsHeaders);
  }

  if (method === 'PUT') {
    if (!bookingId) return json({ success: false, error: 'Booking ID required' }, 400, corsHeaders);
    const updates = bookingToRow(body ?? {});
    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', bookingId)
      .select()
      .single();
    if (error) return json({ success: false, error: error.message }, 400, corsHeaders);

    const booking = mapBooking(data);
    const isBlockBooking = booking.serviceId === 'block' || booking.serviceName === 'Hall stängd';

    if (!isBlockBooking) {
      if (booking.status !== 'completed') {
        sendBookingNotificationEmail(
          booking,
          booking.status === 'cancelled' ? 'cancelled' : 'updated'
        ).catch((e) => console.error('Staff email failed:', e));
      }
      if (booking.status === 'cancelled') {
        sendCancellationEmail(booking).catch((e) => console.error('Cancellation email failed:', e));
      }
      if (booking.status === 'completed') {
        sendThankYouEmail(booking).catch((e) => console.error('Thank you email failed:', e));
      }
      sendToMakeWebhook(
        booking,
        booking.status === 'cancelled' ? 'cancelled' : 'updated'
      ).catch((e) => console.error('Webhook failed:', e));
    }

    return json({ success: true, data: booking }, 200, corsHeaders);
  }

  if (method === 'DELETE') {
    if (!bookingId) return json({ success: false, error: 'Booking ID required' }, 400, corsHeaders);
    const { data: existing } = await supabase.from('bookings').select('*').eq('id', bookingId).maybeSingle();
    const { error } = await supabase.from('bookings').delete().eq('id', bookingId);
    if (error) return json({ success: false, error: error.message }, 400, corsHeaders);
    if (existing) {
      const booking = mapBooking(existing);
      if (booking.serviceId !== 'block' && booking.serviceName !== 'Hall stängd') {
        sendToMakeWebhook(booking, 'cancelled').catch((e) => console.error('Webhook failed:', e));
      }
    }
    return json({ success: true, data: null }, 200, corsHeaders);
  }

  return json({ success: false, error: 'Method not allowed' }, 405, corsHeaders);
}
