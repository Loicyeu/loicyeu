/*
 * Projet loicyeu
 * Created by Loicyeu <loic.henry2001@gmail.com>
 * Copyright (c) 2020.
 * All rights reserved.
 */

const Error = require("./Error");

/**
 * Classe URLError qui hérite de Error
 * @class URLError
 * @see Error
 * @author Loicyeu
 * @version 1.1.0
 * @copyright All right reserved 2020
 */
class URLError extends Error{

    /**
     * Méthode permettant de transformer un code d'erreur d'URL en
     * un texte, un titre et un type d'erreur. <br>
     * Si <tt>error</tt> est null ou est une chaine vide alors la méthode retourne <tt>null</tt>.
     *
     * @param {string} error L'erreur URL
     * @return {{type: string, title: string, text: string}|null}
     * @since 1.0.0
     * @version 1.0.0
     */
    static getDisplayableError(error) {
        switch (error) {
            case null:
            case undefined:
            case "":
                return null;

            case "fileNotFound":
                return {type: "warning", title: "Erreur", text: this.FILE_NOT_FOUND}
            case "fileTypeUnsupported":
                return {type: "warning", title: "Erreur", text: this.UNSUPPORTED_FILE_TYPE}
            case "fileTooLarge":
                return {type: "warning", title: "Erreur", text: this.FILE_TOO_LARGE}
            case "emptyFiels":
                return {type: "warning", title: "Erreur", text: this.EMPTY_FIELD}

            case "unexpectedError":
            default:
                return {type: "danger", title:"Alerte", text: this.UNEXPECTED_ERROR}
        }
    }

}

module.exports = URLError;