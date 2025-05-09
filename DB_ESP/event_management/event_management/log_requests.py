# your_app/middleware/log_requests.py

import logging

logger = logging.getLogger(__name__)

class LogRequestResponseMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request_body = request.body.decode('utf-8') if request.body else ''
        logger.info(f"Request: {request.method} {request.path} Body: {request_body}")

        response = self.get_response(request)

        response_body = response.content.decode('utf-8') if hasattr(response, 'content') else ''
        logger.info(f"Response: {response.status_code} Body: {response_body}")

        return response
