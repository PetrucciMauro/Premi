'use strict';

/*
* Name :  accessController.js
* Module : Controller::HeaderController e Controller::AuthenticationController
* Location : scripts/accessController.js
*
* History :
* Version       Date        Programmer                  Description
* =================================================================================================
* 0.0.1        01/07/2015   Busetto Matteo            Inizio accessController
* 0.2.0        15/07/2015   Busetto Matteo            Diviso tra Header e Authentication -Controller
* 0.5.0        20/07/2015   Busetto Matteo            Pulito il codice
* 1.0.0        25/07/2015   Busetto Matteo            Versione finale
* =================================================================================================
*
*/

var premiAccessController = angular.module('premiAccessController', ['premiService']);

premiAccessController.controller('HeaderController', ['$rootScope', '$scope', 'Main', 'toPages', 'Utils',
	function($rootScope, $scope, Main, toPages, Utils) {
		$scope.error = function(){
			return $rootScope.error;
		}
		//Metodi per far apparire il saluto e i pulsanti di logout, home e profilo
		$scope.who = function(){
			return Main.getUser().user;
		};
		$scope.isToken = function() {
			return Utils.isObject(Main.getToken());
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
		var getData = function(){
			return {
				username: $scope.user.username,
				password: Utils.encrypt($scope.user.password)
			}
		};

		//Metodo per resettare i campi username e password
		$scope.reset = function() {
			$scope.user = {};
			$scope.usernameError = undefined;
			$scope.passwordError = undefined;
		};

		//Metodo per effettuare il login al server
		$scope.login = function() {
			//check che i campi username e pwd non siano vuoti
			var notgo = false;

			if(Utils.isUndefined($scope.user)){
				$scope.passwordError='Inserire password';
				$scope.usernameError='Inserire username';
				notgo = true;
			}
			else{
				if(Utils.isUndefined($scope.user.username)){
					$scope.usernameError='Inserire username';
					notgo = true;
				}

				if(Utils.isUndefined($scope.user.password)){
					$scope.passwordError='Inserire password';
					notgo = true;
				}
			}
			if(notgo) return;
            
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
			var notgo = false;

			if(Utils.isUndefined($scope.user)){
				$scope.passwordError='Inserire password';
				$scope.usernameError='Inserire username';
				notgo = true;
			}
			else{
				if(Utils.isUndefined($scope.user.username)){
					$scope.usernameError='Inserire username';
					notgo = true;
				}

				if(Utils.isUndefined($scope.user.password)){
					$scope.passwordError='Inserire password';
					notgo = true;
				}
				else	
				//check che la pwd sia abbastanza lunga
					if(Utils.grade($scope.user.password) == 'weak'){
						$scope.passwordError="La password deve essere lunga almeno 6 caratteri";
						notgo = true;
					}
			}

			if(notgo) return;

			var formData = getData();
 

			//richiamata la registrazione
			Main.register(formData, function() {	//function richiamata in caso di successo
				toPages.homepage();
			}, function(res) {
				throw new Error(res.message);		//function richiamata in caso di successo
			})
		};
	}])
