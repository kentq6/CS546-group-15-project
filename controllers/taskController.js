import { NotFoundError, PermissionError, ValidationError } from "../error/error.js";
import { attatchDocToReqByIdCheckProjectId, getNonRequiredFields, getRequiredFieldsOrThrow, isUserAFieldManager, isUserAnEngineer, isUserAnOwner, isUserAProjectMember } from "../helpers.js";
import { Task, User } from "../model/model.js";

export const attatchTaskToReq = attatchDocToReqByIdCheckProjectId(Task)

/**
 * Gets all all tasks based on a users role. 
 * If a user is an engineer, they get all tasks assigned to them 
 * based on the project in the request.
 * If a user is an Owner or Field Manager, get all tasks based on the project in the request.
 * 
 * Assumes project and user have already been attatched in the request
 */
export async function getTasksHandler (req, res, next) {
    try {
        if (isUserAnEngineer(req.user)) {
            const tasks = await Task.find({
                project: req.project._id,
                assignedTo: req.user._id
            })
            return res.status(200).json(tasks)
        } else if (isUserAFieldManager(req.user) || isUserAnOwner(req.user)) {
            const tasks = await Task.find({ project:req.project._id })
            return res.status(200).json(tasks)
        } else {
            throw new ValidationError('Requesting user has an unexpected role')
        }
    } catch(err) {
        next(err)
    }
}

/**
 * Creates a task based on the fields in the request body
 * 
 * Assumes project has already been attatched to the request
 */
export async function createTaskHandler (req, res, next) {
    try {
        const taskRequiredFieldNames =
            [ 'title'
            , 'description'
            , 'cost'
            , 'assignedTo'
            ]
        const taskRequiredFields = getRequiredFieldsOrThrow(taskRequiredFieldNames, req.body)
        const taskFields = {
            ...taskRequiredFields, 
            project: req.project._id
        }
        const task = new Task(taskFields)
        await task.validate()
        
        
        const userTaskIsAssignedTo = await User.findById(task.assignedTo)
        if (!userTaskIsAssignedTo) {
            throw new NotFoundError('User task is assigned to not found')
        }
        if (!req.project.members.includes(task.assignedTo)) {
            throw new PermissionError('User assigned to this task is not a member of the project in the request')
        }
        
        await task.save()

        return res.status(201).json(task)
    } catch(err) {
        next(err)
    }
}

/**
 * Gets a task by ID provided in the request
 * 
 * Assumes task has already been attatched to request
 */
export async function getTaskByIdHandler (req, res, next) {
    try {
        return res.status(200).json(req.task)
    } catch(err) {
        next(err)
    }
}

/**
 * Updates the status of the task in the request. 
 * Only users assigned to this task can update its status
 * 
 * Assumes user and task have already been attatched to the request
 */
export async function updateTaskHandler (req, res, next) {
    try {
        if (!req.task.assignedTo.equals(req.user._id)) {
            throw new PermissionError('Requesting user cannot update a task which is not assigned to them')
        }
        const updateFieldNames = ['status']
        const updates = getNonRequiredFields(updateFieldNames, req.body)
        const updatedTask = await Task.findByIdAndUpdate(req.task._id, updates, { runValidators: true, new: true })
        if (!updatedTask) {
            throw new NotFoundError('Task not found; no updates applied')
        }
        return res.status(200).json(updatedTask)
    } catch(err) {
        next(err)
    }
}

/**
 * Deletes a task
 * 
 * Assumes task has already been attatched to the request
 */
export async function deleteTaskHandler (req, res, next) {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.task._id)
        if (!deletedTask) {
            throw new NotFoundError('Task not found; no delete applied')
        }
        return res.status(200).json(deletedTask)
    } catch(err) {
        next(err)
    }
}


