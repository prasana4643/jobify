import User from "../models/UserModel.js";
import Job from "../models/JobModel.js";
import { StatusCodes } from "http-status-codes";
import cloudinary from "cloudinary";
import { promises as fs } from "fs";

export const getCurrentUser = async (request, response) => {
  const user = await User.findOne({ _id: request.user.userId });

  const userWithoutPassword = user.toJSON();
  if (!user) throw new Error("Not Found");
  response.status(StatusCodes.OK).json({ user: userWithoutPassword });
};

export const getApplicationStats = async (request, response) => {
  const users = await User.countDocuments();
  const jobs = await Job.countDocuments();
  response.status(StatusCodes.OK).json({ users, jobs });
};

export const updateUser = async (request, response) => {
  const newUser = { ...request.body };
  delete newUser.password;

  if (request.file) {
    const response = await cloudinary.v2.uploader.upload(request.file.path);
    await fs.unlink(request.file.path);

    newUser.avatar = response.secure_url;
    newUser.avatarPublicId = response.public_id;
  }

  const updatedUser = await User.findByIdAndUpdate(
    request.user.userId,
    newUser
  );

  if (request.file && updatedUser.avatarPublicId) {
    cloudinary.v2.uploader.destroy(updatedUser.avatarPublicId);
  }
  response.status(StatusCodes.OK).json({ msg: "update user" });
};
