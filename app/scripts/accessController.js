'use strict';

var premiAccessController = angular.module('premiAccessController', ['premiService']);

premiAccessController.controller('HeaderController', ['$scope', '$localStorage', 'Main', 'toPages', 'Utilities',
	function($scope, $localStorage, Main, toPages, Utilities) {
		
		$scope.who = function(){
			return Utilities.getUserFromToken().user;
		}

		$scope.isToken = function() {
			if(typeof $localStorage.token === 'undefined')
				return false;
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

premiAccessController.controller('premiAuthenticationController', ['$scope', '$localStorage', 'Main', 'toPages', 'Utilities',
	function($scope, $localStorage, Main, toPages, Utilities) {
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

			Main.login(formData, function(res) {
				$localStorage.token = res.getToken();
				toPages.homepage();
			}, function(res) {
				throw new Error(res.message);
			})
		};

		$scope.registration = function() {
			//check che i campi username e pwd non siano vuoti
			if(!$scope.user || typeof $scope.user.username === 'undefined' || typeof $scope.user.password === 'undefined')
				throw new Error("I campi username e password non possono essere vuoti");
			
			//check che la pwd sia abbastanza lunga
			if(Utilities.grade($scope.user.password) == 'weak'){
				throw new Error("Attenzione: la password è troppo corta. Deve essere di almeno 6 caratteri")
			}

			var formData = getData();

			console.log("Registrazione");
			Main.save(formData, function(res) {
				$localStorage.token = res.getToken();
				toPages.homepage();
			}, function(res) {
				throw new Error(res.message);
			})
		};
	}])
