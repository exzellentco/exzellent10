export const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

export const validatePhone = (phone) => {
  // Remove all non-digit characters for validation
  const cleanPhone = phone.replace(/\D/g, "");

  // Phone number should be between 7-15 digits (international standard)
  // Most countries have phone numbers in this range
  return /^\d{7,15}$/.test(cleanPhone);
};

export const validateSignupForm = (formData) => {
  const errors = {};

  if (!formData.name) errors.name = "Enter your name";
  if (!validatePassword(formData.password))
    errors.password =
      "Password must be at least 8 characters, include an uppercase letter, lowercase, and number.";

  // Add confirm password validation
  if (!formData.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (!formData.gender) errors.gender = "Select gender";

  // Validate phone number for all countries
  if (!formData.phone || !validatePhone(formData.phone)) {
    errors.phone = "Enter a valid phone number (7-15 digits)";
  }

  if (!formData.dateOfBirth) errors.dateOfBirth = "Select date of birth";
  if (!formData.terms) errors.terms = "You must agree to the terms";

  return errors;
};
