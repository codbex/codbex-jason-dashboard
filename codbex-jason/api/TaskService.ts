import { TaskRepository as TaskDao } from "codbex-projects/gen/codbex-projects/dao/Deliverable/TaskRepository";
import { Controller, Get } from "sdk/http";
import { query } from "sdk/db";

@Controller
class TaskService {
    private readonly taskDao;

    constructor() {
        this.taskDao = new TaskDao();
    }

    @Get("/taskData")
    public taskData() {
        const sqlTasks = `
            SELECT
                t."TASK_ID" AS "Id",
                t."TASK_NAME" AS "Name",
                t."TASK_DESCRIPTION" AS "Description",
                t."TASK_STARTDATE" AS "StartDate",
                t."TASK_ENDDATE" AS "EndDate",
                t."TASK_STATUS" AS "Status",
                t."TASK_DELIVERABLE" AS "Deliverable"
            FROM
                "CODBEX_TASK" t
            ORDER BY
                t."TASK_DELIVERABLE" ASC
        `;

        let resultset = query.execute(sqlTasks);

        const taskData = resultset.map(task => ({
            "Id": task.Id,
            "Name": task.Name,
            "Description": task.Description,
            "StartDate": task.StartDate,
            "EndDate": task.EndDate,
            "Status": task.Status,
            "Deliverable": task.Deliverable
        }));

        return {
            "tasks": taskData
        };
    }
}
