// 開啟中的modal
let modal = null;
let modalBG = document.querySelector('.modalBG');



function openModal(mode = 'login') {
    modal = mode;
    let currentModal = document.getElementsByClassName('modal active');
    let willOpen = document.querySelector(`.${modal}Modal`);


    // 切換modal時 將form reset 並將原本的錯誤內容清除
    document.querySelector(`.${modal}Form `).reset();
    let formMsg = document.querySelector(`.${modal}Form .formMsg`);
    formMsg.innerHTML = "";


    if (currentModal.length) {
        currentModal[0].classList.remove('active');
    }
    willOpen.classList.add('active');

    modalBG.classList.add('active')
}

function closeModal() {
    modal = null;
    let currentModal = document.getElementsByClassName('modal active');

    modalBG.classList.remove('active')
    currentModal[0].classList.remove('active');
}


function signOut() {
    api = "/api/user"
    fetch(api, {
        method: 'DELETE'
    }).then(response => response.json())
    .then( result => {
        location.reload()
    }
    )
}


function getFormData() {
    let formData = new FormData();
    let form;
    //form DOM 加上elements可以取得 相關標籤 ex. input,select,button...
    if (modal == 'login') {
        form = document.querySelector('.loginForm').elements;
    }
    else {
        form = document.querySelector('.registerForm').elements;
    }
    for (let i = 0; i < form.length; i++) {
        if (form[i].nodeName === "INPUT") {
            formData.append(form[i].name, form[i].value)
        }
    }
    submitForm(formData);
}

function submitForm(formData) {
    let requestMethod = "";
    modal === 'login' ? requestMethod = 'PATCH' : requestMethod = 'POST'
    fetch('/api/user', {
        method: requestMethod,
        body: formData,
    }).then((response) => response.json())
        .then(data => {
            // 登入成功後 重新載入html
            if (data.ok && requestMethod === 'PATCH') {
                location.reload();
            }
            // 註冊成功顯示訊息
            else if (data.ok && requestMethod === 'POST') {
                let formMsg = document.querySelector('.registerForm .formMsg');
                cleanFormMsg(formMsg, 'danger', 'success');
                document.querySelector(`.registerForm `).reset();
                formMsg.appendChild(document.createTextNode('註冊成功'));

            }

            // PATCH 新增登入錯誤訊息
            if (data.error && requestMethod === 'PATCH') {
                let formMsg = document.querySelector('.loginForm .formMsg');
                cleanFormMsg(formMsg, 'success', 'danger');
                formMsg.appendChild(document.createTextNode(data.message));
            }
            // POST 新增註冊錯誤訊息
            else if (data.error && requestMethod === 'POST') {
                let formMsg = document.querySelector('.registerForm .formMsg');
                cleanFormMsg(formMsg, 'success', 'danger');
                formMsg.appendChild(document.createTextNode(data.message));
            }

        })
}

function cleanFormMsg(messageDOM, removeClass, addClass) {
    if (messageDOM.classList.contains(removeClass)) {
        messageDOM.classList.remove(removeClass);
    }
    messageDOM.innerHTML = "";
    messageDOM.classList.add(addClass);
}

modalBG.addEventListener("click", function () {
    closeModal();
}, false)



// 取消form表單預設行為
document.querySelectorAll('.modal form').forEach(form => {
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        getFormData();
    })
});

