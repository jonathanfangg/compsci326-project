import { Router } from "express";
import * as authController from "../controllers/authController.js";

const router = Router();

router.get("/login", authController.loginPage);
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", authController.me);

export default router;
