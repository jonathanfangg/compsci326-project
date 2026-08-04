import { Router } from "express";
import * as notesController from "../controllers/notesController.js";
import { requireLogin } from "../middleware/requireLogin.js";

const router = Router();

const asyncHandler = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};

router.get("/", asyncHandler(notesController.index));
router.post("/", requireLogin, asyncHandler(notesController.create));
router.delete("/:id", requireLogin, asyncHandler(notesController.destroy));

export default router;
