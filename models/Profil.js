/*
 * Projet loicyeu
 * Created by Loicyeu <loic.henry2001@gmail.com>
 * Copyright (c) 2020.
 * All rights reserved.
 */

const con = require('../config/db')
const MySQLError = require("./Error/MySQLError");
const Error = require("./Error/Error");

/**
 * @callback Profil~requestedCallback
 * @param {boolean} result
 * @param {{err: string}|Object} info
 */

/**
 * Classe Profil
 * @name Profil
 * @author Loicyeu
 * @version 1.0.0
 * @copyright All right reserved 2020
 */
class Profil {

    /**
     * Méthode permettant de changer les informations d'un utilisateur.
     * @param {number} id L'id
     * @param {requestedCallback} callback
     */
    static getUserInfo(id, callback) {

        con.query("CALL get_user(?)", [id],function (err, result) {
            if(err) {
                callback(false, MySQLError.getDisplayableError(err));
            }else {
                callback(true, result[0][0]);
            }
        });
    }

    static updatePassword(pass, newPass1, newPass2, callback) {
        const Password = require("./Utils/Password");

        if(!Password.isValid(newPass1) || newPass1!==newPass2) {
            callback(false, {type: "warning", title: "Erreur", text: Error.UNEXPECTED_ERROR})
        }
    }
}

module.exports = Profil