// Edge function to process scheduled notifications
// This is called via cron job with CRON_SECRET - no browser CORS needed

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const API_BASE_URL = 'https://backend-production-1910.up.railway.app';
const API_KEY = Deno.env.get('API_KEY');
const CRON_SECRET = Deno.env.get('CRON_SECRET');

Deno.serve(async (req) => {
  // This function is only called by scheduler, not browsers
  // Verify cron secret for scheduled job security
  const cronSecret = req.headers.get('x-cron-secret');
  if (!CRON_SECRET || cronSecret !== CRON_SECRET) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.info('Checking for scheduled notifications to send...');

    // Get all pending notifications that should be sent now
    const now = new Date().toISOString();
    const { data: notifications, error: fetchError } = await supabase
      .from('scheduled_notifications')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', now)
      .order('scheduled_for', { ascending: true });

    if (fetchError) {
      throw fetchError;
    }

    if (!notifications || notifications.length === 0) {
      console.info('No notifications to send at this time');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No notifications to send',
          count: 0 
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.info(`Found ${notifications.length} notification(s) to send`);

    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each notification
    for (const notification of notifications) {
      try {
        // Prepare payload for backend API
        const payload = {
          title: notification.title,
          message: notification.message,
          target: notification.target,
          userId: notification.user_id,
          bookingId: notification.booking_id,
          locationId: notification.location_id,
        };

        // Send push notification via backend API
        const response = await fetch(`${API_BASE_URL}/api/push/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY!,
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Update notification status to sent
          await supabase
            .from('scheduled_notifications')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
            })
            .eq('id', notification.id);

          results.sent++;
        } else {
          // Update notification status to failed
          const errorMsg = data.error || 'Unknown error';
          await supabase
            .from('scheduled_notifications')
            .update({
              status: 'failed',
              error_message: errorMsg,
            })
            .eq('id', notification.id);

          results.failed++;
          results.errors.push(`Notification failed: ${errorMsg}`);
        }
      } catch (error) {
        // Update notification status to failed
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        await supabase
          .from('scheduled_notifications')
          .update({
            status: 'failed',
            error_message: errorMsg,
          })
          .eq('id', notification.id);

        results.failed++;
        results.errors.push(`Processing error: ${errorMsg}`);
      }
    }

    console.info(`Processing complete. Sent: ${results.sent}, Failed: ${results.failed}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${notifications.length} notification(s)`,
        results,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Edge function error:', error instanceof Error ? error.message : 'Unknown error');
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
