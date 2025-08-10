"""
Wind Email App.

This module provides a native email application for the Wind operating system.
It includes functionality for managing emails locally without requiring external
OAuth authentication.

Features:
- List, search, and read emails
- Compose and send new emails
- Reply to and forward existing emails
- Organize emails with folders and labels
- Persist emails using SQLAlchemy models
"""

import datetime
import logging
import uuid
from typing import Dict, List, Optional, Any, Union

from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, Session
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


# Email Models
class EmailFolder(Base):
    """Email folder model for organizing emails."""
    
    __tablename__ = "email_folders"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    user_id = Column(String(36), nullable=False)
    parent_id = Column(String(36), ForeignKey("email_folders.id"), nullable=True)
    system = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Relationships
    emails = relationship("EmailMessage", back_populates="folder")
    subfolders = relationship("EmailFolder", 
                             backref="parent", 
                             remote_side=[id])
    
    @classmethod
    async def get_or_create_default_folders(cls, user_id: str, db: Session):
        """Create default email folders for a user if they don't exist."""
        default_folders = ["Inbox", "Sent", "Drafts", "Trash", "Spam"]
        
        for folder_name in default_folders:
            query = select(cls).where(
                cls.user_id == user_id,
                cls.name == folder_name,
                cls.system == True
            )
            result = await db.execute(query)
            folder = result.scalars().first()
            
            if not folder:
                folder = cls(
                    name=folder_name,
                    user_id=user_id,
                    system=True
                )
                db.add(folder)
        
        await db.commit()


class EmailLabel(Base):
    """Email label model for categorizing emails."""
    
    __tablename__ = "email_labels"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    color = Column(String(7), default="#cccccc")  # Hex color code
    user_id = Column(String(36), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Relationships
    emails = relationship("EmailLabelAssociation", back_populates="label")


class EmailLabelAssociation(Base):
    """Association table for many-to-many relationship between emails and labels."""
    
    __tablename__ = "email_label_associations"
    
    email_id = Column(String(36), ForeignKey("email_messages.id"), primary_key=True)
    label_id = Column(String(36), ForeignKey("email_labels.id"), primary_key=True)
    
    # Relationships
    email = relationship("EmailMessage", back_populates="labels")
    label = relationship("EmailLabel", back_populates="emails")


class EmailAttachment(Base):
    """Email attachment model."""
    
    __tablename__ = "email_attachments"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email_id = Column(String(36), ForeignKey("email_messages.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    content_type = Column(String(255), nullable=False)
    size = Column(Integer, nullable=False)
    content = Column(Text, nullable=True)  # Base64 encoded content or file path
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Relationships
    email = relationship("EmailMessage", back_populates="attachments")


class EmailMessage(Base):
    """Email message model for storing email content."""
    
    __tablename__ = "email_messages"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=False)
    folder_id = Column(String(36), ForeignKey("email_folders.id"), nullable=False)
    
    # Email headers
    message_id = Column(String(255), nullable=True, unique=True)
    in_reply_to = Column(String(255), nullable=True)
    references = Column(Text, nullable=True)
    
    # Email metadata
    from_address = Column(String(255), nullable=False)
    to_addresses = Column(Text, nullable=False)  # Comma-separated list
    cc_addresses = Column(Text, nullable=True)   # Comma-separated list
    bcc_addresses = Column(Text, nullable=True)  # Comma-separated list
    subject = Column(String(255), nullable=False)
    
    # Email content
    body_text = Column(Text, nullable=True)
    body_html = Column(Text, nullable=True)
    
    # Email status
    is_read = Column(Boolean, default=False)
    is_draft = Column(Boolean, default=False)
    is_starred = Column(Boolean, default=False)
    
    # Timestamps
    sent_at = Column(DateTime, nullable=True)
    received_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, 
                       onupdate=datetime.datetime.utcnow)
    
    # Relationships
    folder = relationship("EmailFolder", back_populates="emails")
    labels = relationship("EmailLabelAssociation", back_populates="email")
    attachments = relationship("EmailAttachment", back_populates="email")
    
    @property
    def formatted_date(self) -> str:
        """Return a formatted date string for display."""
        date = self.sent_at or self.created_at
        now = datetime.datetime.utcnow()
        
        if date.date() == now.date():
            return date.strftime("%I:%M %p")  # Today: show time only
        elif date.year == now.year:
            return date.strftime("%b %d")     # This year: show month and day
        else:
            return date.strftime("%b %d, %Y") # Different year: show full date
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert email to dictionary for API responses."""
        return {
            "id": self.id,
            "folder": self.folder.name if self.folder else None,
            "from": self.from_address,
            "to": self.to_addresses.split(",") if self.to_addresses else [],
            "cc": self.cc_addresses.split(",") if self.cc_addresses else [],
            "bcc": self.bcc_addresses.split(",") if self.bcc_addresses else [],
            "subject": self.subject,
            "body_text": self.body_text,
            "body_html": self.body_html,
            "is_read": self.is_read,
            "is_draft": self.is_draft,
            "is_starred": self.is_starred,
            "date": self.formatted_date,
            "sent_at": self.sent_at.isoformat() if self.sent_at else None,
            "received_at": self.received_at.isoformat() if self.received_at else None,
            "attachments": [
                {
                    "id": attachment.id,
                    "filename": attachment.filename,
                    "content_type": attachment.content_type,
                    "size": attachment.size
                }
                for attachment in self.attachments
            ],
            "labels": [
                {
                    "id": assoc.label.id,
                    "name": assoc.label.name,
                    "color": assoc.label.color
                }
                for assoc in self.labels
            ]
        }


# Email Service Functions
async def list_emails(
    user_id: str, 
    folder_name: str = "Inbox", 
    page: int = 1, 
    page_size: int = 20,
    unread_only: bool = False
) -> Dict[str, Any]:
    """
    List emails in a specified folder.
    
    Args:
        user_id: The user ID
        folder_name: The folder name (default: "Inbox")
        page: The page number (default: 1)
        page_size: The number of emails per page (default: 20)
        unread_only: Whether to show only unread emails (default: False)
        
    Returns:
        Dictionary with emails and pagination info
    """
    async with get_db() as db:
        # Get folder ID
        folder_query = select(EmailFolder).where(
            EmailFolder.user_id == user_id,
            EmailFolder.name == folder_name
        )
        result = await db.execute(folder_query)
        folder = result.scalars().first()
        
        if not folder:
            # Create default folders if they don't exist
            await EmailFolder.get_or_create_default_folders(user_id, db)
            
            # Try again to get the folder
            result = await db.execute(folder_query)
            folder = result.scalars().first()
            
            if not folder:
                return {
                    "emails": [],
                    "total": 0,
                    "page": page,
                    "page_size": page_size,
                    "total_pages": 0
                }

        # ------------------------------------------------------------------ #
        # Demo data seeding (only when inbox is empty)                       #
        # ------------------------------------------------------------------ #
        if folder_name == "Inbox":
            # Check if the inbox is empty
            seed_check_query = select(EmailMessage).where(
                EmailMessage.user_id == user_id,
                EmailMessage.folder_id == folder.id
            )
            result = await db.execute(seed_check_query)
            inbox_messages = result.scalars().all()

            if len(inbox_messages) == 0:
                logger.info("Seeding demo emails for empty inbox (%s)", user_id)

                now = datetime.datetime.utcnow()
                demo_emails = [
                    EmailMessage(
                        user_id=user_id,
                        folder_id=folder.id,
                        from_address="sarah.johnson@example.com",
                        to_addresses=f"user_{user_id}@wind.local",
                        subject="Welcome to Wind Mail",
                        body_text="Hi there,\n\nWelcome to Wind Mail! "
                                   "Feel free to explore and test the features.\n\nBest,\nSarah",
                        is_read=False,
                        received_at=now - datetime.timedelta(minutes=5),
                        message_id=f"<{uuid.uuid4()}@demo.wind>"
                    ),
                    EmailMessage(
                        user_id=user_id,
                        folder_id=folder.id,
                        from_address="marketing@company.com",
                        to_addresses=f"user_{user_id}@wind.local",
                        subject="Q3 Marketing Plan",
                        body_text="Hello,\n\nAttached is the Q3 marketing plan. "
                                   "Let us know your thoughts.\n\nThanks,\nMarketing Team",
                        is_read=False,
                        received_at=now - datetime.timedelta(hours=2),
                        message_id=f"<{uuid.uuid4()}@demo.wind>"
                    ),
                    EmailMessage(
                        user_id=user_id,
                        folder_id=folder.id,
                        from_address="alex.chen@example.com",
                        to_addresses=f"user_{user_id}@wind.local",
                        subject="Client Presentation Draft",
                        body_text="Hey,\n\nI've prepared the draft for the client presentation. "
                                   "Could you review when you get a chance?\n\nCheers,\nAlex",
                        is_read=False,
                        received_at=now - datetime.timedelta(days=1),
                        message_id=f"<{uuid.uuid4()}@demo.wind>"
                    ),
                ]

                db.add_all(demo_emails)
                await db.commit()
        
        # Build query
        query = select(EmailMessage).where(
            EmailMessage.user_id == user_id,
            EmailMessage.folder_id == folder.id
        )
        
        if unread_only:
            query = query.where(EmailMessage.is_read == False)
        
        # Get total count
        count_result = await db.execute(query)
        total = len(count_result.scalars().all())
        
        # Apply pagination
        query = query.order_by(EmailMessage.sent_at.desc() if folder_name == "Sent" 
                              else EmailMessage.received_at.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)
        
        # Execute query
        result = await db.execute(query)
        emails = result.scalars().all()
        
        # Calculate total pages
        total_pages = (total + page_size - 1) // page_size
        
        return {
            "emails": [email.to_dict() for email in emails],
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages
        }


async def search_emails(
    user_id: str,
    query: str,
    folder_name: Optional[str] = None,
    page: int = 1,
    page_size: int = 20
) -> Dict[str, Any]:
    """
    Search emails by query string.
    
    Args:
        user_id: The user ID
        query: The search query
        folder_name: Optional folder to limit search to
        page: The page number (default: 1)
        page_size: The number of emails per page (default: 20)
        
    Returns:
        Dictionary with matching emails and pagination info
    """
    async with get_db() as db:
        # Build base query
        email_query = select(EmailMessage).where(
            EmailMessage.user_id == user_id
        )
        
        # Add folder filter if specified
        if folder_name:
            folder_result = await db.execute(
                select(EmailFolder).where(
                    EmailFolder.user_id == user_id,
                    EmailFolder.name == folder_name
                )
            )
            folder = folder_result.scalars().first()
            
            if folder:
                email_query = email_query.where(EmailMessage.folder_id == folder.id)
        
        # Add search conditions
        search_terms = f"%{query}%"
        email_query = email_query.where(
            (EmailMessage.subject.ilike(search_terms)) |
            (EmailMessage.body_text.ilike(search_terms)) |
            (EmailMessage.from_address.ilike(search_terms)) |
            (EmailMessage.to_addresses.ilike(search_terms))
        )
        
        # Get total count
        count_result = await db.execute(email_query)
        total = len(count_result.scalars().all())
        
        # Apply pagination
        email_query = email_query.order_by(EmailMessage.received_at.desc())
        email_query = email_query.offset((page - 1) * page_size).limit(page_size)
        
        # Execute query
        result = await db.execute(email_query)
        emails = result.scalars().all()
        
        # Calculate total pages
        total_pages = (total + page_size - 1) // page_size
        
        return {
            "emails": [email.to_dict() for email in emails],
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "query": query
        }


async def get_email(user_id: str, email_id: str, mark_as_read: bool = True) -> Optional[Dict[str, Any]]:
    """
    Get a single email by ID.
    
    Args:
        user_id: The user ID
        email_id: The email ID
        mark_as_read: Whether to mark the email as read (default: True)
        
    Returns:
        Email data dictionary or None if not found
    """
    async with get_db() as db:
        query = select(EmailMessage).where(
            EmailMessage.user_id == user_id,
            EmailMessage.id == email_id
        )
        result = await db.execute(query)
        email = result.scalars().first()
        
        if not email:
            return None
        
        if mark_as_read and not email.is_read:
            email.is_read = True
            db.add(email)
            await db.commit()
        
        return email.to_dict()


async def compose_email(
    user_id: str,
    to_addresses: str,
    subject: str,
    body_text: str,
    body_html: Optional[str] = None,
    cc_addresses: Optional[str] = None,
    bcc_addresses: Optional[str] = None,
    save_as_draft: bool = True
) -> Dict[str, Any]:
    """
    Compose a new email and save as draft.
    
    Args:
        user_id: The user ID
        to_addresses: Comma-separated list of recipient email addresses
        subject: Email subject
        body_text: Plain text email body
        body_html: HTML email body (optional)
        cc_addresses: Comma-separated list of CC recipients (optional)
        bcc_addresses: Comma-separated list of BCC recipients (optional)
        save_as_draft: Whether to save as draft (default: True)
        
    Returns:
        Dictionary with the created email data
    """
    async with get_db() as db:
        # Get Drafts folder
        folder_query = select(EmailFolder).where(
            EmailFolder.user_id == user_id,
            EmailFolder.name == "Drafts" if save_as_draft else "Sent"
        )
        result = await db.execute(folder_query)
        folder = result.scalars().first()
        
        if not folder:
            # Create default folders
            await EmailFolder.get_or_create_default_folders(user_id, db)
            
            # Try again
            result = await db.execute(folder_query)
            folder = result.scalars().first()
        
        # Create new email
        email = EmailMessage(
            user_id=user_id,
            folder_id=folder.id,
            from_address=f"user_{user_id}@wind.local",  # Default local address
            to_addresses=to_addresses,
            cc_addresses=cc_addresses,
            bcc_addresses=bcc_addresses,
            subject=subject,
            body_text=body_text,
            body_html=body_html,
            is_draft=save_as_draft,
            message_id=f"<{uuid.uuid4()}@wind.local>"
        )
        
        if not save_as_draft:
            email.sent_at = datetime.datetime.utcnow()
        
        db.add(email)
        await db.commit()
        await db.refresh(email)
        
        return email.to_dict()


async def send_email(user_id: str, email_id: str) -> Dict[str, Any]:
    """
    Send a draft email.
    
    Args:
        user_id: The user ID
        email_id: The draft email ID
        
    Returns:
        Dictionary with the sent email data
        
    Raises:
        ValueError: If the email is not found or is not a draft
    """
    async with get_db() as db:
        # Get the draft email
        query = select(EmailMessage).where(
            EmailMessage.user_id == user_id,
            EmailMessage.id == email_id,
            EmailMessage.is_draft == True
        )
        result = await db.execute(query)
        email = result.scalars().first()
        
        if not email:
            raise ValueError("Draft email not found")
        
        # Get Sent folder
        folder_query = select(EmailFolder).where(
            EmailFolder.user_id == user_id,
            EmailFolder.name == "Sent"
        )
        folder_result = await db.execute(folder_query)
        sent_folder = folder_result.scalars().first()
        
        if not sent_folder:
            # Create default folders
            await EmailFolder.get_or_create_default_folders(user_id, db)
            
            # Try again
            folder_result = await db.execute(folder_query)
            sent_folder = folder_result.scalars().first()
        
        # Update email
        email.is_draft = False
        email.folder_id = sent_folder.id
        email.sent_at = datetime.datetime.utcnow()
        
        db.add(email)
        await db.commit()
        await db.refresh(email)
        
        # In a real implementation, we would actually send the email here
        # For now, we just simulate it by moving to the Sent folder
        
        logger.info(f"Email sent: {email.subject} to {email.to_addresses}")
        
        return email.to_dict()


async def reply_to_email(
    user_id: str,
    email_id: str,
    body_text: str,
    body_html: Optional[str] = None,
    include_original: bool = True,
    reply_all: bool = False,
    save_as_draft: bool = True
) -> Dict[str, Any]:
    """
    Reply to an existing email.
    
    Args:
        user_id: The user ID
        email_id: The email ID to reply to
        body_text: Reply body text
        body_html: Reply body HTML (optional)
        include_original: Whether to include the original message (default: True)
        reply_all: Whether to reply to all recipients (default: False)
        save_as_draft: Whether to save as draft (default: True)
        
    Returns:
        Dictionary with the reply email data
        
    Raises:
        ValueError: If the original email is not found
    """
    async with get_db() as db:
        # Get the original email
        query = select(EmailMessage).where(
            EmailMessage.user_id == user_id,
            EmailMessage.id == email_id
        )
        result = await db.execute(query)
        original = result.scalars().first()
        
        if not original:
            raise ValueError("Original email not found")
        
        # Get folder
        folder_name = "Drafts" if save_as_draft else "Sent"
        folder_query = select(EmailFolder).where(
            EmailFolder.user_id == user_id,
            EmailFolder.name == folder_name
        )
        folder_result = await db.execute(folder_query)
        folder = folder_result.scalars().first()
        
        if not folder:
            # Create default folders
            await EmailFolder.get_or_create_default_folders(user_id, db)
            
            # Try again
            folder_result = await db.execute(folder_query)
            folder = folder_result.scalars().first()
        
        # Determine recipients
        to_addresses = original.from_address
        cc_addresses = None
        
        if reply_all and original.cc_addresses:
            cc_addresses = original.cc_addresses
        
        # Create reply subject
        subject = original.subject
        if not subject.startswith("Re:"):
            subject = f"Re: {subject}"
        
        # Create reply body with original quoted
        quoted_text = ""
        if include_original:
            sent_date = original.sent_at or original.created_at
            formatted_date = sent_date.strftime("%a, %b %d, %Y at %I:%M %p")
            quoted_text = f"\n\nOn {formatted_date}, {original.from_address} wrote:\n\n"
            
            # Add indentation to original message
            if original.body_text:
                quoted_lines = original.body_text.split("\n")
                quoted_text += "\n".join([f"> {line}" for line in quoted_lines])
        
        full_body_text = body_text + quoted_text
        
        # Create HTML version if needed
        full_body_html = None
        if body_html or (include_original and original.body_html):
            # Simple HTML quoting - in a real app, this would be more sophisticated
            quoted_html = ""
            if include_original and original.body_html:
                sent_date = original.sent_at or original.created_at
                formatted_date = sent_date.strftime("%a, %b %d, %Y at %I:%M %p")
                quoted_html = f"""
                <br><br>
                <div style="border-left: 1px solid #ccc; padding-left: 10px; margin-left: 10px; color: #666;">
                <p>On {formatted_date}, {original.from_address} wrote:</p>
                {original.body_html}
                </div>
                """
            
            full_body_html = (body_html or f"<p>{body_text}</p>") + quoted_html
        
        # Create reply email
        reply = EmailMessage(
            user_id=user_id,
            folder_id=folder.id,
            from_address=f"user_{user_id}@wind.local",  # Default local address
            to_addresses=to_addresses,
            cc_addresses=cc_addresses,
            subject=subject,
            body_text=full_body_text,
            body_html=full_body_html,
            is_draft=save_as_draft,
            message_id=f"<{uuid.uuid4()}@wind.local>",
            in_reply_to=original.message_id,
            references=(original.references + " " + original.message_id).strip() if original.references else original.message_id
        )
        
        if not save_as_draft:
            reply.sent_at = datetime.datetime.utcnow()
        
        db.add(reply)
        await db.commit()
        await db.refresh(reply)
        
        return reply.to_dict()


async def get_email_folders(user_id: str) -> List[Dict[str, Any]]:
    """
    Get all email folders for a user.
    
    Args:
        user_id: The user ID
        
    Returns:
        List of folder data dictionaries
    """
    async with get_db() as db:
        # Ensure default folders exist
        await EmailFolder.get_or_create_default_folders(user_id, db)
        
        # Get all folders
        query = select(EmailFolder).where(
            EmailFolder.user_id == user_id
        ).order_by(EmailFolder.system.desc(), EmailFolder.name)
        
        result = await db.execute(query)
        folders = result.scalars().all()
        
        # Get unread counts
        folder_data = []
        for folder in folders:
            count_query = select(EmailMessage).where(
                EmailMessage.user_id == user_id,
                EmailMessage.folder_id == folder.id,
                EmailMessage.is_read == False
            )
            count_result = await db.execute(count_query)
            unread_count = len(count_result.scalars().all())
            
            folder_data.append({
                "id": folder.id,
                "name": folder.name,
                "system": folder.system,
                "unread_count": unread_count
            })
        
        return folder_data


# App Definition
@register_app
class EmailApp(AppDefinition):
    """Native Email application for Wind OS."""
    
    id = "email"
    name = "Email"
    description = "Native email client for managing your messages"
    icon = "mail"
    version = "1.0.0"
    category = "productivity"
    supports_visual = True
    supports_api = True
    
    @classmethod
    def get_tools(cls) -> List[Dict[str, Any]]:
        """Return the tools provided by this app."""
        return [
            tool_def.to_openai_schema() 
            for tool_def in tools_registry.list_tools("email")
        ]


# Tool Definitions
list_emails_tool = ToolDefinition(
    name="email.list",
    description="List emails in a folder",
    app_id="email",
    category="email",
    parameters=[
        ToolParameter(
            name="folder",
            type="string",
            description="The folder to list emails from (e.g., Inbox, Sent, Drafts)",
            required=True,
            enum=["Inbox", "Sent", "Drafts", "Trash", "Spam"]
        ),
        ToolParameter(
            name="page",
            type="integer",
            description="Page number for pagination",
            required=False,
            default=1
        ),
        ToolParameter(
            name="unread_only",
            type="boolean",
            description="Show only unread emails",
            required=False,
            default=False
        )
    ]
)

search_emails_tool = ToolDefinition(
    name="email.search",
    description="Search emails by query",
    app_id="email",
    category="email",
    parameters=[
        ToolParameter(
            name="query",
            type="string",
            description="Search query to find in emails",
            required=True
        ),
        ToolParameter(
            name="folder",
            type="string",
            description="Optional folder to limit search to",
            required=False,
            enum=["Inbox", "Sent", "Drafts", "Trash", "Spam"]
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

get_email_tool = ToolDefinition(
    name="email.get",
    description="Get a single email by ID",
    app_id="email",
    category="email",
    parameters=[
        ToolParameter(
            name="email_id",
            type="string",
            description="The ID of the email to retrieve",
            required=True
        ),
        ToolParameter(
            name="mark_as_read",
            type="boolean",
            description="Whether to mark the email as read",
            required=False,
            default=True
        )
    ]
)

compose_email_tool = ToolDefinition(
    name="email.compose",
    description="Compose a new email",
    app_id="email",
    category="email",
    parameters=[
        ToolParameter(
            name="to",
            type="string",
            description="Comma-separated list of recipient email addresses",
            required=True
        ),
        ToolParameter(
            name="subject",
            type="string",
            description="Email subject",
            required=True
        ),
        ToolParameter(
            name="body",
            type="string",
            description="Email body text",
            required=True
        ),
        ToolParameter(
            name="cc",
            type="string",
            description="Comma-separated list of CC recipients",
            required=False
        ),
        ToolParameter(
            name="bcc",
            type="string",
            description="Comma-separated list of BCC recipients",
            required=False
        ),
        ToolParameter(
            name="save_as_draft",
            type="boolean",
            description="Whether to save as draft or send immediately",
            required=False,
            default=True
        )
    ]
)

send_email_tool = ToolDefinition(
    name="email.send",
    description="Send a draft email",
    app_id="email",
    category="email",
    parameters=[
        ToolParameter(
            name="email_id",
            type="string",
            description="The ID of the draft email to send",
            required=True
        )
    ]
)

reply_to_email_tool = ToolDefinition(
    name="email.reply",
    description="Reply to an existing email",
    app_id="email",
    category="email",
    parameters=[
        ToolParameter(
            name="email_id",
            type="string",
            description="The ID of the email to reply to",
            required=True
        ),
        ToolParameter(
            name="body",
            type="string",
            description="Reply body text",
            required=True
        ),
        ToolParameter(
            name="include_original",
            type="boolean",
            description="Whether to include the original message",
            required=False,
            default=True
        ),
        ToolParameter(
            name="reply_all",
            type="boolean",
            description="Whether to reply to all recipients",
            required=False,
            default=False
        ),
        ToolParameter(
            name="save_as_draft",
            type="boolean",
            description="Whether to save as draft or send immediately",
            required=False,
            default=True
        )
    ]
)

get_folders_tool = ToolDefinition(
    name="email.folders",
    description="Get all email folders",
    app_id="email",
    category="email",
    parameters=[]
)


# Tool Handlers
@register_tool(list_emails_tool)
async def handle_list_emails(args: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    """Handle the email.list tool."""
    user_id = context.get("user_id", "default_user")
    folder = args.get("folder", "Inbox")
    page = args.get("page", 1)
    unread_only = args.get("unread_only", False)
    
    return await list_emails(
        user_id=user_id,
        folder_name=folder,
        page=page,
        unread_only=unread_only
    )


@register_tool(search_emails_tool)
async def handle_search_emails(args: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    """Handle the email.search tool."""
    user_id = context.get("user_id", "default_user")
    query = args.get("query")
    folder = args.get("folder")
    page = args.get("page", 1)
    
    return await search_emails(
        user_id=user_id,
        query=query,
        folder_name=folder,
        page=page
    )


@register_tool(get_email_tool)
async def handle_get_email(args: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    """Handle the email.get tool."""
    user_id = context.get("user_id", "default_user")
    email_id = args.get("email_id")
    mark_as_read = args.get("mark_as_read", True)
    
    email = await get_email(
        user_id=user_id,
        email_id=email_id,
        mark_as_read=mark_as_read
    )
    
    if not email:
        return {"error": "Email not found"}
    
    return email


@register_tool(compose_email_tool)
async def handle_compose_email(args: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    """Handle the email.compose tool."""
    user_id = context.get("user_id", "default_user")
    to_addresses = args.get("to")
    subject = args.get("subject")
    body_text = args.get("body")
    cc_addresses = args.get("cc")
    bcc_addresses = args.get("bcc")
    save_as_draft = args.get("save_as_draft", True)
    
    return await compose_email(
        user_id=user_id,
        to_addresses=to_addresses,
        subject=subject,
        body_text=body_text,
        cc_addresses=cc_addresses,
        bcc_addresses=bcc_addresses,
        save_as_draft=save_as_draft
    )


@register_tool(send_email_tool)
async def handle_send_email(args: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    """Handle the email.send tool."""
    user_id = context.get("user_id", "default_user")
    email_id = args.get("email_id")
    
    try:
        return await send_email(
            user_id=user_id,
            email_id=email_id
        )
    except ValueError as e:
        return {"error": str(e)}


@register_tool(reply_to_email_tool)
async def handle_reply_to_email(args: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    """Handle the email.reply tool."""
    user_id = context.get("user_id", "default_user")
    email_id = args.get("email_id")
    body = args.get("body")
    include_original = args.get("include_original", True)
    reply_all = args.get("reply_all", False)
    save_as_draft = args.get("save_as_draft", True)
    
    try:
        return await reply_to_email(
            user_id=user_id,
            email_id=email_id,
            body_text=body,
            include_original=include_original,
            reply_all=reply_all,
            save_as_draft=save_as_draft
        )
    except ValueError as e:
        return {"error": str(e)}


@register_tool(get_folders_tool)
async def handle_get_folders(args: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    """Handle the email.folders tool."""
    user_id = context.get("user_id", "default_user")
    
    folders = await get_email_folders(user_id=user_id)
    return {"folders": folders}
