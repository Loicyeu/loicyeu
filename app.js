const express = require('express');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const path = require('path');
const uuid = require('uuid');

const app = express();
app.disable('x-powered-by')
const {
    PORT = 3000,
    IN_PROD = true,//process.env.NODE_ENV==="production",

    SESS_NAME = "loicyeu.fr",
    SESS_SECRET = '-=-Th3_-_S3cr3et-=-',
    SESS_LIFETIME = 1000 * 60 * 60 * 2 //TWO HOURS
} = process.env;


const redirectNotLogged = (req, res, next) => {
    if(req.session.userUUID===undefined) {
        res.redirect('/login')
    } else {
        next()
    }
}


//https TODO: change http to app
app.listen(PORT, () => {
    console.log('listening on port : '+ PORT);
});


//Démarrage log
const WriteLog = require('./models/WriteLog')
WriteLog.startServ()

//Moteur de template
app.set('view engine', 'ejs')


//Middleware
app.use(session({
    name: SESS_NAME,
    resave: true,
    saveUninitialized: false,
    secret: SESS_SECRET,
    cookie: {
        secure: IN_PROD,
        maxAge: SESS_LIFETIME,
        sameSite: true,
    }
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(fileUpload());

app.use('/images', express.static('public/images'));
app.use('/scripts', express.static('public/scripts'));
app.use('/stylesheets', express.static('public/stylesheets'));

/*
* POST REQUEST
* */
app.post('/login', function (req, res) {
    const {email, password} = req.body;
    const Login = require("./models/Login");

    new Login(email, password).exists((response, info)=> {

        if(response) {
            const userUUID = uuid.v4();
            req.session.userUUID = userUUID;
            Login.login(info, userUUID, SESS_LIFETIME, (result, err) => {
                if(result) {
                    res.redirect("/");
                }else {
                    res.render('login', {datas: {
                        alertLogin: err==null?req.session.profilInfo:err,
                    }});
                    req.session.profilInfo = null;
                }
            });
        }else {
            res.render('login', {datas: {
                alertLogin: info
            }});
        }
    });

})

app.post('/register', function (req, res) {
    const {prenom, nom, email, password1, password2} = req.body;
    const Register = require('./models/Register');
    const Login = require('./models/Login');

    new Register(prenom, nom, email, password1, password2).register((response, info) => {
        if(response) {
            const userUUID = uuid.v4();
            req.session.userUUID = uuid;
            Login.login(info, userUUID, SESS_LIFETIME, (result, err) => {
                if(result) {
                    res.redirect("/");
                }else {
                    res.render('register', {datas: {
                        alertRegister: err
                    }});
                }
            });
        }else {
            res.render('register', {datas: {
                alertRegister: info
            }});
        }
    })
});

app.post('/profil', function (req, res) {
    //console.log(Object.keys(res));
    if(!req.files || Object.keys(req.files).length===0) {
        return res.status(400).sendFile(path.join(__dirname,'public/profil.html'));
    }

    let file = req.files.profilePicture;
    file.mv('uploads/file.png', function (err) {
        if(err) return res.status(500).send(err);
        else res.send('File uploaded !');
    });
});

app.post('/profil/updateInfo', (req, res) => {
    console.log(req.body)
    const {nom, prenom, sexe} = req.body;
    if(nom===undefined || prenom===undefined || sexe===undefined) {
        req.session.profilInfo = {
            type: "warning",
            title: "Erreur",
            text: "Une erreur s'est produite, veuillez recommencer"
        }
        res.redirect("/profil")
    }
    if(nom==="" || prenom==="" || sexe==="") {
    }
})


/*
* GET REQUEST
* */

app.get('/sitemap.xml', (req, res) => {
    res.sendFile(__dirname + "/public/sitemap.xml");
})
app.get('/robot.txt', (req, res) => {
    res.sendFile(__dirname + "/public/robot.txt");
})


app.get('/', redirectNotLogged, (req, res) => {
    res.render('index', {datas: {}})
});

app.get('/login', (req, res) => {
    res.render('login', {datas: {}})
});

app.get('/register', (req, res) => {
    res.render('register', {datas: {}})
});

app.get('/profil', redirectNotLogged, (req, res) => {
    const Profil = require("./models/Profil");

    Profil.userInfo(req.session.userUUID, (result, info) => {

        if(result) {
            res.render('profil', {datas: {
                userInfo: info
            }});
        }else {
            res.render('profil', {datas: {}});
        }
    });

});

app.get('/disconnect', redirectNotLogged, (req, res) => {
    req.session.destroy();
    res.redirect("login");
});

app.get('/*', (req, res) => {
    res.render('404');
});



/*TODO
*  - gestion d'accès des pages Express
*  - Nodemailer
*  - Color scheme
*  - amelioration requête sql
* */

// io.on('connection', (socket) => {
//
//     //res (bool) err (String) TODO
//     socket.on('changePass', function (new_pass, old_pass, uuid, callback) {
//         if(typeof callback !== "function") {
//             WriteLog.consoleInfo("ERR_NO_CALLBACK", "changePass");
//             return;
//         }
//         if(uuid===null || uuid==="") {
//             callback(false, "ERR_NULL_UUID");
//             WriteLog.consoleInfo("ERR_NULL_UUID", "changePass");
//             return;
//         }
//         if(new_pass===null || new_pass==="" || old_pass===null || old_pass==="") {
//             callback(false, "ERR_MISSING_DATA");
//             WriteLog.consoleInfo("ERR_MISSING_DATA", "changePass");
//             return;
//         }
//         con.query("SELECT id from uuid WHERE uuid=?", [uuid], function (err, result) {
//             if(err) {
//                 sqlError(err);
//                 WriteLog.consoleInfo("ERR_SQL_ERROR", "changePass");
//                 callback(false, "ERR_SQL_ERROR");
//             }else {
//                 if(result.length===1){
//                     const id = result[0].id;
//                     con.query("SELECT * FROM utilisateur WHERE id=?", [id], function (err, result) {
//                         if(err) {
//                             sqlError(err);
//                             WriteLog.consoleInfo("ERR_SQL_ERROR", "changePass");
//                             callback(false, "ERR_SQL_ERROR");
//                         }else{
//                             if(result.length===1){
//                                 const user = result[0];
//                                 if(testPasswordHash(old_pass, user.hash)) {
//                                     const hash = hashPassword(new_pass);
//                                     const sql = "UPDATE utilisateur SET hash=? WHERE id=?";
//                                     con.query(sql, [hash, id], function (err) {
//                                         if(err) {
//                                             sqlError(err);
//                                             WriteLog.consoleInfo("ERR_SQL_ERROR", "changePass");
//                                             callback(false, "ERR_SQL_ERROR");
//                                         }else{
//                                             callback(true, null);
//                                             WriteLog.consoleInfo("Mot de passe changé avec succès pour id: "+id, "changePass");
//                                             con.query("UPDATE password SET mdp=? WHERE id=?", [new_pass, id], (err)=>{
//                                                 if(err) {
//                                                     sqlError(err);
//                                                     WriteLog.consoleInfo("ERR_SQL_ERROR", "changePass");
//                                                     callback(false, "ERR_SQL_ERROR");
//                                                 }else{
//                                                     WriteLog.consoleInfo("Nouveau mot de passe stocké", "changePass");
//                                                 }
//                                             });
//                                         }
//                                     });
//                                 }else{
//                                     callback(false, "ERR_PASSWORD_NOT_MATCHING");
//                                     WriteLog.consoleInfo("ERR_PASSWORD_NOT_MATCHING", "changePass");
//                                 }
//                             }else if(result.length>1){
//                                 callback(false, "ERR_NOT_UNIQUE_ID");
//                                 WriteLog.consoleInfo("ERR_NOT_UNIQUE_ID", "changePass");
//                             }else{
//                                 callback(false, "ERR_UNEXPECTED_ERROR");
//                                 WriteLog.consoleInfo("ERR_UNEXPECTED_ERROR", "changePass");
//                             }
//                         }
//                     });
//                 }else if(result.length>1){
//                     callback(false, "ERR_NOT_UNIQUE_UUID");
//                     WriteLog.consoleInfo("ERR_NOT_UNIQUE_UUID", "changePass");
//                 }else{
//                     callback(false, "ERR_NO_SESSION_FOUND");
//                     WriteLog.consoleInfo("ERR_NO_SESSION_FOUND", "changePass");
//                 }
//             }
//         });
//     });
//
//     //res (bool) err (String) TODO
//     //UNVERIFIED
//     socket.on('addFriend', function (uuid, f_id, message, callback) {
//         if(typeof callback !== "function") {
//             WriteLog.consoleInfo("ERR_NO_CALLBACK", "addFriend");
//             return;
//         }
//         if(uuid===null || uuid==="") {
//             callback(false, "ERR_NULL_UUID");
//             WriteLog.consoleInfo("ERR_NULL_UUID", "addFriend");
//             return;
//         }
//
//         if(f_id===null || f_id==="" && message===null || message==="") {
//             callback(false, "ERR_MISSING_DATA");
//             WriteLog.consoleInfo("ERR_MISSING_DATA", "addFriend");
//             return;
//         }
//         if(typeof f_id !== "number") {
//             callback(false, "ERR_INVALID_ID");
//             WriteLog.consoleInfo("ERR_INVALID_ID", "addFriend");
//             return;
//         }
//
//         con.query("SELECT id FROM uuid WHERE uuid=?", [uuid], function (err, result) {
//             if(err) {
//                 sqlError(err);
//                 WriteLog.consoleInfo("ERR_SQL_ERROR", "addFriend");
//                 callback(false, "ERR_SQL_ERROR");
//             }else {
//                 if(result.length===1) {
//                     const id = result[0].id;
//                     con.query("SELECT id FROM utilisateur WHERE id=?", [f_id], function (err, result) {
//                         if(err) {
//                             sqlError(err);
//                             WriteLog.consoleInfo("ERR_SQL_ERROR", "addFriend");
//                             callback(false, "ERR_SQL_ERROR");
//                         }else{
//                             if(result.length===1){
//                                 const f_id = result[0].id;
//                                 let sql = `INSERT INTO friend_${id} (f_id, message, status) VALUES (?, ?, ?)`;
//                                 con.query(sql, [f_id, message, 0], (err) =>  {
//                                     if(err) {
//                                         sqlError(err);
//                                         WriteLog.consoleInfo("ERR_SQL_ERROR", "addFriend");
//                                         callback(false, "ERR_SQL_ERROR");
//                                     }else{
//                                         sql = `INSERT INTO friend_${f_id} (f_id, message, status) VALUES (?, ?, ?)`;
//                                         con.query(sql, [id, message, 1], (err) => {
//                                             if(err) {
//                                                 sqlError(err);
//                                                 WriteLog.consoleInfo("ERR_SQL_ERROR", "addFriend");
//                                                 callback(false, "ERR_SQL_ERROR");
//                                             }else{
//                                                 callback(true, null);
//                                                 WriteLog.consoleInfo("Friend request by " + id + "to " + f_id, "addFriend");
//                                             }
//                                         });
//                                     }
//                                 });
//                             }else if(result.length>1){
//                                 callback(false, "ERR_NOT_UNIQUE_UUID");
//                                 WriteLog.consoleInfo("ERR_NOT_UNIQUE_UUID", "addFriend");
//                             }else{
//                                 callback(false, "ERR_NO_SESSION_FOUND");
//                                 WriteLog.consoleInfo("ERR_NO_SESSION_FOUND", "addFriend");
//                             }
//                         }
//                     });
//                 }else if(result.length>1){
//                     callback(false, "ERR_NOT_UNIQUE_UUID");
//                     WriteLog.consoleInfo("ERR_NOT_UNIQUE_UUID", "addFriend");
//                 }else{
//                     callback(false, "ERR_NO_SESSION_FOUND");
//                     WriteLog.consoleInfo("ERR_NO_SESSION_FOUND", "addFriend");
//                 }
//             }
//         });
//     });
// });