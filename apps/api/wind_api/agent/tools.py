"""
Wind Agent Tools Module.

This module provides a set of tools that the Wind agent can use to interact with
web browsers and other applications. It includes functionality for navigating to URLs,
clicking on elements, typing text, taking screenshots, and more.
"""

import json
import logging
import os
from typing import Any, Dict, List, Optional, Union

import httpx
from playwright.async_api import async_playwright, Browser, BrowserContext, Page
from pydantic import BaseModel

from wind_api.agent.provider import ToolFunction
from wind_api.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class Tools:
    """
    Tools for Wind agent to interact with web browsers and applications.
    
    This class provides a set of methods that allow the Wind agent to control
    web browsers using Playwright, perform web searches, extract data from webpages,
    and more.
    """
    
    def __init__(self):
        """Initialize the Tools instance."""
        self._playwright = None
        self._browser = None
        self._context = None
        self._page = None
    
    async def __aenter__(self) -> "Tools":
        """
        Async context manager entry point.
        
        Returns:
            Tools: The initialized Tools instance
        """
        self._playwright = await async_playwright().start()
        self._browser = await self._playwright.chromium.launch(
            headless=settings.playwright_headless
        )
        self._context = await self._browser.new_context()
        self._page = await self._context.new_page()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """
        Async context manager exit point.
        
        Closes the browser context, browser, and playwright instance.
        """
        if self._context:
            await self._context.close()
        if self._browser:
            await self._browser.close()
        if self._playwright:
            await self._playwright.stop()
    
    async def call(self, name: str, **kwargs) -> Dict[str, Any]:
        """
        Dynamically dispatch to the appropriate tool method.
        
        Args:
            name: Name of the tool to call (e.g., "web.navigate", "ui.click")
            **kwargs: Arguments to pass to the tool method
            
        Returns:
            Dict[str, Any]: Result of the tool call
            
        Raises:
            ValueError: If the tool name is not recognized
        """
        # Map tool names to methods
        tool_map = {
            "web.navigate": self.web_navigate,
            "ui.click": self.ui_click,
            "ui.type": self.ui_type,
            "web.search": self.web_search,
            "web.extract": self.web_extract,
            "ui.screenshot": self.ui_screenshot,
        }
        
        # Get the method for the tool name
        method = tool_map.get(name)
        if not method:
            raise ValueError(f"Unknown tool: {name}")
        
        try:
            # Call the method with the provided arguments
            result = await method(**kwargs)
            return {"success": True, "result": result}
        except Exception as e:
            logger.error(f"Error calling tool {name}: {str(e)}", exc_info=True)
            return {"success": False, "error": str(e)}
    
    async def web_navigate(self, url: str) -> Dict[str, Any]:
        """
        Navigate to a URL.
        
        Args:
            url: URL to navigate to
            
        Returns:
            Dict[str, Any]: Result of the navigation
        """
        if not self._page:
            raise ValueError("Browser not initialized")
        
        try:
            response = await self._page.goto(url, wait_until="networkidle")
            return {
                "url": self._page.url,
                "status": response.status if response else None,
                "title": await self._page.title(),
            }
        except Exception as e:
            logger.error(f"Error navigating to {url}: {str(e)}")
            raise
    
    async def ui_click(self, selector: str, timeout: int = 5000) -> Dict[str, Any]:
        """
        Click on an element identified by a selector.
        
        Args:
            selector: CSS selector or text to click on
            timeout: Maximum time to wait for the element in milliseconds
            
        Returns:
            Dict[str, Any]: Result of the click operation
        """
        if not self._page:
            raise ValueError("Browser not initialized")
        
        try:
            # Try to find the element by selector
            element = await self._page.wait_for_selector(selector, timeout=timeout)
            if not element:
                # Try to find by text if selector fails
                element = await self._page.get_by_text(selector).first
                if not element:
                    raise ValueError(f"Element not found: {selector}")
            
            # Click the element
            await element.click()
            return {
                "clicked": True,
                "selector": selector,
            }
        except Exception as e:
            logger.error(f"Error clicking element {selector}: {str(e)}")
            raise
    
    async def ui_type(self, selector: str, text: str, timeout: int = 5000) -> Dict[str, Any]:
        """
        Type text into an input field.
        
        Args:
            selector: CSS selector of the input field
            text: Text to type
            timeout: Maximum time to wait for the element in milliseconds
            
        Returns:
            Dict[str, Any]: Result of the typing operation
        """
        if not self._page:
            raise ValueError("Browser not initialized")
        
        try:
            # Wait for the element to be available
            element = await self._page.wait_for_selector(selector, timeout=timeout)
            if not element:
                raise ValueError(f"Input element not found: {selector}")
            
            # Clear the field first
            await element.fill("")
            
            # Type the text
            await element.type(text)
            return {
                "typed": True,
                "selector": selector,
                "text": text,
            }
        except Exception as e:
            logger.error(f"Error typing into {selector}: {str(e)}")
            raise
    
    async def web_search(self, query: str) -> Dict[str, Any]:
        """
        Perform a web search using DuckDuckGo.
        
        Args:
            query: Search query
            
        Returns:
            Dict[str, Any]: Search results
        """
        try:
            # Use httpx to perform a search via DuckDuckGo HTML
            encoded_query = query.replace(" ", "+")
            url = f"https://html.duckduckgo.com/html/?q={encoded_query}"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    url,
                    headers={
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36"
                    },
                    follow_redirects=True,
                )
                
                if response.status_code != 200:
                    raise ValueError(f"Search failed with status code: {response.status_code}")
                
                # Navigate to the search results page in the browser for further interaction
                await self.web_navigate(url)
                
                # Extract search results
                results = await self.web_extract(".result__title")
                links = await self.web_extract(".result__url")
                
                return {
                    "query": query,
                    "results": [
                        {"title": title, "url": url}
                        for title, url in zip(results, links)
                        if title and url
                    ][:10],  # Limit to top 10 results
                }
        except Exception as e:
            logger.error(f"Error performing search for {query}: {str(e)}")
            raise
    
    async def web_extract(self, selector: str) -> List[str]:
        """
        Extract text from elements matching a selector.
        
        Args:
            selector: CSS selector for elements to extract text from
            
        Returns:
            List[str]: List of inner texts from matching elements
        """
        if not self._page:
            raise ValueError("Browser not initialized")
        
        try:
            # Wait for at least one element to be available
            await self._page.wait_for_selector(selector, timeout=5000)
            
            # Extract text from all matching elements
            texts = await self._page.eval_on_selector_all(
                selector,
                """(elements) => {
                    return elements.map(el => el.innerText.trim());
                }"""
            )
            
            return texts
        except Exception as e:
            logger.error(f"Error extracting text from {selector}: {str(e)}")
            raise
    
    async def ui_screenshot(self, path: str = None, selector: str = None) -> Dict[str, Any]:
        """
        Take a screenshot of the current page or a specific element.
        
        Args:
            path: Path where to save the screenshot (optional)
            selector: CSS selector of the element to screenshot (optional)
            
        Returns:
            Dict[str, Any]: Result of the screenshot operation including base64 data
        """
        if not self._page:
            raise ValueError("Browser not initialized")
        
        try:
            # Determine what to screenshot
            target = None
            if selector:
                target = await self._page.wait_for_selector(selector, timeout=5000)
                if not target:
                    raise ValueError(f"Element not found: {selector}")
            else:
                target = self._page
            
            # Take the screenshot
            if path:
                # Ensure the directory exists
                os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
                await target.screenshot(path=path)
                return {
                    "screenshot": True,
                    "path": path,
                }
            else:
                # Return as base64 if no path is provided
                screenshot_bytes = await target.screenshot()
                import base64
                screenshot_base64 = base64.b64encode(screenshot_bytes).decode("utf-8")
                return {
                    "screenshot": True,
                    "data": f"data:image/png;base64,{screenshot_base64}",
                }
        except Exception as e:
            logger.error(f"Error taking screenshot: {str(e)}")
            raise


# Tool definitions for the LLM provider
TOOL_DEFINITIONS = [
    ToolFunction(
        name="web.navigate",
        description="Navigate to a URL in the browser",
        parameters={
            "type": "object",
            "properties": {
                "url": {
                    "type": "string",
                    "description": "The URL to navigate to"
                }
            },
            "required": ["url"]
        }
    ),
    ToolFunction(
        name="ui.click",
        description="Click on an element in the current page",
        parameters={
            "type": "object",
            "properties": {
                "selector": {
                    "type": "string",
                    "description": "CSS selector or text content of the element to click"
                },
                "timeout": {
                    "type": "integer",
                    "description": "Maximum time to wait for the element in milliseconds",
                    "default": 5000
                }
            },
            "required": ["selector"]
        }
    ),
    ToolFunction(
        name="ui.type",
        description="Type text into an input field",
        parameters={
            "type": "object",
            "properties": {
                "selector": {
                    "type": "string",
                    "description": "CSS selector of the input field"
                },
                "text": {
                    "type": "string",
                    "description": "Text to type into the field"
                },
                "timeout": {
                    "type": "integer",
                    "description": "Maximum time to wait for the element in milliseconds",
                    "default": 5000
                }
            },
            "required": ["selector", "text"]
        }
    ),
    ToolFunction(
        name="web.search",
        description="Perform a web search using DuckDuckGo",
        parameters={
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Search query"
                }
            },
            "required": ["query"]
        }
    ),
    ToolFunction(
        name="web.extract",
        description="Extract text from elements matching a selector",
        parameters={
            "type": "object",
            "properties": {
                "selector": {
                    "type": "string",
                    "description": "CSS selector for elements to extract text from"
                }
            },
            "required": ["selector"]
        }
    ),
    ToolFunction(
        name="ui.screenshot",
        description="Take a screenshot of the current page or a specific element",
        parameters={
            "type": "object",
            "properties": {
                "path": {
                    "type": "string",
                    "description": "Path where to save the screenshot (optional)"
                },
                "selector": {
                    "type": "string",
                    "description": "CSS selector of the element to screenshot (optional)"
                }
            }
        }
    ),
]
