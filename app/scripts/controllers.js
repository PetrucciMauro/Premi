'use strict';

var premiControllers = angular.module('premiControllers', ['premiService']);

premiControllers.controller('premiAuthenticationController', ['$rootScope', '$scope', '$location', '$localStorage','Main','toPages','$window','errorHandler',
	function($rootScope, $scope, $location, $localStorage,Main,toPages,$window,errorHandler) {
		$scope.master = {};

		$scope.error = $rootScope.error;

		$scope.update = function() {
			$scope.master.username = $scope.user.username;
			$scope.master.password = $scope.user.password;
			$scope.status = 'logged';
		};

		$scope.reset = function() {
			$scope.user = angular.copy($scope.master);
		};

		$scope.login = function() {
			//errorHandler.error("Oddio","colpa mia");
			var formData = {
				username: $scope.user.username,
				password: $scope.user.password
			}

			Main.login(formData, function(res) {
				if (res.type == false) {
					alert(res.data)    
				} else {
					$localStorage.token = res.token;
					toPages.homepage(); 
				}
			}, function() {
				$rootScope.error = 'Failed to login';
			})
		};

		$scope.registration = function() {
			this.grade();
			if($scope.strength == 'weak'){

				$location.path("/login");
			}
			var formData = {
				username: $scope.user.username,
				password: $scope.user.password
			}
			Main.save(formData, function(res) {
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

		$scope.logout = function() {
			Main.logout(function() {
				toPages.loginpage();
				$window.location.reload();
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