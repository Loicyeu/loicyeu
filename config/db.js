const mysql = require('mysql');
/**
 * @type {Connection}
 */
const connection = mysql.createConnection({
    host: "localhost",
    user: "loicyeu",
    password: "123abc+-=",
    database: "loicyeufr"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Database connected!");
});


//Database functions
function createDB() {
    connection.query("CREATE DATABASE loicyeufr", function (err, result) {
        if(err) {
            if (err.code !== "ER_DB_CREATE_EXISTS") sqlError(err);
            else sqlWarning(err);
        } else sqlInfo("Database created");
    });
}
function createTables() {
    const WriteLog = require('./models/WriteLog')

    let sql = "CREATE TABLE utilisateur (id INT AUTO_INCREMENT PRIMARY KEY, nom VARCHAR(255), prenom VARCHAR(255), sexe INT, hash VARCHAR(255), email VARCHAR(255), role INT)";
    connection.query(sql, function (err) {
        if(err) {
            WriteLog.throwSQLError(err)
            if (err.code === "ER_TABLE_EXISTS_ERROR") sqlWarning(err);
            else sqlError(err);
        } else sqlInfo("Table 'utilisateur' created");
    });

    sql = "CREATE TABLE uuid (id INT, uuid VARCHAR(255), expires BIGINT, PRIMARY KEY (id), FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE)"
    connection.query(sql, function (err) {
        if(err) {
            if (err.code === "ER_TABLE_EXISTS_ERROR") sqlWarning(err);
            else sqlError(err);
        } else sqlInfo("Table 'uuid' created");
    });

    sql = "CREATE TABLE password (id INT, mdp VARCHAR(255), PRIMARY KEY (id), FOREIGN KEY (id) REFERENCES users (id) ON DELETE CASCADE)"
    connection.query(sql, function (err) {
        if(err) {
            if (err.code === "ER_TABLE_EXISTS_ERROR") sqlWarning(err);
            else sqlError(err);
        } else sqlInfo("Table 'password' created");
    });
}

//SQL information functions
function sqlError(err) {
    console.log("[SQL ERROR] Code    : "+err.code
        + "\n[SQL ERROR] Message : " + err.sqlMessage);
}
function sqlWarning(err) {
    console.log("[SQL WARNING] Code    : " + err.code
        + "\n[SQL WARNING] Message : " + err.sqlMessage);
}
function sqlInfo(info) {
    console.log("[SQL INFO] " + info);
}


module.exports = connection;