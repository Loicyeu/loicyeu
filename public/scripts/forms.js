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

function formRegister() {
    const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const email = document.getElementById("email").value;
    const nom = document.getElementById("nom").value;
    const prenom = document.getElementById("prenom").value;
    const mdp1 = document.getElementById("mdp1").value;
    const mdp2 = document.getElementById("mdp2").value;

    if(email==="" || nom==="" || prenom==="" || mdp1==="" || mdp2==="") setAlert("alertRegister", "les champs ne peuvent pas être vides", "Erreur :", "warning");
    else{
        if(regexEmail.test(email)){
            if(mdp1===mdp2) {
                console.log("registerUser")
                return registerUser(nom, prenom, mdp1, email);
            }else{
                setAlert("alertRegister", "Les mots de passes ne sont pas identiques", "Erreur :", "warning");
            }
        }else{
            setAlert("alertRegister", "l'adresse email est invalide", "Erreur :", "warning");
        }
    }
    return false
}

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

function loginUser(email, pass) {
    delAlert("alertLogin");
    socket.emit("loginUser", email, pass, function (res, err) {
        if(err===null) setAlert("alertLogin", "Connexion réussit !", "", "success");
        else setAlert("alertLogin", err, "", "warning");
    });
    //setAlert("alertLogin", "L'email / mot de passe est invalide", "", "danger");
    return false;
}

function registerUser(nom, prenom, mdp, email) {
    delAlert("alertRegister");
    socket.emit("registerUser", nom, prenom, mdp, email, function (res, err) {
        if(err===null) setAlert("alertRegister", "Création réussit !", "", "success");
        else setAlert("alertRegister", err, "Erreur :", "warning");
    })
    return false;
}