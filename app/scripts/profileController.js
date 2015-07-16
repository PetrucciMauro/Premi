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
  		var image = ['jpeg','jpg','gif','png'];
		var audio = ['mp3'];
		var video = ['mp4','waw','avi'];


		var getData = function(){
			return {
				username: Utilities.getUserFromToken().user,
				password: CryptoJS.SHA1($scope.user.password).toString(),
				newpassword: CryptoJS.SHA1($scope.user.newpassword).toString()
			}
		}

		var getMedia = function(){

			return {
				username: Utilities.getUserFromToken().user,
				media: JSON.stringify($scope.myFile)
			}
		}


		var getExtension = function (filename) {
           
           var extension = filename.split(".");
           return extension[extension.length-1];

           		}

        var getUrlFormat = function (extension) {

        	if( image.indexOf(extension) != -1) return "/image";
        	if( audio.indexOf(extension) != -1) return "/audio";
        	if( video.indexOf(extension) != -1) return "/video";
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

		$scope.uploadmedia = function(){

                   var file = (($('input[type=file]').val()).split('\\'))[2];
        		   console.log('file is ' + JSON.stringify(file));
                   var formData = new FormData();
                   formaData.append("file", file);
                   var extension= getExtension(file);
                   console.log(extension);
                   var urlFormat = getUrlFormat(extension);
                   console.log(urlFormat);
                   
             Main.uploadmedia(formData,Utilities.getUserFromToken().user,urlFormat, function(res){
             	console.log("upload file completato");
             	$scope.myFile= 'undefined';
             }, function(res){
             	throw new Error(res.message);
             })
			

		};

}])