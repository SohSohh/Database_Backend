# Setting up:
All of these interactions occur on the command terminal.  
After cloning the repository, go (cd) into the event_management folder and run the following command:  
`pip install -r requirements.txt`  
This will download all necessary dependencies.  
  
# Running the server
In the events_management folder where "manage.py" is located, run the following command:  
`python manage.py runserver`  
This will start the backend locally and a link to it will be provided. Information regarding the endpoints is in the document.  

# Running HTTP Server
Along with runing the backend, you'll need to run a HTTP server too to bypass CORS:  
Open the command terminal in the "frontend" folder and type in the following command:  
`python -m http.server 8080`  
Then, go to: http://localhost:8080/index.html

# Admin management  
Go to http://127.0.0.1:8000/admin/ to access the admin panel. The credentials are:  
**Email: admin@admin.com**  
**Password: admin**  
From the admin panel, you can interact with the database and make any changes you want. This is also from where we will turn viewers into handlers


