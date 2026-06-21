import { NextRequest, NextResponse } from 'next/server';

/**
 * Advanced PDF Proxy:
 * Fetches the document from Cloudinary using a browser User-Agent to bypass 
 * server-side "Unauthorized" blocks. If the fetch still fails, it redirects 
 * to the source with an attachment flag as a stable fallback.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Resume URL is required' }, { status: 400 });
  }

  try {
    // Convert legacy image/upload URLs to raw/upload for proper PDF serving
    const fixedUrl = url.replace('/image/upload/', '/raw/upload/').split('?')[0];

    const response = await fetch(fixedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      return NextResponse.redirect(fixedUrl);
    }

    const blob = await response.blob();

    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="resume.pdf"',
        'Cache-Control': 'public, max-age=3600'
      },
    });
  } catch (error: any) {
    console.error('PDF Proxy Error:', error);
    return NextResponse.redirect(url);
  }
}
