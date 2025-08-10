"""
Wind Tools Registry.

This module provides a unified registry for tool definitions that can be used
by the Wind agent. It aggregates tools from both system-level capabilities and
app-specific functions, and dispatches tool calls to the appropriate handlers.

Tools in Wind can be:
1. System tools (browser automation, file operations, etc.)
2. App-specific tools (app API operations, specialized functions)
3. Composite tools (combining multiple tools in sequence)

Each tool must define:
- Name and description
- JSON schema for parameters
- Handler function or coroutine
"""

import asyncio
import inspect
import json
import logging
from typing import Any, Callable, Coroutine, Dict, List, Optional, Set, Union

from pydantic import BaseModel, Field, ValidationError

logger = logging.getLogger(__name__)


class ToolParameter(BaseModel):
    """Definition of a parameter for a tool."""
    
    name: str
    type: str
    description: str
    required: bool = True
    enum: Optional[List[str]] = None
    default: Optional[Any] = None


class ToolDefinition(BaseModel):
    """Definition of a tool that can be used by the Wind agent."""
    
    name: str
    description: str
    parameters: List[ToolParameter]
    app_id: Optional[str] = None
    category: str = "system"
    is_dangerous: bool = False
    requires_auth: bool = False
    
    def to_openai_schema(self) -> Dict[str, Any]:
        """Convert to OpenAI tool schema format."""
        properties = {}
        required = []
        
        for param in self.parameters:
            param_schema = {
                "type": param.type,
                "description": param.description
            }
            
            if param.enum:
                param_schema["enum"] = param.enum
                
            properties[param.name] = param_schema
            
            if param.required:
                required.append(param.name)
        
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": {
                    "type": "object",
                    "properties": properties,
                    "required": required
                }
            }
        }
    
    def to_anthropic_schema(self) -> Dict[str, Any]:
        """Convert to Anthropic tool schema format."""
        parameters = {}
        required = []
        
        for param in self.parameters:
            param_schema = {
                "type": param.type,
                "description": param.description
            }
            
            if param.enum:
                param_schema["enum"] = param.enum
                
            parameters[param.name] = param_schema
            
            if param.required:
                required.append(param.name)
        
        return {
            "name": self.name,
            "description": self.description,
            "input_schema": {
                "type": "object",
                "properties": parameters,
                "required": required
            }
        }


class ToolsRegistry:
    """Registry for Wind tools and their handlers."""
    
    def __init__(self):
        """Initialize an empty tools registry."""
        self._tools: Dict[str, ToolDefinition] = {}
        self._handlers: Dict[str, Callable] = {}
        self._categories: Set[str] = set(["system"])
    
    def add_tool(self, tool_def: ToolDefinition) -> None:
        """
        Register a tool definition without a handler.
        
        Args:
            tool_def: The tool definition to register
        """
        self._tools[tool_def.name] = tool_def
        self._categories.add(tool_def.category)
        logger.info(f"Registered tool definition: {tool_def.name}")
    
    def add_handler(self, tool_name: str, handler: Union[Callable, Coroutine]) -> None:
        """
        Register a handler for a tool.
        
        Args:
            tool_name: The name of the tool
            handler: The function or coroutine to handle tool calls
        
        Raises:
            ValueError: If the tool is not registered
        """
        if tool_name not in self._tools:
            raise ValueError(f"Tool '{tool_name}' is not registered")
        
        self._handlers[tool_name] = handler
        logger.info(f"Registered handler for tool: {tool_name}")
    
    def register_tool(self, 
                     tool_def: ToolDefinition, 
                     handler: Union[Callable, Coroutine]) -> None:
        """
        Register a tool definition and its handler.
        
        Args:
            tool_def: The tool definition to register
            handler: The function or coroutine to handle tool calls
        """
        self.add_tool(tool_def)
        self.add_handler(tool_def.name, handler)
    
    def list_tools(self, category: Optional[str] = None) -> List[ToolDefinition]:
        """
        List all registered tools, optionally filtered by category.
        
        Args:
            category: Optional category to filter by
        
        Returns:
            List of tool definitions
        """
        if category:
            return [tool for tool in self._tools.values() if tool.category == category]
        return list(self._tools.values())
    
    def get_tool(self, tool_name: str) -> Optional[ToolDefinition]:
        """
        Get a tool definition by name.
        
        Args:
            tool_name: The name of the tool
        
        Returns:
            The tool definition if found, None otherwise
        """
        return self._tools.get(tool_name)
    
    def get_openai_schemas(self, category: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get tool definitions in OpenAI schema format.
        
        Args:
            category: Optional category to filter by
        
        Returns:
            List of tool definitions in OpenAI schema format
        """
        tools = self.list_tools(category)
        return [tool.to_openai_schema() for tool in tools]
    
    def get_anthropic_schemas(self, category: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get tool definitions in Anthropic schema format.
        
        Args:
            category: Optional category to filter by
        
        Returns:
            List of tool definitions in Anthropic schema format
        """
        tools = self.list_tools(category)
        return [tool.to_anthropic_schema() for tool in tools]
    
    def can_handle(self, tool_name: str) -> bool:
        """
        Check if a tool can be handled.
        
        Args:
            tool_name: The name of the tool
        
        Returns:
            True if the tool is registered and has a handler, False otherwise
        """
        return tool_name in self._tools and tool_name in self._handlers
    
    async def handle(self, 
                    tool_name: str, 
                    args: Dict[str, Any], 
                    context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Handle a tool call.
        
        Args:
            tool_name: The name of the tool to call
            args: The arguments to pass to the tool
            context: Optional context information for the tool
        
        Returns:
            The result of the tool call
        
        Raises:
            ValueError: If the tool is not registered or has no handler
            ValidationError: If the arguments are invalid
        """
        if not self.can_handle(tool_name):
            raise ValueError(f"Tool '{tool_name}' cannot be handled")
        
        tool = self._tools[tool_name]
        handler = self._handlers[tool_name]
        
        # Create context if not provided
        if context is None:
            context = {}
        
        # Log the tool call
        logger.info(f"Calling tool: {tool_name} with args: {json.dumps(args)}")
        
        try:
            # Check if handler is a coroutine function
            if inspect.iscoroutinefunction(handler):
                result = await handler(args, context)
            else:
                # Run synchronous handlers in the executor pool
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(
                    None, lambda: handler(args, context)
                )
            
            logger.info(f"Tool {tool_name} call succeeded")
            return {
                "status": "success",
                "data": result
            }
        except Exception as e:
            logger.error(f"Tool {tool_name} call failed: {str(e)}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    def get_categories(self) -> List[str]:
        """
        Get all tool categories.
        
        Returns:
            List of category names
        """
        return list(self._categories)


# Create a global registry instance
registry = ToolsRegistry()


def register_tool(tool_def: ToolDefinition) -> Callable:
    """
    Decorator for registering a tool handler with the global registry.
    
    Args:
        tool_def: The tool definition to register
        
    Returns:
        Decorator function that registers the handler
    
    Example:
        ```python
        tool_def = ToolDefinition(
            name="web.navigate",
            description="Navigate to a URL",
            parameters=[
                ToolParameter(
                    name="url",
                    type="string",
                    description="The URL to navigate to"
                )
            ]
        )
        
        @register_tool(tool_def)
        async def handle_web_navigate(args, context):
            # Implementation
            return {"result": "success"}
        ```
    """
    def decorator(handler: Callable) -> Callable:
        registry.register_tool(tool_def, handler)
        return handler
    return decorator


# Export public API
__all__ = [
    "ToolDefinition", 
    "ToolParameter", 
    "ToolsRegistry", 
    "register_tool", 
    "registry"
]
