'use strict';

var premiService = angular.module('premiService',[])

premiService.factory('Main', ['Utils', '$localStorage',
	function(Utils, $localStorage){
		var baseUrl = Utils.hostname();

		var login = Authentication(baseUrl);

		/*
		Ogni refresh della pagina (f5) comporta il reset di angular e con esso anche della var. login.
		Per questo, ogni volta che il servizio Main è chiamato si attiva la funzione value().
		Questa valuta se è stato fatto un refresh vedendo se login è definito
			e in questo caso vede se nel localstorage sono salvati username e pwd:
			in tal caso allora riapplica l'authenticate e login viene ripristinata
		*/

		var value = function(){
			if(Utils.isUndefined(login.getToken()) && Utils.isObject($localStorage.formData))
				if(!login.authenticate($localStorage.formData.username, $localStorage.formData.password))
					throw new Error({message: login.getMessage()});
		};

		value();
		return {
			//Metodo che richiama il metodo del server per la registrazione
			register: function(formData, success, error) {
				//richiamato metodo node per la registrazione di un nuovo utente
				var register = Registration(baseUrl);

				if(register.register(formData.username, formData.password))
					//la registrazione ha avuto buon fine quindi è possibile fare il login e creare il token
					if(login.authenticate(formData.username, formData.password)){
						$localStorage.formData = formData;
						success();
					}
					else
						error({message: login.getMessage()});
				else
					error({message: register.getMessage()});
			},
			//Metodo che richiama il metodo del server per il login
			login: function(formData, success, error) {
				//Se formData è definito significa che il login deve essere ancora effettuato
				//altrimenti è già stato fatto e viene ritornato l'oggetto login
				if(Utils.isUndefined(formData))
					return login;

				if(login.authenticate(formData.username, formData.password)){
					$localStorage.formData = formData;
					success();
				}
				else
					error({message: login.getMessage()});
			},
			me: function(success, error) {
				$http.get(baseUrl + '/private').success(success).error(error)
			},
			//Metodo che richiama il metodo del server per il logout
			logout: function(success, error) {
				//viene cancellato il token di sessione, se esiste
				var notdef = false;
				var local = false;

				if(Utils.isUndefined(login.getToken()))
					notdef = true;
				if(Utils.isObject($localStorage.formData))
					local = true;

				//IF NELL'ORDINE CORRETTO
				//se è presente $localStorage.formData bisogna cancellarlo
				if(local)
					delete $localStorage.formData;
				//se è presente $localStorage.formData ma login è indefinito allora c'è un errore nel server
				if(local && notdef)
					throw new Error("Errore interno del server, forse non risponde. Provare a rieffettuare il login");
				//altrimenti non è mai stato fatto un login
				if(notdef)
					throw new Error("Bisogna aver effettuato l'accesso per fare il logout");
				
				console.log("Logout in corso...");

				//richiamato il metodo per fare il logout dal server
				if(login.deAuthenticate()){
					success();
					return;
				}

				//arrivati qui significa che il logout non è stato possibile
				error({message: 'Impossibile effettuare il logout'});
			},
			//Metodo che richiama il metodo del server per fare il cambio della password
			changepassword: function(formData, success, error){
				//richiamato il metodo node per il cambio della pwd
				var changepwd = ChangePassword(baseUrl);

				if(changepwd.changepassword(formData.username, formData.password, formData.newpassword)){
					$localStorage.formData.password = formData.password;
					success();
				}
				else
					error({message: changepwd.getMessage()});
			}
		};
	}
]);

premiService.factory('Upload', ['$http','Main','Utils',
	function($http,Main,Utils){
		var baseUrl = Utils.hostname();
		var token = Main.login().getToken();

		return{
			//Formati accettati per l'upload
			image: ['jpeg','jpg','gif','png'],
			video: ['mp4','waw','avi'],
			audio: ['mp3'],
			uploadmedia: function(formData,uploadUrl, success, error) {
				console.log(JSON.stringify(formData));
				console.log(uploadUrl);
               return $http({
               	    transformRequest: angular.identity,
					method: 'POST',
					url:uploadUrl,
					data: formData,
					withCredentials: true,
					headers: {'Content-Type': undefined,'Authorization': token}
				})
				.success(function(res){})
				.error(function(){})
			}
		}
	}
]);

premiService.factory('Utils', [
	function(){
		//user è adibita al contenimento dello username
		//oldtoken invece al contenimento del token
		var user = {};
		var oldtoken = {};

		//Metodi per la decodifica di un token
		function changeUser(user) {
			angular.extend(currentUser, user);
		};
		function decodeToken(token) {
			var parts = token.split('.');

			if (parts.length !== 3) {
				throw new Error('Il token deve essere formato da 3 parti');
			}

			var decoded = urlBase64Decode(parts[1]);
			if (!decoded) {
				throw new Error('Impossibile decodificare il token');
			}
			return JSON.parse(decoded);
		};
		function urlBase64Decode (str) {
			var output = str.replace(/-/g, '+').replace(/_/g, '/');
			switch (output.length % 4) {
				case 0: { break; }
				case 2: { output += '=='; break; }
				case 3: { output += '='; break; }
				default: {
					throw new Error('Stringa urlBase64 non legale');
				}
			}
			return decodeURIComponent(escape(window.atob(output))); //polifyll https://github.com/davidchambers/Base64.js
		};
		function getTokenExpirationDate (token) {
			var decoded;
			decoded = decodeToken(token);

			if(typeof decoded.exp === "undefined") {
				return null;
			}

		  var d = new Date(0); // The 0 here is the key, which sets the date to the epoch
		  d.setUTCSeconds(decoded.exp);

		  return d;
		};
		function isTokenExpired (token, offsetSeconds) {
			var d = getTokenExpirationDate(token);
			offsetSeconds = offsetSeconds || 0;
			if (d === null) {
				return false;
			}
		  // Token expired?
		  return !(d.valueOf() > (new Date().valueOf() + (offsetSeconds * 1000)));
		};

		var utilities = {
			//Metodo che ritorna lo username in base ad un token passato come parametro
			getUser: function (token) {
				//se il token non è definito è impossibile ricavarsi lo username
				if(utilities.isUndefined(token))
					return user;

				//se user è definito e il token è identico a quello salvato precedentemente allora user viene ritornato
				if(utilities.isObject(user) && token === oldtoken)
					return user;

				//altrimenti viene ricavato e lo username viene salvato in user e il token in oldtoken
				user = decodeToken(token);
				oldtoken = token;
				return user;
			},
			//Metodo per valutare la robustezza di una password
			grade: function(password) {
				var size = password.length;
				var strength = 'weak';

				if (size > 8)
					strength = 'strong';
				else if (size > 5)
					strength = 'medium';

				return strength;
			},
			//Metodo che ritorna l'hostname dove risiede il sito
			hostname: function() {
				return "http://localhost:8081";
			},
			//Metodi che determinano se un oggetto è definito o meno
			isUndefined: function(object){
				if(!object)
					return true;
				if(typeof object === 'undefined')
					return true;
				if(typeof object === 'null')
					return true;
				if(object === 'null')
					return true;
				if(object === 'undefined')
					return true;
				return false;
			},
			isObject: function(object){
				return !utilities.isUndefined(object);
			},
			//Metodo per criptare stringhe
			encrypt: function(string){
				return CryptoJS.SHA1(string).toString();
			}
		}
		
		return utilities;
	}]);
/*
premiService.factory('SlideShow', ['$resource','Main',
	function($resource,Main){// QUI DEVO RICAVARMI LE PRESENTAZIONI DA MONGO
		
}]);*/

//Servizio che reindirizza alla pagina corretta attivando il middleware node per la verifica del token
premiService.factory('toPages', ['$location','$http', 'Main', 'Utils', 'SharedData',
	function($location,$http, Main, Utils, SharedData){
		var baseUrl = Utils.hostname();

		var sendRequest = function(dest, success, error){
			return $http({
				method: 'GET',
				url: baseUrl + dest
			})
			.success(success)
			.error(error)
		};

		var baseError = function(){};
		var error = function(){pages.loginpage();};

		var pages = {
			//PAGINA DI LOGIN
			loginpage: function() {
				var success = function(){$location.path('/login');};
				return sendRequest('/publicpages/login.html', success, baseError);
			},
			//PAGINA DI REGISTRAZIONE
			registrazionepage: function() {
				var success = function(){$location.path('/registrazione');};
				return sendRequest('/publicpages/registrazione.html', success, error);
			},
			//Le seguenti pagine sono tutte accessibili solo dopo essersi autenticati al server
			//PAGINA HOME
			homepage: function() {
				var success = function(){$location.path('/private/home');};
				return sendRequest('/private/home.html', success, error);
			},
			//PAGINA EDIT
			editpage: function(slideId) {
				var success = function(){
					$location.path('/private/edit');
					SharedData.forEdit(slideId);
				};
				return sendRequest('/private/edit.html', success, error);
			},
			//PAGINA DI ESECUZIONE
			executionpage: function(slideId) {
				var success = function(){
					$location.path('/private/execution');
					SharedData.forExecution(slideId);
				};
				return sendRequest('/private/execution.html', success, error);
			},
			//PAGINA DI PROFILO
			profilepage: function() {
				var success = function(){$location.path('/private/profile');};
				return sendRequest('/private/profile.html', success, error);
			}
		};

		return pages;
	}]);

premiService.factory('SharedData', ['Utils',
	function(Utils){
		//ricordano l'id della presentazione su cui lavorare
		//per l'esecuzione
		var idExecution = {};
		//per l'edit
		var idEdit = {};

		var shared = {
			forExecution: function(idSlideShow) {
				if(Utils.isObject(idSlideShow))
					idExecution = idSlideShow;

				return idExecution;
			},
			forEdit: function(idSlideShow) {
				if(Utils.isObject(idSlideShow))
					idEdit = idSlideShow;

				return idEdit;
			}
		};

		return shared;
	}]);