angular.module('app', [])
    .controller('loginController', ['$scope', function($scope) {
      $scope.master = {};

      $scope.update = function(user) {
        $scope.master = angular.copy(user);
        $scope.status = 'logged';
      };

      $scope.reset = function() {
        $scope.user = angular.copy($scope.master);
      };


    $scope.grade = function() {
    var size = $scope.user.password.length;
    if (size > 8) {
      $scope.strength = 'strong';
    } else if (size > 3) {
      $scope.strength = 'medium';
    } else {
      $scope.strength = 'weak';
    }
   };


      $scope.reset();
    }]);
