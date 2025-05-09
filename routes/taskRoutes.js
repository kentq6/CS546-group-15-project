import { Router } from "express"
 import * as authHandlers from "../middleware/auth.js"
 import * as taskHandlers from "../controllers/taskController.js"

const router = Router()
 
router.param('task_id', taskHandlers.attatchTaskToReq)
 
router.route('/')
    .get
        ( authHandlers.authenticateAndAuthorizeAllRoles
        , authHandlers.authorizeProjectMemberOrOwner
        , taskHandlers.getTasksHandler
        )
    .post
        ( authHandlers.authenticateAndAuthorizeRoles('Field Manager')
        , authHandlers.authorizeProjectMember
        , taskHandlers.createTaskHandler
        )
 
router.route('/:task_id')
    .get
        ( authHandlers.authenticateAndAuthorizeAllRoles
        , authHandlers.authorizeProjectMemberOrOwner
        , taskHandlers.getTaskByIdHandler
        )
    .put
        ( authHandlers.authenticateAndAuthorizeRoles('Field Manager', 'Engineer')
        , authHandlers.authorizeProjectMember
        , taskHandlers.updateTaskHandler
        )
    .delete
        ( authHandlers.authenticateAndAuthorizeRoles('Field Manager')
        , authHandlers.authorizeProjectMember
        , taskHandlers.deleteTaskHandler
        )
 
export default router