import axios from "./axios";
import Swal from "sweetalert2";

export async function registerForWebinar({
  webinarId,
  isLoggedIn,
  onNotLoggedIn,
  onSuccess,
}) {
  if (!isLoggedIn()) {
    onNotLoggedIn();
    return;
  }

  try {
    await axios.post(`/api/webinars/${webinarId}/register`);

    Swal.fire({
      icon: "success",
      title: "Registered",
      theme: 'dark',
      text: "Successfully registered for the webinar!",
    });

    onSuccess?.();
  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: "error",
      title: "Registration Failed",
      theme: 'dark',
      text: "Please try again.",
    });
  }
}