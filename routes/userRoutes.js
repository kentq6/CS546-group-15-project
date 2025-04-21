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
        return next(err)
    }

    console.error(err)
    
    let status
    switch (err.name) {
        case 'ValidationError':
            status = 400
            break
        case 'NotFoundError':
            status = 404
            break
        case 'PermissionError':
            status = 401
            break
        case  'DuplicateKeyError':
            status = 409
            break
        default:
            status = 500
    }

    return res.status(status).json({status: 'error', message: err.message })
})