import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client with service role key for admin operations
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Storage configuration
export const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'studio_upnexx';
export const IMAGES_FOLDER = process.env.NEXT_PUBLIC_IMAGES_FOLDER || 'images';
export const VIDEOS_FOLDER = process.env.NEXT_PUBLIC_VIDEOS_FOLDER || 'videos';

// Cache configuration
export const CACHE_MAX_AGE = 31536000; // 1 year in seconds
export const CACHE_CONTROL_HEADER = `public, max-age=${CACHE_MAX_AGE}, immutable`;

// Get public URL for a file with cache optimization
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path, {
    transform: {
      width: undefined, // 원본 사이즈 유지
      height: undefined,
      quality: undefined,
    },
  });
  return data.publicUrl;
}

// Get optimized image URL with cache parameters
export function getOptimizedImageUrl(
  bucket: string,
  path: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
  }
): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path, {
    transform: {
      width: options?.width,
      height: options?.height,
      quality: options?.quality || 80,
    },
  });
  return data.publicUrl;
}
