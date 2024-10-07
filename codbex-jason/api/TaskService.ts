import { TaskRepository as TaskDao } from "codbex-projects/gen/codbex-projects/dao/Project/TaskRepository";

import { Controller, Get } from "sdk/http";
import { query } from "sdk/db";
import { response } from "sdk/http";

@Controller
class BudgetService {
    private readonly taskDao;


    constructor() {
        this.taskDao = new TaskDao();
    }

    @Get("/budgetData")
    public budgetData() {
        const sqlBudget = `
            SELECT
                SUM(b."BUDGET_INITIALBUDGET") AS "INITIALBUDGET_SUM",
                SUM(b."BUDGET_COSTESTIMATION") AS "COSTESTIMATION_SUM"
            FROM
                "CODBEX_BUDGET" b
        `;

        let resultset = query.execute(sqlBudget);
        const budgetData = resultset[0];

        return {
            "InitialBudget": budgetData.INITIALBUDGET_SUM,
            "CostEstimation": budgetData.COSTESTIMATION_SUM
        };
    }

}
