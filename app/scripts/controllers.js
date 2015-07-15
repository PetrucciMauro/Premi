'use strict';

var premiControllers = angular.module('premiControllers', ['premiService']);

premiControllers.controller('HeaderController', ['$scope', '$localStorage','Main','toPages',
	function($scope, $localStorage,Main,toPages) {
		$scope.isToken = function() {
			if(typeof $localStorage.token === 'undefined'){
				return false;
			}
			return true;
		};

		$scope.goLogin = function(){
			toPages.loginpage();
		}
		$scope.goRegistrazione = function(){
			toPages.registrazionepage();
		}

		$scope.goHome = function(){
			toPages.homepage();
		}
		$scope.goProfile = function(){
			toPages.profilepage();
		}

		$scope.logout = function() {
			Main.logout(function() {
				toPages.loginpage();
			}, function() {
				alert("Failed to logout!");
			});
		};

}])

premiControllers.controller('premiAuthenticationController', ['$scope', '$location', '$localStorage','Main','toPages',
	function($scope, $location, $localStorage,Main,toPages) {
		$scope.reset = function() {
			$scope.user = {};
		};
		$scope.token = function() {
			if(typeof $localStorage.token === 'undefined')
				return undefined;
			return $localStorage.token;
		};

		var getData = function(){
			return {
				username: $scope.user.username,
				password: CryptoJS.SHA1($scope.user.password).toString()
			}
		}

		$scope.login = function() {
			//check che i campi username e pwd non siano vuoti
			if(!$scope.user || typeof $scope.user.username === 'undefined' || typeof $scope.user.password === 'undefined')
				throw new Error("I campi username e password non possono essere vuoti");
			var formData = getData();
			console.log(formData.password);

			Main.login(formData, function(res) {
				console.log("Main.login login");
				if (res.type == false) {
					alert(res.data)    
				} else {
					$localStorage.token = res.token;
					console.log($localStorage.token);
					toPages.homepage(); 
				}
			}, function(res) {
				throw new Error(res.message);
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
			var formData = getData();
			console.log("Registrazione");
			Main.save(formData, function(res) {
				console.log("Main.save registration");
				if (res.type == false) {
					alert(res.data)
				} else {
					$localStorage.token = res.token;
					toPages.homepage();
				}
			}, function(res) {
				throw new Error(res.message);
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

premiControllers.controller('ProfileController', ['$rootScope','$scope', '$location','$localStorage', 'Main', 'toPages','$route',
	function($rootScope,$scope, $location,$localStorage, Main, toPages,$route) {
/*
		Main.me(function(res) {
			$scope.user = res;
		}, function() {
			$rootScope.error = 'Failed to fetch details';
		});
*/

		var getPwd = function(){
			return {
				password: CryptoJS.SHA1($scope.user.password).toString(),
				newpassword: CryptoJS.SHA1($scope.user.newpassword).toString()
			}
		}

		$scope.changepassword = function() {
			var formData = getPwd();

			console.log(formData);
			Main.changepassword(formData, function(res) {
				console.log("Main.changePassword");
				if (res.type == false) {
					alert(res.data)
				} else {
					//$route.reload();
				}
			}, function(res) {
				throw new Error(res.message);
			})
		};

}])


premiControllers.controller('HomeController',['$rootScope', '$scope', '$location', 'Main', 'toPages', 'SlideShow',
	function($rootScope, $scope, $location,  Main, toPages, SlideShow) {
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