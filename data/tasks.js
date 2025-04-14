import { tasks, projects } from '../config/mongoCollections.js';
import userData from './users.js';
import { ObjectId } from 'mongodb';
import validation from '../validation.js';

const exportedMethods = {
  // gets all tasks from the database
  async getAllTasks() {
    const taskCollection = await tasks();
    return await taskCollection.find({}).toArray();
  },



  // gets a task by its id
  async getTaskById(id) {
    id = validation.isValidId(id, 'id');
    const taskCollection = await tasks();
    const task = await taskCollection.findOne({ _id: new ObjectId(id) });
    if (!task) throw 'Error: Task not found!';
    return task;
  },



  // creates a new task and associates it with a project
  async createTask(projectId, title, description, cost, status, assignedTo) {
    // validates the inputs
    projectId = validation.isValidId(projectId, 'projectId');
    title = validation.isValidTitle(title, 'title');
    description = validation.isValidString(description, 'description');
    cost = validation.isValidNumber(cost, 'cost');
    status = validation.isValidStatus(status, ['Pending', 'In Progress', 'Completed']);

    // checks if the assigned user exists
    if (assignedTo) assignedTo = (await userData.getUserById(assignedTo))._id;

    // creates new task object
    const newTask = {
      title,
      description,
      cost,
      status,
      assignedTo: assignedTo || null,
      projectId: new ObjectId(projectId), // updated to follow schema rules
    };

    // adds task to tasks collection
    const taskCollection = await tasks();
    const newInsertInformation = await taskCollection.insertOne(newTask);
    if (!newInsertInformation.insertedId) throw 'Error: Task insert failed!';

    // updates project document the task belongs to
    const projectCollection = await projects();
    const updateInfo = await projectCollection.findOneAndUpdate(
      { _id: new ObjectId(projectId) },
      { $push: { tasks: newInsertInformation.insertedId } },
      { returnDocument: 'after' }
    );
    if (!updateInfo) throw `Error: Could not update project with id ${projectId} with new task!`;

    return await this.getTaskById(newInsertInformation.insertedId.toString());
  },



  // updated to follow schema rules & work properly
  // removes a task by its id and updates the associated project
  async removeTask(id) {
    id = validation.isValidId(id, 'task id');

    // removes the task id from any project's tasks array
    const projectCollection = await projects();
    const updateResult = await projectCollection.updateOne(
      { tasks: new ObjectId(id) },
      { $pull: { tasks: new ObjectId(id) } }
    );

    if (updateResult.modifiedCount === 0) {
      console.warn(`Warning: Task with id ${id} was not found in any project's tasks array.`);
    }

    // deletes the task from the tasks collection
    const taskCollection = await tasks();
    const deletionInfo = await taskCollection.findOneAndDelete({
      _id: new ObjectId(id),
    });

    if (!deletionInfo) {
      throw new Error(`Error: Could not delete task with id ${id}!`);
    }

    return { ...deletionInfo, deleted: true };
  },


  // updated to follow schema rules & work properly
  // updates a task completely (put method)
  async updateTaskPut(id, taskInfo) {
    // validates input
    id = validation.isValidId(id, 'id');
    taskInfo = validation.isValidTask(taskInfo);
    // creates the updated task object
    let taskUpdateInfo = {
      title: taskInfo.title,
      description: taskInfo.description,
      cost: taskInfo.cost,
      status: taskInfo.status,
      assignedTo: taskInfo.assignedTo,
      // projectId: new ObjectId(taskInfo.projectId), 
    };

    // updates the task in the database
    const taskCollection = await tasks();
    const updateInfo = await taskCollection.findOneAndReplace(
      { _id: new ObjectId(id) },
      taskUpdateInfo,
      { returnDocument: 'after' }
    );

    if (!updateInfo) {
      throw `Error: Update failed! Could not update task with id ${id}!`;
    }

    return updateInfo; // returns the updated task
  },




  // updated to follow schema rules & work properly
  // updates a task partially (patch method)
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

    // checks if the assigned user exists
    if (taskInfo.assignedTo) await userData.getUserById(taskInfo.assignedTo);

    // updates the task with the new info
    const taskCollection = await tasks();
    let updateInfo = await taskCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: taskInfo },
      { returnDocument: 'after' }
    );
    if (!updateInfo) throw `Error: Could not update the task with id ${id}!`;

    return updateInfo;
  },




  // updated to follow schema rules & work properly
  // gets tasks assigned to a specific manager within a company
  async getTasksByManagerAndCompany(managerId, companyId) {
    managerId = validation.isValidId(managerId, 'manager id');
    companyId = validation.isValidId(companyId, 'company id');
    const taskCollection = await tasks();
    const assignedTasks = await taskCollection.find({
      assignedTo: managerId,
      companyId: new ObjectId(companyId), // updated to follow schema rules
    }).toArray();
    if (!assignedTasks || assignedTasks.length === 0) throw `Error: No tasks found for manager with id ${managerId} in company ${companyId}`;
    return assignedTasks;
  },




  // updated to follow schema rules & work properly
  // gets tasks assigned to a specific field engineer within a company
  async getTasksByEngineerAndCompany(engineerId, companyId) {
    engineerId = validation.isValidId(engineerId, 'engineer id');
    companyId = validation.isValidId(companyId, 'company id');
    const taskCollection = await tasks();
    const assignedTasks = await taskCollection.find({
      assignedTo: engineerId,
      companyId: new ObjectId(companyId), // updated to follow schema rules
    }).toArray();
    if (!assignedTasks || assignedTasks.length === 0) throw `Error: No tasks found for engineer with id ${engineerId} in company ${companyId}`;
    return assignedTasks;
  },


  

  // updated to follow schema rules & work properly
  // gets all tasks for a specific company
  async getTasksByCompanyID(companyId) {
    companyId = validation.isValidId(companyId, 'company id');
    const taskCollection = await tasks();
    const companyTasks = await taskCollection.find({ companyId: new ObjectId(companyId) }).toArray();
    if (!companyTasks || companyTasks.length === 0) throw `Error: No tasks found for company with id ${companyId}`;
    return companyTasks;
  }
};

export default exportedMethods;
