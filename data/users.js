import { users } from '../config/mongoCollections.js';
import projectData from './projects.js';
import companyData from './companies.js';
import { ObjectId } from 'mongodb';
import validation from '../validation.js';

let exportedMethods = {
  async getAllUsers() {
    const userCollection = await users();
    return await userCollection.find({}).toArray();
  },
  async getUserById(id) {
    id = validation.isValidId(id);
    const userCollection = await users();
    const user = await userCollection.findOne({_id: new ObjectId(id)});
    if (!user) throw 'Error: User not found';
    return user;
  },
  async addUser(username, password, role, projects, companyId) {
    // validates the inputs
    username = validation.isValidString(username);
    password = validation.isValidString(password);
    role = validation.isValidString(role);
    // checks if the inputs exists, then validates them
    if (projects) {
      projects = validation.isValidStringArray(projects);
      for (const project of projects) await projectData.getProjectById(project);
    }
    if (companyId) {
      companyId = validation.isValidId(companyId);
      await companyData.getCompanyById(companyId);
    }

    let newUser = {
      username,
      password,
      role,
      projects: projects || [],
      companyId: companyId || null
    };

    const userCollection = await users();
    const newInsertInformation = await userCollection.insertOne(newUser);
    if (!newInsertInformation.insertedId) throw 'Error: Insert failed!';

    return await this.getUserById(newInsertInformation.insertedId.toString());
  },
  async removeUser(id) {
    id = validation.isValidId(id);
    const userCollection = await users();
    const deletionInfo = await userCollection.findOneAndDelete({
      _id: new ObjectId(id)
    });
    if (!deletionInfo) throw `Error: Could not delete user with id of ${id}`;

    return {...deletionInfo, deleted: true};
  },
  async updateUserPut(id, username, password, role, projects, companyId) {
    id = validation.isValidId(id);
    [username, password, role, projects, companyId] = validation.isValidUser(
      username,
      password,
      role,
      projects,
      companyId
    );

    const userUpdateInfo = {
      username,
      password,
      role,
      projects,
      companyId
    };
    
    const userCollection = await users();
    const updateInfo = await userCollection.findOneAndReplace(
      {_id: new ObjectId(id)},
      userUpdateInfo,
      {returnDocument: 'after'}
    );
    if (!updateInfo)
      throw `Error: Update failed, could not find a user with id of ${id}`;

    return updateInfo;
  },
  async updateUserPatch(id, userInfo) {
    // validates the inputs
    id = validation.isValidId(id);
    if (userInfo.username)
      userInfo.username = validation.isValidString(userInfo.username, 'username');
    if (userInfo.password)
      userInfo.password = validation.isValidString(userInfo.password, 'password');
    if (userInfo.role)
      userInfo.role = validation.isValidString(userInfo.role, 'role');
    if (userInfo.projects) {
      userInfo.projects = validation.isValidStringArray(userInfo.projects);
      userInfo.projects.forEach(project => isValidId(project));
    }
    if (userInfo.companyId) {
      userInfo.companyId = validation.isValidString(userInfo.companyId, 'companyId');
      userInfo.companyId = validation.isValidId(companyId);
    }
    // updates the correct user with the new info
    const userCollection = await users();
    const updateInfo = await userCollection.findOneAndUpdate(
      {_id: new ObjectId(id)},
      {$set: userInfo},
      {returnDocument: 'after'}
    );
    if (!updateInfo)
      throw `Error: Update failed, could not find a user with id of ${id}`;
    
    return updateInfo;
  }
};

export default exportedMethods;
