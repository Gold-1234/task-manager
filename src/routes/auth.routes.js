import { Router } from "express"
import { changeCurrentPassword, forgotPasswordRequest, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, resendEmailVerification, resetForgottenPassword, verifyEmail } from "../controllers/auth.controllers.js"
import { validate } from "../middleswares/validator.middleware.js"
import { userRegistrationValidator } from "../validators/index.js"
import { verifyJWT } from "../middleswares/auth.middleware.js"

const router = Router()

router.route("/register/").post(userRegistrationValidator(), validate, registerUser)
router.route("/login/").post(loginUser)
router.route("/verify-email/:unhashedToken").get(verifyJWT, verifyEmail)
router.route("/resend-email/").get(verifyJWT, resendEmailVerification)
router.route("/logout/").get(verifyJWT, logoutUser)
router.route("/reset-password/").get(forgotPasswordRequest)
router.route("/reset-password/:unhashedToken").post(resetForgottenPassword)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/user").get(verifyJWT, getCurrentUser)
router.route("/refreshToken").get(verifyJWT, refreshAccessToken)







export default router