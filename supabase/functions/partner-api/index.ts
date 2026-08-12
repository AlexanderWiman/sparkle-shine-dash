// Public Partner API - lets external companies (e.g. Facebook marketing agencies)
// check availability and create bookings using an API key.
// Simplified: single-facility mode — no facilityId needed from partner.
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const BOOKINGS_FN_URL = `${Deno.env.get('SUPABASE_URL')}/functions/v1/bookings`;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders: HeadersInit = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

async function hashApiKey(key: string): Promise<string> {
  const data = new TextEncoder().encode(key);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

interface PartnerRecord {
  id: string;
  name: string;
  source_tag: string;
  is_active: boolean;
}

async function authenticatePartner(req: Request): Promise<PartnerRecord | null> {
  const apiKey = req.headers.get('x-api-key') || req.headers.get('X-API-Key');
  if (!apiKey || apiKey.length < 10) return null;

  const hash = await hashApiKey(apiKey);
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from('partner_api_keys')
    .select('id, name, source_tag, is_active')
    .eq('api_key_hash', hash)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !data) return null;

  supabase
    .from('partner_api_keys')
    .update({
      last_used_at: new Date().toISOString(),
      usage_count: (data as any).usage_count ? (data as any).usage_count + 1 : 1,
    })
    .eq('id', data.id)
    .then(() => {});

  return data as PartnerRecord;
}

// Resolve the single active facility (cached per cold-start)
interface DefaultFacility {
  id: string;
  name: string;
  location: string;
}
let cachedFacility: DefaultFacility | null = null;
async function getDefaultFacility(): Promise<DefaultFacility | null> {
  if (cachedFacility) return cachedFacility;
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data } = await supabase
    .from('facilities')
    .select('id, name, street_address, postal_code, city')
    .eq('is_active', true)
    .order('name')
    .limit(1);
  const f = data?.[0];
  if (!f) return null;
  const location = [f.street_address, `${f.postal_code ?? ''} ${f.city ?? ''}`.trim()]
    .filter(Boolean)
    .join(', ');
  cachedFacility = { id: f.id, name: f.name, location };
  return cachedFacility;
}

// Service catalog mirrored from src/components/booking/types.ts
const SERVICES: Record<string, { name: string; price: number }> = {
  'exterior-basic': { name: 'Utvändigt – Bas', price: 370 },
  'interior-basic': { name: 'Invändigt – Bas', price: 370 },
  'complete-basic': { name: 'In- och utvändig tvätt – Bas', price: 690 },
  'complete-recond': { name: 'Invändig rekond med utvändig tvätt', price: 2500 },
};

const ADDONS: Record<string, { name: string; price: number }> = {
  'asphalt': { name: 'Asfaltsborttagning', price: 80 },
  'trunk': { name: 'Baklucka', price: 50 },
  'spray-wax': { name: 'Sprayvax', price: 150 },
  'seat-front': { name: 'Sätestvätt framstol', price: 250 },
  'seat-back': { name: 'Sätestvätt baksäte', price: 450 },
};

const EXTRAS: Record<string, { name: string; price: number | null; percentage?: number }> = {
  'engine': { name: 'Motortvätt', price: 395 },
  'extra-dirty': { name: 'Extra smutsig bil', price: 0, percentage: 25 },
  'sanitation': { name: 'Sanering av hund-/katthår', price: null },
};

const bookingSchema = z.object({
  customerName: z.string().trim().min(2).max(100),
  email: z.string().email().max(255),
  phone: z.string().max(20).optional(),
  vehicleMake: z.string().trim().min(1).max(50),
  vehicleModel: z.string().trim().min(1).max(50),
  vehicleRegistration: z.string().trim().min(1).max(20),
  serviceType: z.enum(['exterior-basic', 'interior-basic', 'complete-basic', 'complete-recond']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  addons: z.array(z.string()).optional(),
  extras: z.array(z.string()).optional(),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const segments = url.pathname.split('/').filter(Boolean);
    const resource = segments[segments.length - 1] || '';

    const partner = await authenticatePartner(req);
    if (!partner) {
      return json({ success: false, error: 'Invalid or missing API key' }, 401);
    }

    const facility = await getDefaultFacility();
    if (!facility) {
      return json({ success: false, error: 'No active facility configured' }, 500);
    }

    // GET /partner-api/availability?date=YYYY-MM-DD
    if (req.method === 'GET' && resource === 'availability') {
      const date = url.searchParams.get('date');

      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return json({ success: false, error: 'Invalid or missing date (YYYY-MM-DD)' }, 400);
      }

      const params = new URLSearchParams({ date, location: facility.location });
      const backendUrl = `${BOOKINGS_FN_URL}?${params}`;
      console.log('[availability] facility:', facility, 'url:', backendUrl);
      const backendRes = await fetch(backendUrl, {
        headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
      });
      const data = await backendRes.json();
      console.log('[availability] backend status:', backendRes.status, 'raw:', JSON.stringify(data).slice(0, 800));

      const responseData = data.data || data;
      const timeSlots =
        responseData.timeSlots ||
        responseData.availableTimes ||
        responseData.slots ||
        responseData.times ||
        (Array.isArray(responseData) ? responseData : []);

      const availableSlots = Array.isArray(timeSlots)
        ? timeSlots
            .map((s: any) => {
              if (typeof s === 'string') return s;
              if (s?.available === 0 || s?.available === false) return null;
              return s?.time || s?.startTime || null;
            })
            .filter((t: any): t is string => !!t)
        : [];

      return json({
        success: true,
        partner: partner.name,
        date,
        availableTimes: availableSlots,
      });
    }

    // POST /partner-api/bookings - create a booking
    if (req.method === 'POST' && resource === 'bookings') {
      const body = await req.json().catch(() => null);
      const parsed = bookingSchema.safeParse(body);
      if (!parsed.success) {
        return json(
          { success: false, error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
          400
        );
      }

      const input = parsed.data;
      const service = SERVICES[input.serviceType];

      // Build addon/extra objects with names+prices (Railway expects full objects)
      const addonObjects = (input.addons || [])
        .map((id) => {
          const a = ADDONS[id];
          return a ? { id, name: a.name, price: a.price } : null;
        })
        .filter(Boolean) as Array<{ id: string; name: string; price: number }>;

      const extraObjects = (input.extras || [])
        .map((id) => {
          const e = EXTRAS[id];
          if (!e) return null;
          return { id, name: e.name, price: e.price ?? undefined, percentage: e.percentage };
        })
        .filter(Boolean) as Array<{ id: string; name: string; price?: number; percentage?: number }>;

      // Calculate total price (service + addons + fixed extras + percentage extras)
      const addonsTotal = addonObjects.reduce((sum, a) => sum + (a.price || 0), 0);
      const extrasFixed = extraObjects.reduce((sum, e) => sum + (e.price || 0), 0);
      const extrasPctMultiplier = extraObjects.reduce(
        (m, e) => (e.percentage ? m + e.percentage / 100 : m),
        0
      );
      const subtotal = service.price + addonsTotal + extrasFixed;
      const totalPrice = Math.round(subtotal * (1 + extrasPctMultiplier));

      const bookingPayload = {
        serviceId: input.serviceType,
        serviceName: service.name,
        servicePrice: service.price,
        totalPrice,
        addons: addonObjects,
        extras: extraObjects,
        date: input.date,
        time: input.time,
        location: facility.location,
        facilityId: facility.id,
        customerName: input.customerName,
        email: input.email.toLowerCase(),
        phone: input.phone || '',
        vehicleBrand: `${input.vehicleMake} ${input.vehicleModel}`,
        vehicleModel: input.vehicleModel,
        vehicleRegistration: input.vehicleRegistration.toUpperCase(),
        status: 'pending',
        paymentStatus: 'pending',
        source: partner.source_tag,
        notes: `[Partner: ${partner.name}]`,
      };

      const backendRes = await fetch(BOOKINGS_FN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: ANON_KEY,
        },
        body: JSON.stringify(bookingPayload),
      });

      const data = await backendRes.json().catch(() => ({}));

      if (!backendRes.ok || data.success === false) {
        console.log('[partner-api] create booking failed:', backendRes.status, JSON.stringify(data).slice(0, 800));
        return json(
          {
            success: false,
            error: data.error || 'Failed to create booking',
            details: data.details || undefined,
          },
          backendRes.ok ? 400 : backendRes.status
        );
      }

      const booking = data.data || data;
      return json({
        success: true,
        partner: partner.name,
        booking: {
          id: booking.id,
          bookingNumber: booking.bookingNumber,
          date: booking.date,
          time: booking.time,
          customerName: booking.customerName,
          totalPrice: booking.totalPrice,
          status: booking.status,
        },
      }, 201);
    }

    return json({ success: false, error: 'Unknown endpoint' }, 404);
  } catch (err) {
    console.error('partner-api error:', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return json({ success: false, error: msg }, 500);
  }
});
