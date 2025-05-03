import { Router } from "express";
import * as reportHandlers from "../controllers/reportController.js";
import { authenticateAndAuthorizeAllRoles, authenticateAndAuthorizeRoles, authorizeProjectMember, authorizeProjectMemberOrOwner } from "../middleware/auth.js";
import issueRouter from './issueRoutes.js'
const router = Router()

router.param('report_id', reportHandlers.attatchReportToReq)

router.use('/:report_id/issues', issueRouter)

router.route('/')
    .get
        ( authenticateAndAuthorizeAllRoles
        , authorizeProjectMemberOrOwner
        , reportHandlers.getReportsHandler
        )
    .post
        ( authenticateAndAuthorizeRoles('Field Manager', 'Engineer')
        , authorizeProjectMember
        , reportHandlers.createReportHandler
        )
    
router.route('/:report_id')
    .get
        ( authenticateAndAuthorizeAllRoles
        , authorizeProjectMemberOrOwner
        , reportHandlers.getReportByIdHandler
        )
    .put
        ( authenticateAndAuthorizeRoles('Field Manager', 'Engineer')
        , authorizeProjectMember
        , reportHandlers.updateReportHandler
        )
    .delete
        ( authenticateAndAuthorizeRoles('Field Manager')
        , authorizeProjectMember
        , reportHandlers.deleteReportHandler
        )

export default router
    

