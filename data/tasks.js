import { tasks } from '../config/mongoCollections.js';
import userData from './users.js';
import projectData from './projects.js';
import { ObjectId } from 'mongodb';
import validation from '../validation.js';

const exportedMethods = {
  async getAllTasks() {
    const taskCollection = await tasks();
    return await taskCollection.find({}).toArray();
  },
  async getTaskById(id) {
    id = validation.isValidId(id);
    const taskCollection = await tasks();
    const task = await taskCollection.findOne({_id: new ObjectId(id)});
    if (!task) throw 'Error: Task not found!';
    return task;
  },
  async addTask(title, description, cost, status, assignedTo, projectId) {
    // validates the inputs
    title = validation.isValidString(title);
    description = validation.isValidString(description);
    cost = validation.isValidNumber(cost);
    status = validation.isValidString(status);
    if (assignedTo) await userData.getUserById(assignedTo);
    if (projectId) await projectData.getProjectById(projectId);
    
    // creates new task
    const newTask = {
      title,
      description,
      cost,
      status,
      assignedTo: assignedTo || null,
      projectId: projectId || null
    };
    
    // adds task to tasks collection
    const taskCollection = await tasks();
    const newInsertInformation = await taskCollection.insertOne(newTask);
    const newId = newInsertInformation.insertedId;
    return await this.getTaskById(newId.toString());
  },
  async removeTask(id) {
    id = validation.isValidId(id);
    const taskCollection = await tasks();
    const deletionInfo = await taskCollection.findOneAndDelete({
      _id: new ObjectId(id)
    });
    if (!deletionInfo) throw `Error: Could not delete task with id of ${id}!`;
    return {...deletionInfo, deleted: true};
  },
  async updateTaskPut(id, taskInfo) {
    // validates the inputs
    id = validation.isValidId(id);
    taskInfo = validation.isValidTask(
      taskInfo.title,
      taskInfo.description,
      taskInfo.cost,
      taskInfo.status,
      taskInfo.assignedTo,
      taskInfo.projectId
    );
    
    // checks if the inputs exist
    if (taskInfo.assignedTo)
      await userData.getUserById(taskInfo.assignedTo);
    if (taskInfo.projectId)
      await projectData.getProjectById(taskInfo.projectId);
    
    // creates new task with updated info
    let taskUpdateInfo = {
      title: taskInfo.title,
      description: taskInfo.description,
      cost: taskInfo.cost,
      status: taskInfo.status,
      assignedTo: taskInfo.assignedTo,
      projectId: taskInfo.projectId,
    };
    
    // updates the correct task with the new info
    const taskCollection = await tasks();
    const updateInfo = await taskCollection.findOneAndReplace(
      {_id: new ObjectId(id)},
      taskUpdateInfo,
      {returnDocument: 'after'}
    );
    if (!updateInfo)
      throw `Error: Update failed! Could not update task with id ${id}!`;
    
    return updateInfo;
  },
  async updateTaskPatch(id, taskInfo) {
    // validates the inputs
    id = validation.isValidId(id);
    if (taskInfo.title) 
      taskInfo.title = validation.isValidString(taskInfo.title);
    if (taskInfo.description)
      taskInfo.description = validation.isValidString(taskInfo.description);
    if (taskInfo.cost)
      taskInfo.cost = validation.isValidNumber(taskInfo.cost);
    if (taskInfo.status)
      taskInfo.status = validation.isValidString(taskInfo.status);
    
    // checks if each input is supplied, then validates each
    if (taskInfo.assignedTo)
      await userData.getUserById(taskInfo.assignedTo);
    if (taskInfo.projectId)
      await projectData.getProjectById(taskInfo.projectId);
    
    // updates the correct task with the new info
    const taskCollection = await tasks();
    let updateInfo = await taskCollection.findOneAndUpdate(
      {_id: new ObjectId(id)},
      {$set: taskInfo},
      {returnDocument: 'after'}
    );
    if (!updateInfo) throw `Error: Could not update the task with id ${id}!`;

    return updateInfo;
  }
};

export default exportedMethods;
