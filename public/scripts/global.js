const socket = io();

function setAlert(id, msg, title="", color="secondary") {
    if(id=="" && msg=="") return;

    delAlert(id)
    document.getElementById(id).className += "alert alert-" + color;
    document.getElementById(id).innerHTML += "<button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button><strong>"+ title +"</strong> " + msg;

}

function delAlert(id) {
    if(id==="") return;
    document.getElementById(id).className = "";
    document.getElementById(id).innerHTML = "";
}