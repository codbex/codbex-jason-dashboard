import { DeliverableRepository as DeliverableDao } from "codbex-projects/gen/codbex-projects/dao/Deliverable/DeliverableRepository";
import { Controller, Get } from "sdk/http";
import { query } from "sdk/db";

@Controller
class DeliverableService {
    private readonly deliverableDao;

    constructor() {
        this.deliverableDao = new DeliverableDao();
    }

    @Get("/deliverableData")
    public deliverableData() {
        const sqlDeliverable = `
            SELECT
                t."DELIVERABLE_ID" AS "Id",
                t."DELIVERABLE_NAME" AS "Name",
                t."DELIVERABLE_DESCRIPTION" AS "Description",
                t."DELIVERABLE_PROJECT" AS "ProjectId",
                t."DELIVERABLE_COSTESTIMATION" AS "CostEstimation",
                t."DELIVERABLE_ACTUALCOST" AS "ActualCost",
                t."DELIVERABLE_STATUS" AS "Status"
            FROM
                "CODBEX_DELIVERABLE" t
            ORDER BY
                t."DELIVERABLE_PROJECT" ASC
        `;

        let resultset = query.execute(sqlDeliverable);

        const deliverableData = resultset.map(deliverable => ({
            "Id": deliverable.Id,
            "Name": deliverable.Name,
            "Description": deliverable.Description,
            "ProjectId": deliverable.ProjectId,
            "CostEstimation": deliverable.CostEstimation,
            "ActualCost": deliverable.ActualCost,
            "Status": deliverable.Status,
        }));

        return {
            "deliverables": deliverableData
        };
    }
}
