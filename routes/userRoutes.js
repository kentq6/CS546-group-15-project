import { Router } from "express"
import { getProjectsByUser } from "../controllers/userController.js"
import { attatchUserToReq } from "../controllers/userController.js"

const router = Router()

router.param('user_id', attatchUserToReq)

router.route('/:user_id/projects')
    .get(getProjectsByUser)

// TODO
// router.route('/:user_id')

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
})