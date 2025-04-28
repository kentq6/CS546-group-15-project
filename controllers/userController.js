import { NotFoundError, PermissionError } from '../error/error.js'
import { getNonRequiredFields, getRequiredFieldsOrThrow, isUserAnOwner } from '../helpers.js'
import { User } from '../model/model.js'


/**
 * Attatches target user to request 
 * 
 * meant to be used in router.param('target_user_id')
 */
export async function attatchTargetUserToReq (req, res, next, id) {
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

/**
 * Gets all users for the company the requesting user is apart of 
 * 
 * assumes user has already been attatched to request 
 */
export async function getAllUsersHandler (req, res, next) {
    try {
        // return non sensitive details of users
        const allUsersOfCompany = await User.find({ company: req.user.company }).select('-password')
        return res.status(200).json(allUsersOfCompany)
    } catch(err) {
        next(err)
    }
}

/**
 * Creates a new user from request body
 * 
 */
export async function createUserHandler (req, res, next) {
    try {
        const userRequiredFields = 
            [ 'username'
            , 'password'
            , 'firstname'
            , 'lastname'
            , 'role'
            ]
        const userFields = getRequiredFieldsOrThrow(userRequiredFields, req.body)
        // create user under the same company as the requesting user
        const user = new User({
            ...userFields,
            company: req.user.company
        })
        // mongoose validatinon
        await user.validate()

        if (isUserAnOwner(user)) {
            throw new PermissionError('Tried to create a user with \'Owner\' role')
        }

        await user.save()

        return res.status(201).json(user)

    } catch(err) {
        next(err)
    }
}

/**
 * Updates the requesting user's details
 * 
 * Assumes user has already been attatched to request
 */
export async function updateUserHandler (req, res, next) {
    try {
        const updateFields = 
            [ 'firstname'
            , 'lastname'
            , 'password'
            ]
        const updates = getNonRequiredFields(updateFields, req.body)

        const newUser = await User.findByIdAndUpdate(req.user._id, updates, {runValidators: true, new: true})
        if (!newUser) {
            throw new NotFoundError('User to be updated was not found')
        }
        return res.status(200).json(newUser)
    }
    catch(err) {
        next(err)
    }
}

/**
 * Gets a taget user within a company as the requesting user
 * 
 * assumes user and targetUser have already been attatched to request
 */
export async function getTargetUserHandler (req, res, next) {
    try {
        if (!req.user.company.equals(req.targetUser.company)) {
            throw new PermissionError('Target user does not belong to the same compnay as requesting user')
        }
        return res.status(200).json(req.targetUser)
    } catch(err) {
        next(err)
    }
}

/**
 * Deletes a target user within the same company
 * 
 * Assumes user and targetUser have already been attatched to request
 */
export async function deleteTargetUserHandler (req, res, next) {
    try {
        const {user, targetUser} = req

        if (user.equals(targetUser)) {
            throw new PermissionError('Requesting user cannot delete oneself')
        }
        
        if (!user.company.equals(targetUser.company)) {
            throw new PermissionError('Target user does not belong to the same compnay as requesting user')
        }
        const deletedUser = await User.findByIdAndDelete(req.targetUser._id)
        
        if (!deletedUser) {
            throw new NotFoundError('Target user not found; no delete applied')
        }

        return res.status(200).json(deletedUser)
    } catch(err) {
        next(err)
    }
}