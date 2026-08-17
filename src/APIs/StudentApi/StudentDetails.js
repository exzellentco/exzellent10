
import axios from "../../utils/axios";

export const fetchStudentProfile = async (userId) => {
  try {
    const response = await axios.get(`/api/users/getprofile/${userId}`);

    if (!response.data.success || !response.data.data) {
      throw new Error("Invalid data format received");
    }

    return response.data.data;
  } catch (error) {

    if (error.response?.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    } else if (error.response?.status === 404) {
      throw new Error("Student profile not found");
    } else {
      throw new Error(
        error.response?.data?.message || "Failed to fetch student data"
      );
    }
  }
};

export const updateStudentProfile = async (userId, formData) => {
  try {
    const response = await axios.put(`/api/users/updateprofile/${userId}`, formData);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update profile");
    }

    return response.data.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    } else {
      throw new Error(
        error.response?.data?.message || "Failed to update student data"
      );
    }
  }
};


export const fetchEnrolledCourses = async () => {
  try {
    const response = await axios.get(`/api/enrollments/my`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch enrolled courses");
    }
    
    return response.data.enrollments || [];
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    } else {
      throw new Error(
        error.response?.data?.message || "Failed to fetch enrolled courses"
      );
    }
  }
};

// Fetch course leaderboard
export const fetchCourseLeaderboard = async (courseId) => {
  try {
    const response = await axios.get(`/api/enrollments/course/${courseId}/leaderboard`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch leaderboard");
    }

    return response.data.leaderboard || [];
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    } else {
      throw new Error(
        error.response?.data?.message || "Failed to fetch leaderboard"
      );
    }
  }
};

export const enrollInCourse = async (courseId) => {
  try {
    const response = await axios.post(`/api/enrollments/${courseId}/enroll`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to enroll in course");
    }

    return response.data.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    } else {
      throw new Error(
        error.response?.data?.message || "Failed to enroll in course"
      );
    }
  }
};

export const completeLecture = async (enrollmentId) => {
  try {
    const response = await axios.post(`/api/enrollments/${enrollmentId}/complete-lecture`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to complete lecture");
    }

    return response.data.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    } else {
      throw new Error(
        error.response?.data?.message || "Failed to complete lecture"
      );
    }
  }
};

export const getCourseProgress = async (enrollmentId) => {
  try {
    const response = await axios.get(`/api/enrollments/${enrollmentId}`);
    
    
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch course progress");
    }

    

    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    } else {
      throw new Error(
        error.response?.data?.message || "Failed to fetch course progress"
      );
    }
  }
};
