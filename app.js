const express = require('express');
const app = express();
const session = require('express-session');
const {
    PORT = 3000,
    IN_PROD = process.env.NODE_ENV==="production",

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

const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const path = require('path');

const http = require('http').createServer(app);
const io = require('socket.io')(http); //TODO: delete
//const nodemailer = require('nodemailer');

const uuid = require('uuid');
const bcrypt = require('bcrypt');
const saltRound = 10;
const con = require('./config/db');

//Démarrage log
const WriteLog = require('./models/WriteLog')
WriteLog.startServ()

//Moteur de template
app.set('view engine', 'ejs')


//Middleware
app.use(session({
    name: SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: SESS_SECRET,
    cookie: {
        maxAge: SESS_LIFETIME,
        sameSite: true,
        secure: IN_PROD
    }
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(fileUpload());

app.use('/images', express.static('public/images'));
app.use('/scripts', express.static('public/scripts'));
app.use('/stylesheets', express.static('public/stylesheets'));
// app.use('/', express.static('public')); //DO NOT UNCOMMENT


//https TODO: change http to app
http.listen(PORT, () => {
    console.log('listening on port : '+ PORT);
});


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
                        alertLogin: err
                    }});
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


/*
* FONCTIONS
* */


//
function hashPassword(pass) {
    return bcrypt.hashSync(pass, saltRound);
}
function testPasswordHash(pass, hash) {
    return bcrypt.compareSync(pass, hash);
}

/*
* FONCTIONS SOCKET
* */

io.on('connection', (socket) => {
    //console.log('user connected');

    //res {uuid, expires} err (String)
    socket.on('loginUser', function (email, mdp, callback) {
        if(typeof callback !== "function") {
            WriteLog.consoleInfo("ERR_NO_CALLBACK", "loginUser");
            return;
        }
        if(email === "" || mdp === "") {
            callback(false, "ERR_EMPTY_DATA");
            WriteLog.consoleInfo("ERR_EMPTY_DATA", "loginUser");
            return;
        }
        const sql = "SELECT * FROM utilisateur WHERE email = \""+ email + "\"";
        con.query(sql, function (err, result) {
            if(err) {
                sqlError(err);
                WriteLog.consoleInfo("ERR_SQL_ERROR", "loginUser");
                callback(false, "ERR_SQL_ERROR");
            }
            else if(result.length === 1) {
                if(testPasswordHash(mdp, result[0].hash)){
                    con.query("DELETE FROM uuid WHERE id=?", [result[0].id], function (err) {
                        if(err) {
                            sqlError(err);
                            WriteLog.consoleInfo("ERR_SQL_ERROR", "loginUser");
                            callback(false, "ERR_SQL_ERROR");
                        }else {
                            const userUUID = uuid.v4();
                            const expires = Date.now() + 14400000;
                            const sql = "INSERT INTO uuid (id, uuid, expires) VALUES (?, ?, ?)";
                            con.query(sql, [result[0].id, userUUID, expires], function (err) {
                                if(err) {
                                    sqlError(err);
                                    WriteLog.consoleInfo("ERR_SQL_ERROR", "loginUser");
                                    callback(false, "ERR_SQL_ERROR");
                                }else {
                                    callback({
                                        uuid: userUUID,
                                        expires: expires
                                    }, null);
                                    WriteLog.consoleInfo("Connected user with uuid : " + userUUID + " and expire date : " + expires);
                                }
                            });
                        }
                    });
                }else{
                    callback(false, "ERR_NOT_FOUND_DATA");
                    WriteLog.consoleInfo("ERR_NOT_FOUND_DATA : password", "loginUser");
                }
            }else if(result.length > 1) {
                callback(false, "ERR_NOT_UNIQUE_EMAIL");
                WriteLog.consoleInfo("ERR_NOT_UNIQUE_EMAIL", "loginUser");
            }
            else {
                callback(false, "ERR_NOT_FOUND_DATA");
                WriteLog.consoleInfo("ERR_NOT_FOUND_DATA : email", "loginUser");
            }
        });
    });

    //res (bool) err (String)
    socket.on('registerUser', function (nom, prenom, mdp, email, callback) {
        const regexEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

        if(typeof callback !== "function") {
            WriteLog.consoleInfo("ERR_NO_CALLBACK", "registerUser");
            return;
        }
        if(email === "" || mdp === "" || nom === "" || prenom === "") {
            callback(false, "ERR_EMPTY_DATA");
            WriteLog.consoleInfo("ERR_EMPTY_DATA", "registerUser");
            return;
        }
        if(!regexEmail.test(email)){
            callback(false, "ERR_INVALID_EMAIL");
            WriteLog.consoleInfo("ERR_INVALID_EMAIL", "registerUser");
            return;
        }
        const sql = "SELECT id FROM utilisateur WHERE email=?";
        con.query(sql, [email], function (err, result) {
            if(err) {
                sqlError(err);
                WriteLog.consoleInfo("ERR_SQL_ERROR", "registerUser");
                callback(false, "ERR_SQL_ERROR");
            }else if(result.length === 0) {
                const hash = hashPassword(mdp);
                const sql2 = "INSERT INTO utilisateur(nom, prenom, hash, email) VALUES (?, ?, ?, ?)";
                con.query(sql2, [nom, prenom, hash, email], function (err) {
                    if(err) {
                        sqlError(err);
                        WriteLog.consoleInfo("ERR_SQL_ERROR", "registerUser");
                        callback(false, "ERR_SQL_ERROR");
                    }else {
                        callback(true, null);
                        WriteLog.consoleInfo("Create new user : email=" + email, "registerUser");
                        con.query("SELECT id FROM utilisateur WHERE email=?", [email], function (err, result) {
                            if(err) {
                                sqlError(err);
                                WriteLog.consoleInfo("ERR_SQL_ERROR", "registerUser");
                                callback(false, "ERR_SQL_ERROR");
                            }else{
                                if(result.length===1){
                                    con.query(`CREATE TABLE friend_${result[0].id} (f_id INT, message TEXT, status INT, PRIMARY KEY (f_id), FOREIGN KEY (f_id) REFERENCES utilisateur (id) ON DELETE CASCADE);`,
                                        function (err) {
                                        if(err) {
                                            sqlError(err);
                                            WriteLog.consoleInfo("ERR_SQL_ERROR", "registerUser");
                                            callback(false, "ERR_SQL_ERROR");
                                        }else WriteLog.consoleInfo("Table friend_"+result[0].id+" created", "registerUser");
                                    });
                                    con.query("INSERT INTO password (id, mdp) VALUES (?, ?)", [result[0].id, mdp], function (err) {
                                        if(err) {
                                            sqlError(err);
                                            WriteLog.consoleInfo("ERR_SQL_ERROR", "registerUser");
                                            callback(false, "ERR_SQL_ERROR");
                                        }else WriteLog.consoleInfo("New password stocked : "+mdp, "registerUser");
                                    });
                                }else WriteLog.consoleInfo("ERR_ID_NOT_UNIQUE", "registerUser");
                            }
                        });
                    }
                });
            }else{
                callback(false, "ERR_NOT_UNIQUE_EMAIL");
                WriteLog.consoleInfo("ERR_NOT_UNIQUE_EMAIL", "registerUser");
            }
        });
    });

    //res (bool) err (String)
    socket.on('isConnected', function (uuid, callback) {
        callback(true, null);
        return
        if(typeof callback !== "function") {
            WriteLog.consoleInfo("ERR_NO_CALLBACK", "isConnected");
            return;
        }
        if(uuid===null || uuid==="") {
            WriteLog.consoleInfo("ERR_EMPTY_DATA", "isConnected");
            callback(false, "ERR_EMPTY_DATA");
        }
        const sql = "SELECT * FROM uuid WHERE uuid=?"
        con.query(sql, [uuid], function (err, result) {
            if(err) {
                sqlError(err);
                WriteLog.consoleInfo("ERR_SQL_ERROR", "isConnected");
                callback(false, "ERR_SQL_ERROR");
            }
            else {
                if(result.length===0) {
                    WriteLog.consoleInfo("ERR_NO_SESSION_FOUND", "isConnected");
                    callback(false, "ERR_NO_SESSION_FOUND");
                }else if(result[0].expires<Date.now()){
                    con.query("DELETE FROM uuid WHERE id=?", [result[0].id], (err) => {
                        if(err) {
                            sqlError(err);
                            WriteLog.consoleInfo("ERR_SQL_ERROR", "isConnected");
                            callback(false, "ERR_SQL_ERROR");
                        }
                        WriteLog.consoleInfo("ERR_EXPIRED_SESSION", "isConnected");
                        callback(false, "ERR_EXPIRED_SESSION");
                    });
                }else if(result[0].expires>Date.now()){
                    WriteLog.consoleInfo("Connected user with uuid : " + uuid, "isConnected");
                    callback(true, null);
                }else{
                    WriteLog.consoleInfo("ERR_UNEXPECTED_ERROR", "isConnected");
                    callback(false, "ERR_UNEXPECTED_ERROR");
                }
            }
        });
    });

    //res {nom, prenom, sexe, email} err (String)
    socket.on('userInfo', function (uuid, callback) {
        if(typeof callback !== "function") {
            WriteLog.consoleInfo("ERR_NO_CALLBACK", "userInfo");
            return;
        }
        if(uuid===null || uuid==="") {
            callback(false, "ERR_NULL_UUID");
            WriteLog.consoleInfo("ERR_NULL_UUID", "userInfo");
            return;
        }
        const sql = "SELECT id FROM uuid WHERE uuid=?"
        con.query(sql, [uuid], function (err, result) {
            if(err) {
                sqlError(err);
                WriteLog.consoleInfo("ERR_SQL_ERROR", "userInfo");
                callback(false, "ERR_SQL_ERROR");
            }
            else{
                if(result.length===1){
                    const id = result[0].id;
                    const sql2 = "SELECT * FROM utilisateur WHERE id=?";
                    con.query(sql2, [id],function (err, result) {
                        if(err) {
                            sqlError(err);
                            WriteLog.consoleInfo("ERR_SQL_ERROR", "userInfo");
                            callback(false, "ERR_SQL_ERROR");
                        }
                        else{
                            if(result.length===1){
                                let res={
                                    nom: result[0].nom,
                                    prenom: result[0].prenom,
                                    sexe: result[0].sexe,
                                    email: result[0].email
                                }
                                callback(res, null);
                                WriteLog.consoleInfo("userInfo : id="+ result[0].id + " email="+ res.email, "userInfo");
                            }else if(result.length>1) {
                                callback(false, "ERR_ID_NOT_UNIQUE");
                                WriteLog.consoleInfo("ERR_ID_NOT_UNIQUE", "userInfo");
                            }else{
                                callback(false, "ERR_UNEXPECTED_ERROR");
                                WriteLog.consoleInfo("ERR_UNEXPECTED_ERROR", "userInfo");
                            }
                        }
                    });
                }else if(result.length>1){
                    callback(false, "ERR_NOT_UNIQUE_UUID");
                    WriteLog.consoleInfo("ERR_NOT_UNIQUE_UUID", "userInfo");
                }else{
                    callback(false, "ERR_NOT_FOUND_DATA");
                    WriteLog.consoleInfo("ERR_NOT_FOUND_DATA", "userInfo");
                }
            }
        });
    });

    //res (bool) err (String) TODO
    socket.on('changeInfo', function (info, uuid, callback) {
        if(typeof callback !== "function") {
            WriteLog.consoleInfo("ERR_NO_CALLBACK", "changeInfo");
            return;
        }
        if(uuid===null || uuid==="") {
            callback(false, "ERR_NULL_UUID");
            WriteLog.consoleInfo("ERR_NULL_UUID", "changeInfo");
            return;
        }
        if(info==="") {
            callback(false, "ERR_MISSING_DATA");
            WriteLog.consoleInfo("ERR_MISSING_DATA", "changeInfo");
            return;
        }
        con.query("SELECT id FROM uuid WHERE uuid=\"" + uuid + "\"", function (err, result) {
            if(err) {
                sqlError(err);
                WriteLog.consoleInfo("ERR_SQL_ERROR", "changeInfo");
                callback(false, "ERR_SQL_ERROR");
            }else {
                if(result.length===1){
                    con.query("SELECT id FROM utilisateur WHERE id=?", [result[0].id], function (err, result) {
                        if(err) {
                            sqlError(err);
                            WriteLog.consoleInfo("ERR_SQL_ERROR", "changeInfo");
                            callback(false, "ERR_SQL_ERROR");
                        }else{
                            if(result.length===1) {
                                const id = result[0].id;
                                const nom = info.hasOwnProperty("nom") ? info.nom : null;
                                const prenom = info.hasOwnProperty("prenom") ? info.prenom : null;
                                const sexe = info.hasOwnProperty("sexe") ? info.sexe : null;
                                const sql = "UPDATE utilisateur SET id=?" +
                                    (nom===null ? "" : ", nom=\"" + nom + "\"") +
                                    (prenom===null ? "" : ", prenom=\"" + prenom + "\"") +
                                    (sexe===null ? "" : ", sexe=" + sexe) +
                                    " WHERE id=" + result[0].id;
                                con.query(sql, [id], function (err) {
                                    if(err) {
                                        sqlError(err);
                                        WriteLog.consoleInfo("ERR_SQL_ERROR", "changeInfo");
                                        callback(false, "ERR_SQL_ERROR");
                                    }else {
                                        WriteLog.consoleInfo("Mise a jour profil with id=" + result[0].id, "changeInfo");
                                        callback(true, null);
                                    }
                                });
                            }else if(result.length>1){
                                callback(false, "ERR_NOT_UNIQUE_ID");
                                WriteLog.consoleInfo("ERR_NOT_UNIQUE_ID", "changeInfo");
                            }else{
                                callback(false, "ERR_UNEXPECTED_ERROR");
                                WriteLog.consoleInfo("ERR_UNEXPECTED_ERROR", "changeInfo");
                            }
                        }
                    });
                }else if(result.length>1){
                    callback(false, "ERR_NOT_UNIQUE_UUID");
                    WriteLog.consoleInfo("ERR_NOT_UNIQUE_UUID", "changeInfo");
                }else{
                    callback(false, "ERR_NO_SESSION_FOUND");
                    WriteLog.consoleInfo("ERR_NO_SESSION_FOUND", "changeInfo");
                }
            }
        });
    });

    //res (bool) err (String) TODO
    socket.on('changePass', function (new_pass, old_pass, uuid, callback) {
        if(typeof callback !== "function") {
            WriteLog.consoleInfo("ERR_NO_CALLBACK", "changePass");
            return;
        }
        if(uuid===null || uuid==="") {
            callback(false, "ERR_NULL_UUID");
            WriteLog.consoleInfo("ERR_NULL_UUID", "changePass");
            return;
        }
        if(new_pass===null || new_pass==="" || old_pass===null || old_pass==="") {
            callback(false, "ERR_MISSING_DATA");
            WriteLog.consoleInfo("ERR_MISSING_DATA", "changePass");
            return;
        }
        con.query("SELECT id from uuid WHERE uuid=?", [uuid], function (err, result) {
            if(err) {
                sqlError(err);
                WriteLog.consoleInfo("ERR_SQL_ERROR", "changePass");
                callback(false, "ERR_SQL_ERROR");
            }else {
                if(result.length===1){
                    const id = result[0].id;
                    con.query("SELECT * FROM utilisateur WHERE id=?", [id], function (err, result) {
                        if(err) {
                            sqlError(err);
                            WriteLog.consoleInfo("ERR_SQL_ERROR", "changePass");
                            callback(false, "ERR_SQL_ERROR");
                        }else{
                            if(result.length===1){
                                const user = result[0];
                                if(testPasswordHash(old_pass, user.hash)) {
                                    const hash = hashPassword(new_pass);
                                    const sql = "UPDATE utilisateur SET hash=? WHERE id=?";
                                    con.query(sql, [hash, id], function (err) {
                                        if(err) {
                                            sqlError(err);
                                            WriteLog.consoleInfo("ERR_SQL_ERROR", "changePass");
                                            callback(false, "ERR_SQL_ERROR");
                                        }else{
                                            callback(true, null);
                                            WriteLog.consoleInfo("Mot de passe changé avec succès pour id: "+id, "changePass");
                                            con.query("UPDATE password SET mdp=? WHERE id=?", [new_pass, id], (err)=>{
                                                if(err) {
                                                    sqlError(err);
                                                    WriteLog.consoleInfo("ERR_SQL_ERROR", "changePass");
                                                    callback(false, "ERR_SQL_ERROR");
                                                }else{
                                                    WriteLog.consoleInfo("Nouveau mot de passe stocké", "changePass");
                                                }
                                            });
                                        }
                                    });
                                }else{
                                    callback(false, "ERR_PASSWORD_NOT_MATCHING");
                                    WriteLog.consoleInfo("ERR_PASSWORD_NOT_MATCHING", "changePass");
                                }
                            }else if(result.length>1){
                                callback(false, "ERR_NOT_UNIQUE_ID");
                                WriteLog.consoleInfo("ERR_NOT_UNIQUE_ID", "changePass");
                            }else{
                                callback(false, "ERR_UNEXPECTED_ERROR");
                                WriteLog.consoleInfo("ERR_UNEXPECTED_ERROR", "changePass");
                            }
                        }
                    });
                }else if(result.length>1){
                    callback(false, "ERR_NOT_UNIQUE_UUID");
                    WriteLog.consoleInfo("ERR_NOT_UNIQUE_UUID", "changePass");
                }else{
                    callback(false, "ERR_NO_SESSION_FOUND");
                    WriteLog.consoleInfo("ERR_NO_SESSION_FOUND", "changePass");
                }
            }
        });
    });

    //res (bool) err (String) TODO
    //UNVERIFIED
    socket.on('addFriend', function (uuid, f_id, message, callback) {
        if(typeof callback !== "function") {
            WriteLog.consoleInfo("ERR_NO_CALLBACK", "addFriend");
            return;
        }
        if(uuid===null || uuid==="") {
            callback(false, "ERR_NULL_UUID");
            WriteLog.consoleInfo("ERR_NULL_UUID", "addFriend");
            return;
        }

        if(f_id===null || f_id==="" && message===null || message==="") {
            callback(false, "ERR_MISSING_DATA");
            WriteLog.consoleInfo("ERR_MISSING_DATA", "addFriend");
            return;
        }
        if(typeof f_id !== "number") {
            callback(false, "ERR_INVALID_ID");
            WriteLog.consoleInfo("ERR_INVALID_ID", "addFriend");
            return;
        }

        con.query("SELECT id FROM uuid WHERE uuid=?", [uuid], function (err, result) {
            if(err) {
                sqlError(err);
                WriteLog.consoleInfo("ERR_SQL_ERROR", "addFriend");
                callback(false, "ERR_SQL_ERROR");
            }else {
                if(result.length===1) {
                    const id = result[0].id;
                    con.query("SELECT id FROM utilisateur WHERE id=?", [f_id], function (err, result) {
                        if(err) {
                            sqlError(err);
                            WriteLog.consoleInfo("ERR_SQL_ERROR", "addFriend");
                            callback(false, "ERR_SQL_ERROR");
                        }else{
                            if(result.length===1){
                                const f_id = result[0].id;
                                let sql = `INSERT INTO friend_${id} (f_id, message, status) VALUES (?, ?, ?)`;
                                con.query(sql, [f_id, message, 0], (err) =>  {
                                    if(err) {
                                        sqlError(err);
                                        WriteLog.consoleInfo("ERR_SQL_ERROR", "addFriend");
                                        callback(false, "ERR_SQL_ERROR");
                                    }else{
                                        sql = `INSERT INTO friend_${f_id} (f_id, message, status) VALUES (?, ?, ?)`;
                                        con.query(sql, [id, message, 1], (err) => {
                                            if(err) {
                                                sqlError(err);
                                                WriteLog.consoleInfo("ERR_SQL_ERROR", "addFriend");
                                                callback(false, "ERR_SQL_ERROR");
                                            }else{
                                                callback(true, null);
                                                WriteLog.consoleInfo("Friend request by " + id + "to " + f_id, "addFriend");
                                            }
                                        });
                                    }
                                });
                            }else if(result.length>1){
                                callback(false, "ERR_NOT_UNIQUE_UUID");
                                WriteLog.consoleInfo("ERR_NOT_UNIQUE_UUID", "addFriend");
                            }else{
                                callback(false, "ERR_NO_SESSION_FOUND");
                                WriteLog.consoleInfo("ERR_NO_SESSION_FOUND", "addFriend");
                            }
                        }
                    });
                }else if(result.length>1){
                    callback(false, "ERR_NOT_UNIQUE_UUID");
                    WriteLog.consoleInfo("ERR_NOT_UNIQUE_UUID", "addFriend");
                }else{
                    callback(false, "ERR_NO_SESSION_FOUND");
                    WriteLog.consoleInfo("ERR_NO_SESSION_FOUND", "addFriend");
                }
            }
        });
    });
});