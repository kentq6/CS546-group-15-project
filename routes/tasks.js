import taskData from '../data/tasks.js';
import projectData from '../data/projects.js';
import validation from '../validation.js';
import {Router} from 'express';
const router = Router();

// this gets all the tasks
router
  .route('/')
  .get(async (req, res) => {
    try {
      const tasks = await taskData.getAllTasks();
      return res.json(tasks);
    } catch (e) {
      return res.status(500).json({ error: e });
    }
  })



  // this creates a new task
  .post(async (req, res) => {
    const { projectId, name, description, assignedTo, cost, status } = req.body;

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'There are no fields in the request body' });
    }

    try {
      const v_projectId = validation.isValidId(projectId, 'project id');
      const project = await projectData.getProjectById(v_projectId);
      if (!project) {
        throw `Error: Project with id ${v_projectId} does not exist!`;
      }

      const v_name = validation.isValidString(name, 'name');
      const v_description = validation.isValidString(description, 'description');
      const v_assignedTo = validation.isValidId(assignedTo, 'assigned to');
      const v_cost = validation.isValidNumber(cost, 'cost');
      const v_status = validation.isValidStatus(status, ['Pending', 'In Progress', 'Completed']);

      const newTask = await taskData.createTask(
        v_projectId,
        v_name,
        v_description,
        v_cost,
        v_status,
        v_assignedTo
      );
      
      return res.status(201).json(newTask);
    } catch (e) {
      return res.status(400).json({ error: e });
    }
  });



// this gets a task by its id
router
  .route('/:id')
  .get(async (req, res) => {
    try {
      const id = validation.isValidId(req.params.id, 'task id');
      const task = await taskData.getTaskById(id);
      return res.json(task);
    } catch (e) {
      return res.status(404).json({ error: e });
    }
  })



  // this updates a task completely
  .put(async (req, res) => {
    const { title, description, assignedTo, cost, status, projectId } = req.body;
  
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'There are no fields in the request body' });
    }
  
    try {
      const id = validation.isValidId(req.params.id, 'task id');
      const validatedTask = validation.isValidTask(
        title,
        description,
        assignedTo,
        cost,
        status,
        projectId
      );
  
      const updatedTask = await taskData.updateTaskPut(id, validatedTask);
      return res.json(updatedTask);
    } catch (e) {
      return res.status(400).json({ error: e.message || e });
    }
  })  



  // this updates a task partially
  .patch(async (req, res) => {
    const taskInfo = req.body;

    if (!taskInfo || Object.keys(taskInfo).length === 0) {
      return res.status(400).json({ error: 'There are no fields in the request body' });
    }

    try {
      const id = validation.isValidId(req.params.id, 'task id');

      if (taskInfo.name) {
        taskInfo.name = validation.isValidString(taskInfo.name, 'name');
      }
      if (taskInfo.description) {
        taskInfo.description = validation.isValidString(taskInfo.description, 'description');
      }
      if (taskInfo.assignedTo) {
        taskInfo.assignedTo = validation.isValidId(taskInfo.assignedTo, 'assigned to');
      }
      if (taskInfo.cost) {
        taskInfo.cost = validation.isValidNumber(taskInfo.cost, 'cost');
      }
      if (taskInfo.status) {
        taskInfo.status = validation.isValidStatus(taskInfo.status, ['Pending', 'In Progress', 'Completed']);
      }
      if (taskInfo.projectId) {
        taskInfo.projectId = validation.isValidId(taskInfo.projectId, 'project id');
      }

      const updatedTask = await taskData.updateTaskPatch(id, taskInfo);
      return res.json(updatedTask);
    } catch (e) {
      return res.status(400).json({ error: e });
    }
  })



  // this deletes a task by its id
  .delete(async (req, res) => {
    try {
      const taskId = validation.isValidId(req.params.id, 'task id');
      const deletionResult = await taskData.removeTask(taskId);
      return res.json(deletionResult);
    } catch (e) {
      return res.status(400).json({ error: e.message || e });
    }
  });



export default router;