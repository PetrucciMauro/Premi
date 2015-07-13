'use strict';

var premiControllers = angular.module('premiControllers', ['premiService']);

premiControllers.controller('premiAuthenticationController', ['$rootScope', '$scope', '$location', '$localStorage','Main','toPages', function($rootScope, $scope, $location, $localStorage,Main,toPages) {
	$scope.master = {};

	$scope.update = function() {
		$scope.master.username = $scope.user.username;
		$scope.master.password = $scope.user.password;
		$scope.status = 'logged';
	};

	$scope.reset = function() {
		$scope.user = angular.copy($scope.master);
	};

	$scope.login = function() {
		this.update();
		var formData = {
			username: $scope.user.username,
			password: $scope.user.password
		}

		Main.login(formData, function(res) {
			console.log("Main.login");
			if (res.type == false) {
				alert(res.data)    
			} else {
				console.log(res)
				$localStorage.token = res.token;
				console.log("ok");
				toPages.homepage(); 
			}
		}, function() {
			$rootScope.error = 'Failed to login';
		})
	};

	$scope.registration = function() {
		this.update();
		var formData = {
			username: $scope.user.username,
			password: $scope.user.password
		}
		console.log(formData);
		Main.save(formData, function(res) {
			console.log("Main.save");
			if (res.type == false) {
				alert(res.data)
			} else {
				console.log(res.message);
				console.log(res.token);
				$localStorage.token = res.token;
				toPages.homepage();
			}
		}, function() {
			$rootScope.error = 'Failed to signup';
		})
	};



	$scope.logout = function() {
		Main.logout(function() {
			toPages.homepage();
		}, function() {
			alert("Failed to logout!");
		});
	};

	$scope.token = $localStorage.token;

	$scope.grade = function() {
		var size = $scope.password.length;
		if (size > 8) {
			$scope.strength = 'strong';
		} else if (size > 3) {
			$scope.strength = 'medium';
		} else {
			$scope.strength = 'weak';
		}
	};
}])

premiControllers.controller('ProfileController', ['$rootScope', '$scope', '$location','$localStorage', 'Main', function($rootScope, $scope, $location,$localStorage, Main) {
	       
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