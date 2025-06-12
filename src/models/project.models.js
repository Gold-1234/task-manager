import { Schema } from "mongoose"
import mongoose from "mongoose"
import { User } from "./user.models.js"

const projectSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: false,
	},
	createdBy: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
	}
	},
	{
		timestamps: true
	}
)

export const Project = mongoose.model("Project", projectSchema)