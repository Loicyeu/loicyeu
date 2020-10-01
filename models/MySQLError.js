/*
 * Projet loicyeu
 * Created by Loicyeu <loic.henry2001@gmail.com>
 * Copyright (c) 2020.
 * All rights reserved.
 */
const WriteLog = require('./WriteLog');

/**
 * Classe MySQLError
 * @class MySQLError
 * @version 1.0.0
 * @copyright Loicyeu 2020
 */
class MySQLError{

    /**
     * Méthode qui permet de savoir si une erreur MySQL est une erreur qui n'aurait jamais du arriver.
     * Si tel est le cas alors la méthode se charge de log l'information et de retourner vrai sinon, elle se contente de retourner faux.
     * @param {*} error Une erreur de MySQL
     * @return {boolean} Retourne vrai si l'erreur était "fatale", faux sinon.
     * @since 1.0.0
     * @version 1.0.0
     */
    static isFatalError(error) {
        if(error.code===9999){
            WriteLog.throwSQLError(error, "FATAL ERROR");
            return true;
        }
        return false;
    }

    /**
     * Méthode permettant de récupérer un message d'erreur plus lisible pour chaque erreur MySQL.
     * @param {*} error L'erreur MySQL
     * @return {{type:string, title: string, text: string}} Le message d'erreur
     * @since 1.0.0
     * @version 1.0.0
     */
    static getDisplayableError(error) {
        switch (error.sqlMessage) {
            case "MYSQL_ERR_NO_HASH_FOUND":
                return {type: "warning", title: "Erreur", text: "adresse email ou mot de passe invalide"}

            //Unexpected Errors
            case "MYSQL_ERR_TOO_MUCH_HASH":
            case "MYSQL_ERR_UNEXPECTED":
            default:
                return {type: "danger", title:"Alerte", text:"une erreur inattendue s'est produite."};
        }
    }

}

module.exports = MySQLError