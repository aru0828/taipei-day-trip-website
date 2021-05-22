import { checkSignin } from "./checkSignin.js";

document.querySelector('.toBookingBtn').addEventListener('click', function(e){
    e.preventDefault();
    checkSignin().then(result => {
        if(result.data){
            window.location.href = "/booking";
        }
        else{
            openModal();
        }
    })
    
})  