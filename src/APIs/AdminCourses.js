import axios from "../utils/axios";

/**
 * Fetch all courses
 * @returns {Promise} - API response with courses data
 */
export const fetchCourses = async () => {
  try {
    const response = await axios.get("/api/courses");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch courses");
  }
};

/**
 * Create a new course as a logged-in Teacher
 * @param {Object} courseData - Course data (title, description, etc.)
 * @returns {Promise} - API response with created course data
 */
export const createCourseByTeacher = async (courseData) => {
  try {
    const response = await axios.post("/api/courses/teacher", courseData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to create course as teacher");
  }
};

/**
 * Approve a teacher's course (Admin only)
 * @param {string} courseId - ID of the course to approve
 * @returns {Promise} - API response with updated course data
 */
export const approveTeacherCourse = async (courseId) => {
  try {
    const response = await axios.put(`/api/courses/${courseId}/approve`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to approve teacher course");
  }
};

/**
 * Publish a course (Admin only)
 * @param {string} courseId - ID of the course to publish
 * @returns {Promise} - API response with updated course data
 */
export const publishCourse = async (courseId) => {
  try {
    const response = await axios.post(`/api/courses/${courseId}/publish`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to publish course");
  }
};

/**
 * Unpublish a course (Admin only)
 * @param {string} courseId - ID of the course to unpublish
 * @returns {Promise} - API response with updated course data
 */
export const unpublishCourse = async (courseId) => {
  try {
    const response = await axios.post(`/api/courses/${courseId}/unpublish`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to unpublish course");
  }
};

/**
 * Create a new section for a course
 * @param {string} courseId - ID of the course
 * @param {Object} sectionData - Section data to create
 * @returns {Promise} - API response with created section data
 */
export const createSection = async (courseId, sectionData) => {
  try {
    const response = await axios.post(
      `/api/courses/${courseId}/sections`,
      sectionData
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to create section");
  }
};

/**
 * Update a section in a course
 * AGGRESSIVE CLEANING: Removes any :index appended to ID
 * @param {string} courseId - ID of the course
 * @param {string} sectionId - ID of the section to update
 * @param {Object} sectionData - Updated section data
 * @returns {Promise} - API response with updated section data
 */
export const updateSection = async (courseId, sectionId, sectionData) => {
  try {
    // AGGRESSIVE CLEANING: Split on : and take first part
    const cleanSectionId = String(sectionId).split(':')[0].trim();
    
    console.log("🔍 updateSection Debug:", {
      rawSectionId: sectionId,
      cleanSectionId: cleanSectionId,
      url: `/api/courses/${courseId}/sections/${cleanSectionId}`
    });

    const response = await axios.put(
      `/api/courses/${courseId}/sections/${cleanSectionId}`,
      sectionData
    );
    return response.data;
  } catch (error) {
    console.error("❌ updateSection Error:", error);
    throw new Error(error.response?.data?.message || "Failed to update section");
  }
};

/**
 * Delete a section from a course
 * AGGRESSIVE CLEANING: Removes any :index appended to ID
 * @param {string} courseId - ID of the course
 * @param {string} sectionId - ID of the section to delete
 * @returns {Promise} - API response with deletion confirmation
 */
export const deleteSection = async (courseId, sectionId) => {
  try {
    // AGGRESSIVE CLEANING: Split on : and take first part
    const cleanSectionId = String(sectionId).split(':')[0].trim();
    
    console.log("🔍 deleteSection Debug:", {
      rawSectionId: sectionId,
      cleanSectionId: cleanSectionId,
      url: `/api/courses/${courseId}/sections/${cleanSectionId}`
    });

    const response = await axios.delete(
      `/api/courses/${courseId}/sections/${cleanSectionId}`
    );
    return response.data;
  } catch (error) {
    console.error("❌ deleteSection Error:", error);
    throw new Error(error.response?.data?.message || "Failed to delete section");
  }
};

/**
 * Create a new course
 * @param {Object} courseData - Course data to create
 * @returns {Promise} - API response with created course data
 */
export const createCourse = async (courseData) => {
  try {
    const response = await axios.post("/api/courses", courseData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to create course");
  }
};

/**
 * Update an existing course
 * @param {string} courseId - ID of the course to update
 * @param {Object} courseData - Updated course data
 * @returns {Promise} - API response with updated course data
 */
export const updateCourse = async (courseId, courseData) => {
  try {
    const response = await axios.put(`/api/courses/${courseId}`, courseData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update course");
  }
};

/**
 * Delete an existing course
 * @param {string} courseId - ID of the course to delete
 * @returns {Promise} - API response with deletion confirmation
 */
export const deleteCourse = async (courseId) => {
  try {
    const response = await axios.delete(`/api/courses/${courseId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete course");
  }
};

/**
 * Upload course image
 * @param {File} file - Image file to upload
 * @returns {Promise} - API response with image URL
 */
export const uploadCourseImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await axios.post("/api/upload/course-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to upload course image");
  }
};