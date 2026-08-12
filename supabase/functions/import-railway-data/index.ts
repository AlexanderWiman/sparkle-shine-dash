// One-off data import from the legacy Railway backend into Lovable Cloud.
// Call with header: x-cron-secret: <CRON_SECRET>
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const API_BASE_URL = 'https://backend-production-1910.up.railway.app';
const API_KEY = Deno.env.get('API_KEY');

const db = () =>
  createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
};

async function get(path: string) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY ?? '' },
  });
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
  const body = await res.json();
  return body?.data ?? body;
}

const dateOnly = (v: unknown) => (v ? String(v).split('T')[0] : null);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const secret = req.headers.get('x-cron-secret');
  if (!secret || secret !== Deno.env.get('IMPORT_TOKEN')) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = db();
  const result: Record<string, unknown> = {};

  try {
    // ---------- Facilities ----------
    const facilities: any[] = await get('/api/facilities');
    const facilityRows = facilities.map((f) => ({
      id: f.id,
      name: f.name,
      street_address: f.streetAddress ?? '',
      postal_code: f.postalCode ?? '',
      city: f.city ?? '',
      latitude: f.latitude ?? null,
      longitude: f.longitude ?? null,
      geofence_radius: f.geofenceRadius ?? 100,
      capacity: f.capacity ?? 1,
      opening_hours_weekdays: f.openingHoursWeekdays ?? '10:00 - 19:00',
      opening_hours_saturday: f.openingHoursSaturday ?? '10:00 - 18:00',
      opening_hours_sunday: f.openingHoursSunday ?? null,
      phone: f.phone ?? null,
      email: f.email ?? null,
      is_active: f.isActive ?? true,
      created_at: f.createdAt ?? undefined,
    }));
    const { error: fErr } = await supabase.from('facilities').upsert(facilityRows, { onConflict: 'id' });
    if (fErr) throw new Error(`facilities: ${fErr.message}`);
    result.facilities = facilityRows.length;

    // ---------- Bookings ----------
    const bookings: any[] = await get('/api/bookings');
    const facilityIds = new Set(facilityRows.map((f) => f.id));
    const bookingRows = bookings.map((b, i) => ({
      id: b.id,
      booking_number: b.bookingNumber || `IMPORT-${i + 1}-${String(b.id).slice(0, 8)}`,
      service_id: b.serviceId ?? 'unknown',
      service_name: b.serviceName ?? 'Okänd tjänst',
      service_price: b.servicePrice ?? 0,
      addons: b.addons ?? [],
      extras: b.extras ?? [],
      total_price: b.totalPrice ?? 0,
      date: dateOnly(b.date),
      time: b.time ?? '00:00',
      location: b.location ?? '',
      facility_id:
        b.facilityId && facilityIds.has(b.facilityId)
          ? b.facilityId
          : b.installationId && facilityIds.has(b.installationId)
            ? b.installationId
            : null,
      customer_name: b.customerName ?? '',
      email: (b.email ?? '').toLowerCase(),
      phone: b.phone ?? '',
      vehicle_brand: b.vehicleBrand ?? b.vehicleMake ?? b.vehicle?.brand ?? '',
      vehicle_model: b.vehicleModel ?? b.vehicle?.model ?? '',
      vehicle_registration: b.vehicleRegistration ?? b.vehicle?.registrationNumber ?? '',
      vehicle_size: b.vehicleSize ?? null,
      status: b.status ?? 'pending',
      payment_status: b.paymentStatus ?? 'pending',
      payment_method: b.paymentMethod ?? null,
      notes: b.notes ?? null,
      source: b.source ?? null,
      created_at: b.createdAt ?? undefined,
    }));

    let inserted = 0;
    for (let i = 0; i < bookingRows.length; i += 200) {
      const chunk = bookingRows.slice(i, i + 200);
      const { error } = await supabase.from('bookings').upsert(chunk, { onConflict: 'id' });
      if (error) throw new Error(`bookings chunk ${i}: ${error.message}`);
      inserted += chunk.length;
    }
    result.bookings = inserted;

    // ---------- Offers ----------
    try {
      const offers: any[] = await get('/api/offers');
      const offerRows = offers.map((o) => ({
        id: o.id,
        title: o.title ?? '',
        description: o.description ?? '',
        discount: o.discount ?? null,
        discount_amount: o.discountAmount ?? null,
        valid_from: dateOnly(o.validFrom) ?? dateOnly(o.startDate),
        valid_to: dateOnly(o.validTo) ?? dateOnly(o.endDate),
        is_active: o.isActive ?? true,
        created_at: o.createdAt ?? undefined,
      })).filter((o) => o.valid_from && o.valid_to);
      const { error: oErr } = await supabase.from('offers').upsert(offerRows, { onConflict: 'id' });
      if (oErr) throw new Error(`offers: ${oErr.message}`);
      result.offers = offerRows.length;
    } catch (e) {
      result.offers = `skipped: ${e instanceof Error ? e.message : 'unknown'}`;
    }

    // Keep the booking-number sequence ahead of imported numbers
    result.done = true;

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Import failed:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error', partial: result }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
