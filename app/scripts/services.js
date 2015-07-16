'use strict';

var premiService = angular.module('premiService',['ngResource'])

premiService.factory('Main', ['$localStorage',
	function($localStorage){
		var baseUrl = "http://sub.lvh.me:8081";

		return {
			save: function(formData, success, error) {
				//richiamato metodo node per la registrazione di un nuovo utente
				var register = Registration(baseUrl);

				if(register.register(formData.username, formData.password))
					success(register);
				else
					error({message: register.getMessage()});
			},
			login: function(formData, success, error) {
				//richiamato metodo node per il login di un utente
				var login = Authentication(baseUrl);

				if(login.authenticate(formData.username, formData.password))
					success(login);
				else
					error({message: login.getMessage()});
			},
			me: function(success, error) {
				$http.get(baseUrl + '/private').success(success).error(error)
			},
			logout: function(success,error) {
				//cancellato il token di sessione, se esiste
				if(typeof $localStorage.token == 'undefined')
					throw new Error("Bisogna aver effettuato l'accesso per fare logout");
				
				console.log("Logout in corso...");
				delete $localStorage.token;

				if(typeof $localStorage.token == 'undefined')
					success();
				else
					error();
			},
			changepassword: function(formData,success,error){
				//richiamato il metodo node per il cambio della pwd
				var changepwd = ChangePassword(baseUrl);

				if(changepwd.changepassword(formData.username, formData.password, formData.newpassword))
					success(changepwd);
				else
					error({message: changepwd.getMessage()});
			}
		};
}
]);

premiService.factory('Utilities', ['$localStorage',  
	function($localStorage){
		function changeUser(user) {
			angular.extend(currentUser, user);
		}

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
			decoded = this.decodeToken(token);

			if(typeof decoded.exp === "undefined") {
				return null;
			}

		  var d = new Date(0); // The 0 here is the key, which sets the date to the epoch
		  d.setUTCSeconds(decoded.exp);

		  return d;
		};

		function isTokenExpired (token, offsetSeconds) {
			var d = this.getTokenExpirationDate(token);
			offsetSeconds = offsetSeconds || 0;
			if (d === null) {
				return false;
			}
		  // Token expired?
		  return !(d.valueOf() > (new Date().valueOf() + (offsetSeconds * 1000)));
		};

		return{
			getUserFromToken: function () {
				var token = $localStorage.token;
				var user = {};
				if (typeof token !== 'undefined') {
					user = decodeToken(token);
				}
				return user;
			},
			grade: function(password) {
				var size = password.length;
				var strength = 'weak'
				if (size > 8)
					strength = 'strong';
				else if (size > 5)
					strength = 'medium';

				return strength;
			}
		}
		
	}]);
/*
premiService.factory('SlideShow', ['$resource','Main',
	function($resource,Main){// QUI DEVO RICAVARMI LE PRESENTAZIONI DA MONGO
		
}]);*/

//Serivizio che reindirizza alla pagina corretta attivando il middleware node per la verifica del token
premiService.factory('toPages', ['$location','$http','$localStorage',
	function($location,$http,$localStorage){
		return {
			homepage: function(){
				return $http({
					method: 'POST',
					url:'http://sub.lvh.me:8081/private/home',
					withCredentials: true,
					headers: {'Content-Type': 'application/json','sessiontoken': $localStorage.token}
				})
				.success(function(res){$location.path("/private/home");})
				.error(function(){$location.path("/login");})
			},
			editpage: function(slideId){
				return $http({
					method: 'POST',
					url:'http://sub.lvh.me:8081/private/edit?slideshow=' + slideId,
					withCredentials: true,
					headers: {'Content-Type': 'application/json','sessiontoken': $localStorage.token}
				})
				.success(function(res){$location.path("/private/edit?slideshow=" + slideId);})
				.error(function(){$location.path("/login");})
			},
			loginpage: function(){
				$location.path("/login");
			},
			registrazionepage: function() {
				$location.path("/registrazione");
			},
			executionpage: function(slideId) {
				return $http({
					method: 'POST',
					url:'http://sub.lvh.me:8081/private/execution?slideshow=' + slideId,
					withCredentials: true,
					headers: {'Content-Type': 'application/json','sessiontoken': $localStorage.token}
				})
				.success(function(res){$location.path("/private/execution?slideshow=" + slideId);})
				.error(function(){$location.path("/login");})
			},
			profilepage: function(){
				return $http({
					method: 'POST',
					url:'http://sub.lvh.me:8081/private/profile',
					withCredentials: true,
					headers: {'Content-Type': 'application/json','sessiontoken': $localStorage.token}
				})
				.success(function(res){$location.path("/private/profile");})
				.error(function(){$location.path("/login");})
			}
		}
	}]);