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
  const res = await fetch(`${API_BASE}/users?username=${encodeURIComponent(username)}`);
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json(); // returns an array
}
