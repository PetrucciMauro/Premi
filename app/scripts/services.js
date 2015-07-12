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
    }


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
    }


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
				console.log(token);
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
					//$http.post(baseUrl + '/register', formData).success(success).error(error)
					$http({
						method: 'POST',
						url: baseUrl + '/register',
						data: JSON.stringify(formData),
						withCredentials: true,
						headers: {'Content-Type': 'application/json','authorization': formData.username + ':' + formData.password}
					}).success(success).error(error)
    },
				login: function(formData, success, error) {
					//$http.post(baseUrl + '/authenticate', data).success(success).error(error)
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
				logout: function(success) {
                changeUser({});
                $localStorage.token= "";
                delete $localStorage.token;
                success();
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

premiService.factory('toPages', ['$resource', '$location','$http','$localStorage',
  function($resource, $location,$http,$localStorage){
    return {
			homepage: function(){
		//	$location.path("private/home")
			/*
				var config = {headers: {
            'Authorization': $localStorage.token,
            'Accept': 'application/json;odata=verbose'
        }
    };
    	$http.get('http://sub.lvh.me:8081/private/home',config)*/
				$http({
					method: 'POST',
					url:'http://sub.lvh.me:8081/private/home',
					withCredentials: true,
					headers: {'Content-Type': 'application/json','authorization': $localStorage.token}
				})
			.success(function(res){$location.path("/private/home")})
			.error(function(){$location.path("/registrazione")})
			
			},
			editpage: function(slideId){
				$location.path("/edit")
			},
			indexpage: function(){
				$location.path("/login")
			},
			executionpage: function(slideId) {
				$location.path("/execution")
			},
			profilepage: function() {
	
				$http({
					method: 'POST',
					url:'http://sub.lvh.me:8081/private/profile',
					withCredentials: true,
					headers: {'Content-Type': 'application/json','authorization': $localStorage.token}
				})
			.success(function(res){$location.path("/private/profile")})
			.error(function(){$location.path("/registrazione")})
			
			}
    }
  }]);
