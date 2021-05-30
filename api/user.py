from flask import Blueprint, request, jsonify, redirect, url_for, session
from pool import connection_pool, closeConnect

userAPI = Blueprint('userAPI', __name__)

@userAPI.route('/api/user', methods=['GET', 'POST', 'PATCH', 'DELETE'])
def function():
    # 取得使用者資訊
    if request.method == 'GET':
        
        sessionUser = session.get("user")
        if sessionUser:
            return jsonify({"data":sessionUser}), 200
        else:
            return jsonify({
                    "data": None
                })
    # 註冊
    elif request.method == 'POST':    
        
        mydb = connection_pool.get_connection()
        mycursor = mydb.cursor(dictionary=True)
                
        try:
            if mydb.is_connected():
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
                    return jsonify({
                        "error": True,
                        "message": "Email已經被註冊"
                    }), 400
            except:
                return jsonify({
                    "error": True,
                    "message": "程式內部錯誤"
                }), 500 
        finally:
            # closing database connection.
            closeConnect(mydb, mycursor)
        
       
    #登入
    elif request.method == 'PATCH':
 
        mydb = connection_pool.get_connection()
        #將sql指令取得的資料 由tuple改成dict
        mycursor = mydb.cursor(dictionary=True)
        try:
            if mydb.is_connected():
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
        finally:
            # closing database connection.
            closeConnect(mydb, mycursor)
        
    #登出
    elif request.method == 'DELETE':
        session["user"] = False
        return jsonify({
            "ok":True
        })