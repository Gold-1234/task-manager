import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { mongoose } from "mongoose";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";

const getProjects = async (req, res) => {
  const user = req.user;
  
  const projects = await Project.findOne({
    createdBy: user._id
  })
  if(!projects){
    throw new ApiError(404, 'Projects not found.')
  }
  return res.status(200).json(
    new ApiResponse(200, 'Projects fetched successfully.', [projects])
  )
};

const getProjectById = async (req, res) => {
  // get project by id
  const projectId = req.params.projectId;

  const project = await Project.findById(new mongoose.Types.ObjectId(projectId));
  if(!project){
    throw new ApiError(404, 'Project not found.')
  }
  return res.status(200).json(
    new ApiResponse(200, 'Project fetched successfully.', project)
  )
};

const createProject = async (req, res) => {
  // create project
  const user = req.user._id;
  const {name, description} = req.body;
  if(!name || !description){
    throw new ApiError(400, 'Both name and description are required.')
  }
  try {
    const project = await Project.create(
      { 
        name,
        description,
        createdBy: new mongoose.Types.ObjectId(user)
      }
    )

    const projectMember = await ProjectMember.create(
      { 
        user,
        project : project?.id,
        role: UserRolesEnum.ADMIN
      }
    )
  
    return res.status(200).json(
      new ApiResponse(200, 'Project successfully created : )', [project, projectMember])
    )
  } catch (error) {
    console.log("error creating project", error);
    throw new ApiError(409, "project couldn't be created", [error.message])
  }
  
};

const updateProject = async (req, res) => {
  // update project
  const {_id} = req.user;
  const {name, description} = req.body;
  try {
    const project = getProjectById(req.params.projectId)
    project.name = name ?? project.name;
    project.description = description ?? project.description;
    return res.status(200).json(
      new ApiResponse(200, 'Project updated.', project)
    )
  } catch (error) {
    console.log("error updating project", error);
    throw new ApiError(409, 'project couldn\'t be updated', [error.message])
  }
};

const deleteProject = async (req, res) => {
  // delete project
  const { projectId } = req.params

  try {
    await Project.deleteOne({projectId}) 
  } catch (error) {
    console.log("error deleting project", error)
    throw new ApiError(400, 'Error deleting project', [error.message])
  }
};

const getProjectMembers = async (req, res) => {
  // get project members
  const { projectId } = req.params;
  try {
    const projectMembers = await ProjectMember.find({project: new mongoose.Types.ObjectId(projectId)})

    return res.status(200).json(
      new ApiResponse(200, 'Members fetched successfully', projectMembers)
    )
  } catch (error) {
    console.log("Error fetching members.", error);
    throw new ApiError(400, "Error fetching members.", [error.message])
  }
};

const addMemberToProject = async (req, res) => {
  // add member to project
  const { projectId } = req.params;
  const user = req.body.user;
  try {
    const exists = await ProjectMember.findOne
    (
      {
        user: new mongoose.Types.ObjectId(user),
        project: new mongoose.Types.ObjectId(projectId),

      }
    )
    if(exists){
      throw new ApiError(400, "Already a member.")
    }
    const member = await ProjectMember.create({
      user: new mongoose.Types.ObjectId(user),
      project: new mongoose.Types.ObjectId(projectId),

    })

    return res.status(200).json(
      new ApiResponse(200, 'Members added successfully', member)
    )
  } catch (error) {
    console.log("Error adding member.", error);
    throw new ApiError(400, "Error adding member.", [error.message])
  }
};

const deleteMember = async (req, res) => {
  // delete member from project
  const { projectId } = req.params;
  const user = req.body.user;
  try {
    const member = await ProjectMember.deleteOne({
      user: new mongoose.Types.ObjectId(user),
      project: new mongoose.Types.ObjectId(projectId),
    })

    return res.status(200).json(
      new ApiResponse(200, 'Member deleted successfully', member)
    )
  } catch (error) {
    console.log("Error deleted member.", error);
    throw new ApiError(400, "Error deleted member.", [error.message])
  }
};

const updateMemberRole = async (req, res) => {
  // update member role
  const {  projectId } = req.params;
  const { role, user } = req.body;
  if(!AvailableUserRoles.includes(role)){
    throw new ApiError(400, 'Invalid role')
  }
  try {
    const update = await ProjectMember.findOneAndUpdate(
      {
        user: new mongoose.Types.ObjectId(user),
        project : new mongoose.Types.ObjectId(projectId)
      }, {
        role: role
      },
      {
        new: true
      }
    )
    if(!update){
      throw new ApiError(400, 'Member not found')
    }
    return res.status(200).json(new ApiResponse(200, 'Role updated successfully', update))

  } catch (error) {
    console.log(error)
    throw new ApiError(400, "Error updating role.", [error.message])
  }
};

export {
  addMemberToProject,
  createProject,
  deleteMember,
  deleteProject,
  getProjectById,
  getProjectMembers,
  getProjects,
  updateMemberRole,
  updateProject,
};