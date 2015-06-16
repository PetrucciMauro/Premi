angular.module('app', [])
.controller('loginController', function LoginController($scope) {
  $scope.userName = element(by.model('userName'));
  $scope.password = element(by.model('password'));
  $scope.status = element (by.binding('status'));

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

    $scope.get = function(){
       browser.get('http://localhost:8000/app/index.html');
    }
});
