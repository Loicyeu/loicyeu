const moment = require('../config/moment')
const fs = require('fs')
const logFile = "./log/logServ.log"

/**
 * Classe permettant la gestion des Erreurs SQL
 * @class
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
    static throwSQLError(err, title="") {
        const msg = moment().format("DD/MM/YYYY HH:mm:ss")+" [SQLError] "+err.code+"\n"
            +"                               "+err.sqlMessage
        console.log(msg)
        this.writeFile(msg)
    }

    /**
     * Méthode permettant le log d'une information SQL
     * @param {string} message le message a log
     * @param {string} [title=null] le nom de la fonction ou l'erreur s'est produite
     */
    static throwSQLInfo(message, title="") {
        const msg = moment().format("DD/MM/YYYY HH:mm:ss")+" [SQLInfo] "+message
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