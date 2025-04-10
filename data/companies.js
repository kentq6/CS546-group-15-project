import { companies } from '../config/mongoCollections.js';
import userData from './users.js';
import projectData from './projects.js';
import { ObjectId } from 'mongodb';
import validation from '../validation.js';
import moment from 'moment';

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
    // validates the inputs
    title = validation.isValidTitle(title);
    const createdAt = moment().format('MM/DD/YYYY');
    
    // checks if the inputs exists, then validates them
    if (location) location = validation.isValidString(location);
    if (industry) industry = validation.isValidString(industry);
    if (ownerId) await userData.getUserById(ownerId);
    if (members)
      members = validation.isValidArray(members);
      for (const userId of members) await userData.getUserById(userId);
    if (projects)
      projects = validation.isValidArray(projects);
      for (const projectId of projects) await projectData.getProjectById(projectId);

    // creates the new company
    let newCompany = {
      title,
      createdAt,
      location: location || null,
      industry: industry || null,
      ownerId: ownerId || null,
      members: members || [],
      projects: projects || []
    };

    // adds new company to the collection
    const companyCollection = await companies();
    const newInsertInformation = await companyCollection.insertOne(newCompany);
    if (!newInsertInformation.insertedId) throw 'Error: Insert failed!';

    return await this.getCompanyById(newInsertInformation.insertedId.toString());
  },
  async removeCompany(id) {
    id = validation.isValidId(id, 'id');
    const companyCollection = await companies();
    const deletionInfo = await companyCollection.findOneAndDelete({
      _id: new ObjectId(id)
    });
    if (!deletionInfo) throw `Error: Could not delete company with id of ${id}!`;

    return {...deletionInfo, deleted: true};
  },
  async updateCompanyPut(id, companyInfo) {
    // validates the inputs
    id = validation.isValidId(id, 'id');
    companyInfo = validation.isValidCompany(
      companyInfo.title,
      companyInfo.location,
      companyInfo.industry,
      companyInfo.ownerId,
      companyInfo.members,
      companyInfo.projects
    );

    // gets old company for createdAt date
    const oldInfo = await this.getCompanyById(id);
    
    // creates new company with updated info
    const companyUpdateInfo = {
      title: companyInfo.title,
      createdAt: oldInfo.createdAt,
      location: companyInfo.location,
      industry: companyInfo.industry,
      ownerId: companyInfo.ownerId,
      members: companyInfo.members,
      projects: companyInfo.projects,
    };
    
    // updates the correct company with the new info
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
    // validates the inputs
    id = validation.isValidId(id, 'id');
    if (companyInfo.title)
      companyInfo.title = validation.isValidTitle(companyInfo.title);
    if (companyInfo.location)
      companyInfo.location = validation.isValidLocation(companyInfo.location, 'location');
    if (companyInfo.industry)
      companyInfo.industry = validation.isValidString(companyInfo.industry, 'industry');
    
    // checks if each input is supplied, then validates that they exist in DB
    if (companyInfo.ownerId) await companyData.getUserById(companyInfo.ownerId);
    if (companyInfo.members)
      for (const userId in companyInfo.members) await userData.getUserById(userId);
    if (companyInfo.projects)
      for (const projectId in companyInfo.projects) await projectData.getUserById(projectId);
    
    // updates the correct company with the new info
    const companyCollection = await companies();
    const updateInfo = await companyCollection.findOneAndUpdate(
      {_id: new ObjectId(id)},
      {$set: companyInfo},
      {returnDocument: 'after'}
    );
    if (!updateInfo)
      throw `Error: Update failed, could not find a company with id of ${id}!`;
    
    return updateInfo;
  }
};

export default exportedMethods;
