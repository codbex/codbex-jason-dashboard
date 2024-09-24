const navigation = angular.module("launchpad", ["ngResource", "ideLayout", "ideUI"]);
navigation.controller("LaunchpadViewController", ["$scope", "messageHub", "$http", function ($scope, messageHub, $http) {
    $scope.currentViewId = 'dashboard';

    $scope.switchView = function (id, event) {
        if (event) event.stopPropagation();
        $scope.currentViewId = id;
    };

    messageHub.onDidReceiveMessage('launchpad.switch.perspective', function (msg) {
        $scope.$apply(function () {
            $scope.switchView(msg.data.perspectiveId);
        });
    }, true)

    $scope.sections = [
        {
            "name": "People", "groups": [
                {
                    "name": "Employees", "expanded": "peopleExpanded", "icon": "company-view",
                    "items": [
                        { "name": "Organisations", "view": "organisations" },
                        { "name": "Employees", "view": "employees" }
                    ]
                }
            ]
        },
    ];

}]);
