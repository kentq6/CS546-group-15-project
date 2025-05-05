import { Router } from "express";
import * as blueprintHandlers from "../controllers/blueprintController.js"
import * as authHandlers from "../middleware/auth.js"

const router = Router()

router.param('blueprint_id', blueprintHandlers.attatchBlueprintToReq)

router.route('/')
    .get
        ( authHandlers.authenticateAndAuthorizeAllRoles
        , authHandlers.authorizeProjectMemberOrOwner
        , blueprintHandlers.getAllBlueprintsHandler
        )
    .post
        ( authHandlers.authenticateAndAuthorizeRoles('Field Manager', 'Engineer')
        , authHandlers.authorizeProjectMember
        , blueprintHandlers.createBlueprintHandler
        )

router.route('/:blueprint_id')
    .get
        ( authHandlers.authenticateAndAuthorizeAllRoles
        , authHandlers.authorizeProjectMemberOrOwner
        , blueprintHandlers.getBlueprintByIdHandler
        )
    .put
        ( authHandlers.authenticateAndAuthorizeRoles('Field Manager', 'Engineer')
        , authHandlers.authorizeProjectMember
        , blueprintHandlers.updateBlueprintHandler
        )
    .delete
        ( authHandlers.authenticateAndAuthorizeRoles('Field Manager')
        , authHandlers.authorizeProjectMember
        , blueprintHandlers.deleteBlueprintHandler
        )


export default router