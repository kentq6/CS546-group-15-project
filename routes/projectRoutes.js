import { Router } from 'express'

import 
    { attatchProjectToReq
    , createProjectHandler
    , getProjectByIdHandler
    , getProjectsHandler
    , updateProjectHandler
    } 
    from '../controllers/projectController.js'

import 
    { authenticateAndAuthorizeAllRoles
    , authenticateAndAuthorizeRoles
    , authorizeProjectMember
    , authorizeProjectMemberOrOwner
    } 
    from '../middleware/auth.js'
import blueprintRouter from './blueprintRoutes.js'

const router = Router();

// param is parsed for all routes on this router that contain it
router.param('project_id', attatchProjectToReq)


router.use('/:project_id/blueprints', blueprintRouter)

// use multiple route handlers in succession with next()
router.route('/')
    .get
        ( authenticateAndAuthorizeAllRoles
        , getProjectsHandler
        )
    .post
        ( authenticateAndAuthorizeRoles('Field Manager')
        , createProjectHandler
        )

router.route('/:project_id')
    .get
        ( authenticateAndAuthorizeAllRoles
        , authorizeProjectMemberOrOwner
        , getProjectByIdHandler
        )
    .put
        ( authenticateAndAuthorizeRoles('Field Manager')
        , authorizeProjectMember
        , updateProjectHandler
        )
    .delete
        ( authenticateAndAuthorizeRoles('Field Manager')
        , authorizeProjectMember
        )

export default router








