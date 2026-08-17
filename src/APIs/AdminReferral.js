import axios from "../utils/axios";

/**
 * Fetch all referrals
 * @returns {Promise} - API response with referrals data
 */
export const fetchReferrals = async () => {
  try {
    const response = await axios.get("/api/referrals");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch referrals"
    );
  }
};

/**
 * Create a new referral
 * @param {string} referralCode - Unique referral code
 * @param {string} referredBy - ID or name of the referrer
 * @returns {Promise} - API response with created referral data
 */
export const createReferral = async (referralCode, referredBy) => {
  try {
    const response = await axios.post("/api/referrals", {
      referralCode,
      referredBy,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to create referral"
    );
  }
};

/**
 * Update an existing referral
 * @param {string} id - ID of the referral to update
 * @param {string} referralCode - Updated referral code
 * @param {string} referredBy - Updated referrer
 * @param {boolean} isActive - Whether the referral is active
 * @returns {Promise} - API response with updated referral data
 */
export const updateReferral = async (
  id,
  referralCode,
  referredBy,
  isActive
) => {
  try {
    const response = await axios.put(`/api/referrals/${id}`, {
      referralCode,
      referredBy,
      isActive,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update referral"
    );
  }
};

/**
 * Delete a referral
 * @param {string} id - ID of the referral to delete
 * @returns {Promise} - API response with deletion status
 */
export const deleteReferral = async (id) => {
  try {
    const response = await axios.delete(`/api/referrals/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to delete referral"
    );
  }
};

/**
 * Verify if a referral code is valid
 * @param {string} code - Referral code to verify
 * @returns {Promise} - API response with verification status
 */
export const verifyReferralCode = async (code) => {
  try {
    const response = await axios.post("/api/referrals/verify", {
      referralCode: code,
    });
    return response.data;
  } catch {
    return { success: false, message: "Invalid referral code" };
  }
};
