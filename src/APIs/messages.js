// Messaging API. Relative /api paths so Vite's dev proxy routes them to the mock.
const req = async (method, path, body) => {
  const res = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok && data.success !== false) throw new Error(data.message || "Request failed");
  return data;
};

export const currentUser = () => {
  try { return JSON.parse(localStorage.getItem("user")) || {}; } catch { return {}; }
};

// People this user can message: [{ id, name, role }]
export const getContacts = async (role, userId) =>
  (await req("GET", `/api/messages/contacts?role=${role || ""}&userId=${userId || ""}`)).data;

// All messages involving the user (optionally with one other person).
export const getMessages = async (userId, withId) =>
  (await req("GET", `/api/messages?userId=${userId || ""}${withId ? `&with=${withId}` : ""}`)).data;

// { fromId, fromName, fromRole, toId, toName, toRole, text }
export const sendMessage = async (payload) => req("POST", `/api/messages`, payload);

export const markRead = async (userId, withId) =>
  req("PUT", `/api/messages/read?userId=${userId || ""}&with=${withId || ""}`);
