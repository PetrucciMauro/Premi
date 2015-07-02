'use strict';

var premiControllers = angular.module('premiControllers', ['premiService']);

premiControllers.controller('premiAuthenticationController', ['$rootScope', '$scope', '$location', '$localStorage','Main', function($rootScope, $scope, $location, $localStorage,Main) {
	$scope.master = {};

	$scope.update = function(user) {
		$scope.master.username = $scope.user.username;
		$scope.master.password = $scope.user.password;
		$scope.status = 'logged';
	};

	$scope.reset = function() {
		$scope.user = angular.copy($scope.master);
	};

	$scope.login = function() {
		var formData = {
				username: $scope.user.username,
				password: $scope.user.password
		}

		Main.login(formData, function(res) {
			console.log("Main.login");
				if (res.type == false) {
						alert(res.data)    
				} else {
						$localStorage.token = res.data.token;
						$local.path("/home");    
				}
		}, function() {
				$rootScope.error = 'Failed to login';
		})
	};

	$scope.registration = function() {
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
                        console.log(res.data.message);
                        console.log(res.data.token);
						$localStorage.token = res.data.token;
						$location.path("/home");  
				}
		}, function() {
				$rootScope.error = 'Failed to signup';
		})
	};

	$scope.me = function() {
		Main.me(function(res) {
				$scope.myDetails = res;
		}, function() {
				$rootScope.error = 'Failed to fetch details';
		})
	};

	$scope.logout = function() {
		$scope.welcome = '';
		$scope.message = '';
		$scope.isAuthenticated = false;
		delete $window.sessionStorage.token;
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

premiControllers.controller('MeCtrl', ['$rootScope', '$scope', '$location', 'Main', function($rootScope, $scope, $location, Main) {
	Main.me(function(res) {
			$scope.myDetails = res;
		}, function() {
			$rootScope.error = 'Failed to fetch details';
		})
	}])


premiControllers.controller('HomeController',['$rootScope', '$scope', '$location', 'Main', 'toPages', function($rootScope, $scope, $location, Main, toPages) {
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



