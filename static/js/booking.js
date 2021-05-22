import { checkSignin } from "./checkSignin.js";

//  model 
let bookingData={};
let userData ={};
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


init();

