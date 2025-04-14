import { reports, projects } from '../config/mongoCollections.js';
import userData from './users.js';
import { ObjectId } from 'mongodb';
import validation from '../validation.js';


  // updated to follow schema rules & work properly

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



  async getReportsByTag(tag) {
    tag = validation.isValidString(tag, 'tag');
    const reportCollection = await reports();
    return await reportCollection.find({tags: tag}).toArray();
  },



  async createReport(projectId, title, description, fileUrl, tags, uploadedBy) {
    // validates the inputs
    projectId = validation.isValidId(projectId, 'projectId');
    title = validation.isValidTitle(title, 'title');
    description = validation.isValidString(description, 'description');
    fileUrl = validation.isValidFileUrl(fileUrl, 'fileUrl');
    tags.forEach(tag => validation.isValidString(tag, `${tag}`));

    // checks if the inputs exists, then validates them
    if (uploadedBy) uploadedBy = (await userData.getUserById(uploadedBy))._id;

    // creates the new report with issues subdocument
    let newReport = {
      title,
      description,
      fileUrl,
      tags,
      uploadedBy,
      issues: []
    };

    // adds new report to the collection
    const reportCollection = await reports();
    const newInsertInformation = await reportCollection.insertOne(newReport);
    if (!newInsertInformation.insertedId) throw 'Error: Report insert failed!';

    // updates project document the report belongs to
    const projectCollection = await projects();
    const updateInfo = await projectCollection.findOneAndUpdate(
      {_id: new ObjectId(projectId)},
      {$push: {reports: newInsertInformation.insertedId}},
      {returnDocument: 'after'}
    );
    if (!updateInfo) throw `Error: Could not update project with id ${projectId} with new report!`;

    return await this.getReportById(newInsertInformation.insertedId.toString());
  },



  async removeReport(id) {
    id = validation.isValidId(id, 'user id');
  
    // Remove the rep ID from any project's tasks array first
    const projectCollection = await projects();
    const updateResult = await projectCollection.updateOne(
      { reports: new ObjectId(id) }, // Match user ID as a string
      { $pull: { reports: new ObjectId(id) } } // Remove the user ID from the members array
    );
  
    if (updateResult.modifiedCount === 0) {
      console.warn(`Warning: Task with id ${id} was not found in any project's tasks array.`);
    }
  
    // Now delete the task from the tasks collection bruh
    const reportCollection = await reports();
    const deletionInfo = await reportCollection.findOneAndDelete({
      _id: new ObjectId(id),
    });

    if (!deletionInfo) {
      throw new Error(`Error: Could not delete user with id ${id}!`);
    }

    return { ...deletionInfo, deleted: true };
  },



  async updateReportPut(id, reportInfo) {
    // validates the inputs
    id = validation.isValidId(id, 'id');
    reportInfo = validation.isValidReportForPutRQ(
      reportInfo.title,
      reportInfo.description,
      reportInfo.fileUrl,
      reportInfo.tags,
      reportInfo.uploadedBy
    );

    reportInfo.uploadedBy = (await userData.getUserById(reportInfo.uploadedBy))._id;

    // creates new report with updated info
    const reportUpdateInfo = {
      title: reportInfo.title,
      description: reportInfo.description,
      fileUrl: reportInfo.fileUrl,
      tags: reportInfo.tags,
      uploadedBy: reportInfo.uploadedBy
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
      reportInfo.title = validation.isValidTitle(reportInfo.title);
    if (reportInfo.description)
      reportInfo.description = validation.isValidString(reportInfo.description, 'description');
    if (reportInfo.fileUrl)
      reportInfo.fileUrl = validation.isValidFileUrl(reportInfo.fileUrl, 'fileUrl');
    if (reportInfo.tags)
      reportInfo.tags.forEach(tag => isValidString(tag, `${tag}`));

    // checks if each input is supplied, then validates that they exist in DB
    if (reportInfo.uploadedBy) reportInfo.uploadedBy = (await userData.getUserById(reportInfo.uploadedBy))._id;
    
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
  },



  async renameTag(oldTag, newTag) {
    oldTag = validation.isValidString(oldTag, 'Old Tag');
    newTag = validation.isValidString(newTag, 'New Tag');
    if (oldTag === newTag) throw 'Error: tags are the same!';

    let findDocuments = {
      tags: oldTag
    };

    let firstUpdate = {
      $addToSet: {tags: newTag}
    };

    let secondUpdate = {
      $pull: {tags: oldTag}
    };
    const reportCollection = await reports();
    let updateOne = await reportCollection.updateMany(findDocuments, firstUpdate);
    if (updateOne.matchedCount === 0)
      throw `Error: Could not find any reports with old tag: ${oldTag}!`;
    let updateTwo = await reportCollection.updateMany(
      findDocuments,
      secondUpdate
    );
    if (updateTwo.modifiedCount === 0) throw [500, 'Error: Could not update tags!'];
    return await this.getReportsByTag(newTag);
  },


  async getReportsByCompany(companyId) {
    companyId = validation.isValidId(companyId, 'company id');
    const reportCollection = await reports();
    const companyReports = await reportCollection.find({ companyId: new ObjectId(companyId) }).toArray();
    if (!companyReports || companyReports.length === 0) throw `Error: No reports found for company with id ${companyId}`;
    return companyReports;
  }
};

export default exportedMethods;
