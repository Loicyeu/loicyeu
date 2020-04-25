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
- **ERR_DATA_NOT_FOUND** : *SQl n'a pas retourné de tuple*
- ERR_EMAIL_NOT_UNIQUE : *Plusieurs email identiques dans la BDD*
- ERR_SQL_ERROR

####Fonction registerUser :
- ERR_NO_CALLBACK : *Pas de callback*
- ERR_EMPTY_DATA : *Les variables sont oubliés*
- **ERR_EMAIL_INVALID** : *L'email n'est pas valide*
- ERR_ID_NOT_UNIQUE : 
- **ERR_EMAIL_NOT_UNIQUE** : 
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
- ERR_UUID_NULL : *L'uuid est nul*
- ERR_ID_NOT_UNIQUE
- ERR_UNEXPECTED_ERROR
- ERR_UUID_NOT_UNIQUE
- ERR_DATA_NOT_FOUND
- ERR_SQL_ERROR

####Fonction changeInfo :
- ERR_NO_CALLBACK : 
- ERR_UUID_NULL : 
- ERR_MISSING_DATA : 
- ERR_SQL_ERROR : 
- ERR_UUID_NOT_UNIQUE : 
- **ERR_NO_SESSION_FOUND** : 