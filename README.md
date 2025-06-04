# Event Hub

**Event Hub** is a Django-based web application that enables university societies (_handlers_) to manage events and memberships, while students (_viewers_) can join societies, RSVP to events, and participate in discussions.   
  
Website is hosted [here](https://sohsohh.github.io/EventHub/DB_ESP/frontend/index.html) with the backend Django server running on a Render server.
  
You may create a viewer account. For the handler account, use the following credentials if you're not running it locally:  
Email: testsociety@example.com  
Password: Test1234!  

### Frontend was developed by @AzkaHafeez and @Sanehaakhtar  
### Backend was developed by @SohSohh
---

## Key Features

### User Roles

- **Viewers**: Students who can join societies, RSVP to events, and comment.
- **Handlers**: Society representatives who manage events and memberships.
- **Admins**: Oversee handler applications and platform moderation.

### Society & Membership Management

- Handlers can create societies and manage join codes.
- Viewers can join societies and have assigned roles (e.g., member, officer).

### Event Management

- Handlers can create and update events with categories, banners, and descriptions.
- Viewers can RSVP to events and view their upcoming activities.

### Handler Applications

- Prospective handlers can apply to create a society.
- Admins review, approve, or deny applications.
- Email notifications are sent to users upon approval or denial.

### Comments & Ratings

- Viewers can comment on and rate events.

### Authentication

- JWT-based authentication ensures secure access.
- A custom user model supports both viewers and handlers.

### Admin Dashboard

- Admins can manage all databases and view platform statistics.

---

## Tech Stack

- **Backend**: Django, Django REST Framework, SimpleJWT  
- **Frontend**: HTML, CSS, JavaScript  
- **Database**: SQLite  
- **Email**: SMTP for notifications


# Setting up locally:  
Create a fork of the repository.
After cloning the repository, go into the event_management folder and run the following command:  
`pip install -r requirements.txt`  
This will download all necessary dependencies.  
  
## Running the server
In the events_management folder where "manage.py" is located, run the following command:  
`python manage.py runserver`  
This will start the backend locally and a link to it will be provided.

## Running HTTP Server
Along with runing the backend, you'll need to run a HTTP server too to create a web environment.
Open the command terminal in the "frontend" folder and type in the following command:  
`python -m http.server 8080`  
Then, go to: http://localhost:8080/index.html

## Admin management  
Create a superuser first in order to login to the admin panel on {baseURL}/admin/
From the admin panel, you can interact with the database and make any changes you want. This is also from where we will approve handler requests.


