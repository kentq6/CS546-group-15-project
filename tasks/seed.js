import { dbConnection, closeConnection } from '../config/mongoConnection.js';
import { companyData, userData, projectData, taskData, blueprintData, reportData } from '../data/index.js';
import issueData from '../data/issues.js';
const db = await dbConnection();
await db.dropDatabase();

try {
    // Step 1: Create a Company
    const company1 = await companyData.createCompany(
        'Liverpool LLC',
        null, // Owner will be added later
        'Liverpool, England',
        'Commercial',
        [], // Members will be added later
        [] // Projects will be added later
    );
    console.log('Company1 created:', company1);

    // Ensure company1._id exists and is a string
    if (!company1._id) throw 'Error: Company creation failed, no _id returned!';
    const companyId = company1._id.toString();
    console.log('Company1 ID:', companyId);

    // Step 2: Create Users (Owner and Employees)
    const owner1 = await userData.createUser('Ryan Gravenberch', 'alpha12', 'Passw0rd!', 'Owner', [], companyId);
    console.log('Owner1 created with ID:', owner1._id.toString());

    const employee1 = await userData.createUser('Wataru Endo', 'delta45', 'Hello123!', 'Field Engineer', [], companyId);
    console.log('Employee1 created with ID:', employee1._id.toString());

    const employee2 = await userData.createUser('Cody Gakpo', 'echo678', 'testTEST?', 'Project Manager', [], companyId);
    console.log('Employee2 created with ID:', employee2._id.toString());

    // Step 3: Update Company with Owner and Members
    console.log('Updating company with owner and members...');
    const updatedCompany = await companyData.updateCompanyPatch(company1._id.toString(), {
        ownerId: owner1._id.toString(),
        members: [employee1._id.toString(), employee2._id.toString()],
    });
    console.log('Company updated with Owner and Members:', updatedCompany);

    // Step 4: Create a Project
    const project1 = await projectData.createProject(
        'Build House',
        'Design, purchase materials, and build house according to plans.',
        500000,
        'In Progress',
        [employee1._id.toString(), employee2._id.toString()], // Members
        [], // Tasks will be added later
        [], // Blueprints will be added later
        [], // Reports will be added later
        companyId
    );
    console.log('Project1 created with ID:', project1._id.toString());

    // Step 5: Update Users with Project IDs
    await userData.updateUserPatch(employee1._id.toString(), { projects: [project1._id.toString()] });
    await userData.updateUserPatch(employee2._id.toString(), { projects: [project1._id.toString()] });

    // Step 6: Create Tasks
    const task1 = await taskData.createTask(
        project1._id.toString(),
        'Field Maintenance',
        'Bad patches need to be resoded and the entire field needs to be watered.',
        10000,
        'Pending',
        employee1._id.toString()
    );
    console.log('Task1 created with ID:', task1._id.toString());

    // Step 7: Create Blueprints
    const blueprint1 = await blueprintData.createBlueprint(
        project1._id.toString(),
        'Fix Bad Patches',
        'oldPitch.png',
        ['Fix', 'Easy'],
        employee1._id.toString()
    );
    console.log('Blueprint1 created with ID:', blueprint1._id.toString());

    // Step 8: Create Reports
    const report1 = await reportData.createReport(
        project1._id.toString(),
        'Field Is Patchy',
        'Players are tripping over uneven patches of field.',
        'oldPitch.png',
        ['Failed'],
        employee2._id.toString()
    );
    console.log('Report1 created with ID:', report1._id.toString());

    // Step 9: Create Issues
    const issue1 = await issueData.createIssue(
        report1._id.toString(),
        'Safety Concern',
        'Causing injuries.',
        'Unresolved',
        owner1._id.toString()
    );
    console.log('Issue1 created with ID:', issue1._id.toString());

    console.log('Database seeding completed successfully!');
} catch (e) {
    console.error('Error seeding database:', e);
} finally {
    await closeConnection();
}
