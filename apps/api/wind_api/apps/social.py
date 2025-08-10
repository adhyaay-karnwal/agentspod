"""
Wind Social App.

This module provides a native social media application for the Wind operating system.
It includes functionality for creating, scheduling, and managing social media posts
without requiring external OAuth authentication.

Features:
- Create and publish posts immediately
- Schedule posts for future publication
- List and manage existing posts
"""

import datetime
import logging
import uuid
from typing import Dict, List, Optional, Any, Union

from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session
from sqlalchemy.future import select

from wind_api.db import get_db, Base
from wind_api.apps import AppDefinition, register_app
from wind_api.apps.tools_registry import (
    ToolDefinition, 
    ToolParameter, 
    register_tool, 
    registry as tools_registry
)

logger = logging.getLogger(__name__)


# Social Models
class SocialPost(Base):
    """Social post model for storing post content and metadata."""
    
    __tablename__ = "social_posts"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=False)
    platform = Column(String(50), nullable=False)  # e.g., "twitter", "linkedin", "facebook"
    content = Column(Text, nullable=False)
    status = Column(String(20), nullable=False)  # "draft", "scheduled", "published", "failed"
    scheduled_at = Column(DateTime, nullable=True)
    published_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert post to dictionary for API responses."""
        return {
            "id": self.id,
            "platform": self.platform,
            "content": self.content,
            "status": self.status,
            "scheduled_at": self.scheduled_at.isoformat() if self.scheduled_at else None,
            "published_at": self.published_at.isoformat() if self.published_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


# Social Service Functions
async def create_post(
    user_id: str,
    platform: str,
    content: str,
    publish_now: bool = True,
    scheduled_at: Optional[datetime.datetime] = None
) -> Dict[str, Any]:
    """
    Create a new social media post.
    
    Args:
        user_id: The user ID
        platform: The social platform (e.g., "twitter", "linkedin")
        content: The post content
        publish_now: Whether to publish immediately (default: True)
        scheduled_at: When to publish if not immediately (default: None)
        
    Returns:
        Dictionary with the created post data
    """
    async with get_db() as db:
        now = datetime.datetime.utcnow()
        
        # Determine post status and timing
        if publish_now:
            status = "published"
            published_at = now
            scheduled_at = None
        else:
            status = "scheduled"
            published_at = None
            # If no schedule time provided, default to 1 hour from now
            if scheduled_at is None:
                scheduled_at = now + datetime.timedelta(hours=1)
        
        # Create new post
        post = SocialPost(
            user_id=user_id,
            platform=platform,
            content=content,
            status=status,
            scheduled_at=scheduled_at,
            published_at=published_at
        )
        
        db.add(post)
        await db.commit()
        await db.refresh(post)
        
        # In a real implementation, we would actually post to the social platform
        # if publish_now is True. For now, we just simulate it.
        if publish_now:
            logger.info(f"Post published to {platform}: {content[:30]}...")
        else:
            logger.info(f"Post scheduled for {platform} at {scheduled_at}: {content[:30]}...")
        
        return post.to_dict()


async def list_posts(
    user_id: str,
    platform: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    page_size: int = 20
) -> Dict[str, Any]:
    """
    List social media posts.
    
    Args:
        user_id: The user ID
        platform: Optional platform filter
        status: Optional status filter
        page: The page number (default: 1)
        page_size: The number of posts per page (default: 20)
        
    Returns:
        Dictionary with posts and pagination info
    """
    async with get_db() as db:
        # Build query
        query = select(SocialPost).where(
            SocialPost.user_id == user_id
        )
        
        # Apply filters
        if platform:
            query = query.where(SocialPost.platform == platform)
        
        if status:
            query = query.where(SocialPost.status == status)
        
        # Get total count
        count_result = await db.execute(query)
        total = len(count_result.scalars().all())
        
        # Apply pagination and ordering
        query = query.order_by(SocialPost.created_at.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)
        
        # Execute query
        result = await db.execute(query)
        posts = result.scalars().all()
        
        # Calculate total pages
        total_pages = (total + page_size - 1) // page_size
        
        # If no posts exist for this user, create a sample post
        if total == 0:
            logger.info(f"Creating sample post for user {user_id}")
            sample_post = SocialPost(
                user_id=user_id,
                platform="twitter",
                content="This is a sample post to demonstrate the Wind Social app.",
                status="published",
                published_at=datetime.datetime.utcnow()
            )
            db.add(sample_post)
            await db.commit()
            await db.refresh(sample_post)
            posts = [sample_post]
            total = 1
            total_pages = 1
        
        return {
            "posts": [post.to_dict() for post in posts],
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages
        }


# App Definition
@register_app
class SocialApp(AppDefinition):
    """Native Social Media application for Wind OS."""
    
    id = "social"
    name = "Social"
    description = "Manage and schedule social media posts"
    icon = "share"
    version = "1.0.0"
    category = "productivity"
    supports_visual = True
    supports_api = True
    
    @classmethod
    def get_tools(cls) -> List[Dict[str, Any]]:
        """Return the tools provided by this app."""
        return [
            tool_def.to_openai_schema() 
            for tool_def in tools_registry.list_tools("social")
        ]


# Tool Definitions
post_tool = ToolDefinition(
    name="social.post",
    description="Create and publish a social media post immediately",
    app_id="social",
    category="social",
    parameters=[
        ToolParameter(
            name="platform",
            type="string",
            description="The social platform to post to",
            required=True,
            enum=["twitter", "linkedin", "facebook", "instagram"]
        ),
        ToolParameter(
            name="content",
            type="string",
            description="The content of the post",
            required=True
        )
    ]
)

schedule_tool = ToolDefinition(
    name="social.schedule",
    description="Schedule a social media post for future publication",
    app_id="social",
    category="social",
    parameters=[
        ToolParameter(
            name="platform",
            type="string",
            description="The social platform to post to",
            required=True,
            enum=["twitter", "linkedin", "facebook", "instagram"]
        ),
        ToolParameter(
            name="content",
            type="string",
            description="The content of the post",
            required=True
        ),
        ToolParameter(
            name="scheduled_at",
            type="string",
            description="ISO format datetime for when to publish the post",
            required=True
        )
    ]
)

list_tool = ToolDefinition(
    name="social.list",
    description="List social media posts",
    app_id="social",
    category="social",
    parameters=[
        ToolParameter(
            name="platform",
            type="string",
            description="Filter by platform",
            required=False,
            enum=["twitter", "linkedin", "facebook", "instagram"]
        ),
        ToolParameter(
            name="status",
            type="string",
            description="Filter by status",
            required=False,
            enum=["draft", "scheduled", "published", "failed"]
        ),
        ToolParameter(
            name="page",
            type="integer",
            description="Page number for pagination",
            required=False,
            default=1
        )
    ]
)


# Tool Handlers
@register_tool(post_tool)
async def handle_post(args: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    """Handle the social.post tool."""
    user_id = context.get("user_id", "default_user")
    platform = args.get("platform")
    content = args.get("content")
    
    return await create_post(
        user_id=user_id,
        platform=platform,
        content=content,
        publish_now=True
    )


@register_tool(schedule_tool)
async def handle_schedule(args: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    """Handle the social.schedule tool."""
    user_id = context.get("user_id", "default_user")
    platform = args.get("platform")
    content = args.get("content")
    scheduled_at_str = args.get("scheduled_at")
    
    try:
        scheduled_at = datetime.datetime.fromisoformat(scheduled_at_str)
    except (ValueError, TypeError):
        return {
            "error": "Invalid datetime format. Please use ISO format (YYYY-MM-DDTHH:MM:SS)."
        }
    
    return await create_post(
        user_id=user_id,
        platform=platform,
        content=content,
        publish_now=False,
        scheduled_at=scheduled_at
    )


@register_tool(list_tool)
async def handle_list(args: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    """Handle the social.list tool."""
    user_id = context.get("user_id", "default_user")
    platform = args.get("platform")
    status = args.get("status")
    page = args.get("page", 1)
    
    return await list_posts(
        user_id=user_id,
        platform=platform,
        status=status,
        page=page
    )
