
# pool 
from mysql.connector import Error
from mysql.connector import pooling

connection_pool = pooling.MySQLConnectionPool(pool_name="trip_pool",
                                                  pool_size=5,
                                                  pool_reset_session=True,
                                                  host='localhost',
                                                  database='trip_website',
                                                  user='root',
                                                  password='122090513')

def closeConnect(mydb, mycursor):
    if mydb.is_connected():
        mycursor.close()
        mydb.close()

# try:
#     # Get connection object from a pool
#     connection_object = connection_pool.get_connection()

#     if connection_object.is_connected():
#         db_Info = connection_object.get_server_info()
#         print("Connected to MySQL database using connection pool ... MySQL Server version on ", db_Info)

#         cursor = connection_object.cursor(dictionary=True)
#         cursor.execute("select * from users;")
#         record = cursor.fetchone()
#         print("Your connected to - ", record)

# # except Error as e:
#     print("Error while connecting to MySQL using Connection pool ")
# finally:
#     # closing database connection.
#     if connection_object.is_connected():
#         cursor.close()
#         connection_object.close()
#         print("MySQL connection is closed")



# mydb = connection_pool.get_connection()
# 	#將sql指令取得的資料 由tuple改成dict
# 	mycursor = mydb.cursor(dictionary=True)
# 	try:
# 		if mydb.is_connected():
# 			......
# 	finally:
# 		# closing database connection.
# 		closeConnect(mydb, mycursor)



# 原本連接資料庫
# mydb = mysql.connector.connect(
# 	host='localhost',
# 	username='root',
# 	# password='As5566&&',
# 	password='122090513',
# 	database='trip_website'
# )