import { NextRequest, NextResponse } from 'next/server';
import { supabase, STORAGE_BUCKET, IMAGES_FOLDER } from '@/lib/supabase';
import { upsertMediaMapping, generateCdnUrl } from '@/lib/mediaMapping';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: '이미지 파일만 업로드 가능합니다.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: '파일 크기는 5MB 이하여야 합니다.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split('.').pop();
    const filename = `${timestamp}_${randomStr}.${ext}`;

    // Construct Supabase storage path
    const supabasePath = `${IMAGES_FOLDER}/${filename}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(supabasePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json(
        { success: false, error: `업로드 실패: ${uploadError.message}` },
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
