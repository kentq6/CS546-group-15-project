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
    id = validation.isValidId(id);
    const projectCollection = await projects();
    const project = await projectCollection.findOne({_id: new ObjectId(id)});
    if (!project) throw 'Error: Project not found!';
    return project;
  },
  async addProject(title, description, budget, status, teamMembers, tasks, blueprints, reports, companyId) {
    // validates the inputs
    title = validation.isValidString(title);
    description = validation.isValidString(description);
    budget = validation.isValidNumber(budget);
    status = validation.isValidString(status);

    // checks if each input is supplied, then validates each
    if (teamMembers)
      for (const userId of teamMembers) await userData.getUserById(userId);
    if (tasks)
      for (const taskId of tasks) await taskData.getTaskById(taskId);
    if (blueprints)
      for (const blueprintId of blueprints) await blueprintData.getBlueprintById(blueprintId);
    if (reports)
      for (const reportId of tasks) await reportData.getReportById(reportId);
    if (companyId)
      await companyData.getCompanyById(companyId);

    // creates new project
    const newProject = {
      title,
      description,
      budget,
      status,
      teamMembers: teamMembers || [],
      tasks: tasks || [],
      blueprints: blueprints || [],
      reports: reports || [],
      companyId: companyId || null 
    };

    // adds project to projects collection
    const projectCollection = await projects();
    const newInsertInformation = await projectCollection.insertOne(newProject);
    const newId = newInsertInformation.insertedId;

    return await this.getProjectById(newId.toString());
  },
  async removeProject(id) {
    id = validation.isValidId(id);
    const projectCollection = await projects();
    const deletionInfo = await projectCollection.findOneAndDelete({
      _id: new ObjectId(id)
    });
    if (!deletionInfo) throw `Error: Could not delete project with id of ${id}!`;

    return {...deletionInfo, deleted: true};
  },
  async updateProjectPut(id, projectInfo) {
    // validates the inputs
    id = validation.isValidId(id);
    projectInfo = validation.isValidProject(
      projectInfo.title,
      projectInfo.description,
      projectInfo.budget,
      projectInfo.status,
      projectInfo.teamMembers,
      projectInfo.tasks,
      projectInfo.blueprints,
      projectInfo.reports,
      projectInfo.companyId
    );

    // checks if the inputs exist
    if (projectInfo.teamMembers)
      for (const userId of projectInfo.teamMembers) await userData.getUserById(userId);
    if (projectInfo.tasks)
      for (const taskId of projectInfo.tasks) await taskData.getTaskById(taskId);
    if (projectInfo.blueprints)
      for (const blueprintId of projectInfo.blueprints) await blueprintData.getBlueprintById(blueprintId);
    if (projectInfo.reports)
      for (const reportId of projectInfo.reports) await reportData.getReportById(reportId);
    if (projectInfo.companyId)
      await companyData.getCompanyById(projectInfo.companyId);
   
    // creates new project with updated info
    let projectUpdateInfo = {
      title: projectInfo.title,
      description: projectInfo.description,
      budget: projectInfo.budget,
      status: projectInfo.status,
      teamMembers: projectInfo.teamMembers,
      tasks: projectInfo.tasks,
      blueprints: projectInfo.blueprints,
      reports: projectInfo.reports,
      companyId: projectInfo.companyId
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
    id = validation.isValidId(id);
    if (projectInfo.title) 
      projectInfo.title = validation.isValidString(projectInfo.title);
    if (projectInfo.description)
      projectInfo.description = validation.isValidString(projectInfo.description);
    if (projectInfo.budget)
      projectInfo.budget = validation.isValidNumber(projectInfo.budget);
    if (projectInfo.status)
      projectInfo.status = validation.isValidString(projectInfo.status);
   
    // checks if each input is supplied, then validates each
    if (projectInfo.teamMembers)
      for (const userId of projectInfo.teamMembers) await userData.getUserById(userId);
    if (projectInfo.tasks)
      for (const taskId of projectInfo.tasks) await taskData.getTaskById(taskId);
    if (projectInfo.blueprints)
      for (const blueprintId of projectInfo.blueprints) await blueprintData.getBlueprintById(blueprintId);
    if (projectInfo.reports)
      for (const reportId of projectInfo.reports) await reportData.getReportById(reportId);
    if (projectInfo.companyId)
      await companyData.getCompanyById(projectInfo.companyId);
  
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
