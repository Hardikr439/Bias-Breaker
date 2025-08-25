import dbConnect from '@/lib/mongodb';
import Tweet from '@/models/tweets';

export async function GET() {
    console.log('GET /api/auth/topics - Starting request');
    try {
        console.log('Connecting to MongoDB...');
        await dbConnect();
        console.log('MongoDB connection established');

        console.log('Fetching topics from database...');
        const topics = await Tweet.find({}).lean();  // Using lean() for better performance
        console.log('Number of topics fetched:', topics.length);
        console.log('First topic sample:', topics[0]);

        return Response.json({ topics });
    } catch (error) {
        console.error('Failed to fetch topics:', error);
        return Response.json({ error: 'Failed to fetch topics', details: error.message }, { status: 500 });
    }
}