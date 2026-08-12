import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

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

const offerSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  discount: z.number().min(0).max(100).optional().nullable(),
  discountAmount: z.number().min(0).optional().nullable(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  isActive: z.boolean().optional(),
}).passthrough();

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

async function verifyStaff(req: Request): Promise<{ authorized: boolean; error?: string }> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return { authorized: false, error: 'Authorization header required' };

  const token = authHeader.replace('Bearer ', '');
  const supabase = db();

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return { authorized: false, error: 'Invalid or expired token' };

  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);

  if (rolesError || !roles) return { authorized: false, error: 'Failed to fetch user roles' };

  const hasPermission = roles.some((r: { role: string }) => ['admin', 'chef', 'arbetare'].includes(r.role));
  if (!hasPermission) return { authorized: false, error: 'Insufficient permissions' };

  return { authorized: true };
}

function mapOffer(row: any) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    discount: row.discount === null ? null : Number(row.discount),
    discountAmount: row.discount_amount === null ? null : Number(row.discount_amount),
    validFrom: row.valid_from,
    validTo: row.valid_to,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function offerToRow(input: any): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.title !== undefined) row.title = input.title;
  if (input.description !== undefined) row.description = input.description ?? '';
  if (input.discount !== undefined) row.discount = input.discount;
  if (input.discountAmount !== undefined) row.discount_amount = input.discountAmount;
  const from = input.startDate ?? input.validFrom;
  const to = input.endDate ?? input.validTo;
  if (from !== undefined) row.valid_from = String(from).split('T')[0];
  if (to !== undefined) row.valid_to = String(to).split('T')[0];
  if (input.isActive !== undefined) row.is_active = input.isActive;
  return row;
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = db();

    let requestBody: any = null;
    try {
      requestBody = await req.json();
    } catch {
      requestBody = null;
    }

    const method: string = requestBody?.method || req.method;
    const id: string | undefined = requestBody?.id;

    if (id && !z.string().uuid().safeParse(id).success) {
      return json({ success: false, error: 'Invalid offer ID format' }, 400, corsHeaders);
    }

    if (method !== 'GET' && method !== 'HEAD') {
      const authResult = await verifyStaff(req);
      if (!authResult.authorized) {
        return json({ success: false, error: authResult.error }, 401, corsHeaders);
      }
    }

    if (method === 'GET') {
      if (id) {
        const { data, error } = await supabase.from('offers').select('*').eq('id', id).maybeSingle();
        if (error) return json({ success: false, error: error.message }, 500, corsHeaders);
        if (!data) return json({ success: false, error: 'Offer not found' }, 404, corsHeaders);
        return json({ success: true, data: mapOffer(data) }, 200, corsHeaders);
      }
      const { data, error } = await supabase.from('offers').select('*').order('valid_from', { ascending: false });
      if (error) return json({ success: false, error: error.message }, 500, corsHeaders);
      return json({ success: true, data: (data ?? []).map(mapOffer), count: data?.length ?? 0 }, 200, corsHeaders);
    }

    const { method: _m, id: _i, ...rest } = requestBody ?? {};
    const parsed = offerSchema.safeParse(rest);
    if ((method === 'POST' || method === 'PUT') && !parsed.success) {
      return json(
        { success: false, error: 'Invalid offer data', details: parsed.error.errors },
        400,
        corsHeaders
      );
    }

    if (method === 'POST') {
      const { data, error } = await supabase.from('offers').insert(offerToRow(rest)).select().single();
      if (error) return json({ success: false, error: error.message }, 400, corsHeaders);
      return json({ success: true, data: mapOffer(data) }, 201, corsHeaders);
    }

    if (method === 'PUT') {
      if (!id) return json({ success: false, error: 'Offer ID required' }, 400, corsHeaders);
      const { data, error } = await supabase.from('offers').update(offerToRow(rest)).eq('id', id).select().single();
      if (error) return json({ success: false, error: error.message }, 400, corsHeaders);
      return json({ success: true, data: mapOffer(data) }, 200, corsHeaders);
    }

    if (method === 'DELETE') {
      if (!id) return json({ success: false, error: 'Offer ID required' }, 400, corsHeaders);
      const { error } = await supabase.from('offers').delete().eq('id', id);
      if (error) return json({ success: false, error: error.message }, 400, corsHeaders);
      return json({ success: true, data: null }, 200, corsHeaders);
    }

    return json({ success: false, error: 'Method not allowed' }, 405, corsHeaders);
  } catch (error) {
    console.error('Error in offers function:', error instanceof Error ? error.message : 'Unknown error');
    return json({ success: false, error: 'Internal server error' }, 500, corsHeaders);
  }
});
