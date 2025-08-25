import { NextResponse } from 'next/server';

export async function GET(request) {
    if (!process.env.UNSPLASH_ACCESS_KEY) {
        return NextResponse.json(
            { error: "Unsplash API key is not configured" },
            { status: 500 }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query');

        if (!query) {
            return NextResponse.json(
                { error: "Query parameter is required" },
                { status: 400 }
            );
        }

        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1`,
            {
                headers: {
                    'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.errors?.[0] || 'Failed to fetch image');
        }

        const image = data.results[0];
        return NextResponse.json({
            imageUrl: image?.urls?.regular || null,
            credit: {
                name: image?.user?.name || 'Unsplash Photographer',
                link: image?.user?.links?.html || 'https://unsplash.com'
            }
        });
    } catch (error) {
        console.error('Unsplash API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch image' },
            { status: 500 }
        );
    }
}