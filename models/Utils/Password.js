/*
 * Projet loicyeu
 * Created by Loicyeu <loic.henry2001@gmail.com>
 * Copyright (c) 2020.
 * All rights reserved.
 */

const con = require('../../config/db')
const MySQLError = require('../Error/MySQLError')
const bcrypt = require('bcrypt')
const saltRound = 10

/**
 * Définition du callback
 * @callback requestedCallback
 * @param {Object} response
 * @param {Object} error
 */

/**
 * Classe représentant un mot de passe dans la base de données
 * @name Password
 * @author Loicyeu
 * @version 1.0.0
 * @copyright All right reserved 2020
 */
class Password {


    /**
     * Méthode permetant de mettre a jour un mot de passe dans la base de données
     * @param {id} id l'id du mot de passe a mettre a jour
     * @param {mdp} password le nouveau mot de passe
     * @param {requestedCallback} callback
     */
    static update(id, password, callback) {
        con.query("CALL update_user_password(?, ?)", [id, password], function (err, result) {
            if(err) {
                MySQLError.getDisplayableError(err);
            }
            callback(result)
        });
    }

    /**
     * Méthode qui permet de hash un mot de passe
     * @param {mdp} password le mot de passe a hash
     * @returns {String} le hash correspondant au mot de passe
     */
    static hash(password) {
        return bcrypt.hashSync(password, saltRound);
    }

    /**
     * Méthode static qui permet de savoir si un mot de passe est égal a un hash
     * @param {mdp} password le mot de passe a comparer
     * @param {hash} hash le hash a comprarer
     * @returns {boolean} vrai si le mot de passe correspond au hash, faux sinon
     */
    static compare(password, hash) {
        return bcrypt.compareSync(password, hash);
    }

    /**
     * Méthode static qui permet de savoir si un mot de passe est valide.
     * @param {mdp} password Le mot de passe a tester
     * @returns {{res: boolean, err: string}}
     */
    static isValid(password) {
        const passNumber = new RegExp("[0-9]", "g");
        const passUppercase = new RegExp("[A-Z]", "g");
        const passLowercase = new RegExp("[a-z]", "g");

        if(password==="") return {res: false, err: "ERR_PASSWORD_EMPTY"};
        else if(password.match(passNumber)===null || password.match(passUppercase)===null || password.match(passLowercase)===null) return {res: false, err: "ERR_PASSWORD_INVALID"};
        else if(password.match(passNumber).length<2 || password.match(passUppercase).length<2 || password.match(passLowercase).length<2) return {res: false, err: "ERR_PASSWORD_INVALID"};
        else if(password.length<8) return {res: false, err: "ERR_PASSWORD_TOO_SHORT"}
        else return {res: true, err: ""}
    }
}

module.exports = Password