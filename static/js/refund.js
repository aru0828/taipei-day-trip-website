let refund = document.querySelector('.refundBtn');

refund.addEventListener('click', function(e){
    let confirmResult = confirm('確定要申請退款嗎?')
    let recTradeId = {
        'recTradeId':e.currentTarget.dataset.tradeid
    }
    
    if(confirmResult){
        fetch('/api/orders',{
            method:'PATCH',
            headers: {
                'Content-Type': "application/json"
            },
            body:JSON.stringify(recTradeId)
        })
        .then(response=> response.json())
        .then(result => {
            alert(result.message);
            window.location.reload();
        })
    }
    
})