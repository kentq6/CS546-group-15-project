import { NotFoundError } from "../error/error.js"
import { Project } from "../model/model.js"

/**
 * @summary
 * 
 * param handler function
 * 
 * @desc
 *
 * id contains the param value
 * ensures the id references a valid project and attatches the document 
 * to the rest of the request for subsequent handlers to use
 */
export const attatchProjectToReq = async (req, res, next, id) => {
    try {
        const project = await Project.findById(id)
        if (!project) {
            throw new NotFoundError('project not found')
        }
        req.project = project
        next()
    } catch(err) {
        next(err)
    }
}

export const createProject = async (req, res, next) => {
    try {
        const {title, description, budget} = req.body
        const project = await Project.create({ title, description, budget })
        res.status(201).json(project)
    } catch (err) {
        next(err)
    }
}

export const getProjectById = async (req, res, next) => {
    try {
        const project = await Project.findById(req.project._id)
        if (!project) {
            throw new NotFoundError('Project not found')
        }
        res.status(200).json(project);
    } catch (err) {
        next(err)
    }
}