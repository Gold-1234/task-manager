import { Schema } from "mongoose"
import mongoose from mongoose

const subtaskSchema = new Schema({
	title: {
		type: String,
		required: true,
		trim: true
	},
	task :{
		type: Schema.Types.ObjectId,
		ref: "Task",
		required: true
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
	createdBy: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true
	}
},{
	timestamps: true
})

export const subTask = mongoose.model("subTask", subtaskSchema)