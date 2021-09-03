from flask import Blueprint, request, jsonify, session
import requests
import json
import datetime;
import os
from dotenv import load_dotenv

from pool import connection_pool, closeConnect

load_dotenv()
orderAPI = Blueprint('order', __name__)

@orderAPI.route('/api/order', methods=["GET"])
def order():

    user = session.get("user")
    if not user:
        return jsonify({
            "error": True,
            "message": "未登入系統，拒絕存取"
        }), 403
    
    mydb = connection_pool.get_connection()
    mycursor = mydb.cursor(dictionary=True)
    number = request.args.get("number")
    try:
        if mydb.is_connected():
            
            orderDataSQL = f"""SELECT  number, orders.phone, orders.name, orders.email, status,  price, date, time, recTradeId,
                                    attractions.id,  attractions.name as attraction_name, attractions.address, attractions_img.img_url
                                FROM orders
                                JOIN attractions ON orders.attraction_id = attractions.id
                                JOIN attractions_img ON orders.attraction_id = attractions_img.id
                                JOIN users ON orders.user_id = users.id
                                WHERE orders.number = {number} AND orders.user_id = {user['id']} limit 1;
                            """
            # 避免queryString包含非數字會出現錯誤
            try:
                mycursor.execute(orderDataSQL)
                responseData = mycursor.fetchone()
            except:
                return jsonify({
                    "data": None
                })

            if responseData:
                return jsonify({
                    "data": {
                        "number": responseData["number"],
                        "recTradeId": responseData["recTradeId"],
                        "price":  responseData["price"],
                        "trip": {
                        "attraction": {
                            "id": responseData["id"],
                            "name": responseData["attraction_name"],
                            "address": responseData["address"],
                            "image": responseData["img_url"]
                        },
                        "date": responseData["date"],
                        "time": responseData["time"]
                        },
                        "contact": {
                            "name":  responseData["name"],
                            "email": responseData["email"],
                            "phone": responseData["phone"]
                        },
                        "status": responseData["status"]
                    }
                })
            else:
                return jsonify({
                    "data": None
                })
    finally:
        closeConnect(mydb, mycursor)



@orderAPI.route('/api/orders', methods=["POST"])
def orders():

    
    user = session.get("user")
    if not user:
        return jsonify({
            "error": True,
            "message": "未登入系統，拒絕存取"
        }), 403

    mydb = connection_pool.get_connection()
    mycursor = mydb.cursor(dictionary=True)
    try:
        if mydb.is_connected():
            
            frontEndData = request.get_json()
            timestamp = int(datetime.datetime.now().timestamp())
            
            phone = frontEndData["order"]["contact"]["phone"]
            name = frontEndData["order"]["contact"]["name"]
            email = frontEndData["order"]["contact"]["email"]
            
           
            if not phone or not name or not email:
                return jsonify({
                        "error": True,
                        "message": "聯絡資訊不完全，付費流程失敗"
                    }), 400
            # 新增order 
            try:         
                sql = f"""
                        INSERT INTO orders SET
                        user_id = {user["id"]},
                        attraction_id = {frontEndData["order"]["trip"]["attraction"]["id"]},

                        phone = '{phone}',
                        name  = '{name}',
                        email = '{email}',

                        number ='{timestamp}',
                        date = '{frontEndData["order"]["trip"]["date"]}',
                        time = '{frontEndData["order"]["trip"]["time"]}',
                        price ={frontEndData["order"]["price"]},
                        status = 1
                """
                mycursor.execute(sql) 
                mydb.commit()
            except: 
                return jsonify({
                        "error": True,
                        "message": "建立訂單失敗"
                    }), 400

            #付款      
            try:
                url = 'https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime'
                requestHeaders = {
                    'Content-Type': 'application/json',
                    'x-api-key': 'partner_DjKyVCcmswmRao7HqsuTJG8ptWeq8ichqSEJJElaDMTwlFRNLe7CgtiV'     
                }
                values ={
                    "prime": frontEndData["prime"],
                    "partner_key": os.getenv("TAPPAY_PARTNER_KEY"),
                    "merchant_id": "aru0828_CTBC",
                    "details":"TapPay Test",
                    "amount": frontEndData["order"]["price"],
                    "cardholder": {
                        "phone_number": frontEndData["order"]["contact"]["phone"],
                        "name": frontEndData["order"]["contact"]["name"],
                        "email": frontEndData["order"]["contact"]["email"],
                    },
                    "remember": True
                }
                requestData = json.dumps(values)
                response = requests.post(url, data = requestData, headers = requestHeaders)
                result = response.json()
    
                if not result["status"]:
                    print(result["rec_trade_id"])
                     
                    updatePayStatus =   f"UPDATE orders SET orders.status = 0, orders.recTradeId = '{result['rec_trade_id']}'  WHERE orders.number = {timestamp}"
                    mycursor.execute(updatePayStatus)
                    mydb.commit()
                    deleteBookingsSQL = f"DELETE FROM bookings WHERE bookings.user_id = {user['id']}"
                    mycursor.execute(deleteBookingsSQL)
                    mydb.commit()
                    return jsonify({
                        "data": {
                            "number": timestamp,
                            "payment": {
                                "status": 0,
                                "message": "付款成功"
                            }
                        }
                    }), 200
                else:
                    return jsonify({
                        "data": {
                            "number": timestamp,
                            "payment": {
                                "status": 1,
                                "message": "付款失敗"
                            }
                        }
                    })
            except:
                return jsonify({
                    "error": True,
                    "message": "伺服器內部錯誤"
                }), 500
    finally:
        closeConnect(mydb, mycursor)




@orderAPI.route('/api/orders', methods=["PATCH"])
def refundOrder():
    frontData = request.get_json()

    url = 'https://sandbox.tappaysdk.com/tpc/transaction/refund'
    requestHeaders = {
        'Content-Type': 'application/json',
        'x-api-key': 'partner_DjKyVCcmswmRao7HqsuTJG8ptWeq8ichqSEJJElaDMTwlFRNLe7CgtiV'     
    }
    requestData = {
        "partner_key": os.getenv("TAPPAY_PARTNER_KEY"),
        "rec_trade_id": frontData['recTradeId'],
    }
    requestData = json.dumps(requestData)
   
    
    response = requests.post(url, data = requestData, headers = requestHeaders)
    result = response.json()

    if(not result['status']):
        mydb = connection_pool.get_connection()
        mycursor = mydb.cursor(dictionary=True)
       

        try:
            if mydb.is_connected():
                # 退款成功 將order status改為3
                changeOrderStatus = f"""
                                    UPDATE orders set
                                    status = 3
                                    WHERE recTradeId = '{frontData['recTradeId']}'
                                """
                
                mycursor.execute(changeOrderStatus)
                mydb.commit()
                return jsonify({
                    "ok": True,
                    "message": "退款成功"
                }), 200
        finally:
            closeConnect(mydb, mycursor)
    else:
        return jsonify({
            "error": True,
            "message": "退款流程失敗"
        }), 500
   
    

