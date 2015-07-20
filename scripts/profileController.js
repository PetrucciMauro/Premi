'use strict';

var premiProfileController = angular.module('premiProfileController', ['premiService'])

premiProfileController.controller('ProfileController', ['$scope','$http', 'Main', 'toPages', 'Utils', 'Upload',
	function($scope,$http, Main, toPages, Utils, Upload) {
		var token = function(){
			return Main.login().getToken();
		}

		if(Utils.isUndefined(token))
			toPages.loginpage();
		
		//formati accettati per l'upload
		var image = Upload.image;
		var audio = Upload.audio;
		var video = Upload.video;


		var getData = function(){
			return {
				username: Utils.getUser(token()).user,
				password: Utils.encrypt($scope.user.password),
				newpassword: Utils.encrypt($scope.user.newpassword)
			}
		};

		var getMedia = function(){
			return {
				username: Utils.getUser(token()).user,
				media: JSON.stringify($scope.myFile)
			}
		};


		var getExtension = function (filename) {
			var extension = filename.split(".");
			return extension[extension.length-1];

		};

		var getUrlFormat = function (extension) {
			if(image.indexOf(extension) != -1)
				return "/private/api/files/image/";
			if(audio.indexOf(extension) != -1)
				return "/private/api/files/audio/";
			if(video.indexOf(extension) != -1)
				return "/private/api/files/video/";
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

		$scope.uploadmedia = function(files){
			var file = (($('input[type=file]').val()).split('\\'))[2];
			console.log('file is ' + JSON.stringify(file));

			var fd = new FormData();
			fd.append("file", files[0]);

			var extension= getExtension(file);
			console.log(extension);
			var urlFormat = getUrlFormat(extension);
			console.log(urlFormat);
			var uploadUrl="http://sub.lvh.me:8081"+urlFormat+file;
			console.log(uploadUrl);
           console.log(JSON.stringify(fd));
            Upload.uploadmedia(fd,uploadUrl ,function() {
            	$scope.file={};

            } , function(res) {
            	throw new Error(res.message);

            })
        };
			/*$http.post(uploadUrl, fd, {
				headers: {'Content-Type': undefined },
				transformRequest: angular.identity
			})
			.success(function(res){})
			.error(function(){$location.path("/login");})*/

			/* Main.uploadmedia(formData,Utils.getUserFromToken().user,urlFormat, function(res){
				console.log("upload file completato");
				$scope.myFile= 'undefined';
			 }, function(res){
				throw new Error(res.message);
			 })*/
	

	/*
		Main.me(function(res) {
			$scope.user = res;
		}, function() {
			$rootScope.error = 'Failed to fetch details';
		});

	*/


}])