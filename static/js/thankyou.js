import { checkSignin } from "./checkSignin.js";

let PorxyLoading = new Proxy({isLoading : 'open'}, {
    set: function(obj, prop, value) {
        document.querySelector('.loading').classList.toggle('active');
        document.querySelector('.thankyou').classList.toggle('active');
        return obj[prop] = value;
    }
  });

let model = {
    url : new URL(window.location.href),
    orderData :{},
    getOrder : function (){
        let qsNumber = model.url.searchParams.get("number");
        return fetch(`/api/order?number=${qsNumber}`)
                .then(response => response.json())
                .then(result => {
                    model.orderData = result;
                })
   }
}

let view = {
    renderOrder : function(){
        let time="";
        let status="";
        let orderData = model.orderData.data;

        orderData.trip.time === 'morning' ? time ='早上 9 點到下午 4 點' : time='下午 2 點到晚上 9 點';
        orderData.status === 0 ? status = '已繳費' : status = '未繳費';
        if(status==="已繳費"){
            document.querySelector('.orderStatus').classList.add('success');
        }else{
            document.querySelector('.orderStatus').classList.add('danger');
        }
        document.querySelector('.InfoImg').setAttribute("src", `${orderData.trip.attraction.image}`);
        document.querySelector('.orderNumber').textContent = `${orderData.number}`;
        document.querySelector('.orderStatus').textContent = status;
        document.querySelector('.orderName').textContent = `${orderData.trip.attraction.name}`;
        document.querySelector('.orderDate').textContent = `${orderData.trip.date}`;
        document.querySelector('.orderTime').textContent = time;
        document.querySelector('.orderPrice').textContent = `新台幣 ${orderData.price} 元`;
        document.querySelector('.orderAddress').textContent = `${orderData.trip.attraction.address}`;
        document.querySelector('.orderContactName').textContent = `${orderData.contact.name}`;
        document.querySelector('.orderEmail').textContent = `${orderData.contact.email}`;
        document.querySelector('.orderPhone').textContent = `${orderData.contact.phone}`;
    },

    redirectURL(url){
        window.location.href = url;      
    }
}

let controller = {
    init: async function(){
        PorxyLoading.isLoading = 'open';
        let user = await checkSignin()
        if(!user.data){
            view.redirectURL('/');
        }
        else{
            await model.getOrder();
            if(model.orderData.data){
                view.renderOrder();
                PorxyLoading.isLoading = 'close';
            }
            else{
                view.redirectURL('/');
            }   
        }
    }
}


controller.init();