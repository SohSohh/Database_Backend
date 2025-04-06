from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from datetime import date, time
from .models import Event
import io
from PIL import Image
import pprint

User = get_user_model()


class EventAPITestCase(APITestCase):
    """Test case for Event API endpoints"""

    def setUp(self):
        """
        Set up test data before each test method is run.
        Creates users and events for testing.
        """
        # Create test users
        self.admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpass123'
        )

        self.viewer_user = User.objects.create_user(
            username='viewer',
            email='viewer@example.com',
            password='viewerpass123',
            user_type='viewer'
        )

        self.handler_user = User.objects.create_user(
            username='handler',
            email='handler@example.com',
            password='handlerpass123',
            user_type='handler'
        )

        self.another_handler = User.objects.create_user(
            username='handler2',
            email='handler2@example.com',
            password='handler2pass123',
            user_type='handler'
        )

        # Initialize API client
        self.client = APIClient()

        # Create some events for testing
        self.event1 = Event.objects.create(
            name='Conference',
            host=self.handler_user,
            start_time=time(9, 0),
            end_time=time(17, 0),
            date=date(2023, 6, 15),
            location='Conference Center',
            description='Annual tech conference'
        )

        self.event2 = Event.objects.create(
            name='Workshop',
            host=self.handler_user,
            start_time=time(14, 0),
            end_time=time(16, 0),
            date=date(2023, 6, 20),
            location='Workshop Room',
            description='Hands-on workshop'
        )

        self.event3 = Event.objects.create(
            name='Meetup',
            host=self.another_handler,
            start_time=time(18, 0),
            end_time=time(20, 0),
            date=date(2023, 6, 25),
            location='Downtown',
            description='Casual networking event'
        )

        # Store URLs for easier access in tests
        self.event_list_url = reverse('event_list')
        self.handler_events_url = reverse('handler_events')

        # Generate URLs for specific event details
        self.event1_detail_url = reverse('event_detail', kwargs={'pk': self.event1.id})
        self.event2_detail_url = reverse('event_detail', kwargs={'pk': self.event2.id})
        self.event3_detail_url = reverse('event_detail', kwargs={'pk': self.event3.id})

    def get_temp_image(self):
        """
        Helper method to create a test image file.
        Returns an in-memory image file for testing uploads.
        """
        # Create a black 10x10 pixel image
        file = io.BytesIO()
        image = Image.new('RGB', (10, 10), color='black')
        image.save(file, 'jpeg')
        file.name = 'test.jpg'
        file.seek(0)  # Move to the start of the file
        return file

    def authenticate_client(self, user):
        """
        Helper method to authenticate the client as a specific user.
        Sets the Authorization header with JWT access token.
        """
        # Create JWT tokens for the user
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)

        # Set Authorization header with JWT
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        # Return tokens for logging
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        }

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
            if isinstance(data, io.BytesIO):
                print("  [Binary file data]")
            else:
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

    def test_list_events(self):
        """Test that authenticated users can list all events"""
        # Authenticate as viewer
        tokens = self.authenticate_client(self.viewer_user)
        headers = {'Authorization': f'Bearer {tokens["access"]}'}

        # Print request details
        self.print_request_response('GET', self.event_list_url, headers=headers)

        # Send GET request to event list endpoint
        response = self.client.get(self.event_list_url)

        # Print response details
        self.print_request_response('GET', self.event_list_url, headers=headers, response=response)

        # Check status code is 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check response contains all 3 events created in setUp
        self.assertEqual(len(response.data), 3)

    def test_create_event_permissions(self):
        """Test that only handlers can create events"""
        # Event data for creation
        event_data = {
            'name': 'New Event',
            'start_time': '10:00:00',
            'end_time': '12:00:00',
            'date': '2023-07-01',
            'location': 'New Location',
            'description': 'New event description'
        }

        # First try as viewer (should fail)
        viewer_tokens = self.authenticate_client(self.viewer_user)
        viewer_headers = {'Authorization': f'Bearer {viewer_tokens["access"]}'}

        # Print request details
        self.print_request_response('POST', self.event_list_url, data=event_data, headers=viewer_headers)

        response = self.client.post(self.event_list_url, event_data, format='json')

        # Print response details
        self.print_request_response('POST', self.event_list_url, data=event_data, headers=viewer_headers,
                                    response=response)

        # Check status code is 403 FORBIDDEN
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Now try as handler (should succeed)
        handler_tokens = self.authenticate_client(self.handler_user)
        handler_headers = {'Authorization': f'Bearer {handler_tokens["access"]}'}

        # Print request details
        self.print_request_response('POST', self.event_list_url, data=event_data, headers=handler_headers)

        response = self.client.post(self.event_list_url, event_data, format='json')

        # Print response details
        self.print_request_response('POST', self.event_list_url, data=event_data, headers=handler_headers,
                                    response=response)

        # Check status code is 201 CREATED
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check event is in database and host is set to handler_user
        event = Event.objects.get(name='New Event')
        self.assertEqual(event.host, self.handler_user)

    def test_retrieve_event_detail(self):
        """Test retrieving a specific event"""
        # Authenticate as viewer
        tokens = self.authenticate_client(self.viewer_user)
        headers = {'Authorization': f'Bearer {tokens["access"]}'}

        # Print request details
        self.print_request_response('GET', self.event1_detail_url, headers=headers)

        # Send GET request to event detail endpoint
        response = self.client.get(self.event1_detail_url)

        # Print response details
        self.print_request_response('GET', self.event1_detail_url, headers=headers, response=response)

        # Check status code is 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check response contains correct event info
        self.assertEqual(response.data['name'], 'Conference')
        self.assertEqual(response.data['location'], 'Conference Center')

    def test_retrieve_event_dynamic_fields(self):
        """Test retrieving only specific fields of an event"""
        # Authenticate as viewer
        tokens = self.authenticate_client(self.viewer_user)
        headers = {'Authorization': f'Bearer {tokens["access"]}'}

        # Request URL with fields parameter
        url = f"{self.event1_detail_url}?fields=name,location"

        # Print request details
        self.print_request_response('GET', url, headers=headers)

        # Send GET request with fields parameter for name and location only
        response = self.client.get(url)

        # Print response details
        self.print_request_response('GET', url, headers=headers, response=response)

        # Check status code is 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check response contains only name and location
        self.assertIn('name', response.data)
        self.assertIn('location', response.data)
        self.assertNotIn('description', response.data)
        self.assertNotIn('start_time', response.data)

    def test_update_event_permissions(self):
        """Test that only event host can update an event"""
        # Data for updating event
        update_data = {
            'name': 'Updated Conference',
            'description': 'Updated description'
        }

        # Try updating as another handler (not the host)
        other_tokens = self.authenticate_client(self.another_handler)
        other_headers = {'Authorization': f'Bearer {other_tokens["access"]}'}

        # Print request details
        self.print_request_response('PATCH', self.event1_detail_url, data=update_data, headers=other_headers)

        response = self.client.patch(self.event1_detail_url, update_data, format='json')

        # Print response details
        self.print_request_response('PATCH', self.event1_detail_url, data=update_data, headers=other_headers,
                                    response=response)

        # Check status code is 403 FORBIDDEN
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Now try as the event host
        host_tokens = self.authenticate_client(self.handler_user)
        host_headers = {'Authorization': f'Bearer {host_tokens["access"]}'}

        # Print request details
        self.print_request_response('PATCH', self.event1_detail_url, data=update_data, headers=host_headers)

        response = self.client.patch(self.event1_detail_url, update_data, format='json')

        # Print response details
        self.print_request_response('PATCH', self.event1_detail_url, data=update_data, headers=host_headers,
                                    response=response)

        # Check status code is 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check event was updated in database
        self.event1.refresh_from_db()
        self.assertEqual(self.event1.name, 'Updated Conference')
        self.assertEqual(self.event1.description, 'Updated description')

    def test_delete_event_permissions(self):
        """Test that only event host can delete an event"""
        # Try deleting as another handler (not the host)
        other_tokens = self.authenticate_client(self.another_handler)
        other_headers = {'Authorization': f'Bearer {other_tokens["access"]}'}

        # Print request details
        self.print_request_response('DELETE', self.event1_detail_url, headers=other_headers)

        response = self.client.delete(self.event1_detail_url)

        # Print response details
        self.print_request_response('DELETE', self.event1_detail_url, headers=other_headers, response=response)

        # Check status code is 403 FORBIDDEN
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Now try as the event host
        host_tokens = self.authenticate_client(self.handler_user)
        host_headers = {'Authorization': f'Bearer {host_tokens["access"]}'}

        # Print request details
        self.print_request_response('DELETE', self.event1_detail_url, headers=host_headers)

        response = self.client.delete(self.event1_detail_url)

        # Print response details
        self.print_request_response('DELETE', self.event1_detail_url, headers=host_headers, response=response)

        # Check status code is 204 NO CONTENT
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Check event no longer exists in database
        self.assertFalse(Event.objects.filter(id=self.event1.id).exists())

    def test_handler_events_list(self):
        """Test that handlers can list only their own events"""
        # Authenticate as handler_user (who has 2 events)
        tokens = self.authenticate_client(self.handler_user)
        headers = {'Authorization': f'Bearer {tokens["access"]}'}

        # Print request details
        self.print_request_response('GET', self.handler_events_url, headers=headers)

        # Send GET request to handler events endpoint
        response = self.client.get(self.handler_events_url)

        # Print response details
        self.print_request_response('GET', self.handler_events_url, headers=headers, response=response)

        # Check status code is 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check response contains only handler_user's events (2)
        self.assertEqual(len(response.data), 2)

        # Check all events in response belong to handler_user
        for event in response.data:
            self.assertEqual(event['host'], self.handler_user.id)

    def test_filter_events_by_attribute(self):
        """Test filtering events by attributes"""
        # Authenticate as viewer
        tokens = self.authenticate_client(self.viewer_user)
        headers = {'Authorization': f'Bearer {tokens["access"]}'}

        # Filter by date
        url = f"{self.event_list_url}?date=2023-06-15"

        # Print request details
        self.print_request_response('GET', url, headers=headers)

        response = self.client.get(url)

        # Print response details
        self.print_request_response('GET', url, headers=headers, response=response)

        # Check response contains only events on that date (1)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Conference')

        # Filter by location
        url = f"{self.event_list_url}?location=Downtown"

        # Print request details
        self.print_request_response('GET', url, headers=headers)

        response = self.client.get(url)

        # Print response details
        self.print_request_response('GET', url, headers=headers, response=response)

        # Check response contains only events at that location (1)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Meetup')

        # Filter by host (using ID)
        url = f"{self.event_list_url}?host={self.handler_user.id}"

        # Print request details
        self.print_request_response('GET', url, headers=headers)

        response = self.client.get(url)

        # Print response details
        self.print_request_response('GET', url, headers=headers, response=response)

        # Check response contains only events by that host (2)
        self.assertEqual(len(response.data), 2)

    def test_search_events(self):
        """Test searching events by name or description"""
        # Authenticate as viewer
        tokens = self.authenticate_client(self.viewer_user)
        headers = {'Authorization': f'Bearer {tokens["access"]}'}

        # Search for 'tech'
        search_url = f"{self.event_list_url}?search=tech"

        # Print request details
        self.print_request_response('GET', search_url, headers=headers)

        # Send GET request to search endpoint
        response = self.client.get(search_url)

        # Print response details
        self.print_request_response('GET', search_url, headers=headers, response=response)

        # Check response contains only events matching search (1)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Conference')

        # Search for 'workshop'
        search_url = f"{self.event_list_url}?search=workshop"

        # Print request details
        self.print_request_response('GET', search_url, headers=headers)

        # Send GET request to search endpoint
        response = self.client.get(search_url)

        # Print response details
        self.print_request_response('GET', search_url, headers=headers, response=response)

        # Check response contains only events matching search (1)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Workshop')

    def test_upload_event_banner(self):
        """Test uploading an image banner for an event"""
        # Authenticate as handler
        tokens = self.authenticate_client(self.handler_user)
        headers = {'Authorization': f'Bearer {tokens["access"]}'}

        # Create test image file
        image = self.get_temp_image()

        # Data for updating event with banner
        update_data = {
            'name': 'Conference with Banner',
            'banner': image
        }

        # Print request details
        self.print_request_response('PATCH', self.event1_detail_url, data=update_data, headers=headers)

        # Use multipart form data format for file upload
        response = self.client.patch(
            self.event1_detail_url,
            update_data,
            format='multipart'  # Important for file uploads
        )

        # Print response details
        self.print_request_response('PATCH', self.event1_detail_url, data=update_data, headers=headers,
                                    response=response)

        # Check status code is 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check event was updated in database
        self.event1.refresh_from_db()
        self.assertEqual(self.event1.name, 'Conference with Banner')
        self.assertTrue(self.event1.banner)  # Banner field is not empty