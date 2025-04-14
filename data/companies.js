import { companies } from '../config/mongoCollections.js';
import userData from './users.js';
import projectData from './projects.js';
import { ObjectId } from 'mongodb';
import validation from '../validation.js';
import moment from 'moment';
import taskData from './tasks.js';
import blueprintData from './blueprints.js';
import reportData from './reports.js';


  // updated to follow schema rules & work properly with routes


let exportedMethods = {
  async getAllCompanies() {
    const companyCollection = await companies();
    return await companyCollection.find({}).toArray();
  },
  async getCompanyById(id) {
    id = validation.isValidId(id, 'id');
    const companyCollection = await companies();
    const company = await companyCollection.findOne({_id: new ObjectId(id)});
    if (!company) throw 'Error: Company not found!';
    return company;
  },
  async createCompany(
    title,
    ownerId,
    location,
    industry,
    members,
    projects,
  ) {
    title = validation.isValidTitle(title, 'title');
    const createdAt = moment().format('MM/DD/YYYY');
    if (location) location = validation.isValidString(location);
    if (industry) industry = validation.isValidString(industry);
    if (ownerId) ownerId = (await userData.getUserById(ownerId))._id;
    if (members) {
      members = validation.isValidArray(members);
      // TODO: tries to update to list of ObjectIds but does not work
      let memberIds = [];
      for (let userId of members) {
        // userId = (await userData.getUserById(userId))._id;;
        // await userData.getUserById(userId);
        // userId = new ObjectId(userId);
        await userData.getUserById(userId);
        memberIds.push(new ObjectId(userId));
      }
    }
    if (projects) {
      projects = validation.isValidArray(projects);
      let projectIds = [];
      for (let projectId of projects) 
        projectIds.push((await projectData.getProjectById(projectId))._id);
      projects = projectIds;
    }
    let newCompany = {
      title,
      createdAt,
      location: location || null,
      industry: industry || null,
      ownerId: ownerId || null,
      members: members || [],
      projects: projects || []
    };
    const companyCollection = await companies();
    const newInsertInformation = await companyCollection.insertOne(newCompany);
    if (!newInsertInformation.insertedId) throw 'Error: Company insert failed!';
    return await this.getCompanyById(newInsertInformation.insertedId.toString());
  },
  async removeCompany(id) {
    id = validation.isValidId(id, 'company id');
    const companyCollection = await companies();
    const company = await companyCollection.findOne({ _id: new ObjectId(id) });
    if (!company) throw `Error: Company with id ${id} does not exist!`;
    if (company.members && company.members.length > 0) {
      for (const memberId of company.members) {
        try {
          await userData.removeUser(memberId.toString());
        } catch (e) {
          console.warn(`Warning: Couldn't remove member ${memberId}:`, e);
        }
      }
    }
    if (company.projects && company.projects.length > 0) {
      for (const projectId of company.projects) {
        await projectData.removeProject(projectId.toString());
      }
    }
    const deletionInfo = await companyCollection.findOneAndDelete({
      _id: new ObjectId(id),
    });
    if (!deletionInfo) {
      throw `Error: Could not delete company with id ${id}!`;
    }
    return { ...deletionInfo, deleted: true };
  },
  async updateCompanyPut(id, companyInfo) {
    id = validation.isValidId(id, 'id');
    companyInfo = validation.isValidCompany(
      companyInfo.title,
      companyInfo.location,
      companyInfo.industry,
      companyInfo.ownerId,
      companyInfo.members,
      companyInfo.projects
    );
    // turn id strings into ObjectIds
    companyInfo.ownerId = (await userData.getUserById(companyInfo.ownerId))._id;
    for (let userId of companyInfo.members)
      userId = (await userData.getUserById(userId))._id;
    for (let projectId of companyInfo.projects)
      projectId = (await projectData.getProjectById(projectId))._id;

    const oldInfo = await this.getCompanyById(id);
    const companyUpdateInfo = {
      title: companyInfo.title,
      createdAt: oldInfo.createdAt,
      location: companyInfo.location,
      industry: companyInfo.industry,
      ownerId: companyInfo.ownerId,
      members: companyInfo.members,
      projects: companyInfo.projects,
    };
    const companyCollection = await companies();
    const updateInfo = await companyCollection.findOneAndReplace(
      {_id: new ObjectId(id)},
      companyUpdateInfo,
      {returnDocument: 'after'}
    );
    if (!updateInfo)
      throw `Error: Update failed, could not find a company with id of ${id}!`;
    return updateInfo;
  },
  async updateCompanyPatch(id, companyInfo) {
    id = validation.isValidId(id, 'id');
    if (companyInfo.title)
        companyInfo.title = validation.isValidTitle(companyInfo.title);
    if (companyInfo.location)
        companyInfo.location = validation.isValidLocation(companyInfo.location, 'location');
    if (companyInfo.industry)
        companyInfo.industry = validation.isValidString(companyInfo.industry, 'industry');
    if (companyInfo.ownerId) companyInfo.ownerId = (await userData.getUserById(companyInfo.ownerId))._id;
    if (companyInfo.members) {
        companyInfo.members = validation.isValidArray(companyInfo.members);
        let memberIds = [];
        for (let userId of companyInfo.members)
          memberIds.push((await userData.getUserById(userId))._id);
        companyInfo.members = memberIds;
    }
    if (companyInfo.projects) {
        companyInfo.projects = validation.isValidArray(companyInfo.projects);
        let projectIds = [];
        for (let projectId of companyInfo.projects)
          projectIds.push((await projectData.getProjectById(projectId))._id);
        companyInfo.projects = projectIds;
    }
    const companyCollection = await companies();
    const existingCompany = await companyCollection.findOne({ _id: new ObjectId(id) });
    if (!existingCompany) {
        throw `Error: No company found with id ${id}!`;
    }
    const updateInfo = await companyCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: companyInfo },
        { returnDocument: 'after' }
    );
    if (!updateInfo) {
        throw `Error: Update failed, could not find a company with id ${id}!`;
    }
    return updateInfo;
  }
};

export default exportedMethods;
