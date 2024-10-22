const dashboard = angular.module('dashboard', ['ideUI', 'ideView']);

dashboard.controller('DashboardController', ['$scope', '$document', '$http', 'messageHub', function ($scope, $document, $http, messageHub) {
    $scope.state = {
        isBusy: true,
        error: false,
        busyText: "Loading...",
    };

    // Current date
    let doughnutCharts = {};

    $scope.today = new Date();
    $scope.todayTasks = [];
    $scope.milestones = [];
    $scope.highestExpense = 0;
    $scope.expenseRatios = { approved: 0, pending: 0, declined: 0 }; // Ratios for expense types

    $scope.projects = [];
    $scope.selectedProject = null;
    $scope.deliverables = [];
    $scope.filteredDeliverables = [];
    $scope.selectedDeliverable = null;
    $scope.filteredTasks = [];

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
        await getProjects(); // Fetch projects
        await getTasks();
        await getDeliverables();
        await getMilestones();
        await getExpense();
        filterTodayTasks();
        setupDoughnutCharts();

        $scope.$apply(function () {
            $scope.state.isBusy = false;
        });
    });

    function setupDoughnutCharts() {
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

        const successDataDoughnut = {
            labels: ["Success rate", "Not to success"],
            datasets: [{
                data: [
                    $scope.successRate,
                    100 - $scope.successRate
                ],
                backgroundColor: ['#36a2eb', '#ff6384']
            }]
        };
        setupDoughnutChart('doughnutChartSuccess', successDataDoughnut);
    }

    function setupDoughnutChart(chartElementId, data) {
        if (doughnutCharts[chartElementId]) {
            doughnutCharts[chartElementId].destroy();
        }

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
        doughnutCharts[chartElementId] = new Chart(doughnutChartCtx, {
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

    async function getProjects() {
        try {
            const response = await $http.get("/services/ts/codbex-jason/api/ProjectService.ts/projectData");
            $scope.projects = response.data.projects || []; // Ensure projects is an array
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    }

    async function getTasks() {
        try {
            const response = await $http.get("/services/ts/codbex-jason/api/TaskService.ts/taskData");
            $scope.tasks = response.data.tasks;

            // Update deliverables based on fetched tasks
            const deliverableSet = new Set($scope.tasks.map(task => task.Deliverable));
            $scope.deliverables = Array.from(deliverableSet);

            // Filter tasks for selected deliverable
            $scope.filterTasksByDeliverable($scope.selectedDeliverable);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    }

    async function getDeliverables() {
        try {
            const response = await $http.get("/services/ts/codbex-jason/api/DeliverableService.ts/deliverableData");
            if (response.data && Array.isArray(response.data.deliverables)) {
                $scope.deliverables = response.data.deliverables;

                // Filter deliverables by the selected project
                $scope.filterDeliverableByProject($scope.selectedProject);
            } else {
                console.error('Deliverables data is not in the expected format:', response.data);
                $scope.deliverables = [];
            }
        } catch (error) {
            console.error('Error fetching deliverables:', error);
        }
    }

    $scope.filterDeliverableByProject = function (selectedProject) {
        $scope.selectedProject = selectedProject; // Set selected project

        if (selectedProject) {
            $scope.filteredDeliverables = $scope.deliverables.filter(deliverable => deliverable.ProjectId === selectedProject.Id);
            $scope.filterTasksByDeliverable($scope.filteredDeliverables);
        } else {
            $scope.filteredDeliverables = $scope.deliverables;
            $scope.filterTasksByDeliverable(null); // Reset tasks
        }
    };

    // Filter tasks by selected deliverable
    $scope.filterTasksByDeliverable = function (selectedDeliverable) {
        $scope.selectedDeliverable = selectedDeliverable; // Set selected deliverable

        if (selectedDeliverable) {
            // Check if selectedDeliverable is an array (list of deliverables)
            if (Array.isArray(selectedDeliverable)) {
                // If it's an array, filter tasks based on each deliverable's Id
                $scope.filteredTasks = $scope.tasks.filter(task =>
                    selectedDeliverable.some(deliverable => task.Deliverable === deliverable.Id)
                );
            } else {
                // If it's a single deliverable object, filter by its Id
                $scope.filteredTasks = $scope.tasks.filter(task => task.Deliverable === selectedDeliverable.Id);
            }
        } else {
            // If no deliverable is selected, show all tasks
            $scope.filteredTasks = $scope.tasks;
        }

        // Re-categorize tasks and calculate success rate
        categorizeAndCalculateSuccessRate($scope.filteredTasks, selectedDeliverable);
    };


    function categorizeAndCalculateSuccessRate(tasks, selectedDeliverable) {
        $scope.taskCategories.Done = [];
        $scope.taskCategories.InProgress = [];
        $scope.taskCategories.DevelopingFeature = [];
        $scope.taskCategories.Deprecated = [];
        $scope.taskCategories.Research = [];

        let totalTasks = 0;
        let doneTasks = 0;

        tasks.forEach(task => {
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

        // Calculate success rate for the selected deliverable
        if (totalTasks > 0) {
            $scope.successRate = (doneTasks / totalTasks) * 100;
        } else {
            $scope.successRate = 0;  // No tasks
        }

        console.log("Success Rate for Deliverable:", selectedDeliverable, $scope.successRate + "%");

        const successDataDoughnut = {
            labels: ["Success rate", "Not to success"],
            datasets: [{
                data: [
                    $scope.successRate,
                    100 - $scope.successRate
                ],
                backgroundColor: ['#36a2eb', '#ff6384']
            }]
        };
        setupDoughnutChart('doughnutChartSuccess', successDataDoughnut);
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
                const highestExpenseObj = $scope.ExpenseData.Expenses
                    .filter(expense => expense.ApprovalStatus === 2) // Filter for approved expenses
                    .reduce((prev, current) => (prev.Amount > current.Amount) ? prev : current); // Find the one with the highest amount

                // Set the highest expense and its date
                $scope.highestExpense = highestExpenseObj.Amount;
                $scope.highestExpenseDate = new Date(highestExpenseObj.Date).toISOString().split('T')[0];
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
