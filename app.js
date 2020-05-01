const express = require('express')
const app = express()
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const mysql = require('mysql');
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const saltRound = 10;
const port = 3000

http.listen(port, () => {
    console.log('listening on port : '+port);
});

//app.listen(port, () => console.log(`Listening on port ${port}`))
app.use(express.static('public'));

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
    let sql = "CREATE TABLE theme (id INT AUTO_INCREMENT PRIMARY KEY, theme VARCHAR(255), color VARCHAR(255))";
    con.query(sql, function (err) {
        if(err) {
            if (err.code === "ER_TABLE_EXISTS_ERROR") sqlWarning(err);
            else sqlError(err);
        } else sqlInfo("Table 'themes' created");
    });
    sql = "CREATE TABLE article (id INT AUTO_INCREMENT PRIMARY KEY, writer INT, date BIGINT, title TEXT, corps MEDIUMTEXT, theme INT, attachment TEXT, FOREIGN KEY (writer) REFERENCES utilisateur(id) ON DELETE CASCADE, FOREIGN KEY (theme) REFERENCES theme(id))"
    con.query(sql, function (err) {
        if(err) {
            if (err.code === "ER_TABLE_EXISTS_ERROR") sqlWarning(err);
            else sqlError(err);
        } else sqlInfo("Table 'article' created");
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

//password
function hashPassword(pass) {
    return bcrypt.hashSync(pass, saltRound);
}
function testPasswordHash(pass, hash) {
    return bcrypt.compareSync(pass, hash);
}

/*
* SOCKET
* */

io.on('connection', (socket) => {

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
                                    if(result[0].role>=2){
                                        callback({
                                            uuid: userUUID,
                                            expires: expires
                                        }, null);
                                        consoleInfo("Connected user with uuid : " + userUUID + " and expire date : " + expires);
                                    }else {
                                        callback(false, "ERR_LIMITED_PERMISSION");
                                        consoleInfo("Permission insufisantes", "loginUser");
                                    }
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

    //res {theme}
    socket.on('getTheme', function (callback) {
        if(typeof callback !== "function") {
            consoleInfo("ERR_NO_CALLBACK", "loginUser");
            return;
        }
        con.query("SELECT * FROM theme", function (err, result) {
            if(err) {
                sqlError(err);
                consoleInfo("ERR_SQL_ERROR", "loginUser");
                callback(false, "ERR_SQL_ERROR");
            }else{
                callback(result, null);
            }
        });
    });

    //res (bool)
    socket.on('sendArticle', function (title, corps, theme, uuid, callback) {
        if(typeof callback !== "function") {
            consoleInfo("ERR_NO_CALLBACK", "sendArticle");
            return;
        }
        if(title === "" || corps=== "" || theme==="" || uuid==="") {
            callback(false, "ERR_EMPTY_DATA");
            consoleInfo("ERR_EMPTY_DATA", "sendArticle");
            return;
        }

        con.query("SELECT id FROM uuid WHERE uuid=\""+uuid+"\"", function (err, result) {
            if(err) {
                sqlError(err);
                consoleInfo("ERR_SQL_ERROR", "sendArticle");
                callback(false, "ERR_SQL_ERROR");
            }
            else if(result.length === 1) {
                con.query("SELECT * FROM utilisateur WHERE id="+result[0].id, function (err, result) {
                    if(err) {
                        sqlError(err);
                        consoleInfo("ERR_SQL_ERROR", "sendArticle");
                        callback(false, "ERR_SQL_ERROR");
                    }else{
                        if(result.length===1) {
                            const sql = "INSERT INTO article(writer, date, title, corps, theme) VALUES " +
                                "("+result[0].id+", "+Date.now()+", \""+title+"\", ?, "+theme+")";
                            con.query(sql, [corps], function (err) {
                                if(err){
                                    sqlError(err);
                                    consoleInfo("ERR_SQL_ERROR", "sendArticle");
                                    callback(false, "ERR_SQL_ERROR");
                                }else{
                                    callback(true, null);
                                }
                            })
                        }else if(result.length > 1) {
                            callback(false, "ERR_ID_NOT_UNIQUE");
                            consoleInfo("ERR_ID_NOT_UNIQUE", "sendArticle");
                        }
                        else {
                            callback(false, "ERR_NOT_FOUND_DATA");
                            consoleInfo("ERR_NOT_FOUND_DATA", "sendArticle");
                        }
                    }
                });
            } else if(result.length > 1) {
                callback(false, "ERR_NOT_UNIQUE_UUID");
                consoleInfo("ERR_NOT_UNIQUE_UUID", "sendArticle");
            }
            else {
                callback(false, "ERR_NOT_FOUND_DATA");
                consoleInfo("ERR_NOT_FOUND_DATA", "sendArticle");
            }
        });
    });

    //res (bool)
    socket.on('getArticle', function (callback) {
        if(typeof callback !== "function") {
            consoleInfo("ERR_NO_CALLBACK", "getArticle");
            return;
        }
        const sql="select date, title, corps, t.theme, nom, prenom, color from article a, utilisateur u, theme t where a.writer=u.id and a.theme=t.id;"
        con.query(sql, function (err, result) {
            if(err) {
                sqlError(err);
                consoleInfo("ERR_SQL_ERROR", "getArticle");
                callback(false, "ERR_SQL_ERROR");
            }else{
                if(result.length===0){
                    callback(true, null);
                    consoleInfo("Aucun article trouvé", "getArticle");
                }else{
                    callback(result, null);
                    consoleInfo("Articles trouvés", "getArticle");
                }
            }
        });
    });
});