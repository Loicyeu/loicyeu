isConnected(function (res) {
    if(!res) window.location.replace("./login.html");
});
getProfileElements();

/*FUNCTIONS*/
/*TODO
*  - sécuriser les radios buttons
* */

function changeInfo() {
    const nom = document.getElementById("nom");
    const prenom = document.getElementById("prenom");
    const sexe = document.getElementsByName("sexe");
    const email = document.getElementById("email");

    let user = {}

    if(nom.value !== nom.placeholder && nom.value!=="") user.nom = nom.value;
    if(prenom.value !== nom.placeholder && prenom.value!=="") user.prenom = prenom.value;
    for(let i=0; i<sexe.length; i++) {
        if(sexe[i].checked) user.sexe = sexe[i].value;
    }
    if(Object.keys(user).length) {
        user.email = email.placeholder;
        socket.emit("changeInfo",user,getCookie("uuid"),function (res, err) {
            if(err!==null) {
                if(err==="ERR_NO_SESSION_FOUND") disconnect();
                else setAlert("infoAlert", "erreur inattendue", "Alerte", "danger");
            }
            else {
                setAlert("infoAlert", "les informations ont été mises a jour !" , "Succès", "success");
                getProfileElements();
            }
        });
    }
    else {
        setAlert("infoAlert", "Pas de changement");
        console.log(user);
    }
    return false;
}
function changePassword() {
    const mdp = document.getElementById("mdp");
    const newmdp1 = document.getElementById("newmdp1");
    const newmdp2 = document.getElementById("newmdp2");


    if(mdp.length!==0 && newmdp1.length!==0 && newmdp2.length!==0) {
        const resMdp = testPassword(mdp.value);
        if(resMdp.res) {
            const resNewMdp = testPassword(newmdp1.value);
            if(newmdp1.value===newmdp2.value && resNewMdp.res) user.mdp = newmdp1.value;
            else {
                if(resNewMdp.res) setAlert("profilAlert", "ERR_PASSWORDS_DIFFERENT", "Nouveau mot de passe", "warning")
                else setAlert("profilAlert", resNewMdp.err, "Nouveau mot de passe", "warning");
            }
        }else{
            setAlert("profilAlert", resMdp.err, "Mot de passe actuel", "warning");
        }
    }
    return false;
}

function getProfileElements() {
    const uuid = getCookie("uuid");
    if(uuid===null) disconnect();
    socket.emit('userInfo', uuid, function (res, err) {
        if(err===null) setProfileElements(res);
        else console.log(err); //A MODIFIER
    });
}
function setProfileElements(user) {
    const nom = document.getElementById("nom");
    const prenom = document.getElementById("prenom");
    const sexe = document.getElementsByName("sexe");
    const email = document.getElementById("email");

    nom.placeholder = user.nom;
    nom.value = "";
    prenom.placeholder = user.prenom;
    prenom.value = "";
    email.placeholder = user.email;
    if(user.sexe!==null) sexe[user.sexe-1].checked = true;
}