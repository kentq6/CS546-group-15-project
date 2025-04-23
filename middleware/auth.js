import { AuthorizationError, NotFoundError } from "../error/error.js";
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

function authorizeRoles (...roles) {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        throw new PermissionError(`Resource denied for role: ${req.user.role}`)
      }
      
      next()
    }
}

/**
 * replacement for using cookies in production. see authenticate() in this file for example
 * real implementation with cookie-parser and jsonwebtoken
 */
async function dummyAuthentication (req, res, next) {
    try {
        // CHANGE THIS VALUE TO SIMULATE REQUESTS MADE BY A CERTAIN USER
        // FOR PROTECTED ROUTES
        const dummyId = ''
        const user = User.findById(dummyId)
        if (!user) {
            throw new NotFoundError('User of this request was not found')
        }
        req.user = user
    } catch(err) {
        next(err)
    }
}

/**
 * takes roles and creates fake authentication middleware. when passed into
 * express middleware as an array of route handlers, express calls each route handler in succession
 * and can chain with spread operator
 *
 * i.e. router.route("/").get([handler1, handler2], handler3)
 *  1,2,3 get called in succession if 'next()' is used in each one. if 'return res.status' is used in any of them
 *  then the request returns early
 */
export const dummyRouteAuth = async (...roles) => {
    return [dummyAuthentication, authorizeRoles(...roles)]
}

