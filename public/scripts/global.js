const socket = io();

function setAlert(id, msg, title="", color="secondary") {
    if(id=="" && msg=="") return;

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
    window.location.replace("login");
}

function testPassword(password) {
    const passNumber = new RegExp("[0-9]", "g");
    const passUppercase = new RegExp("[A-Z]", "g");
    const passLowercase = new RegExp("[a-z]", "g");

    if(password==="") return {res: false, err: "ERR_PASSWORD_EMPTY"};
    else if(password.match(passNumber)===null || password.match(passUppercase)===null || password.match(passLowercase)===null) return {res: false, err: "ERR_PASSWORD_INVALID"};
    else if(password.match(passNumber).length<2 || password.match(passUppercase).length<2 || password.match(passLowercase).length<2) return {res: false, err: "ERR_PASSWORD_INVALID"};
    else if(password.length<8) return {res: false, err: "ERR_PASSWORD_TOO_SHORT"}
    else return {res: true, err: null}
}
function sizeToString(size) {
    if(size>1024) {
        if(size>(1024*1024)){
            if(size>(1024*1024*1024)) return Math.round(size/(1024*1024*1024))+"Go";
            else return Math.round(size/(1024*1024))+"Mo";
        }else return Math.round(size/1024)+"ko";
    }else return size+"o";
}