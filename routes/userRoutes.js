import { Router } from 'express'
import 
    { attatchTargetUserToReq
    , createUserHandler
    , deleteTargetUserHandler
    , getAllUsersHandler
    , getTargetUserHandler
    , updateUserHandler
    } 
    from '../controllers/userController.js'
import
    { authenticateAndAuthorizeAllRoles
    , authenticateAndAuthorizeRoles
    }
    from '../middleware/auth.js'

const router = Router()

router.param('target_user_id', attatchTargetUserToReq)

router.route('/')
    .get
        ( authenticateAndAuthorizeAllRoles
        , getAllUsersHandler
        )
    .post
        ( authenticateAndAuthorizeRoles('Owner')
        , createUserHandler
        )
    .put
        ( authenticateAndAuthorizeAllRoles
        , updateUserHandler
        )

router.route('/:target_user_id')
    .get
        ( authenticateAndAuthorizeAllRoles
        , getTargetUserHandler
        )
    .delete
        ( authenticateAndAuthorizeRoles('Owner')
        , deleteTargetUserHandler
        )
    

export default router