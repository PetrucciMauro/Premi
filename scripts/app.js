'use strict';

var premiApp = angular.module('premiApp', [
	'ngRoute',
	'ngMaterial',
	'ngStorage',
	'premiService',
	'premiAccessController',
	'premiHomeController',
	'premiProfileController',
	'premiEditController',
	'premiExecutionController'
	]);

premiApp.run(function($log, $rootScope, Main, Utils, toPages){
	$log.debug("PremiApp attivo :)");

	//Metodo che ad ogni cambio di pagina controlla per le pagine in cui isToken=true
	//(pagine per cui serve un login) che effettivamente l'utente si sia prima autenticato
	$rootScope.$on('$routeChangeStart', function (event, next) {
		if(!next.isLogin)
			return;

		var token = Main.getToken();

		if (Utils.isUndefined(token))
			//il token non è definito e l'utente non può accedere a questa pagina
			//viene rimandato alla pagina di login
			toPages.loginpage();
	});
});

premiApp.config(function($routeProvider,$mdIconProvider,$mdThemingProvider,$httpProvider,$provide,$locationProvider){
	$routeProvider.
		//isLogin: se true indica che per accedere a quella pag. bisogna essere autenticati
		when('/login', {
			templateUrl: 'public_html/login.html',
			controller: 'AuthenticationController',
			isLogin: false
		}).
		when('/registrazione', {
			templateUrl: 'public_html/registrazione.html',
			controller: 'AuthenticationController',
			isLogin: false
		}).
		when('/private/profile', {
			templateUrl: 'private_html/profile.html',
			controller: 'ProfileController',
			isLogin: true
		}).
		when('/private/home', {
			templateUrl: 'private_html/home.html',
			controller: 'HomeController',
			isLogin: true
		}).
		when('/private/edit', {
			templateUrl: 'private_html/edit.html',
			controller: 'EditController',
			isLogin: true
		}).
		when('/private/execution', {
			templateUrl: 'private_html/execution.html',
			controller: 'ExecutionController',
			isLogin: true
		}).
		otherwise({
			
			redirectTo: '/login'
		});

	$httpProvider.interceptors.push(['$rootScope', '$q', 'Main', 'Utils',
		function($rootScope, $q, Main, Utils, toPages) {
			return {
				'request': function (config) {
					config.headers = config.headers || {};
					if (Utils.isObject(Main.getToken())){
						config.headers.Authorization = Main.getToken();
						
					}
					else
						console.log("token non definito ");
					
					return config;
				},
				'responseError': function(response) {
					console.log("response error");
					if(response.status === 401 || response.status === 403) {
						throw new Error(response.message);
						toPages.loginpage();
					}
					return $q.reject(response);
				}
			};
	}]);

	$provide.decorator("$exceptionHandler", function($delegate, $injector){
		return function(exception, cause){
			alert(exception.message);
			$delegate(exception, cause);

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
		.primaryPalette('indigo')
		.accentPalette('yellow');
}); 

