import "express-async-errors";
import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
const app = express();
import morgan from "morgan";
import jobsRouter from "./routes/jobsRouter.js";
import authRouter from "./routes/authRouter.js";
import errorHandlerMiddleware from "./middleware/errorHandlerMiddleware.js";
import mangoose from "mongoose";
import cloudinary from "cloudinary";
import { authenticateUser } from "./middleware/authMiddleware.js";
import cookieParser from "cookie-parser";
import userRouter from "./routes/userRouter.js";

//public
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// fetch("https://www.course-api.com/react-useReducer-cart-project")
//   .then((res) => res.json())
//   .then((data) => console.log(data));

// const getData = async () => {
//   const response = await fetch(
//     "https://www.course-api.com/react-useReducer-cart-project"
//   );

//   const cartData = await response.json();
//   console.log(cartData);
// };

// try {
//   const response = await fetch(
//     "https://www.course-api.com/react-useReducer-cart-project"
//   );

//   const cartData = await response.json();
//   console.log(cartData);
// } catch (error) {
//   console.log(error);
// }

if (process.env.NODE_ENV == "development") {
  app.use(morgan("dev"));
}

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

app.use(express.static(path.resolve(__dirname, "./public")));
app.use(cookieParser());
app.use(express.json());

app.get("/api/v1/test", (request, response) => {
  response.json({ msg: "Hello, Prasana!" });
});

app.post("/", (request, response) => {
  console.log("Request::: " + request);
  response.send({ message: "data received", data: request.body });
});

//auth
app.use("/api/v1/auth", authRouter);
//jobs
app.use("/api/v1/jobs", authenticateUser, jobsRouter);
//users
app.use("/api/v1/users", authenticateUser, userRouter);

app.get("*", (request, response) => {
  response.sendFile(path.resolve(__dirname, "./public", "index.html"));
});

//not found
app.get("*", (request, response) => {
  response.status(404).json({ msg: "not found" });
});

// app.post("/api/v1/test", ValidateTest, (request, response) => {
//   const { name } = request.body;
//   return response.status(200).json({ message: `Hello, ${name}` });
// });

app.get("/api/v1/test", (request, response) => {
  response.json({ msg: "Hello World" });
});

app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5100;

try {
  await mangoose.connect(process.env.MONGO_URL);
  app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
  });
} catch (error) {
  console.log(`Connection to DB failed with the error ${error}`);
  process.exit(1);
}

console.log("Hello World!");
