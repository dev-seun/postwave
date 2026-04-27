from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse # Import this for JSON support
from typing import Any, Optional

def success_response(message: Optional[str] = None, data: Any = None, status_code: int = 200):
    # JSONResponse automatically handles the dict-to-JSON conversion
    content = {
        "success": True,
        "message": message,
        "data": data
    }
    # Clean up empty data if you prefer
    if data is None:
        content.pop("data")
        
    return JSONResponse(status_code=status_code, content=content)

def error_response(status_code: int, message: str):
    return JSONResponse(
        status_code=status_code, 
        content={"success": False,  "message": message}
    )