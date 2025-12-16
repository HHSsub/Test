import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, STORAGE_BUCKET, VIDEOS_FOLDER } from '@/lib/supabase';
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
    if (!file.type.startsWith('video/')) {
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

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split('.').pop();
    const filename = `${timestamp}_${randomStr}.${ext}`;

    // Construct Supabase storage path
    const supabasePath = `${VIDEOS_FOLDER}/${filename}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage using admin client
    let supabaseAdmin;
    try {
      supabaseAdmin = getSupabaseAdmin();
    } catch (error) {
      console.error('Failed to create Supabase admin client:', error);
      return NextResponse.json(
        { success: false, error: '서버 설정 오류: Supabase 서비스 역할 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(supabasePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true,
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
