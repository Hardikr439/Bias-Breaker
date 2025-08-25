import pandas as pd
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from transformers import pipeline  # Keep this for tweet summarization
from db import insert_tweets, get_tweets_by_query, get_tweets_by_query_id, update_tweets_by_query_id, search_similar_topics, get_all_topics
from scraper_runner import run_scraper_for_query
from predict_pipeline import run_relevance_prediction, run_ideology_prediction
import logging
import time
from typing import Tuple, Optional

# Example credentials (replace with env or config in production)
SCRAPER_USERNAME = "ItoutTry71369"
SCRAPER_PASSWORD = "ABCDEFGHIJ"

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('query_optimizer.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def normalize_query(query: str) -> str:
    """Normalize a query for comparison by removing special characters and converting to lowercase."""
    return query.lower().strip().replace(' ', '_').replace(')', '').replace('(', '')

def process_query_text(query: str) -> Tuple[str, str]:
    """
    Process the query and return both the search query and storage key.
    No optimization is performed - the query is used directly.
    
    Args:
        query (str): The original search query
        
    Returns:
        Tuple[str, str]: (search_query, storage_key)
    """
    start_time = time.time()
    logger.info(f"Processing query: {query}")
    
    try:
        # Use the original query directly for searching
        search_query = query.strip()
        
        # Create a normalized version for storage
        storage_key = normalize_query(query)
        
        duration = time.time() - start_time
        logger.info(f"Query processing completed in {duration:.2f}s")
        
        return search_query, storage_key
        
    except Exception as e:
        logger.error(f"Error processing query: {e}")
        return query, normalize_query(query)

def search_topic(query: str) -> dict:
    """
    Search for existing similar topics.
    Returns a dictionary containing existing topics and a boolean indicating if an exact match was found.
    """
    normalized_query = normalize_query(query)
    existing_topics = search_similar_topics(normalized_query)
    
    exact_match = None
    similar_topics = []
    
    for topic in existing_topics:
        if normalize_query(topic['query']) == normalized_query:
            exact_match = topic
        else:
            similar_topics.append(topic)
    
    return {
        'exact_match': exact_match,
        'similar_topics': similar_topics[:5]  # Return top 5 similar topics
    }

def process_query_pipeline(query: str, max_tweets: int = 2000) -> Optional[str]:
    """
    Main pipeline: process query, check if exists, fetch or scrape tweets, store in MongoDB if new.
    
    Args:
        query (str): The search query
        max_tweets (int): Maximum number of tweets to retrieve
        
    Returns:
        Optional[str]: MongoDB query_id if successful, None if failed
    """
    try:
        # 1. Process the query (no optimization, just normalization)
        search_query, storage_key = process_query_text(query)
        logger.info(f"Original query: {query}")
        logger.info(f"Search query: {search_query}")
        
        # 2. Check if query already exists in storage
        existing_doc = get_tweets_by_query(storage_key)
        if existing_doc and 'tweets' in existing_doc:
            logger.info(f"Found existing tweets for query: {storage_key}")
            tweets = existing_doc['tweets']
            query_id = str(existing_doc['_id'])
        else:
            # 3. Scrape tweets if not present
            logger.info(f"Scraping new tweets for query: {search_query}")
            tweets = run_scraper_for_query(search_query, SCRAPER_USERNAME, SCRAPER_PASSWORD, max_tweets=max_tweets)
            if not tweets:
                logger.error("No tweets retrieved from scraper")
                return None
                
            # 4. Store raw tweets in MongoDB
            query_id = insert_tweets(storage_key, tweets)
            logger.info(f"Stored {len(tweets)} tweets with query_id: {query_id}")
    
        # 5. Run predictions
        logger.info("Running relevance prediction...")
        df_relevance = run_relevance_prediction(tweets)
        logger.info("Running ideology prediction...")
        df_final = run_ideology_prediction(df_relevance)
        
        # 6. Update MongoDB with final output
        df_final.to_csv(r"C:\Learn\IPD\backend\server\tempdata\tempPred.csv", index=False, encoding='utf-8')
        update_tweets_by_query_id(query_id, df_final.to_dict(orient='records'))
        logger.info(f"Updated MongoDB with predictions for query_id: {query_id}")
        
        return query_id
        
    except Exception as e:
        logger.error(f"Error in query pipeline: {e}", exc_info=True)
        return None

def get_tweets_for_query_id(query_id):
    doc = get_tweets_by_query_id(query_id)
    if doc:
        return doc['tweets']
    return []

def export_tweets_to_csv(query_id, query_name, data_folder="data"):
    """
    Fetch tweets from MongoDB by query_id and store them in a CSV file named after the query inside the data folder.
    """
    doc = get_tweets_by_query_id(query_id)
    if not doc or 'tweets' not in doc:
        print(f"No tweets found for query_id: {query_id}")
        return
    tweets = doc['tweets']
    df = pd.DataFrame(tweets)
    if not os.path.exists(data_folder):
        os.makedirs(data_folder)
    filename = os.path.join(data_folder, f"{query_name.replace(' ', '_')}_tweets.csv")
    df.to_csv(filename, index=False, encoding='utf-8')
    print(f"Tweets exported to {filename}")

def chunk_text(texts, max_tokens=800):
    """Split list of texts into chunks that won't exceed token limit."""
    chunks = []
    current_chunk = []
    current_length = 0
    
    for text in texts:
        # Rough estimate of tokens (words + some extra for special tokens)
        estimated_tokens = len(text.split()) + 10
        
        if current_length + estimated_tokens > max_tokens:
            if current_chunk:  # Save current chunk if not empty
                chunks.append(" ".join(current_chunk))
            current_chunk = [text]
            current_length = estimated_tokens
        else:
            current_chunk.append(text)
            current_length += estimated_tokens
    
    if current_chunk:  # Add the last chunk
        chunks.append(" ".join(current_chunk))
    
    return chunks

def batch_summarize_tweets(tweets, summarizer, max_batch_size=10):
    """
    Hierarchically summarize tweets by processing them in batches and recursively summarizing until reaching a single summary.
    """
    summaries = tweets
    batch = []

    while len(summaries) > 1:
        tweets = summaries
        summaries = []
        for tweet in tweets:
            batch.append(tweet)
            
            # Summarize when reaching batch size or at the end
            if len(batch) == max_batch_size or tweet == tweets[-1]:
                try:
                    batch_text = " ".join(batch)
                    summary = summarizer(batch_text, 
                                      max_length=150, 
                                      min_length=20, 
                                      do_sample=False,
                                      truncation=True)[0]['summary_text']
                    summaries.append(summary)
                except Exception as e:
                    print(f"Error summarizing batch: {e}")
                    # If error occurs, just join the batch as fallback
                    summaries.append(" ".join(batch[:3]) + "...") # Include first 3 tweets as sample
                batch = []
    
    return summaries[0] if summaries else "No summary generated."

def generate_ideological_summaries(query_id):
    """
    Generate summaries for tweets based on their ideological leanings (left, center, right)
    using hierarchical batch summarization.
    """
    print(f"Starting summary generation for query_id: {query_id}")
    
    # Get tweets from MongoDB
    doc = get_tweets_by_query_id(query_id)
    if not doc or 'tweets' not in doc:
        print("No tweets found in MongoDB for this query_id")
        return None
        
    # Convert to DataFrame for easier processing
    tweets_df = pd.DataFrame(doc['tweets'])
    print(f"Total tweets loaded: {len(tweets_df)}")
    
    # Initialize the summarization pipeline with a lighter model
    print("Initializing summarization pipeline...")
    summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6", device="cpu")
    
    # Generate summaries for each ideological leaning
    summaries = {}
    for leaning in ['left', 'centre', 'right']:
        print(f"\nProcessing {leaning} leaning tweets...")
        # Filter tweets by leaning
        leaning_tweets = tweets_df[tweets_df['leaning'].str.lower() == leaning]['Content'].tolist()
        print(f"Found {len(leaning_tweets)} tweets for {leaning} leaning")
        
        if not leaning_tweets:
            summaries[leaning] = "No tweets found for this ideological leaning."
            continue
            
        # Use hierarchical batch summarization
        try:
            print(f"Generating summary for {leaning} leaning...")
            summary = batch_summarize_tweets(leaning_tweets, summarizer)
            summaries[leaning] = summary
            print(f"Summary generated for {leaning}: {summary[:100]}...")  # Print first 100 chars of summary
        except Exception as e:
            print(f"Error generating summary for {leaning}: {str(e)}")
            summaries[leaning] = "Error generating summary for this ideological leaning."
    
    # Update MongoDB document with summaries
    print("\nUpdating MongoDB with generated summaries...")
    doc['ideological_summaries'] = summaries
    update_tweets_by_query_id(query_id, doc['tweets'], summaries=summaries)
    print("MongoDB update completed")
    
    return summaries

# Initialize Flask app
app = Flask(__name__)
CORS(app)

@app.route('/api/search-topic', methods=['POST'])
def search_topic_endpoint():
    data = request.get_json()
    query = data.get('query')
    if not query:
        return jsonify({"error": "No query provided"}), 400
        
    result = search_topic(query)
    # If exact match, return only query_id
    if result['exact_match']:
        return jsonify({
            "query_id": str(result['exact_match']['_id']),
            "existing": True,
            "similar_topics": [
                {"_id": str(t['_id']), "query": t['query']} for t in result['similar_topics']
            ]
        })
    # Otherwise, return only similar topics (no tweets)
    return jsonify({
        "similar_topics": [
            {"_id": str(t['_id']), "query": t['query']} for t in result['similar_topics']
        ]
    })

@app.route('/api/process', methods=['POST'])
def process_query_endpoint():
    data = request.get_json()
    query = data.get('query')
    force_new = data.get('forceNew', False)  # Option to force new analysis
    
    if not query:
        return jsonify({"error": "No query provided"}), 400
    
    # Check for existing topics first
    if not force_new:
        search_result = search_topic(query)
        if search_result['exact_match']:
            # Return only query_id if topic exists
            return jsonify({
                "query_id": str(search_result['exact_match']['_id']),
                "existing": True
            })
    
    # If no exact match or force_new is True, proceed with new analysis
    query_id = process_query_pipeline(query, max_tweets=1000)
    export_tweets_to_csv(query_id, query)
    generate_ideological_summaries(query_id)
    if not query_id:
        return jsonify({"error": "Failed to process query"}), 500
    
    # Do not send tweets or summaries, just the query_id
    return jsonify({
        "query_id": query_id,
        "existing": False
    })

@app.route('/api/topics/<query_id>', methods=['GET'])
def get_topic(query_id):
    """Get a specific topic by ID."""
    try:
        topic = get_tweets_by_query_id(query_id)
        if not topic:
            return jsonify({"error": "Topic not found"}), 404
            
        # Convert numeric values in tweets
        if topic.get('tweets'):
            for tweet in topic['tweets']:
                tweet['Comments'] = int(tweet.get('Comments', 0))
                tweet['Retweets'] = int(tweet.get('Retweets', 0))
                tweet['Likes'] = int(tweet.get('Likes', 0))
                
        topic['_id'] = str(topic['_id'])
        return jsonify({"topic": topic})
    except Exception as e:
        logger.error(f"Error fetching topic {query_id}: {e}")
        return jsonify({"error": "Failed to fetch topic"}), 500

@app.route('/api/topics', methods=['GET'])
def get_topics_route():
    """Get all analyzed topics."""
    try:
        topics = get_all_topics()
        # Convert numbers and clean up tweets data
        cleaned_topics = []
        for topic in topics:
            # Ensure _id is a string
            topic['_id'] = str(topic['_id'])
            
            # Clean up tweets data
            if 'tweets' in topic and topic['tweets']:
                for tweet in topic['tweets']:
                    try:
                        tweet['Comments'] = int(tweet.get('Comments', 0))
                        tweet['Retweets'] = int(tweet.get('Retweets', 0))
                        tweet['Likes'] = int(tweet.get('Likes', 0))
                    except (ValueError, TypeError):
                        tweet['Comments'] = 0
                        tweet['Retweets'] = 0
                        tweet['Likes'] = 0
            
            cleaned_topics.append(topic)
        
        return jsonify({"topics": cleaned_topics})
    except Exception as e:
        logger.error(f"Error fetching topics: {e}")
        return jsonify({"error": "Failed to fetch topics"}), 500

if __name__ == '__main__':
    # No need to preload any model now
    app.run(host='localhost', port=5500, debug=True)
