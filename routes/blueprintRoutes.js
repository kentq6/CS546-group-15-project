import { Router } from "express";
import 
    { attatchBlueprintToReq
    , createBlueprintHandler
    , deleteBlueprintHandler
    , getAllBlueprintsHandler
    , getBlueprintByIdHandler
    , updateBlueprintHandler
    } from "../controllers/blueprintController.js"

import 
    { authenticateAndAuthorizeAllRoles
    , authenticateAndAuthorizeRoles
    , authorizeProjectMember
    , authorizeProjectMemberOrOwner
    } from "../middleware/auth.js";


const router = Router()

router.param('blueprint_id', attatchBlueprintToReq)

router.route('/')
    .get
        ( authenticateAndAuthorizeAllRoles
        , authorizeProjectMemberOrOwner
        , getAllBlueprintsHandler
        )
    .post
        ( authenticateAndAuthorizeRoles('Field Manager', 'Engineer')
        , authorizeProjectMember
        , createBlueprintHandler
        )

router.route('/:blueprint_id')
    .get
        ( authenticateAndAuthorizeAllRoles
        , authorizeProjectMemberOrOwner
        , getBlueprintByIdHandler
        )
    .put
        ( authenticateAndAuthorizeRoles('Field Manager', 'Engineer')
        , authorizeProjectMember
        , updateBlueprintHandler
        )
    .delete
        ( authenticateAndAuthorizeRoles('Field Manager')
        , authorizeProjectMember
        , deleteBlueprintHandler
        )


export default router