import { createClient } from '@supabase/supabase-js'
import { newId } from './p4p/defaults'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables')
}

// Regular client for normal operations (uses anon key)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Admin client for deleting users (uses service role key)
// This has admin privileges - use with caution!
export const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

if (!supabaseAdmin) {
  console.warn('⚠️ Supabase Admin client not initialized. Service role key missing.')
}

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

// ===== DELETE USER FROM SUPABASE AUTH =====
export const deleteSupabaseUser = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if admin client is available
    if (!supabaseAdmin) {
      return { 
        success: false, 
        error: 'Service role key not configured. Please check your .env file.' 
      };
    }

    // Check if userId looks like a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return { 
        success: false, 
        error: 'Invalid user ID format. Please use the Supabase Auth user ID (UUID).' 
      };
    }

    console.log('Deleting user from Supabase Auth:', userId);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (error) {
      console.error('Error deleting user:', error);
      return { success: false, error: error.message };
    }
    
    console.log('User deleted successfully:', userId);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return { success: false, error: error.message };
  }
};

// ===== FIND USER BY EMAIL =====
export const findUserByEmail = async (email: string): Promise<{ id: string; email: string } | null> => {
  try {
    if (!supabaseAdmin) {
      console.warn('Admin client not available, cannot search users by email');
      return null;
    }

    console.log('Searching for user by email:', email);
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.error('Error listing users:', error);
      return null;
    }

    const user = data?.users?.find((u: any) => u.email === email);
    if (user) {
      console.log('User found:', user.id);
      return { id: user.id, email: user.email };
    }
    
    console.log('User not found with email:', email);
    return null;
  } catch (error) {
    console.error('Error finding user:', error);
    return null;
  }
};