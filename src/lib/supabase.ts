import { createClient } from '@supabase/supabase-js';

// Supabase configuration - Replace with your actual values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket name for photos
export const PHOTOS_BUCKET = 'photos';
