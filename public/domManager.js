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