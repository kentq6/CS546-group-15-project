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
    id = validation.isValidId(id, 'id');
    const userCollection = await users();
    const user = await userCollection.findOne({_id: new ObjectId(id)});
    if (!user) throw 'Error: User not found!';
    return user;
  },
  async createUser(username, password, role) {
    // validates the inputs
    username = validation.isValidUsername(username);
    password = validation.isValidPassword(password);
    role = validation.isValidString(role, 'role');

    // creates the new user
    let newUser = {
      username,
      password,
      role
    };

    // adds new user to the collection
    const userCollection = await users();
    const newInsertInformation = await userCollection.insertOne(newUser);
    if (!newInsertInformation.insertedId) throw 'Error: User insert failed!';

    return await this.getUserById(newInsertInformation.insertedId.toString());
  },
  async removeUser(id) {
    id = validation.isValidId(id, 'id');
    const userCollection = await users();
    const deletionInfo = await userCollection.findOneAndDelete({
      _id: new ObjectId(id)
    });
    if (!deletionInfo) throw `Error: Could not delete user with id of ${id}!`;

    return {...deletionInfo, deleted: true};
  },
  async updateUserPut(id, userInfo) {
    // validates the inputs
    id = validation.isValidId(id, 'id');
    userInfo = validation.isValidUser(
      userInfo.username,
      userInfo.password,
      userInfo.role
    );

    // creates new user with updated info
    const userUpdateInfo = {
      username: userInfo.username,
      password: userInfo.password,
      role: userInfo.role
    };

    // updates the correct user with the new info
    const userCollection = await users();
    const updateInfo = await userCollection.findOneAndReplace(
      {_id: new ObjectId(id)},
      userUpdateInfo,
      {returnDocument: 'after'}
    );
    if (!updateInfo)
      throw `Error: Update failed, could not find a user with id of ${id}!`;

    return updateInfo;
  },
  async updateUserPatch(id, userInfo) {
    // validates the inputs
    id = validation.isValidId(id, 'id');
    if (userInfo.username)
      userInfo.username = validation.isValidString(userInfo.username, 'username');
    if (userInfo.password)
      userInfo.password = validation.isValidString(userInfo.password, 'password');
    if (userInfo.role)
      userInfo.role = validation.isValidString(userInfo.role, 'role');
    
    // updates the correct user with the new info
    const userCollection = await users();
    const updateInfo = await userCollection.findOneAndUpdate(
      {_id: new ObjectId(id)},
      {$set: userInfo},
      {returnDocument: 'after'}
    );
    if (!updateInfo)
      throw `Error: Update failed, could not find a user with id of ${id}!`;
    
    return updateInfo;
  }
};

export default exportedMethods;
