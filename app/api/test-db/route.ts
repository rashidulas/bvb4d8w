import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

export async function GET() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        
        if (!MONGODB_URI) {
            return NextResponse.json({ 
                success: false,
                error: 'MONGODB_URI environment variable is not set',
                uri: 'NOT_SET'
            }, { status: 500 });
        }

        // Test connection
        const conn = await dbConnect();
        
        return NextResponse.json({ 
            success: true,
            message: 'MongoDB connected successfully',
            database: conn.db.databaseName,
            host: conn.host,
            // Only show first and last 10 chars of URI for security
            uriPreview: `${MONGODB_URI.substring(0, 20)}...${MONGODB_URI.substring(MONGODB_URI.length - 20)}`
        });
    } catch (err) {
        console.error('[test-db] Error:', err);
        return NextResponse.json({ 
            success: false,
            error: err instanceof Error ? err.message : 'Unknown error',
            stack: err instanceof Error ? err.stack : undefined
        }, { status: 500 });
    }
}
