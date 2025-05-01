import { NotFoundError, ValidationError } from "../error/error.js";
import { attatchDocToReqByIdCheckProjectId, getNonRequiredFields, getRequiredFieldsOrThrow, isUserAFieldManager, isUserAnEngineer, isUserAnOwner, isUserAProjectMember } from "../helpers.js";
import { Task, User } from "../model/model.js";

export const attatchTaskToReq = attatchDocToReqByIdCheckProjectId(Task)

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

export async function createTaskHandler (req, res, next) {
    try {
        const taskRequiredFieldNames =
            [ 'title'
            , 'description'
            , 'cost'
            ]
        const taskNonRequiredFieldNames = ['assignedTo']
        const taskRequiredFields = getRequiredFieldsOrThrow(taskRequiredFieldNames, req.body)
        const taskNonRequiredFields = getNonRequiredFields(taskNonRequiredFieldNames, req.body)
        const taskFields = {...taskRequiredFields, ...taskNonRequiredFields}
        const task = new Task(taskFields)
        await task.validate()
        
        if (task.assignedTo) {
            const userTaskIsAssignedTo = await User.findById(task.assignedTo)
            if (!userTaskIsAssignedTo) {
                throw new NotFoundError('User task is assigned to not found')
            }
            if (!req.user.company.equals(userTaskIsAssignedTo.company)) {
                throw new PermissionError('User assigned to task does not belong to the same company')
            }
            if (isUserAnOwner(userTaskIsAssignedTo)) {
                throw new PermissionError('Owner cannot be assigned a task')
            }
        }

        return res.status(201).json(task)
    } catch(err) {
        next(err)
    }
}

export async function getTaskByIdHandler (req, res, next) {
    try {
        return res.status(200).json(req.task)
    } catch(err) {
        next(err)
    }
}

export async function updateTaskHandler (req, res, next) {
    try {
        const updateFieldNames = ['status']
        const updates = getNonRequiredFields(updateFieldNames, req.body)
        const updatedTask = await Task.findByIdAndUpdate(
            req.task._id,
            updates,
            { runValidators: true, new: true}
        )
        if (!updatedTask) {
            throw new NotFoundError('Task not found; no udpate applied')
        }
        return res.status(200).json(updatedTask)
    } catch(err) {
        next(err)
    }
}

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



