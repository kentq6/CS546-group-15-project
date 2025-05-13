import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User, Company, Project, Blueprint, Task, Report } from '../model/model.js';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import { createWriteStream } from 'fs';

// Load environment variables
dotenv.config();

// MongoDB connection string
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/engineering-app';

// Constants for seeding
const NUM_COMPANIES = 3;
const NUM_PROJECTS_PER_COMPANY = 2;
const NUM_USERS_PER_COMPANY = {
  'Owner': 1,                  // Exactly 1 owner per company
  'Field Manager': 2,          // 2 field managers per company
  'Engineer': 5                // 5 engineers per company
};
const NUM_BLUEPRINTS_PER_PROJECT = 3;
const NUM_TASKS_PER_PROJECT = 5;
const NUM_REPORTS_PER_PROJECT = 2;
const NUM_ISSUES_PER_REPORT = 3;
const DEFAULT_PASSWORD = 'password123'; // Plain text password for all users
const CREDENTIALS_LOG_FILE = 'seed_credentials.log'; // File to store credentials

const generateValidTitle = (prefix = '', uniqueIndex = '') => {
  // Start with the prefix if provided
  let baseTitle = prefix ? `${prefix} ` : '';

  if (uniqueIndex !== '') {
    baseTitle += `${uniqueIndex} `;
  }
  
  // Add a simple product name, but keep it short
  baseTitle += faker.commerce.product();
  
  // If still too short, add an adjective
  if (baseTitle.length < 5 && !prefix) {
    baseTitle = `${faker.commerce.productAdjective()} ${baseTitle}`;
  }
  
  // Ensure it only contains allowed characters and is within length limits
  baseTitle = baseTitle.replace(/[^A-Za-z0-9\s]/g, '');
  
  // Truncate if too long (allowing 30 chars max, or less if there's a prefix)
  const maxLength = 30 - (prefix ? prefix.length + 1 : 0);
  if (baseTitle.length > maxLength) {
    baseTitle = baseTitle.substring(0, maxLength).trim();
  }
  
  return baseTitle;
};

// Generate valid tags (2-30 chars, alphanumeric only)
const generateTags = (count) => {
  const tags = [];
  for (let i = 0; i < count; i++) {
    // Get a simple word and ensure it's alphanumeric only
    const tag = faker.word.adjective().toLowerCase().replace(/[^a-z0-9]/g, '');
    // Ensure minimum length is 2 characters
    if (tag.length >= 2) {
      tags.push(tag);
    }
  }
  return tags;
};

// Generate random location in "City, State" format
const generateLocation = () => {
  return `${faker.location.city()}, ${faker.location.state()}`;
};// Clear the database
const clearDatabase = async () => {
  try {
    await mongoose.connection.dropDatabase();
    console.log('🗑️  Database cleared');
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
};

// Helper to generate a dummy fileURL based on type
const generateFileURL = (type) => {
  const fileTypes = {
    blueprint: ['pdf'],
    report: ['pdf', 'jpeg', 'png']
  };
  
  const extension = faker.helpers.arrayElement(fileTypes[type] || ['pdf']);
  const fileName = `${faker.string.alpha(8)}.${extension}`;
  
  return `dummy/${type}s/${fileName}`;
};

// Generate a random username (lowercase alphanumeric with underscore, 5-30 chars)
const generateUsername = () => {
  const length = faker.number.int({ min: 5, max: 15 });
  let username = '';
  
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789_';
  for (let i = 0; i < length; i++) {
    username += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return username;
};

// Generate clean firstname and lastname (alphabetic only)
const generateValidName = () => {
  // Get a name and remove any non-alphabetic characters
  const rawName = faker.person.firstName();
  return rawName.replace(/[^A-Za-z]/g, '');
};

// Generate a basic password hash for all seeded users
const generatePasswordHash = async () => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(DEFAULT_PASSWORD, salt);
};

// Utility to format credentials for logging
const formatCredentials = (user, companyName) => {
  return `${user.role.padEnd(15)} | ${user.username.padEnd(15)} | ${DEFAULT_PASSWORD.padEnd(15)} | ${user.firstname} ${user.lastname.padEnd(20)} | ${companyName}`;
};

// Create credentials log file
const initCredentialsLog = () => {
  const logStream = createWriteStream(CREDENTIALS_LOG_FILE);
  logStream.write('# Seeded User Credentials\n');
  logStream.write('# Format: Role | Username | Password | Full Name | Company\n');
  logStream.write('# -------------------------------------------------------------------------\n');
  return logStream;
};

// Seed the database
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('🔌 Connected to MongoDB');
    
    // Clear existing data
    await clearDatabase();
    
    // Initialize credentials log file
    const credentialsLog = initCredentialsLog();
    
    // Pre-generate password hash for all users
    const passwordHash = await generatePasswordHash();
    
    // Map to store created entities for reference
    const entities = {
      companies: [],
      users: [],
      projects: []
    };
    
    // 1. Create companies and their owners
    console.log('🏢 Creating companies and users...');
    
    for (let i = 0; i < NUM_COMPANIES; i++) {
      // First, create a temporary owner ID for reference
      const ownerId = new mongoose.Types.ObjectId();
      
      // Create the company
      const company = new Company({
        title: faker.company.name(),
        owner: ownerId, // Temporary reference
        location: generateLocation(),
        industry: faker.company.buzzNoun()
      });
      
      // Save company
      const savedCompany = await company.save();
      entities.companies.push(savedCompany);
      
      // Create the owner
      const owner = new User({
        _id: ownerId, // Use the pre-generated ID
        username: generateUsername(),
        password: passwordHash,
        firstname: generateValidName(),
        lastname: generateValidName(),
        company: savedCompany._id,
        role: 'Owner'
      });
      
      // Save owner
      const savedOwner = await owner.save();
      entities.users.push(savedOwner);
      
      // Log owner credentials
      credentialsLog.write(formatCredentials(savedOwner, savedCompany.title) + '\n');
      
      // Create other users for this company
      for (const [role, count] of Object.entries(NUM_USERS_PER_COMPANY)) {
        if (role === 'Owner') continue; // Skip owner as already created
        
        for (let j = 0; j < count; j++) {
          const user = new User({
            username: generateUsername(),
            password: passwordHash,
            firstname: generateValidName(),
            lastname: generateValidName(),
            company: savedCompany._id,
            role: role
          });
          
          const savedUser = await user.save();
          entities.users.push(savedUser);
          
          // Log user credentials
          credentialsLog.write(formatCredentials(savedUser, savedCompany.title) + '\n');
        }
      }
    }
    
    // 2. Create projects for each company
    console.log('📋 Creating projects...');
    
    for (const company of entities.companies) {
      // Get company users
      const companyUsers = entities.users.filter(user => 
        user.company.equals(company._id)
      );
      
      // Get field managers and engineers
      const fieldManagers = companyUsers.filter(user => user.role === 'Field Manager');
      const engineers = companyUsers.filter(user => user.role === 'Engineer');
      
      for (let i = 0; i < NUM_PROJECTS_PER_COMPANY; i++) {
        // Select a field manager to create the project
        const creatorFieldManager = faker.helpers.arrayElement(fieldManagers);
        
        // Select random members (including the creator field manager)
        const members = [creatorFieldManager._id];
        
        // Add some engineers to the project
        const numEngineers = faker.number.int({ min: 1, max: engineers.length });
        const selectedEngineers = faker.helpers.arrayElements(engineers, numEngineers);
        selectedEngineers.forEach(engineer => {
          members.push(engineer._id);
        });
        
        // Add another field manager sometimes
        if (fieldManagers.length > 1 && faker.datatype.boolean()) {
          const otherFieldManagers = fieldManagers.filter(fm => 
            !fm._id.equals(creatorFieldManager._id)
          );
          if (otherFieldManagers.length > 0) {
            members.push(faker.helpers.arrayElement(otherFieldManagers)._id);
          }
        }
        
        const project = new Project({
          title: generateValidTitle(),
          description: faker.lorem.paragraph(),
          status: faker.helpers.arrayElement(['Pending', 'InProgress', 'Complete']),
          company: company._id,
          members: members,
          budget: faker.number.float({ min: 10000, max: 1000000, precision: 2 })
        });
        
        const savedProject = await project.save();
        entities.projects.push(savedProject);
        
        // 3. Create blueprints for this project
        console.log(`📑 Creating blueprints for project ${project.title}...`);
        
        for (let j = 0; j < NUM_BLUEPRINTS_PER_PROJECT; j++) {
          const uploaderUser = faker.helpers.arrayElement(members.map(memberId => 
            entities.users.find(user => user._id.equals(memberId))
          ));
          
          const blueprint = new Blueprint({
            title: generateValidTitle('Blueprint', j+1),
            project: savedProject._id,
            tags: generateTags(faker.number.int({ min: 1, max: 4 })),
            uploadedBy: uploaderUser._id
          });
          
          await blueprint.save();
        }
        
        // 4. Create tasks for this project
        console.log(`📝 Creating tasks for project ${project.title}...`);
        
        for (let j = 0; j < NUM_TASKS_PER_PROJECT; j++) {
          // Get project engineers
          const projectEngineerIds = members.filter(memberId => 
            entities.users.find(user => 
              user._id.equals(memberId) && 
              user.role === 'Engineer'
            )
          );
          
          // Decide if task is assigned or not
          const isAssigned = faker.datatype.boolean(0.8); // 80% chance of being assigned
          
          const task = new Task({
            title: generateValidTitle('Task', j+1),
            description: faker.lorem.paragraph(),
            project: savedProject._id,
            status: faker.helpers.arrayElement(['Pending', 'InProgress', 'Complete']),
            cost: faker.number.float({ min: 500, max: 50000, precision: 2 }),
            assignedTo: isAssigned && projectEngineerIds.length > 0 
              ? faker.helpers.arrayElement(projectEngineerIds) 
              : null
          });
          
          await task.save();
        }
        
        // 5. Create reports for this project
        console.log(`📊 Creating reports for project ${project.title}...`);
        
        for (let j = 0; j < NUM_REPORTS_PER_PROJECT; j++) {
          const uploaderUser = faker.helpers.arrayElement(members.map(memberId => 
            entities.users.find(user => user._id.equals(memberId))
          ));
          
          const issues = [];
          
          // Create issues for this report
          for (let k = 0; k < NUM_ISSUES_PER_REPORT; k++) {
            const issueRaiser = faker.helpers.arrayElement(members.map(memberId => 
              entities.users.find(user => user._id.equals(memberId))
            ));
            
            issues.push({
              title: generateValidTitle('Issue', `${j+1}-${k+1}`),
              description: faker.lorem.paragraph(),
              status: faker.helpers.arrayElement(['Pending', 'InProgress', 'Complete']),
              raisedBy: issueRaiser._id
            });
          }
          
          const report = new Report({
            title: generateValidTitle('Report', j+1),
            description: faker.lorem.paragraphs(2),
            project: savedProject._id,
            tags: generateTags(faker.number.int({ min: 1, max: 4 })),
            fileURL: generateFileURL('report'),
            issues: issues
          });
          
          await report.save();
        }
      }
    }
    
    console.log('✅ Database seeded successfully!');
    console.log(`Created:
      - ${entities.companies.length} companies
      - ${entities.users.length} users
      - ${entities.projects.length} projects
      - ${entities.projects.length * NUM_BLUEPRINTS_PER_PROJECT} blueprints
      - ${entities.projects.length * NUM_TASKS_PER_PROJECT} tasks
      - ${entities.projects.length * NUM_REPORTS_PER_PROJECT} reports
      - ${entities.projects.length * NUM_REPORTS_PER_PROJECT * NUM_ISSUES_PER_REPORT} issues
    `);
    
    // Close the credentials log and provide info
    credentialsLog.end();
    console.log(`📝 User credentials saved to ${CREDENTIALS_LOG_FILE}`);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedDatabase().catch(err => {
  console.error('Fatal error during seeding:', err);
  process.exit(1);
});