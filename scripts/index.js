let x = ["cosmicCobalt","hanBlue","blueBerry1","cornflowerBlue","cyanCobaltBlue","prussianBlue","columbiaBlue","mayaBlue1","mayaBlue2","spiroDiscoBall","electricBlue","diamond","paleAqua","moonstoneBlue","blueBerry2","bleuDeFrance","deepKoamaru","royalBlue","ceruleanBlue"]
let y = ["1E3888","4764BC","6186F4","688EFF","37509B","0B3954","C0DBEA","63C5FF","4FBEFF","23C9FF","7CDEFF","CCF2FF","BBDDE8","83B5C6","4392F1","3982DB","2F3F72","122766","2C51C1"]

function color(x, y) {
    let str = ""
    for(let i=0; i<19; i++){
        str+="--"+x[i]+": #"+y[i]+";"
    }
    return str
}

let x = ["cosmicCobalt","hanBlue","blueBerry1","cornflowerBlue","cyanCobaltBlue","prussianBlue","columbiaBlue","mayaBlue1","mayaBlue2","spiroDiscoBall","electricBlue","diamond","paleAqua","moonstoneBlue","blueBerry2","bleuDeFrance","deepKoamaru","royalBlue","ceruleanBlue"]

function color2(x){
    let str = ""
    for(let i=0; i<19; i++){
        str+= ".text-"+x[i]+"{\n"
        str+= "\tcolor : var("+x[i]+");\n"
        str+= "}\n"
    }
    return str
}

console.log(color2(x))