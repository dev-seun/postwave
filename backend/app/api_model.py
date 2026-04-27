
from typing import Optional

from pydantic import BaseModel

class AppPayload(BaseModel):
    name: str
    platforms: str
    
class GeneratePostRequest(BaseModel):
    context: Optional[str] = None 
    platform: str
    use_llm: bool = True

class EditPostRequest(BaseModel):
    new_content: str

class SchedulePostRequest(BaseModel):
    scheduled_time: str

class SaveSettingsRequest(BaseModel):
    api_keys: dict[str, str]  # platform -> api_key
    auto_publish: Optional[bool] = None
    failure_notification: Optional[bool] = None

