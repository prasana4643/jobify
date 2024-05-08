import User from "../models/UserModel.js";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcryptjs";
import { comparePassword, hashPassword } from "../utils/passwordUtils.js";
import { UnauthenticatedError } from "../errors/customErrors.js";
import { createJWT } from "../utils/tokenUtils.js";

export const register = async (request, response) => {
  const isFirstAccount = (await User.countDocuments()) === 0;
  request.body.role = isFirstAccount ? "admin" : "user";

  const hashedPassword = await hashPassword(request.body.password);
  request.body.password = hashedPassword;

  const user = await User.create(request.body);
  response.status(StatusCodes.CREATED).json({ msg: "user created" });
};

export const login = async (request, response) => {
  const email = request.body.email;

  const user = await User.findOne({ email });

  const isValidUser =
    user && (await comparePassword(request.body.password, user.password));

  if (!isValidUser) throw new UnauthenticatedError("invalid credentials");

  const token = createJWT({ userId: user._id, role: user.role });

  const oneDay = 1000 * 60 * 60 * 24;

  response.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === "production",
  });

  return response.send({ msg: "user logged in successfully" });
};

export const logout = (request, response) => {
  response.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  response.status(StatusCodes.OK).json({ msg: "user logged out successfully" });
};
