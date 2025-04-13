import { reports } from '../config/mongoCollections.js';
import userData from './users.js';
import { ObjectId } from 'mongodb';
import validation from '../validation.js';
import moment from 'moment';


  // updated to follow schema rules & work properly with routes



const exportedMethods = {
  async getAllIssues(reportId) {
    reportId = validation.isValidId(reportId, 'reportId');
    const reportCollection = await reports();
    const report = await reportCollection.findOne({_id: new ObjectId(reportId)});
    if (!report) throw `Error: Could not find report with id of ${reportId}`;
    if (report.issues.length === 0) return [];
    return report.issues;
  },

  async getIssue(issueId) {
    issueId = validation.isValidId(issueId, 'issueId');
    const reportCollection = await reports();
    const report = await reportCollection.findOne(
      { 'issues._id': new ObjectId(issueId) },
      { projection: { _id: 0, 'issues.$': 1 } }
    );
    if (!report) throw 'Error: Issue not found!';
    return report.issues[0];
  },

  async createIssue(reportId, title, description, status, raisedBy) {
    reportId = validation.isValidId(reportId, 'reportId');
    title = validation.isValidTitle(title, 'title');
    description = validation.isValidString(description, 'description');
    status = validation.isValidStatus(status, ['Unresolved', 'Resolved']);
    const currentDate = moment().format('MM/DD/YYYY');
    const createdAt = currentDate;
    const updatedAt = currentDate;
    if (raisedBy) await userData.getUserById(raisedBy);
    let newIssue = {
      _id: new ObjectId(),
      title,
      description,
      status,
      createdAt,
      updatedAt,
      raisedBy,
    };
    const reportCollection = await reports();
    const report = await reportCollection.findOne({_id: new ObjectId(reportId)});
    if (!report) throw `Error: Could not find report with id ${reportId}!`;
    const updatedInfo = await reportCollection.findOneAndUpdate(
      {_id: new ObjectId(reportId)},
      {$push: {issues: newIssue}},
      {returnDocument: 'after'}
    );
    if (!updatedInfo) throw 'Error: Report could not be updated with new issue!';
    return newIssue;
  },

  async removeIssue(issueId) {
    issueId = validation.isValidId(issueId, 'issueId');
    const reportCollection = await reports();
    const report = await reportCollection.findOne({'issues._id': new ObjectId(issueId)});
    if (!report) throw `Error: Could not find issue with id ${issueId}!`;
    const deletionInfo = await reportCollection.findOneAndUpdate(
      {'issues._id': new ObjectId(issueId)},
      {$pull: {issues: {_id: new ObjectId(issueId)}}},
      {returnDocument: 'after'}
    );
    if (!deletionInfo.value) throw 'Error: Issue could not be removed!';
    return deletionInfo.value;
  },

  async updateIssuePatch(issueId, issueInfo) {
    issueId = validation.isValidId(issueId, 'issueId');
    if (issueInfo.title)
      issueInfo.title = validation.isValidTitle(issueInfo.title);
    if (issueInfo.description)
      issueInfo.description = validation.isValidString(issueInfo.description, 'description');
    if (issueInfo.status)
      issueInfo.status = validation.isValidStatus(issueInfo.status, ['Resolved', 'Unresolved']);
    issueInfo.updatedAt = moment().format('MM/DD/YYYY');
    const reportCollection = await reports();
    const report = await reportCollection.findOne(
      { 'issues._id': new ObjectId(issueId) },
      { projection: { 'issues.$': 1 } }
    );
    if (!report || !report.issues || report.issues.length === 0) {
      throw 'Error: Issue not found!';
    }
    const existingIssue = report.issues[0];
    const updatedIssue = { ...existingIssue, ...issueInfo };
    const updateInfo = await reportCollection.findOneAndUpdate(
      { 'issues._id': new ObjectId(issueId) },
      { $set: { 'issues.$': updatedIssue } },
      { returnDocument: 'after' }
    );
    if (!updateInfo.value) throw 'Error: Issue not found!';
    return updatedIssue;
  }
};

export default exportedMethods;
