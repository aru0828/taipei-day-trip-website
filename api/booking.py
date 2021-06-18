from flask import  request, Blueprint, jsonify, session
import datetime;
from pool import connection_pool, closeConnect
# import mysql.connector

# mydb = mysql.connector.connect(
#     host="localhost",
#     username="root",
#     # password='As5566&&',
#     password="122090513",
#     database="trip_website"
# )

# dictionary=True
# mycursor = mydb.cursor(dictionary=True)
bookingAPI = Blueprint("booking", __name__)

@bookingAPI.route("/api/booking", methods=['GET', 'POST', 'DELETE'])
def booking():

    mydb = connection_pool.get_connection()
    mycursor = mydb.cursor(dictionary=True)

    try:
        if mydb.is_connected():

            # 未登入時 return 403 error
            user = session.get("user")
            if not user:
                return jsonify({
                    "error": True,
                    "message": "未登入系統，拒絕存取"
                }), 403
            # 依照userid取得booking
            if request.method == 'GET':  
                
                # 將資料表join後取出要的column 並依照api格式response
                sql = f"""SELECT bookings.attraction_id, attractions.name, attractions.address,
                        attractions_img.img_url, bookings.date, bookings.time, bookings.price 
                        FROM bookings 
                        INNER JOIN attractions ON bookings.attraction_id = attractions.id 
                        INNER JOIN attractions_img ON attractions.id = attractions_img.id
                        WHERE bookings.user_id = {user['id']}  LIMIT 1"""

                mycursor.execute(sql)
                booking = mycursor.fetchone()
                if booking:
                    return jsonify({
                        "data": {
                            "attraction": {
                                "id": booking["attraction_id"],
                                "name": booking["name"],
                                "address": booking["address"],
                                "image": booking["img_url"]
                            },
                            "date": booking["date"],
                            "time": booking["time"],
                            "price": booking["price"]
                        }
                    }), 200
                else:
                    return jsonify({
                        "data":None
                    }), 200
            # 新增booking資料
            elif request.method == 'POST':
                
                getFrom = request.form.get
                attractionId = getFrom('attractionId')
                date = getFrom("date")
                time = getFrom("time")
                price = getFrom("price")

                # 驗證日期範圍為 今天起三個禮拜內且今天不可選
                today = datetime.date.today()
                dayEnd = today  + datetime.timedelta(days=21)
                if(today < datetime.date.fromisoformat(date) <= dayEnd):
                    
                    sql = f"SELECT * FROM bookings WHERE user_id = {user['id']}"
                    mycursor.execute(sql)
                    result = mycursor.fetchone()

                    if result:
                        sql = f"UPDATE bookings SET attraction_id = {attractionId}, date = '{date}', time = '{time}', price = {price} WHERE user_id = {user['id']}"
                    else:
                        sql = f"INSERT INTO bookings set attraction_id = {attractionId}, user_id = {user['id']}, date = '{date}', time = '{time}', price = {price}"

                    # 回傳response
                    try:
                        mycursor.execute(sql)
                        mydb.commit()
                        return jsonify({
                            "ok": True
                        }), 200   
                    except:
                        return jsonify({
                            "error": True,
                            "message": "建立失敗，輸入不正確或其他原因"
                        }), 400
                else:
                    return jsonify({
                            "error": True,
                            "message": "請依照規定選擇範圍內日期，今天起三個禮拜內且當天不可選"
                        }), 400
            
            # 刪除booking資料
            elif request.method == 'DELETE':
                sql = f"DELETE FROM bookings WHERE user_id = {user['id']}"
                try:
                    mycursor.execute(sql)
                    mydb.commit()
                    return jsonify({
                        "ok": True
                    }), 200
                except:
                    return jsonify({
                        "error": True,
                        "message": "刪除失敗"
                    }), 400
    finally:
        # closing database connection.
        closeConnect(mydb, mycursor)
    
    
        
