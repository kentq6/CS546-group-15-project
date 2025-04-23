import { Router } from "express";
import { attatchProjectToReq, createProjectHandler, getProjectById } from "../controllers/projectController";


const router = Router();

// param is parsed for all routes on this router that contain it
router.param('project_id', attatchProjectToReq)

// use multiple route handlers in succession with next()
router.route('/')
    .post(createProjectHandler)

// TODO: add ability to add multiple users to a project
router.route('/:project_id')
    .get(getProjectById)







