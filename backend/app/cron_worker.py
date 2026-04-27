import json
from datetime import datetime, timedelta

from .xTwitter import XPostRequest, get_x_post_stats, post_to_x
from .database import SessionLocal
from .models import Post, PlatformConnection
 
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import atexit
from datetime import datetime


def check_and_publish_posts():
    db = SessionLocal()
    try:
        now = datetime.now()
        print(f"⏰ Checking for scheduled posts at {now.isoformat()}...")
        pending_posts = db.query(Post).filter(
            Post.status == "scheduled",
            Post.scheduled_time <= now,
            # Post.platform[0].auto_publish_post == True
        ).all()
        
        print(f"Found {len(pending_posts)} pending posts to publish at {now.isoformat()}")

        for post in pending_posts: 

            try:
                # 3. Find the connection for this specific app and platform
                connection = db.query(PlatformConnection).filter(
                    PlatformConnection.app_id == post.app_id,
                    PlatformConnection.platform == post.platform
                ).first()

                if not connection or not connection.credentials:
                    raise Exception(f"No credentials found for {post.platform} on App {post.app_id}")
 
                # 5. Route to the correct platform logic
                result = None
                result, x_id = post_to_x(XPostRequest(api_keys=connection.credentials, content=post.content))
                
                # 6. Update post status based on result
                if result:
                    post.status = "published"
                    post.x_post_id = x_id
                    post.publishedAt = datetime.now()
                    print(f"Post {post.id} published successfully on {post.platform} at {post.publishedAt}")
                else:
                    print(f"Failed to publish post {post.id} on {post.platform}")
                    post.status = "failed"
                    
            except Exception as e:
                print(f"Error publishing post {post.id}: {str(e)}")
                post.status = "failed"
            
            db.commit()
    finally:
        db.close()
        
        
def get_post_stats():
    db = SessionLocal()
    try:
        now = datetime.now()
        print(f"⏰ Checking for posted posts to update stats at {now.isoformat()}...")
        posted_posts = db.query(Post).filter(
            Post.status == "published"
        ).all()
        
        print(f"Found {len(posted_posts)} posted posts to update stats at {now.isoformat()}")

        for post in posted_posts:
            try:
                # Fetch the latest stats from the platform (e.g., X)
                connection = db.query(PlatformConnection).filter(
                    PlatformConnection.app_id == post.app_id,
                    PlatformConnection.platform == post.platform
                ).first()

                if not connection or not connection.credentials:
                    raise Exception(f"No credentials found for {post.platform} on App {post.app_id}")

                if post.platform == "x":
                    stats = get_x_post_stats(connection.credentials, post.x_post_id)
                    post.comments = stats["comments"] if stats.get("comments") is not None else 0
                    post.likes = stats["likes"] if stats.get("likes") is not None else 0
                    post.shares = stats["shares"] if stats.get("shares") is not None else 0
                    post.reach = stats["reach"] if stats.get("reach") is not None else 0

                db.commit()
                print(f"Updated stats for post {post.id} on {post.platform}")
            except Exception as e:
                print(f"Error updating stats for post {post.id}: {str(e)}")
    finally:
        db.close()


def start_scheduler():
    scheduler = BackgroundScheduler()
    
    # Add the job to run every 30 seconds
    scheduler.add_job(
        func=check_and_publish_posts,
        trigger=IntervalTrigger(seconds=30),
        id='publish_job',
        name='Check and publish scheduled posts every 30 seconds',
        replace_existing=True
    )

    scheduler.start()
    print("⏰ Scheduler started: Checking for posts every 30 seconds...")

    # Shut down the scheduler when exiting the app
    atexit.register(lambda: scheduler.shutdown())
