'use strict';

var premiService = angular.module('premiService',['ngResource'])

premiService.factory('Main', ['$http', '$localStorage', function($http, $localStorage){
	var baseUrl = "http://sub.lvh.me:8081";
	function changeUser(user) {
		angular.extend(currentUser, user);
	}

	/********************************************** FUNZIONI PER IL JWT *************************************************************************************/
	function decodeToken(token) {
		var parts = token.split('.');

		if (parts.length !== 3) {
			throw new Error('JWT must have 3 parts');
		}

		var decoded = urlBase64Decode(parts[1]);
		if (!decoded) {
			throw new Error('Cannot decode the token');
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
				throw 'Illegal base64url string!';
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
  

  function getUserFromToken() {
  	var token = $localStorage.token;
		//console.log(token);
		var user = {};
		if (typeof token !== 'undefined') {
			user = decodeToken(token);
		}
		return user;
	}

	var currentUser = getUserFromToken();
	console.log("L'utente collegato è ");
	console.log(currentUser.user);

	/***************************************************************************************************************************/
	return {
		save: function(formData, success, error) {
			$http({
				method: 'POST',
				url: baseUrl + '/register',
				data: JSON.stringify(formData),
				withCredentials: true,
				headers: {'Content-Type': 'application/json','authorization': formData.username + ':' + formData.password}
			}).success(success).error(error)
		},
		login: function(formData, success, error) {
			$http({
				method: 'POST',
				url: baseUrl + '/authenticate',
				data: JSON.stringify(formData),
				withCredentials: true,
				headers: {'Content-Type': 'application/json','authorization': formData.username + ':' + formData.password}
			}).success(success).error(error)
		},
		me: function(success, error) {
			$http.get(baseUrl + '/private').success(success).error(error)
		},
		logout: function(success,error) {
			// changeUser({});
			if($localStorage.token){
				console.log("Logout in corso...");
				delete $localStorage.token;
				console.log($localStorage.token);
				if(!$localStorage.token)
					success();
				else
					error();
			}
			else
				console.log("Nessun token trovato");
		},
		changepassword: function(formData,success,error){
			$http({
				method: 'POST',
				url: baseUrl + '/changepassword',
				data: JSON.stringify(formData),
				withCredentials: true,
				headers: {'Content-Type': 'application/json','authorization': currentUser.user + ':' + formData.password + ':' + formData.newpassword}
			}).success(success).error(error)
		}
	};
}
]);

premiService.factory('SlideShow', ['$resource',
	function($resource){/* QUI DEVO RICAVARMI LE PRESENTAZIONI DA MONGO
		return $resource('slideshows/:slideId.json', {}, {
			query: {method:'GET', params:{slideId:'slideshows'}, isArray:true}
		});*/
}]);

premiService.factory('toPages', ['$location','$http','$localStorage','$window',
	function($location,$http,$localStorage,$window){
		return {
			homepage: function(){
				
				$http({
					method: 'POST',
					url:'http://sub.lvh.me:8081/private/home',
					withCredentials: true,
					headers: {'Content-Type': 'application/json','authorization': $localStorage.token}
				})
				.success(function(res){$location.path("/private/home");$window.location.reload();})
				.error(function(){$location.path("/login");})
			},
			editpage: function(slideId){
				$http({
					method: 'POST',
					url:'http://sub.lvh.me:8081/private/edit?slideshow=' + slideId,
					withCredentials: true,
					headers: {'Content-Type': 'application/json','authorization': $localStorage.token}
				})
				.success(function(res){$location.path("/private/edit?slideshow=" + slideId);})
				.error(function(){$location.path("/login");})
			},
			loginpage: function(){
				$location.path("/login")
			},
			executionpage: function(slideId) {
				$http({
					method: 'POST',
					url:'http://sub.lvh.me:8081/private/execution?slideshow=' + slideId,
					withCredentials: true,
					headers: {'Content-Type': 'application/json','authorization': $localStorage.token}
				})
				.success(function(res){$location.path("/private/execution?slideshow=" + slideId);})
				.error(function(){$location.path("/login");})
			},
			profilepage: function() {
				$http({
					method: 'POST',
					url:'http://sub.lvh.me:8081/private/profile',
					withCredentials: true,
					headers: {'Content-Type': 'application/json','authorization': $localStorage.token}
				})
				.success(function(res){$location.path("/private/profile")})
				.error(function(){$location.path("/login")})	
			}
		}
	}]);

/*
premiService.factory('errorHandler', [
	function(){
		return {
			error: function(error, cause){
				alert('Attenzione! ' + error + " Causa: " + cause);
				throw new Error(error,cause);
			}
		}
	}]);*/