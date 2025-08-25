import { NextResponse } from 'next/server';

export async function POST(request) {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5500';

    try {
        const data = await request.json();

        // Forward the request to the backend server
        const response = await fetch(`${backendUrl}/api/process`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Backend server error: ${response.statusText}`);
        }

        const result = await response.json();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Process API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to process query' },
            { status: 500 }
        );
    }
}