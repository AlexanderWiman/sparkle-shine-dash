import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
  };
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Import zod for validation
    const { z } = await import('https://esm.sh/zod@3.22.4');
    
    // Password validation - requires minimum 8 characters with complexity
    const passwordRegex = /^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;
    
    // Define validation schemas
    const actionSchema = z.enum(['create', 'delete', 'reset-password']);
    const userCreationSchema = z.object({
      username: z.string().trim().min(3).max(50).regex(/^[a-z0-9_]+$/),
      display_name: z.string().trim().min(2).max(100),
      phone: z.string().trim().max(20).optional(),
      password: z.string().min(8).regex(passwordRegex, 'Lösenord måste innehålla siffra och specialtecken'),
      role: z.enum(['admin', 'chef', 'arbetare']),
      facility_id: z.string().uuid().optional(),
    });
    const userDeletionSchema = z.object({
      userId: z.string().uuid(),
    });
    const passwordResetSchema = z.object({
      userId: z.string().uuid(),
      newPassword: z.string().min(8).regex(passwordRegex, 'Lösenord måste innehålla siffra och specialtecken'),
    });

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user is authenticated
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin or chef role
    const { data: userRoles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = userRoles?.some(r => r.role === 'admin');
    const hasPermission = userRoles?.some(r => r.role === 'admin' || r.role === 'chef' || r.role === 'arbetare');
    
    if (!hasPermission) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestBody = await req.json();
    
    // Validate action
    let action: string;
    let data: any;
    
    try {
      action = actionSchema.parse(requestBody.action);
      data = requestBody.data;
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid action. Must be "create", "delete", or "reset-password"',
          details: error instanceof Error ? error.message : 'Validation failed'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'create') {
      // Validate user creation data
      let validatedData: any;
      try {
        validatedData = userCreationSchema.parse(data);
      } catch (error) {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid user data',
            details: error instanceof Error ? error.message : 'Validation failed'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create user
      const { username, password, display_name, phone, role, facility_id } = validatedData;
      
      const email = `${username.toLowerCase()}@internal.washap.se`;
      
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: password,
        email_confirm: true,
        user_metadata: {
          username: username,
          display_name: display_name,
        },
      });

      if (createError) {
        if (createError.message.includes('already been registered')) {
          return new Response(
            JSON.stringify({ error: `Användarnamnet "${username}" är redan registrerat` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        throw createError;
      }
      if (!newUser.user) throw new Error('Failed to create user');

      // Create profile with must_change_password flag
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: newUser.user.id,
          username,
          display_name,
          phone: phone || null,
          facility_id: facility_id || null,
          must_change_password: true,
        });

      if (profileError) throw profileError;

      // Create role
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: newUser.user.id,
          role,
          facility_id: facility_id || null,
        });

      if (roleError) throw roleError;

      return new Response(
        JSON.stringify({ success: true, user: { id: newUser.user.id } }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'delete') {
      // Validate user deletion data
      let validatedData: any;
      try {
        validatedData = userDeletionSchema.parse(data);
      } catch (error) {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid deletion request',
            details: error instanceof Error ? error.message : 'Validation failed'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Delete user
      const { userId } = validatedData;
      
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      
      if (deleteError) throw deleteError;

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'reset-password') {
      // Only admins can reset passwords
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ error: 'Only admins can reset passwords' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate password reset data
      let validatedData: any;
      try {
        validatedData = passwordResetSchema.parse(data);
      } catch (error) {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid password reset data',
            details: error instanceof Error ? error.message : 'Validation failed'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { userId, newPassword } = validatedData;

      // Update user password
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: newPassword,
      });

      if (updateError) throw updateError;

      // Set must_change_password flag
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ must_change_password: true })
        .eq('id', userId);

      if (profileError) throw profileError;

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('User management error:', error instanceof Error ? error.message : 'Unknown error');
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
