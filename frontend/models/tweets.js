import mongoose from 'mongoose';

const TweetSchema = new mongoose.Schema({
    query: String,
    created_at: Date,
    tweets: [{
        Name: String,
        Handle: String,
        Timestamp: Date,
        Verified: Boolean,
        Content: String,
        Comments: String,
        Retweets: String,
        Likes: String,
        Analytics: String,
        Tags: [String],
        Mentions: [String],
        Emojis: [String],
        "Profile Image": String,
        "Tweet Link": String,
        "Tweet ID": String,
        leaning: {
            type: String,
            enum: ['left', 'centre', 'right']
        },
        ideological_summaries: {
            left: String,
            centre: String,
            right: String
        }
    }]
}, {
    collection: 'tweets' // Specify the collection name explicitly
});

export default mongoose.models.Tweets || mongoose.model('Tweets', TweetSchema);