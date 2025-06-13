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
    const type = req.query.type
    
    let { projectId, taskId, subtaskId, noteId ,objectId } = req.params;
    
    if(type == "Project" && objectId){
      projectId = objectId
    }
    else if(type == "Task" && objectId){
      taskId = objectId
    }
    else if(type == "Subtask" && objectId){
      subtaskId = objectId
    }
    else if(type == "Note" && objectId){
      noteId = objectId
    }
    
    let id = projectId
    
    if(taskId){
      const task = await Task.findById(new mongoose.Types.ObjectId(taskId)).populate("project")
      if(!task){
        throw new ApiError(400, 'Task not found')
      }
      id = task.project._id
    }
    else if(subtaskId){
      const taskId = await SubTask.findById(new mongoose.Types.ObjectId(subtaskId)).populate("task")
      if(!taskId){
        throw new ApiError(400, 'Subtask not found')
      }
      id = taskId.task.project
      console.log(taskId.task.project);
      
    }
    else if(noteId){
      console.log(noteId);
      
      const note = await Note.findById(new mongoose.Types.ObjectId(noteId))
      
      if(!note){
        throw new ApiError(400, 'Note not found')
      }
      if(note.model == "Project"){
        id = note.object
      }else if(note.model == "Task"){
        taskId = note.object
        const task = await Task.findById(new mongoose.Types.ObjectId(taskId)).populate("project")
        if(!task){
          throw new ApiError(400, 'Task not found')
        }
        id = task.project._id        
      }
      
    }

    const project = await ProjectMember.findOne({
      project: new mongoose.Types.ObjectId(id),
      user: new mongoose.Types.ObjectId(req.user._id),
    });

    if (!project) {
      throw new ApiError(400, "Project not found.");
    }

    const givenRole = project?.role;

    req.user.role = givenRole;

    if (!roles.includes(givenRole)) {
      console.log(givenRole);

      throw new ApiError(
        403,
        "You do not have permission to access this content.",
        [givenRole],
      );
    }

    next();
  });
};

