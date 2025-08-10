"""
LLM Provider module for Wind API.

This module provides a unified interface for interacting with different LLM providers
such as OpenAI, Anthropic, and Azure OpenAI. It handles the complexity of different
API formats and tool calling capabilities.
"""

import json
import logging
from typing import Any, Dict, List, Optional, Union

from httpx import AsyncClient
from openai import AsyncOpenAI
from anthropic import AsyncAnthropic
from pydantic import BaseModel, Field

from wind_api.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class ToolParameter(BaseModel):
    """Parameter for a tool function."""
    type: str
    description: str = ""
    enum: Optional[List[str]] = None
    required: bool = False


class ToolFunction(BaseModel):
    """Definition of a tool function that can be called by the LLM."""
    name: str
    description: str
    parameters: Dict[str, Any] = Field(default_factory=dict)


class ToolCall(BaseModel):
    """Representation of a tool call made by the LLM."""
    id: str
    name: str
    arguments: Dict[str, Any]


class LLMProvider:
    """
    Provider for LLM completions that supports multiple backends.
    
    This class provides a unified interface for interacting with different
    LLM providers, handling the differences in API formats and capabilities.
    """
    
    def __init__(self):
        """Initialize the LLM provider based on available API keys."""
        self.openai_client = None
        self.anthropic_client = None
        self.azure_openai_client = None
        
        # Initialize available clients based on API keys
        if settings.openai_api_key:
            self.openai_client = AsyncOpenAI(
                api_key=settings.openai_api_key,
                base_url=settings.openai_api_base if settings.openai_api_base else None,
            )
            logger.info("OpenAI client initialized")
            
        if settings.anthropic_api_key:
            self.anthropic_client = AsyncAnthropic(
                api_key=settings.anthropic_api_key,
            )
            logger.info("Anthropic client initialized")
            
        if settings.azure_openai_api_key:
            self.azure_openai_client = AsyncOpenAI(
                api_key=settings.azure_openai_api_key,
                base_url=settings.azure_openai_api_base,
            )
            logger.info("Azure OpenAI client initialized")
            
        if not any([self.openai_client, self.anthropic_client, self.azure_openai_client]):
            logger.warning("No LLM provider API keys found, using mock responses")
    
    @staticmethod
    def to_dict(tool: ToolFunction) -> Dict[str, Any]:
        """
        Convert a ToolFunction to a dictionary format suitable for OpenAI.
        
        Args:
            tool: The ToolFunction to convert
            
        Returns:
            Dict representation of the tool
        """
        return {
            "type": "function",
            "function": {
                "name": tool.name,
                "description": tool.description,
                "parameters": tool.parameters,
            }
        }
    
    @staticmethod
    def _convert_to_anthropic_tools(tools: List[ToolFunction]) -> List[Dict[str, Any]]:
        """
        Convert tools to Anthropic's format.
        
        Args:
            tools: List of ToolFunction objects
            
        Returns:
            List of tools in Anthropic's format
        """
        return [
            {
                "name": tool.name,
                "description": tool.description,
                "input_schema": {
                    "type": "object",
                    "properties": tool.parameters.get("properties", {}),
                    "required": tool.parameters.get("required", []),
                }
            }
            for tool in tools
        ]
    
    async def acomplete(
        self, 
        messages: List[Dict[str, str]], 
        tools: Optional[List[ToolFunction]] = None,
        system: Optional[str] = None,
        model: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Generate a completion using the available LLM provider.
        
        Args:
            messages: List of message dictionaries with 'role' and 'content'
            tools: Optional list of tools the model can use
            system: Optional system message to override the default
            model: Optional model name to override the default
            
        Returns:
            Dictionary with 'role', 'content', and optional 'tool_calls'
        """
        # Use OpenAI if available
        if self.openai_client:
            return await self._complete_with_openai(messages, tools, system, model)
            
        # Use Anthropic if available
        if self.anthropic_client:
            return await self._complete_with_anthropic(messages, tools, system, model)
            
        # Use Azure OpenAI if available
        if self.azure_openai_client:
            return await self._complete_with_azure_openai(messages, tools, system, model)
            
        # No provider available, return mock response
        return self._mock_response(messages, tools)
    
    async def _complete_with_openai(
        self,
        messages: List[Dict[str, str]],
        tools: Optional[List[ToolFunction]] = None,
        system: Optional[str] = None,
        model: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Generate a completion using OpenAI.
        
        Args:
            messages: List of message dictionaries
            tools: Optional list of tools
            system: Optional system message
            model: Optional model name
            
        Returns:
            Response dictionary
        """
        # Prepare messages, adding system message if provided
        openai_messages = messages.copy()
        if system:
            # Insert system message at the beginning
            openai_messages.insert(0, {"role": "system", "content": system})
        
        # Prepare request parameters
        params = {
            "model": model or settings.openai_model,
            "messages": openai_messages,
        }
        
        # Add tools if provided
        if tools:
            params["tools"] = [self.to_dict(tool) for tool in tools]
        
        try:
            response = await self.openai_client.chat.completions.create(**params)
            
            # Extract the response message
            message = response.choices[0].message
            result = {
                "role": "assistant",
                "content": message.content or "",
            }
            
            # Add tool calls if present
            if hasattr(message, "tool_calls") and message.tool_calls:
                tool_calls = []
                for tool_call in message.tool_calls:
                    try:
                        arguments = json.loads(tool_call.function.arguments)
                    except json.JSONDecodeError:
                        arguments = {"error": "Failed to parse arguments"}
                    
                    tool_calls.append({
                        "id": tool_call.id,
                        "name": tool_call.function.name,
                        "arguments": arguments,
                    })
                result["tool_calls"] = tool_calls
            
            return result
        except Exception as e:
            logger.error(f"Error calling OpenAI: {str(e)}")
            return {"role": "assistant", "content": f"Error: {str(e)}"}
    
    async def _complete_with_anthropic(
        self,
        messages: List[Dict[str, str]],
        tools: Optional[List[ToolFunction]] = None,
        system: Optional[str] = None,
        model: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Generate a completion using Anthropic.
        
        Args:
            messages: List of message dictionaries
            tools: Optional list of tools
            system: Optional system message
            model: Optional model name
            
        Returns:
            Response dictionary
        """
        # Convert messages to Anthropic format
        anthropic_messages = []
        for msg in messages:
            if msg["role"] == "user":
                anthropic_messages.append({"role": "user", "content": msg["content"]})
            elif msg["role"] == "assistant":
                anthropic_messages.append({"role": "assistant", "content": msg["content"]})
            # Skip system messages as they're handled separately
        
        # Prepare request parameters
        params = {
            "model": model or settings.anthropic_model,
            "messages": anthropic_messages,
        }
        
        # Add system message if provided
        if system:
            params["system"] = system
        
        # Add tools if provided
        if tools:
            params["tools"] = self._convert_to_anthropic_tools(tools)
        
        try:
            response = await self.anthropic_client.messages.create(**params)
            
            result = {
                "role": "assistant",
                "content": response.content[0].text,
            }
            
            # Add tool calls if present
            if hasattr(response, "tool_use") and response.tool_use:
                tool_calls = [{
                    "id": f"call_{i}",  # Anthropic doesn't provide IDs, so we generate them
                    "name": tool_use.name,
                    "arguments": tool_use.input,
                } for i, tool_use in enumerate(response.tool_use)]
                
                if tool_calls:
                    result["tool_calls"] = tool_calls
            
            return result
        except Exception as e:
            logger.error(f"Error calling Anthropic: {str(e)}")
            return {"role": "assistant", "content": f"Error: {str(e)}"}
    
    async def _complete_with_azure_openai(
        self,
        messages: List[Dict[str, str]],
        tools: Optional[List[ToolFunction]] = None,
        system: Optional[str] = None,
        model: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Generate a completion using Azure OpenAI.
        
        Args:
            messages: List of message dictionaries
            tools: Optional list of tools
            system: Optional system message
            model: Optional model name
            
        Returns:
            Response dictionary
        """
        # Prepare messages, adding system message if provided
        azure_messages = messages.copy()
        if system:
            # Insert system message at the beginning
            azure_messages.insert(0, {"role": "system", "content": system})
        
        # Prepare request parameters
        params = {
            "model": model or settings.azure_openai_deployment,
            "messages": azure_messages,
        }
        
        # Add tools if provided
        if tools:
            params["tools"] = [self.to_dict(tool) for tool in tools]
        
        try:
            response = await self.azure_openai_client.chat.completions.create(**params)
            
            # Extract the response message
            message = response.choices[0].message
            result = {
                "role": "assistant",
                "content": message.content or "",
            }
            
            # Add tool calls if present
            if hasattr(message, "tool_calls") and message.tool_calls:
                tool_calls = []
                for tool_call in message.tool_calls:
                    try:
                        arguments = json.loads(tool_call.function.arguments)
                    except json.JSONDecodeError:
                        arguments = {"error": "Failed to parse arguments"}
                    
                    tool_calls.append({
                        "id": tool_call.id,
                        "name": tool_call.function.name,
                        "arguments": arguments,
                    })
                result["tool_calls"] = tool_calls
            
            return result
        except Exception as e:
            logger.error(f"Error calling Azure OpenAI: {str(e)}")
            return {"role": "assistant", "content": f"Error: {str(e)}"}
    
    def _mock_response(
        self,
        messages: List[Dict[str, str]],
        tools: Optional[List[ToolFunction]] = None,
    ) -> Dict[str, Any]:
        """
        Generate a mock response when no LLM provider is available.
        
        Args:
            messages: List of message dictionaries
            tools: Optional list of tools that were available to the model
            
        Returns:
            Mock response dictionary
        """
        # Find the last user message
        last_user_message = "No user message found"
        for msg in reversed(messages):
            if msg["role"] == "user":
                last_user_message = msg["content"]
                break
        
        mock_response = {
            "role": "assistant",
            "content": f"[MOCK RESPONSE] I received your message: '{last_user_message}'. "
                       f"Please configure an LLM provider API key to get real responses."
        }

        # If tools were supplied, pretend the assistant wants to call the first tool
        if tools:
            first_tool = tools[0]
            mock_response["tool_calls"] = [
                {
                    "id": "mock_tool_call_1",
                    "name": first_tool.name,
                    "arguments": {},
                }
            ]
        return mock_response
