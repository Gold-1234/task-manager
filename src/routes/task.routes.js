import { Router } from "express";
import {
  validateProjectPermission,
  verifyJWT,
} from "../middleswares/auth.middleware.js";
import { UserRolesEnum } from "../utils/constants.js";
import { upload } from "../middleswares/multer.middleware.js";
import { createSubTask, createTask, deleteSubTask, deleteTask, getSubTaskById, getTaskById, getTasks, getUserTasks, updateSubTask, updateTask } from "../controllers/task.controllers.js";
import { getNoteById } from "../controllers/notes.controllers.js";

const taskRouter  = Router();

taskRouter.use((req, res, next) => {
console.log("Incoming route:", req.method, req.originalUrl, req.params);
  next();
});
taskRouter.route("/").get(verifyJWT, getUserTasks);

taskRouter.route("/:id").get(verifyJWT, getTasks);

taskRouter.route("/:id").get(
    verifyJWT,
    validateProjectPermission([UserRolesEnum.MEMBER, UserRolesEnum.ADMIN]),
    getTaskById,
  );
  
taskRouter.route("/create/:id").post(
  verifyJWT,
  validateProjectPermission([UserRolesEnum.ADMIN]),
  upload.array('attachments', 10),
	createTask);

taskRouter.route("/update/:id").patch(
    verifyJWT,
    validateProjectPermission([UserRolesEnum.ADMIN]),
    upload.array('attachments', 10),
    updateTask,
  );

taskRouter.route("/delete/:id").delete(
    verifyJWT,
    validateProjectPermission([UserRolesEnum.ADMIN]),
    deleteTask,
  );

taskRouter.route("/:id").get(
    verifyJWT,
    validateProjectPermission([UserRolesEnum.MEMBER, UserRolesEnum.ADMIN]),
    getSubTaskById,
  );

taskRouter.route("/create-subTask/:id").post(
  verifyJWT,
	createSubTask);

taskRouter.route("/update-subTask/:id").patch(
    verifyJWT,
    validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.ADMIN]),
    updateSubTask,
  );

taskRouter.route("/delete-subtask/:id").delete(
    verifyJWT,
    validateProjectPermission([UserRolesEnum.ADMIN]),
    deleteSubTask,
  );

export default taskRouter;
