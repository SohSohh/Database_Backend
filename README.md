# Setting up:
All of these interactions occur on the command terminal.  
After cloning the repository, go (cd) into the event_management folder and run the following command:  
`pip install -r requirements.txt`  
This will download all necessary dependencies.  
  
# Running the server
In the events_management folder where "manage.py" is located, run the following command:  
`python manage.py runserver`  
This will start the backend locally and a link to it will be provided. Information regarding the endpoints is in the document.  
  
# Admin management  
Go to http://127.0.0.1:8000/admin/ to access the admin panel. The credentials are:  
**Email: admin@admin.com**  
**Password: admin**  
From the admin panel, you can interact with the database and make any changes you want. This is also from where we will turn viewers into handlers

# Mockup Website  
FYI, I used AI to make a mockup website that demonstrtes the basic usage of the endpoints and token storage. It's all in a single index.html located in the root. Feed the file into any AI and it should be able to help explain whatever is happening.
Information regarding authentication and the endpoints is in the word document located at the root.

