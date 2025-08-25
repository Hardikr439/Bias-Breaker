import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const data = await request.json();

        // Forward the request to the backend server
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/search-topic`, {
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
        console.error('Search Topic API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to search topics' },
            { status: 500 }
        );
    }
}