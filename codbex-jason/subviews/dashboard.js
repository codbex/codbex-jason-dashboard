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
    $scope.notSuccessPercentage = 0;

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

    const expenseStatusMapping = {
        1: 'Pending',
        2: 'Approved',
        3: 'Declined'
    };


    // Fetch Budget, Tasks, Milestones, and Expenses when document is ready
    angular.element($document[0]).ready(async function () {
        await getBudget();
        await getProjects(); // Fetch projects
        await getTasks();

        await getDeliverables();
        // Filter deliverables by the selected project
        $scope.filterDeliverableByProject($scope.selectedProject);

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
                    $scope.notSuccessPercentage
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

            // Update each task with its deliverable and project name
            $scope.tasks.forEach(task => {
                // Find the deliverable for the task
                const deliverable = $scope.deliverables.find(del => del.Id === task.Deliverable);
                task.deliverableName = deliverable ? deliverable.Name : 'Unknown Deliverable';

                // Find the project associated with the deliverable
                const project = deliverable ? $scope.projects.find(proj => proj.Id === deliverable.ProjectId) : null;
                task.projectName = project ? project.Name : 'Unknown Project';
            });

            // Filter tasks for today
            filterTodayTasks();

        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    }


    async function getDeliverables() {
        try {
            const response = await $http.get("/services/ts/codbex-jason/api/DeliverableService.ts/deliverableData");
            if (response.data && Array.isArray(response.data.deliverables)) {
                $scope.deliverables = response.data.deliverables;
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
            $scope.filterTasksByDeliverable(null);
        } else {
            $scope.filteredDeliverables = $scope.deliverables;
            $scope.filterTasksByDeliverable(null); // Reset tasks
        }
    };

    // Filter tasks by selected deliverable
    $scope.filterTasksByDeliverable = function (selectedDeliverable) {
        if (selectedDeliverable) {
            $scope.selectedProject = $scope.projects.find(project => project.Id === selectedDeliverable.ProjectId);
            $scope.filteredDeliverables = $scope.deliverables.filter(deliverable => deliverable.ProjectId === $scope.selectedProject.Id);
            $scope.selectedDeliverable = selectedDeliverable;
        } else if ($scope.selectedProject) {
            $scope.selectedDeliverable = $scope.deliverables.filter(deliverable => deliverable.ProjectId === $scope.selectedProject.Id);
        } else {
            $scope.selectedDeliverable = null;
        }

        if ($scope.selectedDeliverable) {
            // Check if selectedDeliverable is an array (list of deliverables)
            if (Array.isArray($scope.selectedDeliverable)) {
                $scope.filteredTasks = $scope.tasks.filter(task =>
                    $scope.selectedDeliverable.some(deliverable => task.Deliverable === deliverable.Id)
                );
            } else {
                $scope.filteredTasks = $scope.tasks.filter(task => task.Deliverable === $scope.selectedDeliverable.Id);
            }
        } else {
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
            switch (task.Status) {
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
            $scope.notSuccessPercentage = 100 - $scope.successRate;
        } else {
            $scope.successRate = 0;  // No tasks
            $scope.notSuccessPercentage = 0;
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
                milestone.statusText = statusTypeMapping[milestone.Status] || 'Unknown Status';
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
                const isNotDone = task.Status !== 1;
                const isTodayInRange = $scope.today >= startDate && $scope.today <= endDate;
                return isNotDone && isTodayInRange;
            });
        }
    }

    async function getExpense() {
        try {
            const response = await $http.get("/services/ts/codbex-jason/api/ExpenseService.ts/expenseData");
            $scope.ExpenseData = response.data;

            // Calculate highest expense amount for approved expenses
            const approvedExpenses = $scope.ExpenseData.Expenses.filter(expense => expense.Status === 2);
            if (approvedExpenses.length > 0) {
                const highestExpenseObj = approvedExpenses.reduce((prev, current) =>
                    (prev.Amount > current.Amount) ? prev : current
                );
                $scope.highestExpense = highestExpenseObj.Amount;
                $scope.highestExpenseDate = new Date(highestExpenseObj.Date).toISOString().split('T')[0];
            }

            // Calculate expense status counts and map status text and project name
            const statusCounts = $scope.ExpenseData.Expenses.reduce((acc, expense) => {
                // Map status text based on expenseStatusMapping
                expense.statusText = expenseStatusMapping[expense.Status] || 'Unknown Status';

                const project = $scope.projects.find(proj => proj.Id === expense.Project);
                expense.projectName = project ? project.Name : 'Unknown Project';


                // Count each status
                acc[expense.Status] = (acc[expense.Status] || 0) + 1;
                return acc;
            }, {});

            // Calculate total expense ratios
            const totalExpenses = $scope.ExpenseData.Expenses.length;
            $scope.expenseRatios = {
                approved: statusCounts[2] || 0,
                pending: statusCounts[1] || 0,
                declined: statusCounts[3] || 0
            };

            console.log($scope.ExpenseData);

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
