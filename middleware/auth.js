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

export async function authorizeRoles (...roles) {
    return (req, res, next) => {
      if (!req.requestor) {
        throw new AuthorizationError('User making request is not authorized');
      }
      
      if (!roles.includes(req.requestor.role)) {
        throw new PermissionError(`Resource denied for role: ${req.requestor.role}`)
      }
      
      next()
    }
}

