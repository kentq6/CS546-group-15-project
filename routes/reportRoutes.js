import { Router } from "express";
import * as reportHandlers from "../controllers/reportController.js";
import * as authHandlers from "../middleware/auth.js";
import issueRouter from './issueRoutes.js'
const router = Router()

router.param('report_id', reportHandlers.attatchReportToReq)

router.use('/:report_id/issues', issueRouter)

router.route('/')
    .get
        ( authHandlers.authenticateAndAuthorizeAllRoles
        , authHandlers.authorizeProjectMemberOrOwner
        , reportHandlers.getReportsHandler
        )
    .post
        ( authHandlers.authenticateAndAuthorizeRoles('Field Manager', 'Engineer')
        , authHandlers.authorizeProjectMember
        , reportHandlers.createReportHandler
        )
    
router.route('/:report_id')
    .get
        ( authHandlers.authenticateAndAuthorizeAllRoles
        , authHandlers.authorizeProjectMemberOrOwner
        , reportHandlers.getReportByIdHandler
        )
    .put
        ( authHandlers.authenticateAndAuthorizeRoles('Field Manager', 'Engineer')
        , authHandlers.authorizeProjectMember
        , reportHandlers.updateReportHandler
        )
    .delete
        ( authHandlers.authenticateAndAuthorizeRoles('Field Manager')
        , authHandlers.authorizeProjectMember
        , reportHandlers.deleteReportHandler
        )

export default router
    

