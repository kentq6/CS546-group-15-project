//Export the following functions using ES6 Syntax
import { reports } from '../config/mongoCollections.js';
import userData from './users.js';
import { ObjectId } from 'mongodb';
import validation from '../validation.js';
import moment from 'moment';

const exportedMethods = {
  async getAllIssues(reportId) {
    // validates the inputs
    reportId = validation.isValidId(reportId, 'reportId');
    
    // checks if report matching ID can be found
    const reportCollection = await reports();
    const report = await reportCollection.findOne({_id: new ObjectId(reportId)});
    if (!report) throw `Error: Could not find report with id of ${reportId}`;
    if (report.issues.length === 0) return [];
  
    return report.issues;
  },
  async getIssue(issueId) {
    // validates the inputs
    issueId = validation.isValidId(issueId, 'issueId');

    // finds the report the issue is in
    const reportCollection = await reports();
    const report = await reportCollection.findOne(
      {'issues._id': new ObjectId(issueId)},
      {projection: {_id: 0, 'issues.$': 1}}
    );
    if (!report) throw 'Error: Issue not found!';
  
    // returns issue object
    return report.issues[0];
  },
  async createIssue(reportId, title, description, status, raisedBy) {
    // validates the inputs
    reportId = validation.isValidId(reportId, 'reportId');
    title = validation.isValidTitle(title, 'title');
    description = validation.isValidString(description, 'description');
    status = validation.isValidStatus(status, ['Unresolved', 'Resolved']);
    const currentDate = moment().format('MM/DD/YYYY');
    const createdAt = currentDate;
    const updatedAt = currentDate;

    // checks if the inputs exists, then validates them
    if (raisedBy) await userData.getUserById(raisedBy);      

    // creates the new user
    let newIssue = {
      _id: new ObjectId(),
      title,
      description,
      status,
      createdAt,
      updatedAt,
      raisedBy,
    };
  
    // finds report that matches ID
    const reportCollection = await reports();
    const report = await reportCollection.findOne({_id: new ObjectId(reportId)});
    if (!report) throw `Error: Could not find report with id ${reportId}!`;
    // pushes issue to report with matching ID
    const updatedInfo = await reportCollection.findOneAndUpdate(
      {_id: new ObjectId(reportId)},
      {$push: {issues: newIssue}},
      {returnDocument: 'after'}
    );
    if (!updatedInfo) throw 'Error: Report could not be updated with new issue!';
    
    return newIssue;
  },
  async removeIssue(issueId) {
    // validates the issue ID
    issueId = validation.isValidId(issueId, 'issueId');
  
    // finds report that issue belogns to and removes it
    const reportCollection = await reports();
    const report = await reportCollection.findOne({'issues._id': new ObjectId(issueId)});
    if (!report) throw `Error: Could not find issue with id ${issueId}!`;

    // deletes issue and returns deleted issue
    const deletionInfo = await reportCollection.findOneAndUpdate(
      {'issues._id': new ObjectId(issueId)},
      {$pull: {issues: {_id: new ObjectId(issueId)}}},
      {returnDocument: 'after'}
    );
    if (!deletionInfo) throw 'Error: Movie could not be updated!';

    return deletionInfo;
  },
  async updateIssuePatch(issueId, issueInfo) {
    // validates the inputs
    id = validation.isValidId(issueId, 'id');
    if (issueInfo.title)
      issueInfo.title = validation.isValidTitle(issueInfo.title);
    if (issueInfo.description)
      issueInfo.description = validation.isValidString(issueInfo.description, 'description');
    if (issueInfo.status)
      issueInfo.status = validation.isValidStatus(issueInfo.status, ['Resolved', 'Unresolved']);
    
    // checks if each input is supplied, then validates that they exist in DB
    if (issueInfo.projects)
      for (const projectId in issueInfo.projects) await projectData.getProjectById(projectId);
    if (issueInfo.companyId) await companyData.getCompanyById(issueInfo.companyId);

    // updates updatedAt date for issueInfo
    issueInfo.updatedAt = moment().format('MM/DD/YYYY');

    // finds report that matches ID
    const reportCollection = await reports();
    const updateInfo = await reportCollection.findOneAndUpdate(
      {'issues._id': new ObjectId(issueId)},
      {$set: issueInfo},
      {returnDocument: 'after'}
    );
    if (!updateInfo) throw 'Error: Issue not found!';
  
    // returns issue object
    return updateInfo;
  }
};

export default exportedMethods;
