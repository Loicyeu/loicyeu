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

function sizeToString(size) {
    if(size>1024) {
        if(size>(1024*1024)){
            if(size>(1024*1024*1024)) return Math.round(size/(1024*1024*1024))+"Go";
            else return Math.round(size/(1024*1024))+"Mo";
        }else return Math.round(size/1024)+"ko";
    }else return size+"o";
}