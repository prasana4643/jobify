import { Router } from "express";
import {
  getApplicationStats,
  getCurrentUser,
  updateUser,
} from "../controller/userController.js";
import { validateUpdateUser } from "../middleware/validationMiddleware.js";
import {
  authorizePermissions,
  checkForTestUser,
} from "../middleware/authMiddleware.js";
import upload from "../middleware/multerMiddleware.js";

const router = Router();

router.patch(
  "/update-user",
  checkForTestUser,
  upload.single("avatar"),
  validateUpdateUser,
  updateUser
);
router.get("/current-user", getCurrentUser);
router.get("/admin/stats", [
  authorizePermissions("admin"),
  getApplicationStats,
]);

export default router;
