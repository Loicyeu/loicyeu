const con = require('../config/db')
const WriteLog = require('models/WriteLog')
const bcrypt = require('bcrypt')
const saltRound = 10

/**
 * Définition du callback
 * @callback requestedCallback
 * @param {Object} response
 * @param {Object} error
 */

/**
 * @typedef {Object} row
 * @typedef {number} id
 * @typedef {string} mdp
 * @typedef {string} hash
 */

/**
 * Classe représentant un mot de passe dans la base de données
 * @name Password
 * @author Loicyeu
 * @since 0.1.0
 * @copyright Loicyeu 2020
 */
class Password {

    /** @constructor
     * Constructeur qui permet de créer l'objet Password
     * @param {row} row une ligne de base donnée comportant un id et un mot de passe
     */
    constructor(row) {
        this.row = row
    }

    /**
     * Getter qui retourne l'id du mot de passe
     * @returns {id}
     */
    get id() {
        return this.row.id
    }

    /**
     * Getter qui retourne le mot de passe
     * @returns {mdp} le mot de passe
     */
    get password() {
        return this.row.password
    }

    /**
     * Méthode permettant de créer un nouveau mot de passe dans la base de données
     * @param {id} id l'id de l'utilisateur a qui l'on veut stocker le mot de passe
     * @param {mdp} password le mot de passe que l'on veut stocker
     * @param {requestedCallback} callback
     */
    static create(id, password, callback) {
        con.query("INSERT INTO password VALUES(?, ?)", [id, password], function (err, result) {
            if(err) WriteLog.throw(err)
            callback(result)
        })
    }

    /**
     * Méthode permettant de supprimer un mot de passe de la base de données
     * @param {id} id l'id du mot de passe a supprimer
     * @param {requestedCallback} callback
     */
    static delete(id, callback) {
        con.query("DELETE FROM password WHERE id=?", [id], function (err, result) {
            if(err) WriteLog.throw(err)
            callback(result)
        })
    }

    /**
     * Méthode permetant de mettre a jour un mot de passe dans la base de données
     * @param {id} id l'id du mot de passe a mettre a jour
     * @param {mdp} password le nouveau mot de passe
     * @param {requestedCallback} callback
     */
    static update(id, password, callback) {
        con.query("UPDATE password SET mdp=? WHERE id=?", [password, id], function (err, result) {
            if(err) WriteLog.throw(err)
            callback(result)
        })
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
}

module.exports = Password