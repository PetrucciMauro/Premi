'use strict';

var premiAccessController = angular.module('premiAccessController', ['premiService']);

premiAccessController.controller('HeaderController', ['$rootScope', '$scope', 'Main', 'toPages', 'Utils',
	function($rootScope, $scope, Main, toPages, Utils) {
		var token = function(){
			return Main.login().getToken();
		}

		//Metodi per far apparire il saluto e i pulsanti di logout, home e profilo
		$scope.who = function(){
			return Utils.getUser(token()).user;
		};
		$scope.isToken = function() {
			return Utils.isObject(token());
		};

		//Metodi per il reindirizzamento delle pagine
		$scope.goLogin = function(){
			toPages.loginpage();
		};
		$scope.goRegistrazione = function(){
			toPages.registrazionepage();
		};
		$scope.goHome = function(){
			toPages.homepage();
		};
		$scope.goProfile = function(){
			toPages.profilepage();
		};

		//Metodo per il logout
		$scope.logout = function() {
			Main.logout(function() {
				toPages.loginpage();
			}, function(res) {
				throw new Error(res.message);
			});
		};

}])

premiAccessController.controller('AuthenticationController', ['$scope', 'Main', 'toPages', 'Utils',
	function($scope, Main, toPages, Utils) {
		var token = function(){
			return Main.login().getToken();
		};

		var getData = function(){
			return {
				username: $scope.user.username,
				password: Utils.encrypt($scope.user.password)
			}
		};

		//Metodo per resettare i campi username e password
		$scope.reset = function() {
			$scope.user = {};
		};

		//Metodo per effettuare il login al server
		$scope.login = function() {
			//check che i campi username e pwd non siano vuoti
			if(Utils.isUndefined($scope.user.username))
				$scope.user.username.error="Inserire username";
			if(Utils.isUndefined($scope.user.password))
				$scope.user.password.error="Inserire username";

			var formData = getData();

			//richiamato il login
			Main.login(formData, function() {	//function richiamata in caso di successo
				toPages.homepage();
			}, function(res) {						//function richiamata in caso di errore
				throw new Error(res.message);
			})
		};

		//Metodo per effettuare la registrazione al server
		$scope.registration = function() {
			//check che i campi username e pwd non siano vuoti
			if(Utils.isUndefined($scope.user) || Utils.isUndefined($scope.user.username) || Utils.isUndefined($scope.user.password))
				throw new Error("I campi username e password non possono essere vuoti");
			
			//check che la pwd sia abbastanza lunga
			if(Utils.grade($scope.user.password) == 'weak'){
				throw new Error("Attenzione: la password è troppo corta. Deve essere di almeno 6 caratteri")
			}

			var formData = getData();

			//richiamata la registrazione
			Main.register(formData, function() {	//function richiamata in caso di successo
				toPages.homepage();
			}, function(res) {
				throw new Error(res.message);		//function richiamata in caso di successo
			})
		};
	}])
