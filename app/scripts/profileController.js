'use strict';

var premiProfileController = angular.module('premiProfileController', ['premiService'])

premiProfileController.controller('ProfileController', ['$scope', '$localStorage', 'Main', 'toPages', 'Utilities',
	function($scope, $localStorage, Main, toPages, Utilities) {
/*
		Main.me(function(res) {
			$scope.user = res;
		}, function() {
			$rootScope.error = 'Failed to fetch details';
		});
*/

		var getData = function(){
			return {
				username: Utilities.getUserFromToken().user,
				password: CryptoJS.SHA1($scope.user.password).toString(),
				newpassword: CryptoJS.SHA1($scope.user.newpassword).toString()
			}
		}

		$scope.changepassword = function() {
			//check che i campi pwd non siano vuoti
			if(!$scope.user || typeof $scope.user.password === 'undefined' || typeof $scope.user.newpassword === 'undefined' || typeof $scope.user.confnewpassword === 'undefined')
				throw new Error("I campi password non possono essere vuoti");

			//check che la nuova pwd e la su conferma siano identiche
			if($scope.user.newpassword !== $scope.user.confnewpassword)
				throw new Error("La nuova password e la sua conferma non coincidono");
			
			//check che la nuova pwd sia abbastanza lunga
			if(Utilities.grade($scope.user.newpassword) == 'weak'){
				throw new Error("Attenzione: la password è troppo corta. Deve essere di almeno 6 caratteri")
			}

			var formData = getData();

			console.log(formData);
			Main.changepassword(formData, function(res) {
				console.log("Password modificata con successo");
				$scope.user.password = 'undefined';
				$scope.user.newpassword = 'undefined';
				$scope.user.confpassword = 'undefined';
			}, function(res) {
				throw new Error(res.message);
			})
		};

}])