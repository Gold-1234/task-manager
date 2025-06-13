import { Note } from "../models/note.models.js"
import { Task    } from "../models/task.models.js"
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { authorizeNote } from "../utils/noteValidator.js";
import mongoose from "mongoose";
import { ProjectMember } from "../models/projectmember.models.js";

const getNotes = async (req, res) => {
  const id = req.params.id;
  const getNotes = await Note.find({parent: id})

  const notes = authorizeNote(getNotes, req.user.id);

  return res.status(200).json(
    new ApiResponse(200, "Notes fetched successfully.", notes)
  )
};

const getNoteById = async (req, res) => {
  // get note by id
  
  const id = req.params.noteId;
  const type = req.query.type;
  
  const note = await Note.findById(id)
  if(!note){
    throw new ApiError(400, "note not found.")
  }

  if(!['Project', 'Task'].includes(type)){
    throw new ApiError(400, "Invalid type specified");
  }

  const task = await Task.findById(note.project).populate('assignedTo')

  if(type == 'Task'){
    const authorized = task.assignedTo.toString() == req.user._id.toString() || req.user.role=='ADMIN'

    if(!authorized){
      throw new ApiError(401, "Unauthorized")
    }
  }

  if(type == 'Project'){
    const member = await ProjectMember.findOne({
      project: new mongoose.Types.ObjectId(note.project),
      user: new mongoose.Types.ObjectId(req.user._id)
    })

    if(!member){
      throw new ApiError(401, "Unauthorized")
    }
  }

  const newNote = authorizeNote([note]);

  return res.status(200).json(
    new ApiResponse(200, "Note fetched successfully.", newNote)
  )
};

const createNote = async (req, res) => {
  // create note
  const id = req.params.objectId;
  
  const { content } = req.body
  console.log(req.user.role);
  
  console.log(req.user.role == "member" ? true : false);
  
  const note = await Note.create(
    {
      object: new mongoose.Types.ObjectId(id),
      content: content,
      model: req.query.type.toString(),
      isPrivate: req.user.role == "member" ? true : false,
      createdBy: new mongoose.Types.ObjectId(req.user._id)
    }
  )

  return res.status(201).json(
    new ApiResponse(201, "Note created successfully.", note)
  )
};

const updateNote = async (req, res) => {
  // update note
  const id = req.params.noteId;
  const { content } = req.body

  const note = await Note.findById(new mongoose.Types.ObjectId(id))
  
  if(note.isPrivate && req.user._id.toString() !== note.createdBy.toString()){
    throw new ApiError(401, 'Unauthorized')
  }
  if(!note.isPrivate && req.user.role !== "admin"){
    throw new ApiError(401, 'Unauthorized')
  }

  note.content = content

  return res.status(201).json(
    new ApiResponse(201, "Note updated successfully.", note)
  )
};

const deleteNote = async (req, res) => {
  // delete note
  const id = req.params.noteId;
  console.log(id);
  
  const note = await Note.findById(new mongoose.Types.ObjectId(id))
  console.log(note);
  
  if(req.user._id.toString() === note.createdBy.toString()){
  const result = await Note.findByIdAndDelete(new mongoose.Types.ObjectId(id))
    
  return res.status(201).json(
    new ApiResponse(201, "Note deleted successfully.", result)
  )}
};

export { createNote, deleteNote, getNoteById, getNotes, updateNote };
