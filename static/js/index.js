import { checkSignin } from './checkSignin.js';


let searchBtn = document.querySelector('#searchBtn');

let PorxyLoading = new Proxy({isLoading : 'open'}, {
    set: function(obj, prop, value) {
        document.querySelector('.loading').classList.toggle('active');
        return obj[prop] = value;
    }
});

let model = {
    nextPage : 0,
    ApiDone : true,
    keyword:"",
    data:[],
    getAttractions : function(){
        model.ApiDone = false;
        let api = "";
        
        //判斷使用的api
        if (model.keyword) {
            api = `/api/attractions?page=${model.nextPage}&keyword=${model.keyword}`;
        }
        else {
            api = `/api/attractions?page=${model.nextPage}`;
        }
        
        return fetch(api)
        .then(response => response.json())
        .then(data => {
            model.nextPage = data.nextPage;
            model.data = data.data;
            model.ApiDone = true;
        })
        
        
    },
    removeData : function(){
        model.data = [];
        model.keyword = "";
    },
    getKeyword : function(){
        let keyword = document.getElementById('keywordInput').value;
        model.keyword = keyword;
        model.nextPage = 0;
    },
}


let view = {
    mainList : document.querySelector('.mainList'),
    frag : document.createDocumentFragment(),

    createFrag: function(attraction) {
    //DOM
    let li = document.createElement('li');
    let a = document.createElement('a');
    let imgContainer = document.createElement('div');
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
    // 
    imgContainer.appendChild(img);
    h3.appendChild(title);
    mrt.appendChild(mrtText);
    category.appendChild(categoryText);
    mainListInfo.appendChild(mrt);
    mainListInfo.appendChild(category);
    a.setAttribute('href', `/attraction/${attraction.id}`);
    // 
    a.appendChild(imgContainer);
    a.appendChild(h3);
    a.appendChild(mainListInfo);
    li.appendChild(a);
    view.frag.appendChild(li);
    },

    renderFrag(frag){
        view.mainList.appendChild(frag);
    },

    removeChild : function(parentNode, childNode){
        while (parentNode.firstChild) {
            parentNode.removeChild(parentNode.firstChild);
        }
    },

    alertMessage(message){
        alert(message);
    }
}


let controller = {
    init :  function() {
        checkSignin();
        controller.getData();
    },

    getData : async function(isKeyword){

        if(model.nextPage !== null){
            PorxyLoading.isLoading = 'open';
            await model.getAttractions(model.nextPage);
        }
        // nextPage=null等於沒有資料了
        else if (model.nextPage === null){
            model.removeData();
        }
            
        // 關鍵字處理
        if(model.keyword && !model.data.length){
            view.alertMessage("請輸入其他關鍵字");
        }
        else if(isKeyword){
            view.removeChild(view.mainList);
        }
        model.data.forEach(attraction => {
            view.createFrag(attraction);
        });
        view.renderFrag(view.frag);
        PorxyLoading.isLoading = 'close';

    },

    getKeyword : function(){
       model.getKeyword();
    }
}


//點擊觸發搜尋事件
searchBtn.addEventListener('click', function () {
    controller.getKeyword();
    controller.getData(true);
});



//Infinite scroll 偵錯滾動
window.onscroll = function () {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) {
        if (model.ApiDone && model.nextPage) {
            controller.getData()
        }
    }
}

controller.init();













