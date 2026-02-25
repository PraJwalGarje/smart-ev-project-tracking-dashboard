const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function parseResponse(res, label) {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${label} failed (${res.status}) ${text}`);
  }

  // DELETE often returns 204 No Content
  if (res.status === 204) return null;

  return res.json();
}

export async function getProjects() {
  const res = await fetch(`${BASE}/projects`);
  return parseResponse(res, "getProjects");
}

export async function getTeams() {
  const res = await fetch(`${BASE}/teams`);
  return parseResponse(res, "getTeams");
}

export async function getMilestones() {
  const res = await fetch(`${BASE}/milestones`);
  return parseResponse(res, "getMilestones");
}

export async function addProject(data) {
  const res = await fetch(`${BASE}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseResponse(res, "addProject");
}

export async function deleteProject(id) {
  const res = await fetch(`${BASE}/projects/${id}`, { method: "DELETE" });
  return parseResponse(res, "deleteProject");
}

export async function updateProject(id, data) {
  const res = await fetch(`${BASE}/projects/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseResponse(res, "updateProject");
}