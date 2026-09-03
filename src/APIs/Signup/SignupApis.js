import axios from "../../utils/axios";
import { pendingPoints, clearPoints } from "../../utils/signupPoints";

/**
 * Send OTP to user's email for verification
 * @param {string} email - User's email address
 * @returns {Promise} - API response with success status
 */
export const sendOTP = async (email, userType="Student") => {
  try {
    const response = await axios.post("/api/users/pre-signup", { email, userType });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to send OTP. Please try again."
    );
  }
};

/**
 * Verify OTP entered by user
 * @param {string} email - User's email address
 * @param {string} otp - One-time password entered by user
 * @returns {Promise} - API response with verification token
 */
export const verifyOTP = async (email, otp, role) => {
  try {
    const response = await axios.post("/api/users/verify-email", {
      email,
      otp,
      role,
    });
    return response;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Invalid OTP. Please check and try again."
    );
  }
};
/**
 * Complete signup process with user data
 * @param {Object} userData - User registration data
 * @param {string} token - Verification token from OTP verification
 * @returns {Promise} - API response with user data
 */
export const completeSignup = async (userData, token) => {
  try {
    // Remove confirmPassword before sending to backend
    const { confirmPassword: _confirmPassword, ...dataToSend } = userData;

    // Exzellent Points earned on the landing page before signing up. The
    // backend clamps this, so a tampered value cannot mint credits.
    const signupPoints = pendingPoints();

    const response = await axios.post(
      "/api/users/complete-signup",
      { ...dataToSend, signupPoints },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Only once the account exists: if signup failed, the points are still
    // theirs to bring to the next attempt.
    if (response.data?.success !== false) clearPoints();

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Signup failed. Please try again."
    );
  }
};

/**
 * Complete teacher signup (new endpoint)
 * @param {Object} teacherData - Full teacher profile data from form
 * @param {string} token - Verification token from OTP
 * @returns {Promise} - API response
 */
export const completeTeacherSignup = async (teacherData, token) => {
  try {
    const { confirmPassword: _confirmPassword, ...dataToSend } = teacherData;

    // Teachers bank their pre-signup points too, same as learners.
    const signupPoints = pendingPoints();

    const response = await axios.post(
      "/api/users/complete-teacher-signup",
      { ...dataToSend, signupPoints },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data?.success !== false) clearPoints();

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Teacher profile submission failed. Please try again."
    );
  }
};

/**
 * Verify referral code
 * @param {string} referralCode - Referral code to verify
 * @returns {boolean} - Whether the referral code is valid
 */
export const verifyReferral = async (referralCode) => {
  try {
    const response = await axios.post("/api/referrals/verify", {
      referralCode,
    });
    return response.data.success;
  } catch {
    return false;
  }
};