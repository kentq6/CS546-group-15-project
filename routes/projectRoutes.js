import { Router } from 'express'
import * as projectHandlers from '../controllers/projectController.js'
import * as authHandlers from '../middleware/auth.js'
import blueprintRouter from './blueprintRoutes.js'
import taskRouter from './taskRoutes.js'
import reportRouter from './reportRoutes.js'
import * as userHandlers from '../controllers/userController.js'

const router = Router();

// param is parsed for all routes on this router that contain it
// including nested routes for blueprints, tasks, and reports
router.param('project_id', projectHandlers.attatchProjectToReq)
router.param('target_user_id', userHandlers.attatchTargetUserToReq)
router.param('member_id', projectHandlers.attatchMemberToReqCheckProjectMembers)

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

router.route('/:project_id/members/:target_user_id')
    .post
        ( authHandlers.authenticateAndAuthorizeRoles('Field Manager')
        , authHandlers.authorizeProjectMember
        , projectHandlers.addTargetUserToProjectHandler
        )

router.route('/:project_id/members/:member_id')
    .delete
        ( authHandlers.authenticateAndAuthorizeRoles('Field Manager')
        , authHandlers.authorizeProjectMember
        , projectHandlers.removeMemberFromProjectHandler
        )

export default router








