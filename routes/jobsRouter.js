import { Router } from "express";
const router = Router();
import {
  validateJobInput,
  validateIdParams,
} from "../middleware/validationMiddleware.js";

import {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  showStats,
} from "../controller/jobController.js";
import { checkForTestUser } from "../middleware/authMiddleware.js";

checkForTestUser;
// router.get("/", getAllJobs);
// router.post("/", createJob);

//chained
router
  .route("/")
  .get(getAllJobs)
  .post(checkForTestUser, validateJobInput, createJob);

router.route("/stats").get(showStats);

router
  .route("/:id")
  .get(validateIdParams, getJob)
  .patch(checkForTestUser, validateJobInput, validateIdParams, updateJob)
  .delete(checkForTestUser, validateIdParams, deleteJob);

export default router;
