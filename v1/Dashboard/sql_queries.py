#branch
latest_sales_query = '''SELECT Product_Line as 'Product Line', sum(Quantity) as Quantity
            FROM Sales
            WHERE Branch = '%s' AND Product_Line is not Null AND DATEDIFF(day, Date, (SELECT max(Date) FROM Sales)) < 30
            GROUP BY Product_Line
            ORDER BY Product_Line'''

#branch
monthly_income_query = '''SELECT CAST(YEAR(Date) AS VARCHAR(4)) + '-' + CAST(MONTH(Date) AS VARCHAR(2)) AS Month, Product_Line as 'Product Line', sum(Gross_Income) as 'Gross Income'
            FROM Sales
            WHERE Branch = '%s' AND Product_Line is not Null AND Date is not Null
            GROUP BY CAST(YEAR(Date) AS VARCHAR(4)) + '-' + CAST(MONTH(Date) AS VARCHAR(2)), Product_Line
            ORDER BY Month, Product_Line'''

#earliest_date, branch, earliest_date, earliest_date
gendered_rating_query = '''SELECT Gender, DATEDIFF(day, '%s', Date) as Day, avg(Rating) as Rating
                FROM Sales
                WHERE Date is not Null AND Branch = '%s'
                GROUP BY Gender, DATEDIFF(day, '%s', Date)
                HAVING count(DATEDIFF(day, '%s', Date)) > 1
                ORDER BY Gender, Day'''

#earliest_date, date, branch, product_line, earliest_date
demand_query = '''SELECT DATEDIFF(day, '%s', Date) as Day, sum(Quantity) as Demand
             FROM Sales
             WHERE Date >= '%s' AND Date < '%s' AND Branch='%s' AND Product_Line = '%s'
             GROUP BY DATEDIFF(day, '%s', Date)
             ORDER BY Day'''

#username, password
login_query = '''SELECT Username, Password, View_Data, Edit_Data, View_Logs, View_Edit_Logins
            FROM Logins
            WHERE Username = %s AND Password = %s'''

earliest_date_query = 'SELECT min(Date) FROM Sales'
check_prediction_query = 'SELECT Date FROM Prediction_Log WHERE Date = %s and Product_Line = %s and Location = %s'
product_lines_query = 'SELECT DISTINCT Product_Line FROM Sales WHERE Product_Line is not Null ORDER BY Product_Line'
branch_query = 'SELECT DISTINCT Branch, City FROM Sales ORDER BY Branch'
basic_query = 'SELECT %s FROM %s'

#username, time, successful
update_login_log = 'INSERT INTO Login_Log ("User", Time, Successful) VALUES (%s, %s, %s)'

#location, product_line, date, evs, r2, mae
update_prediction_log = '''INSERT INTO Prediction_Log (Location, Product_Line, Date, evs, r2, mae)
            VALUES (%s, %s, %s, %s, %s, %s)'''

#username, time, rows_affected
update_query_log = 'INSERT INTO Query_Log ("User", Time, Rows_Affected) VALUES (%s, %s, %s)'