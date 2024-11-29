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
            "name": "Project", "groups": [
                {
                    "name": "Project", "expanded": "projectExpanded", "icon": "currency",
                    "items": [
                        { "name": "Projects", "view": "projects" },
                        { "name": "Deliverables", "view": "deliverables" },
                        { "name": "Milestones", "view": "milestones" },
                    ]
                }
            ]
        },
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
        {
            "name": "Settings", "groups": [
                {
                    "name": "Configurations", "expanded": "configurationsExpanded", "icon": "wrench",
                    "items": [
                        { "name": "AgileMethodology", "view": "agilemethodology" },
                        { "name": "ApprovalStatus", "view": "approvalstatus" },
                        { "name": "CostCategory", "view": "costcategory" },
                        { "name": "ExpenseCategory", "view": "expensecategory" },
                        { "name": "IterationLenght", "view": "iterationlenght" },
                        { "name": "MemberRole", "view": "memberrole" },
                        { "name": "ResourceType", "view": "resourcetype" },
                        { "name": "StakeHolderType", "view": "stakeholdertype" },
                        { "name": "StatusType", "view": "statustype" }
                    ]
                }
            ]
        }
    ];

}]);
