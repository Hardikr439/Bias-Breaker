// app/api/auth/newsapi/route.js
import { NextResponse } from 'next/server';

// Add this line to explicitly set the runtime
export const runtime = 'edge';

// Make sure the function is named GET and exported correctly
export async function GET(request) {
  if (!process.env.NEWS_API_KEY) {
    return NextResponse.json(
      { error: "News API key is not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?` +
      `q=(Israel OR Palestine OR Gaza)&` +
      `language=en&` +
      `sortBy=publishedAt&` +
      `pageSize=10`,
      {
        headers: {
          'X-Api-Key': process.env.NEWS_API_KEY
        }
      }
    );

    const data = await response.json();
   
    if (data.status !== 'ok') {
      throw new Error(data.message || 'Failed to fetch news');
    }

    const formattedNews = data.articles.map(article => ({
      title: article.title,
      source: article.source.name,
      description: article.description,
      url: article.url,
      publishedAt: article.publishedAt,
      imageUrl: article.urlToImage
    }));

    // Set appropriate CORS headers
    return new NextResponse(JSON.stringify({ news: formattedNews }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('News API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch news' },
      { status: 500 }
    );
  }
}