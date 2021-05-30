from flask import Blueprint, request, jsonify, session;
from pool import connection_pool, closeConnect

memberAPI = Blueprint("memberAPI", __name__)

@memberAPI.route("/api/member", methods=["GET"])
def historyOrder():
    user = session.get("user")
    
    if not user:
        return jsonify({
            "error": True,
            "message": "自未登入系統，拒絕存取"
        }), 403


    try:
        mydb = connection_pool.get_connection()
        mycursor = mydb.cursor(dictionary=True)
        
        if mydb.is_connected():
            sql = f"""SELECT  * FROM orders 
                        JOIN attractions ON orders.attraction_id = attractions.id
                        WHERE user_id = {user['id']}
                        ORDER BY order_id desc    
                    """
            mycursor.execute(sql)
            result = mycursor.fetchall()
            return jsonify({
                'data':result
            })

    finally:
        closeConnect(mydb, mycursor)