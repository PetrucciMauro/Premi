'use strict';

var premiApp = angular.module('premiApp', [
  'ngRoute',
  'premiControllers',
  'ngMaterial',
  'users',
  'ngStorage'

  ]);

premiApp.run(function($log){
 $log.debug("starterApp + ngMaterial running...");
});

premiApp.config(function($routeProvider,$mdIconProvider,$mdThemingProvider,$httpProvider){
  $routeProvider.
		when('/login', {
			templateUrl: 'partials/login.html',
			controller: 'premiAuthenticationController'
		}).
		when('/registrazione', {
			templateUrl: 'partials/registrazione.html',
			controller: 'premiAuthenticationController'
		}).
		when('/profile', {
			templateUrl: 'partials/profile.html',
			controller: 'ProfileController'
		}).
		when('/home', {
			templateUrl: 'partials/home.html',
			controller: 'HomeController'
		}).
		otherwise({
			redirectTo: '/login'
		});


$httpProvider.interceptors.push(['$q', '$location', '$localStorage', function($q, $location, $localStorage) {
  return {
		'request': function (config) {
				console.log(config.headers);
		    config.headers = config.headers || {};
		    if ($localStorage.token) {
		    	console.log(config.headers);
		    	console.log(config.headers.Authorization);
	        config.headers.Authorization = $localStorage.token;
	        console.log(config.headers.Authorization);
	        console.log(config);
		    }
		    return config;
      },
    'responseError': function(response) {
        if(response.status === 401 || response.status === 403) {
          $location.path('/');
        }
        return $q.reject(response);
      }
  };
}]);
		
//	$httpProvider.defaults.useXDomain = true;
//  $httpProvider.defaults.withCredentials = true;
  
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

