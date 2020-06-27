const time=new Date().getTime()+15*60*1000;
const Divtime=document.getElementById("time");
const links=document.getElementById("links")
const alter=document.getElementById("alter")
console.log(alter)
setInterval(()=>{
    const rtime=new Date().getTime();
    var show=time-rtime;
    var min=Math.floor((show%(1000*60*60)) / (1000 * 60));
    var second=Math.floor((show%(1000*60))/1000)
    Divtime.innerHTML=min+":"+second;
},1000)
setInterval(()=>{
    links.innerHTML=`<a href="live.gitcommit.show"> live stream is about to start click here</a>`
},1000*13*60)

setInterval(()=>{
    alter.innerHtml=`<p>facing issue <br><a href="">click here</a> to try alternative</p>`
},5000)