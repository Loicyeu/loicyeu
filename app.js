const express = require('express');
const app = express();
const fs = require('fs');
const http = require('http').createServer(app);
/*const https = require('https').createServer({
    key: fs.readFileSync("privkey.pem"),
    cert: fs.readFileSync("fullchain.pem")
},app);*/
const io = require('socket.io')(http); //(https)
const mysql = require('mysql');
const uuid = require('uuid');

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

//ça saute !
http.listen(3000, () => {
    console.log('listening on :3000');
});
app.use(express.static('public'));

/*
* FONCTIONS
* */

function createDB() {
    con.query("CREATE DATABASE loicyeufr", function (err, result) {
        if(err) {
            if (err.code !== "ER_DB_CREATE_EXISTS") sqlError(err);
            else sqlWarning(err);
        } else sqlInfo("Database created");
    });
}

function createTables() {
    let sql = "CREATE TABLE utilisateur (id INT AUTO_INCREMENT PRIMARY KEY, nom VARCHAR(255), prenom VARCHAR(255), mdp VARCHAR(255), email VARCHAR(255))";
    con.query(sql, function (err) {
        if(err) {
            if (err.code === "ER_TABLE_EXISTS_ERROR") sqlWarning(err);
            else sqlError(err);
        } else sqlInfo("Table 'utilisateur' created");
    });
    sql = "CREATE TABLE uuid (user INT, uuid VARCHAR(255), expires BIGINT, PRIMARY KEY (user), FOREIGN KEY (user) REFERENCES utilisateur(id) ON DELETE CASCADE)"
    con.query(sql, function (err) {
        if(err) {
            if (err.code === "ER_TABLE_EXISTS_ERROR") sqlWarning(err);
            else sqlError(err);
        } else sqlInfo("Table 'uuid' created");
    });
}

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

function consoleInfo(info) {
    console.log("[GENERAL INFO] " + info);
}
/*
* FONCTIONS SOCKET
* */

io.on('connection', (socket) => {
    //console.log('user connected');

    //res {uuid, expires}
    //err (String)
    socket.on('loginUser', function (email, mdp, callback) {
        if(callback === null) return;
        if(email === null || mdp === null) {
            callback(false, "Mauvais identifiant / mot de passe");
            return;
        }
        const sql = "SELECT id FROM utilisateur WHERE email = \""+ email + "\" AND mdp = \"" + mdp + "\"";
        con.query(sql, function (err, result) {
            if(err) sqlError(err);
            else if(result.length === 1) {
                con.query("DELETE FROM uuid WHERE user=" + result[0].id, function (err) {
                    if(err) sqlError(err);
                    else {
                        const userUUID = uuid.v4();
                        const expires = Date.now() + 14400000;
                        const sql = "INSERT INTO uuid (user, uuid, expires) VALUES (" + result[0].id + ", \"" + userUUID + "\", " + expires + ")";
                        con.query(sql, function (err) {
                            if (err) sqlError(err);
                            else {
                                callback({
                                    uuid: userUUID,
                                    expires: expires
                                }, null);
                                consoleInfo("Connected user with uuid : " + userUUID + " and expire date : " + expires);
                            }
                        });
                    }
                });
            }else if(result.length > 1) callback(false, "Plusieurs entrées identiques. Connection refusé");
            else callback(false, "Mauvais identifiant / mot de passe");
        });
    });

    //res (bool) err (String)
    socket.on('registerUser', function (nom, prenom, mdp, email, callback) {
        const regexEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

        if(callback === null) return;
        if(email === null || mdp === null || nom === null || prenom === null) {
            callback(false, "L'un des champs est vide");
            return;
        }
        if(!regexEmail.test(email)){
            callback(false, "L'adresse email est invalide");
            return;
        }
        const sql = "SELECT id FROM utilisateur WHERE email = \"" + email + "\"";
        con.query(sql, function (err, result) {
            if(err) sqlError(err);
            else if(result.length === 0) {
                const sql2 = "INSERT INTO utilisateur(nom, prenom, mdp, email) VALUES (\"" + nom + "\", \"" + prenom + "\", \"" + mdp + "\", \"" + email +"\")";
                con.query(sql2, function (err) {
                    if(err) sqlError(err);
                    else callback(true, null);
                });
            }else{
                callback(false, "Adresse email déjà présente dans la base de données");
            }
        });
    });

    //res (bool) err (String)
    socket.on('isConnected', function (uuid, callback) {
        if(callback===null) return;
        if(uuid===null) {
            callback(false, "Empty UUID");
            return;
        }
        const sql = "SELECT * FROM uuid WHERE uuid=\"" + uuid + "\""
        con.query(sql, function (err, result) {
            if(err) sqlError(err);
            else {
                if(result.length===0) {
                    callback(false, "ERR_NO_SESSION_FOUND");
                    consoleInfo("ERR_NO_SESSION_FOUND");
                }else if(result[0].expires<Date.now()){
                    callback(false, "ERR_EXPIRED_SESSION");
                    consoleInfo("ERR_EXPIRED_SESSION");
                    con.query("DELETE FROM uuid WHERE user=" + result[0].user, (err) => {
                        if(err) sqlError(err);
                    });
                }else if(result[0].expires>Date.now()){
                    callback(true, null);
                    consoleInfo("Connected user with uuid : " + uuid);
                }else{
                    callback(false, "ERR_UNEXPECTED_ERROR")
                    consoleInfo("ERR_UNEXPECTED_ERROR");
                }
            }
        });
    });
});