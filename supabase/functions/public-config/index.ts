// Edge function to provide public configuration values to the frontend

const ALLOWED_ORIGINS = [
  'https://carwashap.com',
  'https://www.carwashap.com',
  'https://carwashap.se',
  'https://www.carwashap.se',
  'https://washap.bullascentral.se',
  'https://kxojnodttpeeesjwclpv.supabase.co',
];

function getCorsHeaders(origin: string | null): HeadersInit {
  const devOrigins = ['http://localhost:5173', 'http://localhost:8910', 'http://localhost:3000'];
  const allAllowedOrigins = [...ALLOWED_ORIGINS, ...devOrigins];
  const isLovablePreview = origin?.includes('.lovableproject.com') || origin?.includes('.lovable.app');
  const allowedOrigin = origin && (allAllowedOrigins.includes(origin) || isLovablePreview) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
  };
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const url = new URL(req.url);
    const configKey = url.searchParams.get('key');

    // Only allow specific public configuration keys
    const allowedKeys = ['mapbox_token'];
    
    if (!configKey || !allowedKeys.includes(configKey)) {
      return new Response(
        JSON.stringify({ error: 'Invalid configuration key' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let value: string | null = null;

    switch (configKey) {
      case 'mapbox_token':
        value = Deno.env.get('MAPBOX_PUBLIC_TOKEN') || null;
        break;
    }

    if (!value) {
      return new Response(
        JSON.stringify({ error: 'Configuration not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, value }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in public-config function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
