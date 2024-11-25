import { ProjectRepository as ProjectDao } from "codbex-projects/gen/codbex-projects/dao/Project/ProjectRepository";
import { Controller, Get } from "sdk/http";
import { query } from "sdk/db";

@Controller
class ProjectService {
    private readonly projectDao;

    constructor() {
        this.projectDao = new ProjectDao();
    }

    @Get("/projectData")
    public projectData() {
        const sqlProject = `
            SELECT
                p."PROJECT_ID" AS "Id",
                p."PROJECT_NAME" AS "Name",
                p."PROJECT_DESCRIPTION" AS "Description",
                p."PROJECT_STARTINGDATE" AS "StartingDate",
                p."PROJECT_ENDDATE" AS "EndDate",
                p."PROJECT_SPONSORNAME" AS "SponsorName",
                p."PROJECT_OPPORTUNITY" AS "Opportunity",
                p."PROJECT_SCOPE" AS "Scope",
                p."PROJECT_VERSION" AS "Version",
                p."PROJECT_NOTES" AS "Notes",
                p."PROJECT_AGILEMETHODOLOGY" AS "AgileMethodology",
                p."PROJECT_ITERATIONLENGHT" AS "IterationLenght",
                p."PROJECT_PLANNINGFREQUENCY" AS "PlanningFrequency",
                p."PROJECT_CUSTOMERINVOLVEMENTFREQUENCY" AS "CustomerInvolvementFrequency",
                p."PROJECT_RELEASECADENCE" AS "ReleaseCadence",
                p."PROJECT_RETROSPECTIVEFREQUENCY" AS "RetrospectiveFrequency",
                p."PROJECT_DAILYSTANDUP" AS "DailyStandup",
                p."PROJECT_BACKLOGREFINEMENTFREQUENCY" AS "BacklogRefinementFrequency",
                p."PROJECT_DEFECTMANAGEMENT" AS "DefectManagement",
                p."PROJECT_DEPLOYMENTFREQUENCY" AS "DeploymentFrequency",
                p."PROJECT_TESTINGINTEGRATION" AS "TestingIntegration",
                p."PROJECT_STAKEHOLDERREVIEW" AS "StakeholderReview",
                p."PROJECT_FEATURECOMPLETIONCRITERIA" AS "FeatureCompletionCriteria",
                p."PROJECT_DOCUMENTATIONUPDATES" AS "DocumentationUpdates",
                p."PROJECT_SUSTAINABLEVELOCITY" AS "SustainableVelocity"
            FROM
                "CODBEX_PROJECT" p
            ORDER BY
                p."PROJECT_STARTINGDATE" ASC
        `;

        let resultset = query.execute(sqlProject);

        const projectData = resultset.map(project => ({
            "Id": project.Id,
            "Name": project.Name,
            "Description": project.Description,
            "StartingDate": project.StartingDate,
            "EndDate": project.EndDate,
            "SponsorName": project.SponsorName,
            "Opportunity": project.Opportunity,
            "Scope": project.Scope,
            "Version": project.Version,
            "Notes": project.Notes,
            "AgileMethodology": project.AgileMethodology,
            "IterationLenght": project.IterationLenght,
            "PlanningFrequency": project.PlanningFrequency,
            "CustomerInvolvementFrequency": project.CustomerInvolvementFrequency,
            "ReleaseCadence": project.ReleaseCadence,
            "RetrospectiveFrequency": project.RetrospectiveFrequency,
            "DailyStandup": project.DailyStandup,
            "BacklogRefinementFrequency": project.BacklogRefinementFrequency,
            "DefectManagement": project.DefectManagement,
            "DeploymentFrequency": project.DeploymentFrequency,
            "TestingIntegration": project.TestingIntegration,
            "StakeholderReview": project.StakeholderReview,
            "FeatureCompletionCriteria": project.FeatureCompletionCriteria,
            "DocumentationUpdates": project.DocumentationUpdates,
            "SustainableVelocity": project.SustainableVelocity,
        }));

        const projectCount = projectData.length;

        return {
            "projects": projectData,
            "projectCount": projectCount
        };
    }
}
