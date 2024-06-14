import express from 'express'
// import { checkIfUserVoted, getProfile, login, registerAsAdmin, registerAsVoter } from '../controllers/user.controller.js'
import { getProfile,login,registerAsAdmin,registerAsUser } from '../controllers/user.controller.js'
import { validateLogin, validateUserRegistration } from '../validators/user.validator.js'
import authenticate from '../middlewares/auth.middleware.js'
import user from '../middlewares/user.middleware.js'
const router = express.Router()

router.get("/profile", authenticate, getProfile)

router.post("/admin/register",validateUserRegistration,registerAsAdmin)

router.post("/user/register",validateUserRegistration,registerAsUser)

router.post("/login", validateLogin, login)

export default router;