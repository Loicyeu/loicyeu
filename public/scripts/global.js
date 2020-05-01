const socket = io();


function setAlert(id, msg, title="", color="secondary") {
    if(id==="" && msg==="") return;

    delAlert(id)
    document.getElementById(id).className += "alert alert-" + color;
    document.getElementById(id).innerHTML += "<button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button>"+
        (title!==""? "<strong>"+ title +" : </strong>"+msg : msg);

}
function delAlert(id) {
    if(id==="") return;
    document.getElementById(id).className = "";
    document.getElementById(id).innerHTML = "";
}

function setCookie(name, value, timestamp=null) {
    if(timestamp !== null) {
        const expires = new Date(timestamp).toUTCString();
        document.cookie = name + "=" + value + ";expires=" + expires;
    } else {
        document.cookie = name + "=" + value
    }
}
function getCookie(cname) {
    const name = cname + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for(let i=0; i<ca.length; i++) {
        let c = ca[i];
        while(c.charAt(0) === ' ') c = c.substring(1);
        if(c.indexOf(name) === 0) return c.substring(name.length, c.length);
    }
    return null;
}

function getURLParam(param) {
    return new URLSearchParams(window.location.search).get(param);
}

function isConnected(callback) {
    const uuid = getCookie("uuid");
    if(uuid === null) return false;
    socket.emit("isConnected", uuid, function (res, err) {
        callback(res);
    });
}
function disconnect() {
    setCookie("uuid", null);
    window.location.replace("login.html");
}