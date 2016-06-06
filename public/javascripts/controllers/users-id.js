module.exports = ['$routeParams', '$scope', '$location', '$http', '$rootScope', 'notie', function($routeParams, $scope, $location, $http, $rootScope, notie) {
        $rootScope.nav = '';

        if (!$rootScope.user) {
            $location.path('/');
        } else if ($rootScope.user.id == $routeParams.id) {
            $scope.email = $rootScope.user.email;
        } else {
            $http.get('/api/users/' + $routeParams.id).success(function(data) {
                $scope.email = data.email;
            }).error($rootScope.$error);
        }

        $scope.updateUser = function () {
          $translate(['user_updated', 'old_password_doesnt_match', 'confirm_password_doesnt_match']).then(function (translations) {
            if ($scope.password == $scope.confirmpassword && $scope.password != $scope.oldpassword) {
              $http.put('/api/users/' + $routeParams.id, {
                  email: $scope.email,
                  password: $scope.password,
                  oldpassword: $scope.oldpassword
              }).success(function(data) {
                  notie.alert(1, translations.user_updated, 3);
                  $location.path('/users/');
              }).error(function (data, code) {
                  if (code == 401) {
                    notie.alert(3, translations.old_password_doesnt_match, 3);
                  } else {
                    $rootScope.$error();
                  }
              });
            } else {
              notie.alert(3, translations.confirm_password_doesnt_match, 3);
            }
        });
      };

}];
