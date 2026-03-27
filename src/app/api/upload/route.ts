import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Validation: Only allow PDF, DOC, DOCX
        const allowedExtensions = ['.pdf', '.doc', '.docx'];
        const fileName = file.name;
        const fileExtension = `.${fileName.split('.').pop()?.toLowerCase()}`;

        if (!allowedExtensions.includes(fileExtension)) {
            return NextResponse.json({ error: 'Invalid file type. Only PDF, DOC, and DOCX are allowed.' }, { status: 400 });
        }

        // Validation: Max size 5MB
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json({ error: 'File size too large. Maximum size is 5MB.' }, { status: 400 });
        }

        // Convert file to buffer for Cloudinary
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Clean filename and ensure extension is preserved for raw upload
        const cleanFileName = fileName.replace(/\s+/g, '_');

        // Upload to Cloudinary using upload_stream
        const result: any = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'resumes',
                    resource_type: 'raw',
                    public_id: `${Date.now()}_${cleanFileName}${fileExtension}`
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary Upload Error:', error);
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );
            uploadStream.end(buffer);
        });

        // Ensure PDF is viewable in browser using fl_inline
        const secureUrl = result.secure_url.replace('/upload/', '/upload/fl_inline/');

        // Return the Cloudinary secure URL in the requested format
        return NextResponse.json({
            message: 'File uploaded successfully',
            url: secureUrl,
            resume: secureUrl
        });

    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: (error as any).message || 'Internal Server Error' }, { status: 500 });
    }
}
