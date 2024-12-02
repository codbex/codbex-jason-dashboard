import { MilestoneRepository as MilestoneDao } from "codbex-projects/gen/codbex-projects/dao/Milestone/MilestoneRepository";
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
                m."MILESTONEPERIOD_PROJECT" AS "Project",
                m."MILESTONEPERIOD_DELIVERABLE" AS "Deliverable"
            FROM
                "CODBEX_MILESTONE" m
        `;

        let resultset = query.execute(sqlMilestones);

        const milestoneData = resultset.map(milestone => ({
            "Id": milestone.Id,
            "Name": milestone.Name,
            "Project": milestone.Project,
            "Deliverable": milestone.Deliverable
        }));

        return {
            "milestones": milestoneData
        };
    }
}
