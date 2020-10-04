/*FUNCTIONS*/

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