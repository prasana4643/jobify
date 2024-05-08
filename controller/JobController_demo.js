import { nanoid } from "nanoid";
import Job from "../models/JobModel";

let jobs = [
  { id: nanoid(), company: "apple", position: "front-end" },
  { id: nanoid(), company: "google", position: "back-end" },
];

export const getAllJobs = (req, res) => {
  console.log("all jobs");
  return res.status(200).json({ jobs });
};

export const getJob = async (request, response) => {
  const { id } = request.params;
  const job = jobs.find((job) => job.id === id);

  if (!job) {
    return response.status(400).json(`No job with the job id ${id}`);
  }
  return response.status(200).json({ job });
};

export const createJob = async (request, response) => {
  const { company, position } = request.body;

  if (!company || !position) {
    return response
      .status(400)
      .json({ msg: "Please provide company and position" });
  }
  const id = nanoid(10);
  const job = { id, company, position };
  jobs.push(job);
  return response.status(201).json({ job });
};

export const updateJob = async (request, response) => {
  const { company, position } = request.body;

  if (!company || !position) {
    return response
      .status(400)
      .json({ msg: "Please provide company and position" });
  }

  const { id } = request.params;
  const job = jobs.find((job) => job.id === id);

  if (!job) {
    return response.status(400).json({ msg: "Job id not found!" });
  }

  job.company = company;
  job.position = position;
  response.status(200).json({ job });
};

export const deleteJob = async (request, response) => {
  const { id } = request.params;
  const job = jobs.find((job) => job.id === id);

  if (!job) {
    return response.status(400).json({ msg: "Job Id not found!" });
  }

  const newJobs = jobs.filter((job) => job.id === id);
  jobs = newJobs;
  response.status(200).json({ msg: "job deleted" });
};
