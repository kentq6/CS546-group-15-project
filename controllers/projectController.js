import { attatchDocumentToReqById, getRequiredFieldsOrThrow } from "../helpers.js"
import { Project } from "../model/model.js"

/**
 * param handler function
 * 
 * id contains the param value. 
 * ensures the id references a valid project and attatches the document 
 * to the rest of the request for subsequent handlers to use
 */
export const attatchProjectToReq = attatchDocumentToReqById(Project)

/**
 * creates a new project from fields provided in the request body
 */
export async function createProjectHandler (req, res, next) {
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

/**
 * gets one project by id passed in the request
 * 
 * assumes project has already been attatched to request
 */
export async function getProjectByIdHandler(req, res, next) {
    try {
        return res.status(200).json(req.project);
    } catch (err) {
        next(err)
    }
}

/**
 * gets all projects based on a users role
 * 
 * assumes user has been attatched to request
 */
export async function getProjectsHandler(req, res, next) {
    try {
        const user = req.user
        // get all projects an engineer or field manager is a part of
        if (user.role === 'Engineer' || user.role === 'Field Manager') {
            const projects = await Project.find({ members: user._id })

            return res.status(200).json(projects)
        } 
        // get all projects for the company if user is an owner
        else if (user.role === 'Owner') {
            const projects = await Project.find({ company: user.company })

            return res.status(200).json(projects)
        } 
        // this should never happen
        else {
            throw new NotFoundError('Role not found for user making this request')
        }
    } catch(err) {
        next(err)
    }
}