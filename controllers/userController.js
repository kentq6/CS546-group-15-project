import { NotFoundError, PermissionError } from '../error/error.js'
import { getNonRequiredFields, getRequiredFieldsOrThrow, isUserAnOwner } from '../helpers.js'
import { User } from '../model/model.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

/**
 * Attatches target user to request 
 * 
 * meant to be used in router.param('target_user_id')
 */
export async function attatchTargetUserToReq (req, res, next, id) {
    try {
        const targetUser = await User.findById(id).select('-password')
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
 * Assumes user has already been attatched to request
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

        // ensure password is not returned to the frontend
        const {password, ...safeUser} = user.toJSON()

        return res.status(201).json(safeUser)

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

        const newUser = await User.findByIdAndUpdate(req.user._id, updates, {
            runValidators: true,
            new: true,
            select: '-password'
        })

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

        // ensure password is not returned to the frontend
        const {password, ...safeDeletedUser} = deletedUser.toJSON()

        return res.status(200).json(safeDeletedUser)
    } catch(err) {
        next(err)
    }
}

/**
 * Logs in a user with username and password provided in request body 
 * redirects the logged in user to the protected landing page
 */
export async function loginHandler(req, res, next) {
    // console.log('Login route hit with body:', req.body);         I ADDED A BCRYPT HASH THE PASSWORD IN OUR DB. IF YOU WANT TO SEE THE PASSWORDS and U FORGOT WHAT IT WAS, UNCOMMENT THIS. 
    try {
        const { username, password } = getRequiredFieldsOrThrow(['username', 'password'], req.body)
        const user = await User.findOne({ username });
        
        if (!user) {
            return res.render('login', {
                title: 'Login',
                error: 'Invalid Credentials',
                username: username
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', {
                title: 'Login',
                error: 'Invalid Credentials',
                username: username
            });
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Set token in HTTP-only cookie
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours, we can change the timing of the cookie here to whatever idc
        });

        return res.redirect('/loggedInLanding')
    } catch(err) {
        res.clearCookie('authToken')
        return res.render('login', {
            title: 'Login',
            error: 'Invalid Credentials',
            username: req.body.username
        });
    }
}