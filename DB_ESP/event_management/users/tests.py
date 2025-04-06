from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from rest_framework_simplejwt.tokens import RefreshToken
import json
import pprint

User = get_user_model()


class UserAPITestCase(APITestCase):
    """Test case for User API endpoints"""

    def setUp(self):
        """
        Set up test data before each test method is run.
        This is called before each test.
        """
        # Create a test admin user
        self.admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpass123'
        )

        # Create a regular viewer user
        self.viewer_user = User.objects.create_user(
            username='viewer',
            email='viewer@example.com',
            password='viewerpass123',
            user_type='viewer'
        )

        # Create a handler user
        self.handler_user = User.objects.create_user(
            username='handler',
            email='handler@example.com',
            password='handlerpass123',
            user_type='handler'
        )

        # Initialize API client - this is what we'll use to make requests
        self.client = APIClient()

        # Store URLs for easier access in tests
        self.register_url = reverse('register')
        self.login_url = reverse('token_obtain_pair')
        self.logout_url = reverse('logout')
        self.delete_account_url = reverse('delete_account')
        self.user_list_url = reverse('user_list')
        self.current_user_url = reverse('current_user')

        # Generate URL for specific user detail
        self.viewer_detail_url = reverse('user_detail', kwargs={'pk': self.viewer_user.id})
        self.handler_detail_url = reverse('user_detail', kwargs={'pk': self.handler_user.id})

    def get_tokens_for_user(self, user):
        """
        Helper method to get JWT tokens for a user.
        Returns a dict with refresh and access tokens.
        """
        # Generate refresh token for user
        refresh = RefreshToken.for_user(user)

        # Return both refresh and access tokens
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

    def authenticate_client(self, user):
        """
        Helper method to authenticate the client as a specific user.
        Sets the Authorization header with JWT access token.
        """
        # Get tokens for user
        tokens = self.get_tokens_for_user(user)

        # Set auth header with access token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens["access"]}')

        # Return tokens in case we need them later
        return tokens

    def print_request_response(self, method, url, data=None, headers=None, response=None):
        """Helper to print request and response details in a clean format"""
        print("\n" + "=" * 80)
        print(f"TEST: {self._testMethodName}")
        print("=" * 80)

        # Request details
        print("\nREQUEST:")
        print(f"Method: {method}")
        print(f"URL: {url}")

        if headers:
            print("\nHeaders:")
            for key, value in headers.items():
                # Truncate long headers like tokens
                if len(str(value)) > 50:
                    print(f"  {key}: {str(value)[:30]}...{str(value)[-10:]}")
                else:
                    print(f"  {key}: {value}")

        if data:
            print("\nRequest Body:")
            pprint.pprint(data, indent=2)

        # Response details
        if response:
            print("\nRESPONSE:")
            print(f"Status Code: {response.status_code} ({response.status_text})")

            if hasattr(response, 'data'):
                print("\nResponse Body:")
                try:
                    pprint.pprint(response.data, indent=2)
                except:
                    print(response.content.decode('utf-8'))

        print("\n" + "=" * 80 + "\n")

    def test_user_registration(self):
        """Test that a user can register successfully"""
        # Data for registration
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newuserpass123',
            'password2': 'newuserpass123'
        }

        # Print request details
        self.print_request_response('POST', self.register_url, data=data)

        # Send POST request to register endpoint
        response = self.client.post(self.register_url, data, format='json')

        # Print response details
        self.print_request_response('POST', self.register_url, data=data, response=response)

        # Check status code is 201 CREATED
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check user exists in database
        self.assertTrue(User.objects.filter(email='newuser@example.com').exists())

        # Check user is a viewer by default
        new_user = User.objects.get(email='newuser@example.com')
        self.assertEqual(new_user.user_type, 'viewer')

    def test_user_login(self):
        """Test that a user can login and receive JWT tokens"""
        # Login data using email (per requirements)
        data = {
            'email': 'viewer@example.com',
            'password': 'viewerpass123'
        }

        # Print request details
        self.print_request_response('POST', self.login_url, data=data)

        # Send POST request to login endpoint
        response = self.client.post(self.login_url, data, format='json')

        # Print response details
        self.print_request_response('POST', self.login_url, data=data, response=response)

        # Check status code is 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check response contains access and refresh tokens
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_user_logout(self):
        """Test that a user can logout, blacklisting their token"""
        # First authenticate the client
        tokens = self.authenticate_client(self.viewer_user)

        # Data for logout - needs refresh token
        data = {
            'refresh': tokens['refresh']
        }

        # Print request details including auth header
        headers = {'Authorization': f'Bearer {tokens["access"]}'}
        self.print_request_response('POST', self.logout_url, data=data, headers=headers)

        # Send POST request to logout endpoint
        response = self.client.post(self.logout_url, data, format='json')

        # Print response details
        self.print_request_response('POST', self.logout_url, data=data, headers=headers, response=response)

        # Check status code is 200 OK instead of 205 RESET CONTENT
        self.assertEqual(response.status_code, status.HTTP_205_RESET_CONTENT)

    def test_delete_account(self):
        """Test that a user can delete their own account"""
        # Authenticate as viewer
        tokens = self.authenticate_client(self.viewer_user)

        # Store user ID for later verification
        user_id = self.viewer_user.id

        # Print request details including auth header
        headers = {'Authorization': f'Bearer {tokens["access"]}'}
        self.print_request_response('DELETE', self.delete_account_url, headers=headers)

        # Send DELETE request to delete account endpoint
        response = self.client.delete(self.delete_account_url)

        # Print response details
        self.print_request_response('DELETE', self.delete_account_url, headers=headers, response=response)

        # Check status code is 204 NO CONTENT
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Check user no longer exists in database
        self.assertFalse(User.objects.filter(id=user_id).exists())

    def test_user_list_admin_only(self):
        """Test that only admin users can list all users"""
        # First try as regular viewer
        viewer_tokens = self.authenticate_client(self.viewer_user)

        # Print request details with viewer auth
        headers = {'Authorization': f'Bearer {viewer_tokens["access"]}'}
        self.print_request_response('GET', self.user_list_url, headers=headers)

        # Send GET request to user list endpoint
        response = self.client.get(self.user_list_url)

        # Print response details
        self.print_request_response('GET', self.user_list_url, headers=headers, response=response)

        # Check status code is 403 FORBIDDEN
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Now try as admin
        admin_tokens = self.authenticate_client(self.admin_user)

        # Print request details with admin auth
        headers = {'Authorization': f'Bearer {admin_tokens["access"]}'}
        self.print_request_response('GET', self.user_list_url, headers=headers)

        # Send GET request to user list endpoint again
        response = self.client.get(self.user_list_url)

        # Print response details
        self.print_request_response('GET', self.user_list_url, headers=headers, response=response)

        # Check status code is 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check response contains all users (3 created in setUp plus potentially 1 in other tests)
        self.assertGreaterEqual(len(response.data), 3)

    def test_current_user_view(self):
        """Test that a user can view their own information"""
        # Authenticate as viewer
        tokens = self.authenticate_client(self.viewer_user)

        # Print request details with auth header
        headers = {'Authorization': f'Bearer {tokens["access"]}'}
        self.print_request_response('GET', self.current_user_url, headers=headers)

        # Send GET request to current user endpoint
        response = self.client.get(self.current_user_url)

        # Print response details
        self.print_request_response('GET', self.current_user_url, headers=headers, response=response)

        # Check status code is 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check response contains correct user info
        self.assertEqual(response.data['username'], 'viewer')
        self.assertEqual(response.data['email'], 'viewer@example.com')
        self.assertEqual(response.data['user_type'], 'viewer')

    def test_current_user_dynamic_fields(self):
        """Test dynamic field selection for current user"""
        # Authenticate as viewer
        tokens = self.authenticate_client(self.viewer_user)
        headers = {'Authorization': f'Bearer {tokens["access"]}'}

        # Test with fields parameter for username only
        url = f"{self.current_user_url}?fields=username"
        self.print_request_response('GET', url, headers=headers)

        # Send GET request with fields parameter for username only
        response = self.client.get(url)

        # Print response details
        self.print_request_response('GET', url, headers=headers, response=response)

        # Check status code is 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check response contains only username
        self.assertIn('username', response.data)
        self.assertNotIn('email', response.data)
        self.assertNotIn('user_type', response.data)

        # Test with fields parameter for username and email
        url = f"{self.current_user_url}?fields=username,email"
        self.print_request_response('GET', url, headers=headers)

        # Send GET request with fields parameter for username and email
        response = self.client.get(url)

        # Print response details
        self.print_request_response('GET', url, headers=headers, response=response)

        # Check response contains username and email but not user_type
        self.assertIn('username', response.data)
        self.assertIn('email', response.data)
        self.assertNotIn('user_type', response.data)

    def test_user_detail_permissions(self):
        """Test that users can only view their own details, admins can view any"""
        # Authenticate as viewer
        viewer_tokens = self.authenticate_client(self.viewer_user)
        viewer_headers = {'Authorization': f'Bearer {viewer_tokens["access"]}'}

        # Print request details
        self.print_request_response('GET', self.handler_detail_url, headers=viewer_headers)

        # Try to view handler's details (should fail)
        response = self.client.get(self.handler_detail_url)

        # Print response details
        self.print_request_response('GET', self.handler_detail_url, headers=viewer_headers, response=response)

        # Check status code is 403 FORBIDDEN
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Now authenticate as admin
        admin_tokens = self.authenticate_client(self.admin_user)
        admin_headers = {'Authorization': f'Bearer {admin_tokens["access"]}'}

        # Print request details
        self.print_request_response('GET', self.handler_detail_url, headers=admin_headers)

        # Try to view handler's details again (should succeed)
        response = self.client.get(self.handler_detail_url)

        # Print response details
        self.print_request_response('GET', self.handler_detail_url, headers=admin_headers, response=response)

        # Check status code is 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check response contains correct user info
        self.assertEqual(response.data['username'], 'handler')