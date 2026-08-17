import axios from "../utils/axios";

export const submitContactForm = async (data) => {
  try {
    const res = await axios.post("/api/contact", data); // axios baseURL handles the full URL
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to send contact form");
  }
};