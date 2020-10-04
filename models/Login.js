/*
 * Projet loicyeu
 * Created by Loicyeu <loic.henry2001@gmail.com>
 * Copyright (c) 2020.
 * All rights reserved.
 */

const con = require("./../config/db");
const WriteLog = require("./WriteLog");
const Password = require("./Password");
const MySQLError = require("./MySQLError");

/**
 * @callback Login~requestedCallback
 * @param {boolean} res
 * @param {{type: string, title: string, text: string}} info
 */

/**
 * Classe permettant de connecter un utilisateur au site
 * @name Login
 * @author Loicyeu
 * @version 1.2.0
 * @copyright All right reserved 2020
 */
class Login {

    /**
     * Méthode permettant de savoir si les informations (email, password) sont présentes dans la base de données.
     * @param {string} email L'adresse email de l'utilisateur
     * @param {string} password Le mot de passe de l'utilisateur
     * @param {requestedCallback} callback Le callback permettant de retourner la réponse.
     * @since 1.0.0
     * @version 1.2.0
     */
    exists(email, password, callback) {

        //region VERIFS
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
        //endregion VERIFS

        con.query("CALL get_user_hash(?)", [email], function (err, result) {
            if(err) {
                WriteLog.throwSQLError(err, "Login.exists");
                callback(false, MySQLError.getDisplayableError(err));

            }else {
                if(Password.compare(password, result[0][0].hash)){
                    WriteLog.consoleInfo(`User(${result[0][0].id}) is connected`, "Login.exists");
                    callback(true, result[0][0]);
                }else{
                    WriteLog.consoleInfo("ERR_NOT_FOUND_DATA : password", "Login.exists");
                    callback(false, {
                        type: "warning",
                        title: "Erreur",
                        text: "adresse email ou mot de passe invalide"
                    });
                }
            }
        });

    }
}

module.exports = Login