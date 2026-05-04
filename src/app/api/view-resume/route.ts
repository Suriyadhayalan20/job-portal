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
    // 1. Attempt to fetch as a browser to bypass security filters
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
        // 2. FALLBACK: If unauthorized, redirect the user's browser directly.
        // Since the user is likely logged into Cloudinary or has a session,
        // the direct redirect will work where the server-side fetch failed.
        const fallbackUrl = url.includes('?') ? `${url}&fl_attachment=true` : `${url}?fl_attachment=true`;
        return NextResponse.redirect(fallbackUrl);
    }

    // 3. SUCCESS: Stream the file bytes back to the user
    const blob = await response.blob();
    
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="resume.pdf"',
        'Cache-Control': 'public, max-age=3600'
      },
    });
  } catch (error: any) {
    console.error('Advanced PDF Proxy Error:', error);
    // Final fallback redirect
    return NextResponse.redirect(url);
  }
}
