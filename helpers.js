import { NotFoundError } from "./error/error.js"





/**
 * lazily retrieves keys and values for those keys into a smaller object
 * if a key is not found, within the body it is ignored
 * 
 */
export function getNonRequiredFields(keys, body) {
    if (!body) {
        throw new NotFoundError('No request body')
    }
    const nonRequiredFields = keys.reduce((acc, curr) => {
        if (curr in body) {
            return {...acc, [curr]: body[curr]}
        }
        return acc
    }, {})
    return nonRequiredFields
}

/**
 * makes a smaller object from 'body' that from all keys in 'keys'
 * if a key in 'keys' is not found in 'body' the function throws 
 * 
 */
export function getRequiredFieldsOrThrow(keys, body) {
    if (!body) {
        throw new NotFoundError('No request body')
    }
    const requiredFields = keys.reduce((acc, curr) => {
        if (!(curr in body)) {
            throw new NotFoundError(`${curr} is a required field in request body`)
        }
        return {...acc, [curr]: body[curr]}
    }, {})
    return requiredFields
}

/**
 * closure that takes a mongoose model and returns a handler meant to be used in router.param()
 * handler: route parameter in 'id' is used to query the model for that id 
 * 
 * e.g. for User model, param '/:user_id' will add req.user to request object if user_id is valid
 * 
 */
export function attatchDocumentToReqById(model) {
    return async (req, res, next, id) => {
        try {
            const doc = await model.findById(id)
            if (!doc) {
                throw new NotFoundError(`${model.modelName} not found`)
            }
            const lowerCaseOfModelName = model.modelName.toLowerCase()
            req[lowerCaseOfModelName] = doc
            next()
        } catch(err) {
            next(err)
        }
    }
}


export function allUnique(documentArray) {
    const documents = documentArray
    for (let i = 0; i < documents.length; i++) {
        for (let j = 0; j < documents.length; j++) {
            if (i === j) continue
            if (documents[i].equals(documents[j])) return false
        }
    }
    return true
}

export function areDocumentsASubset(target, of) {
    const includes = (targetDoc, docs) => {
        for (const doc of docs) {
            if (doc.equals(targetDoc)) return true
        }
        return false
    }
    for (const doc of target) {
        if (!includes(doc, of)) return false
    }
    return true
}
export const isUserAnOwner = user       => user.role === 'Owner'
export const isUserAnEngineer = user    => user.role === 'Engineer'
export const isUserAFieldManager = user => user.role === 'Field Manager'

export const isUserAProjectMember = (user, project) => project.members.includes(user._id)

export const isUserAProjectMemberOrOwner = (user, project) => 
    isUserAProjectMember(user, project) || isUserAnOwner(user)

