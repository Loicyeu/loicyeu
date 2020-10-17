/*
 * Projet loicyeu
 * Created by Loicyeu <loic.henry2001@gmail.com>
 * Copyright (c) 2020.
 * All rights reserved.
 */

const mysql = require('mysql');

/**
 * @type {Connection} La connection MySQL
 */
const connection = mysql.createConnection({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    database: process.env.DBNAME
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Database connected!");
});

module.exports = connection;