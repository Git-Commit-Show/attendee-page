// FUNCTION TO DISLPAY MESSAGE
function updateAllQuestions(message) {
    // console.log(message);
    const div = document.querySelector(".message")
    div.innerHTML = `<p>
 <span class="iframe-text-ques">${message}</span>
</p>`
}

function updateMessageUI(message) {
    // console.log(message);
    $('#messageBox').prepend(message)
}

function updateClapCount(count) {
    Array.from(document.getElementsByClassName('claps-count')).forEach(function(elem){
        elem.setAttribute('data-value', ''+count);
        elem.innerHTML = ''+count;
    })
}

function updateHandsRaisedCount(count) {
    Array.from(document.getElementsByClassName('hands-raised-count')).forEach(function(elem){
        elem.setAttribute('data-value',count+' %');
        elem.innerHTML = count+' %';
    })
}


function deactivateClapBtn(){
    Array.from(document.getElementsByClassName('clap-btn')).forEach(function(elem){
        elem.disabled = true;
        elem.style.background='#E71D2B';
        elem.getElementsByTagName('p')[0].innerHTML = "Clapped";
        setTimeout(function() {
            elem.disabled = false;
            elem.style.background = "#EFEFEF";
            elem.getElementsByTagName('p')[0].innerHTML = "Clap";
        }, 6000);
    })
}

function deactivateHandRaiseBtn(){
    Array.from(document.getElementsByClassName('hand-raise-btn')).forEach(function(elem){
        elem.disabled = true;
        elem.style.background='#E71D2B';
        elem.getElementsByTagName('p')[0].innerHTML = "Raised Hand";
        setTimeout(function() {
            elem.disabled = false;
            elem.style.background = "#EFEFEF";
            elem.getElementsByTagName('p')[0].innerHTML = "Raise Hand";
        }, 6000);
    })
}

function updateOnlineUserCount(data){
    Array.from(document.getElementsByClassName('online-user-count')).forEach(function(elem){
        elem.innerHTML = data+ " watching right now";
    })
}