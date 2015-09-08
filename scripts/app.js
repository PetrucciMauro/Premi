'use strict';

/*
* Name :  app.js
* Module : Controller::premiApp
* Location : scripts/app.js
*
* History :
* Version       Date        Programmer                  Description
* =================================================================================================
* 0.0.1        01/06/2015   Busetto Matteo            Inizio premiApp
* 0.2.0        15/06/2015   Busetto Matteo            Configurato opportunamente le varie parti (routing e interceptor)
* 0.5.0        20/06/2015   Busetto Matteo            Configurato exception handler
* 1.0.0        25/06/2015   Busetto Matteo            Versione finale
* =================================================================================================
*
*/

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

    $rootScope.$on('$locationChangeSuccess', function ($event, changeTo, changeFrom) {
		if (changeTo == changeFrom)
			return;
		if (changeFrom.indexOf("execution") == -1)
			return;
		if (changeTo.indexOf("execution") != -1)
			return;

		window.location.href = changeTo;
		window.location.reload(true);
    });

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
			isLogin: true,
			reloadOnSearch: false
		}).
		when('/private/execution:rest*', {
			templateUrl: 'private_html/execution.html',
			controller: 'ExecutionController',
			isLogin: true,
			reloadOnSearch: false
		}).
		otherwise({
			redirectTo: function(){
				return '/login';}
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

