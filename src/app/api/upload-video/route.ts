import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, STORAGE_BUCKET, VIDEOS_FOLDER } from '@/lib/supabase';
import { upsertMediaMapping, generateCdnUrl } from '@/lib/mediaMapping';

// Disable body parsing limit for file uploads
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  // Immediate logging to verify route is being called
  console.log('[UPLOAD-VIDEO] Route called at:', new Date().toISOString());
  console.log('[UPLOAD-VIDEO] Request headers:', {
    'content-type': request.headers.get('content-type'),
    'content-length': request.headers.get('content-length'),
  });
  
  try {
    console.log('[UPLOAD-VIDEO] Parsing formData...');
    const formData = await request.formData();
    console.log('[UPLOAD-VIDEO] FormData parsed successfully');
    const file = formData.get('file') as File;
    const logicalKey = formData.get('logicalKey') as string;
    const boardId = formData.get('boardId') as string;
    const fieldPath = formData.get('fieldPath') as string;

    // Validate inputs
    if (!file) {
      return NextResponse.json(
        { success: false, error: '파일이 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    if (!logicalKey || !boardId || !fieldPath) {
      return NextResponse.json(
        { success: false, error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // Validate file type - be more lenient with MIME type detection
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const validVideoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];
    const isValidVideoFile = file.type.startsWith('video/') || 
                            (fileExtension && validVideoExtensions.includes(fileExtension));
    
    if (!isValidVideoFile) {
      console.error('Invalid file type:', {
        fileName: file.name,
        fileType: file.type,
        fileExtension,
      });
      return NextResponse.json(
        { success: false, error: '영상 파일만 업로드 가능합니다.' },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: '파일 크기는 50MB 이하여야 합니다.' },
        { status: 400 }
      );
    }

    // Generate unique filename - ensure safe filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = fileExtension || 'mp4';
    const filename = `${timestamp}_${randomStr}.${ext}`;

    // Construct Supabase storage path - URL encode the path
    const supabasePath = `${VIDEOS_FOLDER}/${filename}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage using admin client
    let supabaseAdmin;
    try {
      supabaseAdmin = getSupabaseAdmin();
      console.log('Supabase admin client created successfully');
      console.log('Bucket:', STORAGE_BUCKET);
      console.log('Path:', supabasePath);
      console.log('File size:', buffer.length);
    } catch (error) {
      console.error('Failed to create Supabase admin client:', error);
      return NextResponse.json(
        { success: false, error: '서버 설정 오류: Supabase 서비스 역할 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    try {
      // Use Supabase JS client for better path handling
      const contentType = file.type || 'video/mp4';
      
      console.log('Upload attempt:', {
        originalFileName: file.name,
        fileName: filename,
        path: supabasePath,
        contentType,
        fileSize: buffer.length,
        fileType: file.type,
      });
      
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .upload(supabasePath, buffer, {
          contentType: contentType,
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error('Supabase Storage upload error:', {
          message: uploadError.message,
          error: uploadError,
          fileName: file.name,
          path: supabasePath,
        });
        return NextResponse.json(
          { 
            success: false, 
            error: `업로드 실패: ${uploadError.message}` 
          },
          { status: 500 }
        );
      }

      console.log('Upload successful:', uploadData);
    } catch (storageError: any) {
      console.error('Storage upload exception:', {
        message: storageError?.message,
        status: storageError?.status,
        statusCode: storageError?.statusCode,
        response: storageError?.response,
        error: storageError,
      });
      return NextResponse.json(
        { success: false, error: `Storage 오류: ${storageError?.message || '알 수 없는 오류'}` },
        { status: 500 }
      );
    }

    // Upsert media mapping
    const mappingSuccess = await upsertMediaMapping({
      logical_key: logicalKey,
      supabase_path: supabasePath,
      mime_type: file.type,
    });

    if (!mappingSuccess) {
      console.error('Failed to upsert media mapping');
      // Continue anyway, but log error
    }

    // Generate CDN URL
    const cdnUrl = generateCdnUrl(logicalKey, timestamp);

    return NextResponse.json({
      success: true,
      url: cdnUrl,
      logicalKey,
      supabasePath,
      timestamp,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
