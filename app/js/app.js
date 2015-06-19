var premiApp = angular.module('premiApp', [
  'ngRoute',
  'premiControllers',
  'ngMaterial'
  ]);
  
premiApp.run(function($log){
   $log.debug("starterApp + ngMaterial running...");
     });

  premiApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'partials/login.html',
        controller: 'premiLoginController'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]); 










