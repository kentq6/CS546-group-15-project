import { Router } from 'express'
import * as userHandlers from '../controllers/userController.js'
import * as authHandlers from '../middleware/auth.js'

const router = Router()

router.param('target_user_id', userHandlers.attatchTargetUserToReq)

router.route('/')
    .get
        ( authHandlers.authenticateAndAuthorizeAllRoles
        , userHandlers.getAllUsersHandler
        )
    .post
        ( authHandlers.authenticateAndAuthorizeRoles('Owner')
        , userHandlers.createUserHandler
        )
    .put
        ( authHandlers.authenticateAndAuthorizeAllRoles
        , userHandlers.updateUserHandler
        )

router.route('/:target_user_id')
    .get
        ( authHandlers.authenticateAndAuthorizeAllRoles
        , userHandlers.getTargetUserHandler
        )
    .delete
        ( authHandlers.authenticateAndAuthorizeRoles('Owner')
        , userHandlers.deleteTargetUserHandler
        )
    

export default router