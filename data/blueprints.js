import { blueprints } from '../config/mongoCollections.js';
import userData from './users.js';
import projectData from './projects.js';
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
  async addBlueprint(title, fileUrl, tags, uploadedBy, projectId) {
    // validates the inputs
    title = validation.isValidString(title, 'title');
    fileUrl = validation.isValidFileUrl(fileUrl, 'fileUrl');
    tags.forEach(tag => validation.isValidString(tag, `${tag}`));
    
    // checks if each input is supplied, then validates each
    if (uploadedBy)
      await userData.getUserById(uploadedBy);
    if (projectId)
      await projectData.getProjectById(projectId);
    
    // creates new blueprint
    const updateInfo = {
      title,
      fileUrl,
      tags,
      uploadedBy: uploadedBy || null,
      projectId: projectId || null,
    };

    // adds blueprint to blueprints collection
    const blueprintCollection = await blueprints();
    const newInsertInformation = await blueprintCollection.insertOne(updateInfo);
    const newId = newInsertInformation.insertedId;
    
    return await this.getBlueprintById(newId.toString());
  },
  async removeBlueprint(id) {
    id = validation.isValidId(id, 'id');
    const blueprintCollection = await blueprints();
    const deletionInfo = await blueprintCollection.findOneAndDelete({
      _id: new ObjectId(id)
    });
    if (!deletionInfo) throw `Error: Could not delete blueprint with id of ${id}!`;

    return {...deletionInfo, deleted: true};
  },
  async updateBlueprintPut(id, blueprintInfo) {
    // validates the inputs
    id = validation.isValidId(id, 'id');
    blueprintInfo = validation.isValidBlueprint(
      blueprintInfo.title,
      blueprintInfo.fileUrl,
      blueprintInfo.tags,
      blueprintInfo.uploadedBy,
      blueprintInfo.projectId,
    );

    // checks if the inputs exist
    if (blueprintInfo.uploadedBy)
      await userData.getUserById(blueprintInfo.uploadedBy);
    if (blueprintInfo.projectId)
      await projectData.getProjectById(blueprintInfo.projectId);
    
    // creates new blueprint with updated info
    let blueprintUpdateInfo = {
      title: blueprintInfo.title,
      fileUrl: blueprintInfo.fileUrl,
      tags: blueprintInfo.tags,
      uploadedBy: blueprintInfo.uploadedBy,
      projectId: blueprintInfo.projectId,
    };

    // updates the correct user with the new info
    const blueprintCollection = await blueprints();
    const updateInfo = await blueprintCollection.findOneAndReplace(
      {_id: new ObjectId(id)},
      blueprintUpdateInfo,
      {returnDocument: 'after'}
    );
    if (!updateInfo)
      throw `Error: Update failed! Could not update blueprint with id ${id}!`;

    return updateInfo;
  },
  async updateBlueprintPatch(id, blueprintInfo) {
    // validates the inputs
    id = validation.isValidId(id, 'id');
    if (blueprintInfo.title) 
      blueprintInfo.title = validation.isValidString(blueprintInfo.title, 'title');
    if (blueprintInfo.fileUrl)
      blueprintInfo.fileUrl = validation.isValidFileUrl(blueprintInfo.fileUrl, 'fileUrl');
    if (blueprintInfo.tags)
      blueprintInfo.tags.forEach(tag => isValidString(tag, `${tag}`));

    // checks if each input is supplied, then validates that they exist in DB
    if (blueprintInfo.uploadedBy) await userData.getUserById(blueprintInfo.uploadedBy);
    if (blueprintInfo.projectId) await projectData.getProjectById(blueprintInfo.projectId);

    // updates the correct user with the new info
    const blueprintCollection = await blueprints();
    let updateInfo = await blueprintCollection.findOneAndUpdate(
      {_id: new ObjectId(id)},
      {$set: blueprintInfo},
      {returnDocument: 'after'}
    );
    if (!updateInfo) throw `Could not update the blueprint with id ${id}!`;

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
  }
};

export default exportedMethods;
