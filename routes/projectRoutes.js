import { Router } from "express";
import { validateProjectFromBody } from "../route_validation/project";
import { attatchProjectToReq, createProject, getProjectById, getProjectsByUser } from "../controllers/projectController";


const router = Router();

// param is parsed for all routes on this router that contain it
router.param('project_id', attatchProjectToReq)

// use multiple route handlers in succession with next()
router.route('/')
    .post(validateProjectFromBody, createProject)

// TODO: add ability to add multiple users to a project
router.route('/:project_id')
    .get(getProjectById)


// custom express error route handler - if any error/promise-reject is thrown in the succession of normal handlers
// this gets called
router.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err)
    }

    console.error(err)
    
    let status
    switch (err.name) {
        // thrown by mongoose and joi
        case 'ValidationError':
            status = 400
            break
        // thrown by mongoose and our own code
        case 'NotFoundError':
            status = 404
            break
        // thrown by our own code
        case 'PermissionError':
            status = 401
            break
        // thrown by owr own code, wrapper for error thrown by mongodb driver, search 'MongoServerError' in model/model.js 
        case  'DuplicateKeyError':
            status = 409
            break
        default:
            status = 500
    }

    return res.status(status).json({status: 'error', message: err.message })
})
    // TODO: add catch case for adding duplicate 
})



