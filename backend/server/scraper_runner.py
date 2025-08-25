import sys
import os
from datetime import datetime
from scraper_file import Twitter_Scraper  # You may need to refactor the notebook code into scraper/main.py

def run_scraper_for_query(query, username, password, max_tweets=100):
    """
    Run the Twitter scraper for a given search query and return tweets as a list of dicts.
    """
    scraper = Twitter_Scraper(
        username=username,
        password=password,
        max_tweets=max_tweets,
        scrape_query=query,
        scrape_top=False
    )
    scraper.login()
    scraper.scrape_tweets(
        max_tweets=max_tweets,
        scrape_query=query,
        scrape_top=False
    )
    tweets = []
    for t in scraper.get_tweets():
        tweets.append({
            'Name': t[0],
            'Handle': t[1],
            'Timestamp': t[2],
            'Verified': t[3],
            'Content': t[4],
            'Comments': t[5],
            'Retweets': t[6],
            'Likes': t[7],
            'Analytics': t[8],
            'Tags': t[9],
            'Mentions': t[10],
            'Emojis': t[11],
            'Profile Image': t[12],
            'Tweet Link': t[13],
            'Tweet ID': t[14]
        })
    scraper.driver.close()
    return tweets
