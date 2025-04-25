import { Router } from "express"
import { attatchTargetUserToReq } from "../controllers/userController.js"

const router = Router()

router.param('target_user_id', attatchTargetUserToReq)

export default router