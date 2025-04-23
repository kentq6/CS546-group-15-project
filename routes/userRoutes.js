import { Router } from "express"
import { getProjectsByUser } from "../controllers/userController.js"
import { attatchUserToReq } from "../controllers/userController.js"

const router = Router()

router.param('user_id', attatchUserToReq)

export default router