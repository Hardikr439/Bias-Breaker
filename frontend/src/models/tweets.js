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
        },ideological_summaries: {
            left: String,
            centre: String,
            right: String
        }
    }]
}, {
    collection: 'tweets',  // Ensure this matches exactly with MongoDB collection name
    strictQuery: false // Add this to be less strict with queries
});

// Ensure model name matches collection name convention
const Tweet = mongoose.models.tweets || mongoose.model('tweets', TweetSchema);
export default Tweet;