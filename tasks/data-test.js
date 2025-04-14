import { dbConnection, closeConnection } from '../config/mongoConnection.js';
import { companyData, userData, projectData, taskData, blueprintData, reportData } from '../data/index.js';
import issueData from '../data/issues.js';
import { ObjectId } from 'mongodb';

// Helper function to print test results
const printTestResult = (testName, passed, result = null, error = null) => {
  if (passed) {
    console.log(`✅ PASSED: ${testName}`);
    if (result) console.log(`   Result: ${JSON.stringify(result, null, 2)}`);
  } else {
    console.log(`❌ FAILED: ${testName}`);
    if (error) console.log(`   Error: ${error}`);
  }
  console.log('-------------------------------------');
};

// Main testing function
const runTests = async () => {
  let db;
  
  try {
    // Connect to the database
    db = await dbConnection();
    await db.dropDatabase(); // Start with a clean database
    console.log('Connected to database and cleared previous data...');
    
    console.log('\n=== COMPANY DATA TESTS ===\n');
    
    // Test 1: Create a company (success case)
    let company1;
    try {
      company1 = await companyData.createCompany(
        'Test Company',
        null,
        'Test City, Test Country',
        'Testing',
        [],
        []
      );
      printTestResult('Create company (valid data)', true, {
        id: company1._id.toString(),
        title: company1.title
      });
    } catch (e) {
      printTestResult('Create company (valid data)', false, null, e);
    }
    
    // Test 2: Create a company with invalid data (failure case)
    try {
      await companyData.createCompany(
        '',  // Invalid title
        null,
        'Test City, Test Country',
        'Testing',
        [],
        []
      );
      printTestResult('Create company (invalid title)', false);
    } catch (e) {
      printTestResult('Create company (invalid title)', true, null, e);
    }
    
    // Test 3: Get a company by ID (success case)
    try {
      const retrievedCompany = await companyData.getCompanyById(company1._id.toString());
      const success = retrievedCompany._id.toString() === company1._id.toString();
      printTestResult('Get company by ID (existing ID)', success, {
        id: retrievedCompany._id.toString(),
        title: retrievedCompany.title
      });
    } catch (e) {
      printTestResult('Get company by ID (existing ID)', false, null, e);
    }
    
    // Test 4: Get a company by ID (failure case - non-existent ID)
    try {
      const fakeId = new ObjectId();
      await companyData.getCompanyById(fakeId.toString());
      printTestResult('Get company by ID (non-existent ID)', false);
    } catch (e) {
      printTestResult('Get company by ID (non-existent ID)', true, null, e);
    }
    
    // Test 5: Update a company (success case)
    try {
      const updatedCompany = await companyData.updateCompanyPatch(company1._id.toString(), {
        title: 'Updated Test Company',
        industry: 'Updated Industry'
      });
      const success = 
        updatedCompany.title === 'Updated Test Company' && 
        updatedCompany.industry === 'Updated Industry';
      printTestResult('Update company (valid data)', success, {
        title: updatedCompany.title,
        industry: updatedCompany.industry
      });
    } catch (e) {
      printTestResult('Update company (valid data)', false, null, e);
    }
    
    console.log('\n=== USER DATA TESTS ===\n');
    
    // Test 6: Create a user (success case)
    let user1;
    try {
      user1 = await userData.createUser(
        'testuser1',
        'Password123!',
        'Owner',
        [],
        company1._id.toString()
      );
      printTestResult('Create user (valid data)', true, {
        id: user1._id.toString(),
        username: user1.username
      });
    } catch (e) {
      printTestResult('Create user (valid data)', false, null, e);
    }
    
    // Test 7: Create a user with invalid data (failure case)
    try {
      await userData.createUser(
        'test', // Invalid username (too short)
        'Password123!',
        'Owner',
        [],
        company1._id.toString()
      );
      printTestResult('Create user (invalid username)', false);
    } catch (e) {
      printTestResult('Create user (invalid username)', true, null, e);
    }
    
    // Test 8: Update company with owner (success case)
    try {
      const updatedCompany = await companyData.updateCompanyPatch(company1._id.toString(), {
        ownerId: user1._id.toString()
      });
      const success = updatedCompany.ownerId === user1._id.toString();
      printTestResult('Update company with owner', success, {
        ownerId: updatedCompany.ownerId
      });
    } catch (e) {
      printTestResult('Update company with owner', false, null, e);
    }
    
    console.log('\n=== PROJECT DATA TESTS ===\n');
    
    // Test 9: Create a project (success case)
    let project1;
    try {
      project1 = await projectData.createProject(
        'Test Project',
        'This is a test project description',
        100000,
        'Pending',
        [user1._id.toString()],
        [],
        [],
        [],
        company1._id.toString()
      );
      printTestResult('Create project (valid data)', true, {
        id: project1._id.toString(),
        title: project1.title
      });
    } catch (e) {
      printTestResult('Create project (valid data)', false, null, e);
    }
    
    // Test 10: Create a project with invalid data (failure case)
    try {
      await projectData.createProject(
        'Test Project 2',
        'This is another test project description',
        -5000, // Invalid budget (negative)
        'Pending',
        [user1._id.toString()],
        [],
        [],
        [],
        company1._id.toString()
      );
      printTestResult('Create project (invalid budget)', false);
    } catch (e) {
      printTestResult('Create project (invalid budget)', true, null, e);
    }
    
    // Test 11: Update a project (success case)
    try {
      const updatedProject = await projectData.updateProjectPatch(project1._id.toString(), {
        status: 'In Progress',
        budget: 150000
      });
      const success = 
        updatedProject.status === 'In Progress' && 
        updatedProject.budget === 150000;
      printTestResult('Update project (valid data)', success, {
        status: updatedProject.status,
        budget: updatedProject.budget
      });
    } catch (e) {
      printTestResult('Update project (valid data)', false, null, e);
    }
    
    console.log('\n=== TASK DATA TESTS ===\n');
    
    // Test 12: Create a task (success case)
    let task1;
    try {
      task1 = await taskData.createTask(
        project1._id.toString(),
        'Test Task',
        'This is a test task description',
        50000,
        'Pending',
        user1._id.toString()
      );
      printTestResult('Create task (valid data)', true, {
        id: task1._id.toString(),
        title: task1.title
      });
    } catch (e) {
      printTestResult('Create task (valid data)', false, null, e);
    }
    
    // Test 13: Create a task with invalid data (failure case)
    try {
      await taskData.createTask(
        project1._id.toString(),
        '',  // Invalid title (empty)
        'This is another test task description',
        25000,
        'Pending',
        user1._id.toString()
      );
      printTestResult('Create task (invalid title)', false);
    } catch (e) {
      printTestResult('Create task (invalid title)', true, null, e);
    }
    
    // Test 14: Update a task (success case)
    try {
      const updatedTask = await taskData.updateTaskPatch(task1._id.toString(), {
        status: 'In Progress',
        cost: 55000
      });
      const success = 
        updatedTask.status === 'In Progress' && 
        updatedTask.cost === 55000;
      printTestResult('Update task (valid data)', success, {
        status: updatedTask.status,
        cost: updatedTask.cost
      });
    } catch (e) {
      printTestResult('Update task (valid data)', false, null, e);
    }
    
    console.log('\n=== BLUEPRINT DATA TESTS ===\n');
    
    // Test 15: Create a blueprint (success case)
    let blueprint1;
    try {
      blueprint1 = await blueprintData.createBlueprint(
        project1._id.toString(),
        'Test Blueprint',
        'test_blueprint.pdf',
        ['Testing', 'Blueprint'],
        user1._id.toString()
      );
      printTestResult('Create blueprint (valid data)', true, {
        id: blueprint1._id.toString(),
        title: blueprint1.title
      });
    } catch (e) {
      printTestResult('Create blueprint (valid data)', false, null, e);
    }
    
    // Test 16: Create a blueprint with invalid data (failure case)
    try {
      await blueprintData.createBlueprint(
        project1._id.toString(),
        'Test Blueprint 2',
        'invalid_file_extension.txt',  // Invalid file extension
        ['Testing', 'Blueprint'],
        user1._id.toString()
      );
      printTestResult('Create blueprint (invalid file URL)', false);
    } catch (e) {
      printTestResult('Create blueprint (invalid file URL)', true, null, e);
    }
    
    console.log('\n=== REPORT DATA TESTS ===\n');
    
    // Test 17: Create a report (success case)
    let report1;
    try {
      report1 = await reportData.createReport(
        project1._id.toString(),
        'Test Report',
        'This is a test report description',
        'test_report.pdf',
        ['Testing', 'Report'],
        user1._id.toString()
      );
      printTestResult('Create report (valid data)', true, {
        id: report1._id.toString(),
        title: report1.title
      });
    } catch (e) {
      printTestResult('Create report (valid data)', false, null, e);
    }
    
    // Test 18: Create a report with invalid data (failure case)
    try {
      await reportData.createReport(
        project1._id.toString(),
        'Test Report 2',
        'This is another test report description',
        'test_report.doc',  // Invalid file extension
        ['Testing', 'Report'],
        user1._id.toString()
      );
      printTestResult('Create report (invalid file URL)', false);
    } catch (e) {
      printTestResult('Create report (invalid file URL)', true, null, e);
    }
    
    console.log('\n=== ISSUE DATA TESTS ===\n');
    
    // Test 19: Create an issue (success case)
    let issue1;
    try {
      issue1 = await issueData.createIssue(
        report1._id.toString(),
        'Test Issue',
        'This is a test issue description',
        'Unresolved',
        user1._id.toString()
      );
      printTestResult('Create issue (valid data)', true, {
        id: issue1._id.toString(),
        title: issue1.title
      });
    } catch (e) {
      printTestResult('Create issue (valid data)', false, null, e);
    }
    
    // Test 20: Create an issue with invalid data (failure case)
    try {
      await issueData.createIssue(
        report1._id.toString(),
        'Test Issue 2',
        'This is another test issue description',
        'InProgress',  // Invalid status
        user1._id.toString()
      );
      printTestResult('Create issue (invalid status)', false);
    } catch (e) {
      printTestResult('Create issue (invalid status)', true, null, e);
    }
    
    // Test 21: Update an issue (success case)
    try {
      const updatedIssue = await issueData.updateIssuePatch(issue1._id.toString(), {
        status: 'Resolved',
        description: 'Updated test issue description'
      });
      const success = 
        updatedIssue.status === 'Resolved' && 
        updatedIssue.description === 'Updated test issue description';
      printTestResult('Update issue (valid data)', success, {
        status: updatedIssue.status,
        description: updatedIssue.description
      });
    } catch (e) {
      printTestResult('Update issue (valid data)', false, null, e);
    }
    
    // Test 22: Removal operations (success cases)
    try {
      // Remove issue
      const removedIssue = await issueData.removeIssue(issue1._id.toString());
      
      // Remove report
      const removedReport = await reportData.removeReport(report1._id.toString());
      
      // Remove blueprint
      const removedBlueprint = await blueprintData.removeBlueprint(
        project1._id.toString(), 
        blueprint1._id.toString()
      );
      
      // Remove task
      const removedTask = await taskData.removeTask(task1._id.toString());
      
      // Remove project
      const removedProject = await projectData.removeProject(project1._id.toString());
      
      // Remove user
      const removedUser = await userData.removeUser(user1._id.toString());
      
      // Remove company
      const removedCompany = await companyData.removeCompany(company1._id.toString());
      
      printTestResult('Remove operations (cascade)', true, {
        message: "All entities successfully removed"
      });
    } catch (e) {
      printTestResult('Remove operations (cascade)', false, null, e);
    }
    
    console.log('\n=== TEST SUMMARY ===\n');
    console.log('All data function tests completed.');
    
  } catch (e) {
    console.error('Test suite error:', e);
  } finally {
    await closeConnection();
    console.log('Database connection closed.');
  }
};

// Run the tests
runTests();