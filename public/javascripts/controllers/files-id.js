module.exports = ['$scope', '$rootScope', '$location', '$http', '$routeParams', 'notie', '$translate', function ($scope, $rootScope, $location, $http, $routeParams, notie, $translate) {

        if (isNaN($routeParams.id)) {
          $scope.path = {
            root: 'share/',
            id: $routeParams.id
          };
          $scope.share = true;
        } else {
          $scope.path = {
            root: '',
            id: $routeParams.id
          };
          if (!$rootScope.user) {
              $location.path('/login');
          }
        }
        $rootScope.path = false;

        $http.get('/api/files/' + $scope.path.root + $scope.path.id).success(function(data) {

            $scope.currentFile = data;
            $scope.shareUri = $location.protocol() + '://' + $location.host() + ':' + $location.port() + '/#/files/' + data.shareId;

            $scope.preview = data.preview;

            if (data.preview == 'text') {
              $http.get('/api/files/' + $scope.path.root + 'preview/' + $scope.path.id).success(function(file) {
                if (/json/.test(data.type)) {
                  $scope.text = JSON.stringify(file, null, ' ');
                } else {
                  $scope.text = file;
                }
              }).error(function () {
                $scope.preview = false;
              });
            }

        }).error(function() {
            $translate('file_doesnt_exist').then(function (translation) {
              notie.alert(2, translation, 3);
              $location.path('/');
            });
        });

        $scope.deleteFile = function () {
          $translate(['delete_it', 'delete_file_question', 'file_deleted', 'cancel']).then(function (translations) {
            notie.confirm(translations['delete_file_question'], translations['delete_it'], translations['cancel'], function() {
              $http.delete('/api/files/' + $routeParams.id).success(function(data) {
                  notie.alert(1, translations['file_deleted'], 3);
                  $location.path('/');
              }).error($rootScope.error);
            });
          });
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

        $scope.toggleShare = function () {
          $http.put('/api/files/' + $routeParams.id, {
            shareState: $scope.currentFile.shareState
          }).success(function(data) {
            $translate(($scope.currentFile.shareState ? 'sharing_enabled' : 'sharing_disabled')).then(function (translation) {
              notie.alert(1, translation, 3);
              $scope.editing = false;
            });
          }).error($rootScope.error);
        };

        $scope.loadPreview = function (err) {
          if (err) {
            $scope.preview = 'false';
            $scope.$apply();
          }
        }
}];
