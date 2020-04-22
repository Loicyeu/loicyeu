function formRegister() {
    console.log("form register")
    const regexEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    const email = document.getElementById("email").value;
    const nom = document.getElementById("nom").value;
    const prenom = document.getElementById("prenom").value;
    const mdp1 = document.getElementById("password1").value;
    const mdp2 = document.getElementById("password2").value;

    if(email!=="" && nom!=="" && prenom!=="" && mdp1!=="" && mdp2!=="") {
        if(regexEmail.test(email)){
            if (mdp1.match(/[0-9]/g)!==null && mdp1.match(/[A-Z]/g)!==null && mdp1.match(/[a-z]/g)!==null){
                if(mdp1.match(/[0-9]/g).length>=2 && mdp1.match(/[A-Z]/g).length>=2 && mdp1.match(/[a-z]/g).length>=2 && mdp1.length>=8){
                    if(mdp1===mdp2) {
                        console.log("register User");
                        registerUser(nom, prenom, mdp1, email);
                    }else setAlert("alertRegister", "les mots de passes ne sont pas identiques", "Erreur :", "warning");
                }else setAlert("alertRegister", "le mot de passe n'est pas valide", "Erreur :", "warning");
            }else setAlert("alertRegister", "le mot de passe n'est pas valide", "Erreur :", "warning");
        }else setAlert("alertRegister", "l'adresse email est invalide", "Erreur :", "warning");
    }else setAlert("alertRegister", "l'un des champs ne peut pas être vide", "Erreur :", "warning");
    return false;
}

function registerUser(nom, prenom, mdp, email) {
    console.log("create profile")
    delAlert("alertRegister");
    socket.emit("registerUser", nom, prenom, mdp, email, function (res, err) {
        if(res) {
            setAlert("alertRegister", "Création du compte réussit !\nRedirection dans 5 secondes", "Félicitation : ", "success");
            setTimeout(()=>window.location.replace("login.html"),5000);
        }
        else setAlert("alertRegister", err, "Erreur :", "warning");
    });
    return false;
}

function testName() {
    const prenom = document.getElementById("prenom").value;
    const nom = document.getElementById("nom").value;
    let iconName = document.getElementById("iconName");

    if(prenom === "" && nom === "") iconName.className = "input-group-text text-danger";
    else if(prenom === "" || nom === "") iconName.className = "input-group-text text-warning";
    else iconName.className = "input-group-text text-success";
}

function testEmail() {
    const regexEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    const email = document.getElementById("email").value;
    let iconEmail = document.getElementById("iconEmail");

    if(email === "") iconEmail.className = "input-group-text text-danger";
    else if(email !== "" && !regexEmail.test(email)) iconEmail.className = "input-group-text text-warning";
    else if(regexEmail.test(email)) iconEmail.className = "input-group-text text-success";
}

function testPassword1() {
    testPassword2();
    const passNumber = new RegExp("[0-9]", "g");
    const passUppercase = new RegExp("[A-Z]", "g");
    const passLowercase = new RegExp("[a-z]", "g");
    const mdp = document.getElementById("password1").value;
    let iconMdp1 = document.getElementById("iconPassword1");

    if(mdp==="") iconMdp1.className = "input-group-text text-danger";
    else if(mdp.match(passNumber)===null || mdp.match(passUppercase)===null || mdp.match(passLowercase)===null) iconMdp1.className = "input-group-text text-warning";
    else if(mdp.match(passNumber).length<2 || mdp.match(passUppercase).length<2 || mdp.match(passLowercase).length<2) iconMdp1.className = "input-group-text text-warning";
    else if(mdp.length>=8) iconMdp1.className = "input-group-text text-success";
}

function testPassword2() {
    const mdp1 = document.getElementById("password1").value;
    const mdp2 = document.getElementById("password2").value;
    const iconPassword2 = document.getElementById("iconPassword2");

    if(mdp2 === "") iconPassword2.className = "input-group-text text-danger";
    else if(mdp1 !== mdp2) iconPassword2.className = "input-group-text text-warning";
    else if(mdp1 === mdp2) iconPassword2.className = "input-group-text text-success";

}