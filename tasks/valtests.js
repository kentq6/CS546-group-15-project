
import { connectToDb } from "../config/connection.js";
import mongoose from 'mongoose'
import { User, Company, Project, Task, Blueprint, Report } from '../model/model.js';

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
        role: 'Admin'
      });
      console.log('Admin created:', admin.username);
      
      const engineer = await User.create({
        username: 'engineer1',
        password: 'Engineer789!',
        role: 'Engineer'
      });
      console.log('Engineer created:', engineer.username);
      
      const manager = await User.create({
        username: 'manager99',
        password: 'Manager456!',
        role: 'Manager'
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
      
      // Create project
      const project = await Project.create({
        title: 'New Office Building',
        desctiption: 'Construction of a 10-story office building',
        budget: 5000000,
        status: 'InProgress'
      });
      console.log('Project created:', project.title);
      
      // Add project to company
      company.projects.push(project._id);
      await company.save();
      
      // Create task
      const task = await Task.create({
        title: 'Foundation work',
        decription: 'Prepare and pour foundation',
        cost: 500000,
        status: 'InProgress',
        assignedTo: engineer._id
      });
      console.log('Task created:', task.title);
      
      // Add task to project
      project.tasks.push(task._id);
      await project.save();
      
      // Create blueprint
      const blueprint = await Blueprint.create({
        title: 'Building Layout',
        fileURL: 'layout.pdf',
        tags: ['foundation', 'structure'],
        uploadedBy: engineer._id
      });
      console.log('Blueprint created:', blueprint.title);
      
      // Create report
      const report = await Report.create({
        title: 'Initial Progress Report',
        decription: 'Report on foundation work progress',
        tags: ['foundation', 'progress'],
        fileURL: 'report.pdf',
        uploadedBy: manager._id,
        issues: [{
          title: 'Soil condition issue',
          decription: 'Unexpected soil conditions found',
          status: 'InProgress',
          raisedBy: engineer._id
        }]
      });
      console.log('Report created:', report.title);
      
    } catch (error) {
      console.error('Error creating valid data:', error);
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
          role: 'Admin'
        });
      } catch (error) {
        console.error('Error:', error.message);
      }
      
      // Test 2: User with invalid password format
      console.log('\nTEST 2: Invalid password format');
      try {
        const user = await User.create({
          username: 'validuser1',
          password: 'pass', // Too short
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
          desctiption: 'Test description',
          budget: 100000,
          status: 'Unknown' // Invalid enum value
        });
      } catch (error) {
        console.error('Error:', error.message);
      }
      
      // Test 5: Task with negative cost
      console.log('\nTEST 5: Project with negative budget');
      try {
        const project = await Project.create({
          title: 'Negative Budget Project',
          desctiption: 'Should fail validation',
          budget: -1000, // Negative budget
          status: 'Pending'
        });
      } catch (error) {
        console.error('Error:', error.message);
      }
      
      // Test 6: Blueprint with invalid file URL
      console.log('\nTEST 6: Blueprint with invalid file URL');
      try {
        const blueprint = await Blueprint.create({
          title: 'Invalid File Type',
          fileURL: 'document.doc', // Not an allowed extension
          tags: ['test'],
          uploadedBy: new mongoose.Types.ObjectId()
        });
      } catch (error) {
        console.error('Error:', error.message);
      }
      
      // Test 7: Report with null value for required field
      console.log('\nTEST 7: Report with null value for required field');
      try {
        const report = await Report.create({
          title: null, // Null value for required field
          decription: 'Test description',
          tags: ['test'],
          fileURL: 'report.pdf',
          uploadedBy: new mongoose.Types.ObjectId()
        });
      } catch (error) {
        console.error('Error:', error.message);
      }
      
      // Test 8: Issue with invalid status
      console.log('\nTEST 8: Report with issue having invalid status');
      try {
        const report = await Report.create({
          title: 'Report with Bad Issue',
          decription: 'Test description',
          tags: ['test'],
          fileURL: 'report.pdf',
          uploadedBy: new mongoose.Types.ObjectId(),
          issues: [{
            title: 'Issue with invalid status',
            decription: 'Test issue',
            status: 'WrongStatus', // Invalid enum value
            raisedBy: new mongoose.Types.ObjectId()
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
          role: 'User'
        });
        
        // Try to create another user with the same username
        await User.create({
          username: 'duplicateuser', // Duplicate
          password: 'DifferentPass123!',
          role: 'User'
        });
      } catch (error) {
        console.error('Error:', error.message);
      }

      console.log('\nTEST 10: Yamotha username');
      try {
        const updateInfo = {
            username: 'ddddddddddddd',
            password: 'boar2222',
            role: '       '
        }
        // First create a user
        await User.create(updateInfo);
      } catch (error) {
        console.error('Error:', error.message);
      }


  
    } catch (error) {
      console.error('Error in validation tests:', error);
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
          { $set: { role: 'UpdatedRole' } }
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
  
      // Test 13: populate with invalid path
      console.log('\nTEST 13: populate with invalid path');
      try {
        const result = await Company.findOne().populate('nonexistentField');
        console.log('Result:', result);
      } catch (error) {
        console.error('Error:', error.message);
      }
  
      // Test 14: Using skip/limit with non-number values
      console.log('\nTEST 14: Using skip/limit with non-number values');
      try {
        const result = await User.find().skip('notanumber').limit('alsonotanumber');
        console.log('Result:', result);
      } catch (error) {
        console.error('Error:', error.message);
      }
  
      // Test 15: Create reference to non-existent document
      console.log('\nTEST 15: Create reference to non-existent document');
      try {
        const nonExistentId = new mongoose.Types.ObjectId();
        const project = await Project.create({
          title: 'Project with nonexistent assignee',
          desctiption: 'Test project',
          budget: 10000,
          status: 'Pending',
          tasks: [nonExistentId] // Reference to non-existent task
        });
        console.log('Created project with non-existent reference:', project._id);
        
        // Now try to populate the non-existent reference
        const populatedProject = await Project.findById(project._id).populate('tasks');
        console.log('Populated project tasks:', populatedProject.tasks);
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
    await testQueryEdgeCases();
    
    console.log('\nTests completed. Closing connection...');
    await mongoose.connection.close();
  }
  
  // Run the tests
  runTests();