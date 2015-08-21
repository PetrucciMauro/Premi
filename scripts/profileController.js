'use strict';

/*
* Name :  profileController.js
* Module : Controller::profileController
* Location : scripts/profileController.js
*
* History :
* Version       Date        Programmer                  Description
* =================================================================================================
* 0.0.1        01/07/2015   Petrucci Mauro            Inizio profileController
* 0.2.0        15/07/2015   Busetto Matteo            Aggiunto cambio password
* 0.5.0        20/07/2015   Busetto Matteo            Tolto upload
* 1.0.0        25/07/2015   Busetto Matteo            Versione finale
* =================================================================================================
*
*/

var premiProfileController = angular.module('premiProfileController', ['premiService'])

premiProfileController.controller('ProfileController', ['$scope', 'Main', 'toPages', 'Utils', 'Upload',
	function($scope, Main, toPages, Utils, Upload) {
		if(Utils.isUndefined(Main.getToken()))//check che sia autenticato
			toPages.loginpage();


		var getData = function(){
			return {
				username: Main.getUser().user,
				password: Utils.encrypt($scope.user.password),
				newpassword: Utils.encrypt($scope.user.newpassword)
			}
		};

		$scope.changepassword = function() {
			//check che i campi pwd non siano vuoti
			if(Utils.isUndefined($scope.user) || Utils.isUndefined($scope.user.password) || Utils.isUndefined($scope.user.newpassword) || Utils.isUndefined($scope.user.confnewpassword))
				throw new Error("I campi password non possono essere vuoti");

			//check che la nuova pwd e la su conferma siano identiche
			if($scope.user.newpassword !== $scope.user.confnewpassword)
				throw new Error("La nuova password e la sua conferma non coincidono");
			
			//check che la nuova pwd sia abbastanza lunga
			if(Utils.grade($scope.user.newpassword) == 'weak'){
				throw new Error("Attenzione: la password è troppo corta. Deve essere di almeno 6 caratteri")
			}

			var formData = getData();

			Main.changepassword(formData, function() {
				$scope.message = 'Password modificata con successo';
				$scope.user.password = {};
				$scope.user.newpassword = {};
				$scope.user.confpassword = {};
			}, function(res) {
				throw new Error(res.message);
			})
		};


}])