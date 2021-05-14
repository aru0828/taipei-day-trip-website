from flask import Flask,request, jsonify, render_template, Blueprint
from api.attraction import attractionAPI
from api.user import userAPI
import os


# import mysql.connector


# mydb = mysql.connector.connect(
# 	host='localhost',
# 	username='root',
# 	password='122090513',
# 	database='trip_website'
# )

# #將sql指令取得的資料 由tuple改成dict
# mycursor = mydb.cursor(dictionary=True)
app=Flask(__name__)
app.register_blueprint(attractionAPI)
app.register_blueprint(userAPI)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
app.config["JSON_SORT_KEYS"] = False
app.config['SECRET_KEY'] = os.urandom(24)

# Pages
@app.route("/")
def index():
	return render_template("index.html")
@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")
@app.route("/booking")
def booking():
	return render_template("booking.html")
@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")





app.run(host="0.0.0.0", port=3000)
#host="0.0.0.0", 


