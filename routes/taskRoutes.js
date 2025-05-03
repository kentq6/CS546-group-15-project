import { Router } from "express"
 import { authenticateAndAuthorizeAllRoles, authenticateAndAuthorizeRoles, authorizeProjectMember, authorizeProjectMemberOrOwner } from "../middleware/auth.js"
 import { attatchTaskToReq, createTaskHandler, deleteTaskHandler, getTaskByIdHandler, getTasksHandler, updateTaskHandler } from "../controllers/taskController.js"

const router = Router()
 
router.param('task_id', attatchTaskToReq)
 
router.route('/')
    .get
        ( authenticateAndAuthorizeAllRoles
        , authorizeProjectMemberOrOwner
        , getTasksHandler
        )
    .post
        ( authenticateAndAuthorizeRoles('Field Manager')
        , authorizeProjectMember
        , createTaskHandler
        )
 
router.route('/:task_id')
    .get
        ( authenticateAndAuthorizeAllRoles
        , authorizeProjectMemberOrOwner
        , getTaskByIdHandler
        )
    .put
        ( authenticateAndAuthorizeRoles('Field Manager', 'Engineer')
        , authorizeProjectMember
        , updateTaskHandler
        )
    .delete
        ( authenticateAndAuthorizeRoles('Field Manager')
        , authorizeProjectMember
        , deleteTaskHandler
        )
 
export default router