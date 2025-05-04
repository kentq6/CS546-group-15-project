import { Router } from 'express'

import * as projectHandlers from '../controllers/projectController.js'

import 
    { authenticateAndAuthorizeAllRoles
    , authenticateAndAuthorizeRoles
    , authorizeProjectMember
    , authorizeProjectMemberOrOwner
    } 
    from '../middleware/auth.js'

import blueprintRouter from './blueprintRoutes.js'

import taskRouter from './taskRoutes.js'

import reportRouter from './reportRoutes.js'

const router = Router();

// param is parsed for all routes on this router that contain it
router.param('project_id', projectHandlers.attatchProjectToReq)


router.use('/:project_id/blueprints', blueprintRouter)
router.use('/:project_id/tasks', taskRouter)
router.use('/:project_id/reports', reportRouter)

// use multiple route handlers in succession with next()
router.route('/')
    .get
        ( authenticateAndAuthorizeAllRoles
        , projectHandlers.getProjectsHandler
        )
    .post
        ( authenticateAndAuthorizeRoles('Field Manager')
        , projectHandlers.createProjectHandler
        )

router.route('/:project_id')
    .get
        ( authenticateAndAuthorizeAllRoles
        , authorizeProjectMemberOrOwner
        , projectHandlers.getProjectByIdHandler
        )
    .put
        ( authenticateAndAuthorizeRoles('Field Manager')
        , authorizeProjectMember
        , projectHandlers.updateProjectHandler
        )
    .delete
        ( authenticateAndAuthorizeRoles('Field Manager')
        , authorizeProjectMember
        , projectHandlers.deleteProjectHandler
        )

export default router








