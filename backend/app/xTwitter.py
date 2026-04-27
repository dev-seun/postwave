 
import tweepy
import re
from datetime import datetime
from typing import Any, Dict
from pydantic import BaseModel
import json

class XPostRequest(BaseModel):
    content: str
    api_keys: str
    is_test_api: bool = False
    
def post_to_x(data: XPostRequest) :
    if isinstance(data.api_keys, str):
        decrypted_data = json.loads(data.api_keys)
    else:
        decrypted_data = data.api_keys

    client = tweepy.Client(
        consumer_key=decrypted_data['api_key'],
        consumer_secret=decrypted_data['api_secret'],
        access_token=decrypted_data['access_token'],
        access_token_secret=decrypted_data['access_token_secret']
    )

    try:
        # Clean the content (Same as your JS regex)
        clean_text = re.sub(r"^\d+\.\s*", "", data.content)

        # Create Tweet 
        response = client.create_tweet(text=clean_text)
        
        created_tweet = response.data
        
        if created_tweet and 'id' in created_tweet:
            print(f"✅ Posted Tweet ID: {created_tweet['id']}")
            if data.is_test_api and created_tweet['id']:
                delete_x_post(data.api_keys, created_tweet['id'])
            return True, created_tweet['id']
        return False, None
            
    except tweepy.TweepyException as e:
        print(f"❌ X API Error: {e}")
        return False, None
      
def delete_x_post(api_keys: str, tweet_id: str):
    # Initialize the v2 Client
    if isinstance(api_keys, str):
        decrypted_data = json.loads(api_keys)
    else:
        decrypted_data = api_keys
    client = tweepy.Client(
        consumer_key=decrypted_data['api_key'],
        consumer_secret=decrypted_data['api_secret'],
        access_token=decrypted_data['access_token'],
        access_token_secret=decrypted_data['access_token_secret']
    )

    try:
        # The delete_tweet method requires the ID of the tweet
        response = client.delete_tweet(id=tweet_id)
        
        # response.data usually returns {'deleted': True}
        if response.data and response.data.get('deleted'):
            print(f"✅ Successfully deleted tweet: {tweet_id}")
            return True
        else:
            print(f"⚠️ Tweet {tweet_id} could not be deleted.")
            return False
            
    except tweepy.TweepyException as e:
        print(f"❌ X API Error during deletion: {e}")
        return False

def get_x_user_stats(api_keys):
    if isinstance(api_keys, str):
        decrypted_data = json.loads(api_keys)
    else:
        decrypted_data = api_keys
         
    auth = tweepy.OAuthHandler(decrypted_data['api_key'], decrypted_data['api_secret'])
    auth.set_access_token(decrypted_data['access_token'], decrypted_data['access_token_secret'])
    api = tweepy.API(auth)
     
    try:
        # 1. Get the user object (The data you just pasted)
        user = api.verify_credentials()
        print(f"✅ Retrieved user: {user}")
        
        # 2. Extract basic stats
        username = user.screen_name
        followers = user.followers_count
        total_posts = user.statuses_count # This is total tweets ever
         
        return {
            "username": username,
            "followers": followers,
            "total_posts": total_posts,
            "avg_engagement": 0
        }

    except Exception as e:
        print(f"❌ Error extracting stats: {e}")
        return None


def get_x_post_stats(api_keys, tweet_id) -> Any:
    # 1. Handle string/dict credentials
    if isinstance(api_keys, str):
        creds = json.loads(api_keys)
    else:
        creds = api_keys
    
    # 2. Use tweepy.Client for API v2
    client = tweepy.Client(
        consumer_key=creds['api_key'],
        consumer_secret=creds['api_secret'],
        access_token=creds['access_token'],
        access_token_secret=creds['access_token_secret']
    )

    try:
        # 3. Fetch the tweet with specific "tweet_fields" for metrics
        # Note: tweet_id must be a string or integer
        response = client.get_tweet(
            id=tweet_id, 
            tweet_fields=['public_metrics', 'non_public_metrics']
        )
        
        if not response.data:
            print(f"❌ Tweet {tweet_id} not found.")
            return None

        tweet = response.data
        metrics = tweet.public_metrics
        
        print(f"✅ Retrieved stats for tweet ID: {tweet_id}")

        return {
            "likes": metrics.get('like_count', 0),
            "comments": metrics.get('reply_count', 0),
            "shares": metrics.get('retweet_count', 0),
            "quotes": metrics.get('quote_count', 0),
            "reach": 0 # Reach/Impressions require "Organic Metrics" (Advanced Access)
        }

    except Exception as e:
        print(f"❌ Error extracting post stats: {e}")
        return None