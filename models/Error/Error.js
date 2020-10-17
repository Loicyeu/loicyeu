/*
 * Projet loicyeu
 * Created by Loicyeu <loic.henry2001@gmail.com>
 * Copyright (c) 2020.
 * All rights reserved.
 */


/**
 * Classe abstraite Error
 * @class Error
 * @author Loicyeu
 * @version 1.0.0
 * @copyright All right reserved 2020
 */
class Error {

    static UNEXPECTED_ERROR = "une erreur inattendue s'est produite."
    static UNSUPPORTED_FILE_TYPE = "le fichier sélectionné n'est pas supporté."
    static FILE_TOO_LARGE = "le fichier sélectionné est trop volumineux."
    static EMPTY_FIELD = "l'un des champs est vide."
    static FILE_NOT_FOUND = "le fichier n'a pas pu être trouvé."
    static INVALID_PASSWORD = "le mot de passe est invalide."
    static NOT_SAME_PASSWORD = "les mots de passes ne sont pas identiques."

    /**
     * Méthode permettant de transformer un code d'erreur en
     * un texte, un titre et un type d'erreur. <br>
     * Si <tt>error</tt> est null ou est une chaine vide alors la méthode retourne <tt>null</tt>.
     * @param {*} error L'erreur
     * @return {{type: string, title: string, text: string}|null}
     */
    static getDisplayableError(error) {
        throw new Error("You have to implement the method 'getDisplayableError'");
    }

}

module.exports = Error;