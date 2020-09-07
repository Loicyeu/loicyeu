/*
 * Projet loicyeu
 * Created by Loicyeu <loic.henry2001@gmail.com>
 * Copyright (c) 2020.
 * All rights reserved.
 */

const con = require("./../config/db");
const WriteLog = require("./WriteLog");
const Password = require("./Password");
const Utilisateur = require("./Utilisateur");

/**
 * @typedef {string} UUID
 * @callback callback
 */

/**
 * Classe permettant de connecter un utilisateur au site
 * @name Login
 * @author Loicyeu
 * @version 1.0.0
 * @copyright Loicyeu 2020
 */
class Login {

    constructor(email, password) {
        this.email = email
        this.password = password
    }


    /**
     * Méthode permettant de savoir si les informations (email, password) sont présentes dans la base de données.
     * @param {callback} callback Le callback permettant de retourner la réponse.
     */
    exists(callback) {
        const email = this.email
        const password = this.password

        if(email === "" || password === "") {
            WriteLog.consoleInfo("ERR_EMPTY_DATA", "Login.exists");
            callback(false, {
                type: "warning",
                title: "Erreur",
                text: "l'un des champs est vide"
            });
            return;
        }

        const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if(!regexEmail.test(email)) {
            WriteLog.consoleInfo("ERR_INVALID_DATA", "Login.exists");
            callback(false, {
                type: "warning",
                title: "Erreur",
                text: "l'adresse mail n'est pas valide"
            });
            return;
        }

        con.query("SELECT * FROM utilisateur WHERE email = ?", [email], function (err, result) {
            if(err) {
                WriteLog.throwSQLError(err, "Login.exists");
                callback(false, {
                    type: "danger",
                    title: "Alerte",
                    text: "erreur inattendue"
                });
            }
            else if(result.length === 1) {

                if(Password.compare(password, result[0].hash)){
                    WriteLog.consoleInfo("User("+result[0].id+") found with good email and password", "Login.exists");
                    callback(true, new Utilisateur(result[0]));
                }else{
                    WriteLog.consoleInfo("ERR_NOT_FOUND_DATA : password", "Login.exists");
                    callback(false, {
                        type: "warning",
                        title: "Erreur",
                        text: "adresse email ou mot de passe invalide"
                    });
                }
            }else if(result.length > 1) {
                WriteLog.consoleInfo("ERR_NOT_UNIQUE_EMAIL", "Login.exists");
                callback(false, {
                    type: "warning",
                    title: "Erreur",
                    text: "adresse email ou mot de passe invalide"
                });
            }
            else {
                WriteLog.consoleInfo("ERR_NOT_FOUND_DATA : email", "Login.exists");
                callback(false, {
                    type: "warning",
                    title: "Erreur",
                    text: "adresse email ou mot de passe invalide"
                });
            }
        });

    }

    /**
     * Méthode permettant de connecter un Utilisateur pendant un certain temps.
     * @param {Utilisateur|number} user L'utilisateur ou son id, à connecter.
     * @param {UUID} uuid L'UUID de l'utilisateur.
     * @param {number} lifetime Le temps pendant lequel la connection doit être maintenue.
     * @param {callback} callback Le callback
     */
    static login(user, uuid, lifetime, callback) {
        let id = 0;
        if(typeof user === "number") id=user;
        else id=user.id

        con.query("DELETE FROM uuid WHERE id=?", [id], function (err) {
            if(err) {
                WriteLog.throwSQLError(err, "Login.login");
                callback(false, {
                    type: "danger",
                    title: "Alerte",
                    text: "erreur inattendue"
                });
            }else {
                const expires = Date.now() + lifetime;
                const sql = "INSERT INTO uuid (id, uuid, expires) VALUES (?, ?, ?)";
                con.query(sql, [id, uuid, expires], function (err) {
                    if(err) {
                        WriteLog.throwSQLError(err, "Login.login");
                        callback(false, {
                            type: "danger",
                            title: "Alerte",
                            text: "erreur inattendue"
                        });
                    }else {
                        WriteLog.consoleInfo("Connected user with uuid : " + uuid + " and expire date : " + expires);
                        callback(true);
                    }
                });
            }
        });


    }
}

module.exports = Login