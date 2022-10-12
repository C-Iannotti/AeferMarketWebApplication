# AeferMarketWebApplication v2
This version of the project is being developed to revamp the original version into an end-to-end web application. The goal
of this version is to recreate the functionality of the original version in ReactJS and Flask, update the funcionality for
easier or more accurate use, improve performance, and update visuals.
Data: https://www.kaggle.com/datasets/aungpyaeap/supermarket-sales
## Details
The application is accessed after logging in, setting appropriate permissions througout the application's lifetime.
After logging in, the user is redirected to a dashboard where they choose the branch, timeframe, and product lines
that the graphs should show. When submitting, it should show various kinds of graphs depending on the inputs; including
quantity and gross income pie charts, separated bar charts showing quantity sold for each categoy within a product line,
average rating each day over the period of time, quantity sold each day, and the quantity sold for each hour.
Along with these, the predictions for teh next day's sales are displayed with a gneralizaiton of either roughly the same,
up, or down. Using the header, a logged-in user can access, depending on permissions, ech other page. The Model page
provides a semi-automatic model and data creation to keep the model up-to-date with the current data. The Data page allows
users to view certain accessible tables sorted by given colums and matching given constraints. It also allows certain users
to update the Sales table in case corrections are necessary. The Logs page allows certain users to view pervious actions
made in the application. Finally, the header also allows the user to logout by either clicking their username or the arrow
next to it.
## Implementation
This application currently uses a local Postgres database and will move to a cloud-based one. The server uses Flask to serve
a front-end application and the front-end application is written in ReactJS.
## Plans
* Move server and database to the cloud (such as AWS)
* Update the model to give better accuracy
* Change the appearance of website to be more intuitive
