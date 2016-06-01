module.exports = ['$scope', '$rootScope', '$location', '$http', '$routeParams', function ($scope, $rootScope, $location, $http, $routeParams) {

        if (!$rootScope.user) {
            $location.path('/login');
        }


        $http.get('/api/files/'+ $routeParams.id).success(function(data) {
            $scope.currentFile = data;

            if (/image/.test(data.type)) {
              $scope.type = 'image';
            }

        }).error(function() {
            notie.alert(2, 'The file does not exists anymore.', 3);
            $location.path('/');
        });
}];
