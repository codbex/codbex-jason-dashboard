const dashboard = angular.module('dashboard', ['ideUI', 'ideView']);

dashboard.controller('DashboardController', ['$scope', '$document', '$http', 'messageHub', function ($scope, $document, $http, messageHub) {
    $scope.state = {
        isBusy: true,
        error: false,
        busyText: "Loading...",
    };

    // When the document is ready, fetch budget data
    angular.element($document[0]).ready(async function () {
        const budgetData = await getBudget();
        if (budgetData) {
            // Doughnut Chart Data
            const doughnutData = {
                labels: ['Initial Budget', 'Cost Estimation'],
                datasets: [{
                    data: [budgetData.InitialBudget, budgetData.CostEstimation],
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
            const doughnutChart = new Chart(doughnutChartCtx, {
                type: 'doughnut',
                data: doughnutData,
                options: doughnutOptions
            });

            // Update state to indicate loading is complete
            $scope.$apply(function () {
                $scope.state.isBusy = false;
            });
        }
    });

    // Function to fetch budget data
    async function getBudget() {
        try {
            const response = await $http.get("/services/ts/codbex-jason/api/BudgetService.ts/budgetData");
            return response.data;
        } catch (error) {
            console.error('Error fetching budget data:', error);
            return null;
        }
    }

    async function getTasks() {
        try {
            const response = await $http.get("/services/ts/codbex-jason/api/BudgetService.ts/budgetData");
            return response.data;
        } catch (error) {
            console.error('Error fetching budget data:', error);
            return null;
        }
    }

    // Current date
    $scope.today = new Date();
}]);
