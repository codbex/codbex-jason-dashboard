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
    $scope.highestExpense = 0;
    $scope.expenseRatios = { approved: 0, pending: 0, declined: 0 }; // Ratios for expense types

    $scope.taskCategories = {
        Done: [],
        InProgress: [],
        DevelopingFeature: [],
        Deprecated: [],
        Research: []
    };

    const statusTypeMapping = {
        1: 'Done',
        2: 'InProgress',
        3: 'DevelopingFeature',
        4: 'Deprecated',
        5: 'Research'
    };


    // Fetch Budget, Tasks, Milestones, and Expenses when document is ready
    angular.element($document[0]).ready(async function () {
        await getBudget();
        await getTasks();
        await getMilestones();
        await getExpense();
        filterTodayTasks();

        const budgetDataDoughnut = {
            labels: ["Initial Budget", "Cost Estimation"],
            datasets: [{
                data: [$scope.BudgetData.InitialBudget, $scope.BudgetData.CostEstimation],
                backgroundColor: ['#36a2eb', '#ff6384']
            }]
        };
        setupDoughnutChart('doughnutChartBudget', budgetDataDoughnut);

        const expenseDataDoughnut = {
            labels: ["Approved", "Pending", "Declined"],
            datasets: [{
                data: [$scope.expenseRatios.approved, $scope.expenseRatios.pending, $scope.expenseRatios.declined],
                backgroundColor: ['#36a2eb', '#ff6384', '#e5e463']
            }]
        };
        setupDoughnutChart('doughnutChartExpenses', expenseDataDoughnut);

        const taskDataDoughnut = {
            labels: ["Done", "InProgress", "DevelopingFeature", "Deprecated", "Research"],
            datasets: [{
                data: [
                    $scope.taskCategories.Done.length,
                    $scope.taskCategories.InProgress.length,
                    $scope.taskCategories.DevelopingFeature.length,
                    $scope.taskCategories.Deprecated.length,
                    $scope.taskCategories.Research.length
                ],
                backgroundColor: ['#36a2eb', '#ff6384', '#e5e463', '#ffcc00', '#66ff66']
            }]
        };
        setupDoughnutChart('doughnutChartTasks', taskDataDoughnut);

        const sucessDataDoughnut = {
            labels: ["Success rate", "Not to success"],
            datasets: [{
                data: [
                    $scope.successRate,
                    100 - $scope.successRate
                ],
                backgroundColor: ['#36a2eb', '#ff6384']
            }]
        };
        setupDoughnutChart('doughnutChartSuccess', sucessDataDoughnut);

        $scope.$apply(function () {
            $scope.state.isBusy = false;
        });
    });

    function setupDoughnutChart(chartElementId, data) {
        const doughnutData = data;

        const doughnutOptions = {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                position: 'bottom'
            },
            title: {
                display: true,
                text: 'Diagram'
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        };

        const doughnutChartCtx = $document[0].getElementById(chartElementId).getContext('2d');
        new Chart(doughnutChartCtx, {
            type: 'doughnut',
            data: doughnutData,
            options: doughnutOptions
        });
    }

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

            let totalTasks = 0;
            let doneTasks = 0;

            $scope.tasks.forEach(task => {
                switch (task.StatusType) {
                    case 1:
                        $scope.taskCategories.Done.push(task);
                        doneTasks += 1;
                        totalTasks += 1;
                        break;
                    case 2:
                        $scope.taskCategories.InProgress.push(task);
                        totalTasks += 1;
                        break;
                    case 3:
                        $scope.taskCategories.DevelopingFeature.push(task);
                        totalTasks += 1;
                        break;
                    case 4:
                        $scope.taskCategories.Deprecated.push(task);
                        break;
                    case 5:
                        $scope.taskCategories.Research.push(task);
                        totalTasks += 1;
                        break;
                }
            });

            // Calculate success rate
            if (totalTasks > 0) {
                $scope.successRate = (doneTasks / totalTasks) * 100;
            } else {
                $scope.successRate = 0; // No tasks
            }

            console.log("Success Rate:", $scope.successRate + "%");

        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    }


    async function getMilestones() {
        const milestoneServiceUrl = "/services/ts/codbex-jason/api/MilestoneService.ts/milestoneData";
        try {
            const response = await $http.get(milestoneServiceUrl);
            $scope.milestones = response.data.milestones;

            // Map the StatusType to a status string
            $scope.milestones.forEach(milestone => {
                milestone.statusText = statusTypeMapping[milestone.StatusType] || 'Unknown Status';
            });

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

    async function getExpense() {
        try {
            const response = await $http.get("/services/ts/codbex-jason/api/ExpenseService.ts/expenseData");
            $scope.ExpenseData = response.data;

            // Calculate highest expense amount
            if ($scope.ExpenseData.Expenses.length > 0) {
                $scope.highestExpense = Math.max(
                    ...$scope.ExpenseData.Expenses
                        .filter(expense => expense.ApprovalStatus === 2) // Filter for approved expenses
                        .map(expense => expense.Amount)
                );
                $scope.highestExpenseDate = Math.max(
                    ...$scope.ExpenseData.Expenses
                        .filter(expense => expense.ApprovalStatus === 2) // Filter for approved expenses
                        .map(expense => expense.Date)
                );
            }

            // Calculate expense ratios
            const totalExpenses = $scope.ExpenseData.Expenses.length;
            const approvedExpenses = $scope.ExpenseData.Expenses.filter(expense => expense.ApprovalStatus === 2).length;
            const pendingExpenses = $scope.ExpenseData.Expenses.filter(expense => expense.ApprovalStatus === 1).length;
            const declinedExpenses = $scope.ExpenseData.Expenses.filter(expense => expense.ApprovalStatus === 3).length;

            // Store ratios in $scope
            if (totalExpenses > 0) {
                $scope.expenseRatios.approved = approvedExpenses;
                $scope.expenseRatios.pending = pendingExpenses;
                $scope.expenseRatios.declined = declinedExpenses;
            } else {
                // If no expenses, set ratios to 0
                $scope.expenseRatios.approved = 0;
                $scope.expenseRatios.pending = 0;
                $scope.expenseRatios.declined = 0;
            }
        } catch (error) {
            console.error('Error fetching expense data:', error);
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
