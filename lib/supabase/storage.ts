import { supabaseClient } from "@/lib/supabase/client";

export function getPublicUrl(bucket: string, path: string) {
  const { data } = supabaseClient.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
