'use strict';

var premiApp = angular.module('premiApp', [
	'ngRoute',
	'ngMaterial',
	'ngStorage',
	'premiAccessController',
	'premiHomeController',
	'premiProfileController'
	]);

premiApp.run(function($log){
	$log.debug("PremiApp + ngMaterial running...");
});

premiApp.config(function($routeProvider,$mdIconProvider,$mdThemingProvider,$httpProvider,$provide){
	$routeProvider.
	when('/login', {
		templateUrl: 'partials/login.html',
		controller: 'premiAuthenticationController'
	}).
	when('/registrazione', {
		templateUrl: 'partials/registrazione.html',
		controller: 'premiAuthenticationController'
	}).
	when('/private/profile', {
		templateUrl: 'partials/profile.html',
		controller: 'ProfileController'
	}).
	when('/private/home', {
		templateUrl: 'partials/home.html',
		controller: 'HomeController'
	}).
	otherwise({
		redirectTo: '/login'
	});


	$httpProvider.interceptors.push(['$q', '$location', '$localStorage', function($q, $location, $localStorage) {
		return {
			'request': function (config) {
				config.headers = config.headers || {};
				if ($localStorage.token) {
					config.headers.sessiontoken = $localStorage.token;
				}
				else
					console.log("token non definito ");
				return config;
		},
			'responseError': function(response) {
				if(response.status === 401 || response.status === 403) {
					throw new Error(response.message);
					$location.path('/login');
				}
				return $q.reject(response);
			}

	};
}]);

	$provide.decorator("$exceptionHandler", function($delegate, $injector){
		return function(exception, cause){
			$delegate(exception, cause);
			alert(exception.message);
		};
	});

	$mdIconProvider
		.defaultIconSet("./assets/svg/avatars.svg", 128)
		.icon("menu", "./assets/svg/menu.svg", 24)
		.icon("share", "./assets/svg/share.svg", 24)
		.icon("google_plus", "./assets/svg/google_plus.svg" , 512)
		.icon("hangouts"   , "./assets/svg/hangouts.svg"    , 512)
		.icon("twitter"    , "./assets/svg/twitter.svg"     , 512)
		.icon("phone"      , "./assets/svg/phone.svg"       , 512);

	$mdThemingProvider.theme('default')
		.primaryPalette('brown')
		.accentPalette('red');
}); 

