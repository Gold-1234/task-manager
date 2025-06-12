import { Router } from "express"
import { changeCurrentPassword, forgotPasswordRequest, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, resendEmailVerification, resetForgottenPassword, verifyEmail } from "../controllers/auth.controllers.js"
import { validate } from "../middleswares/validator.middleware.js"
import { userRegistrationValidator } from "../validators/index.js"
import { verifyJWT } from "../middleswares/auth.middleware.js"

const authRouter = Router()

authRouter.route("/register/").post(userRegistrationValidator(), validate, registerUser)
authRouter.route("/login/").post(loginUser)
authRouter.route("/verify-email/:unhashedToken").get(verifyJWT, verifyEmail)
authRouter.route("/resend-email/").get(verifyJWT, resendEmailVerification)
authRouter.route("/logout/").get(verifyJWT, logoutUser)
authRouter.route("/reset-password/").get(forgotPasswordRequest)
authRouter.route("/reset-password/:unhashedToken").post(resetForgottenPassword)
authRouter.route("/change-password").post(verifyJWT, changeCurrentPassword)
authRouter.route("/user").get(verifyJWT, getCurrentUser)
authRouter.route("/refreshToken").get(verifyJWT, refreshAccessToken)

export default authRouter