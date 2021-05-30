import { checkSignin } from "./checkSignin.js";


let url = new URL(window.location.href)
let qsNumber = url.searchParams.get("number")
let orderData ={}

function getOrder(){
     return fetch(`/api/order?number=${qsNumber}`)
    .then(response => response.json())
    .then(result => {
        if(!result.data){
            location.href="/";
        }
        orderData = result;
    })
}

function renderOrder(){
    let time="";;
    let status="";

    orderData.data.trip.time === 'morning' ? time ='早上 9 點到下午 4 點' : time='下午 2 點到晚上 9 點';
    orderData.data.status === 0 ? status = '已繳費' : '未繳費';
    if(status="已繳費"){
        document.querySelector('.orderStatus').classList.add('success');
    }else{
        document.querySelector('.orderStatus').classList.add('danger');
    }
    document.querySelector('.InfoImg').setAttribute("src", `${orderData.data.trip.attraction.image}`);
    document.querySelector('.orderNumber').textContent = `${orderData.data.number}`;
    document.querySelector('.orderStatus').textContent = status;
    document.querySelector('.orderName').textContent = `${orderData.data.trip.attraction.name}`;
    document.querySelector('.orderDate').textContent = `${orderData.data.trip.date}`;
    document.querySelector('.orderTime').textContent = time;
    document.querySelector('.orderPrice').textContent = `新台幣 ${orderData.data.price} 元`;
    document.querySelector('.orderAddress').textContent = `${orderData.data.trip.attraction.address}`;
    document.querySelector('.orderContactName').textContent = `${orderData.data.contact.name}`;
    document.querySelector('.orderEmail').textContent = `${orderData.data.contact.email}`;
    document.querySelector('.orderPhone').textContent = `${orderData.data.contact.phone}`;
}

function init(){
    checkSignin()
    .then(result => {
        if(!result.data){
            window.location.href = "/"
        }
        getOrder().then(response => {
            renderOrder();
        });

    });
}

init();

// let model = {

// }

// let view = {

// }

// let controller = {
//     init: function(){
//         checkSignin()
//         .then(result => {
//             if(!result.data){
//                 window.location.href = "/"
//             }
//             getOrder().then(response => {
//                 renderOrder();
//             });
    
//         });
//     }
// }