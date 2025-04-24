import { NotFoundError } from "../error/error.js"
import { attatchDocumentToReqById } from "../helpers.js"
import { Project, User } from "../model/model.js"



export async function attatchUserToReq (req, res, next) {
    try {
        const targetUser = await User.findById(id)
        if (!doc) {
            throw new NotFoundError('User not found')
        }
        req.targetUser = targetUser
        next()
    } catch(err) {
        next(err)
    }      
}

export async function getAllUsersHandler(req, res, next) {
    try {

    } catch(err) {
        next(err)
    }
}