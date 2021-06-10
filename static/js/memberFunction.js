import { checkSignin } from "./checkSignin.js";

let PorxyLoading = new Proxy({isLoading : 'open'}, {
    set: function(obj, prop, value) {
        document.querySelector('.loading').classList.toggle('active');
        document.querySelector('.order').classList.toggle('active');
        return obj[prop] = value;
    }
});

let model = {
    historyOrders : {},
    getHistoryOrder : function (){
        return fetch('/api/member')
                .then(response => response.json())
                .then(result => {
                    model.historyOrders = result;
                })
    }
}

let view = {
    renderOrders : function(){
        let orderTable = document.querySelector('.orderTable');
        let frag = document.createDocumentFragment();
        model.historyOrders.data.forEach( (order) => {
            let tr = document.createElement('tr');
            let number =  document.createElement('td');
            let name =    document.createElement('td');
            let date =    document.createElement('td');
            let time =    document.createElement('td');
            let orderTime = document.createElement('td');
            let price =  document.createElement('td');
            let status =  document.createElement('td');
    
            let a =       document.createElement('a');
    
            a.setAttribute('href', `/thankyou?number=${order.number}`);
            a.textContent = order.number;
            number.appendChild(a);
    
            name.textContent = order.name;
            date.textContent = order.date;
            time.textContent = order.time ==='morning' ?  '早上 9 點到下午 4 點' : '下午 2 點到晚上 9 點';
    
            let timestamp = parseInt(`${order.number}000`);
            let orderTimeValue = new Date(timestamp)
            
            
            let timevalue = `${orderTimeValue.getFullYear()}-
                             ${orderTimeValue.getMonth()+1}-
                             ${orderTimeValue.getDate()} 
                             ${orderTimeValue.getHours()}:
                             ${orderTimeValue.getMinutes()}`
            
            orderTime.textContent = timevalue;
            price.textContent = `$ ${order.price}`;
            price.classList.add('orderPrice')
            status.textContent = order.status === 0 ?  '已繳費' : '未繳費';
            if(status.textContent="已繳費"){
                status.classList.add('success');
            }else{
                status.classList.add('danger');
            }
    
            tr.appendChild(number);
            tr.appendChild(name);
            tr.appendChild(date);
            tr.appendChild(time);
            tr.appendChild(orderTime);
            tr.appendChild(price);
            tr.appendChild(status);
            frag.appendChild(tr);
        })
        orderTable.appendChild(frag);
    },

    redirectURL(url){
        window.location.href = url;      
    }
}

let controller = {
    init : async function(){
        PorxyLoading.isLoading = 'open';
        let user = await checkSignin();
        if(!user.data){
            view.redirectURL('/');
        }
        await model.getHistoryOrder();
        view.renderOrders();
        PorxyLoading.isLoading = 'close';
    }
}

controller.init();

