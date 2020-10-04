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