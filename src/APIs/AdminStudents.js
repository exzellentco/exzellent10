import axios from "../utils/axios";

/**
 * Fetch every student for the admin dashboard.
 * @returns {Promise<Array>} list of students (shaped for the admin UI)
 */
export const fetchAdminStudents = async () => {
  const res = await axios.get("/api/users/admin/students");
  return res.data.data || [];
};

/**
 * Approve a pending student (makes the account active / able to log in).
 * @param {string} studentId
 * @returns {Promise}
 */
export const approveStudent = async (studentId) => {
  const res = await axios.put(`/api/users/approve-student/${studentId}`);
  return res.data;
};

/**
 * Update a student's data as an admin.
 * @param {string} studentId
 * @param {Object} data - fields to change (name, email, phone, gender, country, dateOfBirth, referral, paid)
 * @returns {Promise}
 */
export const updateStudent = async (studentId, data) => {
  const res = await axios.put(`/api/users/students/${studentId}`, data);
  return res.data;
};

/**
 * Delete a student account.
 * @param {string} studentId
 * @returns {Promise}
 */
export const deleteStudentById = async (studentId) => {
  const res = await axios.delete(`/api/users/students/${studentId}`);
  return res.data;
};
