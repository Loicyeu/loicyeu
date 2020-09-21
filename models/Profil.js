/*
 * Projet loicyeu
 * Created by Loicyeu <loic.henry2001@gmail.com>
 * Copyright (c) 2020.
 * All rights reserved.
 */

const con = require('../config/db')
const WriteLog = require("./WriteLog");

class Profil {
    constructor() {
    }

    static userInfo(uuid, callback) {

        con.query("SELECT id FROM uuid WHERE uuid=?", [uuid], function (err, result) {
            if(err) {
                WriteLog.consoleInfo("ERR_SQL_ERROR", "Profil.userInfo");
                callback(false, {err: "ERR_SQL_ERROR"});
            }
            else{
                if(result.length===1){
                    const id = result[0].id;
                    con.query("SELECT * FROM utilisateur WHERE id=?", [id],function (err, result) {
                        if(err) {
                            WriteLog.consoleInfo("ERR_SQL_ERROR", "Profil.userInfo");
                            callback(false, {err: "ERR_SQL_ERROR"});
                        }
                        else{
                            if(result.length===1){
                                callback(true, result[0]);
                                WriteLog.consoleInfo("userInfo : id="+ result[0].id + " email="+ result[0].email, "Profil.userInfo");
                            }else if(result.length>1) {
                                callback(false, {err: "ERR_ID_NOT_UNIQUE"});
                                WriteLog.consoleInfo("ERR_ID_NOT_UNIQUE", "Profil.userInfo");
                            }else{
                                callback(false, {err: "ERR_UNEXPECTED_ERROR"});
                                WriteLog.consoleInfo("ERR_UNEXPECTED_ERROR", "Profil.userInfo");
                            }
                        }
                    });
                }else if(result.length>1){
                    callback(false, {err: "ERR_NOT_UNIQUE_UUID"});
                    WriteLog.consoleInfo("ERR_NOT_UNIQUE_UUID", "Profil.userInfo");
                }else{
                    callback(false, {err: "ERR_NOT_FOUND_DATA"});
                    WriteLog.consoleInfo("ERR_NOT_FOUND_DATA", "Profil.userInfo");
                }
            }
        });



    }
}

module.exports = Profil