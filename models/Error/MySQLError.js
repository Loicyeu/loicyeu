/*
 * Projet loicyeu
 * Created by Loicyeu <loic.henry2001@gmail.com>
 * Copyright (c) 2020.
 * All rights reserved.
 */

const WriteLog = require('../Utils/WriteLog');
const Error = require('./Error');

/**
 * Classe MySQLError qui hérite de Error
 * @name MySQLError
 * @see Error
 * @author Loicyeu
 * @version 1.1.0
 * @copyright All right reserved 2020
 */
class MySQLError extends Error {

    static MYSQL_NO_EMAIL_FOUND = "adresse email ou mot de passe invalide."
    static MYSQL_EMAIL_ALREADY_TAKEN = "un autre compte utilise déjà cette adresse email."

    /**
     * Méthode qui permet de savoir si une erreur MySQL est une erreur qui n'aurait jamais du arriver.
     * Si tel est le cas alors la méthode se charge de log l'information et de retourner vrai sinon, elle se contente de retourner faux.
     * @param {*} error Une erreur de MySQL
     * @return {boolean} Retourne vrai si l'erreur était "fatale", faux sinon.
     * @since 1.0.0
     * @version 1.0.0
     */
    static isFatalError(error) {
        if(error.code===9999 || error.sqlMessage==="MYSQL_ERR_UNEXPECTED"){
            WriteLog.throwSQLError(error, "FATAL ERROR");
            return true;
        }
        return false;
    }

    /**
     * Méthode permettant de transformer un code d'erreur de MySQL en
     * un texte, un titre et un type d'erreur.
     * Si <tt>error</tt> est null ou est une chaine vide alors la méthode retourne <tt>null</tt>.
     * Si l'erreur est classé comme "fatale" elle sera alors log.
     * @param {{sqlMessage: string}} error L'erreur MySQL
     * @return {{type:string, title: string, text: string}|null} Le message d'erreur
     * @see isFatalError
     * @since 1.0.0
     * @version 1.0.0
     */
    static getDisplayableError(error) {
        this.isFatalError(error);

        switch (error.sqlMessage) {
            case null:
            case undefined:
            case "":
                return null;

            case "MYSQL_ERR_NO_EMAIL_FOUND":
                return {type: "warning", title: "Erreur", text: this.MYSQL_NO_EMAIL_FOUND}
            case "MYSQL_ERR_EMAIL_ALREADY_TAKEN":
                return {type: "warning", title: "Erreur", text: this.MYSQL_EMAIL_ALREADY_TAKEN}

            //Unexpected Errors
            case "MYSQL_ERR_NO_USER_FOUND":
            case "MYSQL_ERR_TOO_MUCH_USER":
            case "MYSQL_ERR_UNEXPECTED":
            default:
                return {type: "danger", title:"Alerte", text: this.UNEXPECTED_ERROR};
        }
    }

}

module.exports = MySQLError