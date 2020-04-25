const express = require('express');
const app = express();
const fs = require('fs');
const http = require('http').createServer(app);
/*const https = require('https').createServer({
    key: fs.readFileSync("private_key.key"),
    cert: fs.readFileSync("cer.cer")
},app);*/
const io = require('socket.io')(http); //(https)
const mysql = require('mysql');
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const saltRound = 10;

const con = mysql.createConnection({
    host: "localhost",
    user: "loicyeu",
    password: "123abc+-=",
    database: "loicyeufr"
});
con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    createTables();
});

//https
http.listen(3000, () => {
    console.log('listening on port : 3000');
});
app.use(express.static('public'));

/*TODO
*  - gestion d'acces des pages Express
*  - Modification mot de passe
*  - Personnalisation des erreurs
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
    let sql = "CREATE TABLE utilisateur (id INT AUTO_INCREMENT PRIMARY KEY, nom VARCHAR(255), prenom VARCHAR(255), sexe INT, hash VARCHAR(255), email VARCHAR(255), role INT)";
    con.query(sql, function (err) {
        if(err) {
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
}
function sqlWarning(err) {
    console.log("[SQL WARNING] Code    : " + err.code
        + "\n[SQL WARNING] Message : " + err.sqlMessage);
}
function sqlInfo(info) {
    console.log("[SQL INFO] " + info);
}

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
        if(callback === null) {
            consoleInfo("ERR_NO_CALLBACK", "loginUser");
            return;
        }
        if(email === null || mdp === null) {
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
                    con.query("DELETE FROM uuid WHERE id=" + result[0].id, function (err) {
                        if(err) {
                            sqlError(err);
                            consoleInfo("ERR_SQL_ERROR", "loginUser");
                            callback(false, "ERR_SQL_ERROR");
                        }else {
                            const userUUID = uuid.v4();
                            const expires = Date.now() + 14400000;
                            const sql = "INSERT INTO uuid (id, uuid, expires) VALUES (" + result[0].id + ", \"" + userUUID + "\", " + expires + ")";
                            con.query(sql, function (err) {
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
                    callback(false, "ERR_DATA_NOT_FOUND");
                    consoleInfo("ERR_DATA_NOT_FOUND : password", "loginUser");
                }
            }else if(result.length > 1) {
                callback(false, "ERR_EMAIL_NOT_UNIQUE");
                consoleInfo("ERR_EMAIL_NOT_UNIQUE", "loginUser");
            }
            else {
                callback(false, "ERR_DATA_NOT_FOUND");
                consoleInfo("ERR_DATA_NOT_FOUND : email", "loginUser");
            }
        });
    });

    //res (bool) err (String)
    socket.on('registerUser', function (nom, prenom, mdp, email, callback) {
        const regexEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

        if(callback === null) {
            consoleInfo("ERR_NO_CALLBACK", "registerUser");
            return;
        }
        if(email === null || mdp === null || nom === null || prenom === null) {
            callback(false, "ERR_EMPTY_DATA");
            consoleInfo("ERR_EMPTY_DATA", "registerUser");
            return;
        }
        if(!regexEmail.test(email)){
            callback(false, "ERR_EMAIL_INVALID");
            consoleInfo("ERR_EMAIL_INVALID", "registerUser");
            return;
        }
        const sql = "SELECT id FROM utilisateur WHERE email = \"" + email + "\"";
        con.query(sql, function (err, result) {
            if(err) {
                sqlError(err);
                consoleInfo("ERR_SQL_ERROR", "registerUser");
                callback(false, "ERR_SQL_ERROR");
            }else if(result.length === 0) {
                const hash = hashPassword(mdp);
                const sql2 = "INSERT INTO utilisateur(nom, prenom, hash, email) VALUES (\"" + nom + "\", \"" + prenom + "\", \"" + hash + "\", \"" + email +"\")";
                con.query(sql2, function (err) {
                    if(err) {
                        sqlError(err);
                        consoleInfo("ERR_SQL_ERROR", "registerUser");
                        callback(false, "ERR_SQL_ERROR");
                    }else {
                        callback(true, null);
                        consoleInfo("Create new user : email=" + email, "registerUser");
                        con.query("SELECT id FROM utilisateur WHERE email=\""+ email +"\"", function (err, result) {
                            if(err) {
                                sqlError(err);
                                consoleInfo("ERR_SQL_ERROR", "registerUser");
                                callback(false, "ERR_SQL_ERROR");
                            }else{
                                if(result.length===1){
                                    con.query("CREATE TABLE friend_"+result[0].id+" (f_id INT, message TEXT, confirm BOOLEAN, FOREIGN KEY (f_id) REFERENCES utilisateur (id) ON DELETE CASCADE);",
                                        function (err) {
                                        if(err) {
                                            sqlError(err);
                                            consoleInfo("ERR_SQL_ERROR", "registerUser");
                                            callback(false, "ERR_SQL_ERROR");
                                        }else consoleInfo("Table friend_"+result[0].id+" created", "registerUser");
                                    });
                                    con.query("INSERT INTO password (id, mdp) VALUES (" + result[0].id + ", \""+ mdp + "\")", function (err) {
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
                callback(false, "ERR_EMAIL_NOT_UNIQUE");
                consoleInfo("ERR_EMAIL_NOT_UNIQUE", "registerUser");
            }
        });
    });

    //res (bool) err (String)
    socket.on('isConnected', function (uuid, callback) {
        if(callback===null) {
            consoleInfo("ERR_NO_CALLBACK", "isConnected");
            return;
        }
        if(uuid===null) {
            consoleInfo("ERR_EMPTY_DATA", "isConnected");
            callback(false, "ERR_EMPTY_DATA");
        }
        const sql = "SELECT * FROM uuid WHERE uuid=\""+uuid+"\""
        con.query(sql, function (err, result) {
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
                    con.query("DELETE FROM uuid WHERE id=" + result[0].id, (err) => {
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
        if(callback===null) {
            consoleInfo("ERR_NO_CALLBACK", "userInfo");
            return;
        }
        if(uuid===null) {
            callback(false, "ERR_UUID_NULL");
            consoleInfo("ERR_UUID_NULL", "userInfo");
            return;
        }
        const sql = "SELECT id FROM uuid WHERE uuid=\"" + uuid + "\""
        con.query(sql, function (err, result) {
            if(err) {
                sqlError(err);
                consoleInfo("ERR_SQL_ERROR", "userInfo");
                callback(false, "ERR_SQL_ERROR");
            }
            else{
                if(result.length===1){
                    const id = result[0].id;
                    const sql2 = "SELECT * FROM utilisateur WHERE id=" + id;
                    con.query(sql2, function (err, result) {
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
                    callback(false, "ERR_UUID_NOT_UNIQUE");
                    consoleInfo("ERR_UUID_NOT_UNIQUE", "userInfo");
                }else{
                    callback(false, "ERR_DATA_NOT_FOUND");
                    consoleInfo("ERR_DATA_NOT_FOUND", "userInfo");
                }
            }
        });
    });

    //res (bool) err (String)
    socket.on('changeInfo', function (info, uuid, callback) {
        if(callback===null) {
            consoleInfo("ERR_NO_CALLBACK", "changeInfo");
            return;
        }
        if(uuid===null) {
            callback(false, "ERR_UUID_NULL");
            consoleInfo("ERR_UUID_NULL", "changeInfo");
            return;
        }
        if(info===null) {
            callback(false, "ERR_MISSING_DATA");
            consoleInfo("ERR_MISSING_DATA", "changeInfo");
            return;
        }
        con.query("SELECT id FROM uuid WHERE uuid=\"" + uuid + "\"", function (err, result) {
            if(err) {
                sqlError(err);
                consoleInfo("ERR_SQL_ERROR", "userInfo");
                callback(false, "ERR_SQL_ERROR");
            }else {
                if(result.length===1){
                    const nom = info.hasOwnProperty("nom") ? info.nom : null;
                    const prenom = info.hasOwnProperty("prenom") ? info.prenom : null;
                    const sexe = info.hasOwnProperty("sexe") ? info.sexe : null;
                    const email = info.email;
                    const sql = "UPDATE utilisateur SET email=\"" + email + "\"" +
                        (nom===null ? "" : ", nom=\"" + nom + "\"") +
                        (prenom===null ? "" : ", prenom=\"" + prenom + "\"") +
                        (sexe===null ? "" : ", sexe=" + sexe) +
                        " WHERE id=" + result[0].id;
                    con.query(sql, function (err) {
                        if(err) {
                            sqlError(err);
                            consoleInfo("ERR_SQL_ERROR", "userInfo");
                            callback(false, "ERR_SQL_ERROR");
                        }else {
                            consoleInfo("Mise a jour profil with id=" + result[0].id, "changeInfo");
                            callback(true, null);
                        }
                    });
                }else if(result.length>1){
                    callback(false, "ERR_UUID_NOT_UNIQUE");
                    consoleInfo("ERR_UUID_NOT_UNIQUE", "changeInfo");
                }else{
                    callback(false, "ERR_NO_SESSION_FOUND");
                    consoleInfo("ERR_NO_SESSION_FOUND", "changeInfo");
                }
            }
        });
    });
});