import { Router } from "express";
import {
  validateProjectPermission,
  verifyJWT,
} from "../middleswares/auth.middleware.js";
import { UserRolesEnum } from "../utils/constants.js";
import { upload } from "../middleswares/multer.middleware.js";
import { createSubTask, createTask, deleteSubTask, deleteTask, getTaskById, getTasks, updateTask } from "../controllers/task.controllers.js";
import { createNote, deleteNote, getNoteById, getNotes, updateNote } from "../controllers/notes.controllers.js";

const noteRouter  = Router();

noteRouter.use((req, res, next) => {
console.log("Incoming route:", req.method, req.originalUrl, req.params);
  next();
});

noteRouter.route("/:objectId").get(verifyJWT,validateProjectPermission([UserRolesEnum.MEMBER, UserRolesEnum.ADMIN]), getNotes);

noteRouter.route("/id/:noteId").get(
    verifyJWT,
    validateProjectPermission([UserRolesEnum.MEMBER, UserRolesEnum.ADMIN]),
    getNoteById,
  );
  
noteRouter.route("/create-note/:objectId").post(
  verifyJWT,
	validateProjectPermission([UserRolesEnum.MEMBER, UserRolesEnum.ADMIN]),
	createNote);

noteRouter.route("/update/:noteId").patch(
    verifyJWT,
    validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.MEMBER]),
    updateNote,
  );

noteRouter.route("/delete/:noteId").delete(
    verifyJWT,
    validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.MEMBER]),
    deleteNote,
  );
 

export default noteRouter;
