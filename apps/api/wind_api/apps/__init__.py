"""
Wind Apps Registry.

This module provides a registry for applications that can be installed and used
within the Wind operating system. It allows for registering app definitions and
retrieving them by ID.

Apps in Wind can be controlled through:
1. Visual interfaces (using browser automation)
2. API integrations (direct API calls)
3. Hybrid approaches (combining both methods)

Each app must define:
- Metadata (name, description, icon, etc.)
- Installation requirements
- Control methods (visual, API, or both)
- App-specific tools and capabilities
"""

from typing import Dict, List, Optional, Type, Any, Callable
import logging

logger = logging.getLogger(__name__)


class AppDefinition:
    """Base class for all app definitions in Wind."""
    
    id: str
    name: str
    description: str
    icon: str
    version: str
    category: str
    requires_auth: bool = False
    supports_visual: bool = True
    supports_api: bool = False
    
    # Installation requirements
    required_permissions: List[str] = []
    
    @classmethod
    def get_metadata(cls) -> Dict[str, Any]:
        """Return metadata about this app."""
        return {
            "id": cls.id,
            "name": cls.name,
            "description": cls.description,
            "icon": cls.icon,
            "version": cls.version,
            "category": cls.category,
            "requires_auth": cls.requires_auth,
            "supports_visual": cls.supports_visual,
            "supports_api": cls.supports_api,
            "required_permissions": cls.required_permissions,
        }
    
    @classmethod
    def get_tools(cls) -> List[Dict[str, Any]]:
        """Return the tools provided by this app."""
        return []
    
    @classmethod
    def get_installation_instructions(cls) -> str:
        """Return instructions for installing this app."""
        return f"Install {cls.name} by adding it to your workspace."


class AppRegistry:
    """Registry for Wind apps."""
    
    def __init__(self):
        """Initialize an empty app registry."""
        self._apps: Dict[str, Type[AppDefinition]] = {}
    
    def register(self, app_class: Type[AppDefinition]) -> None:
        """
        Register an app with the registry.
        
        Args:
            app_class: The app class to register
        """
        if not hasattr(app_class, 'id') or not app_class.id:
            raise ValueError(f"App class {app_class.__name__} must have an id attribute")
        
        self._apps[app_class.id] = app_class
        logger.info(f"Registered app: {app_class.id} ({app_class.name})")
    
    def get(self, app_id: str) -> Optional[Type[AppDefinition]]:
        """
        Get an app by ID.
        
        Args:
            app_id: The ID of the app to retrieve
            
        Returns:
            The app class if found, None otherwise
        """
        return self._apps.get(app_id)
    
    def list_apps(self) -> List[Dict[str, Any]]:
        """
        List all registered apps.
        
        Returns:
            List of app metadata dictionaries
        """
        return [app_class.get_metadata() for app_class in self._apps.values()]
    
    def list_by_category(self, category: str) -> List[Dict[str, Any]]:
        """
        List apps by category.
        
        Args:
            category: The category to filter by
            
        Returns:
            List of app metadata dictionaries for apps in the specified category
        """
        return [
            app_class.get_metadata() 
            for app_class in self._apps.values() 
            if app_class.category == category
        ]


# Create a global registry instance
registry = AppRegistry()


def register_app(app_class: Type[AppDefinition]) -> Type[AppDefinition]:
    """
    Decorator for registering an app with the global registry.
    
    Args:
        app_class: The app class to register
        
    Returns:
        The app class (unchanged)
    
    Example:
        ```python
        @register_app
        class ChromeApp(AppDefinition):
            id = "chrome"
            name = "Chrome"
            # ...
        ```
    """
    registry.register(app_class)
    return app_class


# Export public API
__all__ = ["AppDefinition", "AppRegistry", "register_app", "registry"]
