import { NextRequest, NextResponse } from 'next/server';
import { supabase, STORAGE_BUCKET } from '@/lib/supabase';
import { getMediaMapping } from '@/lib/mediaMapping';

export const runtime = 'edge'; // Use Edge Runtime for better performance

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Extract path segments
    // URL format: /media/<type>/<logical_key>?v=<timestamp>
    // Example: /media/images/hero-1_mediaSrc?v=1733660023123
    const pathSegments = params.path;

    if (!pathSegments || pathSegments.length < 2) {
      return NextResponse.json(
        { error: 'Invalid media path' },
        { status: 400 }
      );
    }

    const type = pathSegments[0]; // 'images' or 'videos'
    const logicalKey = pathSegments[1]; // 'hero-1_mediaSrc'

    // Validate type
    if (type !== 'images' && type !== 'videos') {
      return NextResponse.json(
        { error: 'Invalid media type. Must be "images" or "videos".' },
        { status: 400 }
      );
    }

    // Get media mapping from database
    const mapping = await getMediaMapping(logicalKey);

    if (!mapping) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      );
    }

    // Get public URL from Supabase
    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(mapping.supabase_path);

    if (!data || !data.publicUrl) {
      return NextResponse.json(
        { error: 'Failed to generate public URL' },
        { status: 500 }
      );
    }

    // Fetch file from Supabase
    const fileResponse = await fetch(data.publicUrl);

    if (!fileResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch file from storage' },
        { status: 500 }
      );
    }

    // Get file blob
    const blob = await fileResponse.blob();

    // Create response with proper headers for Cloudflare CDN caching
    const response = new NextResponse(blob, {
      status: 200,
      headers: {
        // Content Type from mapping or file response
        'Content-Type': mapping.mime_type || fileResponse.headers.get('content-type') || 'application/octet-stream',
        
        // Cloudflare CDN caching headers
        // max-age=0: Browser revalidates immediately
        // s-maxage=31536000: CDN caches for 1 year
        // stale-while-revalidate=86400: Serve stale content while revalidating (1 day)
        'Cache-Control': 'public, max-age=0, s-maxage=31536000, stale-while-revalidate=86400',
        
        // ETag for conditional requests
        'ETag': `"${logicalKey}-${mapping.updated_at}"`,
        
        // CORS headers (if needed)
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        
        // Security headers
        'X-Content-Type-Options': 'nosniff',
      },
    });

    return response;
  } catch (error) {
    console.error('Media route error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
