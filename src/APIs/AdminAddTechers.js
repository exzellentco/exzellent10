import api from "../utils/axios";

/**
 * Fetch all teacher profiles
 * No need to pass token - the axios interceptor handles it automatically
 * @returns {Promise<Array>} - Array of teacher profile objects
 */
export const fetchTeacherProfile = async () => {
  const res = await api.get("/api/teachers");
  
  // Return array directly for backward compatibility
  if (Array.isArray(res.data)) {
    return res.data;
  } else if (res.data && Array.isArray(res.data.teachers)) {
    return res.data.teachers;
  } else if (res.data && Array.isArray(res.data.data)) {
    return res.data.data;
  }
  
  // If no array found, return empty array
  return [];
};

/**
 * Approve a teacher by their User ID
 * @param {string} userId - The User ID of the teacher to approve
 * @returns {Promise} - API response with approval status
 */
export const approveTeacher = async (userId) => {
  const res = await api.put(`/api/users/approve-teacher/${userId}`);
  return res.data;
};

/**
 * Delete a teacher by their Teacher ID
 * @param {string} teacherId - The Teacher ID of the teacher to delete
 * @returns {Promise} - API response with deletion status
 */
export const deleteTeacher = async (teacherId) => {
  const res = await api.delete(`/api/teachers/${teacherId}`);
  return res.data;
};

/**
 * Create a new teacher account and profile (Admin action)
 * @param {Object} teacherData - Complete teacher data object
 * @param {string} teacherData.email - Teacher's email address
 * @param {string} teacherData.password - Teacher's password
 * @param {string} teacherData.firstName - Teacher's first name
 * @param {string} teacherData.lastName - Teacher's last name
 * @param {string} teacherData.countryOfResidence - Teacher's country
 * @param {number} teacherData.yearsExperience - Years of teaching experience
 * @param {string} teacherData.availableFrom - Availability date (ISO format)
 * @param {string} teacherData.profileImage - Profile image URL
 * @param {Array<string>} teacherData.academicDegrees - List of academic degrees
 * @param {Array<string>} teacherData.teachingCertifications - List of certifications
 * @param {Array<string>} teacherData.examExpertise - Exam preparation expertise
 * @param {Array<string>} teacherData.teachingMethodologies - Teaching methods
 * @param {Array<string>} teacherData.teachingFormat - Preferred teaching formats
 * @param {Array<Object>} teacherData.taughtLanguages - Languages taught with details
 * @param {boolean} teacherData.agreedToTerms - Terms agreement status
 * @param {boolean} teacherData.agreedToVerification - Verification consent
 * @returns {Promise} - API response with created teacher data
 * @throws {Error} - Throws error if creation fails
 */
export const createAdminTeacher = async (teacherData) => {
  try {
    const response = await api.post("/api/teachers", teacherData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to create teacher account"
    );
  }
};

/**
 * Update an existing teacher profile
 * @param {string} teacherId - Teacher ID
 * @param {Object} updateTeacherData - Updated teacher fields
 * @param {string} updateTeacherData.email - Teacher's email address
 * @param {string} updateTeacherData.password - Teacher's password
 * @param {string} updateTeacherData.firstName - Teacher's first name
 * @param {string} updateTeacherData.lastName - Teacher's last name
 * @param {string} updateTeacherData.countryOfResidence - Teacher's country
 * @param {number} updateTeacherData.yearsExperience - Years of teaching experience
 * @param {string} updateTeacherData.profileImage - Profile image URL
 * @returns {Promise}
 */

export const updateTeacherProfile = async (teacherId, updateTeacherData) => {
  try {
    const response = await api.put(`/api/teachers/${teacherId}`, updateTeacherData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update teacher account"
    );
  }
};

/**
 * Upload teacher profile image
 * @param {File} file - Image file to upload
 * @returns {Promise} - API response with image URL
 * @throws {Error} - Throws error if upload fails
 */
export const uploadTeacherImage = async (file) => {
  try {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append("image", file);

    // Note: For file uploads, we need to override content type
    const response = await api.post("/api/upload/teacher-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to upload image");
  }
};