import { dbConnection, closeConnection } from '../config/mongoConnection.js';
import { companyData, userData, projectData, taskData, blueprintData, reportData } from '../data/index.js';
import issueData from '../data/issues.js';
const db = await dbConnection();
await db.dropDatabase();

try {
    console.log("Starting database seeding with test data...");
    
    // Create multiple companies
    const company1 = await companyData.createCompany(
        'Liverpool Construction LLC',
        null,
        'Liverpool, England',
        'Commercial',
        [],
        []
    );
    console.log('Company1 created:', company1._id.toString());
    
    const company2 = await companyData.createCompany(
        'Manchester Builders Co',
        null,
        'Manchester, England',
        'Residential',
        [],
        []
    );
    console.log('Company2 created:', company2._id.toString());
    
    const company3 = await companyData.createCompany(
        'London Bridge Engineering',
        null,
        'London, England',
        'Infrastructure',
        [],
        []
    );
    console.log('Company3 created:', company3._id.toString());
    
    // Create users with different roles for each company
    // Company 1 users
    const owner1 = await userData.createUser('john_owner', 'Password123!', 'Owner', [], company1._id.toString());
    const pm1 = await userData.createUser('emily_pm', 'Manager456!', 'Project Manager', [], company1._id.toString());
    const engineer1 = await userData.createUser('mike_eng', 'Engineer789!', 'Field Engineer', [], company1._id.toString());
    const engineer2 = await userData.createUser('sarah_eng', 'Field123!', 'Field Engineer', [], company1._id.toString());
    
    // Company 2 users
    const owner2 = await userData.createUser('david_owner', 'Owner789!', 'Owner', [], company2._id.toString());
    const pm2 = await userData.createUser('lisa_pm', 'Project456!', 'Project Manager', [], company2._id.toString());
    const engineer3 = await userData.createUser('robert_eng', 'Field789!', 'Field Engineer', [], company2._id.toString());
    
    // Company 3 users
    const owner3 = await userData.createUser('james_owner', 'Bridge123!', 'Owner', [], company3._id.toString());
    const pm3 = await userData.createUser('karen_pm', 'London456!', 'Project Manager', [], company3._id.toString());
    
    console.log("All users created successfully");
    
    // Update companies with owners and members
    await companyData.updateCompanyPatch(company1._id.toString(), {
        ownerId: owner1._id.toString(),
        members: [pm1._id.toString(), engineer1._id.toString(), engineer2._id.toString()]
    });
    
    await companyData.updateCompanyPatch(company2._id.toString(), {
        ownerId: owner2._id.toString(),
        members: [pm2._id.toString(), engineer3._id.toString()]
    });
    
    await companyData.updateCompanyPatch(company3._id.toString(), {
        ownerId: owner3._id.toString(),
        members: [pm3._id.toString()]
    });
    
    console.log("Companies updated with owners and members");
    
    // Create projects for each company
    // Company 1 projects
    const project1 = await projectData.createProject(
        'Liverpool Stadium Renovation',
        'Renovate the existing stadium with new seating and facilities.',
        2500000,
        'In Progress',
        [pm1._id.toString(), engineer1._id.toString(), engineer2._id.toString()],
        [], [], [],
        company1._id.toString()
    );
    
    const project2 = await projectData.createProject(
        'Commercial Office Complex',
        'Build a new 10-story commercial office building in downtown Liverpool.',
        4000000,
        'Pending',
        [pm1._id.toString(), engineer1._id.toString()],
        [], [], [],
        company1._id.toString()
    );
    
    // Company 2 projects
    const project3 = await projectData.createProject(
        'Residential Housing Development',
        'Construct 50 new affordable housing units in Manchester suburbs.',
        7500000,
        'In Progress',
        [pm2._id.toString(), engineer3._id.toString()],
        [], [], [],
        company2._id.toString()
    );
    
    // Company 3 projects
    const project4 = await projectData.createProject(
        'Thames Bridge Repair',
        'Structural repairs and maintenance to existing bridge infrastructure.',
        1200000,
        'Completed',
        [pm3._id.toString()],
        [], [], [],
        company3._id.toString()
    );
    
    const project5 = await projectData.createProject(
        'Underground Tunnel Extension',
        'Extend the existing underground tunnel network by 2 kilometers.',
        5600000,
        'In Progress',
        [pm3._id.toString()],
        [], [], [],
        company3._id.toString()
    );
    
    console.log("Projects created successfully");
    
    // Update users with project assignments
    await userData.updateUserPatch(pm1._id.toString(), { projects: [project1._id.toString(), project2._id.toString()] });
    await userData.updateUserPatch(engineer1._id.toString(), { projects: [project1._id.toString(), project2._id.toString()] });
    await userData.updateUserPatch(engineer2._id.toString(), { projects: [project1._id.toString()] });
    
    await userData.updateUserPatch(pm2._id.toString(), { projects: [project3._id.toString()] });
    await userData.updateUserPatch(engineer3._id.toString(), { projects: [project3._id.toString()] });
    
    await userData.updateUserPatch(pm3._id.toString(), { projects: [project4._id.toString(), project5._id.toString()] });
    
    console.log("Users updated with project assignments");
    
    // Create tasks for projects
    // Project 1 tasks
    const task1_1 = await taskData.createTask(
        project1._id.toString(),
        'Demolish old seating',
        'Remove all existing seating structures safely.',
        150000,
        'Completed',
        engineer1._id.toString()
    );
    
    const task1_2 = await taskData.createTask(
        project1._id.toString(),
        'Install new seating framework',
        'Set up structural framework for new seating arrangements.',
        350000,
        'In Progress',
        engineer2._id.toString()
    );
    
    const task1_3 = await taskData.createTask(
        project1._id.toString(),
        'Electrical wiring installation',
        'Install new electrical systems throughout the stadium.',
        275000,
        'Pending',
        engineer1._id.toString()
    );
    
    // Project 2 tasks
    const task2_1 = await taskData.createTask(
        project2._id.toString(),
        'Foundation excavation',
        'Excavate and prepare the foundation area.',
        500000,
        'Pending',
        engineer1._id.toString()
    );
    
    // Project 3 tasks
    const task3_1 = await taskData.createTask(
        project3._id.toString(),
        'Land clearing',
        'Clear the development area of existing structures and vegetation.',
        200000,
        'Completed',
        engineer3._id.toString()
    );
    
    const task3_2 = await taskData.createTask(
        project3._id.toString(),
        'Road infrastructure',
        'Develop internal roads and connect to existing infrastructure.',
        450000,
        'In Progress',
        engineer3._id.toString()
    );
    
    // Project 4 tasks
    const task4_1 = await taskData.createTask(
        project4._id.toString(),
        'Structural assessment',
        'Assess the structural integrity of the bridge.',
        75000,
        'Completed',
        pm3._id.toString()
    );
    
    const task4_2 = await taskData.createTask(
        project4._id.toString(),
        'Concrete repair',
        'Repair damaged concrete sections of the bridge.',
        320000,
        'Completed',
        pm3._id.toString()
    );
    
    // Project 5 tasks
    const task5_1 = await taskData.createTask(
        project5._id.toString(),
        'Tunnel boring',
        'Operate boring machines to extend tunnel.',
        1500000,
        'In Progress',
        pm3._id.toString()
    );
    
    console.log("Tasks created successfully");
    
    // Create blueprints for projects
    const blueprint1_1 = await blueprintData.createBlueprint(
        project1._id.toString(),
        'Stadium Seating Layout',
        'stadium_seating.pdf',
        ['Seating', 'Layout', 'Stadium'],
        pm1._id.toString()
    );
    
    const blueprint1_2 = await blueprintData.createBlueprint(
        project1._id.toString(),
        'Electrical Systems Diagram',
        'electrical_layout.pdf',
        ['Electrical', 'Systems', 'Wiring'],
        engineer1._id.toString()
    );
    
    const blueprint2_1 = await blueprintData.createBlueprint(
        project2._id.toString(),
        'Office Building Floor Plans',
        'floor_plans.pdf',
        ['Commercial', 'Office', 'Floor Plan'],
        pm1._id.toString()
    );
    
    const blueprint3_1 = await blueprintData.createBlueprint(
        project3._id.toString(),
        'Housing Development Master Plan',
        'master_plan.pdf',
        ['Residential', 'Housing', 'Master Plan'],
        pm2._id.toString()
    );
    
    const blueprint4_1 = await blueprintData.createBlueprint(
        project4._id.toString(),
        'Bridge Repair Specifications',
        'bridge_repairs.pdf',
        ['Bridge', 'Repair', 'Structural'],
        pm3._id.toString()
    );
    
    console.log("Blueprints created successfully");
    
    // Create reports for projects
    const report1_1 = await reportData.createReport(
        project1._id.toString(),
        'Stadium Demolition Progress',
        'Summary of progress on demolition phase of stadium renovation.',
        'demo_progress.pdf',
        ['Progress', 'Demolition'],
        pm1._id.toString()
    );
    
    const report1_2 = await reportData.createReport(
        project1._id.toString(),
        'Safety Inspection Results',
        'Results of the monthly safety inspection for the stadium renovation project.',
        'safety_report.pdf',
        ['Safety', 'Inspection'],
        engineer2._id.toString()
    );
    
    const report3_1 = await reportData.createReport(
        project3._id.toString(),
        'Environmental Impact Assessment',
        'Assessment of the environmental impact of the housing development.',
        'environmental_impact.pdf',
        ['Environmental', 'Assessment'],
        engineer3._id.toString()
    );
    
    const report4_1 = await reportData.createReport(
        project4._id.toString(),
        'Final Completion Report',
        'Final report documenting the completed bridge repair project.',
        'completion_report.pdf',
        ['Final', 'Completion'],
        pm3._id.toString()
    );
    
    console.log("Reports created successfully");
    
    // Create issues for reports
    const issue1_1 = await issueData.createIssue(
        report1_1._id.toString(),
        'Delayed Demolition Schedule',
        'Demolition is behind schedule by 2 weeks due to unexpected asbestos discovery.',
        'Unresolved',
        pm1._id.toString()
    );
    
    const issue1_2 = await issueData.createIssue(
        report1_2._id.toString(),
        'Missing Safety Equipment',
        'Some workers were observed without proper safety harnesses.',
        'Resolved',
        engineer2._id.toString()
    );
    
    const issue3_1 = await issueData.createIssue(
        report3_1._id.toString(),
        'Protected Species Habitat',
        'A protected species habitat was discovered on the north corner of the development site.',
        'Unresolved',
        pm2._id.toString()
    );
    
    console.log("Issues created successfully");
    
    // Final success message
    console.log("Database successfully seeded with test data!");
    
} catch (e) {
    console.error('Error seeding database:', e);
} finally {
    await closeConnection();
}