# AeferMarketWebApplication v2
This version of the project is being developed to revamp the original version into an end-to-end web application. The goal
of this version is to recreate the functionality of the original version in ReactJS and Flask, update the funcionality for
easier or more accurate use, improve performance, and update visuals.
Data: https://www.kaggle.com/datasets/aungpyaeap/supermarket-sales
## Details
The application is accessed after logging in, setting appropriate permissions througout the application's lifetime.
After logging in, the user is redirected to a dashboard with a pie graph showing quantity sold of each category,
line chart of rating trends for each gender, and a bar chart showing the gross income for each category. Below these
charts, the user can choose to predict the sales of a category on a branch. From this page, with the proper
permission, the user can either go to page to create SQL queries to directly view the data or view the logs for
changes in the data and previous machine learning models created.
## Implementation
This application will use a local database and move to a cloud SQL database. The front-end will use ReactJS to server
and the back-end will use Flask.
## Plans
* Change front end to use React and server the entire application upon website visit.
* Change backend to use Flask and function as a REST API
* Change the database to use a cloud database (SQL or NoSQL)
