import { Router } from "express";
import * as searchController from "../controllers/searchController.js";

const router = Router();

router.get("/", searchController.redirect);

export default router;
