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
    // validates the inputs
    projectId = validation.isValidId(projectId, 'projectId');
    title = validation.isValidTitle(title, 'title');
    fileUrl = validation.isValidFileUrl(fileUrl, 'fileUrl');
    tags.forEach(tag => validation.isValidString(tag, `${tag}`));
    
    // checks if each input is supplied, then validates each
    if (uploadedBy) await userData.getUserById(uploadedBy);
    
    // creates new blueprint
    const newBlueprint = {
      title,
      fileUrl,
      tags,
      uploadedBy: uploadedBy || null
    };

    // adds blueprint to blueprints collection
    const blueprintCollection = await blueprints();
    const newInsertInformation = await blueprintCollection.insertOne(newBlueprint);
    if (!newInsertInformation.insertedId) throw 'Error: Blueprint insert failed!';

    // updates project document the blueprint belongs to
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
    blueprintId = validation.isValidId(blueprintId, 'blueprintId');
    const blueprintCollection = await blueprints();
    const deletionInfo = await blueprintCollection.findOneAndDelete({
      _id: new ObjectId(blueprintId)
    });
    if (!deletionInfo) throw `Error: Could not delete blueprint with id of ${id}!`;

    // removes blueprint from project it belongs to
    const projectCollection = await projects();
    const updateInfo = await projectCollection.findOneAndUpdate(
      {_id: new ObjectId(projectId)},
      {$pull: {blueprints: new ObjectId(deletionInfo._id)}},
      {returnDocument: 'after'}
    );
    if (!updateInfo) throw `Error: Could not remove blueprint from project with id ${id}!`;

    return {...deletionInfo, deleted: true};
  },
  async updateBlueprintPut(id, blueprintInfo) {
    // validates the inputs
    id = validation.isValidId(id, 'id');
    blueprintInfo = validation.isValidBlueprint(
      blueprintInfo.title,
      blueprintInfo.fileUrl,
      blueprintInfo.tags,
      blueprintInfo.uploadedBy
    );

    // checks if the inputs exist
    if (blueprintInfo.uploadedBy) await userData.getUserById(blueprintInfo.uploadedBy);
    
    // creates new blueprint with updated info
    let blueprintUpdateInfo = {
      title: blueprintInfo.title,
      fileUrl: blueprintInfo.fileUrl,
      tags: blueprintInfo.tags,
      uploadedBy: blueprintInfo.uploadedBy
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
      blueprintInfo.title = validation.isValidTitle(blueprintInfo.title);
    if (blueprintInfo.fileUrl)
      blueprintInfo.fileUrl = validation.isValidFileUrl(blueprintInfo.fileUrl, 'fileUrl');
    if (blueprintInfo.tags)
      blueprintInfo.tags.forEach(tag => isValidString(tag, `${tag}`));

    // checks if each input is supplied, then validates that they exist in DB
    if (blueprintInfo.uploadedBy) await userData.getUserById(blueprintInfo.uploadedBy);

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
