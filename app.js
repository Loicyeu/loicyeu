//region CONST
const express = require('express');
const app = express();
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const path = require('path');
const uuid = require('uuid');
//endregion CONST

//region APP CONFIG
app.disable('x-powered-by');
app.set('trust proxy', true);

const {
    PORT = 3000,
    IN_PROD = false,//process.env.NODE_ENV==="production",

    SESS_NAME = "loicyeu.fr",
    SESS_SECRET = '-=-Th3_-_S3cr3et-=-',
    SESS_LIFETIME = 1000 * 60 * 60 * 2 //TWO HOURS
} = process.env;

const sessionStore = new MySQLStore({}, require('./config/db'));
//endregion APP CONFIG

const redirectNotLogged = (req, res, next) => {
    if(req.session.userUUID===undefined) {
        res.redirect('/login')
    } else {
        next()
    }
}

app.listen(PORT, () => {
    console.log('listening on port : '+ PORT);
});


//Démarrage log + Erreurs
const WriteLog = require('./models/WriteLog');
const URLError = require('./models/URLError');
WriteLog.startServ()

//Moteur de template
app.set('view engine', 'ejs')


//region MIDDLEWARE
app.use(session({
    name: SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: SESS_SECRET,
    store: sessionStore,
    proxy: true,
    cookie: {
        secure: IN_PROD,
        maxAge: SESS_LIFETIME,
        sameSite: true,
    }
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(fileUpload());

app.use('/', express.static('public/'));
app.use('/images/users', express.static('uploads/'));
//endregion MIDDLEWARE

//region POST REQUEST
app.post('/login', function (req, res) {
    const {email, password} = req.body;
    const Login = require("./models/Login");

    new Login(email, password).exists((response, user)=> {

        if(response) {
            const userUUID = uuid.v4();
            req.session.userUUID = userUUID;
            req.session.userID = user.id;
            Login.login(user, userUUID, SESS_LIFETIME, (result, err) => {
                if(result) {
                    res.redirect("/");
                }else {
                    res.render('login', {datas: {}});
                }
            });
        }else {
            res.render('login', {datas: {
                alertLogin: user
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
            req.session.userID = response.id;
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

app.post('/profil/uploadPicture', function (req, res) {
    if(!req.files || Object.keys(req.files).length===0)
        return res.redirect("/profil?error=fileNotFound");
    const file = req.files['profilePicture'];

    if(file.mimetype!=="image/png" && file.mimetype!=="image/jpeg")
        return res.redirect("/profil?error=fileTypeUnsupported");
    if(file.size > (1024*1024*5))
        return res.redirect("/profile?error=fileTooLarge");

    file.mv("uploads/profilePicture"+req.session.userID+".png", function (err) {
        if(err)
            return res.redirect("/profil?error=unexpectedError");
        else
            res.redirect("/profil");
    });
});

app.post('/profil/updateInfo', (req, res) => {
    const {nom, prenom, sexe} = req.body;
    if(nom===undefined || prenom===undefined || sexe===undefined) {
        res.redirect("/profil?error=emptyFiels")
    }
    if(nom==="" || prenom==="" || sexe==="") {
        res.redirect("/profil?error=emptyFiels")
    }

    const con = require("./config/db");
    con.query("UPDATE utilisateur SET prenom=?, nom=?, sexe=? WHERE id=?;",
        [prenom, nom, sexe, req.session.userID], (err)=> {
        if(err) {
            WriteLog.throwSQLError(err);
            return res.redirect("/profil?error=unexpectedError");
        }
        res.redirect("/profil");

    })
})
//endregion POST REQUEST

//region GET REQUEST
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

    Profil.getUserInfo(req.session.userUUID, (result, info) => {

        if(result) {
            res.render('profil', {datas: {
                    userInfo: info,
                    error: URLError.getDisplayableError(req.query.error)
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
//endregion GET REQUEST


/*TODO:
*  - Refaire gestion erreurs Login + Register
*  - Update sql table
*  - Nodemailer
*  - Color scheme
*  - amelioration requête sql
* */

//region SOCKET IO
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
//endregion SOCKET IO