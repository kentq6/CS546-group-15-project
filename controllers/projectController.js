import { NotFoundError } from "../error/error.js"
import { attatchDocumentToReqById, getRequiredFieldsOrThrow } from "../helpers.js"
import { Project } from "../model/model.js"

/**
 * param handler function
 * 
 * id contains the param value
 * ensures the id references a valid project and attatches the document 
 * to the rest of the request for subsequent handlers to use
 */
export const attatchProjectToReq = attatchDocumentToReqById(Project)

export const createProject = async (req, res, next) => {
    try {
        const projectRequiredFields =
            [ 'title'
            , 'description'
            , 'budget'
            ]
        const projectFields = getRequiredFieldsOrThrow(projectRequiredFields, req.body)
        const project = await Project.create(projectFields)
        return res.status(201).json(project)
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
        return res.status(200).json(project);
    } catch (err) {
        next(err)
    }
}