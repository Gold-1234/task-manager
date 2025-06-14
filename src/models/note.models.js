import { Schema } from "mongoose"
import mongoose from "mongoose"

const noteSchema = new Schema({
		object: {
			type: Schema.Types.ObjectId,
			required: true
		},
		model:{
			type: String,
			enum: ["Project", "Task"],
			required: true
		},
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true
		},
		content: {
			type: String,
			required: true
		},
		isPrivate: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true
	})

export const Note = mongoose.model("Note", noteSchema)