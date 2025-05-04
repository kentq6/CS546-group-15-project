import { Router } from "express";
import * as issueHandlers from "../controllers/issueController.js";
import { authenticateAndAuthorizeRoles, authorizeProjectMember } from "../middleware/auth.js";

const router = Router()

router.param('issue_id', issueHandlers.attatchIssueToRequest)

router.route('/')
    .post
        ( authenticateAndAuthorizeRoles('Field Manager', 'Engineer')
        , authorizeProjectMember
        , issueHandlers.createIssueHandler
        )

router.route('/:issue_id')
    .put
        ( authenticateAndAuthorizeRoles('Field Manager', 'Engineer')
        , authorizeProjectMember
        , issueHandlers.updateIssueHandler
        )

export default router