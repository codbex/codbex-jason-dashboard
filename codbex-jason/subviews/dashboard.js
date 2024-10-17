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

    // Fetch Budget, Tasks, Milestones, and Expenses when document is ready
    angular.element($document[0]).ready(async function () {
        await getBudget();
        await getTasks();
        await getMilestones();
        await getExpense();
        filterTodayTasks();

        // Doughnut Chart Configuration
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
                text: 'Expense Status'
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
