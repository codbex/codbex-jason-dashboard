const dashboard = angular.module('dashboard', ['ideUI', 'ideView']);

dashboard.controller('DashboardController', ['$scope', '$document', '$http', 'messageHub', function ($scope, $document, $http, messageHub) {
    $scope.state = {
        isBusy: true,
        error: false,
        busyText: "Loading...",
    };

    // Current date
    $scope.today = new Date();
    $scope.todayTasks = [];
    $scope.milestones = [];

    // Fetch Budget, Tasks, and Milestones data when document is ready
    angular.element($document[0]).ready(async function () {
        await getBudget();
        await getTasks();
        await getMilestones();
        filterTodayTasks();

        // Doughnut Chart Configuration
        const doughnutData = {
            labels: ['Initial Budget', 'Cost Estimation'],
            datasets: [{
                data: [$scope.BudgetData.InitialBudget, $scope.BudgetData.CostEstimation],
                backgroundColor: ['#36a2eb', '#ff6384']
            }]
        };

        const doughnutOptions = {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                position: 'bottom'
            },
            title: {
                display: true,
                text: 'Budget Status'
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        };

        const doughnutChartCtx = $document[0].getElementById('doughnutChart').getContext('2d');
        new Chart(doughnutChartCtx, {
            type: 'doughnut',
            data: doughnutData,
            options: doughnutOptions
        });

        $scope.$apply(function () {
            $scope.state.isBusy = false;
        });
    });

    async function getBudget() {
        try {
            const response = await $http.get("/services/ts/codbex-jason/api/BudgetService.ts/budgetData");
            $scope.BudgetData = response.data;
        } catch (error) {
            console.error('Error fetching budget data:', error);
        }
    }

    async function getTasks() {
        try {
            const response = await $http.get("/services/ts/codbex-jason/api/TaskService.ts/taskData");
            $scope.tasks = response.data.tasks;
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    }

    async function getMilestones() {
        const milestoneServiceUrl = "/services/ts/codbex-jason/api/MilestoneService.ts/milestoneData";
        try {
            const response = await $http.get(milestoneServiceUrl);
            $scope.milestones = response.data.milestones;
        } catch (error) {
            console.error('Error fetching milestones:', error);
        }
    }

    function filterTodayTasks() {
        if ($scope.tasks) {
            $scope.todayTasks = $scope.tasks.filter(task => {
                const startDate = new Date(task.StartDate);
                const endDate = new Date(task.EndDate);
                const isNotDone = task.StatusType !== 1;
                const isTodayInRange = $scope.today >= startDate && $scope.today <= endDate;
                return isNotDone && isTodayInRange;
            });
        }
    }

    $scope.openPerspective = function (perspective) {
        if (perspective === 'all-tasks') {
            messageHub.postMessage('launchpad.switch.perspective', { perspectiveId: 'deliverables' }, true);
        }
        if (perspective === 'project') {
            messageHub.postMessage('launchpad.switch.perspective', { perspectiveId: 'projects' }, true);
        }
    }
}]);
