import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

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

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Clean filename and ensure extension is preserved
        const cleanFileName = fileName.replace(/\s+/g, '_');
        const baseName = cleanFileName.replace(/\.[^/.]+$/, '');
        const finalFileName = `${Date.now()}_${cleanFileName}`;

        // Define path
        const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'public/uploads');
        
        // Create directory if it doesn't exist
        try {
            await fs.access(uploadDir);
        } catch {
            await fs.mkdir(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, finalFileName);
        await fs.writeFile(filePath, buffer);

        // Path for web access
        const fileUrl = `/uploads/${finalFileName}`;

        return NextResponse.json({
            message: 'File uploaded successfully',
            url: fileUrl,
            resume: fileUrl
        });

    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: (error as any).message || 'Internal Server Error' }, { status: 500 });
    }
}
