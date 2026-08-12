// Shared CORS configuration for edge functions

const ALLOWED_ORIGINS = [
  'https://carwashap.com',
  'https://www.carwashap.com',
  'https://carwashap.se',
  'https://www.carwashap.se',
  'https://washap.bullascentral.se',
  'https://kxojnodttpeeesjwclpv.supabase.co',
];

// Add development origins if in dev mode
const DEV_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:8910',
  'http://localhost:3000',
];

export function getCorsHeaders(origin: string | null): HeadersInit {
  const isDev = Deno.env.get('DEV_MODE') === 'true';
  const allAllowedOrigins = isDev ? [...ALLOWED_ORIGINS, ...DEV_ORIGINS] : ALLOWED_ORIGINS;
  
  // Allow Lovable preview URLs
  const isLovablePreview = origin?.includes('.lovableproject.com') || origin?.includes('.lovable.app');
  
  const allowedOrigin = origin && (allAllowedOrigins.includes(origin) || isLovablePreview) 
    ? origin 
    : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
  };
}
