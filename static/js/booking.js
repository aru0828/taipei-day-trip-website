import { checkSignin } from "./checkSignin.js";

//  model 
let bookingData={};
let userData ={};
let orderApiDone = true;
function getBookingData(){
  fetch('/api/booking')
  .then(response => response.json())
  .then(responseData => {
    if(responseData.data){
      bookingData = responseData;
    }
    renderBooking();
  })
}

// view
function renderBooking(){
  let booking = bookingData.data;
  if (booking) {
    document.querySelector('.InfoImg').setAttribute('src', booking.attraction.image);
    document.querySelector('.InfoName').appendChild(document.createTextNode(booking.attraction.name));
    document.querySelector('.InfoDate').appendChild(document.createTextNode(booking.date));
    document.querySelector('.InfoTime').appendChild(document.createTextNode(booking.time === 'morning' ? '早上 9 點到下午 4 點' : "下午 2 點到晚上 9 點"));
    document.querySelector('.InfoPrice').appendChild(document.createTextNode(`新台幣 ${booking.price} 元`));
    document.querySelector('.InfoAddress').appendChild(document.createTextNode(booking.attraction.address));
    document.querySelector('.price').textContent = booking.price;

    // form表單預設帶入使用者的資料
    document.getElementById('contactName').value = userData.name; 
    document.getElementById('contactEmail').value = userData.email;
  }
  else{
    let dom = document.querySelector('.bookingContainer');
      let nullBooking = document.querySelector('.nullBooking');
      nullBooking.classList.add('active');
      while (dom.firstChild){
        dom.removeChild(dom.firstChild);
      }
      dom.remove();
  }
  
}


// controller
function init(){
    checkSignin().then(result => {
      if(!result.data){
        window.location.href = "/";
      }
      else{
        userData = result.data;
        document.querySelector('.userName').textContent = userData.name;
        
      }
    });
    getBookingData();
}

// 刪除booking
document.querySelector('.iconDelete').addEventListener('click', function(e){
  fetch('/api/booking', {
    method:"DELETE"
  })
  .then(response => response.json())
  .then(result => {
    if(result){
      window.location.reload();
    }
  })
})

// submit booking
document.querySelector('.bookingForm').addEventListener('submit', (e) => {
  
  
  e.preventDefault();
  
  let tappayStatus = TPDirect.card.getTappayFieldsStatus()

  if (tappayStatus.canGetPrime && orderApiDone){

    orderApiDone = false;
    TPDirect.card.getPrime((result) => {

      if (result.status !== 0) {
          alert('錯誤訊息 : ' + result.msg)
          return
      }
      
    
      // 傳送到order api的參數
      let contactName  = document.getElementById('contactName').value;
      let contactEmail = document.getElementById('contactEmail').value;
      let contactTel = document.getElementById('contactTel').value;
      // 避免物件傳址
      let trip = JSON.parse(JSON.stringify(bookingData.data));
      let requestData = {
        "prime": result.card.prime,
        "order": {
          "price": trip.price,
          'trip':trip,
          "contact": {
            "name": contactName,
            "email": contactEmail,
            "phone": contactTel
          }
        }
      }
      delete trip.price;
      
      fetch('/api/orders', {
          method: 'POST',
          body: JSON.stringify(requestData),
          headers:{
            'Content-Type': "application/json"
          }})
      .then(response => response.json())
      .then(result => {
        if(result.data){
          orderApiDone = true;
          alert(result.data.payment.message);
          location.href = `/thankyou?number=${result.data.number}`;
        }
        
      })
      
    })
  }
  
})


init();

// tappay

let fields = {
  'number': {
      'element': '#card-number',
      'placeholder': '**** **** **** ****'
  },
  'expirationDate': {
      'element': '#card-expiration-date',
      'placeholder': 'MM / YY'
  },
  'ccv': {
      'element': '#card-ccv',
      'placeholder': 'ccv'
  }
}

let styles = {
  // Style all elements
  'input': {
      'color': 'red',
  },
  ':focus': {
      'color': 'black'
  },
  '.valid': {
      'color': 'green'
  },
  '.invalid': {
      'color': 'red'
  },
}

TPDirect.card.setup({
  'fields': fields,
  'styles': styles
})

