import { NotFoundError } from "../error/error.js"
import { User } from "../model/model.js"


/**
 * Attatches target user to request 
 * 
 * meant to be used in router.param('target_user_id')
 */
export async function attatchTargetUserToReq (req, res, next) {
    try {
        const targetUser = await User.findById(id)
        if (!targetUser) {
            throw new NotFoundError('User not found')
        }
        req.targetUser = targetUser
        next()
    } catch(err) {
        next(err)
    }      
}

export async function getAllUsersHandler (req, res, next) {
    try {

    } catch(err) {
        next(err)
    }
}