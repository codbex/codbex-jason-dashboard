import { MilestoneDeliverableRepository as MilestoneDeliverableDao } from "codbex-projects/gen/codbex-projects/dao/Milestone/MilestoneDeliverableRepository";
import { Controller, Get } from "sdk/http";
import { query } from "sdk/db";

@Controller
class MilestoneDeliverableService {
    private readonly milestoneDeliverableDao;

    constructor() {
        this.milestoneDeliverableDao = new MilestoneDeliverableDao();
    }

    @Get("/milestoneDeliverableData")
    public milestoneDeliverableData() {
        const sqlMilestoneDeliverables = `
            SELECT
                md."MILESTONEDELIVERABLE_ID" AS "Id",
                md."MILESTONEDELIVERABLE_MILESTONE" AS "Milestone",
                md."MILESTONEDELIVERABLE_DESCRIPTION" AS "Description",
                md."MILESTONEDELIVERABLE_STARTDATE" AS "StartDate",
                md."MILESTONEDELIVERABLE_ENDDATE" AS "EndDate"
            FROM
                "CODBEX_MILESTONEDELIVERABLE" md
        `;

        let resultset = query.execute(sqlMilestoneDeliverables);

        const milestoneDeliverableData = resultset.map(milestoneDeliverable => ({
            "Id": milestoneDeliverable.Id,
            "Milestone": milestoneDeliverable.Milestone,
            "Description": milestoneDeliverable.Description,
            "StartDate": milestoneDeliverable.StartDate,
            "EndDate": milestoneDeliverable.EndDate
        }));

        return {
            "milestoneDeliverables": milestoneDeliverableData
        };
    }
}

export default MilestoneDeliverableService;
