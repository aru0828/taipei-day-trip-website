import { checkSignin } from "./checkSignin.js";


let PorxyLoading = new Proxy({isLoading : 'open'}, {
  set: function(obj, prop, value) {
      document.querySelector('.loading').classList.toggle('active');
      document.querySelector('.booking').classList.toggle('active');
      return obj[prop] = value;
  }
});


let model = {
  bookingData: {},
  userData : {},
  orderApiDone : true,

  saveUser: function(userData){
    model.userData = userData;
  },

  getBookingData: function () {
    return fetch('/api/booking')
      .then(response => response.json())
      .then(responseData => {
        if (responseData.data) {
          model.bookingData = responseData;
          return
        }
      })
  },

  deleteBookingData(){
    return fetch('/api/booking', {
        method: "DELETE"
      }).then(response => response.json())
        
  },
  getPrime: function () {
    let tappayStatus = TPDirect.card.getTappayFieldsStatus();
    
    if (tappayStatus.canGetPrime && model.orderApiDone) {
      model.orderApiDone = false;
      return new Promise((resolve, reject) =>{
        TPDirect.card.getPrime((result) => {
          if (result.status !== 0) {
            model.orderApiDone = true;
            reject(result.msg);
          }
          resolve(result)
        })
      })
    }
    else {
      model.orderApiDone = true;
      return tappayStatus;
    }
  },


  submitOrder: function (prime) {

    // 傳送到order api的參數
    let contactName = document.getElementById('contactName').value;
    let contactEmail = document.getElementById('contactEmail').value;
    let contactTel = document.getElementById('contactTel').value;
    // 避免物件傳址
    let trip = JSON.parse(JSON.stringify(model.bookingData.data));
    
    let requestData = {
      "prime": prime,
      "order": {
        "price": trip.price,
        'trip': trip,
        "contact": {
          "name": contactName,
          "email": contactEmail,
          "phone": contactTel
        }
      }
    }
    delete trip.price;

    return fetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(requestData),
      headers: {
        'Content-Type': "application/json"
      }}).then(response => response.json())
      .then(result => {
        if (result.data) {
          model.orderApiDone = true;
          return result.data;
        }
      })
  }
}


let view = {
  renderBooking: function () {
    let booking = model.bookingData.data;
    document.querySelector('.userName').textContent = model.userData.name;

    // 當booking有資料
    if (booking) {
      document.querySelector('.InfoImg').setAttribute('src', booking.attraction.image.replace('http:', 'https:'));
      document.querySelector('.InfoName').appendChild(document.createTextNode(booking.attraction.name));
      document.querySelector('.InfoDate').appendChild(document.createTextNode(booking.date));
      document.querySelector('.InfoTime').appendChild(document.createTextNode(booking.time === 'morning' ? '早上 9 點到下午 4 點' : "下午 2 點到晚上 9 點"));
      document.querySelector('.InfoPrice').appendChild(document.createTextNode(`新台幣 ${booking.price} 元`));
      document.querySelector('.InfoAddress').appendChild(document.createTextNode(booking.attraction.address));
      document.querySelector('.price').textContent = booking.price;

      // form表單預設帶入使用者的資料
      document.getElementById('contactName').value = model.userData.name;
      document.getElementById('contactEmail').value = model.userData.email;
    }
    else {
      let bookingContainerDom = document.querySelector('.bookingContainer');
      let nullBooking = document.querySelector('.nullBooking');
      nullBooking.classList.add('active');
      view.removeChild(bookingContainerDom);
      bookingContainerDom.remove();
    }

  },

  alertMessage(message){
    alert(message);
  },
  removeChild : function(parentNode, childNode){
    while (parentNode.firstChild) {
        parentNode.removeChild(parentNode.firstChild);
    }
  },
  redirectURL(url){
    window.location.href = url;      
  }
}


let controller = {
  init: async function () {
    PorxyLoading.isLoading = 'open';
    let user = await checkSignin()
    if (!user.data) {
      view.redirectURL('/');
    }
    else {
      model.saveUser(user.data);
      await model.getBookingData();
      view.renderBooking();
      PorxyLoading.isLoading = 'close';
    }
    
    
  },

  tappayProcess: async function(){
    try {
      let tappayGetPrime = await model.getPrime();
      if (tappayGetPrime.status === 0) {
        let payResult = await model.submitOrder(tappayGetPrime.card.prime);
        
        view.alertMessage(payResult.payment.message);
        view.redirectURL(`/thankyou?number=${payResult.number}`);
      }
      // TPDirect.card.getTappayFieldsStatus()出錯
      else{
        view.alertMessage(`卡片格式錯誤`);
      }
      // getPrime 出錯
    } catch(errorMessage){
      view.alertMessage(`錯誤訊息 : ${errorMessage}`)
    }
    
    
  },

  deleteBookingData: async function(){
    let deleteBookingStatus = await model.deleteBookingData();
   
    if(deleteBookingStatus.ok){
      window.location.reload();
    }else{
      view.alertMessage('刪除失敗，請重新嘗試');
    }
    
  }
}



// 監聽delete icon
document.querySelector('.iconDelete').addEventListener('click', function (e) {
  controller.deleteBookingData();
})

// 監聽submit booking
document.querySelector('.bookingForm').addEventListener('submit', (e) => {
  e.preventDefault();
  controller.tappayProcess();
})


controller.init();

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



