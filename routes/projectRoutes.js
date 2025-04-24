import { Router } from "express";
import { attatchProjectToReq, createProjectHandler, getProjectByIdHandler, getProjectsHandler } from "../controllers/projectController.js";
import { authorizeAllRoles, authorizeProjectMemberOrOwner, authorizeRoles, dummyAuthenticate } from "../middleware/auth.js";


const router = Router();

// param is parsed for all routes on this router that contain it
router.param('project_id', attatchProjectToReq)

// use multiple route handlers in succession with next()
router.route('/')
    .get
        ( dummyAuthenticate
        , authorizeAllRoles
        , getProjectsHandler
        )
    .post
        ( dummyAuthenticate
        , authorizeRoles('Field Manager')
        , createProjectHandler
        )

router.route('/:project_id')
    .get
        ( dummyAuthenticate
        , authorizeAllRoles
        , authorizeProjectMemberOrOwner
        , getProjectByIdHandler
        )







