# apps/utils/responses.py
"""
Custom exception handler and standardized response helpers for DRF.
All responses follow consistent format:
- Success: {"success": true, "data": {...}}
- Error:   {"success": false, "error": "message", "details": {...}}
"""

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler for Django REST Framework.
    
    Intercepts DRF exceptions and reformats them to a consistent structure:
    {
        "success": false,
        "error": "Human-readable error message",
        "details": {...}  # Optional: field-specific errors or debug info
    }
    
    Args:
        exc: The exception instance raised
        context: Dict containing request, view, args, kwargs
        
    Returns:
        Response: Reformatted DRF Response with consistent error format
    """
    # Step 1: Let DRF handle the exception first (gets standard error response)
    response = exception_handler(exc, context)
    
    # Step 2: If DRF handled it, reformat to our consistent structure
    if response is not None:
        # Extract error message from DRF's response
        error_message = _extract_error_message(response.data)
        
        # Reformat to our standard error structure
        return Response(
            {
                'success': False,
                'error': error_message,
                'details': response.data if isinstance(response.data, dict) else None
            },
            status=response.status_code,
            headers=response.headers
        )
    
    # Step 3: If DRF didn't handle it, it's an unhandled exception (500 error)
    logger.error(f"Unhandled exception: {type(exc).__name__}: {exc}", exc_info=True)
    
    return Response(
        {
            'success': False,
            'error': 'Internal server error',
            'details': None
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )


def _extract_error_message(data):
    """
    Helper: Extract a human-readable error message from DRF error data.
    
    Handles various DRF error formats:
    - {"detail": "Invalid credentials"} → "Invalid credentials"
    - {"email": ["This field is required"]} → "Email: This field is required"
    - {"non_field_errors": ["Passwords don't match"]} → "Passwords don't match"
    - ["Simple list error"] → "Simple list error"
    """
    if isinstance(data, str):
        return data
    
    if isinstance(data, dict):
        # Priority 1: 'detail' key (common in DRF auth errors)
        if 'detail' in data:
            detail = data['detail']
            return detail if isinstance(detail, str) else str(detail)
        
        # Priority 2: 'non_field_errors' (form-level errors)
        if 'non_field_errors' in data:
            errors = data['non_field_errors']
            if isinstance(errors, list) and len(errors) > 0:
                return str(errors[0])
        
        # Priority 3: First field error (e.g., {"email": ["required"]})
        for field, messages in data.items():
            if isinstance(messages, (list, tuple)) and len(messages) > 0:
                # Format: "Field: error message"
                field_name = field.replace('_', ' ').title()
                return f"{field_name}: {messages[0]}"
            elif isinstance(messages, str):
                return f"{field.replace('_', ' ').title()}: {messages}"
        
        # Fallback: join all values
        return '; '.join(str(v) for v in data.values())
    
    if isinstance(data, (list, tuple)) and len(data) > 0:
        return str(data[0])
    
    # Ultimate fallback
    return str(data)


def success_response(data, status=status.HTTP_200_OK, message=None):
    """
    Create a standardized success response.
    
    Format:
    {
        "success": true,
        "data": {...},           # Your actual response data
        "message": "Optional success message"  # If provided
    }
    
    Args:
        data: The payload to return (dict, list, or any serializable data)
        status: HTTP status code (default: 200)
        message: Optional success message string
        
    Returns:
        Response: DRF Response with consistent success format
    """
    response_data = {
        'success': True,
        'data': data
    }
    
    if message:
        response_data['message'] = message
    
    return Response(response_data, status=status)


def error_response(message, details=None, status=status.HTTP_400_BAD_REQUEST, error_code=None):
    """
    Create a standardized error response.
    
    Format:
    {
        "success": false,
        "error": "Human-readable error message",
        "details": {...},        # Optional: field errors or debug info
        "code": "optional_error_code"  # If provided
    }
    
    Args:
        message: Human-readable error message (string)
        details: Optional dict/list with field-specific errors or debug info
        status: HTTP status code (default: 400)
        error_code: Optional string code for programmatic error handling
        
    Returns:
        Response: DRF Response with consistent error format
    """
    response_data = {
        'success': False,
        'error': message
    }
    
    if details is not None:
        response_data['details'] = details
    
    if error_code:
        response_data['code'] = error_code
    
    return Response(response_data, status=status)