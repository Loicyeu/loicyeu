loadArticle();

function loadArticle() {
    socket.emit("getArticle", function (res, err) {
        if(err!==null) setAlert("alertNews", "un problème s'est produit, essayez d'actualiser la page et si le probème persiste contactez un administrateur", "Alerte", "danger");
        else {
            const blog = document.getElementById("blog");
            if(res===true){

            }else{
                const blog = document.getElementById("blog");
                let str = "";
                for(let i=res.length-1; i>=0; i--){
                    const date = timeConverter(res[i].date)
                    str += "<div class='blog-post overflow-auto'>";
                    str += "<h2 class='blog-post-title'>"+ res[i].title +"</h2>";
                    str += "<p class='blog-post-meta'>"+date.day+" "+date.month+" "+date.year+", par "+res[i].prenom+" "+res[i].nom+"</p>";
                    str += res[i].corps;
                    str += "</div>";
                    if(i!==0) str+="<hr/>"
                }
                blog.innerHTML = str;
            }
        }
    });
}

function timeConverter(timestamp) {
    const date = new Date(timestamp);
    const months = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
    return {
        year: date.getFullYear(),
        month: months[date.getMonth()],
        day: date.getDate(),
        hour: date.getHours(),
        min: date.getMinutes(),
        sec: date.getSeconds()
    }
}