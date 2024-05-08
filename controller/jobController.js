import { response } from "express";
import Job from "../models/JobModel.js";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import day from "dayjs";

export const getAllJobs = async (req, res) => {
  const { search, jobStatus, jobType, sort } = req.query;

  const queryObject = {
    createdBy: req.user.userId,
  };

  if (search) {
    queryObject.$or = [
      { position: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
    ];
  }

  if (jobStatus && jobStatus !== "all") {
    queryObject.jobStatus = jobStatus;
  }

  if (jobType && jobType !== "all") {
    queryObject.jobType = jobType;
  }

  const sortOptions = {
    newest: "-createdAt",
    oldest: "createdAt",
    "a-z": "position",
    "z-a": "-position",
  };

  const sortKey = sortOptions[sort] || sortOptions.newest;

  //const jobs = await Job.find(queryObject).sort("-createdAt"); descending order
  //const jobs = await Job.find(queryObject).sort("createdAt"); ascending order

  //pagination

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const jobs = await Job.find(queryObject)
    .sort(sortKey)
    .skip(skip)
    .limit(limit);

  const totalJobs = await Job.countDocuments(queryObject);
  const numOfPage = Math.ceil(totalJobs / limit);
  return res
    .status(StatusCodes.OK)
    .json({ totalJobs, numOfPage, currentPage: page, jobs });
};

export const getJob = async (request, response) => {
  const job = await Job.findById(request.params.id);
  response.status(StatusCodes.OK).json({ job });
};

export const createJob = async (request, response) => {
  request.body.createdBy = request.user.userId;
  const job = await Job.create(request.body);
  return response.status(StatusCodes.CREATED).json({ job });
};

export const updateJob = async (request, response) => {
  const job = await Job.findByIdAndUpdate(request.params.id, request.body, {
    new: true,
  });
  response.status(StatusCodes.OK).json({ msg: `${job} updated successfully` });
};

export const deleteJob = async (request, response) => {
  const job = await Job.findByIdAndDelete(request.params.id);
  response.status(StatusCodes.OK).json({ msg: "job deleted" });
};

export const showStats = async (request, response) => {
  console.log(request.user.userId);
  let stats = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(request.user.userId) } },
    { $group: { _id: "$jobStatus", count: { $sum: 1 } } },
  ]);

  stats = stats.reduce((acc, cur) => {
    const { _id: title, count } = cur;
    acc[title] = count;
    return acc;
  }, {});

  const defaultStats = {
    pending: stats.pending || 0,
    interview: stats.interview || 0,
    declined: stats.declined || 0,
  };

  let monthlyApplications = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(request.user.userId) } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 6 },
  ]);

  monthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;

      const date = day()
        .month(month - 1)
        .year(year)
        .format("MMM YY");

      return { date, count };
    })
    .reverse();

  response.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
};
