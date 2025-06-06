/* imports required modules and error types */
import { AuthenticationError, NotFoundError, PermissionError } from "../error/error.js";
import { isUserAProjectMember, isUserAProjectMemberOrOwner } from "../helpers.js";
import { Project, User } from "../model/model.js";
import jwt from 'jsonwebtoken';

/* jwt secret key from environment variables */
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Authenticates a user from the cookie provided in the request.
 * If authentication fails, it clears the cookie and redirects to login page
 * 
 * This middleware is used for all protected routes
 */
export const authenticate = async (req, res, next) => {
    try {
        //take token from cookie
        const token = req.cookies?.authToken
        if (!token) {
            throw new AuthenticationError('Token not found; failed to authenticate')
        }
        // use jsonwebtoken with a secret key in the .env file
        const decoded = jwt.verify(token, JWT_SECRET)
        const user = await User.findById(decoded.userId)
        
        if (!user) {
            throw new AuthenticationError('User not found; failed to authenticate')
        }
        // attatch user to the request
        req.user = user

        next()
    } catch (err) {
        res.clearCookie('authToken')
        return res.redirect('/login')
    }
}

export function logout (req, res) {
    res.clearCookie('authToken')
    return res.redirect('/login')
}

/* middleware factory to check if user has required role */
export function authorizeRoles(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new PermissionError(`Resource denied for role: ${req.user.role}`)
        }
        next()
    }
}

/* middleware that allows access to all valid roles */
export const authorizeAllRoles = authorizeRoles('Owner', 'Field Manager', 'Engineer')

/* middleware to verify user is a member of the project */
export function authorizeProjectMember(req, res, next) {
    if (!isUserAProjectMember(req.user, req.project)) {
        throw new PermissionError('User is not a project member')
    }
    next()
}

/* middleware to verify user is either project member or owner */
export function authorizeProjectMemberOrOwner(req, res, next) {
    if (!isUserAProjectMemberOrOwner(req.user, req.project)) {
        throw new PermissionError('User is not an owner nor project member')
    }
    next() 
}

/* combines authentication and role authorization into single middleware array */
export const authenticateAndAuthorizeRoles = (...roles) => [authenticate, authorizeRoles(...roles)]

/* combines authentication and all-role authorization into single middleware array */
export const authenticateAndAuthorizeAllRoles = [authenticate, authorizeAllRoles]
