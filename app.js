const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser')
const path = require('path');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
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
app.use('/assets', express.static('public'));
app.use('/', express.static('public'));
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(fileUpload());


//https
http.listen(3000, () => {
    console.log('listening on port : 3000');
});


app.post('/profil.html', function (req, res) {
    console.log(Object.keys(res));
    if(!req.files || Object.keys(req.files).length===0) {
        return res.status(400).sendFile(path.join(__dirname,'public/profil.html'));
    }

    let file = req.files.profilePicture;
    file.mv('uploads/file.png', function (err) {
        if(err) return res.status(500).send(err);
        else res.send('File uploaded !');
    });
});
//<input class="form-control-file mt-4 rounded" type="file" name="profilePicture">

/*
app.get('/login', (req, res) => res.sendFile(path.join(__dirname,'public/login.html')));
*/

/*TODO
*  - gestion d'acces des pages Express
*  - Nodemailer
*  - Color scheme
*  - amelioration requete sql
* */


/*
* FONCTIONS
* */

//Database functions
function createDB() {
    con.query("CREATE DATABASE loicyeufr", function (err, result) {
        if(err) {
            if (err.code !== "ER_DB_CREATE_EXISTS") sqlError(err);
            else sqlWarning(err);
        } else sqlInfo("Database created");
    });
}
function createTables() {
    const WriteLog = require('./models/WriteLog')

    let sql = "CREATE TABLE utilisateur (id INT AUTO_INCREMENT PRIMARY KEY, nom VARCHAR(255), prenom VARCHAR(255), sexe INT, hash VARCHAR(255), email VARCHAR(255), role INT)";
    con.query(sql, function (err) {
        if(err) {
            WriteLog.throwSQLError(err)
            if (err.code === "ER_TABLE_EXISTS_ERROR") sqlWarning(err);
            else sqlError(err);
        } else sqlInfo("Table 'utilisateur' created");
    });

    sql = "CREATE TABLE uuid (id INT, uuid VARCHAR(255), expires BIGINT, PRIMARY KEY (id), FOREIGN KEY (id) REFERENCES utilisateur(id) ON DELETE CASCADE)"
    con.query(sql, function (err) {
        if(err) {
            if (err.code === "ER_TABLE_EXISTS_ERROR") sqlWarning(err);
            else sqlError(err);
        } else sqlInfo("Table 'uuid' created");
    });

    sql = "CREATE TABLE password (id INT, mdp VARCHAR(255), PRIMARY KEY (id), FOREIGN KEY (id) REFERENCES utilisateur (id) ON DELETE CASCADE)"
    con.query(sql, function (err) {
        if(err) {
            if (err.code === "ER_TABLE_EXISTS_ERROR") sqlWarning(err);
            else sqlError(err);
        } else sqlInfo("Table 'password' created");
    });
}

//SQL information functions
function sqlError(err) {
    console.log("[SQL ERROR] Code    : "+err.code
        + "\n[SQL ERROR] Message : " + err.sqlMessage);
} //fait
function sqlWarning(err) {
    console.log("[SQL WARNING] Code    : " + err.code
        + "\n[SQL WARNING] Message : " + err.sqlMessage);
}
function sqlInfo(info) {
    console.log("[SQL INFO] " + info);
} //fait

//Global information functions
function consoleInfo(info, title = "") {
    console.log((title!=="" ? "["+title+"]":"[GENERAL INFO]")+ " " + info);
}


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
            consoleInfo("ERR_NO_CALLBACK", "loginUser");
            return;
        }
        if(email === "" || mdp === "") {
            callback(false, "ERR_EMPTY_DATA");
            consoleInfo("ERR_EMPTY_DATA", "loginUser");
            return;
        }
        const sql = "SELECT * FROM utilisateur WHERE email = \""+ email + "\"";
        con.query(sql, function (err, result) {
            if(err) {
                sqlError(err);
                consoleInfo("ERR_SQL_ERROR", "loginUser");
                callback(false, "ERR_SQL_ERROR");
            }
            else if(result.length === 1) {
                if(testPasswordHash(mdp, result[0].hash)){
                    con.query("DELETE FROM uuid WHERE id=?", [result[0].id], function (err) {
                        if(err) {
                            sqlError(err);
                            consoleInfo("ERR_SQL_ERROR", "loginUser");
                            callback(false, "ERR_SQL_ERROR");
                        }else {
                            const userUUID = uuid.v4();
                            const expires = Date.now() + 14400000;
                            const sql = "INSERT INTO uuid (id, uuid, expires) VALUES (?, ?, ?)";
                            con.query(sql, [result[0].id, userUUID, expires], function (err) {
                                if(err) {
                                    sqlError(err);
                                    consoleInfo("ERR_SQL_ERROR", "loginUser");
                                    callback(false, "ERR_SQL_ERROR");
                                }else {
                                    callback({
                                        uuid: userUUID,
                                        expires: expires
                                    }, null);
                                    consoleInfo("Connected user with uuid : " + userUUID + " and expire date : " + expires);
                                }
                            });
                        }
                    });
                }else{
                    callback(false, "ERR_NOT_FOUND_DATA");
                    consoleInfo("ERR_NOT_FOUND_DATA : password", "loginUser");
                }
            }else if(result.length > 1) {
                callback(false, "ERR_NOT_UNIQUE_EMAIL");
                consoleInfo("ERR_NOT_UNIQUE_EMAIL", "loginUser");
            }
            else {
                callback(false, "ERR_NOT_FOUND_DATA");
                consoleInfo("ERR_NOT_FOUND_DATA : email", "loginUser");
            }
        });
    });

    //res (bool) err (String)
    socket.on('registerUser', function (nom, prenom, mdp, email, callback) {
        const regexEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

        if(typeof callback !== "function") {
            consoleInfo("ERR_NO_CALLBACK", "registerUser");
            return;
        }
        if(email === "" || mdp === "" || nom === "" || prenom === "") {
            callback(false, "ERR_EMPTY_DATA");
            consoleInfo("ERR_EMPTY_DATA", "registerUser");
            return;
        }
        if(!regexEmail.test(email)){
            callback(false, "ERR_INVALID_EMAIL");
            consoleInfo("ERR_INVALID_EMAIL", "registerUser");
            return;
        }
        const sql = "SELECT id FROM utilisateur WHERE email=?";
        con.query(sql, [email], function (err, result) {
            if(err) {
                sqlError(err);
                consoleInfo("ERR_SQL_ERROR", "registerUser");
                callback(false, "ERR_SQL_ERROR");
            }else if(result.length === 0) {
                const hash = hashPassword(mdp);
                const sql2 = "INSERT INTO utilisateur(nom, prenom, hash, email) VALUES (?, ?, ?, ?)";
                con.query(sql2, [nom, prenom, hash, email], function (err) {
                    if(err) {
                        sqlError(err);
                        consoleInfo("ERR_SQL_ERROR", "registerUser");
                        callback(false, "ERR_SQL_ERROR");
                    }else {
                        callback(true, null);
                        consoleInfo("Create new user : email=" + email, "registerUser");
                        con.query("SELECT id FROM utilisateur WHERE email=?", [email], function (err, result) {
                            if(err) {
                                sqlError(err);
                                consoleInfo("ERR_SQL_ERROR", "registerUser");
                                callback(false, "ERR_SQL_ERROR");
                            }else{
                                if(result.length===1){
                                    con.query(`CREATE TABLE friend_${result[0].id} (f_id INT, message TEXT, status INT, PRIMARY KEY (f_id), FOREIGN KEY (f_id) REFERENCES utilisateur (id) ON DELETE CASCADE);`,
                                        function (err) {
                                        if(err) {
                                            sqlError(err);
                                            consoleInfo("ERR_SQL_ERROR", "registerUser");
                                            callback(false, "ERR_SQL_ERROR");
                                        }else consoleInfo("Table friend_"+result[0].id+" created", "registerUser");
                                    });
                                    con.query("INSERT INTO password (id, mdp) VALUES (?, ?)", [result[0].id, mdp], function (err) {
                                        if(err) {
                                            sqlError(err);
                                            consoleInfo("ERR_SQL_ERROR", "registerUser");
                                            callback(false, "ERR_SQL_ERROR");
                                        }else consoleInfo("New password stocked : "+mdp, "registerUser");
                                    });
                                }else consoleInfo("ERR_ID_NOT_UNIQUE", "registerUser");
                            }
                        });
                    }
                });
            }else{
                callback(false, "ERR_NOT_UNIQUE_EMAIL");
                consoleInfo("ERR_NOT_UNIQUE_EMAIL", "registerUser");
            }
        });
    });

    //res (bool) err (String)
    socket.on('isConnected', function (uuid, callback) {
        if(typeof callback !== "function") {
            consoleInfo("ERR_NO_CALLBACK", "isConnected");
            return;
        }
        if(uuid===null || uuid==="") {
            consoleInfo("ERR_EMPTY_DATA", "isConnected");
            callback(false, "ERR_EMPTY_DATA");
        }
        const sql = "SELECT * FROM uuid WHERE uuid=?"
        con.query(sql, [uuid], function (err, result) {
            if(err) {
                sqlError(err);
                consoleInfo("ERR_SQL_ERROR", "isConnected");
                callback(false, "ERR_SQL_ERROR");
            }
            else {
                if(result.length===0) {
                    consoleInfo("ERR_NO_SESSION_FOUND", "isConnected");
                    callback(false, "ERR_NO_SESSION_FOUND");
                }else if(result[0].expires<Date.now()){
                    con.query("DELETE FROM uuid WHERE id=?", [result[0].id], (err) => {
                        if(err) {
                            sqlError(err);
                            consoleInfo("ERR_SQL_ERROR", "isConnected");
                            callback(false, "ERR_SQL_ERROR");
                        }
                        consoleInfo("ERR_EXPIRED_SESSION", "isConnected");
                        callback(false, "ERR_EXPIRED_SESSION");
                    });
                }else if(result[0].expires>Date.now()){
                    consoleInfo("Connected user with uuid : " + uuid, "isConnected");
                    callback(true, null);
                }else{
                    consoleInfo("ERR_UNEXPECTED_ERROR", "isConnected");
                    callback(false, "ERR_UNEXPECTED_ERROR");
                }
            }
        });
    });

    //res {nom, prenom, sexe, email} err (String)
    socket.on('userInfo', function (uuid, callback) {
        if(typeof callback !== "function") {
            consoleInfo("ERR_NO_CALLBACK", "userInfo");
            return;
        }
        if(uuid===null || uuid==="") {
            callback(false, "ERR_NULL_UUID");
            consoleInfo("ERR_NULL_UUID", "userInfo");
            return;
        }
        const sql = "SELECT id FROM uuid WHERE uuid=?"
        con.query(sql, [uuid], function (err, result) {
            if(err) {
                sqlError(err);
                consoleInfo("ERR_SQL_ERROR", "userInfo");
                callback(false, "ERR_SQL_ERROR");
            }
            else{
                if(result.length===1){
                    const id = result[0].id;
                    const sql2 = "SELECT * FROM utilisateur WHERE id=?";
                    con.query(sql2, [id],function (err, result) {
                        if(err) {
                            sqlError(err);
                            consoleInfo("ERR_SQL_ERROR", "userInfo");
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
                                consoleInfo("userInfo : id="+ result[0].id + " email="+ res.email, "userInfo");
                            }else if(result.length>1) {
                                callback(false, "ERR_ID_NOT_UNIQUE");
                                consoleInfo("ERR_ID_NOT_UNIQUE", "userInfo");
                            }else{
                                callback(false, "ERR_UNEXPECTED_ERROR");
                                consoleInfo("ERR_UNEXPECTED_ERROR", "userInfo");
                            }
                        }
                    });
                }else if(result.length>1){
                    callback(false, "ERR_NOT_UNIQUE_UUID");
                    consoleInfo("ERR_NOT_UNIQUE_UUID", "userInfo");
                }else{
                    callback(false, "ERR_NOT_FOUND_DATA");
                    consoleInfo("ERR_NOT_FOUND_DATA", "userInfo");
                }
            }
        });
    });

    //res (bool) err (String)
    socket.on('changeInfo', function (info, uuid, callback) {
        if(typeof callback !== "function") {
            consoleInfo("ERR_NO_CALLBACK", "changeInfo");
            return;
        }
        if(uuid===null || uuid==="") {
            callback(false, "ERR_NULL_UUID");
            consoleInfo("ERR_NULL_UUID", "changeInfo");
            return;
        }
        if(info==="") {
            callback(false, "ERR_MISSING_DATA");
            consoleInfo("ERR_MISSING_DATA", "changeInfo");
            return;
        }
        con.query("SELECT id FROM uuid WHERE uuid=\"" + uuid + "\"", function (err, result) {
            if(err) {
                sqlError(err);
                consoleInfo("ERR_SQL_ERROR", "changeInfo");
                callback(false, "ERR_SQL_ERROR");
            }else {
                if(result.length===1){
                    con.query("SELECT id FROM utilisateur WHERE id=?", [result[0].id], function (err, result) {
                        if(err) {
                            sqlError(err);
                            consoleInfo("ERR_SQL_ERROR", "changeInfo");
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
                                        consoleInfo("ERR_SQL_ERROR", "changeInfo");
                                        callback(false, "ERR_SQL_ERROR");
                                    }else {
                                        consoleInfo("Mise a jour profil with id=" + result[0].id, "changeInfo");
                                        callback(true, null);
                                    }
                                });
                            }else if(result.length>1){
                                callback(false, "ERR_NOT_UNIQUE_ID");
                                consoleInfo("ERR_NOT_UNIQUE_ID", "changeInfo");
                            }else{
                                callback(false, "ERR_UNEXPECTED_ERROR");
                                consoleInfo("ERR_UNEXPECTED_ERROR", "changeInfo");
                            }
                        }
                    });
                }else if(result.length>1){
                    callback(false, "ERR_NOT_UNIQUE_UUID");
                    consoleInfo("ERR_NOT_UNIQUE_UUID", "changeInfo");
                }else{
                    callback(false, "ERR_NO_SESSION_FOUND");
                    consoleInfo("ERR_NO_SESSION_FOUND", "changeInfo");
                }
            }
        });
    });

    //res (bool) err (String)
    socket.on('changePass', function (new_pass, old_pass, uuid, callback) {
        if(typeof callback !== "function") {
            consoleInfo("ERR_NO_CALLBACK", "changePass");
            return;
        }
        if(uuid===null || uuid==="") {
            callback(false, "ERR_NULL_UUID");
            consoleInfo("ERR_NULL_UUID", "changePass");
            return;
        }
        if(new_pass===null || new_pass==="" || old_pass===null || old_pass==="") {
            callback(false, "ERR_MISSING_DATA");
            consoleInfo("ERR_MISSING_DATA", "changePass");
            return;
        }
        con.query("SELECT id from uuid WHERE uuid=?", [uuid], function (err, result) {
            if(err) {
                sqlError(err);
                consoleInfo("ERR_SQL_ERROR", "changePass");
                callback(false, "ERR_SQL_ERROR");
            }else {
                if(result.length===1){
                    const id = result[0].id;
                    con.query("SELECT * FROM utilisateur WHERE id=?", [id], function (err, result) {
                        if(err) {
                            sqlError(err);
                            consoleInfo("ERR_SQL_ERROR", "changePass");
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
                                            consoleInfo("ERR_SQL_ERROR", "changePass");
                                            callback(false, "ERR_SQL_ERROR");
                                        }else{
                                            callback(true, null);
                                            consoleInfo("Mot de passe changé avec succès pour id: "+id, "changePass");
                                            con.query("UPDATE password SET mdp=? WHERE id=?", [new_pass, id], (err)=>{
                                                if(err) {
                                                    sqlError(err);
                                                    consoleInfo("ERR_SQL_ERROR", "changePass");
                                                    callback(false, "ERR_SQL_ERROR");
                                                }else{
                                                    consoleInfo("Nouveau mot de passe stocké", "changePass");
                                                }
                                            });
                                        }
                                    });
                                }else{
                                    callback(false, "ERR_PASSWORD_NOT_MATCHING");
                                    consoleInfo("ERR_PASSWORD_NOT_MATCHING", "changePass");
                                }
                            }else if(result.length>1){
                                callback(false, "ERR_NOT_UNIQUE_ID");
                                consoleInfo("ERR_NOT_UNIQUE_ID", "changePass");
                            }else{
                                callback(false, "ERR_UNEXPECTED_ERROR");
                                consoleInfo("ERR_UNEXPECTED_ERROR", "changePass");
                            }
                        }
                    });
                }else if(result.length>1){
                    callback(false, "ERR_NOT_UNIQUE_UUID");
                    consoleInfo("ERR_NOT_UNIQUE_UUID", "changePass");
                }else{
                    callback(false, "ERR_NO_SESSION_FOUND");
                    consoleInfo("ERR_NO_SESSION_FOUND", "changePass");
                }
            }
        });
    });

    //res (bool) err (String)
    //UNVERIFIED
    socket.on('addFriend', function (uuid, f_id, message, callback) {
        if(typeof callback !== "function") {
            consoleInfo("ERR_NO_CALLBACK", "addFriend");
            return;
        }
        if(uuid===null || uuid==="") {
            callback(false, "ERR_NULL_UUID");
            consoleInfo("ERR_NULL_UUID", "addFriend");
            return;
        }

        if(f_id===null || f_id==="" && message===null || message==="") {
            callback(false, "ERR_MISSING_DATA");
            consoleInfo("ERR_MISSING_DATA", "addFriend");
            return;
        }
        if(typeof f_id !== "number") {
            callback(false, "ERR_INVALID_ID");
            consoleInfo("ERR_INVALID_ID", "addFriend");
            return;
        }

        con.query("SELECT id FROM uuid WHERE uuid=?", [uuid], function (err, result) {
            if(err) {
                sqlError(err);
                consoleInfo("ERR_SQL_ERROR", "addFriend");
                callback(false, "ERR_SQL_ERROR");
            }else {
                if(result.length===1) {
                    const id = result[0].id;
                    con.query("SELECT id FROM utilisateur WHERE id=?", [f_id], function (err, result) {
                        if(err) {
                            sqlError(err);
                            consoleInfo("ERR_SQL_ERROR", "addFriend");
                            callback(false, "ERR_SQL_ERROR");
                        }else{
                            if(result.length===1){
                                const f_id = result[0].id;
                                let sql = `INSERT INTO friend_${id} (f_id, message, status) VALUES (?, ?, ?)`;
                                con.query(sql, [f_id, message, 0], (err) =>  {
                                    if(err) {
                                        sqlError(err);
                                        consoleInfo("ERR_SQL_ERROR", "addFriend");
                                        callback(false, "ERR_SQL_ERROR");
                                    }else{
                                        sql = `INSERT INTO friend_${f_id} (f_id, message, status) VALUES (?, ?, ?)`;
                                        con.query(sql, [id, message, 1], (err) => {
                                            if(err) {
                                                sqlError(err);
                                                consoleInfo("ERR_SQL_ERROR", "addFriend");
                                                callback(false, "ERR_SQL_ERROR");
                                            }else{
                                                callback(true, null);
                                                consoleInfo("Friend request by " + id + "to " + f_id, "addFriend");
                                            }
                                        });
                                    }
                                });
                            }else if(result.length>1){
                                callback(false, "ERR_NOT_UNIQUE_UUID");
                                consoleInfo("ERR_NOT_UNIQUE_UUID", "addFriend");
                            }else{
                                callback(false, "ERR_NO_SESSION_FOUND");
                                consoleInfo("ERR_NO_SESSION_FOUND", "addFriend");
                            }
                        }
                    });
                }else if(result.length>1){
                    callback(false, "ERR_NOT_UNIQUE_UUID");
                    consoleInfo("ERR_NOT_UNIQUE_UUID", "addFriend");
                }else{
                    callback(false, "ERR_NO_SESSION_FOUND");
                    consoleInfo("ERR_NO_SESSION_FOUND", "addFriend");
                }
            }
        });
    });
});