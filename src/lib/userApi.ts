import { supabase } from '@/integrations/supabase/client';
import { handleSessionExpiry, isSessionExpiredError } from './sessionHandler';

export interface CreateUserData {
  username: string;
  display_name: string;
  phone?: string;
  password: string;
  role: 'admin' | 'chef' | 'arbetare';
  facility_id?: string;
}

export async function createUser(data: CreateUserData) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    handleSessionExpiry();
    throw new Error('SESSION_EXPIRED');
  }

  const response = await supabase.functions.invoke('user-management', {
    body: {
      action: 'create',
      data,
    },
  });

  if (response.error) {
    if (isSessionExpiredError(response.error) || isSessionExpiredError(new Error(response.error.message))) {
      handleSessionExpiry();
      throw new Error('SESSION_EXPIRED');
    }
    throw response.error;
  }
  if (response.data?.error) {
    if (isSessionExpiredError(new Error(response.data.error))) {
      handleSessionExpiry();
      throw new Error('SESSION_EXPIRED');
    }
    throw new Error(response.data.error);
  }
  return response.data;
}

export async function deleteUser(userId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    handleSessionExpiry();
    throw new Error('SESSION_EXPIRED');
  }

  const response = await supabase.functions.invoke('user-management', {
    body: {
      action: 'delete',
      data: { userId },
    },
  });

  if (response.error) {
    if (isSessionExpiredError(response.error) || isSessionExpiredError(new Error(response.error.message))) {
      handleSessionExpiry();
      throw new Error('SESSION_EXPIRED');
    }
    throw response.error;
  }
  if (response.data?.error) {
    if (isSessionExpiredError(new Error(response.data.error))) {
      handleSessionExpiry();
      throw new Error('SESSION_EXPIRED');
    }
    throw new Error(response.data.error);
  }
  return response.data;
}

export async function resetUserPassword(userId: string, newPassword: string) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    handleSessionExpiry();
    throw new Error('SESSION_EXPIRED');
  }

  const response = await supabase.functions.invoke('user-management', {
    body: {
      action: 'reset-password',
      data: { userId, newPassword },
    },
  });

  if (response.error) {
    if (isSessionExpiredError(response.error) || isSessionExpiredError(new Error(response.error.message))) {
      handleSessionExpiry();
      throw new Error('SESSION_EXPIRED');
    }
    throw response.error;
  }
  if (response.data?.error) {
    if (isSessionExpiredError(new Error(response.data.error))) {
      handleSessionExpiry();
      throw new Error('SESSION_EXPIRED');
    }
    throw new Error(response.data.error);
  }
  return response.data;
}
