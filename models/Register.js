/*
 * Projet loicyeu
 * Created by Loicyeu <loic.henry2001@gmail.com>
 * Copyright (c) 2020.
 * All rights reserved.
 */

const con = require('./../config/db')
const WriteLog = require('./WriteLog')
const Password = require("./Password");
const MySQLError = require("./MySQLError");

/**
 * @callback Register~requestedCallback
 * @param {boolean} response
 * @param {*} info
 */

/**
 * Classe Register
 * @name Register
 * @author Loicyeu
 * @version 1.2.0
 * @copyright All right reserved 2020
 */
class Register {
    constructor(prenom, nom, email, password1, password2) {
        this.prenom = prenom;
        this.nom = nom;
        this.email = email;
        this.password1 = password1;
        this.password2 = password2;
    }

    /**
     * Methode permettant de créer un nouvel Utilisateur
     * @param {requestedCallback} callback Le callback
     * @since 1.0.0
     * @version 1.2.0
     */
    register(callback) {
        const {prenom, nom, email, password1, password2} = this;
        const regexEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

        //region VERIFS
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
        //endregion VERIFS
        const hash = Password.hash(password1);

        con.query("CALL create_user(?, ?, ?, ?)", [nom, prenom, email, hash], (err, result)=>{
            if(err) {
                WriteLog.throwSQLError(err);
                callback(false, MySQLError.getDisplayableError(err))
            }else {
                WriteLog.consoleInfo(`New user registered : ${email}`)
                callback(true, result[0][0])
            }
        });
    }

}

module.exports = Register