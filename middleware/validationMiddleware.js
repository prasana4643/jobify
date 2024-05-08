import { body, param, validationResult } from "express-validator";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/customErrors.js";
import { JOB_STATUS, JOB_TYPE, USER_ROLES } from "../utils/constants.js";
import mongoose from "mongoose";
import Job from "../models/JobModel.js";
import User from "../models/UserModel.js";

const withValidationErrors = (validateValues) => {
  return [
    validateValues,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMsgs = errors.array().map((error) => error.msg);
        if (errorMsgs[0].startsWith("no Job")) {
          throw new NotFoundError(errorMsgs);
        }
        if (errorMsgs[0].startsWith("not authorized")) {
          throw new UnauthorizedError("not authorized to access the route");
        }
        throw new BadRequestError(errorMsgs);
      }
      next();
    },
  ];
};

export const ValidateTest = withValidationErrors([
  [
    body("name")
      .notEmpty()
      .withMessage("name is required")
      .isLength({ min: 3, max: 10 })
      .withMessage("Length should be between 3 and 10 characters")
      .trim(),
  ],
]);

export const validateJobInput = withValidationErrors([
  body("company").notEmpty().withMessage("Company is required"),
  body("position").notEmpty().withMessage("Position is required"),
  body("jobLocation").notEmpty().withMessage("Job location is required"),
  body("jobStatus")
    .isIn(Object.values(JOB_STATUS))
    .withMessage("Job Status is required"),
  body("jobType")
    .isIn(Object.values(JOB_TYPE))
    .withMessage("Job type is required"),
]);

export const validateIdParams = withValidationErrors([
  param("id").custom(async (value, { req }) => {
    const isValid = mongoose.Types.ObjectId.isValid(value);
    if (!isValid) throw new BadRequestError("Invalid MongoDB Id");

    const job = await Job.findById(value);
    if (!job) throw new NotFoundError(`No job with the job id ${value}`);

    const isAdmin = req.user.role === "admin";
    const isOwner = req.user.userId === job.createdBy.toString();

    if (!isAdmin && !isOwner)
      throw new UnauthorizedError("not authorized to access the route");
  }),
]);

export const validateRegisterInput = withValidationErrors([
  body("name").notEmpty().withMessage("name is required"),
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("not a valid email id")
    .custom(async (email) => {
      const user = await User.findOne({ email });

      if (user) {
        throw new BadRequestError("Email ID already exists");
      }
    }),
  body("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 8 })
    .withMessage("Password length should be minimum 8 character long"),
  body("lastName").notEmpty().withMessage("lastname is required"),
  body("location").notEmpty().withMessage("location is required"),
]);

export const validateLoginInput = withValidationErrors([
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("invalid email format"),
  body("password").notEmpty().withMessage("password is required"),
]);

export const validateUpdateUser = withValidationErrors([
  body("name").notEmpty().withMessage("name is required"),
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("not a valid email")
    .custom(async (email, { req }) => {
      const user = await User.findOne({ email });

      if (user && user._id.toString() !== req.user.userId) {
        throw new BadRequestError("email already exists");
      }
    }),
  body("lastName").notEmpty().withMessage("lastname is required"),
  body("location").notEmpty().withMessage("location is required"),
]);
