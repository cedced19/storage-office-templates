module.exports = ['$scope', '$rootScope', '$location', '$http', '$routeParams', 'notie', '$translate', function ($scope, $rootScope, $location, $http, $routeParams, notie, $translate) {

        if (!$rootScope.user) {
            $location.path('/login');
        }

        $http.get('/api/files/' + $routeParams.id).success(function(data) {
            $scope.currentFile = data;

            if (data.preview) {
              $scope.preview = data.preview;
            }

            if (data.preview == 'text') {
              $http.get('/api/files/preview/' + $routeParams.id).success(function(file) {
                if (/json/.test(data.type)) {
                  $scope.text = JSON.stringify(file, null, ' ');
                } else {
                  $scope.text = file;
                }
              }).error(function () {
                $scope.type = false;
              });
            }

        }).error(function() {
            $translate('file_doesnt_exist').then(function (translation) {
              notie.alert(2, translation, 3);
              $location.path('/');
            });
        });

        $scope.deleteFile = function () {
          $http.delete('/api/files/' + $routeParams.id).success(function(data) {
            $translate('file_deleted').then(function (translation) {
              notie.alert(1, translation, 3);
              $location.path('/');
            });
          }).error($rootScope.error);
        };

        $scope.editData = function () {
          $http.put('/api/files/' + $routeParams.id, {
            title: $scope.currentFile.title,
            description: $scope.currentFile.description
          }).success(function(data) {
            $translate('data_updated').then(function (translation) {
              notie.alert(1, translation, 3);
              $scope.editing = false;
            });
          }).error($rootScope.error);
        };
}];
