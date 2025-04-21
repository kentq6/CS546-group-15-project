import { blueprints, projects } from '../config/mongoCollections.js';
import userData from './users.js';
import { ObjectId } from 'mongodb';
import validation from '../validation.js';

const exportedMethods = {
  async getAllBlueprints() {
    const blueprintCollection = await blueprints();
    return await blueprintCollection.find({}).toArray();
  },
  async getBlueprintById(id) {
    id = validation.isValidId(id, 'id');
    const blueprintCollection = await blueprints();
    const blueprint = await blueprintCollection.findOne({_id: new ObjectId(id)});
    if (!blueprint) throw 'Error: Blueprint not found!';
    return blueprint;
  },
  async getBlueprintsByTag(tag) {
    tag = validation.isValidString(tag, 'tag');
    const blueprintCollection = await blueprints();
    return await blueprintCollection.find({tags: tag}).toArray();
  },
  async createBlueprint(projectId, title, fileUrl, tags, uploadedBy) {
    projectId = validation.isValidId(projectId, 'projectId');
    title = validation.isValidTitle(title, 'title');
    fileUrl = validation.isValidFileUrl(fileUrl, 'fileUrl');
    tags.forEach(tag => validation.isValidString(tag, `${tag}`));
    if (uploadedBy) uploadedBy = (await userData.getUserById(uploadedBy))._id;
    const newBlueprint = {
      title,
      fileUrl,
      tags,
      uploadedBy: uploadedBy || null
    };
    const blueprintCollection = await blueprints();
    const newInsertInformation = await blueprintCollection.insertOne(newBlueprint);
    if (!newInsertInformation.insertedId) throw 'Error: Blueprint insert failed!';
    const projectCollection = await projects();
    const updateInfo = await projectCollection.findOneAndUpdate(
      {_id: new ObjectId(projectId)},
      {$push: {blueprints: newInsertInformation.insertedId}},
      {returnDocument: 'after'}
    );
    if (!updateInfo) throw `Error: Could not update project with id ${projectId} with new blueprint!`;
    return await this.getBlueprintById(newInsertInformation.insertedId.toString());
  },
  async removeBlueprint(projectId, blueprintId) {
    projectId = validation.isValidId(projectId, 'projectId');
    blueprintId = validation.isValidId(blueprintId, 'blueprintId');
    const blueprintCollection = await blueprints();
    const blueprint = await blueprintCollection.findOne({ _id: new ObjectId(blueprintId) });
    if (!blueprint) throw `Error: Blueprint with id ${blueprintId} does not exist!`;
    const projectCollection = await projects();
    const project = await projectCollection.findOne({ _id: new ObjectId(projectId) });
    if (!project) throw `Error: Project with id ${projectId} does not exist!`;
    const updateInfo = await projectCollection.findOneAndUpdate(
      { _id: new ObjectId(projectId) },
      { $pull: { blueprints: new ObjectId(blueprintId) } },
      { returnDocument: 'after' }
    );
    if (!updateInfo) throw `Error: Could not remove blueprint from project with id ${projectId}!`;
    const deletionInfo = await blueprintCollection.findOneAndDelete({
      _id: new ObjectId(blueprintId),
    });
    if (!deletionInfo) throw `Error: Could not delete blueprint with id of ${blueprintId}!`;
    return { ...deletionInfo, deleted: true };
  },
  async updateBlueprintPut(id, blueprintInfo) {
    try {
      console.log('Blueprint Info Before Validation:', blueprintInfo);
      id = validation.isValidId(id, 'id');
      blueprintInfo = validation.isValidBlueprint(
        blueprintInfo.title,
        blueprintInfo.fileUrl,
        blueprintInfo.tags,
        blueprintInfo.uploadedBy
      );
      console.log('Validated Blueprint Info:', blueprintInfo);
      if (blueprintInfo.uploadedBy) {
        console.log('Uploaded By:', blueprintInfo.uploadedBy);
        blueprintInfo.uploadedBy = (await userData.getUserById(blueprintInfo.uploadedBy))._id;
      }
      let blueprintUpdateInfo = {
        title: blueprintInfo.title,
        fileUrl: blueprintInfo.fileUrl,
        tags: blueprintInfo.tags,
        uploadedBy: blueprintInfo.uploadedBy
      };
      console.log('Blueprint Update Info:', blueprintUpdateInfo);
      const blueprintCollection = await blueprints();
      const updateInfo = await blueprintCollection.findOneAndReplace(
        { _id: new ObjectId(id) },
        blueprintUpdateInfo,
        { returnDocument: 'after' }
      );
      console.log('Update Info:', updateInfo);
      if (!updateInfo)
        throw `Error: Update failed! Could not update blueprint with id ${id}!`;
      return updateInfo;
    } catch (e) {
      console.error('Error in updateBlueprintPut:', e);
      throw e;
    }
  },
  async updateBlueprintPatch(id, blueprintInfo) {
    id = validation.isValidId(id, 'id');
    if (blueprintInfo.title) 
      blueprintInfo.title = validation.isValidTitle(blueprintInfo.title);
    if (blueprintInfo.fileUrl)
      blueprintInfo.fileUrl = validation.isValidFileUrl(blueprintInfo.fileUrl, 'fileUrl');
    if (blueprintInfo.tags)
      blueprintInfo.tags.forEach(tag => isValidString(tag, `${tag}`));
    if (blueprintInfo.uploadedBy) blueprintInfo.uploadedBy = (await userData.getUserById(blueprintInfo.uploadedBy))._id;
    const blueprintCollection = await blueprints();
    let updateInfo = await blueprintCollection.findOneAndUpdate(
      {_id: new ObjectId(id)},
      {$set: blueprintInfo},
      {returnDocument: 'after'}
    );
    if (!updateInfo) throw `Error: Could not update the blueprint with id ${id}!`;
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
    const blueprintCollection = await blueprints();
    let updateOne = await blueprintCollection.updateMany(findDocuments, firstUpdate);
    if (updateOne.matchedCount === 0)
      throw `Error: Could not find any blueprints with old tag: ${oldTag}!`;
    let updateTwo = await blueprintCollection.updateMany(
      findDocuments,
      secondUpdate
    );
    if (updateTwo.modifiedCount === 0) throw [500, 'Error: Could not update tags!'];
    return await this.getBlueprintsByTag(newTag);
  },
  async getBlueprintByCompanyID(companyId) {
    companyId = validation.isValidId(companyId, 'companyId');
    const blueprintCollection = await blueprints();
    const companyBlueprints = await blueprintCollection.find({ companyId: new ObjectId(companyId) }).toArray();
    return companyBlueprints;
  },
  async getBlueprintByProjectID(projectId) {
    projectId = validation.isValidId(projectId, 'projectId');
    const blueprintCollection = await blueprints();
    const projectBlueprints = await blueprintCollection.find({ projectId: new ObjectId(projectId) }).toArray();
    return projectBlueprints;
  }
};

export default exportedMethods;
