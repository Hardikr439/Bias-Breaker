from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime

# MongoDB connection (update with your actual connection string)
client = MongoClient('mongodb://localhost:27017/')
db = client['tweets']
tweets_collection = db['tweets']
topics_collection = db['tweets']

def insert_tweets(query, tweets):
    """Insert tweets for a query into MongoDB."""
    doc = {
        'query': query,
        'tweets': tweets,
        'created_at': datetime.utcnow()
    }
    result = tweets_collection.insert_one(doc)
    return str(result.inserted_id)

def get_tweets_by_query(query):
    """Get tweets by query string."""
    return tweets_collection.find_one({'query': query})

def get_tweets_by_query_id(query_id):
    """Get tweets by MongoDB ObjectId."""
    try:
        return tweets_collection.find_one({'_id': ObjectId(query_id)})
    except:
        return None

def update_tweets_by_query_id(query_id, tweets, summaries=None):
    """
    Update tweets and optionally add ideological summaries for a query.
    
    Args:
        query_id: MongoDB ObjectId as string
        tweets: List of tweet dictionaries
        summaries: Optional dictionary of ideological summaries
    """
    update_doc = {'tweets': tweets}
    if summaries:
        update_doc['ideological_summaries'] = summaries
    
    try:
        tweets_collection.update_one(
            {'_id': ObjectId(query_id)},
            {'$set': update_doc}
        )
        return True
    except Exception as e:
        print(f"Error updating tweets: {str(e)}")
        return False

def search_similar_topics(query, max_results=5):
    """
    Search for similar topics using text search.
    Returns both exact matches and similar topics.
    """
    # Create text index if it doesn't exist
    topics_collection.create_index([("query", "text")])
    
    # Search for similar topics
    similar_topics = list(topics_collection.find(
        {"$text": {"$search": query}},
        {"score": {"$meta": "textScore"}}
    ).sort([("score", {"$meta": "textScore"})]).limit(max_results))
    
    # Convert ObjectId to string for JSON serialization
    for topic in similar_topics:
        topic['_id'] = str(topic['_id'])
    print(len(similar_topics))
    return similar_topics

def get_all_topics():
    """Get all topics with their metadata."""
    topics = list(tweets_collection.find({}, {
        'query': 1,
        'tweets': 1,
        'ideological_summaries': 1,
        'created_at': 1
    }))
    
    # Convert ObjectId to string for JSON serialization
    for topic in topics:
        topic['_id'] = str(topic['_id'])
    
    return topics
