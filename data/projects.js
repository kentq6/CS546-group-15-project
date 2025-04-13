import { projects } from '../config/mongoCollections.js';
import userData from './users.js';
import taskData from './tasks.js';
import blueprintData from './blueprints.js';
import reportData from './reports.js';
import companyData from './companies.js';
import { ObjectId } from 'mongodb';
import validation from '../validation.js';

const exportedMethods = {
  async getAllProjects() {
    const projectCollection = await projects();
    return await projectCollection.find({}).toArray();
  },
  async getProjectById(id) {
    id = validation.isValidId(id, 'id');
    const projectCollection = await projects();
    const project = await projectCollection.findOne({_id: new ObjectId(id)});
    if (!project) throw 'Error: Project not found!';
    return project;
  },
  async createProject(title, description, budget, status, members, tasks, blueprints, reports) {
    // validates the inputs
    title = validation.isValidTitle(title, 'title');
    description = validation.isValidString(description, 'description');
    budget = validation.isValidNumber(budget, 'budget');
    status = validation.isValidStatus(status, ['Pending', 'In Progress', 'Completed']);

    // checks if each input is supplied, then validates each
    if (members)
      members = validation.isValidArray(members);
      for (const userId of members) await userData.getUserById(userId);
    if (tasks)
      tasks = validation.isValidArray(tasks);
      for (const taskId of tasks) await taskData.getTaskById(taskId);
    if (blueprints)
      blueprints = validation.isValidArray(blueprints);
      for (const blueprintId of blueprints) await blueprintData.getBlueprintById(blueprintId);
    if (reports)
      reports = validation.isValidArray(reports);
      for (const reportId of tasks) await reportData.getReportById(reportId);

    // creates new project
    const newProject = {
      title,
      description,
      budget,
      status,
      members: members || [],
      tasks: tasks || [],
      blueprints: blueprints || [],
      reports: reports || []
    };

    // adds project to projects collection
    const projectCollection = await projects();
    const newInsertInformation = await projectCollection.insertOne(newProject);
    if (!newInsertInformation.insertedId) throw 'Error: Project insert failed!';

    return await this.getProjectById(newInsertInformation.insertedId.toString());
  },
  async removeProject(id) {
    id = validation.isValidId(id, 'id');
    const projectCollection = await projects();
    const deletionInfo = await projectCollection.findOneAndDelete({
      _id: new ObjectId(id)
    });
    if (!deletionInfo) throw `Error: Could not delete project with id of ${id}!`;

    return {...deletionInfo, deleted: true};
  },
  async updateProjectPut(id, projectInfo) {
    // validates the inputs
    id = validation.isValidId(id, 'id');
    projectInfo = validation.isValidProject(
      projectInfo.title,
      projectInfo.description,
      projectInfo.budget,
      projectInfo.status,
      projectInfo.members,
      projectInfo.tasks,
      projectInfo.blueprints,
      projectInfo.reports
    );

    // checks if the inputs exist
    if (projectInfo.members)
      for (const userId of projectInfo.members) await userData.getUserById(userId);
    if (projectInfo.tasks)
      for (const taskId of projectInfo.tasks) await taskData.getTaskById(taskId);
    if (projectInfo.blueprints)
      for (const blueprintId of projectInfo.blueprints) await blueprintData.getBlueprintById(blueprintId);
    if (projectInfo.reports)
      for (const reportId of projectInfo.reports) await reportData.getReportById(reportId);
   
    // creates new project with updated info
    let projectUpdateInfo = {
      title: projectInfo.title,
      description: projectInfo.description,
      budget: projectInfo.budget,
      status: projectInfo.status,
      members: projectInfo.members,
      tasks: projectInfo.tasks,
      blueprints: projectInfo.blueprints,
      reports: projectInfo.reports
    };
   
    // updates the correct document with new info
    const projectCollection = await projects();
    const updateInfo = await projectCollection.findOneAndReplace(
      {_id: new ObjectId(id)},
      projectUpdateInfo,
      {returnDocument: 'after'}
    );
    if (!updateInfo)
      throw `Error: Update failed! Could not update project with id ${id}!`;
    
    return updateInfo;
  },
  async updateProjectPatch(id, projectInfo) {
    // validates the inputs
    id = validation.isValidId(id, 'id');
    if (projectInfo.title) 
      projectInfo.title = validation.isValidTitle(projectInfo.title);
    if (projectInfo.description)
      projectInfo.description = validation.isValidString(projectInfo.description, 'description');
    if (projectInfo.budget)
      projectInfo.budget = validation.isValidNumber(projectInfo.budget, 'budget');
    if (projectInfo.status)
      projectInfo.status = validation.isValidStatus(projectInfo.status, ['Pending', 'In Progress', 'Completed']);
   
    // checks if each input is supplied, then validates that they exist in DB
    if (projectInfo.members)
      for (const userId of projectInfo.members) await userData.getUserById(userId);
    if (projectInfo.tasks)
      for (const taskId of projectInfo.tasks) await taskData.getTaskById(taskId);
    if (projectInfo.blueprints)
      for (const blueprintId of projectInfo.blueprints) await blueprintData.getBlueprintById(blueprintId);
    if (projectInfo.reports)
      for (const reportId of projectInfo.reports) await reportData.getReportById(reportId);
  
    // updates the document with the new info
    const projectCollection = await projects();
    let updateInfo = await projectCollection.findOneAndUpdate(
      {_id: new ObjectId(id)},
      {$set: projectInfo},
      {returnDocument: 'after'}
    );
    if (!updateInfo) throw `Error: Could not update the project with id ${id}!`;

    return updateInfo;
  }
};

export default exportedMethods;
