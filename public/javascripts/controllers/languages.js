module.exports = ['$scope', '$rootScope', '$location', '$translate', 'notie', function ($scope, $rootScope, $location, $translate, notie) {

        if (!$rootScope.user) {
            $location.path('/login');
        }

        $scope.languages = [
          {code: 'en', name: 'English'},
          {code: 'fr', name: 'Français'}
        ];

        $scope.changeLanguage = function (code) {
          $translate.use(code);
          $translate.refresh();
        };

}];
