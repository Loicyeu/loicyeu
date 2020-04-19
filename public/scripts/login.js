function formLogin() {
    const email = document.getElementById("email").value;
    const pass = document.getElementById("password").value;
    const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if(pass!=="") {
        if(email!==""){
            if(regexEmail.test(email)) {
                return loginUser(email, pass);
            }
        }
    }
    setAlert("alertLogin", "Les champs ne sont pas valides", "Erreur", "warning");
    return false;
}

function loginUser(email, pass) {
    delAlert("alertLogin");
    socket.emit("loginUser", email, pass, function (res, err) {
        if(err===null) {
            setCookie("uuid",res.uuid,res.expires);
            window.location.replace("./messagerie.html");
        }
        else setAlert("alertLogin", err, "", "warning");
    });
    return false;
}