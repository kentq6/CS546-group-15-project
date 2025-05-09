import { Router } from 'express'
import * as projectHandlers from '../controllers/projectController.js'
import * as authHandlers from '../middleware/auth.js'
import blueprintRouter from './blueprintRoutes.js'
import taskRouter from './taskRoutes.js'
import reportRouter from './reportRoutes.js'

const router = Router();

// param is parsed for all routes on this router that contain it
// including nested routes for blueprints, tasks, and reports
router.param('project_id', projectHandlers.attatchProjectToReq)

// set up routers for nested paths for blueprints, tasks, and reports
router.use('/:project_id/blueprints', blueprintRouter)
router.use('/:project_id/tasks', taskRouter)
router.use('/:project_id/reports', reportRouter)

router.route('/')
    .get
        ( authHandlers.authenticateAndAuthorizeAllRoles
        , projectHandlers.getProjectsHandler
        )
    .post
        ( authHandlers.authenticateAndAuthorizeRoles('Field Manager')
        , projectHandlers.createProjectHandler
        )

router.route('/:project_id')
    .get
        ( authHandlers.authenticateAndAuthorizeAllRoles
        , authHandlers.authorizeProjectMemberOrOwner
        , projectHandlers.getProjectByIdHandler
        )
    .put
        ( authHandlers.authenticateAndAuthorizeRoles('Field Manager')
        , authHandlers.authorizeProjectMember
        , projectHandlers.updateProjectHandler
        )
    .delete
        ( authHandlers.authenticateAndAuthorizeRoles('Field Manager')
        , authHandlers.authorizeProjectMember
        , projectHandlers.deleteProjectHandler
        )

export default router








