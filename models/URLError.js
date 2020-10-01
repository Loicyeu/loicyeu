/*
 * Projet loicyeu
 * Created by Loicyeu <loic.henry2001@gmail.com>
 * Copyright (c) 2020.
 * All rights reserved.
 */

/**
 * Classe URLError
 * @version 1.0.0
 * @copyright Loicyeu 2020
 */
class URLError {

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
                return {type: "warning", title: "Erreur", text:"le fichier n'a pas pu être trouvé."}
            case "fileTypeUnsupported":
                return {type: "warning", title: "Erreur", text:"le fichier sélectionné n'est pas supporté."}
            case "fileTooLarge":
                return {type: "warning", title: "Erreur", text:"le fichier sélectionné est trop volumineux."}
            case "emptyFiels":
                return {type: "warning", title: "Erreur", text:"l'un des champs est vide."}
            case "unexpectedError":
            default:
                return {type: "danger", title:"Alerte", text:"une erreur inattendue s'est produite."}
        }
    }

}

module.exports = URLError;