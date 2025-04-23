import { NotFoundError } from "../error/error.js"
import { attatchDocumentToReqById } from "../helpers.js"
import { Project, User } from "../model/model.js"



export const attatchUserToReq = attatchDocumentToReqById(User)

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