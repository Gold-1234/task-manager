import mongoose, { mongo } from "mongoose";
import { Project } from "../models/project.models.js";
import { Task } from "../models/task.models.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/uploadOnCloudinary.js";
import { ApiResponse } from "../utils/api-response.js";
import { AvailableTaskStatus } from "../utils/constants.js";
import { ApiError } from "../utils/api-error.js";
import { SubTask } from "../models/subtask.models.js";
import { User } from "../models/user.models.js";

// get all tasks
const getTasks = async (req, res) => {
  const { projectId } = req.params;
  
  const project = await Project.findById(new mongoose.Types.ObjectId(projectId)).populate('tasks')
  const tasks = project ? project.tasks : [];
  if (!tasks) {
    throw new ApiError(404, "Tasks not found.");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Tasks fetched successfully.", tasks));
};

const getUserTasks = async (req, res) => {
  
  const tasks = await Task.find(
                      {
                        $or:[
                          {assignedBy: req.user._id},
                          {assignedTo: req.user._id}
                          ]
                      }
                    ) || []
  if (!tasks) {
    throw new ApiError(404, "Tasks not found.");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Tasks fetched successfully.", tasks));
};

// get task by id
const getTaskById = async (req, res) => {
  const taskId = req.params.taskId;
  console.log(taskId);
  
  const task = await Task.findById(
    new mongoose.Types.ObjectId(taskId),
  );
  if (!task) {
    throw new ApiError(404, "Task not found.");
  }
  return res
    .status(200)
    .json(new ApiResponse(201, "Task fetched successfully.", task));
};

// create task
const createTask = async (req, res) => {
  console.log(req.body);
  
  const user = req.user._id;
  const { projectId } = req.params
  const { title, description, assignedTo } = req.body;

  const project = await Project.findOne(
    {
      _id: new mongoose.Types.ObjectId(projectId),
      createdBy: new mongoose.Types.ObjectId(req.user._id)
    }
  )
  if (!project) {
      throw new ApiError(400, "Invalid projectId.");
  }
  if (!title) {
      throw new ApiError(400, "Title is required.");
  }

  const attachments = req.files || []
  const filePaths = attachments?.map(file => ({path: file.path, mimetype: file.mimetype}))
  
  const uploadedFiles = []
  try {
    for(const file of filePaths){
      try {
        const upload = await uploadOnCloudinary(file.path)
       
        if(upload?.url)
        uploadedFiles.push(
              {
                url: upload.url,
                MimeType: file.mimetype,
                size: upload.bytes
              }
            )
      } catch (error) {
        console.log(error);
      }
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      createdBy: new mongoose.Types.ObjectId(user),
      attachments: uploadedFiles,
      assignedBy: user,
      assignedTo: assignedTo
    });

    await task.save({validateBeforeSave: false})

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Task successfully created : )", [
          task,
        ]),
      );
  } catch (error) {
    console.log("error creating task", error);
    if(upload){
    for(const file of uploadedFiles){
      const result = await deleteFromCloudinary(file.public_id, resource_type='raw')
      console.log(result); 
    }}
    throw new ApiError(409, "task couldn't be created", [error.message]);
  }  
};

// update task
const updateTask = async (req, res) => {
  const { title, description, status, assignedTo } = req.body;

  if(status && !AvailableTaskStatus.includes(status)){
    throw new ApiError(500, "Invalid status")
  }
  try {
    const task = await Task.findById(req.params.taskId);

    if(req.user._id.toString() !== task.createdBy.toString()){
      return res.status(401).json(
        new ApiResponse(401, 'Unauthorized.')
      )
    }
    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.status = status ?? task.status;
    task.assignedTo = assignedTo ?? task.assignedTo;

    const attachments = req.files || []
    const filePaths = attachments?.map(file => ({path: file?.path, mimetype: file.mimetype}))
    console.log("filePaths", filePaths);
        
    const uploadedFiles = []

    for(const file of filePaths){
        const upload = await uploadOnCloudinary(file.path)
        if(upload?.url)
          uploadedFiles.push(
                {
                  url: upload.url,
                  MimeType: file.mimetype,
                  size: upload.bytes
                }
          )}
          console.log(uploadedFiles);
          
        if(uploadedFiles.length > 0){
          task.attachments.push(...uploadedFiles)          
        }
      return res
        .status(200)
        .json(new ApiResponse(200, "Task updated.", task));
    }
    catch (error) {
      if (error instanceof ApiError) {
              return res.status(error.statusCode).json({
                  statusCode: error.statusCode,
                  message: error.message,
                  success: false,
              });
          }
      if(upload){
      for(const file of uploadedFiles){
        const result = await deleteFromCloudinary(file.public_id, resource_type='raw')
        console.log(result); 
      }}
      console.log("error updating task", error);
      return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong while updating task",
            success: false,
        });
    }
  }

// delete task
const deleteTask = async (req, res) => {
  // delete task
  const { taskId } = req.params;

  try {
    const task = await Task.findById(new mongoose.Types.ObjectId(taskId))

    if(req.user._id.toString() !== task.createdBy.toString()){
      return res.status(401).json(
        new ApiResponse(401, 'Unauthorized.')
      )
    }
    await Task.deleteOne({ _id: taskId });
    
    return res.status(200).json(new ApiResponse(200, 'task deleted successfully'))
  } catch (error) {
    console.log("error deleting task", error);
    throw new ApiError(400, "Error deleting task", [error.message]);
  }
};

const getSubTaskById = async (req, res) => {
  const subtaskId = req.params.subtaskId;
  
  const task = await subTask.findById(
    new mongoose.Types.ObjectId(subtaskId),
  );
  if (!task) {
    throw new ApiError(404, "Task not found.");
  }
  if(req.user._id.toString() !== task.createdBy.toString() || req.user.role === "ADMIN"){
      return res.status(401).json(
        new ApiResponse(401, 'Unauthorized.')
      )
    }
  return res
    .status(200)
    .json(new ApiResponse(201, "Task fetched successfully.", task));
};

// create subtask
const createSubTask = async (req, res) => {
  // create subtask
  
  const user = req.user._id;
  const { taskId } = req.params
  const { title, description } = req.body;

  if (!title) {
    throw new ApiError(400, "Title is required.");
  }
  
  const task = await Task.findOne(
    {
      _id: new mongoose.Types.ObjectId(taskId),
      createdBy: new mongoose.Types.ObjectId(req.user._id)
    }
  )
  if (!task) {
      throw new ApiError(400, "Invalid taskId.");
  }

  try {
    const subTask = await SubTask.create({
      title,
      description,
      task: taskId,
      createdBy: new mongoose.Types.ObjectId(user),
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Subtask successfully created : )", [
          subTask,
        ]),
      );
  } catch (error) {
    console.log("error creating Subtask", error);
    throw new ApiError(409, "Subtask couldn't be created", [error.message]);
  }  
};

// update subtask
const updateSubTask = async (req, res) => {
  // update subtask
  const { title, description, status } = req.body;
  if(!title && !description && !status){
    return res.status(200).json(new ApiResponse(200, 'Nothing to update.'))
  }
  if(status && !AvailableTaskStatus.includes(status)){
    throw new ApiError(500, "Invalid status")
  }
  
  try {
    const subTask = await SubTask.findOne({_id: req.params.subtaskId});
    if(req.user._id.toString() !== subTask.createdBy.toString() || req.user.role === "ADMIN"){
      return res.status(401).json(
        new ApiResponse(401, 'Unauthorized.')
      )
    }
    subTask.title = title ?? subTask.title;
    subTask.description = description ?? subTask.description;
    subTask.status = status ?? subTask.status;
   
    await subTask.save({validateBeforeSave: false})

    return res
      .status(200)
      .json(new ApiResponse(200, "Subtask updated.", subTask));

  } catch (error) {
    if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
                statusCode: error.statusCode,
                message: error.message,
                success: false,
            });
        }
    console.log("error updating task", error);
    return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong while updating task",
            success: false,
        });
  }
};

// delete subtask
const deleteSubTask = async (req, res) => {
  const { subtaskId } = req.params;

  const subtask = await SubTask.findById(new mongoose.Types.ObjectId(subtaskId))
  if(req.user._id.toString() !== subtask.createdBy.toString()){
      return res.status(401).json(
        new ApiResponse(401, 'Unauthorized.')
      )
    }
  try {
    await SubTask.deleteOne({ id: subtaskId });
    return res.status(200).json('Subtask deleted.')
  } catch (error) {
    console.log("error deleting subtask", error);
    throw new ApiError(400, "Error deleting subtask", [error.message]);
  }
};

export {
  createSubTask,
  createTask,
  getUserTasks,
  deleteSubTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateSubTask,
  updateTask,
  getSubTaskById
};
