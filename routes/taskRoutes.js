import { Router } from "express"
 import { authenticateAndAuthorizeAllRoles, authenticateAndAuthorizeRoles, authorizeProjectMemberOrOwner } from "../middleware/auth.js"
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
         , createTaskHandler
         )
 
 router.route('/:task_id')
         .get
             ( authenticateAndAuthorizeAllRoles
             , authorizeProjectMemberOrOwner
             , getTaskByIdHandler
             )
         .put
             ( authenticateAndAuthorizeRoles('Engineer')
             , updateTaskHandler
             )
         .delete
             ( authenticateAndAuthorizeRoles('Field Manager')
             , deleteTaskHandler
             )
 
 export default router