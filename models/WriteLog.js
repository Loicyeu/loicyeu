const moment = require('../config/moment')
const fs = require('fs')
const logFile = "./log/logServ.log"

/**
 * Classe permettant la gestion des Erreurs SQL
 * @name WriteLog
 * @author Loicyeu
 * @since 0.1.0
 * @copyright Loicyeu 2020
 */
class WriteLog {

    /**
     * Méthode permettant d'afficher dans les logs le démarrage du serveur
     */
    static startServ() {
        let msg = "---------- DEMARRAGE DU SERVEUR ----------"
        console.log(msg);
        this.writeFile(msg)
    }

    /**
     * Méthode permettant le log d'une erreur SQL
     * @param {SQLError} err l'erreur a log
     * @param {string} err.code
     * @param {string} err.sqlMessage
     */
    static throwSQLError(err) {
        const msg = moment().format("DD/MM/YYYY HH:mm:ss")+" [SQLError] "+err.code+"\n"
            +"                               "+err.sqlMessage+"\n"
        console.log(msg)
        this.writeFile(msg)
    }

    /**
     * Méthode permettant le log d'une information SQL
     * @param {string} message le message a log
     */
    static throwSQLInfo(message) {
        const msg = moment().format("DD/MM/YYYY HH:mm:ss")+" [SQLInfo] "+message+"\n"
        console.log(msg);
        this.writeFile(msg)
    }

    /**
     * Méthode permettant d'écrire un log dans le fichier de log
     * @param {string} msg le log a écrire
     */
    static writeFile(msg) {
        fs.appendFile(logFile, msg, function (err) {
            if(err) throw err;
        })
    }

}

module.exports = WriteLog