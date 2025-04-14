import { Router } from "express";
import { validateProjectFromBody } from "../route_validation/project";
import { attatchProjectToReq, createProject, getProjectById, getProjectsByUser } from "../controllers/projectController";


const router = Router();

// param is parsed for all routes on this router that contain it
router.param('project_id', attatchProjectToReq)

// use multiple route handlers in succession with next()
router.route('/')
    .post(validateProjectFromBody, createProject)

router.route('/:project_id')
    .get(getProjectById)


// custom express error route handler - if any error/promise-reject is thrown in the succession of normal handlers
// this gets called
router.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    } else if (err.name === 'ValidationError') {
        res.status(400).json({ status: 'error', message: err.message })
    } else if (err.name === 'NotFoundError') {
        res.status(404).json({ status: 'error', message: err.message })
    } else if (err.name === 'PermissionError') {
        res.status(401).json({ status: 'error', message: err.message })
    }
    // TODO: add catch case for adding duplicate 
})



