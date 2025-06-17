import { Router } from "express";
import {
  validateProjectPermission,
  verifyJWT,
} from "../middleswares/auth.middleware.js";
import { UserRolesEnum } from "../utils/constants.js";
import { createNote, deleteNote, getNoteById, getNotes, updateNote } from "../controllers/notes.controllers.js";

const noteRouter  = Router();

noteRouter.use((req, res, next) => {
console.log("Incoming route:", req.method, req.originalUrl, req.params);
  next();
});

noteRouter.route("/:id").get(verifyJWT,validateProjectPermission([UserRolesEnum.MEMBER, UserRolesEnum.ADMIN]), getNotes);

noteRouter.route("/id/:id").get(
    verifyJWT,
    validateProjectPermission([UserRolesEnum.MEMBER, UserRolesEnum.ADMIN]),
    getNoteById,
  );
  
noteRouter.route("/create-note/:id").post(
  verifyJWT,
	validateProjectPermission([UserRolesEnum.MEMBER, UserRolesEnum.ADMIN]),
	createNote);

noteRouter.route("/update/:id").patch(
    verifyJWT,
    validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.MEMBER]),
    updateNote,
  );

noteRouter.route("/delete/:id").delete(
    verifyJWT,
    validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.MEMBER]),
    deleteNote,
  );
 

export default noteRouter;
