import { projects, users } from '../config/mongoCollections.js';
import projectData from '../data/projects.js';
import companyData from './companies.js';
import { ObjectId } from 'mongodb';
import validation from '../validation.js';

let exportedMethods = {
  // retrieves all users from the database
  async getAllUsers() {
    const userCollection = await users();
    return await userCollection.find({}).toArray();
  },

  // retrieves a user by their id
  async getUserById(id) {
    id = validation.isValidId(id, 'id');
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: new ObjectId(id) });
    if (!user) throw 'error: user not found!';
    return user;
  },

  // creates a new user in the database
  // updated this function to ensure it follows the schema database rules
  async createUser(name, username, password, role, projects = [], companyId = null) {
    name = validation.isValidName(name);
    username = validation.isValidUsername(username);
    password = validation.isValidPassword(password);
    role = validation.isValidString(role, 'role');
    // projects = validation.isValidArray(projects); // this will now work even if projects is not provided
    // projects.forEach((projectId) => validation.isValidId(projectId, 'projectId'));

    // ensure companyid is valid and exists if provided
    if (projects !== null) {
        let projectIds = [];
        for (const projectId of projects)
            projectIds.push((await projectData.getProjectById(projectId))._id);
        projects = projectIds;
    }
    if (companyId !== null)
        companyId = (await companyData.getCompanyById(companyId))._id; // ensure the company exists, gets companyId

    // create the new user object
    const newUser = {
        name,
        username,
        password,
        role,
        projects, // default to an empty array if not provided
        companyId, // default to null if not provided
    };

    // add the new user to the collection
    const userCollection = await users();
    const newInsertInformation = await userCollection.insertOne(newUser);
    if (!newInsertInformation.insertedId) throw 'error: user insert failed!';

    return await this.getUserById(newInsertInformation.insertedId.toString());
  },

  // removes a user by their id
  // updated this function to ensure it follows the schema database rules
  async removeUser(id) {
    id = validation.isValidId(id, 'user id');
  
    // remove the user id from any project's members array first
    const projectCollection = await projects();
    const updateResult = await projectCollection.updateOne(
      { members: id }, // match user id as a string
      { $pull: { members: id } } // remove the user id from the members array
    );
    
    if (updateResult.modifiedCount === 0) {
      console.warn(`warning: user with id ${id} was not found in any project's members array.`);
    }
  
    // now delete the user from the users collection
    const userCollection = await users();
    const deletionInfo = await userCollection.findOneAndDelete({
      _id: new ObjectId(id),
    });

    if (!deletionInfo) {
      throw new Error(`error: could not delete user with id ${id}!`);
    }

    return { ...deletionInfo, deleted: true };
  },

  // updates a user completely (put) by their id
  // updated this function to ensure it follows the schema database rules
  async updateUserPut(id, updatedUser) {
    const userCollection = await users();
    const updateInfo = await userCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedUser }
    );

    if (updateInfo.modifiedCount === 0) {
      throw 'Error: Could not update user!';
    }

    return await this.getUserById(id);
  },

  // updates a user partially (patch) by their id
  // updated this function to ensure it follows the schema database rules
  async updateUserPatch(id, userInfo) {
    // validate inputs
    id = validation.isValidId(id, 'id');
    if (userInfo.name)
      userInfo.name = validation.isValidName(userInfo.name);
    if (userInfo.username)
      userInfo.username = validation.isValidUsername(userInfo.username);
    if (userInfo.password)
      userInfo.password = validation.isValidPassword(userInfo.password);
    if (userInfo.role)
      userInfo.role = validation.isValidString(userInfo.role, 'role');
    if (userInfo.projects) {
      userInfo.projects = validation.isValidArray(userInfo.projects);
      userInfo.projects.forEach((projectId) =>
        validation.isValidId(projectId, 'projectId')
      );
    }
    if (userInfo.companyId)
      userInfo.companyId = validation.isValidId(userInfo.companyId, 'companyId');

    // ensure all projects exist if projects are being updated
    if (userInfo.projects) {
      let projectIds = [];
      for (const projectId of userInfo.projects)
        projectIds.push((await projectData.getProjectById(projectId))._id);
      userInfo.projects = projectIds;
    }

    // ensure the company exists if companyid is being updated
    if (userInfo.companyId)
      userInfo.companyId = (await companyData.getCompanyById(userInfo.companyId))._id;

    // update the user in the collection
    const userCollection = await users();
    const updateInfo = await userCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: userInfo },
      { returnDocument: 'after' }
    );
    if (!updateInfo)
      throw `error: update failed, could not find a user with id of ${id}!`;

    return updateInfo;
  },
};

export default exportedMethods;
