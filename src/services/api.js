import { toLocalIsoDate } from "../utils/dateUtils";

const API_BASE = "http://localhost:3001";

export async function createUser(newUser) {
  const res = await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newUser),
  });

  if (!res.ok) throw new Error("Failed to create user");
  return res.json();
}

export async function findUserByUsername(username) {
  const res = await fetch(`${API_BASE}/users?networkUsername=${encodeURIComponent(username)}`);
  if (!res.ok) throw new Error("Failed to fetch user");
  const users = await res.json();
  return users[0] ?? null;
}

export async function findUserById(id) {
  const res = await fetch(`${API_BASE}/users?id=${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error("Failed to fetch user");
  const users = await res.json();
  return users[0] ?? null;
}

export async function userExists(username) {
  const user = await findUserByUsername(username);
  return Boolean(user);
}

export async function isUserRegistered(username) {
  const user = await findUserByUsername(username);
  return Boolean(user.isRegistered);
}

export async function registerUser(username, password) {
  const user = await findUserByUsername(username);
  if (!user) throw new Error("User not found");

  const res = await fetch(`${API_BASE}/users/${encodeURIComponent(user.id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      networkPassword: password,
      isRegistered: true,
    }),
  });

  if (!res.ok) throw new Error("Failed to register user");
  return res.json();
}

export async function getLeaveRequestsForUser(username) {
  const user = await findUserByUsername(username);
  if (!user) throw new Error("User not found");

  const response = await fetch(`${API_BASE}/leaveRequests?employeeId=${encodeURIComponent(user.id)}`);
  if (!response.ok) throw new Error("Failed to get leave requests");
  return response.json();
}

export async function createLeaveRequest(userId, startDate, endDate, totalHours) {
  const res = await fetch(`${API_BASE}/leaveRequests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      employeeId: userId,
      startDate: toLocalIsoDate(startDate),
      endDate: toLocalIsoDate(endDate),
      totalHours: totalHours,
      status: "pending",
    }),
  });

  if (!res.ok) throw new Error("Failed to create leave request");
  return res.json();
}

export async function deleteLeaveRequest(requestId) {
  if (!requestId) throw new Error("Leave request id is required");

  const res = await fetch(`${API_BASE}/leaveRequests/${encodeURIComponent(requestId)}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to delete leave request");
  return true;
}

export async function getAllUsers() {
  const res = await fetch(`${API_BASE}/users`);
  if (!res.ok) throw new Error("Failed to load users");
  return res.json();
}

export async function updateUser(userId, patch) {
  if (!userId) throw new Error("User id is required");

  const res = await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });

  if (!res.ok) throw new Error("Failed to update user");
  return res.json();
}

export async function getRoles() {
  const res = await fetch(`${API_BASE}/roles`);
  if (!res.ok) throw new Error("Failed to load roles");
  return res.json();
}

export async function getDepartments() {
  const res = await fetch(`${API_BASE}/departments`);
  if (!res.ok) throw new Error("Failed to load departments");
  return res.json();
}

export async function getAllLeaveRequests() {
  const res = await fetch(`${API_BASE}/leaveRequests`);
  if (!res.ok) throw new Error("Failed to load leave requests");
  return res.json();
}

export async function updateLeaveRequest(requestId, patch) {
  if (!requestId) throw new Error("Leave request id is required");

  const res = await fetch(`${API_BASE}/leaveRequests/${encodeURIComponent(requestId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });

  if (!res.ok) throw new Error("Failed to update leave request");
  return res.json();
}
