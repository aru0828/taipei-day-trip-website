import { checkSignin } from "./checkSignin.js";

let historyOrders = {};



function renderOrders(){
    let orderTable = document.querySelector('.orderTable');
    let frag = document.createDocumentFragment();
    historyOrders.data.forEach( (order) => {
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
}


function getHistoryOrder(){
    fetch('/api/member')
    .then(response => response.json())
    .then(result => {
        historyOrders = result;
        renderOrders();
    })
}

function init(){
    checkSignin()
    .then( result => {
        if(!result.data){
            location.href="/";
        }
        getHistoryOrder();
    })
    
}

init();