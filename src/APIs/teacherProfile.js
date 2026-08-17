const API_BASE = "/api/teachers";

const getToken = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user?.accessToken) throw new Error("Not authenticated");
  return user.accessToken;
};
export const getMyTeacherProfile = async () => {
  const token = getToken();

  const res = await fetch(`${API_BASE}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
};

// Live dashboard stats (earnings, students, courses, lessons, AI generations).
// Returns null if the backend has no such endpoint yet, so the UI can fall
// back to what it can derive from the course list instead of showing fakes.
export const getTeacherDashboard = async () => {
  try {
    const token = getToken();
    const res = await fetch(`${API_BASE}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
};

// Enrolled students across the teacher's courses. Returns [] on any failure.
export const getTeacherStudents = async () => {
  try {
    const token = getToken();
    const res = await fetch(`${API_BASE}/students`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || [];
  } catch {
    return [];
  }
};

// Earnings breakdown (headline + chart + per-course + recent). null on failure.
export const getTeacherEarnings = async () => {
  try {
    const token = getToken();
    const res = await fetch(`${API_BASE}/earnings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
};

export const updateMyTeacherProfile = async (payload) => {
  const token = getToken();

  const res = await fetch(`${API_BASE}/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
};