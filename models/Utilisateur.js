/*
 * Projet loicyeu
 * Created by Loicyeu <loic.henry2001@gmail.com>
 * Copyright (c) 2020.
 * All rights reserved.
 */

const con = require('../config/db')
const WriteLog = require('./WriteLog')
const Password = require('./Password')

/**
 * Définition du callback
 * @callback Utilisateur~requestedCallback
 * @param {*} response
 * @param {Object} error
 */

/**
 * Classe représentant un Utilisateur dans la base de données
 * @name Utilisateur
 * @author Loicyeu
 * @version 1.0.0
 * @copyright All right reserved 2020
 */
class Utilisateur {

    /** @constructor
     * Constructeur qui permet de créer l'objet Utilisateur
     * @param {row} row une ligne de base donné comportant un id, un nom, un prenom, un sexe, un hash, un email et un role
     */
    constructor(row) {
        this.row = row
    }

    /**
     * Getter retournant l'id de l'utilisateur
     * @returns {id}
     */
    get id() {
        return this.row.id
    }

    /**
     * Getter retournant le nom de l'utilsateur
     * @returns {string}
     */
    get nom() {
        return this.row.nom
    }

    /**
     * Getter retournant le prenom de l'utilisateur
     * @returns {string}
     */
    get prenom() {
        return this.row.prenom
    }

    /**
     * Getter retournant le sexe de l'utilisateur
     * @returns {number} 1=Homme, 2=Femme, 3=Autre
     */
    get sexe() {
        return this.row.sexe
    }

    /**
     * Getter retournant le hash de l'utilisateur
     * @returns {string}
     */
    get hash() {
        return this.row.hash
    }

    /**
     * Getter retournant l'email de l'utilisateur
     * @returns {string}
     */
    get email() {
        return this.row.email
    }

    /**
     * Getter retournant le role de l'utilisateur
     * @returns {number} 0=default, 1=VIP, 2=modo, 3=admin
     */
    get role() {
        return this.row.role
    }

    /**
     * Méthode permattant de créer un utilisateur dans la base de données
     * @static
     * @since 1.0.0
     * @param {nom} nom le nom de l'utilisateur
     * @param {prenom} prenom le prenom de l'utilisateur
     * @param {sexe} [sexe=null] le sexe de l'utilisateur : 1=Homme, 2=Femme, 3=Autre
     * @param {password} password le mot de passe de l'utilisateur
     * @param {email} email l'email de l'utilisateur
     * @param {role} [role=0] le role de l'utilisateur
     * @param {requestedCallback} callback
     */
    static create(nom, prenom, sexe=null, password, email, role=0, callback) {
        let hash = Password.hash(password)
        con.query('INSERT INTO utilisateur(nom, prenom, sexe, hash, email, role) VALUES (?, ?, ?, ?, ?, ?)', [nom, prenom, sexe, hash, email, role], function (err, result) {
            if(err) {
                WriteLog.throwSQLError(err, "Utilisateur.create()")
                callback(null, err)
            }
            callback(result, null)
        });
    }

    /**
     * Méthode qui permet de supprimer un utilisateur de la base donnée
     * @param {id} id
     * @param {requestedCallback} callback
     */
    static delete(id, callback) {
        con.query('DELETE FROM utilisateur WHERE id=?', [id], function (err, result) {
            if(err) {
                WriteLog.throwSQLError(err, "Utilisateur.delete()");
                callback(null, err)
            }
        })
    }



}

module.exports = Utilisateur