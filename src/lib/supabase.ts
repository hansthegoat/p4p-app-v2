// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { newId } from './p4p/defaults'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const getSession = async () => {
  const { data } = await supabase.auth.getSession()
  return data.session
}

// ===== File upload helper =====
export const uploadProofFile = async (
  employeeId: string,
  kpiId: string,
  file: File
): Promise<{ id: string; fileUrl: string; fileName: string; fileType: string } | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${employeeId}/${kpiId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('proof-files')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('proof-files')
      .getPublicUrl(fileName);

    return {
      id: newId(),
      fileUrl: urlData.publicUrl,
      fileName: file.name,
      fileType: file.type,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
};

/**
 * Check if the currently signed-in user is a platform Super Admin.
 * Relies on RLS: the super_admins table only returns your own row
 * (if you're in it). Non-admins get zero rows back.
 */
export async function isCurrentUserSuperAdmin(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data, error } = await supabase
    .from("super_admins")
    .select("auth_id")
    .eq("auth_id", user.id)
    .maybeSingle();
  if (error) return false;
  return !!data;
}