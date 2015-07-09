'use strict';

var premiService = angular.module('premiService',['ngResource'])

premiService.factory('Main', ['$http', '$localStorage', function($http, $localStorage){
		var baseUrl = "http://sub.lvh.me:8081";
		function changeUser(user) {
				angular.extend(currentUser, user);
		}

		function urlBase64Decode(str) {
				var output = str.replace('-', '+').replace('_', '/');
				switch (output.length % 4) {
						case 0:
								break;
						case 2:
								output += '==';
								break;
						case 3:
								output += '=';
								break;
						default:
								throw 'Illegal base64url string!';
				}
				return window.atob(output);
		}

		function getUserFromToken() {
				var token = $localStorage.token;
				var user = {};
				if (typeof token !== 'undefined') {
						var encoded = token.split('.')[1];
						user = JSON.parse(urlBase64Decode(encoded));
				}
				return user;
		}

		var currentUser = getUserFromToken();
		console.log("ciaone");
		console.log(currentUser);

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
						delete $localStorage.token;
						success();
				},
				changepassword: function(formData,success,error){
					$http({
						method: 'POST',
						url: baseUrl + '/changepassword',
						data: JSON.stringify(formData),
						withCredentials: true,
						headers: {'Content-Type': 'application/json','authorization': getUserFromToken() + ':' + formData.password + ':' + formData.newpassword}
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

premiService.factory('toPages', ['$resource', '$location',
  function($resource, $location){
    return {
			homepage: function(){
				$location.path("/home")
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
				$location.path("/profile")
			}
    }

    
  }]);