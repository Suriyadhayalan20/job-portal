import { NextRequest } from 'next/server';
import { POST as applicationPOST } from '../../applications/route';

// Alias for /api/applications POST
export async function POST(request: NextRequest) {
    return applicationPOST(request);
}
