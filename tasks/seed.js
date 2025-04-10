import {dbConnection, closeConnection} from '../config/mongoConnection.js';
import users from '../data/users.js';
import companies from '../data/companies.js';
import projects from '../data/projects.js';
import tasks from '../data/tasks.js';
import blueprints from '../data/blueprints.js';
import reports from '../data/reports.js';
import issues from '../data/issues.js';

const db = await dbConnection();
await db.dropDatabase();

// Creating users
const owner1 = await users.createUser(
  'alpha12',
  'Passw0rd!',
  'Owner'
);
const owner1Id = owner1._id.toString();
const owner2 = await users.createUser(
  'bravo99',
  'abc123??',
  'Owner'
);
const owner2Id = owner2._id.toString();
const owner3 = await users.createUser(
  'charl3',
  'QweRty!2',
  'Owner'
);
const owner3Id = owner3._id.toString();
const employee1 = await users.createUser(
  'delta45',
  'Hello123!',
  'Temp Job'
);
const employee1Id = employee1._id.toString();
const employee2 = await users.createUser(
  'echo678',
  'testTEST?',
  'Temp Job'
);
const employee2Id = employee2._id.toString();
const employee3 = await users.createUser(
  'foxtrot',
  'MyPa55w?',
  'Temp Job'
);
const employee3Id = employee3._id.toString();
const employee4 = await users.createUser(
  'golfman',
  'Secret!?1',
  'Temp Job'
);
const employee4Id = employee4._id.toString();
const employee5 = await users.createUser(
  'hotel88',
  'Knight!3',
  'Temp Job'
);
const employee5Id = employee1._id.toString();
const employee6 = await users.createUser(
  'india32',
  'Welc0me!',
  'Temp Job'
);
const employee6Id = employee6._id.toString();
const employee7 = await users.createUser(
  'juliet_x',
  'Code2024?',
  'Temp Job'
);
const employee7Id = employee7._id.toString();

// Creating companies
const company1 = await companies.createCompany(
  'Liverpool LLC',
  owner1Id,
  'Liverpool, England',
  'Commercial',
  [employee1Id, employee2Id, employee7Id],
  []
);
const company1Id = company1._id.toString();
const company2 = await companies.createCompany(
  'Antwerps',
  owner2Id,
  '',
  '',
  [employee3Id, employee4Id],
  []
);
const company2Id = company2._id.toString();
const company3 = await companies.createCompany(
  'GoProject',
  owner3Id,
  'Hoboken, NJ',
  'Residential',
  [employee5Id, employee6Id],
  []
);
const company3Id = company3._id.toString();

// Creating projects
const project1 = await projects.createProject(
  'Build House',
  'Design, purchase materials, and build house according to plans.',
  500000,
  'In Progress',
  [employee1Id, employee2Id],
  [],
  [],
  []
);
const project1Id = project1._id.toString();
const project2 = await projects.createProject(
  'Redesign Office',
  'Create tasks, plans, and blueprints for new office design.',
  1000000,
  'Completed',
  [employee3Id, employee4Id],
  [],
  [],
  []
);
const project2Id = project2._id.toString();
const project3 = await projects.createProject(
  'Build House',
  'Design, purchase materials, and build house according to plans.',
  500000,
  'In Progress',
  [employee5Id, employee6Id],
  [],
  [],
  []
);
const project3Id = project3._id.toString();

// Creating tasks
const project1Task1 = await tasks.createTask(
  project1Id,
  'Field Maintenance',
  'Bad patches need to be resoded and entire fieid needs to be watered.',
  10000,
  'Pending',
  employee1Id
);

// Creating blueprints
const project1Blueprint1 = await blueprints.createBlueprint(
  project1Id,
  'Fix Bad Patches',
  'oldPitch.png',
  ['Fix', 'Easy'],
  employee1Id
);

// Creating reports
const project1Report1 = await reports.createReport(
  project1Id,
  'Field Is Patchy',
  'Players are tripping over uneven patches of field.',
  'oldPitch.png',
  ['Failed'],
  employee2Id,
  []
);
const project1Report1Id = project1Report1._id.toString();

// Creating issues
const report1Issue1 = await issues.createIssue(
  project1Report1Id,
  'Safety Concern',
  'Causing injuries.',
  'Unresolved',
  owner1Id
);

console.log('Done seeding database');

await closeConnection();
