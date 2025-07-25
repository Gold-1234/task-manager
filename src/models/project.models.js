import { Schema } from "mongoose";
import mongoose from "mongoose";

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tasks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Task",
      }
    ]
  },
  {
    timestamps: true,
  },
);

export const Project = mongoose.model("Project", projectSchema);
