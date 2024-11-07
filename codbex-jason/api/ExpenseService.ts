import { ExpenseRepository as ExpenseDao } from "codbex-projects/gen/codbex-projects/dao/Project/ExpenseRepository";
import { Controller, Get } from "sdk/http";
import { query } from "sdk/db";

@Controller
class BudgetService {
    private readonly expenseDao;

    constructor() {
        this.expenseDao = new ExpenseDao();
    }

    @Get("/expenseData")
    public expenseData() {
        const sqlExpense = `
        SELECT
            e."EXPENSE_AMOUNT" AS "EXPENSE_AMOUNT",
            e."EXPENSE_DATE" AS "EXPENSE_DATE",
            e."EXPENSE_STATUS" AS "EXPENSE_STATUS"
        FROM
            "CODBEX_EXPENSE" e
        `;

        let resultset = query.execute(sqlExpense);

        // Map the result set to a response structure including approval status
        const expenses = resultset.map(expense => ({
            "Amount": expense.EXPENSE_AMOUNT,
            "Date": expense.EXPENSE_DATE,
            "Status": expense.EXPENSE_STATUS
        }));

        // Return all expenses in the response
        return {
            "Expenses": expenses
        };
    }
}
