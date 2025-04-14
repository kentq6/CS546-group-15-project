import { Router } from "express";
import { Project, User } from "../model/model";
import { NotFoundError } from "../error/error";

const router = Router();

router.param('user_id', async (req, res, next, id) => {
    try {
        const user = await User.findById(id)
        if (!user) {
            throw new NotFoundError('user not found')
        }
        req.user = user
        next()
    } catch (err) {
        next(err)
    }
})

router.param('project_id', async (req, res, next, id) => {
    try {
        const project = await Project.findById(id)
        if (!project)
            throw new NotFoundError('project not found')
        req.project = project
        next()
    } catch(err) {
        next(err)
    }
})

router.route('/:user_id/project')
    .get(async (req, res, next) => {
        try {
            
            const user = req.user
            const projects = await Project.find({members: user._id})
            res.json(projects)
        } catch (err) {
            next(err)
        }
    })
    .post(async (req, res, next) => {
        try {
            const 
        }
    })

router.route('/:user_id/project/:project_id')



