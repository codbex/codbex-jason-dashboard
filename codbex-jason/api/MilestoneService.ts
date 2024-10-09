import { MilestoneRepository as MilestoneDao } from "codbex-projects/gen/codbex-projects/dao/Project/MilestoneRepository";
import { Controller, Get } from "sdk/http";
import { query } from "sdk/db";

@Controller
class BudgetService {
    private readonly milestoneDao;

    constructor() {
        this.milestoneDao = new MilestoneDao();
    }

    @Get("/milestoneData")
    public async milestoneData() {
        // Query to fetch milestone tasks from MilestoneRepository
        const milestoneTasks = `
            SELECT
                m."MILESTONEPERIOD_ID" AS "Id",
                m."MILESTONEPERIOD_NAME" AS "Name",
                m."MILESTONEPERIOD_DESCRIPTION" AS "Description",
                m."MILESTONEPERIOD_RANGE" AS "Due",
                m."MILESTONEPERIOD_STATUSTYPE" AS "StatusType"
            FROM
                "CODBEX_MILESTONEPERIOD" m
        `;

        // Execute the query to get the milestone data
        let resultset = await query.execute(milestoneTasks);

        // Map the resultset into a usable format for the frontend
        const milestoneData = resultset.map(milestone => ({
            "Id": milestone.Id,
            "Name": milestone.Name,
            "Description": milestone.Description,
            "StartDate": milestone.Due,  // You can adjust based on your date structure
            "EndDate": milestone.Due,    // Assuming Due is a timestamp range; else calculate start & end dates
            "StatusType": milestone.StatusType
        }));

        // Return the formatted data as JSON
        return {
            "tasks": milestoneData
        };
    }
}
