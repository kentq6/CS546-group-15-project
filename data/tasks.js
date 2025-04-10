import { tasks, projects } from '../config/mongoCollections.js';
import userData from './users.js';
import { ObjectId } from 'mongodb';
import validation from '../validation.js';

const exportedMethods = {
  async getAllTasks() {
    const taskCollection = await tasks();
    return await taskCollection.find({}).toArray();
  },
  async getTaskById(id) {
    id = validation.isValidId(id, 'id');
    const taskCollection = await tasks();
    const task = await taskCollection.findOne({_id: new ObjectId(id)});
    if (!task) throw 'Error: Task not found!';
    return task;
  },
  async createTask(projectId, title, description, cost, status, assignedTo) {
    // validates the inputs
    projectId = validation.isValidId(projectId, 'projectId');
    title = validation.isValidTitle(title, 'title');
    description = validation.isValidString(description, 'description');
    cost = validation.isValidNumber(cost, 'cost');
    status = validation.isValidStatus(status, ['Pending', 'In Progress', 'Completed']);

    // checks if the inputs exists, then validates them
    if (assignedTo) await userData.getUserById(assignedTo);
    
    // creates new task
    const newTask = {
      title,
      description,
      cost,
      status,
      assignedTo: assignedTo || null
    };
    
    // adds task to tasks collection
    const taskCollection = await tasks();
    const newInsertInformation = await taskCollection.insertOne(newTask);
    if (!newInsertInformation.insertedId) throw 'Error: Task insert failed!';

    // updates project document the task belongs to
    const projectCollection = await projects();
    const updateInfo = await projectCollection.findOneAndUpdate(
      {_id: new ObjectId(projectId)},
      {$push: {tasks: newInsertInformation.insertedId}},
      {returnDocument: 'after'}
    );
    if (!updateInfo) throw `Error: Could not update project with id ${projectId} with new task!`;
    
    return await this.getTaskById(newInsertInformation.insertedId.toString());
  },
  async removeTask(projectId, taskId) {
    projectId = validation.isValidId(projectId, 'projectId');
    taskId = validation.isValidId(taskId, 'taskId');
    const taskCollection = await tasks();
    const deletionInfo = await taskCollection.findOneAndDelete({
      _id: new ObjectId(taskId)
    });
    if (!deletionInfo) throw `Error: Could not delete task with id of ${taskId}!`;

    // removes task from project it belongs to
    const projectCollection = await projects();
    const updateInfo = await projectCollection.findOneAndUpdate(
      {_id: new ObjectId(projectId)},
      {$pull: {tasks: new ObjectId(deletionInfo._id)}},
      {returnDocument: 'after'}
    );
    if (!updateInfo) throw `Error: Could not remove task from project with id ${id}!`;
    
    return {...deletionInfo, deleted: true};
  },
  async updateTaskPut(id, taskInfo) {
    // initializes update tag(s)
    let updateProject = false;

    // validates the inputs
    id = validation.isValidId(id, 'id');
    taskInfo = validation.isValidTask(
      taskInfo.title,
      taskInfo.description,
      taskInfo.cost,
      taskInfo.status,
      taskInfo.assignedTo
    );
    
    // checks if the inputs exist
    if (taskInfo.assignedTo) await userData.getUserById(taskInfo.assignedTo);
    
    // creates new task with updated info
    let taskUpdateInfo = {
      title: taskInfo.title,
      description: taskInfo.description,
      cost: taskInfo.cost,
      status: taskInfo.status,
      assignedTo: taskInfo.assignedTo
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
    id = validation.isValidId(id, 'id');
    if (taskInfo.title) 
      taskInfo.title = validation.isValidTitle(taskInfo.title);
    if (taskInfo.description)
      taskInfo.description = validation.isValidString(taskInfo.description, 'description');
    if (taskInfo.cost)
      taskInfo.cost = validation.isValidNumber(taskInfo.cost, 'cost');
    if (taskInfo.status)
      taskInfo.status = validation.isValidStatus(taskInfo.status, ['Pending', 'In Progress', 'Completed']);
    
    // checks if each input is supplied, then validates that they exist in DB
    if (taskInfo.assignedTo) await userData.getUserById(taskInfo.assignedTo);
    
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
