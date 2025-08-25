import dbConnect from '@/lib/mongodb';
import Tweet from '@/models/tweets';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
    console.log('GET /api/auth/topics/[id] - Starting request');
    console.log('Topic ID:', params.id);

    try {
        console.log('Connecting to MongoDB...');
        await dbConnect();
        console.log('MongoDB connection established');

        console.log('Fetching topic from database...');
        const topic = await Tweet.findById(new ObjectId(params.id)).lean();
        console.log('Topic fetch result:', topic ? 'Found' : 'Not found');

        if (!topic) {
            console.log('Topic not found');
            return Response.json({ error: 'Topic not found' }, { status: 404 });
        }

        return Response.json({ topic });
    } catch (error) {
        console.error('Failed to fetch topic:', error);
        return Response.json({ error: 'Failed to fetch topic', details: error.message }, { status: 500 });
    }
}