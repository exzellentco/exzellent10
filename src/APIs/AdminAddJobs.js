import axios from "../utils/axios";

// Create a new job (Admin only)
export const createJob = async (jobData) => {
  const res = await axios.post("/api/careers", jobData);
  return res.data;
};

// Get all careers (Public)
export const getAllcareers = async () => {
  const res = await axios.get("/api/careers");

  return res.data;
};

// Get a single job by ID (Public)
export const getJobById = async (id) => {
  const res = await axios.get(`/api/careers/${id}`);
  return res.data;
};

// Update a job (Admin only)
export const updateJob = async (id, jobData) => {
  const res = await axios.put(`/api/careers/${id}`, jobData);
  return res.data;
};

// Delete a job (Admin only)
export const deleteJob = async (id) => {
  const res = await axios.delete(`/api/careers/${id}`);
  return res.data;
};
