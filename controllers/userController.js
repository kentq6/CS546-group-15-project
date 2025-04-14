import { NotFoundError } from "../error/error.js"
import { Project, User } from "../model/model.js"



export const attatchUserToReq = async (req, res, next, id) => {
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
}

export const getProjectsByUser = async (req, res, next) => {
    try {
        const user = req.user
        // byMemberId is a custom mongoose queryHelper I made in the model
        const projects = await Project.find().byMemberId(user._id)
        res.status(200).json(projects)
    } catch (err) {
        next(err)
    }
}