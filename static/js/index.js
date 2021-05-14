
let nextPage = null;
let ApiDone = true;
let searchBtn = document.querySelector('#searchBtn');

// import checkSignin from "./checkSignin.js";
import { checkSignin } from './checkSignin.js';

// model
function getAttractions(page = 0) {
    let api = "";
    let keyword = document.getElementById('keywordInput').value;
    let mainList = document.querySelector('.mainList');

    //判斷使用的api
    if (keyword) {
        api = `/api/attractions?page=${page}&keyword=${keyword}`;
    }
    else {
        api = `/api/attractions?page=${page}`;
    }

    fetch(api)
        .then(response => response.json())
        .then(data => {

            //記錄頁數相關資訊及資料筆數
            nextPage = data.nextPage;
            let dataLen = data.data.length;
            //page=0 將原本存在的內容都刪除 重新render
            if (page == 0 && dataLen) {
                while (mainList.firstChild) {
                    mainList.removeChild(mainList.firstChild);
                }
            }
            //dataLen為0 等於search不到關鍵字
            if (!dataLen) {
                alert('請嘗試其他關鍵字')
            }
            else {
                data.data.forEach(attraction => {
                    createMainList(mainList, attraction);
                })
            }

            ApiDone = true;
        })
}




// view
//新增li函式
function createMainList(mainList, attraction) {
    //DOM
    let li = document.createElement('li');
    let a = document.createElement('a');
    let img = document.createElement('img');
    let h3 = document.createElement('h3');
    let mainListInfo = document.createElement('div');
    mainListInfo.classList.add("mainListInfo")
    let mrt = document.createElement('p');
    let mrtText = document.createTextNode(attraction.mrt ? attraction.mrt : "無");
    let category = document.createElement('p');
    let categoryText = document.createTextNode(attraction.category)
    let title = document.createTextNode(attraction.name)

    img.setAttribute('src', attraction.images[0]);
    h3.appendChild(title);
    mrt.appendChild(mrtText);
    category.appendChild(categoryText);
    mainListInfo.appendChild(mrt);
    mainListInfo.appendChild(category);
    a.setAttribute('href', `/attraction/${attraction.id}`);
    a.appendChild(img);
    a.appendChild(h3);
    a.appendChild(mainListInfo);
    li.appendChild(a);
    mainList.appendChild(li);
}


// controller
function init() {
    checkSignin();
    getAttractions();
}

//點擊觸發搜尋事件 nextPage=0 代表第一頁 ps. 每次搜尋都從第0頁開始
searchBtn.addEventListener('click', function () {
    ApiDone = false;
    getAttractions(nextPage = 0)
});


//Infinite scroll 偵錯滾動
window.onscroll = function () {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) {
        if (ApiDone && nextPage !== null) {
            ApiDone = false;
            getAttractions(nextPage)
        }
    }
}

init();





