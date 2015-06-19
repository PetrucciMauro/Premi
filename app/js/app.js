var premiApp = angular.module('premiApp', [
  'ngRoute',
  'premiControllers'
  ]);

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










