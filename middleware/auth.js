import { AuthorizationError, NotFoundError, PermissionError } from "../error/error.js";
import { Project, User } from "../model/model.js";



// export const authenticate = async (req, res, next) => {
//     try {
      
//       const token = req.cookies.authToken;
      
//       if (!token) {
//         return res.status(401).json({ error: 'Authentication required' });
//       }
      
//       // Verify token
//       const decoded = jwt.verify(token, JWT_SECRET);
      
//       // Find user by id
//       const user = await User.findById(decoded.userId);
      
//       if (!user) {
//         return res.status(401).json({ error: 'User not found' });
//       }
      
//       // Add user to request object
//       req.user = user;
      
//       next();
//     } catch (error) {
//       if (error.name === 'JsonWebTokenError') {
//         return res.status(401).json({ error: 'Invalid token' });
//       }
//       if (error.name === 'TokenExpiredError') {
//         return res.status(401).json({ error: 'Token expired' });
//       }
      
//       next(error);
//     }
//   };

const isUserAnOwner = (user) => user.role === 'Owner'

const isUserAProjectMember = (user, project) => project.members.includes(user._id)

const isUserAProjectMemberOrOwner = (user, project) => 
    isUserAProjectMember(user, project) || isUserAnOwner(user)


/**
 * Closure that returns an express handler validating that user has a role in 'roles'
 */
export function authorizeRoles (...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new PermissionError(`Resource denied for role: ${req.user.role}`)
        }
        next()
    }
}

/**
 * No-op function, user should have a valid role. if not, throw
*/
export const authorizeAllRoles = authorizeRoles('Owner', 'Field Manager', 'Engineer')

/**
 * Authorizes that user making the request is a project member
 * 
 * Assumes user and project is already attatched to request via req.param('project_id')
 */
export function authorizeProjectMember (req, res, next) {
    if (!isUserAProjectMember(req.user, req.project)) {
        throw new PermissionError('User is not a project member')
    }
    next()
}

/**
 * Authorizes user making the request as an owner or a member of the project
 * 
 * Assumes user and project are already attatched to the request
 */
export function authorizeProjectMemberOrOwner (req, res, next) {
    if (!isUserAProjectMemberOrOwner(req.user, req.project)) {
        throw new PermissionError('User is not an owner nor project member')
    }
    next() 
}

/**
 * Dummy method for authenticating the user making the request. Attatches user to the request.
 *  Change 'dummyId' to simulate 
 * that a request is being made by a certain user. 
 * 
 * Replacement for using cookies in production. See authenticate() in this file for example
 * real implementation with cookie-parser and jsonwebtoken
 * 
 */
export async function dummyAuthenticate (req, res, next) {
    try {
        // CHANGE THIS VALUE TO SIMULATE REQUESTS MADE BY A CERTAIN USER
        // FOR PROTECTED ROUTES
        const dummyId = '680d5023f535ce3b7a18143d'
        const user = await User.findById(dummyId)
        if (!user) {
            throw new NotFoundError('User of this request was not found')
        }
        req.user = user
        next()
    } catch(err) {
        next(err)
    }
}

export const authenticateAndAuthorizeRoles = (...roles) => [dummyAuthenticate, authorizeRoles(...roles)]

export const authenticateAndAuthorizeAllRoles = [dummyAuthenticate, authorizeAllRoles]
