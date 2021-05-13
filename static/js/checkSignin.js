export function checkSignin() {
    let api = "/api/user"
    fetch(api, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(data => {
            if (data.data) {
                let signoutBtn = document.querySelector('.signoutBtn');
                signoutBtn.classList.add('active');
            }
            else {
                let signinBtn = document.querySelector('.signinBtn');
                signinBtn.classList.add('active');
            }
        })
}
