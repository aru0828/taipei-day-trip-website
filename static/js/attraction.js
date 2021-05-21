
let currentImgId = 0;
let carouselLen = 0;
let data;
let cost = document.querySelector('.cost');

import { checkSignin } from "./checkSignin.js";

//Model
function getAttraction() {
    // 取得網址中的id參數
    let url = window.location.pathname.split("/");
    let id = url[url.length - 1];
    let api = `/api/attraction/${id}`;

    return fetch(api).then(response => {
        return response.json()
    })
        .then(attraction => {
            data = attraction;
        })
}
function changeImgId(n, mode = "prevNext") {
    switch (mode) {
        case 'prevNext':
            currentImgId += n;
            // 圖片循環判斷
            if (currentImgId >= carouselLen) {
                currentImgId = 0;
            }
            else if (currentImgId == -1) {
                currentImgId = carouselLen - 1;
            }
            break;
        case 'dot':
            currentImgId = n;
            break;
    }
}

//View
function renderAttraction() {

    // input date 不能選擇之前的日期
    const date = document.getElementById('date');
    let d = new Date();
    let minDate =`${d.getFullYear()}-0${d.getMonth()+1}-${d.getDate()}`;
    date.setAttribute("min", minDate);


    // 選取輪播區塊父層元素
    const carouselContainer = document.querySelector('.carouselContainer');
    const dotContainer = document.querySelector('.dotContainer');
    // 選取標籤 依照data資料放入文字內容
    const title = document.querySelector('.title');
    const info = document.querySelector('.info');
    const description = document.querySelector('.description');
    const contentAddress = document.querySelector('.contentAddress');
    const transport = document.querySelector('.transport');
    data.data.images.forEach((imgUrl, index) => {
        let img = document.createElement('img');
        let carousel = document.createElement('div');
        let dot = document.createElement('span');
        carousel.classList.add('carousel');
        img.setAttribute('src', imgUrl);
        carousel.appendChild(img);
        dot.classList.add('dot');
        // 預設第一個元素為active
        if (!index) {
            carousel.classList.add('active');
            dot.classList.add('active');
        }
        dot.onclick = function () {
            dotClick(index);
        };
        carouselContainer.insertBefore(carousel, document.querySelector('.prev'));
        dotContainer.appendChild(dot)

        carouselLen = document.querySelectorAll('.carousel').length;
    })
    // 上面訂購表單文字
    info.appendChild(document.createTextNode(`${data.data.category} at ${data.data.mrt}`))
    title.appendChild(document.createTextNode(`${data.data.name}`));
    // 下方文字介紹區塊
    description.appendChild(document.createTextNode(`${data.data.description}`));
    contentAddress.appendChild(document.createTextNode(`${data.data.address}`));
    transport.appendChild(document.createTextNode(`${data.data.transport}`));
}

//切換輪播圖片
function changeImg() {
    let carouselList = document.querySelectorAll('.carousel');
    let currentCarousel = document.getElementsByClassName('carousel active');
    let dotList = document.querySelectorAll('.dot');
    let currentDot = document.getElementsByClassName('dot active');

    currentCarousel[0].classList.remove('active');
    currentDot[0].classList.remove('active');

    carouselList[currentImgId].classList.add('active');
    dotList[currentImgId].classList.add('active');

}

// 依照選擇導覽時間決定價格
function changeCost(price) {
    cost.textContent = `新台幣 ${price} 元`;
}

//Contorller
function init() {
    checkSignin();
    getAttraction().then(() => {
        renderAttraction();
    });

}

function prevOrNext(n) {
    changeImgId(n)
    changeImg();
}

function dotClick(n) {
    changeImgId(n, "dot")
    changeImg();
}

function submitOrderForm(){

    
    checkSignin().then(result => {
        // 確定使用者登入中才呼叫api
        if (result.data) {
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

            fetch(api, 
                {
                    method:'POST',
                    body:formData
                })
                .then(response =>  response.json())
                .then(result => {  
                    if(result.ok){
                        alert('新增成功');
                        window.location.href = "/booking";
                    }
                })
        }
        else{
            // 未登入 開啟登入modal
            openModal();
        }
    })
    
}


// 監聽事件
document.querySelector('.prev').addEventListener("click", function () {
    prevOrNext(-1)
});

document.querySelector('.next').addEventListener("click", function () {
    prevOrNext(1)
});

// 監聽time radio 
document.querySelectorAll('.timeRadio').forEach(radio => {
    radio.addEventListener('click', function(e){
        let price = e.target.value === 'morning' ? 2000 : 2500;
        changeCost(price);
    })
})

document.querySelector('.orderForm').addEventListener('submit', function(e){
    e.preventDefault();
    submitOrderForm();
})

init();