"""
Wind API Main Module.

This module defines the FastAPI application, routes, and startup events for the Wind API.
"""

import asyncio
import json
import logging
from contextlib import asynccontextmanager
from typing import Any, Dict, List, Optional, Union

from fastapi import Depends, FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine

from wind_api.agent.provider import LLMProvider, ToolCall
from wind_api.agent.prompt import WIND_SYSTEM_PROMPT
from wind_api.agent.tools import TOOL_DEFINITIONS, Tools
from wind_api.config import get_settings
from wind_api.db import Base, engine
from wind_api.models import User, Workspace, Task, Event
# New: Apps registry & Email app imports
from wind_api.apps.tools_registry import registry as app_tools_registry
from wind_api.apps.email import (
    list_emails,
    search_emails,
    get_email,
    compose_email,
    send_email,
    reply_to_email,
    get_email_folders,
)
# Ensure Social app (and its tools) are registered on startup
# Import is enough; registration happens via module side-effects
import wind_api.apps.social  # noqa: F401

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Get settings
settings = get_settings()


# Pydantic models for request/response
class Message(BaseModel):
    """Message in a conversation."""
    role: str
    content: str
    tool_calls: Optional[List[Dict[str, Any]]] = None
    tool_call_id: Optional[str] = None


class ChatRequest(BaseModel):
    """Request model for chat endpoint."""
    messages: List[Message]
    workspace_id: Optional[str] = None
    user_id: Optional[str] = None
    streaming: bool = False


class ToolCallResult(BaseModel):
    """Result of a tool call."""
    tool_call_id: str
    name: str
    arguments: Dict[str, Any]
    result: Dict[str, Any]


class ChatResponse(BaseModel):
    """Response model for chat endpoint."""
    message: Message
    steps: List[Dict[str, Any]] = Field(default_factory=list)


# WebSocket connections store
active_connections: List[WebSocket] = []


# Lifespan context manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for the FastAPI application.
    
    Handles startup and shutdown events.
    """
    # Startup: Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created")
    
    yield
    
    # Shutdown: Close any resources
    logger.info("Shutting down")


# Create FastAPI app
app = FastAPI(
    title="Wind API",
    description="API for the Wind cloud employee platform",
    version="0.1.0",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """
    Health check endpoint.
    
    Returns:
        Dict with status "ok"
    """
    return {"status": "ok"}


@app.post("/api/agent/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat with the Wind agent.
    
    Args:
        request: ChatRequest with messages and optional workspace_id and user_id
        
    Returns:
        ChatResponse with the agent's response message and steps log
    """
    # Convert Pydantic Message objects to dictionaries for the LLM provider
    messages = [msg.dict(exclude_none=True) for msg in request.messages]
    
    # Initialize LLM provider
    provider = LLMProvider()
    
    # Initialize steps log
    steps = []
    
    # Add initial step
    steps.append({
        "type": "input",
        "messages": messages,
    })
    
    # Combine system-level tools with app-provided tools (OpenAI schema format)
    combined_tool_schemas = TOOL_DEFINITIONS + app_tools_registry.get_openai_schemas()

    # Call LLM with system prompt and messages
    response = await provider.acomplete(
        messages=messages,
        tools=combined_tool_schemas,
        system=WIND_SYSTEM_PROMPT,
    )
    
    # Add LLM response step
    steps.append({
        "type": "llm_response",
        "message": response,
    })
    
    # Check if the response contains tool calls
    if "tool_calls" in response and response["tool_calls"]:
        # Process tool calls
        tool_results = []
        
        # Use Tools context manager to handle browser automation
        async with Tools() as tools:
            for tool_call in response["tool_calls"]:
                try:
                    # Extract tool call details
                    tool_name = tool_call["name"]
                    tool_args = tool_call["arguments"]
                    
                    # Decide whether to dispatch to app tool registry or system tools
                    if app_tools_registry.can_handle(tool_name):
                        logger.info(f"[APP TOOL] {tool_name} args={tool_args}")
                        result_wrapper = await app_tools_registry.handle(
                            tool_name,
                            tool_args,
                            context={
                                "user_id": request.user_id or "default_user",
                            },
                        )
                        result = result_wrapper
                    else:
                        logger.info(f"[SYSTEM TOOL] {tool_name} args={tool_args}")
                        result = await tools.call(tool_name, **tool_args)
                    
                    # Add tool result
                    tool_results.append({
                        "tool_call_id": tool_call["id"],
                        "name": tool_name,
                        "arguments": tool_args,
                        "result": result,
                    })
                    
                    # Add tool call step
                    steps.append({
                        "type": "tool_call",
                        "tool_call": tool_call,
                        "result": result,
                    })
                except Exception as e:
                    # Handle tool call errors
                    error_result = {
                        "success": False,
                        "error": str(e),
                    }
                    
                    tool_results.append({
                        "tool_call_id": tool_call["id"],
                        "name": tool_name,
                        "arguments": tool_args,
                        "result": error_result,
                    })
                    
                    # Add error step
                    steps.append({
                        "type": "tool_error",
                        "tool_call": tool_call,
                        "error": str(e),
                    })
        
        # Add tool results as messages
        for result in tool_results:
            tool_result_message = {
                "role": "tool",
                "tool_call_id": result["tool_call_id"],
                "content": json.dumps(result["result"]),
            }
            messages.append(tool_result_message)
        
        # Call LLM again with updated messages
        final_response = await provider.acomplete(
            messages=messages,
            system=WIND_SYSTEM_PROMPT,
        )
        
        # Add final LLM response step
        steps.append({
            "type": "final_response",
            "message": final_response,
        })
        
        # Return the final response
        return ChatResponse(
            message=Message(**final_response),
            steps=steps,
        )
    
    # If no tool calls, return the original response
    return ChatResponse(
        message=Message(**response),
        steps=steps,
    )


@app.websocket("/api/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time communication.
    
    Args:
        websocket: WebSocket connection
    """
    await websocket.accept()
    active_connections.append(websocket)
    
    try:
        while True:
            data = await websocket.receive_text()
            
            # Simple echo for now
            if data == "ping":
                await websocket.send_text("pong")
            else:
                # Echo back the message (for now)
                await websocket.send_text(f"Message received: {data}")
    except WebSocketDisconnect:
        active_connections.remove(websocket)


# For future implementation: broadcast to all connected clients
async def broadcast(message: str):
    """
    Broadcast a message to all connected WebSocket clients.
    
    Args:
        message: Message to broadcast
    """
    for connection in active_connections:
        await connection.send_text(message)


# --------------------------------------------------------------------------- #
#                              Email App Endpoints                            #
# --------------------------------------------------------------------------- #


# Request bodies ------------------------------------------------------------- #

class ComposeRequest(BaseModel):
    """Body for composing a new email."""
    to: str
    subject: str
    body: str
    cc: Optional[str] = None
    bcc: Optional[str] = None
    save_as_draft: bool = True


class SendRequest(BaseModel):
    """Body for sending a draft email."""
    email_id: str


class ReplyRequest(BaseModel):
    """Body for replying to an email."""
    email_id: str
    body: str
    include_original: bool = True
    reply_all: bool = False
    save_as_draft: bool = True


# Helper to extract user_id -------------------------------------------------- #

def _get_user_id(user_id_param: Optional[str]) -> str:
    """Return provided user_id or default."""
    return user_id_param or "default_user"


# Routes --------------------------------------------------------------------- #


@app.get("/api/email/folders")
async def api_email_get_folders(user_id: Optional[str] = None):
    """
    Get all folders for the current user.
    """
    folders = await get_email_folders(user_id=_get_user_id(user_id))
    return {"folders": folders}


@app.get("/api/email/messages")
async def api_email_list_messages(
    folder: str = "Inbox",
    page: int = 1,
    page_size: int = 20,
    unread_only: bool = False,
    user_id: Optional[str] = None,
):
    """
    List messages in a folder.
    """
    data = await list_emails(
        user_id=_get_user_id(user_id),
        folder_name=folder,
        page=page,
        page_size=page_size,
        unread_only=unread_only,
    )
    return data


@app.get("/api/email/{email_id}")
async def api_email_get_message(
    email_id: str,
    mark_as_read: bool = True,
    user_id: Optional[str] = None,
):
    """
    Get a single email by ID.
    """
    email = await get_email(
        user_id=_get_user_id(user_id),
        email_id=email_id,
        mark_as_read=mark_as_read,
    )
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    return email


@app.post("/api/email/compose")
async def api_email_compose(
    body: ComposeRequest,
    user_id: Optional[str] = None,
):
    """
    Compose a new email (draft or immediate send if save_as_draft=False).
    """
    email = await compose_email(
        user_id=_get_user_id(user_id),
        to_addresses=body.to,
        subject=body.subject,
        body_text=body.body,
        cc_addresses=body.cc,
        bcc_addresses=body.bcc,
        save_as_draft=body.save_as_draft,
    )
    return email


@app.post("/api/email/send")
async def api_email_send(
    body: SendRequest,
    user_id: Optional[str] = None,
):
    """
    Send an existing draft email.
    """
    try:
        email = await send_email(
            user_id=_get_user_id(user_id),
            email_id=body.email_id,
        )
        return email
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/api/email/reply")
async def api_email_reply(
    body: ReplyRequest,
    user_id: Optional[str] = None,
):
    """
    Reply to an email.
    """
    try:
        reply = await reply_to_email(
            user_id=_get_user_id(user_id),
            email_id=body.email_id,
            body_text=body.body,
            include_original=body.include_original,
            reply_all=body.reply_all,
            save_as_draft=body.save_as_draft,
        )
        return reply
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
