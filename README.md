Go to board_backend folder in cmd. The manage.py file should be inside this folder. 
From cmd, type: python manage.py runserver
This will start the server and generate a link like this:

![image](https://github.com/user-attachments/assets/c141bcdd-50fe-415c-b0d6-6c975e98003d)

All the endpoints like /api/ will come after the link that is generated: http://127.0.0.1:8000/

So, for example, to get all events, we would send a GET request on http://127.0.0.1:8000/api/events/

To access the admin panel, go to http://127.0.0.1:8000/admin/
The credentials are:

Username: admin  
Password: 123456

This is the superuser view and from this view, we can make specific users handlers
