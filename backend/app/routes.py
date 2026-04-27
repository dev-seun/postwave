
from datetime import datetime
import json

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from .database import SessionLocal

from .response import success_response, error_response
from .models import User, App, PlatformConnection, Post
from .auth import verify_clerk_token
from .agent import generate_post
from .api_model import AppPayload, EditPostRequest, GeneratePostRequest, SaveSettingsRequest, SchedulePostRequest
from .xTwitter import XPostRequest, get_x_user_stats, post_to_x


router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
         
@router.get("/fetch-apps")  
def get_apps_for_user(user=Depends(verify_clerk_token), db: Session=Depends(get_db)):
    try:
        user_obj = db.query(User).filter(User.clerk_id == user).first() # Ensure using "sub" from JWT
    except Exception as e:
        return success_response(message="No apps found", data=[])
    if not user_obj:
        return success_response(message="No apps found", data=[])

    apps = db.query(App).filter(App.owner_id == user_obj.id).all()

    formatted_apps = []
    for app in apps:
        conn: PlatformConnection | None = app.platform_connections[0] if app.platform_connections else None
        
        formatted_apps.append({
            "id": app.id,
            "name": app.name,
            "platform": [conn.platform if conn else None][0], # Keep as list for your frontend .map
            "followers": conn.followers if conn else None,
            "posts": conn.posts if conn else None,
            "platform_username": conn.platform_username if conn else None,
            "engagements": conn.engagements if conn else None,
            "connected": conn.connected if conn else None,
        })
    return success_response(message="Apps fetched successfully", data=formatted_apps)

@router.post("/create-app")
def create_app(name: AppPayload, user=Depends(verify_clerk_token), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.clerk_id == user).first()
    print(f"Creating app for user: {user}, DB user: {db_user}")
    # validate app name
    if not name.name or len(name.name) < 3:
        return error_response(400, "App name must be at least 3 characters long")
    #check if app with the same name already exists for this user
    if db_user:
        existing_app = db.query(App).filter(App.owner_id == db_user.id, App.name == name.name).first()
        if existing_app:
            return error_response(400, "You already have an app with this name. Please choose a different name.")
        
    if not db_user:
        db_user = User(clerk_id=user)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    app = App(name=name.name, owner_id=db_user.id)
    # add platform connections if provided must conform to "x, linkedin, facebook, discord"
    if name.platforms:
        platforms = [p.strip().lower() for p in name.platforms.split(",")]
        allowed = {"x", "linkedin", "facebook", "discord"}
        for platform in platforms:
            if platform not in allowed:
                return error_response(400, f"Platform '{platform}' is not supported. Allowed platforms are: {', '.join(allowed)}")
            conn = PlatformConnection(platform=platform)
            app.platform_connections.append(conn)
            
    db.add(app)
    db.commit()
    db.refresh(app)
    return success_response(status_code=201, message="App created successfully", data={"id": app.id, "name": app.name})

def engagement(posts: list[Post]):
    # simple engagement metric for demo purposes
    total_engagement = 0
    for post in posts:
        total_engagement += post.likes + post.comments + post.shares
    return total_engagement / len(posts) if posts else 0

@router.get("/app/{app_id}")
def get_app_details(app_id: int, user=Depends(verify_clerk_token), db: Session = Depends(get_db)):
    user_obj = db.query(User).filter(User.clerk_id == user).first()
    app = db.query(App).filter(App.id == app_id, App.owner_id == user_obj.id).first()
    if not app:
        return error_response(404, "App not found")
    conn = app.platform_connections[0] if app.platform_connections else None
    completed_post = db.query(Post).filter(Post.app_id == app_id, Post.status == "published").all()
    avg_engagement = engagement(completed_post) 
    app_data = {
        "user": {
            "user_id": user},
        "id": app.id,
        "name": app.name,
        "platform": conn.platform if conn else None,
        "followers": conn.followers if conn else None,
        "posts": len(completed_post) if conn else None,
        "platform_username": conn.platform_username if conn else None,
        "engagements": avg_engagement if conn else None,
        "connected  ": conn.connected  if conn else None,
        "is_active": app.is_active,
        "credentials": conn.credentials if conn else None,
        "auto_publish_post": conn.auto_publish_post if conn else None,
        "failure_notification": conn.failure_notification if conn else None,
    }
    return success_response(message="App details fetched successfully", data=app_data)

@router.get("/app/{app_id}/posts")
# add pagination and filtering by status
def list_posts(
    app_id: int,
    page: int = 1,
    limit: int = 10,
    status: str | None = None,
    user=Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    # check if app belongs to user
    user_obj = db.query(User).filter(User.clerk_id == user).first()
    app = db.query(App).filter(App.id == app_id, App.owner_id == user_obj.id).first()
    if not app:
        return error_response(404, "App not found")
    
    query = db.query(Post).filter(Post.app_id == app_id)
    if status:
        query = query.filter(Post.status == status)

    total = query.count()
    posts = query.order_by(Post.id.desc()).offset((page - 1) * limit).limit(limit).all()
    
    return success_response(
        message="Posts fetched successfully",
        data={
            "total": total,
            "page": page,
            "limit": limit,
            "has_next": (page * limit) < total,
            "has_previous": page > 1,
            "posts": [
                {
                    "id": p.id,
                    "content": p.content,
                    "platform": p.platform,
                    "publishAt": p.publishedAt.isoformat() if hasattr(p, 'publishedAt') and p.publishedAt else None,
                    "created_at": p.created_at.isoformat() if p.created_at else None,
                    "likes": p.likes,
                    "comments": p.comments,
                    "shares": p.shares,
                    "reach": p.reach,
                    "scheduled_time": p.scheduled_time.isoformat() if p.scheduled_time else None,
                    "status": p.status,
                }
                for p in posts
            ]
        }
    )

 
@router.post("/app/{app_id}/generate-post")
def generate_and_save_post(app_id: int, req: GeneratePostRequest, user=Depends(verify_clerk_token), db: Session = Depends(get_db)):
    user_obj = db.query(User).filter(User.clerk_id == user).first()
    app = db.query(App).filter(App.id == app_id, App.owner_id == user_obj.id).first()
    if not app:
        return error_response(404, "App not found")
    
    if not app.is_active:
        return error_response(400, "App is not active. Please activate the app by providing the necessary credentials before generating posts.")
    
    content = req.context if req.context is not None else "Youre a greate content creator with a unique voice and style. Your posts are clever, concise, and feel authentic. You have a deep understanding of your audience and what resonates with them. You know how to craft engaging content that sparks conversations and builds a loyal following for " + req.platform
    
    if req.use_llm:
        content = generate_post(prompt=req.context or '', platform=req.platform)
        if content.startswith("CRITICIZE:"):
            return error_response(500, "Failed to generate post content, please try again.")
        
    post = Post(app_id=app_id, content=content, platform=req.platform)
    
    db.add(post)
    db.commit()
    db.refresh(post)
    return success_response(
    message="Posts generated successfully",
    data={
        "posts": [{
            "id": post.id,
            "content": post.content,
            "platform": post.platform,
            "created_at": post.created_at.isoformat() if post.created_at else None
        }]
    }
)

@router.patch("/post/{post_id}/edit")
def edit_post(post_id: int, req: EditPostRequest, user=Depends(verify_clerk_token), db: Session = Depends(get_db)):
    # check if post belongs to user's app
    user_obj = db.query(User).filter(User.clerk_id == user).first()
    post = db.query(Post).filter(Post.id == post_id, Post.app.has(owner_id=user_obj.id)).first()
    if not post:
        return error_response(404, "Post not found")
    post.content = req.new_content
    if post.status == "failed":
        post.status = "draft"
    db.commit()
    return success_response(message="Post updated successfully")

@router.delete("/post/{post_id}")
def delete_post(post_id: int, user=Depends(verify_clerk_token), db: Session = Depends(get_db)):
    user_obj = db.query(User).filter(User.clerk_id == user).first()
    post = db.query(Post).filter(Post.id == post_id, Post.app.has(owner_id=user_obj.id)).first()
    if not post:
        return error_response(404, "Post not found")
    db.delete(post)
    db.commit()
    return success_response(message="Post deleted successfully")

@router.post("/post/{post_id}/schedule")
def schedule_post(post_id: int, req: SchedulePostRequest, user=Depends(verify_clerk_token), db: Session = Depends(get_db)):
    user_obj = db.query(User).filter(User.clerk_id == user).first()
    post = db.query(Post).filter(Post.id == post_id, Post.app.has(owner_id=user_obj.id)).first()
    if not post:
        return error_response(404, "Post not found")
    post.scheduled_time = req.scheduled_time
    post.status = "scheduled"
    db.commit()
    return success_response(message="Post scheduled successfully")

@router.post("/post/{post_id}/publish")
def publish_post(post_id: int, user=Depends(verify_clerk_token), db: Session = Depends(get_db)):
    user_obj = db.query(User).filter(User.clerk_id == user).first()
    post = db.query(Post).filter(Post.id == post_id, Post.app.has(owner_id=user_obj.id)).first()
    if not post:
        return error_response(404, "Post not found")
    posted, x_id = post_to_x(XPostRequest(content=post.content, api_keys=post.app.platform_connections[0].credentials))
    if not posted:
        return error_response(500, "Failed to publish post to X")
    post.status = "published"
    post.x_post_id = x_id
    post.app.platform_connections[0].posts += 1
    post.publishedAt = datetime.utcnow()
    db.commit()
    return success_response(message="Post published successfully")


@router.post("/app/{app_id}/activate-deactivate")
def activate_deactivate_app(app_id: int, user=Depends(verify_clerk_token), db: Session = Depends(get_db)):
    user_obj = db.query(User).filter(User.clerk_id == user).first()
    app = db.query(App).filter(App.id == app_id, App.owner_id == user_obj.id).first()
    if not app:
        return error_response(404, "App not found")
    try:
        if not app.is_active:
            # Test API keys by posting and deleting a test post
            conn = app.platform_connections[0] if app.platform_connections else None
            if not conn:
                return error_response(400, "No platform connection found for this app")
            created_tweet, x_id = post_to_x(XPostRequest(content="Test post to validate API keys", api_keys=conn.credentials, is_test_api=True))
            if not created_tweet:
                return error_response(400, f"Failed to validate API keys")
            # If test post is successful, we can activate the app
            app.is_active = True
            conn.connected = datetime.utcnow().isoformat()
        else:
            conn = app.platform_connections[0] if app.platform_connections else None
            if conn:
                conn.connected = None
            app.is_active = False
        db.commit()
        return success_response(message=f"App {'activated' if app.is_active else 'deactivated'} successfully")
    except Exception as e:
        db.rollback()
        print(f"❌ Error activating/deactivating app: {e}")
        return error_response(400, f"An error occurred while {'activating' if not app.is_active else 'deactivating'} the app {not app.is_active and 'activation' or 'deactivation'} failed. Please check your API keys and try again.")
    

@router.post("/app/{app_id}/save-settings")
def save_settings(app_id: int, req: SaveSettingsRequest, user=Depends(verify_clerk_token), db: Session = Depends(get_db)):
    user_obj = db.query(User).filter(User.clerk_id == user).first()
    app = db.query(App).filter(App.id == app_id, App.owner_id == user_obj.id).first()
    try:
        if not app:
            return error_response(404, "App not found")
    
        # Save API keys to DB (for simplicity, we just save the first platform connection)
        if app.platform_connections:
            conn = app.platform_connections[0]
            conn.credentials = json.dumps({
                "api_key": req.api_keys.get("api_key", ""),
                "api_secret": req.api_keys.get("api_secret", ""),
                "access_token": req.api_keys.get("access_token", ""),
                "access_token_secret": req.api_keys.get("access_token_secret", ""),
            })
            if req.auto_publish is not None:
                conn.auto_publish_post = req.auto_publish
            if req.failure_notification is not None:
                conn.failure_notification = req.failure_notification
            # posted = post_to_x(XPostRequest(content="Test post", api_keys=conn.credentials, is_test_api=True))
            # if posted:
            if True:
                print("✅ Test post published and deleted successfully, API keys are valid.")
                stats = get_x_user_stats(conn.credentials)
                if stats:
                    conn.connected = datetime.utcnow().isoformat()
                    conn.post = stats["username"]
                    conn.engagement = stats["avg_engagement"]
                    conn.followers = stats["followers"]
                    conn.platform_username = stats["username"]
                    app.is_active = True
            
            db.commit() 
            return success_response(message="Settings saved successfully")
        else:
            return error_response(400, "No platform connection found for this app")
    except Exception as e:
        db.rollback()
        print(f"❌ Error saving settings: {e}")
        return error_response(500, "An error occurred while saving settings")

@router.post("/app/{app_id}/delete")
def delete_app(app_id: int, user=Depends(verify_clerk_token), db: Session = Depends(get_db)):
    user_obj = db.query(User).filter(User.clerk_id == user).first()
    app = db.query(App).filter(App.id == app_id, App.owner_id == user_obj.id).first()
    if not app:
        return error_response(404, "App not found")

    # Delete related posts
    db.query(Post).filter(Post.app_id == app.id).delete()
    # Delete related platform connections
    db.query(PlatformConnection).filter(PlatformConnection.app_id == app.id).delete()

    db.delete(app)
    db.commit()
    return success_response(message="App deleted successfully")