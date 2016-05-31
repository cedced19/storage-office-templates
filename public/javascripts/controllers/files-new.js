module.exports = ['$scope', '$rootScope', '$location', '$http', 'Upload', '$translate', 'notie', function ($scope, $rootScope, $location, $http, Upload, $translate, notie) {

        if (!$rootScope.user) {
            $location.path('/login');
        }

        $scope.createFile = function () {
          $scope.uploading = true;
          Upload.upload({
            url: 'api/files/',
            disableProgress: true,
            data: {
              file: $scope.file,
              title: $scope.title,
              description: $scope.description
            }
          }).then(function () {
            $translate('file_saved').then(function (message) {
              notie.alert(1, message, 3);
              $location.path('/');
            });
          }, function () {
            $scope.uploading = false;
            $translate('error_upload').then(function (error) {
              notie.alert(3, error, 3);
            });
          });
        };
}];
