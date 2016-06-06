module.exports = ['$scope', '$rootScope', '$location', '$http', '$routeParams', function ($scope, $rootScope, $location, $http, $routeParams) {

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
            notie.alert(2, 'The file does not exists anymore.', 3);
            $location.path('/');
        });

        $scope.deleteFile = function () {
          
        };
}];
