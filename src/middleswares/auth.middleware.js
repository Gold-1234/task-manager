import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { User } from "../models/user.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { mongoose } from "mongoose";
import { Note } from "../models/note.models.js";
import { Task } from "../models/task.models.js";
import { SubTask } from "../models/subtask.models.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  console.log("running verify jwt");

  try {
    const token =
      req.cookies.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized");
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken",
    );
    if (!user) throw new ApiError(401, "Unauthorized");
    req.user = user;

    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export const validateProjectPermission = (roles = []) => {
  return asyncHandler(async (req, res, next) => {
    const type = req.query.type || req.params.type;
    const id = req.params.id;

    if (!type || !id) {
      throw new ApiError(400, 'Type and ID parameters are required');
    }

    let projectId;

    // Get project ID based on type
    switch (type.toLowerCase()) {
      case 'project':
        projectId = id;
        break;
      case 'task':
        const task = await Task.findById(new mongoose.Types.ObjectId(id))
          .populate('project');
        if (!task) {
          throw new ApiError(400, 'Task not found');
        }
        projectId = task.project._id;
        break;
      case 'subtask':
        const subtask = await SubTask.findById(new mongoose.Types.ObjectId(id))
          .populate('task');
        if (!subtask) {
          throw new ApiError(400, 'Subtask not found');
        }
        projectId = subtask.task.project._id;
        break;
      case 'note':
        const note = await Note.findById(new mongoose.Types.ObjectId(id));
        if (!note) {
          throw new ApiError(400, 'Note not found');
        }
        if (note.model === 'Project') {
          projectId = note.object;
        } else if (note.model === 'Task') {
          const task = await Task.findById(new mongoose.Types.ObjectId(note.object))
            .populate('project');
          if (!task) {
            throw new ApiError(400, 'Task not found');
          }
          projectId = task.project._id;
        } else {
          throw new ApiError(400, 'Invalid note model');
        }
        break;
      default:
        throw new ApiError(400, 'Invalid type specified');
    }

    // Check project membership
    const projectMember = await ProjectMember.findOne({
      project: new mongoose.Types.ObjectId(projectId),
      user: new mongoose.Types.ObjectId(req.user._id),
    });

    if (!projectMember) {
      throw new ApiError(403, 'You do not have access to this project');
    }

    // Set user role and check permissions
    req.user.role = projectMember.role;
    if (!roles.includes(projectMember.role)) {
      throw new ApiError(403, 'You do not have permission to access this content', [projectMember.role]);
    }

    next();
  });
};

