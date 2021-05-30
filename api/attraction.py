from flask import Blueprint, request, jsonify
from pool import connection_pool, closeConnect

attractionAPI = Blueprint('attractionAPI', __name__)


@attractionAPI.route("/api/attractions")
def getAttractions():
	mydb = connection_pool.get_connection()
	#將sql指令取得的資料 由tuple改成dict
	mycursor = mydb.cursor(dictionary=True)
	try:
		if mydb.is_connected():
			#取出query string
			qsPage =request.args.get("page")
			qsKeyword =request.args.get("keyword")

		try:
			#取得資料長度 
			dataLen = 0
			if(not qsKeyword):
				mycursor.execute("SELECT count(*) FROM attractions")
				dataLen = mycursor.fetchone()["count(*)"]
			else:
				mycursor.execute(f"SELECT count(*)  FROM attractions WHERE name LIKE '%{qsKeyword}%'")
				dataLen = mycursor.fetchone()["count(*)"]
				
			#判斷是否有關鍵字查詢
			if(qsKeyword):
				mycursor.execute(f"SELECT *  FROM attractions WHERE name LIKE '%{qsKeyword}%' limit { int(qsPage)*12 }, 12")
			elif(not qsKeyword):
				mycursor.execute(f"SELECT * FROM attractions  limit { int(qsPage)*12 }, 12")

			result = mycursor.fetchall()
			
			responseData={}
			data = []

			#依照response格式存放資料並在for迴圈結束後return
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
			
			#判斷是否有下一頁 並將結果存放至responseData['nextPage']中準備return
			if((int(qsPage)+1) * 12 > dataLen):
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
	finally:
		closeConnect(mydb, mycursor)
	


@attractionAPI.route("/api/attraction/<attractionId>")
def getAttraction(attractionId):


	mydb = connection_pool.get_connection()
	#將sql指令取得的資料 由tuple改成dict
	mycursor = mydb.cursor(dictionary=True)
	try:
		if mydb.is_connected():
			responseData = {}
			try:
				#join 資料及資料照片資料表 當id=網址參數才被join 其餘資料table 為 null 取出不為null的cloumn 
				mycursor.execute(f"SELECT  img_url FROM attractions A  LEFT JOIN attractions_img B  ON A.id = B.id  and A.id={attractionId} WHERE B.img_url IS NOT NULL")
				imgResult = mycursor.fetchall()
				imgArray=[]
				for img in imgResult:
					imgArray.append(img["img_url"])

				#取得指定id的資料 依照指定格式將資料存放至responseData 準備return
				mycursor.execute(f"SELECT * FROM attractions WHERE id = {attractionId}")
				result = mycursor.fetchone()
				responseData["data"] = result
				responseData["data"]["images"] = imgArray

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
	finally:
		# closing database connection.
		closeConnect(mydb, mycursor)



