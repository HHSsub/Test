import { supabase } from './supabase';

export interface MediaMapping {
  logical_key: string;
  supabase_path: string;
  mime_type?: string;
  updated_at?: string;
}

/**
 * Get media mapping by logical key
 * @param logicalKey - Logical key (e.g., "hero-1_mediaSrc")
 * @returns MediaMapping or null
 */
export async function getMediaMapping(logicalKey: string): Promise<MediaMapping | null> {
  try {
    const { data, error } = await supabase
      .from('media_mapping')
      .select('*')
      .eq('logical_key', logicalKey)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return null;
      }
      console.error('Get media mapping error:', error);
      return null;
    }

    return data as MediaMapping;
  } catch (error) {
    console.error('Get media mapping error:', error);
    return null;
  }
}

/**
 * Upsert media mapping (insert or update)
 * @param mapping - MediaMapping data
 * @returns Success boolean
 */
export async function upsertMediaMapping(mapping: MediaMapping): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('media_mapping')
      .upsert(
        {
          logical_key: mapping.logical_key,
          supabase_path: mapping.supabase_path,
          mime_type: mapping.mime_type,
        },
        {
          onConflict: 'logical_key',
        }
      );

    if (error) {
      console.error('Upsert media mapping error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Upsert media mapping error:', error);
    return false;
  }
}

/**
 * Delete media mapping by logical key
 * @param logicalKey - Logical key to delete
 * @returns Success boolean
 */
export async function deleteMediaMapping(logicalKey: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('media_mapping')
      .delete()
      .eq('logical_key', logicalKey);

    if (error) {
      console.error('Delete media mapping error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete media mapping error:', error);
    return false;
  }
}

/**
 * Get all media mappings
 * @returns Array of MediaMapping
 */
export async function getAllMediaMappings(): Promise<MediaMapping[]> {
  try {
    const { data, error } = await supabase
      .from('media_mapping')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Get all media mappings error:', error);
      return [];
    }

    return data as MediaMapping[];
  } catch (error) {
    console.error('Get all media mappings error:', error);
    return [];
  }
}

/**
 * Generate logical key from boardId and fieldPath
 * @param boardId - Board ID (e.g., "hero-1")
 * @param fieldPath - Field path (e.g., "content.mediaSrc")
 * @returns Logical key (e.g., "hero-1_content_mediaSrc")
 */
export function generateLogicalKey(boardId: string, fieldPath: string): string {
  return `${boardId}_${fieldPath.replace(/\./g, '_')}`;
}

/**
 * Generate CDN URL for a logical key
 * @param logicalKey - Logical key
 * @param timestamp - Optional timestamp for cache busting (default: Date.now())
 * @returns CDN URL (e.g., "/media/images/hero-1_mediaSrc?v=1733660023123")
 */
export function generateCdnUrl(logicalKey: string, timestamp?: number): string {
  const ts = timestamp || Date.now();
  // Determine type from logical key or default to images
  const type = logicalKey.includes('video') || logicalKey.includes('Video') ? 'videos' : 'images';
  return `/media/${type}/${logicalKey}?v=${ts}`;
}
