const BASE = 'http://localhost:4000';

export async function getProjects() {
  const res = await fetch(`${BASE}/projects`);
  return res.json();
}
export async function getTeams() {
  const res = await fetch(`${BASE}/teams`);
  return res.json();
}
export async function getMilestones() {
  const res = await fetch(`${BASE}/milestones`);
  return res.json();
}

export async function addProject(data) {
  const res = await fetch(`${BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteProject(id) {
  await fetch(`${BASE}/projects/${id}`, { method: 'DELETE' });
}

export async function updateProject(id, data) {
  const res = await fetch(`${BASE}/projects/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}
