from flask import Flask,request, jsonify, render_template, Blueprint

from api.attraction import attractionAPI
from api.user import userAPI
from api.booking import bookingAPI
from api.order import orderAPI
from api.member import memberAPI
from dotenv import load_dotenv
import os
load_dotenv()

# #將sql指令取得的資料 由tuple改成dict
# mycursor = mydb.cursor(dictionary=True)
app=Flask(__name__)
app.register_blueprint(attractionAPI)
app.register_blueprint(userAPI)
app.register_blueprint(bookingAPI)
app.register_blueprint(orderAPI)
app.register_blueprint(memberAPI)
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


# 新增
@app.route("/member")
def memberOrder():
	return render_template("member.html")


app.run(host=os.getenv("HOST"), port=os.getenv("PORT"))
#host="0.0.0.0", 


