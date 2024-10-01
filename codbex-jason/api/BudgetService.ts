import { BudgetRepository as BudgetDao } from "codbex-projects/gen/codbex-projects/dao/Project/BudgetRepository";

import { Controller, Get } from "sdk/http";
import { query } from "sdk/db";
import { response } from "sdk/http";

@Controller
class BudgetService {
    private readonly budgetDao;

    constructor() {
        this.budgetDao = new BudgetDao();
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
