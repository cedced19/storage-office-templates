module.exports = ['$scope', '$rootScope', '$location', '$http', 'Upload', '$translate', 'notie', function ($scope, $rootScope, $location, $http, Upload, $translate, notie) {

        if (!$rootScope.user) {
            $location.path('/login');
        }
        $rootScope.path = 'files-new';

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
            $translate('file_saved').then(function (translation) {
              notie.alert(1, translation, 3);
              $location.path('/');
            });
          }, function () {
            $scope.uploading = false;
            $translate('error_upload').then(function (translation) {
              notie.alert(3, translation, 3);
            });
          });
        };
}];
