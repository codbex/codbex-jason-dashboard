const dashboard = angular.module('dashboard', ['ideUI', 'ideView']);

dashboard.controller('DashboardController', ['$scope', '$document', '$http', 'messageHub', function ($scope, $document, $http, messageHub) {
    $scope.state = {
        isBusy: true,
        error: false,
        busyText: "Loading...",
    };

    // Current date
    $scope.today = new Date();
    $scope.todayTasks = []; // Array to hold today's tasks

    // Fetch Budget and Tasks data when document is ready
    angular.element($document[0]).ready(async function () {
        await getBudget(); // Fetch budget data
        await getTasks(); // Fetch all tasks data

        // Filter today's tasks after fetching all tasks
        filterTodayTasks();

        // Prepare Doughnut Chart Data
        const doughnutData = {
            labels: ['Initial Budget', 'Cost Estimation'],
            datasets: [{
                data: [$scope.BudgetData.InitialBudget, $scope.BudgetData.CostEstimation],
                backgroundColor: ['#36a2eb', '#ff6384']
            }]
        };

        // Doughnut Chart Configuration
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

        // Initialize Doughnut Chart
        const doughnutChartCtx = $document[0].getElementById('doughnutChart').getContext('2d');
        new Chart(doughnutChartCtx, {
            type: 'doughnut',
            data: doughnutData,
            options: doughnutOptions
        });

        // Update state to indicate loading is complete
        $scope.$apply(function () {
            $scope.state.isBusy = false;
        });
    });

    // Function to fetch budget data
    async function getBudget() {
        try {
            const response = await $http.get("/services/ts/codbex-jason/api/BudgetService.ts/budgetData");
            $scope.BudgetData = response.data; // Store budget data in scope
        } catch (error) {
            console.error('Error fetching budget data:', error);
        }
    }

    // Function to fetch all tasks data
    async function getTasks() {
        const tasksServiceUrl = "/services/ts/codbex-jason/api/TaskService.ts/taskData";
        try {
            const response = await $http.get(tasksServiceUrl);
            $scope.tasks = response.data.tasks; // Store all tasks in scope
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    }

    function filterTodayTasks() {
        if ($scope.tasks) {
            $scope.todayTasks = $scope.tasks.filter(task => {
                const startDate = new Date(task.StartDate);
                const endDate = new Date(task.EndDate);
                const isNotDone = task.StatusType !== 1; // 1 means "done"
                const isTodayInRange = $scope.today >= startDate && $scope.today <= endDate;
                return isNotDone && isTodayInRange;
            });
        }
    }

    async function getMilestones() {
        const tasksServiceUrl = "/services/ts/codbex-jason/api/MilestoneService.ts/milestoneData";
        try {
            const response = await $http.get(tasksServiceUrl);
            $scope.tasks = response.data.tasks; // Store all tasks in scope
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    }

    $scope.openPerspective = function (perspective) {
        if (perspective === 'all-tasks') {
            messageHub.postMessage('launchpad.switch.perspective', { perspectiveId: 'deliverables' }, true);
        }
        ;
    }

}]);
