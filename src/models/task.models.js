import { Schema } from "mongoose"
import mongoose from mongoose

const TaskSchema = new Schema({
	title: {
		type: String,
		required: true,
		trim: true
	},
	status: {
		type: String,
		enum: AvailableTaskStatus,
		default: TaskStatusEnum.TODO,
		required: true
	},
	description: {
		type: String,
	},
	project: {
		type: Schema.Types.ObjectId,
		ref: "Project",
		required: [true, "Project reference is required"],
	},
	assignedBy: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true
	},
	assignedTo: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true
	},
	attachments: {
		type: [
			{
				url: String,
				MimeType: String,
				size: Number
			}
		],
		default: []
	},
	createdBy: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true
	}
},{
	timestamps: true
})

export const Task = mongoose.model("Task", TaskSchema)