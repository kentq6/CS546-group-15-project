import { NotFoundError, PermissionError, ValidationError } from "../error/error.js"
import { allUnique, areDocumentsASubset, attatchDocumentToReqById, getNonRequiredFields, getRequiredFieldsOrThrow, isUserAFieldManager } from "../helpers.js"
import { Project, User } from "../model/model.js"
import mongoose from "mongoose"
/**
 * param handler function
 * 
 * id contains the param value. 
 * ensures the id references a valid project and attatches the document 
 * to the rest of the request for subsequent handlers to use
 */
export const attatchProjectToReq = attatchDocumentToReqById(Project)

/**
 * Gets all projects based on a users role
 * 
 * Assumes user has been attatched to request
 */
export async function getProjectsHandler (req, res, next) {
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

/**
 * Creates a new project from fields provided in the request body, 
 * adds the requesting user as the initial member of the project
 * 
 * assumes user has been attatched to request
 */
export async function createProjectHandler (req, res, next) {
    try {
        const projectFieldNames =
            [ 'title'
            , 'description'
            , 'budget'
            ]
        const projectFields = getRequiredFieldsOrThrow(projectFieldNames, req.body)
        const project = await Project.create({
            ...projectFields,
            company: req.user.company,
            members: [req.user._id]
        })
        return res.status(201).json(project)
    } catch(err) {
        next(err)
    }
}

/**
 * Gets one project by id passed in the request
 * 
 * Assumes project has already been attatched to request
 */
export function getProjectByIdHandler(req, res, next) {
    try {
        return res.status(200).json(req.project);
    } catch(err) {
        next(err)
    }
}

/**
 * Updates a project, does extra validation on 'members' field if its being updated
 * 
 * Assumes user and project are attatched to request
 */
export async function updateProjectHandler(req, res, next) {
    try {
        const updateFieldNames = 
            [ 'description'
            , 'status'
            , 'members'
            , 'budget'
            ]
        const updates = getNonRequiredFields(updateFieldNames, req.body)

        // use validate so 'members' is sure to be an array
        const docOfUpdate = new Project(updates)
        await docOfUpdate.validate(Object.keys(updates))

        // validatiaon if request is updating the members of a project
        if ('members' in docOfUpdate) {
            // get member details of the project
            const { members: oldMembers } = await Project.findById(req.project._id).populate('members')

            // get member details of the members update
            const newMembers = await Promise.all(docOfUpdate.members.map(async e => await User.findById(e)))

            // ensure no members in the update are duplicates
            if (!allUnique(newMembers)) {
                throw new ValidationError('Update to project members contians a duplicate')
            }

            // ensure no field managers are being removed from  a project
            const oldFieldManagers = oldMembers.filter(isUserAFieldManager)
            const newFieldManagers = newMembers.filter(isUserAFieldManager)
            if (!areDocumentsASubset(oldFieldManagers, newFieldManagers)) {
                throw new PermissionError('Field Managers are not removable from a project')
            }

            for (const member of newMembers) {
                // redundant
                if (!member) {
                    throw new NotFoundError('Member not found')
                }
                // ensure no member being added works under a different company as the requesting user
                if (!req.user.company.equals(member.company)) {
                    throw new PermissionError('Member being added does not belong to the same company as the requesting user')
                }
                // ensure owners are not added to the project
                if (member.role === 'Owner') {
                    throw new PermissionError('Member being added has the Owner role')
                }
            }
        }

        const newProject = await Project.findByIdAndUpdate(req.project._id, updates, {runValidators: true, new: true})
        return res.status(200).json(newProject)
    } catch(err) {
        next(err)
    }
}

/**
 * Deletes a project
 * 
 * assumes project is attatched to request
 */
export async function deleteProjectHandler(req, res, next) {
    try {
        const deletedProject = await Project.findByIdAndDelete(req.project._id)
        if (!deletedProject) {
            throw new NotFoundError('Project not found; no delete applied')
        }
        return res.status(200).json(deletedProject)
    } catch(err) {
        next(err)
    }
}