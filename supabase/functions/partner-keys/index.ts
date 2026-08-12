// Admin endpoint for managing partner API keys.
// Only authenticated admins may call this.
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders: HeadersInit = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
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

function generateApiKey(): string {
  // Format: pk_live_<32 random chars>
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const random = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `pk_live_${random}`;
}

const createSchema = z.object({
  name: z.string().trim().min(2).max(100),
  source_tag: z.string().trim().min(2).max(50).regex(/^[a-z0-9_-]+$/i, 'Only letters, numbers, _ and -'),
});

const updateSchema = z.object({
  id: z.string().uuid(),
  is_active: z.boolean().optional(),
  name: z.string().trim().min(2).max(100).optional(),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Verify caller is an admin
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return json({ success: false, error: 'Unauthorized' }, 401);
  }

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const token = authHeader.replace('Bearer ', '');
  const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
  if (claimsErr || !claimsData?.claims) {
    return json({ success: false, error: 'Unauthorized' }, 401);
  }
  const userId = claimsData.claims.sub;

  // Service role for actual DB ops (bypass RLS for the role check below)
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: roleRow } = await adminClient
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle();

  if (!roleRow) {
    return json({ success: false, error: 'Admin role required' }, 403);
  }

  try {
    if (req.method === 'GET') {
      const { data, error } = await adminClient
        .from('partner_api_keys')
        .select('id, name, api_key_prefix, source_tag, is_active, last_used_at, usage_count, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return json({ success: true, data });
    }

    if (req.method === 'POST') {
      const body = await req.json().catch(() => null);
      const parsed = createSchema.safeParse(body);
      if (!parsed.success) {
        return json(
          { success: false, error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
          400
        );
      }

      const apiKey = generateApiKey();
      const hash = await hashApiKey(apiKey);
      const prefix = apiKey.substring(0, 12); // e.g. "pk_live_abc1"

      const { data, error } = await adminClient
        .from('partner_api_keys')
        .insert({
          name: parsed.data.name,
          source_tag: parsed.data.source_tag,
          api_key_hash: hash,
          api_key_prefix: prefix,
          created_by: userId,
        })
        .select('id, name, api_key_prefix, source_tag, is_active, created_at')
        .single();

      if (error) throw error;

      // Return the plaintext key ONCE - never stored
      return json({
        success: true,
        data: { ...data, api_key: apiKey },
        message: 'Spara denna nyckel direkt – den visas bara en gång!',
      }, 201);
    }

    if (req.method === 'PATCH') {
      const body = await req.json().catch(() => null);
      const parsed = updateSchema.safeParse(body);
      if (!parsed.success) {
        return json(
          { success: false, error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
          400
        );
      }
      const { id, ...updates } = parsed.data;
      const { data, error } = await adminClient
        .from('partner_api_keys')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return json({ success: true, data });
    }

    if (req.method === 'DELETE') {
      const url = new URL(req.url);
      const id = url.searchParams.get('id');
      if (!id) return json({ success: false, error: 'id is required' }, 400);
      const { error } = await adminClient.from('partner_api_keys').delete().eq('id', id);
      if (error) throw error;
      return json({ success: true });
    }

    return json({ success: false, error: 'Method not allowed' }, 405);
  } catch (err) {
    console.error('partner-keys error:', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return json({ success: false, error: msg }, 500);
  }
});
