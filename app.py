from flask import Flask,request, jsonify
import mysql.connector


mydb = mysql.connector.connect(
	host='localhost',
	username='root',
	password='As5566&&',
	database='trip_website'
)

mycursor = mydb.cursor(dictionary=True)

app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
app.config["JSON_SORT_KEYS"] = False

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



#api
@app.route("/api/attractions")
def getAttractions():
	#取出query string
	qsPage =request.args.get("page")
	qsKeyword =request.args.get("keyword")

	try:
		#取得資料長度 
		mycursor.execute("SELECT count(*) FROM attractions")
		dataLen = mycursor.fetchone()["count(*)"]

		#判斷是否有關鍵字查詢 未完成
		if(qsKeyword):
			mycursor.execute(f"SELECT *FROM attractions WHERE name LIKE '%{qsKeyword}%'")
		elif(not qsKeyword):
			mycursor.execute(f"SELECT * FROM attractions WHERE id > 12*{int(qsPage)-1} limit 12")

		result = mycursor.fetchall()
		responseData={}
		data = []

		for attraction in result:
			#取得img table中對應id的圖片網址 存放到list中
			mycursor.execute(f"SELECT img_url FROM attractions LEFT JOIN attractions_img ON attractions.id = attractions_img.id WHERE attractions.id = {attraction['id']}")
			result = mycursor.fetchall()
			imgArray=[]
			for img in result:
				imgArray.append(img["img_url"])

			#將要response的資料存放到data list中
			data.append({
					'id':attraction["id"],
					'name':attraction["name"],
					'category':attraction["category"],
					'description':attraction["description"],
					'address':attraction["address"],
					'transport':attraction["transport"],
					'mrt':attraction["mrt"],
					'latitude':attraction["latitude"],
					'longitude':attraction["longitude"],
					'images':imgArray
			})
		#依照response格式存放資料並在for迴圈結束後return
		if((int(qsPage)+1) * 12 > dataLen or qsKeyword):
			responseData['nextPage'] = None
		else:
			responseData['nextPage'] = int(qsPage)+1
		responseData['data'] = data	

		return jsonify(responseData), 200
	except:

		return jsonify(
			{
				"error": True,
 			    "message": "資料讀取錯誤"
			}
		), 500

@app.route("/api/attraction/<attractionId>")
def getAttraction(attractionId):
	print(attractionId)
	responseData = {}
	try:
		mycursor.execute(f"SELECT  img_url FROM attractions A  LEFT JOIN attractions_img B  ON A.id = B.id  and A.id={attractionId} WHERE B.img_url IS NOT NULL")
		imgResult = mycursor.fetchall()
		imgArray=[]
		for img in imgResult:
			imgArray.append(img["img_url"])
		mycursor.execute(f"SELECT * FROM attractions WHERE id = {attractionId}")
		result = mycursor.fetchone()

		responseData["data"] = result
		responseData["images"] = imgArray

		if(responseData["data"] == None):
			return jsonify({
				"error": True,
				"message": "景點編號錯誤"
			}), 400
		return jsonify(responseData), 200
	except:
		return  jsonify({
		 	"error": True,
 			"message": "伺服器內部錯誤"
		}), 500

app.run(host="0.0.0.0", port=3000)
