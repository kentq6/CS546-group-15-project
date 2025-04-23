import { NotFoundError } from "./error/error.js"



// lazily retrieves keys and values for those keys
export function getNonRequiredFields(keys, body) {
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
 * @param {*} keys 
 * @param {*} obj 
 */
export function getRequiredFieldsOrThrow(keys, body) {
    const requiredFields = keys.reduce((acc, curr) => {
        if (!(curr in body)) {
            throw new NotFoundError(`${curr} is a required field in request body`)
        }
        return {...acc, [curr]: body[curr]}
    }, {})
    return requiredFields
}

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
