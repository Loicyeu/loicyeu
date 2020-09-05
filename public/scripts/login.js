/*FONCTIONS*/

function formLogin() {
    const email = document.getElementById("email").value;
    const pass = document.getElementById("password").value;
    const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    delAlert("alertAccountCreated");

    if(pass!=="" && email!=="") {
        if(regexEmail.test(email)) {
            return loginUser(email, pass);
        }else setAlert("alertLogin", "l'adresse mail n'est pas valide", "Erreur", "warning");
    }else setAlert("alertLogin", "l'un des champs est vide", "Erreur", "warning");
    return false;
}

function loginUser(email, pass) {
    let loginButton = document.getElementById("loginButton");
    loginButton.innerHTML = "<span class='spinner-border spinner-border-sm'></span> Chargement...";
    delAlert("alertLogin");
    socket.emit("loginUser", email, pass, function (res, err) {
        if(err===null) {
            setCookie("uuid",res.uuid,res.expires);
            window.location.replace("/");
        }
        else {
            if(err==="ERR_NOT_FOUND_DATA") setAlert("alertLogin", "adresse email ou mot de passe invalide", "Erreur", "warning");
            else setAlert("alertLogin", "erreur inattendue", "Alerte", "danger");
        }
        loginButton.innerHTML = "Se connecter";
    });
    return false;
}