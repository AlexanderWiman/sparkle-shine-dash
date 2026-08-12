import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

let isHandlingSessionExpiry = false;

/**
 * Handle session expiry errors globally
 * Shows a toast message and redirects to login
 */
export const handleSessionExpiry = () => {
  // Prevent multiple simultaneous handling
  if (isHandlingSessionExpiry) return;
  isHandlingSessionExpiry = true;

  toast({
    title: "Session utgången",
    description: "Din session har löpt ut, logga in på nytt.",
    variant: "destructive",
  });

  // Sign out and redirect to login
  supabase.auth.signOut().then(() => {
    window.location.href = '/login';
  });

  // Reset flag after a delay
  setTimeout(() => {
    isHandlingSessionExpiry = false;
  }, 5000);
};

/**
 * Check if an error is a session expiry error
 */
export const isSessionExpiredError = (error: Error | unknown): boolean => {
  if (!error) return false;
  
  const errorMessage = error instanceof Error 
    ? error.message.toLowerCase() 
    : String(error).toLowerCase();
  
  return (
    errorMessage.includes('session_expired') ||
    errorMessage.includes('expired') ||
    errorMessage.includes('invalid or expired authentication') ||
    errorMessage.includes('401') ||
    errorMessage.includes('jwt expired') ||
    (error instanceof Error && error.name === 'AuthenticationError')
  );
};

/**
 * Wrapper to handle API errors with session expiry detection
 */
export const handleApiError = (error: Error | unknown, defaultMessage: string): never => {
  if (isSessionExpiredError(error)) {
    handleSessionExpiry();
  }
  
  throw error instanceof Error ? error : new Error(defaultMessage);
};
