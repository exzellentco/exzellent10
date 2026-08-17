import axios from "../utils/axios";

/**
 * Fetch all webinars
 * @returns {Promise} - API response with webinars data
 */
export const fetchWebinars = async () => {
  try {
    const response = await axios.get("/api/webinars");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch webinars"
    );
  }
};

/**
 * Create a new webinar
 * @param {Object} webinarData - Webinar data to create
 * @returns {Promise} - API response with created webinar data
 */
export const createWebinar = async (webinarData) => {
  try {
    const response = await axios.post("/api/webinars", webinarData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to create webinar"
    );
  }
};

/**
 * Update an existing webinar
 * @param {string} id - ID of the webinar to update
 * @param {Object} updateData - Updated webinar data
 * @returns {Promise} - API response with updated webinar data
 */
export const updateWebinar = async (id, updateData) => {
  try {
    const response = await axios.put(`/api/webinars/${id}`, updateData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update webinar"
    );
  }
};

/**
 * Delete a webinar
 * @param {string} id - ID of the webinar to delete
 * @returns {Promise} - API response with deletion status
 */
export const deleteWebinar = async (id) => {
  try {
    const response = await axios.delete(`/api/webinars/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to delete webinar"
    );
  }
};

/**
 * Register user for a webinar
 * @param {string} webinarId - ID of the webinar to register for
 * @param {Object} userData - User registration data
 * @returns {Promise} - API response with registration status
 */
export const registerForWebinar = async (webinarId, userData) => {
  try {
    const response = await axios.post(
      `/api/webinars/${webinarId}/register`,
      userData
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to register for webinar"
    );
  }
};

/**
 * Upload webinar thumbnail image
 * @param {File} file - Image file to upload
 * @returns {Promise} - API response with image URL
 */
export const uploadWebinarImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await axios.post("/api/upload/webinar-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to upload webinar image"
    );
  }
};

/**
 * Get registered users for a webinar
 * @param {string} webinarId - ID of the webinar
 * @returns {Promise} - API response with registered users data
 */
export const getWebinarRegistrations = async (webinarId) => {
  try {
    const response = await axios.get(
      `/api/webinars/${webinarId}/registrations`
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch webinar registrations"
    );
  }
};


/**
 * Send webinar invites to registered students (Admin only)
 * @param {string} webinarId - ID of the webinar
 * @returns {Promise} - API response with invite status
 */
export const sendWebinarInvites = async (webinarId) => {
  try {
    const response = await axios.post(
      `/api/webinars/${webinarId}/send-invites`
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to send webinar invites"
    );
  }
};
