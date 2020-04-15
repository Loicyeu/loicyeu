function formLogin() {
    const email = document.getElementById("email").value
    const pass = document.getElementById("password").value
    const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

    if(pass!=="") {
        if(email!==""){
            if(regexEmail.test(email)) {
                return loginUser()
            }
        }
    }
    setAlert("alertLogin", "Les champs ne sont pas valides", "Erreur", "warning")
    return false
}

function setAlert(id, msg, title="", color="secondary") {
    if(id=="" && msg=="") return

    delAlert(id)
    document.getElementById(id).className += "alert alert-" + color;
    document.getElementById(id).innerHTML += "<button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button><strong>"+ title +"</strong> " + msg

}

function delAlert(id) {
    if(id==="") return
    document.getElementById(id).className = ""
    document.getElementById(id).innerHTML = ""
}

function loginUser() {
    delAlert("alertLogin")
    delAlert("alertLogin")
    setAlert("alertLogin", "L'email / mot de passe est invalide", "", "danger")
    return false
}

/*
* <div class="alert alert-warning">
*    <button type="button" class="close" data-dismiss="alert">&times;</button>
*    <strong>Erreur :</strong> les champs ne peuvent pas etre vides
* </div>
*/