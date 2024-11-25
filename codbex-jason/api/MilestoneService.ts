import { MilestoneRepository as MilestoneDao } from "codbex-projects/gen/codbex-projects/dao/Project/MilestoneRepository";
import { Controller, Get } from "sdk/http";
import { query } from "sdk/db";

@Controller
class MilestoneService {
    private readonly milestoneDao;

    constructor() {
        this.milestoneDao = new MilestoneDao();
    }

    @Get("/milestoneData")
    public milestoneData() {
        const sqlMilestones = `
            SELECT
                m."MILESTONEPERIOD_ID" AS "Id",
                m."MILESTONEPERIOD_NAME" AS "Name",
                m."MILESTONEPERIOD_DESCRIPTION" AS "Description",
                m."MILESTONEPERIOD_RANGE" AS "Range",
                m."MILESTONEPERIOD_STATUS" AS "Status"
            FROM
                "CODBEX_MILESTONEPERIOD" m
        `;

        let resultset = query.execute(sqlMilestones);

        const milestoneData = resultset.map(milestone => ({
            "Id": milestone.Id,
            "Name": milestone.Name,
            "Description": milestone.Description,
            "Range": milestone.Range,
            "Status": milestone.Status
        }));

        return {
            "milestones": milestoneData
        };
    }
}
