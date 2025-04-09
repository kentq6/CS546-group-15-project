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
    if (!project) throw 'Error: Project not found';
    return project;
  },
  // async getProjectsByTag(tag) {
  //   tag = validation.isValidString(tag, 'Tag');
  //   const projectCollection = await projects();
  //   return await projectCollection.find({tags: tag}).toArray();
  // },
  async addProject(title, description, budget, status, teamMembers, tasks, blueprints, reports, companyId) {
    // validates the inputs
    title = validation.isValidString(title);
    description = validation.isValidString(description);
    budget = validation.isValidNumber(budget);
    status = validation.isValidString(status);
    // checks if each input is supplied, then validates each
    if (teamMembers) {
      teamMembers = validation.isValidStringArray(teamMembers);
      for (const member of teamMembers) await userData.getUserById(member);
    }
    if (tasks) {
      tasks = validation.isValidStringArray(tasks);
      for (const task of tasks) await taskData.getTaskById(task);
    }
    if (blueprints) {
      blueprints = validation.isValidStringArray(blueprints);
      for (const blueprint of blueprints) await taskData.getTaskById(blueprint);
    }
    if (reports) {
      reports = validation.isValidStringArray(reports);
      for (const report of tasks) await taskData.getTaskById(report);
    }
    if (companyId) {
      companyId = validation.isValidId(companyId);
      await companyData.getCompanyById(companyId);
    }
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
    if (!deletionInfo) throw `Could not delete project with id of ${id}`;
    return {...deletionInfo, deleted: true};
  },
  async updateProjectPut(id, updatedProject) {
    // validates the inputs
    id = validation.isValidId(id);
    updatedProject = validation.isValidProject(
      updatedProject.title,
      updatedProject.description,
      updatedProject.budget,
      updatedProject.status,
      updatedProject.teamMembers,
      updatedProject.tasks,
      updatedProject.blueprints,
      updatedProject.reports,
      updatedProject.companyId
    );
    // checks if the inputs exist
    if (updatedProject.teamMembers)
      for (const member of updatedProject.teamMembers) await userData.getUserById(member);
    if (updatedProject.tasks)
      for (const task of updatedProject.tasks) await taskData.getTaskById(task);
    if (updatedProject.blueprints)
      for (const blueprint of updatedProject.blueprints) await blueprintData.getBlueprintById(blueprint);
    if (updatedProject.reports)
      for (const report of updatedProject.reports) await reportData.getReportById(report);
    if (updatedProject.companyId)
      await companyData.getCompanyById(updatedProject.companyId);

    let updatedProjectData = {
      title: updatedProject.title,
      description: updatedProject.description,
      budget: updatedProject.budget,
      status: updatedProject.status,
      teamMembers: updatedProject.teamMembers,
      tasks: updatedProject.tasks,
      blueprints: updatedProject.blueprints,
      reports: updatedProject.reports,
      companyId: updatedProject.companyId
    };
    const projectCollection = await projects();
    const updateInfo = await projectCollection.findOneAndReplace(
      {_id: new ObjectId(id)},
      updatedProjectData,
      {returnDocument: 'after'}
    );
    if (!updateInfo)
      throw `Error: Update failed! Could not update project with id ${id}`;
    return updateInfo;
  },
  async updateProjectPatch(id, updatedProject) {
    // validates the inputs
    id = validation.isValidId(id);
    if (updatedProject.title) 
      updatedProject.title = validation.isValidString(updatedProject.title);
    if (updatedProject.description)
      updatedProject.description = validation.isValidString(updatedProject.description);
    if (updatedProject.budget)
      updatedProject.budget = validation.isValidNumber(updatedProject.budget);
    if (updatedProject.status)
      updatedProject.status = validation.isValidString(updatedProject.status);
    // checks if each input is supplied, then validates each
    if (updatedProject.teamMembers) {
      updatedProject.teamMembers = validation.isValidStringArray(updatedProject.teamMembers);
      for (const member of updatedProject.teamMembers) await userData.getUserById(member);
    }
    if (updatedProject.tasks) {
      updatedProject.tasks = validation.isValidStringArray(updatedProject.tasks);
      for (const task of updatedProject.tasks) await taskData.getTaskById(task);
    }
    if (updatedProject.blueprints) {
      updatedProject.blueprints = validation.isValidStringArray(updatedProject.blueprints);
      for (const blueprint of updatedProject.blueprints) await taskData.getTaskById(blueprint);
    }
    if (updatedProject.reports) {
      updatedProject.reports = validation.isValidStringArray(updatedProject.reports);
      for (const report of updatedProject.tasks) await taskData.getTaskById(report);
    }
    if (updatedProject.companyId) {
      updatedProject.companyId = validation.isValidId(updatedProject.companyId);
      await companyData.getCompanyById(updatedProject.companyId);
    }

    const projectCollection = await projects();
    let newProject = await projectCollection.findOneAndUpdate(
      {_id: new ObjectId(id)},
      {$set: updatedProject},
      {returnDocument: 'after'}
    );
    if (!newProject) throw `Could not update the project with id ${id}`;

    return newProject;
  },
  // async renameTag(oldTag, newTag) {
  //   oldTag = validation.isValidString(oldTag, 'Old Tag');
  //   newTag = validation.isValidString(newTag, 'New Tag');
  //   if (oldTag === newTag) throw 'tags are the same';

  //   let findDocuments = {
  //     tags: oldTag
  //   };

  //   let firstUpdate = {
  //     $addToSet: {tags: newTag}
  //   };

  //   let secondUpdate = {
  //     $pull: {tags: oldTag}
  //   };
  //   const projectCollection = await projects();
  //   let updateOne = await projectCollection.updateMany(findDocuments, firstUpdate);
  //   if (updateOne.matchedCount === 0)
  //     throw `Could not find any projects with old tag: ${oldTag}`;
  //   let updateTwo = await projectCollection.updateMany(
  //     findDocuments,
  //     secondUpdate
  //   );
  //   if (updateTwo.modifiedCount === 0) throw [500, 'Could not update tags'];
  //   return await this.getProjectsByTag(newTag);
  // }
};

export default exportedMethods;
