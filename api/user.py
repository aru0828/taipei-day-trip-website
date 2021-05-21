from flask import Blueprint, request, jsonify, redirect, url_for, session
import mysql.connector


mydb = mysql.connector.connect(
	host='localhost',
	username='root',
	password='As5566&&',
    # password='122090513',
	database='trip_website'
)

mycursor = mydb.cursor(dictionary=True)
userAPI = Blueprint('userAPI', __name__)

@userAPI.route('/api/user', methods=['GET', 'POST', 'PATCH', 'DELETE'])
def function():
    # 取得使用者資訊
    if request.method == 'GET':
        
        sessionEmail = session.get("user")
        user = None
        
        if sessionEmail:
            sessionEmail = sessionEmail["email"]
            sql = f"SELECT * FROM users WHERE email = '{sessionEmail}'"
            mycursor.execute(sql)
            user = mycursor.fetchone()

        if user:
            return jsonify({
                    "data": {
                        "id": user["id"],
                        "name": user["name"],
                        "email": user["email"]
                    }
                }), 200
        else:
            return jsonify({
                    "data": None
                })
        
    # 註冊
    elif request.method == 'POST':    
        name  = request.form.get('name')
        email = request.form.get('email')
        password = request.form.get('password')
        sql = f"SELECT * FROM users WHERE email = '{email}'"
        mycursor.execute(sql)
        result = mycursor.fetchone()

        if not name or not email or not password:
            return
        
        try:
            # 判斷帳號未被註冊 且 欄位都有填寫 就 註冊
            if(not result):
                sql = f"INSERT INTO users set name = '{name}', email = '{email}', password = '{password}'"
                mycursor.execute(sql)
                mydb.commit()
                return jsonify({
                'ok':True
                }), 200
            else:
                return jsonify(
                    {
                        "error": True,
                        "message": "Email已經被註冊"
                    }
                ), 400
        except:
            return jsonify(
                    {
                        "error": True,
                        "message": "程式內部錯誤"
                    }
                 ), 500 
       
    #登入
    elif request.method == 'PATCH':
        email = request.form.get('email')
        password = request.form.get('password')
        
        
        sql = f"SELECT * FROM users WHERE email = '{email}' AND password = '{password}'"
        mycursor.execute(sql)
        user = mycursor.fetchone()

        try:
            if user:
                session["user"] = { "id" : user["id"], "email" : user['email'], "name" : user['name'] }
                return jsonify(
                    {
                        "ok": True
                    }
                ), 200
            else:
                return jsonify({
                    "error":True,
                    "message":"帳號或密碼錯誤"
                }), 400
        except:
            return jsonify({
                    "error":True,
                    "message":"伺服器錯誤"
                }), 500
    #登出
    elif request.method == 'DELETE':
        session["user"] = False
        return jsonify({
            "ok":True
        })