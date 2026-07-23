import { Router } from "express";
import * as notesController from "../controllers/notesController.js";

const router = Router();

const asyncHandler = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};

router.get("/", asyncHandler(notesController.index));
router.post("/", asyncHandler(notesController.create));

export default router;
