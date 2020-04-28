# loicyeu

##Fonctions
###Fonctions Locales

####Fonction testPassword() :
- ERR_PASSWORD_EMPTY : *Le mot de passe est vides*
- ERR_PASSWORD_INVALID : *Le mot de passe ne correspond pas aux critères exigés*
- ERR_PASSWORD_TOO_SHORT : *Le mot de passe est trop court*

###Fonctions socket
####Fonction loginUser :
- ERR_NO_CALLBACK : *Pas de callback*
- ERR_EMPTY_DATA : *Les variables sont oubliés*
- **ERR_NOT_FOUND_DATA** : *SQl n'a pas retourné de tuple*
- ERR_EMAIL_NOT_UNIQUE : *Plusieurs email identiques dans la BDD*
- ERR_SQL_ERROR

####Fonction registerUser :
- ERR_NO_CALLBACK : *Pas de callback*
- ERR_EMPTY_DATA : *Les variables sont oubliés*
- **ERR_INVALID_EMAIL** : *L'email n'est pas valide*
- ERR_ID_NOT_UNIQUE : 
- **ERR_NOT_UNIQUE_EMAIL** : 
- ERR_SQL_ERROR

####Fonction isConnected
- ERR_NO_CALLBACK : *Pas de callback*
- ERR_EMPTY_DATA : *Les variables sont oubliés*
- ERR_SQL_ERROR : 
- ERR_NO_SESSION_FOUND : 
- ERR_EXPIRED_SESSION : 
- ERR_UNEXPECTED_ERROR : 

####Fonction userInfo :
- ERR_NO_CALLBACK : *Pas de callback*
- ERR_NULL_UUID : *L'uuid est nul*
- ERR_ID_NOT_UNIQUE
- ERR_UNEXPECTED_ERROR
- ERR_NOT_UNIQUE_UUID
- ERR_NOT_FOUND_DATA
- ERR_SQL_ERROR

####Fonction changeInfo :
- ERR_NO_CALLBACK : 
- ERR_NULL_UUID : 
- ERR_MISSING_DATA : 
- ERR_SQL_ERROR : 
- ERR_NOT_UNIQUE_UUID : 
- **ERR_NO_SESSION_FOUND**


####Fonction addFriend :
- ERR_NO_CALLBACK
- ERR_NULL_UUID
- ERR_MISSING_DATA
- ERR_INVALID_ID
- ERR_SQL_ERROR
- ERR_NOT_UNIQUE_UUID
- **ERR_NO_SESSION_FOUND**

####Fonction changePass :
- ERR_NO_CALLBACK
- ERR_NULL_UUID
- ERR_MISSING_DATA
- ERR_SQL_ERROR
- ERR_NOT_UNIQUE_UUID
- **ERR_NO_SESSION_FOUND**
- ERR_NOT_UNIQUE_ID
- ERR_UNEXPECTED_ERROR
- **ERR_PASSWORD_NOT_MATCHING**