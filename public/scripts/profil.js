isConnected(function (res) {
    if(!res) disconnect();
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
        if(sexe[i].checked && !sexe[i].defaultChecked) user.sexe = sexe[i].value;
    }
    if(Object.keys(user).length) {
        user.email = email.placeholder;
        socket.emit("changeInfo",user,getCookie("uuid"),function (res, err) {
            if(err!==null) {
                if(err==="ERR_NO_SESSION_FOUND") disconnect();
                else setAlert("infoAlert", "erreur inattendue", "Alerte", "danger");
            }
            else {
                setAlert("infoAlert", "les informations ont été mises à jour !" , "Succès", "success");
                getProfileElements();
            }
        });
    }
    else {
        setAlert("infoAlert", "Pas de changement apporté a vos informations");
    }
    return false;
}
function changePassword() {
    const mdp = document.getElementById("mdp").value;
    const newmdp1 = document.getElementById("newmdp1").value;
    const newmdp2 = document.getElementById("newmdp2").value;

    if(mdp!=="" && newmdp1!=="" && newmdp2!=="") {
        const resNewMdp = testPassword(newmdp1);
        if(resNewMdp.res){
            if(newmdp1===newmdp2 && resNewMdp.res) {
                socket.emit('changePass', newmdp1, mdp, getCookie("uuid"), function (res, err) {
                    if(res) {
                        setAlert("alertMdp", "le mot de passe a été mis à jour !" , "Succès", "success")
                        getProfileElements();
                    }else{
                        if(err === "ERR_PASSWORD_NOT_MATCHING") setAlert("alertMdp", "votre mot de passe actuel n'est pas correct" , "Erreur", "warning");
                        else if(err==="ERR_NO_SESSION_FOUND") disconnect();
                        else setAlert("alertMdp", "erreur inattendue", "Alerte", "danger");
                    }
                });
            }else setAlert("alertMdp", "les nouveaux mot de passes ne sont pas identiques", "Erreur", "warning");
        }else {
            if(resNewMdp.err === "ERR_PASSWORD_TOO_SHORT") setAlert("alertMdp", "le nouveau mot de passe est trop court", "Erreur", "warning");
            else if(resNewMdp.err === "ERR_PASSWORD_INVALID") setAlert("alertMdp", "le nouveau mot de passe est invalide", "Erreur", "warning");
            else setAlert("alertMdp", "l'un des champs est vide", "Erreur", "warning");
        }
    }else setAlert("alertMdp", "l'un des champs est vide", "Erreur", "warning");
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
    if(user.sexe!==null) {
        sexe[user.sexe-1].defaultChecked = true;
    }
}

function testPP() {
    let file = document.getElementById("profilePicture").files;
    const text = document.getElementById("labelPP");
    const submit = document.getElementById("submitPP");
    const maxSize = 1024*1024*5; //5Mo

    if(file.length===0) {
        text.innerHTML = "";
        submit.disabled = true;
    }else{
        file = file.item(0);
        if(file.size > maxSize){
            text.innerHTML = "Taille max: 5Mo, votre fichier: "+sizeToString(file.size);
            text.className = "text-danger";
            submit.disabled = true;
        }else{
            if(file.type!=="image/png" && file.type!=="image/jpeg") {
                text.innerHTML = "Extension interdite, fichier autorisé : .png .jpg .jpeg";
                text.className = "text-danger";
                submit.disabled = true;
            }else{
                let str;
                if(file.name.length>25) str = file.name.slice(0,15)+"..."+file.name.slice(file.name.length-7);
                else str=file.name;
                text.innerHTML = "Sélectionné: "+str;
                text.className = "text-success";
                submit.disabled = false;
            }
        }
    }
}
function changePP() {
    let file = document.getElementById("profilePicture").files;
    console.log(file);
    if(file.length===0) alert("y'a r");
    else {
        file = file.item(0);
        console.log(file.name);
    }

    return false;
}