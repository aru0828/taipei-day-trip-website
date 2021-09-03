





import { checkSignin } from "./checkSignin.js";

let PorxyLoading = new Proxy({isLoading : 'open'}, {
    set: function(obj, prop, value) {
        document.querySelector('.loading').classList.toggle('active');
        document.querySelector('.attraction').classList.toggle('active');
        return obj[prop] = value;
    }
  });


//Model
let model = {
    currentImgId : 0,
    carouselLen : 0,
    price : 0,
    data : {},
    user:{},

    changePrice : function (price){
        model.price = price;
    },

    getAttraction : function () {
        // 取得網址中的id參數
        let url = window.location.pathname.split("/");
        let id = url[url.length - 1];
        let api = `/api/attraction/${id}`;
        return fetch(api).then(response => response.json())
                .then(attraction => {
                    model.data = attraction;
                })
    },

    submitBookingForm : function(){
           
        const api = '/api/booking'
        let formData = new FormData();
        // get attraction id
        let url = window.location.pathname.split("/");
        let id = url[url.length - 1]; 
        let date = document.getElementById('date').value;
        let time = document.querySelector('input[name=time]:checked').value;
        let price = time === 'morning' ? 2000 : 2500;
        formData.append("attractionId", id);
        formData.append("date", date);
        formData.append("time", time);
        formData.append("price", price);

        return fetch(api, 
                {
                    method:'POST',
                    body:formData
                })
                .then(response =>  response.json())
                .then(result   =>  result)
    },

    changeImgId : function (n, mode="prevNext") {
        switch (mode) {
            case 'prevNext':
                model.currentImgId += n;
                // 圖片循環判斷
                if (model.currentImgId >= model.carouselLen) {
                    model.currentImgId = 0;
                }
                else if (model.currentImgId == -1) {
                    model.currentImgId = model.carouselLen - 1;
                }
                break;
            case 'dot':
                model.currentImgId = n;
                break;
        }
    }
}



//View

let view = {

    cost : document.querySelector('.cost'),
    renderAttraction : function (name) {
        // input date 不能選擇之前的日期
        const date = document.getElementById('date');
        let d = new Date();

        let minMonth = d.getMonth()+1 < 10 ? `0${d.getMonth()+1}` : d.getMonth()+1;
        let Mindate = d.getDate()+1 < 10 ? `0${d.getDate()+1}` : d.getDate()+1;
        let min =`${d.getFullYear()}-${minMonth}-${Mindate}`;
        date.setAttribute("min", min);
     
        // 選取輪播區塊父層元素
        const carouselContainer = document.querySelector('.carouselContainer');
        const dotContainer = document.querySelector('.dotContainer');
        // 選取標籤 依照data資料放入文字內容
        const title = document.querySelector('.title');
        const info = document.querySelector('.info');
        const description = document.querySelector('.description');
        const contentAddress = document.querySelector('.contentAddress');
        const transport = document.querySelector('.transport');
        model.data.data.images.forEach((imgUrl, index) => {
            let img = document.createElement('img');
            let carousel = document.createElement('div');
            let dot = document.createElement('span');
            carousel.classList.add('carousel');
            img.setAttribute('src', imgUrl.replace('http:', 'https:'));
            carousel.appendChild(img);
            dot.classList.add('dot');
            // 預設第一個元素為active
            if (!index) {
                carousel.classList.add('active');
                dot.classList.add('active');
            }
            dot.onclick = function () {
                controller.dotClick(index);
            };
            carouselContainer.insertBefore(carousel, document.querySelector('.prev'));
            dotContainer.appendChild(dot)
    
            model.carouselLen = document.querySelectorAll('.carousel').length;
        })
        // 上面訂購表單文字
        info.appendChild(document.createTextNode(`${model.data.data.category} at ${model.data.data.mrt}`))
        title.appendChild(document.createTextNode(`${model.data.data.name}`));
        // 下方文字介紹區塊
        description.appendChild(document.createTextNode(`${model.data.data.description}`));
        contentAddress.appendChild(document.createTextNode(`${model.data.data.address}`));
        transport.appendChild(document.createTextNode(`${model.data.data.transport}`));
    },

    //切換輪播圖片
    changeImg : function () {
        let carouselList = document.querySelectorAll('.carousel');
        let currentCarousel = document.getElementsByClassName('carousel active');
        let dotList = document.querySelectorAll('.dot');
        let currentDot = document.getElementsByClassName('dot active');

        currentCarousel[0].classList.remove('active');
        currentDot[0].classList.remove('active');

        carouselList[model.currentImgId].classList.add('active');
        dotList[model.currentImgId].classList.add('active');
    },
    renderPrice : function() {
        view.cost.textContent = `新台幣 ${model.price} 元`;
    },

    alertMessage(message){
        alert(message);
    },

    redirectURL(url){
        window.location.href = url;      
    },

}

//Contorller

let controller = {
    init : async function() {
        PorxyLoading.isLoading = 'open';
        await checkSignin();
        await model.getAttraction();
        view.renderAttraction();
        PorxyLoading.isLoading = 'close';
    },

    prevOrNext : function(n) {
        model.changeImgId(n)
        view.changeImg();
    },

    dotClick : function(n) {
        model.changeImgId(n, "dot")
        view.changeImg();
    },

    changePrice(price){
        model.changePrice(price);
        view.renderPrice();
    },
    
    
    
    submitBookingForm :　async function (){
        let user = await checkSignin();  
        // 確定使用者登入中才呼叫api
        if(user.data){
            let result = await model.submitBookingForm();
            if(result.ok){
                view.alertMessage('新增成功');
                view.redirectURL("/booking");
            }
            else{
                view.alertMessage(result.message);
            }
        }
        else{
            openModal();
        }             
    } 
}


// 監聽事件
document.querySelector('.prev').addEventListener("click", function () {
    controller.prevOrNext(-1)
});

document.querySelector('.next').addEventListener("click", function () {
    controller.prevOrNext(1)
});

// 監聽time radio 
document.querySelectorAll('.timeRadio').forEach(radio => {
    radio.addEventListener('click', function(e){
        let price = e.target.value === 'morning' ? 2000 : 2500;
        controller.changePrice(price);
    })
})

document.querySelector('.orderForm').addEventListener('submit', function(e){
    e.preventDefault();
    controller.submitBookingForm();
})

controller.init();