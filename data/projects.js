import { companies, projects } from '../config/mongoCollections.js';
import userData from './users.js';
import taskData from './tasks.js';
import blueprintData from './blueprints.js';
import reportData from './reports.js';
import companyData from './companies.js';
import { ObjectId } from 'mongodb';
import validation from '../validation.js';

  // updated to follow schema rules & work properly with routes



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
  async createProject(title, description, budget, status, members = [], tasks = [], blueprints = [], reports = [], companyId) {
    title = validation.isValidTitle(title, 'title');
    description = validation.isValidString(description, 'description');
    budget = validation.isValidNumber(budget, 'budget');
    status = validation.isValidStatus(status, ['Pending', 'In Progress', 'Completed']);
    companyId = validation.isValidId(companyId, 'company id');
  
    if (members.length > 0) {
      members = validation.isValidArray(members, 'members');
      let userIds = [];
      for (const userId of members) 
        userIds.push((await userData.getUserById(userId))._id);
      members = userIds;
    }
    if (tasks.length > 0) {
      tasks = validation.isValidArray(tasks, 'tasks');
      let taskIds = [];
      for (const taskId of tasks) 
        taskIds.push((await taskData.getTaskById(taskId))._id);
      tasks = taskIds;
    }
    if (blueprints.length > 0) {
      blueprints = validation.isValidArray(blueprints, 'blueprints');
      let blueprintIds = [];
      for (const blueprintId of blueprints) 
        blueprintIds.push((await blueprintData.getBlueprintById(blueprintId))._id);
      blueprints = blueprintIds;
    }
    if (reports.length > 0) {
      reports = validation.isValidArray(reports, 'reports');
      let reportIds = [];
      for (const reportId of reports) 
        reportIds.push((await reportData.getReportById(reportId))._id);
      reports = reportIds;
    }
  
    const newProject = {
      title,
      description,
      budget,
      status,
      members,
      tasks,
      blueprints,
      reports,
      companyId: new ObjectId(companyId)
    };
  
    const projectCollection = await projects();
    const newInsertInformation = await projectCollection.insertOne(newProject);
    if (!newInsertInformation.insertedId) throw 'Error: Project insert failed!';
  
    const projectId = newInsertInformation.insertedId.toString();
  
    await companyData.updateCompanyPatch(companyId, {
      projects: [projectId]
    });
  
    return await this.getProjectById(projectId);
  },
  async removeProject(id) {
    id = validation.isValidId(id, 'project id');
  
    const projectCollection = await projects();
    const project = await projectCollection.findOne({ _id: new ObjectId(id) });
    if (!project) throw new Error(`Error: Project with id ${id} does not exist!`);
  
    if (project.tasks && project.tasks.length > 0) {
      for (const taskId of project.tasks) {
        await taskData.removeTask(taskId.toString());
      }
    }
  
    if (project.blueprints && project.blueprints.length > 0) {
      for (const blueprintId of project.blueprints) {
        await blueprintData.removeBlueprint(id, blueprintId.toString());
      }
    }
  
    if (project.reports && project.reports.length > 0) {
      for (const reportId of project.reports) {
        await reportData.removeReport(reportId.toString());
      }
    }
  
    const companyCollection = await companies();
    const updateResult = await companyCollection.updateOne(
      { projects: new ObjectId(id) },
      { $pull: { projects: new ObjectId(id) } }
    );
  
    if (updateResult.modifiedCount === 0) {
      console.warn(`Warning: Project with id ${id} was not found in any company's projects array.`);
    }
  
    const deletionInfo = await projectCollection.findOneAndDelete({
      _id: new ObjectId(id),
    });
  
    if (!deletionInfo) {
      throw new Error(`Error: Could not delete project with id ${id}!`);
    }
  
    return { ...deletionInfo, deleted: true };
  },
  async updateProjectPut(id, projectInfo) {
    id = validation.isValidId(id, 'id');
    projectInfo = validation.isValidProject(
      projectInfo.title,
      projectInfo.description,
      projectInfo.budget,
      projectInfo.status,
      projectInfo.members || [],
      projectInfo.tasks || [],
      projectInfo.blueprints || [],
      projectInfo.reports || [],
      projectInfo.companyId
    );
  
    let projectUpdateInfo = {
      title: projectInfo.title,
      description: projectInfo.description,
      budget: projectInfo.budget,
      status: projectInfo.status,
      members: projectInfo.members || [],
      tasks: projectInfo.tasks || [],
      blueprints: projectInfo.blueprints || [],
      reports: projectInfo.reports || [],
      companyId: projectInfo.companyId
    };
  
    const projectCollection = await projects();
    const updateInfo = await projectCollection.findOneAndReplace(
      { _id: new ObjectId(id) },
      projectUpdateInfo,
      { returnDocument: 'after' }
    );
  
    if (!updateInfo) {
      throw `Error: Update failed! Could not update project with id ${id}!`;
    }
  
    return updateInfo;
  },
  
  async updateProjectPatch(id, projectInfo) {
    id = validation.isValidId(id, 'id');
    if (projectInfo.title) 
      projectInfo.title = validation.isValidTitle(projectInfo.title);
    if (projectInfo.description)
      projectInfo.description = validation.isValidString(projectInfo.description, 'description');
    if (projectInfo.budget)
      projectInfo.budget = validation.isValidNumber(projectInfo.budget, 'budget');
    if (projectInfo.status)
      projectInfo.status = validation.isValidStatus(projectInfo.status, ['Pending', 'In Progress', 'Completed']);
   
    if (projectInfo.members) {
      let userIds = [];
      for (const userId of projectInfo.members) 
        userIds.push((await userData.getUserById(userId))._id);
      projectInfo.members = userIds;
    }
    if (projectInfo.tasks) {
      let taskIds = [];
      for (const taskId of projectInfo.tasks) 
        taskIds.push((await taskData.getTaskById(taskId))._id);
      projectInfo.tasks = taskIds;
    }
    if (projectInfo.blueprints) {
      let blueprintIds = [];
      for (const blueprintId of projectInfo.blueprints) 
        blueprintIds.push(await blueprintData.getBlueprintById(blueprintId)._id);
      projectInfo.blueprints = blueprintIds;
    }
    if (projectInfo.reports) {
      let reportIds = [];
      for (const reportId of projectInfo.reports) 
        reportIds.push((await reportData.getReportById(reportId))._id);
      projectInfo.reports = reportIds;
    }
  
    const projectCollection = await projects();
    let updateInfo = await projectCollection.findOneAndUpdate(
      {_id: new ObjectId(id)},
      {$set: projectInfo},
      {returnDocument: 'after'}
    );
    if (!updateInfo) throw `Error: Could not update the project with id ${id}!`;

    return updateInfo;
  },

  async getProjectsByCompany(companyId) {
    companyId = validation.isValidId(companyId, 'company id');
    const projectCollection = await projects();
    const companyProjects = await projectCollection.find({ companyId: new ObjectId(companyId) }).toArray();
    if (!companyProjects || companyProjects.length === 0) throw `Error: No projects found for company with id ${companyId}`;
    return companyProjects;
  },

  async getProjectsByManagerAndCompany(managerId, companyId) {
    managerId = validation.isValidId(managerId, 'manager id');
    companyId = validation.isValidId(companyId, 'company id');
    const projectCollection = await projects();
    const assignedProjects = await projectCollection.find({
      members: managerId,
      companyId: new ObjectId(companyId),
    }).toArray();
    if (!assignedProjects || assignedProjects.length === 0) throw `Error: No projects found for manager with id ${managerId} in company ${companyId}`;
    return assignedProjects;
  },

  async getProjectsByEngineerAndCompany(engineerId, companyId) {
    engineerId = validation.isValidId(engineerId, 'engineer id');
    companyId = validation.isValidId(companyId, 'company id');
    const projectCollection = await projects();
    const assignedProjects = await projectCollection.find({
      members: engineerId,
      companyId: new ObjectId(companyId),
    }).toArray();
    if (!assignedProjects || assignedProjects.length === 0) throw `Error: No projects found for engineer with id ${engineerId} in company ${companyId}`;
    return assignedProjects;
  },
};

export default exportedMethods;
