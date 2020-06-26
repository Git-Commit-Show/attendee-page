// FUNCTION TO DISLPAY MESSAGE
function showQuestion(message) {
    // console.log(message);
    const div = document.querySelector(".message")
    div.innerHTML = `<p>
 <span class="iframe-text-ques">${message} </span>
</p>`
}