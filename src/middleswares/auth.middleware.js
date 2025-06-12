import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/async-handler.js"
import {ApiError} from "../utils/api-error.js"
import { User } from "../models/user.models.js"
import { ProjectMember } from "../models/projectmember.models.js"
import { mongoose } from "mongoose"

export const verifyJWT = asyncHandler(async (req, _, next) => {
	console.log("running verify jwt");

	try {
		const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "")
		
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

export const validateProjectPermission = (roles = []) => {
	return asyncHandler( async(req, res, next) => {
		const  projectId  = req.params.projectId;
	
		if(!projectId){
			throw new ApiError(400, 'Invalid projectId.')
		}

		const project = await ProjectMember.findOne({
			project: new mongoose.Types.ObjectId(projectId),
			user: new mongoose.Types.ObjectId(req.user._id)
		})
		
		if(!project){
			throw new ApiError(400, 'Project not found.')
		}

		const givenRole = project?.role

		req.user.role = givenRole

		if(!roles.includes(givenRole)){
			console.log(givenRole);
			
			throw new ApiError(403, 'You do not have permission to access this content.', [givenRole])
		}

		next()
	})
}