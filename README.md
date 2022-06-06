# AeferMarketWebApplication
This project was developed for Western Governors Univerity's B.S. Computer Science capstone. The goal of the project
was to display a company's sales data in an easy to interpret manner and provide predictions on category sales.
Data: https://www.kaggle.com/datasets/aungpyaeap/supermarket-sales
## Details
A web application written in Python, HTML5, and CSS. The application is accessed after logging in, setting appropriate
permissions througout the application's lifetime. After logging in, the user is redirected to a dashboard with
a pie graph showing quantity sold of each category, line chart of rating trends for each gender, and a bar chart
showing the gross income for each category. Below these charts, the user can choose to predict the sales of a
category on a branch. From this page, with the proper permission, the user can either go to page to create SQL
queries to directly view the data or view the logs for changes in the data and previous machine learning models
created.
## Implementation
This application uses a local MS SQL server, an example located in the files, for sales data and logins. The application
is run by having a machine run the files to create a server and server HTML pages to the browser. Currently, the application
uses localhost.
## Plans
* Change front end to use React and server the entire application upon website visit.
* Change backend to use Flask and function as a REST API
* Change the database to use a cloud database (SQL or NoSQL)
