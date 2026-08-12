import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';
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

const API_BASE_URL = 'https://backend-production-1910.up.railway.app';
const API_KEY = Deno.env.get('API_KEY');

// Validation schema for push notification payload
const notificationSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100, 'Title too long'),
  message: z.string().trim().min(1, 'Message is required').max(500, 'Message too long'),
  target: z.enum(['all', 'user', 'booking', 'location']),
  userId: z.string().uuid().optional(),
  bookingId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  data: z.record(z.string()).optional(),
}).refine((data) => {
  // Require userId if target is 'user'
  if (data.target === 'user' && !data.userId) {
    return false;
  }
  return true;
}, { message: 'userId is required when target is "user"' });

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!API_KEY) {
    return new Response(
      JSON.stringify({ success: false, error: 'API key not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Get JWT from authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client to verify JWT and check roles
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get user from JWT
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin or chef role
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (rolesError || !roles) {
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to verify permissions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userRoles = roles.map(r => r.role);
    const hasPermission = userRoles.includes('admin') || userRoles.includes('chef') || userRoles.includes('arbetare');

    if (!hasPermission) {
      return new Response(
        JSON.stringify({ success: false, error: 'Insufficient permissions. Admin or Chef role required.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate payload
    let payload: z.infer<typeof notificationSchema>;
    try {
      const rawPayload = await req.json();
      payload = notificationSchema.parse(rawPayload);
    } catch (error) {
      const zodError = error as z.ZodError;
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid notification payload',
          details: zodError.errors || 'Validation failed'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send push notification via backend API
    const response = await fetch(`${API_BASE_URL}/api/push/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      { 
        status: response.status, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Edge function error:', error instanceof Error ? error.message : 'Unknown error');
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
