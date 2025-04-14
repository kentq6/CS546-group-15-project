import { connectToDb } from "../config/connection.js";
import mongoose from 'mongoose'
import { User, Company, Project } from '../model/model.js';

main();

async function main() {
  await connectToDb();
}

// Drop the database
async function dropDatabase() {
  try {
    await mongoose.connection.dropDatabase();
    console.log('Database dropped successfully');
  } catch (error) {
    console.error('Error dropping database:', error);
  }
}

// Create valid data
async function createValidData() {
  try {
    console.log('\n=== CREATING VALID DATA ===\n');
    
    // Create users
    const admin = await User.create({
      username: 'admin123',
      password: 'Password123!',
      firstname: 'Admin',
      lastname: 'User',
      role: 'Admin'
    });
    console.log('Admin created:', admin.username);
    
    const engineer = await User.create({
      username: 'engineer1',
      password: 'Engineer789!',
      firstname: 'Engineer',
      lastname: 'One',
      role: 'Engineer'
    });
    console.log('Engineer created:', engineer.username);
    
    const manager = await User.create({
      username: 'manager99',
      password: 'Manager456!',
      firstname: 'Manager',
      lastname: 'User',
      role: 'Field Manager'
    });
    console.log('Manager created:', manager.username);
    
    // Create company
    const company = await Company.create({
      title: 'Acme Construction',
      location: 'New York, USA',
      industry: 'Construction',
      owner: admin._id,
      employees: [engineer._id, manager._id]
    });
    console.log('Company created:', company.title);
    
    // Create project with embedded subdocuments
    const project = await Project.create({
      title: 'New Office Building',
      description: 'Construction of a 10-story office building',
      budget: 5000000,
      status: 'In Progress',
      members: [manager._id, engineer._id],
      // Add a task directly as a subdocument
      tasks: [{
        title: 'Foundation work',
        description: 'Prepare and pour foundation',
        cost: 500000,
        status: 'In Progress',
        assignedTo: engineer._id
      }],
      // Add a blueprint directly as a subdocument
      blueprints: [{
        title: 'Building Layout',
        fileURL: 'layout.pdf',
        tags: ['foundation', 'structure'],
        uploadedBy: engineer._id
      }],
      // Add a report directly as a subdocument
      reports: [{
        title: 'Initial Progress Report',
        description: 'Report on foundation work progress',
        tags: ['foundation', 'progress'],
        fileURL: 'report.pdf',
        uploadedBy: manager._id,
        issues: [{
          title: 'Soil condition issue',
          description: 'Unexpected soil conditions found',
          status: 'InProgress',
          raisedBy: engineer._id
        }]
      }]
    });
    console.log('Project created:', project.title);
    
    // Add project to company
    company.projects.push(project._id);
    await company.save();
    
    // Display some of the subdocuments we created
    console.log('Project tasks:', project.tasks.length);
    console.log('Project blueprints:', project.blueprints.length);
    console.log('Project reports:', project.reports.length);
    
  } catch (error) {
    console.error('Error creating valid data:', error);
    console.error(error.stack);
  }
}

// Test validation errors
async function testValidationErrors() {
  try {
    console.log('\n=== TESTING VALIDATION ERRORS ===\n');
    
    // Test 1: User with invalid username format
    console.log('\nTEST 1: Invalid username format');
    try {
      const user = await User.create({
        username: 'usr', // Too short
        password: 'Password123!',
        firstname: 'Test',
        lastname: 'User',
        role: 'Admin'
      });
    } catch (error) {
      console.error('Error:', error.message);
      console.error(JSON.stringify(error));
    }
    
    // Test 2: User with invalid password format
    console.log('\nTEST 2: Invalid password format');
    try {
      const user = await User.create({
        username: 'validuser1',
        password: 'pass', // Too short
        firstname: 'Valid',
        lastname: 'User',
        role: 'Admin'
      });
    } catch (error) {
      console.error('Error:', error.message);
    }
    
    // Test 3: Company with missing required field
    console.log('\nTEST 3: Company with missing required field');
    try {
      const company = await Company.create({
        title: 'Test Company',
        // Missing location
        industry: 'Technology',
        owner: new mongoose.Types.ObjectId()
      });
    } catch (error) {
      console.error('Error:', error.message);
    }
    
    // Test 4: Project with invalid enum value
    console.log('\nTEST 4: Project with invalid enum value');
    try {
      const project = await Project.create({
        title: 'Test Project',
        description: 'Test description',
        budget: 100000,
        status: 'Unknown' // Invalid enum value
      });
    } catch (error) {
      console.error('Error:', error.message);
    }
    
    // Test 5: Project with negative budget
    console.log('\nTEST 5: Project with negative budget');
    try {
      const project = await Project.create({
        title: 'Negative Budget Project',
        description: 'Should fail validation',
        budget: -1000, // Negative budget
        status: 'Pending'
      });
    } catch (error) {
      console.error('Error:', error.message);
    }
    
    // Test 6: Project with blueprint having invalid file URL
    console.log('\nTEST 6: Project with blueprint having invalid file URL');
    try {
      const project = await Project.create({
        title: 'Project with Invalid Blueprint',
        description: 'Test description',
        budget: 100000,
        status: 'Pending',
        blueprints: [{
          title: 'Invalid File Type',
          fileURL: 'document.doc', // Not an allowed extension
          tags: ['test'],
          uploadedBy: new mongoose.Types.ObjectId()
        }]
      });
    } catch (error) {
      console.error('Error:', error.message);
    }
    
    // Test 7: Project with report having null title
    console.log('\nTEST 7: Project with report having null title');
    try {
      const project = await Project.create({
        title: 'Project with Invalid Report',
        description: 'Test description',
        budget: 100000,
        status: 'Pending',
        reports: [{
          title: null, // Null value for required field
          description: 'Test description',
          tags: ['test'],
          fileURL: 'report.pdf',
          uploadedBy: new mongoose.Types.ObjectId()
        }]
      });
    } catch (error) {
      console.error('Error:', error.message);
    }
    
    // Test 8: Project with report having issue with invalid status
    console.log('\nTEST 8: Project with report having issue with invalid status');
    try {
      const project = await Project.create({
        title: 'Project with Report having Bad Issue',
        description: 'Test description',
        budget: 100000,
        status: 'Pending',
        reports: [{
          title: 'Report with Bad Issue',
          description: 'Test description',
          tags: ['test'],
          fileURL: 'report.pdf',
          uploadedBy: new mongoose.Types.ObjectId(),
          issues: [{
            title: 'Issue with invalid status',
            description: 'Test issue',
            status: 'WrongStatus', // Invalid enum value
            raisedBy: new mongoose.Types.ObjectId()
          }]
        }]
      });
    } catch (error) {
      console.error('Error:', error.message);
    }
    
    // Test 9: Duplicate username
    console.log('\nTEST 9: Duplicate username');
    try {
      // First create a user
      await User.create({
        username: 'duplicateuser',
        password: 'Password123!',
        firstname: 'Duplicate',
        lastname: 'User',
        role: 'Admin'
      });
      
      // Try to create another user with the same username
      await User.create({
        username: 'duplicateuser', // Duplicate
        password: 'DifferentPass123!',
        firstname: 'Another',
        lastname: 'User',
        role: 'Admin'
      });
    } catch (error) {
      console.error('Error:', error.message);
      console.error(JSON.stringify(error));
    }

    // Test 10: Invalid role
    console.log('\nTEST 10: Invalid role');
    try {
      const user = await User.create({
        username: 'ddddddddddddd',
        password: 'boar2222!',
        firstname: 'Test',
        lastname: 'User',
        role: 'InvalidRole' // This should fail validation
      });
    } catch (error) {
      console.error('Error:', error.message);
    }

  } catch (error) {
    console.error('Error in validation tests:', error);
  }
}

// Test adding and modifying subdocuments
async function testSubdocumentOperations() {
  try {
    console.log('\n=== TESTING SUBDOCUMENT OPERATIONS ===\n');
    
    // Create a test user
    const testUser = await User.create({
      username: 'testuser123',
      password: 'TestPass123!',
      firstname: 'Test',
      lastname: 'User',
      role: 'Engineer'
    });
    
    // Create a test project
    const testProject = await Project.create({
      title: 'Test Subdocument Project',
      description: 'Testing subdocument operations',
      budget: 100000,
      status: 'In Progress',
      members: [testUser._id]
    });
    console.log('Created test project:', testProject.title);
    
    // Test 1: Add a task to an existing project
    console.log('\nTEST 1: Add a task to an existing project');
    try {
      testProject.tasks.push({
        title: 'New Test Task',
        description: 'Testing adding tasks',
        cost: 5000,
        status: 'Pending',
        assignedTo: testUser._id
      });
      
      await testProject.save();
      console.log('Task added successfully. Task count:', testProject.tasks.length);
    } catch (error) {
      console.error('Error:', error.message);
    }
    
    // Test 2: Add a blueprint to an existing project
    console.log('\nTEST 2: Add a blueprint to an existing project');
    try {
      testProject.blueprints.push({
        title: 'Test Blueprint',
        fileURL: 'test.pdf',
        tags: ['test'],
        uploadedBy: testUser._id
      });
      
      await testProject.save();
      console.log('Blueprint added successfully. Blueprint count:', testProject.blueprints.length);
    } catch (error) {
      console.error('Error:', error.message);
    }
    
    // Test 3: Add a report with issues to an existing project
    console.log('\nTEST 3: Add a report with issues to an existing project');
    try {
      testProject.reports.push({
        title: 'Test Report',
        description: 'Testing adding reports with issues',
        tags: ['test'],
        fileURL: 'testreport.pdf',
        uploadedBy: testUser._id,
        issues: [{
          title: 'Test Issue',
          description: 'This is a test issue',
          status: 'Pending',
          raisedBy: testUser._id
        }]
      });
      
      await testProject.save();
      console.log('Report added successfully. Report count:', testProject.reports.length);
    } catch (error) {
      console.error('Error:', error.message);
    }
    
    // Test 4: Modify a task in an existing project
    console.log('\nTEST 4: Modify a task in an existing project');
    try {
      if (testProject.tasks.length > 0) {
        // Change status of the first task
        testProject.tasks[0].status = 'Complete';
        await testProject.save();
        console.log('Task modified successfully. New status:', testProject.tasks[0].status);
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
    
    // Test 5: Add an issue to an existing report
    console.log('\nTEST 5: Add an issue to an existing report');
    try {
      if (testProject.reports.length > 0) {
        testProject.reports[0].issues.push({
          title: 'Another Test Issue',
          description: 'This is another test issue',
          status: 'In Progress',
          raisedBy: testUser._id
        });
        
        await testProject.save();
        console.log('Issue added successfully. Issue count:', testProject.reports[0].issues.length);
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
    
  } catch (error) {
    console.error('Error in subdocument operations tests:', error);
  }
}

async function testQueryEdgeCases() {
  try {
    console.log('\n=== TESTING QUERY EDGE CASES ===\n');

    // Test 1: findById with a random number
    console.log('\nTEST 1: findById with a random number (123)');
    try {
      const result = await User.findById(123);
      console.log('Result:', result);
    } catch (error) {
      console.error('Error:', error.message);
    }

    // Test 2: findById with a non-ObjectId string
    console.log('\nTEST 2: findById with a non-ObjectId string ("notanobjectid")');
    try {
      const result = await User.findById("notanobjectid");
      console.log('Result:', result);
    } catch (error) {
      console.error('Error:', error.message);
    }

    // Test 3: findById with null
    console.log('\nTEST 3: findById with null');
    try {
      const result = await User.findById(null);
      console.log('Result:', result);
    } catch (error) {
      console.error('Error:', error.message);
    }

    // Test 4: findById with undefined
    console.log('\nTEST 4: findById with undefined');
    try {
      const result = await User.findById(undefined);
      console.log('Result:', result);
    } catch (error) {
      console.error('Error:', error.message);
    }

    // Test 5: findById with an ObjectId that doesn't exist
    console.log('\nTEST 5: findById with non-existent ObjectId');
    try {
      const nonExistentId = new mongoose.Types.ObjectId();
      const result = await User.findById(nonExistentId);
      console.log('Result:', result);
    } catch (error) {
      console.error('Error:', error.message);
    }

    // Test 6: Find with complex query object including invalid operator
    console.log('\nTEST 6: Find with invalid operator');
    try {
      const result = await User.find({ username: { $invalidOperator: 'value' } });
      console.log('Result:', result);
    } catch (error) {
      console.error('Error:', error.message);
    }

    // Test 7: Query with improper type (number for string field)
    console.log('\nTEST 7: Query with improper type (number for string field)');
    try {
      const result = await User.find({ username: 12345 });
      console.log('Result:', result);
    } catch (error) {
      console.error('Error:', error.message);
    }

    // Test 8: Query with regex that's potentially problematic
    console.log('\nTEST 8: Query with potentially problematic regex');
    try {
      const result = await User.find({ username: { $regex: '.*' } });
      console.log('Result count:', result.length);
      console.log('First result (if any):', result[0] ? result[0].username : 'none');
    } catch (error) {
      console.error('Error:', error.message);
    }

    // Test 9: Deep nested query on a non-existent path
    console.log('\nTEST 9: Deep nested query on a non-existent path');
    try {
      const result = await Company.find({ 'nonexistent.deeply.nested.path': 'value' });
      console.log('Result:', result);
    } catch (error) {
      console.error('Error:', error.message);
    }

    // Test 10: findOne with empty object
    console.log('\nTEST 10: findOne with empty object');
    try {
      const result = await User.findOne({});
      console.log('Result:', result ? `Found: ${result.username}` : 'No result');
    } catch (error) {
      console.error('Error:', error.message);
    }

    // Test 11: updateOne with invalid ID but valid update
    console.log('\nTEST 11: updateOne with invalid ID but valid update');
    try {
      const result = await User.updateOne(
        { _id: 'notanid' },
        { $set: { role: 'Admin' } }
      );
      console.log('Update result:', result);
    } catch (error) {
      console.error('Error:', error.message);
    }

    // Test 12: find with inconsistent data types
    console.log('\nTEST 12: find with array for non-array field');
    try {
      const result = await User.find({ username: ['admin123', 'other'] });
      console.log('Result:', result);
    } catch (error) {
      console.error('Error:', error.message);
    }

    // Test 13: Query on non-top-level subdocuments
    console.log('\nTEST 13: Query on subdocuments');
    try {
      // Find projects with a specific task title
      const result = await Project.find({ 'tasks.title': 'Foundation work' });
      console.log('Projects with "Foundation work" task:', result.length);
    } catch (error) {
      console.error('Error:', error.message);
    }

    // Test 14: Query on deeply nested subdocuments
    console.log('\nTEST 14: Query on deeply nested subdocuments');
    try {
      // Find projects with reports containing issues with a specific status
      const result = await Project.find({ 'reports.issues.status': 'InProgress' });
      console.log('Projects with issues in progress:', result.length);
    } catch (error) {
      console.error('Error:', error.message);
    }

    // Test 15: Complex update on subdocuments
    console.log('\nTEST 15: Complex update on subdocuments');
    try {
      // Update the status of a specific task in a project
      const result = await Project.updateOne(
        { 'tasks.title': 'Foundation work' },
        { $set: { 'tasks.$.status': 'Complete' } }
      );
      console.log('Update result:', result);
      
      // Verify the update
      const project = await Project.findOne({ 'tasks.title': 'Foundation work' });
      if (project) {
        const task = project.tasks.find(t => t.title === 'Foundation work');
        console.log('Task status after update:', task ? task.status : 'task not found');
      }
    } catch (error) {
      console.error('Error:', error.message);
    }

  } catch (error) {
    console.error('Error in query tests:', error);
  }
}

// Main function
async function runTests() {
  await connectToDb();
  await dropDatabase();
  await createValidData();
  await testValidationErrors();
  await testSubdocumentOperations(); // New test for subdocument operations
  await testQueryEdgeCases();
  
  console.log('\nTests completed. Closing connection...');
  await mongoose.connection.close();
}

// Run the tests
runTests();