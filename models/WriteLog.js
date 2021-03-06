/*
 * Projet loicyeu
 * Created by Loicyeu <loic.henry2001@gmail.com>
 * Copyright (c) 2020.
 * All rights reserved.
 */

const moment = require('../config/moment')
const fs = require('fs')
const logFile = "./log/logServ.log"

/**
 * Classe permettant la gestion des Erreurs SQL
 * @name WriteLog
 * @author Loicyeu
 * @version 1.0.0
 * @copyright All right reserved 2020
 */
class WriteLog {

    /**
     * Méthode permettant d'afficher dans les logs le démarrage du serveur
     */
    static startServ() {
        let msg = "\n---------- DEMARRAGE DU SERVEUR "+moment().format('DD/MM/YYYY HH:mm:ss')+" ----------"
        console.log(msg);
        this.writeFile(msg)
    }

    /**
     * Méthode permettant le log d'une erreur SQL
     * @param {SQLError} err l'erreur a log
     * @param {string} err.code
     * @param {string} err.sqlMessage
     * @param {string} [title=null] le nom de la fonction ou l'erreur s'est produite
     */
    static throwSQLError(err, title="SQLError") {
        const msg = moment().format("DD/MM/YYYY HH:mm:ss")
            + ` [${title}] ${err.code}\n                               ${err.sqlMessage}`
        console.log(msg)
        this.writeFile(msg)
    }

    /**
     * Méthode permettant le log d'une information SQL
     * @param {string} message le message a log
     * @param {string} [title="SQLInfo"] le nom de la fonction ou l'erreur s'est produite
     */
    static throwSQLInfo(message, title="SQLInfo") {
        const msg = moment().format("DD/MM/YYYY HH:mm:ss")+` [${title}] ${message}`
        console.log(msg);
        this.writeFile(msg)
    }

    /**
     * Méthode permettant le log d'une information générale
     * @param {string} info l'information a log
     * @param {string} [title = GENERAL_INFO] le titre de l'information a log
     */
    static consoleInfo(info, title) {
        let msg = (title!==undefined ? "["+title+"] ":"[GENERAL INFO] ")+ info
        console.log(msg);
        this.writeFile(moment().format("DD/MM/YYYY HH:mm:ss") + " " + msg)
    }

    /**
     * Méthode permettant d'écrire un log dans le fichier de log
     * @param {string} msg le log a écrire
     */
    static writeFile(msg) {
        fs.appendFile(logFile, msg+"\n", function (err) {
            if(err) throw err;
        })
    }

}

module.exports = WriteLog