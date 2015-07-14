'use strict';

var premiControllers = angular.module('premiControllers', ['premiService']);

premiControllers.controller('HeaderController', ['$scope', '$localStorage','Main','toPages',
	function($scope, $localStorage,Main,toPages) {
		$scope.isToken = function() {
			if(typeof $localStorage.token === 'undefined')
				return false;
			return true;
		};

		$scope.goEdit = function(slideId){
			toPages.editpage(slideId);
		}
		$scope.goExecute = function(slideId){
			toPages.executionpage(slideId);
		}
		$scope.goProfile = function(){
			toPages.profilepage();
		}
		$scope.goLogin = function(){
			toPages.loginpage();
		}
		$scope.goRegistrazione = function(){
			toPages.registrazionepage();
		}

		$scope.logout = function() {
			Main.logout(function() {
				toPages.loginpage();
			}, function() {
				alert("Failed to logout!");
			});
		};

}])

premiControllers.controller('premiAuthenticationController', ['$rootScope', '$scope', '$location', '$localStorage','Main','toPages','$route','$q',
	function($rootScope, $scope, $location, $localStorage,Main,toPages,$route,$q) {
		//$route.reload();

		$scope.reset = function() {
			$scope.user = {};
		};

		$scope.token = function() {
			if(typeof $localStorage.token === 'undefined')
				return undefined;
			return $localStorage.token;
		};

		$scope.login = function() {
			//check che i campi username e pwd non siano vuoti
			if(!$scope.user || typeof $scope.user.username === 'undefined' || typeof $scope.user.password === 'undefined')
				throw new Error("I campi username e password non possono essere vuoti");
			var formData = {
				username: $scope.user.username,
				password: $scope.user.password
			}

			Main.login(formData, function(res) {
				console.log("Main.login login");
				if (res.type == false) {
					alert(res.data)    
				} else {
					$localStorage.token = res.token;
					console.log($localStorage.token);
					toPages.homepage(); 
				}
			}, function() {
				$rootScope.error = 'Failed to login';
			})
		};

		$scope.registration = function() {
			//check che i campi username e pwd non siano vuoti
			if(!$scope.user || typeof $scope.user.username === 'undefined' || typeof $scope.user.password === 'undefined')
				throw new Error("I campi username e password non possono essere vuoti");
			//check che la pwd sia sicura
			this.grade();
			if($scope.strength == 'weak'){
				throw new Error("Attenzione: la password è troppo corta. Deve essere di almeno 6 caratteri")
			}
			var formData = {
				username: $scope.user.username,
				password: $scope.user.password
			}
			Main.save(formData, function(res) {
				console.log("Main.save registration");
				if (res.type == false) {
					alert(res.data)
				} else {
					$localStorage.token = res.token;
					toPages.homepage();
				}
			}, function() {
				$rootScope.error = 'Failed to signup';
			})
		};

		$scope.grade = function() {
			var size = $scope.user.password.length;
			if (size > 8) {
				$scope.strength = 'strong';
			} else if (size > 5) {
				$scope.strength = 'medium';
			} else {
				$scope.strength = 'weak';
			}
		};
	}])

premiControllers.controller('ProfileController', ['$rootScope', '$scope', '$location','$localStorage', 'Main', '$route',
	function($rootScope, $scope, $location,$localStorage, Main,$route) {
		//$route.reload();

		Main.me(function(res) {
			$scope.myDetails = res;
		}, function() {
			$rootScope.error = 'Failed to fetch details';
		});

		$scope.changepassword = function() {
			var formData = {
				password: $scope.user.password,
				newpassword: $scope.user.newpassword
			}
			console.log(formData);
			Main.changepassword(formData, function(res) {
				console.log("Main.changePassword");
				if (res.type == false) {
					alert(res.data)
				} else {
					console.log(res.message);
					console.log(res.token);
					$localStorage.token = res.token;
					$location.path("/home");  
				}
			}, function() {
				$rootScope.error = 'Failed to signup';
			})
		};

}])


premiControllers.controller('HomeController',['$rootScope', '$scope', '$location', 'Main', 'toPages', function($rootScope, $scope, $location,  Main, toPages) {
	//$scope.allSS = SlideShow.query();

	$scope.goEdit = function(slideId){
		toPages.editpage(slideId);
	}

	$scope.goExecute = function(slideId){
		toPages.executionpage(slideId);
	}

	$scope.goProfile = function(){
		toPages.profilepage();
	}

	$scope.deleteSlideShow = function(slideId) {
		//$scope.delete CHIAMARE LA DELETE SLIDESHOW DEL MODEL
		//$scope.delete CHIAMARE LA DELETE SLIDESHOW DELLA VIEW
	}
	$scope.renameSlideShow = function(slideId) {
		//$scope.delete CHIAMARE LA DELETE SLIDESHOW DEL MODEL
		//$scope.delete CHIAMARE LA DELETE SLIDESHOW DELLA VIEW
	}
	$scope.createSlideShow = function() {
		//$scope.delete CHIAMARE LA DELETE SLIDESHOW DEL MODEL
		//$scope.delete CHIAMARE LA DELETE SLIDESHOW DELLA VIEW
	}
}])