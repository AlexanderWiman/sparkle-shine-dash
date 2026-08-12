import { supabase } from "@/integrations/supabase/client";
import { handleSessionExpiry, isSessionExpiredError } from "./sessionHandler";

export interface Offer {
  id: string;
  title: string;
  description: string;
  discount?: number | null;
  discountAmount?: number | null;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfferData {
  title: string;
  description: string;
  discount?: number;
  discountAmount?: number;
  validFrom: string;
  validTo: string;
  isActive?: boolean;
}

export interface UpdateOfferData {
  title?: string;
  description?: string;
  discount?: number;
  discountAmount?: number;
  validFrom?: string;
  validTo?: string;
  isActive?: boolean;
}

export interface OffersResponse {
  success: boolean;
  data: Offer[];
  count: number;
  error?: string;
}

export interface OfferResponse {
  success: boolean;
  data: Offer;
  error?: string;
}

export async function fetchOffers(): Promise<Offer[]> {
  const { data, error } = await supabase.functions.invoke('offers', {
    method: 'GET',
  });

  if (error) {
    if (isSessionExpiredError(error) || isSessionExpiredError(new Error(error.message))) {
      handleSessionExpiry();
      throw new Error('SESSION_EXPIRED');
    }
    throw new Error(error.message || "Failed to fetch offers");
  }

  const response = data as OffersResponse;
  if (!response.success) {
    if (isSessionExpiredError(new Error(response.error || ''))) {
      handleSessionExpiry();
      throw new Error('SESSION_EXPIRED');
    }
    throw new Error(response.error || "Failed to fetch offers");
  }
  
  return response.data || [];
}

export async function fetchOffer(id: string): Promise<Offer> {
  const { data, error } = await supabase.functions.invoke('offers', {
    body: { method: 'GET', id },
  });

  if (error) {
    if (isSessionExpiredError(error) || isSessionExpiredError(new Error(error.message))) {
      handleSessionExpiry();
      throw new Error('SESSION_EXPIRED');
    }
    throw new Error(error.message || "Failed to fetch offer");
  }

  const response = data as OfferResponse;
  if (!response.success) {
    if (isSessionExpiredError(new Error(response.error || ''))) {
      handleSessionExpiry();
      throw new Error('SESSION_EXPIRED');
    }
    throw new Error(response.error || "Failed to fetch offer");
  }
  
  return response.data;
}

export async function createOffer(offerData: CreateOfferData): Promise<Offer> {
  // Map frontend field names to backend schema
  const backendData = {
    method: 'POST',
    title: offerData.title,
    description: offerData.description,
    discount: offerData.discount,
    discountAmount: offerData.discountAmount,
    startDate: offerData.validFrom?.split('T')[0], // Convert ISO to YYYY-MM-DD
    endDate: offerData.validTo?.split('T')[0], // Convert ISO to YYYY-MM-DD
    isActive: offerData.isActive,
  };

  const { data, error } = await supabase.functions.invoke('offers', {
    body: backendData,
  });

  if (error) {
    if (isSessionExpiredError(error) || isSessionExpiredError(new Error(error.message))) {
      handleSessionExpiry();
      throw new Error('SESSION_EXPIRED');
    }
    throw new Error(error.message || "Failed to create offer");
  }

  const response = data as OfferResponse;
  if (!response.success) {
    if (isSessionExpiredError(new Error(response.error || ''))) {
      handleSessionExpiry();
      throw new Error('SESSION_EXPIRED');
    }
    throw new Error(response.error || "Failed to create offer");
  }
  
  return response.data;
}

export async function updateOffer(id: string, offerData: UpdateOfferData): Promise<Offer> {
  // Map frontend field names to backend schema
  const backendData: Record<string, unknown> = {
    method: 'PUT',
    id,
  };
  
  if (offerData.title !== undefined) backendData.title = offerData.title;
  if (offerData.description !== undefined) backendData.description = offerData.description;
  if (offerData.discount !== undefined) backendData.discount = offerData.discount;
  if (offerData.discountAmount !== undefined) backendData.discountAmount = offerData.discountAmount;
  if (offerData.validFrom !== undefined) backendData.startDate = offerData.validFrom.split('T')[0];
  if (offerData.validTo !== undefined) backendData.endDate = offerData.validTo.split('T')[0];
  if (offerData.isActive !== undefined) backendData.isActive = offerData.isActive;

  const { data, error } = await supabase.functions.invoke('offers', {
    body: backendData,
  });

  if (error) {
    if (isSessionExpiredError(error) || isSessionExpiredError(new Error(error.message))) {
      handleSessionExpiry();
      throw new Error('SESSION_EXPIRED');
    }
    throw new Error(error.message || "Failed to update offer");
  }

  const response = data as OfferResponse;
  if (!response.success) {
    if (isSessionExpiredError(new Error(response.error || ''))) {
      handleSessionExpiry();
      throw new Error('SESSION_EXPIRED');
    }
    throw new Error(response.error || "Failed to update offer");
  }
  
  return response.data;
}

export async function deleteOffer(id: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke('offers', {
    body: { method: 'DELETE', id },
  });

  if (error) {
    if (isSessionExpiredError(error) || isSessionExpiredError(new Error(error.message))) {
      handleSessionExpiry();
      throw new Error('SESSION_EXPIRED');
    }
    throw new Error(error.message || "Failed to delete offer");
  }

  const response = data as { success: boolean; error?: string };
  if (!response.success) {
    if (isSessionExpiredError(new Error(response.error || ''))) {
      handleSessionExpiry();
      throw new Error('SESSION_EXPIRED');
    }
    throw new Error(response.error || "Failed to delete offer");
  }
}
