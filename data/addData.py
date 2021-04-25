import mysql.connector
import json

mydb = mysql.connector.connect(
    host="localhost",
    user="root",
    password="As5566&&",
    database="trip_website"
)

mycursor = mydb.cursor()

with open("taipei-attractions.json",  'r', encoding="utf-8") as f:
    #取得JSON中我們需要的資料
    dataList = json.load(f)
    dataList = dataList["result"]["results"]

    #寫入SQL指令 搭配後面for迴圈
    sql = "INSERT INTO attractions (id, name, category, description, address, transport, mrt, latitude, longitude) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"

    for data in dataList:
        #將資料寫入attractions 資料表
        values = (data["_id"], data["stitle"], data["CAT2"], data["xbody"], data["address"], data["info"], data["MRT"], data["latitude"], data["longitude"])
        mycursor.execute(sql, values)
        mydb.commit()
        
        foreignKeyId = data["_id"]

        urlList = data["file"].split("http:")
        #將資料寫入attractions_img 資料表
        for urlStr in urlList:
            #排除副檔名不是jpg或png的網址
            if(urlStr.lower().endswith(('.jpg', '.png'))):
               imgsql = f"INSERT INTO attractions_img (img_url, id) VALUES ('http:{urlStr}', {foreignKeyId})"
               mycursor.execute(imgsql)
               mydb.commit()

  
