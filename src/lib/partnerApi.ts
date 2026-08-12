import { supabase } from "@/integrations/supabase/client";

export interface PartnerKey {
  id: string;
  name: string;
  api_key_prefix: string;
  source_tag: string;
  is_active: boolean;
  last_used_at: string | null;
  usage_count: number;
  created_at: string;
}

export interface CreatedPartnerKey extends PartnerKey {
  api_key: string; // Plaintext, returned only once at creation
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

export const fetchPartnerKeys = async (): Promise<PartnerKey[]> => {
  const { data, error } = await supabase.functions.invoke<ApiResponse<PartnerKey[]>>(
    "partner-keys",
    { method: "GET" }
  );
  if (error) throw new Error(error.message || "Failed to fetch partner keys");
  if (!data?.success) throw new Error(data?.error || "Failed to fetch partner keys");
  return data.data;
};

export const createPartnerKey = async (
  name: string,
  source_tag: string
): Promise<{ key: CreatedPartnerKey; message?: string }> => {
  const { data, error } = await supabase.functions.invoke<ApiResponse<CreatedPartnerKey>>(
    "partner-keys",
    { method: "POST", body: { name, source_tag } }
  );
  if (error) throw new Error(error.message || "Failed to create partner key");
  if (!data?.success) throw new Error(data?.error || "Failed to create partner key");
  return { key: data.data, message: data.message };
};

export const togglePartnerKey = async (id: string, is_active: boolean): Promise<void> => {
  const { data, error } = await supabase.functions.invoke<ApiResponse<unknown>>(
    "partner-keys",
    { method: "PATCH", body: { id, is_active } }
  );
  if (error) throw new Error(error.message || "Failed to update partner key");
  if (!data?.success) throw new Error(data?.error || "Failed to update partner key");
};

export const deletePartnerKey = async (id: string): Promise<void> => {
  const { data, error } = await supabase.functions.invoke<ApiResponse<unknown>>(
    `partner-keys?id=${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
  if (error) throw new Error(error.message || "Failed to delete partner key");
  if (!data?.success) throw new Error(data?.error || "Failed to delete partner key");
};
