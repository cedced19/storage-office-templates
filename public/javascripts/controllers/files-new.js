module.exports = ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {

        if (!$rootScope.user) {
            $location.path('/login');
        }

}];
