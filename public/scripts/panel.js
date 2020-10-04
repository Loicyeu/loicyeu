isConnected(function (res) {
    if(!res) disconnect();
});
loadRessources();

function heading1() {
    const text = document.getElementById("corps");
    text.value += "\n<h3>typehere</h3>"
}
function heading2() {
    const text = document.getElementById("corps");
    text.value += "\n<h3>typehere</h3>"
}
function heading3() {
    const text = document.getElementById("corps");
    text.value += "\n<h4>typehere</h4>"
}
function heading4() {
    const text = document.getElementById("corps");
    text.value += "\n<h5>typehere</h5>"
}
function bold() {
    const text = document.getElementById("corps");
    text.value += "<b>bold</b>"
}
function italic() {
    const text = document.getElementById("corps");
    text.value += "<i>italic</i>"
}
function underline() {
    const text = document.getElementById("corps");
    text.value += "<u>underline</u>"
}
function code() {
    const text = document.getElementById("corps");
    text.value += "<code>code</code>"
}
function carriageReturn() {
    const text = document.getElementById("corps");
    text.value += "<br/>\n"
}

function loadRessources() {
    socket.emit('getTheme', function (res, err) {
        if(err!==null) window.location.replace("index.html");
        else {
            const theme = document.getElementById("theme");
            let str = "";
            for(let i=0; i<res.length; i++){
                str+="<option value='"+res[i].id+"'>"+res[i].theme+"</option>";
            }
            theme.innerHTML = str;
        }
    });
}

function sumbitArticle() {
    const title = document.getElementById("title");
    const corps = document.getElementById("corps");
    const theme = document.getElementById("theme");

    if(title.value!=="" && corps.value!=="" && theme.value!==""){
        socket.emit('sendArticle', title.value, corps.value, theme.value, getCookie('uuid'), function (res, err) {
            if(res!==null){
                setAlert("alertArticle", "l'article a bien été publié, redirection dans 5 secondes", "Succès", "success");
                setTimeout(()=>window.location.replace("index.html"), 5000);
            }else{
                setAlert("alertArticle", "l'article n'a pas été publié :"+err, "Erreur", "warning");
            }
        });
    }else {
        setAlert("alertArticle", "l'un des champs est vide", "Erreur", "warning");
    }
    return false;
}