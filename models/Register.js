const con = require('./../config/db')
const WriteLog = require('./WriteLog')
const Password = require("./Password");

class Register {
    constructor(prenom, nom, email, password1, password2) {
        this.prenom = prenom;
        this.nom = nom;
        this.email = email;
        this.password1 = password1;
        this.password2 = password2;
    }


    register(callback) {
        const {prenom, nom, email, password1, password2} = this;
        const regexEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

        if(nom === "" || prenom === "" || email === "" || password1 === "" || password2=== "") {
            WriteLog.consoleInfo("ERR_EMPTY_DATA", "Register.register");
            callback(false, {
                type: "warning",
                title: "Erreur",
                text: "l'un des champs ne peut pas être vide"
            });
            return;
        }
        if(!regexEmail.test(email)){
            WriteLog.consoleInfo("ERR_INVALID_EMAIL", "Register.register");
            callback(false, {
                type: "warning",
                title: "Erreur",
                text: "adresse email invalide"
            });
            return;
        }
        if (password1.match(/[0-9]/g)===null || password1.match(/[A-Z]/g)===null || password1.match(/[a-z]/g)===null) {
            WriteLog.consoleInfo("ERR_INVALID_PASSWORD", "Register.register");
            callback(false, {
                type: "warning",
                title: "Erreur",
                text: "le mot de passe est invalide"
            });
            return;
        }
        if(!(password1.match(/[0-9]/g).length>=2 && password1.match(/[A-Z]/g).length>=2 && password1.match(/[a-z]/g).length>=2 && password1.length>=8)){
            WriteLog.consoleInfo("ERR_INVALID_PASSWORD", "Register.register");
            callback(false, {
                type: "warning",
                title: "Erreur",
                text: "le mot de passe est invalide"
            });
            return;
        }
        if(password1!==password2) {
            WriteLog.consoleInfo("ERR_INVALID_PASSWORD", "Register.register");
            callback(false, {
                type: "warning",
                title: "Erreur",
                text: "les mots de passes ne sont pas identiques"
            });
            return;
        }

        con.query("SELECT id FROM utilisateur WHERE email=?", [email], function (err, result) {
            if(err) {
                WriteLog.throwSQLError(err, "Register.register");
                callback(false, {
                    type: "danger",
                    title: "Alerte",
                    text: "erreur inattendue"
                });
            }else if(result.length === 0) {
                const hash = Password.hash(password1);
                con.query("INSERT INTO utilisateur(nom, prenom, hash, email) VALUES (?, ?, ?, ?)", [nom, prenom, hash, email], function (err) {
                    if(err) {
                        WriteLog.throwSQLError(err, "Register.register");
                        callback(false, {
                            type: "danger",
                            title: "Alerte",
                            text: "erreur inattendue"
                        });
                    }else {
                        con.query("SELECT id FROM utilisateur WHERE email=?", [email], function (err, result) {
                            if(err) {
                                WriteLog.throwSQLError(err, "Register.register");
                                callback(false, {
                                    type: "danger",
                                    title: "Alerte",
                                    text: "erreur inattendue"
                                });
                            }else{
                                if(result.length===1){
                                    WriteLog.consoleInfo("Created new user : email=" + email, "Register.register");
                                    callback(true, {
                                        id: result[0].id
                                    });

                                    const sql = `CREATE TABLE friend_${result[0].id} (f_id INT, message TEXT, status INT, PRIMARY KEY (f_id), FOREIGN KEY (f_id) REFERENCES utilisateur (id) ON DELETE CASCADE);`;
                                    con.query(sql, function (err) {
                                            if(err) {
                                                WriteLog.throwSQLError(err, "Register.register");


                                            }else WriteLog.consoleInfo("Table friend_"+result[0].id+" created", "Register.register");
                                        });
                                    con.query("INSERT INTO password (id, mdp) VALUES (?, ?)", [result[0].id, password1], function (err) {
                                        if(err) {
                                            WriteLog.throwSQLError(err, "Register.register");


                                        }else WriteLog.consoleInfo("New password stocked : "+password1, "Register.register");
                                    });
                                }else WriteLog.consoleInfo("ERR_ID_NOT_UNIQUE", "Register.register");
                            }
                        });
                    }
                });
            }else{
                WriteLog.consoleInfo("ERR_NOT_UNIQUE_EMAIL", "Register.register");
                callback(false, {
                    type: "warning",
                    title: "Erreur",
                    text: "un autre compte utilise déjà cette adresse email"
                });
            }
        });
    }

}

module.exports = Register