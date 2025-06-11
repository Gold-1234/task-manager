import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/async-handler.js"
import {ApiError} from "../utils/api-error.js"
import { User } from "../models/user.models.js"

export const verifyJWT = asyncHandler(async (req, _, next) => {
	console.log("running verify jwt");

	try {
		const token = req.cookies.accessToken 
		
		if(!token){
			throw new ApiError(401, 'Unauthorized')
		}
		const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

		const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
		if(!user)throw new ApiError(401, 'Unauthorized')
		req.user = user
		
		next()
	} catch (error) {
		throw new ApiError(401, error?.message || "Invalid access token")
	}
})