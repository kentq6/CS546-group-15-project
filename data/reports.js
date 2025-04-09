import { reports } from '../config/mongoCollections.js';
import userData from './users.js';
import projectData from './projects.js';
import { ObjectId } from 'mongodb';
import validation from '../validation.js';

let exportedMethods = {
  async getAllReports() {
    const reportCollection = await reports();
    return await reportCollection.find({}).toArray();
  },
  async getReportById(id) {
    id = validation.isValidId(id, 'id');
    const reportCollection = await reports();
    const report = await reportCollection.findOne({_id: new ObjectId(id)});
    if (!report) throw 'Error: Report not found!';
    return report;
  },
  async addReport(title, description, fileUrl, tags, uploadedBy, projectId) {
    // validates the inputs
    title = validation.isValidString(title, 'title');
    description = validation.isValidString(description, 'description');
    fileUrl = validation.isValidFileUrl(fileUrl, 'fileUrl');
    tags.forEach(tag => validation.isValidString(tag, `${tag}`));

    // checks if the inputs exists, then validates them
    if (uploadedBy)
      await userData.getUserById(uploadedBy);
    if (projectId)
      await projectData.getProjectById(projectId);

    // creates the new report with issues subdocument
    let newReport = {
      title,
      description,
      fileUrl,
      tags,
      uploadedBy,
      projectId,
      issues: []
    };

    // adds new report to the collection
    const reportCollection = await reports();
    const newInsertInformation = await reportCollection.insertOne(newReport);
    if (!newInsertInformation.insertedId) throw 'Error: Insert failed!';

    return await this.getReportById(newInsertInformation.insertedId.toString());
  },
  async removeReport(id) {
    id = validation.isValidId(id, 'id');
    const reportCollection = await reports();
    const deletionInfo = await reportCollection.findOneAndDelete({
      _id: new ObjectId(id)
    });
    if (!deletionInfo) throw `Error: Could not delete report with id of ${id}!`;

    return {...deletionInfo, deleted: true};
  },
  async updateReportPut(id, reportInfo) {
    // validates the inputs
    id = validation.isValidId(id, 'id');
    reportInfo = validation.isValidReport(
      reportInfo.title,
      reportInfo.description,
      reportInfo.fileUrl,
      reportInfo.tags,
      reportInfo.uploadedBy,
      reportInfo.projectId
    );

    // creates new report with updated info
    const reportUpdateInfo = {
      title: reportInfo.title,
      description: reportInfo.description,
      fileUrl: reportInfo.fileUrl,
      tags: reportInfo.tags,
      uploadedBy: reportInfo.uploadedBy,
      projectId: reportInfo.projectId
    };

    // updates the correct report with the new info
    const reportCollection = await reports();
    const updateInfo = await reportCollection.findOneAndReplace(
      {_id: new ObjectId(id)},
      reportUpdateInfo,
      {returnDocument: 'after'}
    );
    if (!updateInfo)
      throw `Error: Update failed, could not find a report with id of ${id}!`;

    return updateInfo;
  },
  async updateReportPatch(id, reportInfo) {
    // validates the inputs
    id = validation.isValidId(id, 'id');
    if (reportInfo.title)
      reportInfo.title = validation.isValidString(reportInfo.title, 'title');
    if (reportInfo.description)
      reportInfo.description = validation.isValidString(reportInfo.description, 'description');
    if (reportInfo.fileUrl)
      reportInfo.fileUrl = validation.isValidFileUrl(reportInfo.fileUrl, 'fileUrl');
    if (reportInfo.tags)
      reportInfo.tags.forEach(tag => isValidString(tag, `${tag}`));
    if (reportInfo.uploadedBy)
      reportInfo.uploadedBy = validation.isValidId(uploadedBy, 'uploadedBy');
    if (reportInfo.projectId)
      reportInfo.projectId = validation.isValidId(projectId, 'projectId');
    
    // updates the correct report with the new info
    const reportCollection = await reports();
    const updateInfo = await reportCollection.findOneAndUpdate(
      {_id: new ObjectId(id)},
      {$set: reportInfo},
      {returnDocument: 'after'}
    );
    if (!updateInfo)
      throw `Error: Update failed, could not find a report with id of ${id}!`;
    
    return updateInfo;
  }
};

export default exportedMethods;
