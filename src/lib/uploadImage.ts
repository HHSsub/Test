import { supabase, STORAGE_BUCKET, IMAGES_FOLDER, getPublicUrl, CACHE_CONTROL_HEADER } from './supabase';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  path?: string;
}

/**
 * Upload an image to Supabase Storage
 * @param file - Image file to upload
 * @param folder - Subfolder within images folder (optional)
 * @returns UploadResult with public URL
 */
export async function uploadImage(
  file: File,
  folder?: string
): Promise<UploadResult> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: '이미지 파일만 업로드 가능합니다.',
      };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: '파일 크기는 5MB 이하여야 합니다.',
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split('.').pop();
    const filename = `${timestamp}_${randomStr}.${ext}`;

    // Construct path
    const pathParts = [IMAGES_FOLDER];
    if (folder) {
      pathParts.push(folder);
    }
    pathParts.push(filename);
    const path = pathParts.join('/');

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, {
        cacheControl: CACHE_CONTROL_HEADER,
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return {
        success: false,
        error: `업로드 실패: ${error.message}`,
      };
    }

    // Get public URL
    const publicUrl = getPublicUrl(STORAGE_BUCKET, path);

    return {
      success: true,
      url: publicUrl,
      path,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: '업로드 중 오류가 발생했습니다.',
    };
  }
}

/**
 * Delete an image from Supabase Storage
 * @param path - Full path of the file to delete
 * @returns Success boolean
 */
export async function deleteImage(path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([path]);

    if (error) {
      console.error('Supabase delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}
