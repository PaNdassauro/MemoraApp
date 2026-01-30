import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const supabase = createClientComponentClient();

// Storage bucket name for photos
export const PHOTOS_BUCKET = 'photos';
