// src/api/api.js

const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function parseResponse(res, label) {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${label} failed (${res.status}) ${text}`);
  }

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

// ---- Projects CRUD ----
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

// ---- Teams CRUD ----
export async function addTeam(data) {
  const res = await fetch(`${BASE}/teams`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseResponse(res, "addTeam");
}

export async function deleteTeam(id) {
  const res = await fetch(`${BASE}/teams/${id}`, { method: "DELETE" });
  return parseResponse(res, "deleteTeam");
}

export async function updateTeam(id, data) {
  const res = await fetch(`${BASE}/teams/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseResponse(res, "updateTeam");
}
