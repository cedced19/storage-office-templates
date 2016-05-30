module.exports = ['$scope', '$rootScope', '$location', '$http', 'Upload', function ($scope, $rootScope, $location, $http, Upload) {

        if (!$rootScope.user) {
            $location.path('/login');
        }

        $scope.createFile = function () {
          Upload.upload({
            url: 'api/files/',
            data: {
              file: $scope.file,
              title: $scope.title,
              description: $scope.description
            }
          }).then(function (res) {
            console.log('Success ' + res.config.data.file.name + 'uploaded. Response: ' + res.data);
          }, function (res) {
              console.log('Error status: ' + res.status);
          }, function (evt) {
              var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
              console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
          });
        };
}];
