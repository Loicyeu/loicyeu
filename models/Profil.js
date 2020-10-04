/*
 * Projet loicyeu
 * Created by Loicyeu <loic.henry2001@gmail.com>
 * Copyright (c) 2020.
 * All rights reserved.
 */

const con = require('../config/db')
const WriteLog = require("./WriteLog");

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
     * @param {string} uuid
     * @param {requestedCallback} callback
     */
    static getUserInfo(uuid, callback) {

        con.query("SELECT id FROM uuid WHERE uuid=?", [uuid], function (err, result) {
            if(err) {
                WriteLog.consoleInfo("ERR_SQL_ERROR", "Profil.userInfo");
                callback(false, {err: "unexpectedError"});
            }
            else{
                if(result.length===1){
                    const id = result[0].id;
                    con.query("SELECT * FROM users WHERE id=?", [id],function (err, result) {
                        if(err) {
                            WriteLog.consoleInfo("ERR_SQL_ERROR", "Profil.userInfo");
                            callback(false, {err: "unexpectedError"});
                        }
                        else{
                            if(result.length===1){
                                callback(true, result[0]);
                                WriteLog.consoleInfo("userInfo : id="+ result[0].id + " email="+ result[0].email, "Profil.userInfo");
                            }else if(result.length>1) {
                                callback(false, {err: "ERR_ID_NOT_UNIQUE"});
                                WriteLog.consoleInfo("unexpectedError", "Profil.userInfo");
                            }else{
                                callback(false, {err: "ERR_UNEXPECTED_ERROR"});
                                WriteLog.consoleInfo("unexpectedError", "Profil.userInfo");
                            }
                        }
                    });
                }else if(result.length>1){
                    callback(false, {err: "ERR_NOT_UNIQUE_UUID"});
                    WriteLog.consoleInfo("unexpectedError", "Profil.userInfo");
                }else{
                    callback(false, {err: "ERR_NOT_FOUND_DATA"});
                    WriteLog.consoleInfo("unexpectedError", "Profil.userInfo");
                }
            }
        });



    }
}

module.exports = Profil