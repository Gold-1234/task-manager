import { Router } from "express";
import {
  addMemberToProject,
  createProject,
  deleteMember,
  deleteProject,
  getProjectById,
  getProjectMembers,
  getProjects,
  getProjectsByUser,
  updateMemberRole,
  updateProject,
} from "../controllers/project.controllers.js";
import {
  validateProjectPermission,
  verifyJWT,
} from "../middleswares/auth.middleware.js";
import { UserRolesEnum } from "../utils/constants.js";

const projectRouter = Router();

projectRouter.use((req, res, next) => {
  console.log("Incoming route:", req.method, req.originalUrl, req.params);
  next();
});

projectRouter.route("/").get(verifyJWT, validateProjectPermission([UserRolesEnum.MEMBER, UserRolesEnum.ADMIN]), getProjects);
projectRouter.route("/myProjects").get(verifyJWT, getProjectsByUser);

projectRouter
  .route("/:projectId")
  .get(
    verifyJWT,
    validateProjectPermission([UserRolesEnum.MEMBER, UserRolesEnum.ADMIN]),
    getProjectById,
  );
projectRouter.route("/create").post(verifyJWT, createProject);
projectRouter
  .route("/update/:projectId")
  .patch(
    verifyJWT,
    validateProjectPermission([UserRolesEnum.ADMIN]),
    updateProject,
  );
projectRouter
  .route("/delete/:projectId")
  .delete(
    verifyJWT,
    validateProjectPermission([UserRolesEnum.ADMIN]),
    deleteProject,
  );
projectRouter
  .route("/members/:projectId")
  .get(
    verifyJWT,
    validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.MEMBER]),
    getProjectMembers,
  );
projectRouter
  .route("/add_member/:projectId")
  .post(
    verifyJWT,
    validateProjectPermission([UserRolesEnum.ADMIN]),
    addMemberToProject,
  );
projectRouter
  .route("/delete_member/:projectId")
  .delete(
    verifyJWT,
    validateProjectPermission([UserRolesEnum.ADMIN]),
    deleteMember,
  );
projectRouter
  .route("/update_role/:projectId")
  .patch(
    verifyJWT,
    validateProjectPermission([UserRolesEnum.ADMIN]),
    updateMemberRole,
  );

export default projectRouter;
