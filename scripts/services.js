'use strict';

var premiService = angular.module('premiService',[])

premiService.factory('Main', ['Utils', '$localStorage',
	function(Utils, $localStorage){
		var baseUrl = Utils.hostname();

		//variabile login per mantenere aperta la sessione
		var login = Authentication(baseUrl);
		//user è adibita al contenimento dell'oggetto user
		var user = {};

		/*
		Ogni refresh della pagina (f5) comporta il reset di angular e con esso anche della var. login.
		Per questo, ogni volta che il servizio Main è chiamato si attiva la funzione value().
		Questa valuta se è stato fatto un refresh vedendo se login è definito
			e in questo caso vede se nel localstorage sono salvati username e pwd (pwd ovviamente criptata):
			in tal caso allora riapplica l'authenticate e login viene ripristinata
		*/

		var value = function(){
			if(Utils.isUndefined(login.getToken()) && Utils.isObject($localStorage.formData))
				if(!login.authenticate($localStorage.formData.username, $localStorage.formData.password))
					throw new Error({message: login.getMessage()});
		};

		value();
		var main = {
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
					$localStorage.$reset();
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
			},
			getToken: function(){
				return login.getToken();
			},
			//Metodo che ritorna lo user in base al token di sessione
			getUser: function () {
				//se il token è definito ok si può decodificare
				if(Utils.isObject(main.getToken()))
					user = Utils.decodeToken(main.getToken());

				//in ogni caso viene ritornato user
				return user;
			}
		};

		return main;
	}
]);

premiService.factory('Upload', ['$http','Main','Utils',
	function($http,Main,Utils){
		var baseUrl = Utils.hostname();
		var token = function(){
			return Main.getToken();
		}

		//Formati accettati per l'upload
		var image = ['image/jpeg', 'image/gif','image/png'];
		var video = ['video/mp4','video/wav','video/avi'];
		var audio = ['audio/mp3'];

		var getExtension = function (file) {
			var extension = file.type;
			return extension;

		};

		var getUrlFormat = function (file) {
			var extension = getExtension(file);

			if(image.indexOf(extension) != -1)
				return "image/";
			else if(audio.indexOf(extension) != -1)
				return "audio/";
			else if(video.indexOf(extension) != -1)
				return "video/";

			return undefined;
		};

		var getFileName = function(filename){
			var name = filename.split(".");
			var ris = "";
			for(var i=0;i<name.length - 1;++i){
				ris += name[i];
			}
			return ris;
		};


		var checkExtension = function(files, array){
			if(Utils.isUndefined(array))
				return checkExtension(files, image) || checkExtension(files, audio) || checkExtension(files, video);
			
			var ris = true;
			for(var i=0; i<files.length && ris; ++i)
				if(array.indexOf(files[i].type) == -1)
					ris = false;

			return ris;
		};
		var upload = {
			uploadmedia: function(files, callback) {				
				if(Utils.isUndefined(files))
					throw new Error("Attenzione! Il file non è definito.");

				if(!checkExtension(files))
					throw new Error("Estensione non riconosciuta dal sistema.");

				console.log("upload");
				for(var i=0; i<files.length; ++i){
					var formData = new FormData();
					formData.append("file", files[i]);
					var uploadUrl = getUrlFormat(files[i]) + getFileName(files[i].name);

					var req = new XMLHttpRequest();
					req.open('POST', baseUrl +'/private/api/files/'+uploadUrl, true);
					req.setRequestHeader("Authorization", token());
					var after = function(file){
						callback(file);
					}
					var error = function(){
						throw new Error("Impossibile caricare i file");
					}
					req.onload = after(files[i]);
					req.onerror = error;
					req.send(formData);
				}
			},
			isImage: function(files){
				return checkExtension(files, image);
			},
			isAudio: function(files){
				return checkExtension(files, audio);
			},
			isVideo: function(files){
				return checkExtension(files, video);
			},
			getFileUrl: function(file){
				return 'files/' + Main.getUser().user + '/' + getUrlFormat(file) + file.name;
			}
		}

		return upload;
	}
]);

premiService.factory('Utils', [
	function(){
		//Metodi per la decodifica di un token
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
			var decoded = decodeToken(token);

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
			//Metodo per valutare la robustezza di una password
			decodeToken: function(token) {
				var parts = token.split('.');

				if (parts.length !== 3) {
					throw new Error('Il token deve essere formato da 3 parti');
				}

				var decoded = urlBase64Decode(parts[1]);
				if (!decoded) {
					throw new Error('Impossibile decodificare il token');
				}
				return JSON.parse(decoded);
			},
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
				var ris = false;
				if(!object)
					ris = true;
				else if(typeof object === 'undefined')
					ris = true;
				else if(typeof object === 'null')
					ris = true;
				else if(object === 'null')
					ris = true;
				else if(object === 'undefined')
					ris = true;
				else if(object.length === 0)
					ris = true;
				return ris;
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
					if(Utils.isObject(slideId))
						SharedData.getPresentazione(slideId);
				};
				return sendRequest('/private/edit.html', success, error);
			},
			//PAGINA DI ESECUZIONE
			executionpage: function(slideId) {
				var success = function(){
					$location.path('/private/execution');
					if(Utils.isObject(slideId))
						SharedData.getPresentazione(slideId);
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

premiService.factory('SharedData', ['Utils', '$localStorage', 'Main',
	function(Utils, $localStorage, Main){
		var mongo = MongoRelation(Utils.hostname(), Main.login());
		//ricorda l'id della presentazione su cui lavorare
		var myPresentation = undefined;

		var idEditManuel = undefined;

		var shared = {
			getPresentazione: function(idSlideShow) {
				var idss = {};

				if(Utils.isUndefined(idSlideShow)){
					if(Utils.isObject(myPresentation))
						return myPresentation;

					if(Utils.isObject($localStorage.idMyPresentation))
						idss = $localStorage.idMyPresentation;
				}
				else
					idss = idSlideShow;

				if(Utils.isObject(idss)){
					myPresentation = JSON.stringify(mongo.getPresentation(idss));
					$localStorage.idMyPresentation = idss;
				}
				return myPresentation;
			},
			forEditManuel: function(json){
				if(json)
				idEditManuel = json;
				return idEditManuel;
			}
		};

		return shared;
	}]);