import { Router } from "express";
import * as issueHandlers from "../controllers/issueController.js";
import * as authHandlers from "../middleware/auth.js";

const router = Router()

router.param('issue_id', issueHandlers.attatchIssueToRequest)

router.route('/')
    .post
        ( authHandlers.authenticateAndAuthorizeRoles('Field Manager', 'Engineer')
        , authHandlers.authorizeProjectMember
        , issueHandlers.createIssueHandler
        )

router.route('/:issue_id')
    .put
        ( authHandlers.authenticateAndAuthorizeRoles('Field Manager', 'Engineer')
        , authHandlers.authorizeProjectMember
        , issueHandlers.updateIssueHandler
        )
    // TODO?: do we really need a delete issues route

export default router