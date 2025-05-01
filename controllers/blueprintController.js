import { NotFoundError } from "../error/error.js"
import { attatchDocToReqByIdCheckProjectId, getNonRequiredFields, getRequiredFieldsOrThrow } from "../helpers.js"
import { Blueprint } from "../model/model.js"


export const attatchBlueprintToReq = attatchDocToReqByIdCheckProjectId(Blueprint)

/**
 * Gets all blueprints for a particular project
 * 
 * Assumes project has already been attatched to requerst
 */
export async function getAllBlueprintsHandler(req, res, next) {
    try {
        const blueprints = await Blueprint.find({ project: req.project._id })
        return res.status(200).json(blueprints)
    } catch(err) {
        next(err)
    }
}

/**
 * Creates a new blueprint from fields in the request body
 * 
 * Assumes user and project have already been attatched to request
 */
export async function createBlueprintHandler(req, res, next) {
    try {
        const blueprintFieldNames = 
            [ 'title'
            , 'tags'
            ]
        const blueprintFields = getRequiredFieldsOrThrow(blueprintFieldNames, req.body)
        const blueprint = await Blueprint.create({
            ...blueprintFields,
            project: req.project._id,
            uploadedBy: req.user._id
        })

        return res.status(200).json(blueprint)

        
    } catch(err) {
        next(err)
    }
}

/**
 * Gets a blueprint by ID
 * 
 * Assumes blueprint has already been attatched to the request
 */
export async function getBlueprintByIdHandler(req, res, next) {
    try {
        return res.status(200).json(req.blueprint)
    } catch(err) {
        next(err)
    }
}


/**
 * Update a blueprint with data in the request body
 * 
 * Assumes blueprint has already been attatched to the request
 */
export async function updateBlueprintHandler(req, res, next) {
    try {
        const updateFieldNames =['tags']
        const updates = getNonRequiredFields(updateFieldNames, req.body)
        const newBlueprint = await Blueprint.findByIdAndUpdate(
            req.blueprint._id,
            updates,
            { runValidators: true, new: true })
        if (!newBlueprint) {
            throw new NotFoundError('Blueprint not found; no update applied')
        }
        return res.status(200).json(newBlueprint)
    } catch(err) {
        next(err)
    }
}

/**
 * Deletes a blueprint
 * 
 * Assumes blueprint has already been attatched to the request
 */
export async function deleteBlueprintHandler(req, res, next) {
    try {
        const deletedBlueprint = await Blueprint.findByIdAndDelete(req.blueprint._id)
        if (!deletedBlueprint) {
            throw new NotFoundError('Blueprint not found; no delete applied')
        }
        return res.status(200).json(deletedBlueprint)
    } catch(err) {
        next(err)
    }
}

