const express = require('express');
const app = express();
const fs = require('fs');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const mysql = require('mysql');
const nodemailer = require('nodemailer');

const con = mysql.createConnection({
    host: "localhost",
    user: "loicyeu",
    password: "123abc+-=",
    database: "loicyeufr"
});
con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    createTables();
});

http.listen(3000, () => {
    console.log('listening on :3000');
});
app.use(express.static('public'));

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'loicyeu@gmail.com',
        pass: '5!x8Df{4vD'
    },
    tls: {
        rejectUnauthorized: false
    }
});

/*
* FONCTIONS
* */

function createDB() {
    con.query("CREATE DATABASE loicyeufr", function (err, result) {
        if (err.code !== "ER_DB_CREATE_EXISTS") throw err.code && err;
        console.log("Database created");
    });
}

function createTables() {
    var sql = "CREATE TABLE utilisateur (id INT AUTO_INCREMENT PRIMARY KEY, nom VARCHAR(255), prenom VARCHAR(255), mdp VARCHAR(255), email VARCHAR(255))";
    con.query(sql, function (err, result) {
        if (err.code === "ER_TABLE_EXISTS_ERROR") console.log("La table utilisateur existe deja !");
        else if(err) throw err.code && err;
        else console.log("Table created");
    });
}

function sendMail(to, subject, content) {
    const regexEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!regexEmail.test(to)) return;

    const mailOption = {
        to: to,
        subject: subject,
        text: content
    }

    transporter.sendMail(mailOption, function (err, info) {
        if (err) console.log(err);
        else console.log('Email sent: ' + info.response);
    })
}

/*
* FONCTIONS SOCKET
* */

io.on('connection', (socket) => {
    console.log('user connected');

    //res (bool) err (String)
    socket.on('loginUser', function (email, mdp, callback) {
        if(callback === null) return;
        if(email === null || mdp === null) {
            callback(false, "Mauvais identifiant / mot de passe");
            return;
        }
        const sql = "SELECT id FROM utilisateur WHERE email = \""+ email + "\" AND mdp = \"" + mdp + "\"";
        con.query(sql, function (err, result) {
            if(result.length === 1) callback(true, null);
            if(result.length > 1) callback(false, "Plusieurs entrées identiques. Connection refusé");
            else callback(false, "Mauvais identifiant / mot de passe");
        });
    });

    //res (bool) err (String)
    socket.on('registerUser', function (nom, prenom, mdp, email, callback) {
        const regexEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

        if(callback === null) return;
        if(email === null || mdp === null || nom === null || prenom === null) {
            callback(false, "L'un des champs est vide");
            return;
        }
        if(!regexEmail.test(email)){
            callback(false, "L'adresse email est invalide");
            return;
        }
        const sql = "SELECT id FROM utilisateur WHERE email = \"" + email + "\"";
        con.query(sql, function (err, result) {
            if(result.length === 0) {
                const sql2 = "INSERT INTO utilisateur(nom, prenom, mdp, email) VALUES (\"" + nom + "\", \"" + prenom + "\", \"" + mdp + "\", \"" + email +"\")";
                con.query(sql2, function (err, result) {
                    if(err) throw err;
                    callback(true, null);
                });
            }else{
                callback(false, "Adresse email déjà présente dans la base de données");
            }
        });
    });
});