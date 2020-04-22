isConnected(function (res) {
    if(!res) window.location.replace("./login.html");
});
getProfileElements();

/*FUNCTIONS*/

function applyChangements() {
    const nom = document.getElementById("nom");
    const prenom = document.getElementById("prenom");
    const sexe = document.getElementsByName("sexe");
    //const email = document.getElementById("email");
    const mdp = document.getElementById("mdp");
    const newmdp1 = document.getElementById("newmdp1");
    const newmdp2 = document.getElementById("newmdp2");

    //let isMyObjectEmpty = !Object.keys(a).length;

    let user = {}

    if(nom.value !== nom.placeholder) user.nom = nom.value;
    if(prenom.value !== nom.placeholder) user.prenom = prenom.value;
    for(let i=0; i<sexe.length; i++) {
        if(sexe[i].value.checked) user.sexe = sexe[i].value;
    }
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

    nom.value = user.nom;
    nom.placeholder = user.nom;
    prenom.value = user.prenom;
    prenom.placeholder = user.prenom;
    email.value = user.email;
    sexe[user.sexe-1].checked = true;
}