module.exports = ['$scope', '$rootScope', '$location', '$http', function ($scope, $rootScope, $location, $http) {

        if (!$rootScope.user) {
            $location.path('/login');
        }

        $http.get('/api/files').success(function(data) {
            $rootScope.files = data;
        }).error($rootScope.$error);
}];
