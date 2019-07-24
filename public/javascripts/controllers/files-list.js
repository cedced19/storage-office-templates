module.exports = ['$scope', '$rootScope', '$location', '$http', function ($scope, $rootScope, $location, $http) {

        if (!$rootScope.user) {
            $location.path('/login');
        }
        $rootScope.path = 'files-list';

        $http.get('/api/files').success(function(data) {
            $rootScope.files = data;
        }).error($rootScope.$error);
}];
