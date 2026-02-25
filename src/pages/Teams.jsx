import React, { useEffect, useMemo, useState } from "react";
import { getTeams, getProjects, addTeam, deleteTeam } from "../api/api.js";
import Modal from "../components/Modal.jsx";
import toast from "react-hot-toast";

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Modal state
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [teamName, setTeamName] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const [t, p] = await Promise.all([getTeams(), getProjects()]);
      setTeams(t);
      setProjects(p);
    } catch (e) {
      setErr("Failed to load teams.");
      toast.error("Failed to load teams");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const projectCountByTeam = useMemo(() => {
    const map = new Map();
    for (const team of teams) map.set(team.name, 0);
    for (const project of projects) {
      if (map.has(project.team)) {
        map.set(project.team, map.get(project.team) + 1);
      }
    }
    return map;
  }, [teams, projects]);

  function openAddTeamModal() {
    setTeamName("");
    setIsTeamModalOpen(true);
  }

  async function handleSubmitTeam(event) {
    event?.preventDefault?.();
    const name = teamName.trim();

    if (!name) {
      return toast("Please enter a team name.", { icon: "⚠️" });
    }

    try {
      await addTeam({ name });
      toast.success("Team added");
      setIsTeamModalOpen(false);
      await load();
    } catch {
      toast.error("Add failed");
    }
  }

  async function handleDeleteTeam(id) {
    if (!confirm("Delete this team?")) return;
    try {
      await deleteTeam(id);
      toast.success("Team deleted");
      await load();
    } catch {
      toast.error("Delete failed");
    }
  }

  return (
    <>
      <h1 className="page-title">Teams</h1>
      <p className="page-subtitle">
        Organizational teams collaborating on Smart EV projects.
      </p>

      {/* Toolbar */}
      <div className="teams-toolbar">
        <button className="btn-secondary" onClick={load}>
          Refresh
        </button>
        <button className="btn" onClick={openAddTeamModal}>
          New Team
        </button>
      </div>

      {/* Teams table */}
      <div className="card teams-table-card">
        <div className="teams-table-wrapper">
          <table className="teams-table">
            <thead>
              <tr className="teams-table-header-row">
                <th className="teams-table-header-cell teams-name-header">
                  Team
                </th>
                <th className="teams-table-header-cell teams-count-header">
                  Projects Owned
                </th>
                <th className="teams-table-header-cell teams-actions-header">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id ?? team._id} className="teams-table-row">
                  <td className="teams-name-cell">{team.name}</td>
                  <td className="teams-count-cell">
                    {projectCountByTeam.get(team.name) ?? 0}
                  </td>
                  <td className="teams-actions-cell">
                    <div className="teams-actions-inline">
                      <button
                        className="btn"
                        onClick={() => handleDeleteTeam(team.id ?? team._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && teams.length === 0 && (
                <tr>
                  <td className="teams-empty-state-cell" colSpan={3}>
                    No teams yet. Click “New Team”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {loading && <div className="teams-loading-message">Loading…</div>}
        {err && <div className="teams-error-message">{err}</div>}
      </div>

      {/* New Team modal */}
      <Modal
        open={isTeamModalOpen}
        title="New Team"
        onClose={() => setIsTeamModalOpen(false)}
        footer={
          <>
            <button
              className="btn-secondary"
              onClick={() => setIsTeamModalOpen(false)}
            >
              Cancel
            </button>
            <button className="btn" onClick={handleSubmitTeam}>
              Save
            </button>
          </>
        }
      >
        <form className="teams-modal-form" onSubmit={handleSubmitTeam}>
          <div className="teams-modal-field">
            <label className="teams-modal-label">Team Name</label>
            <input
              type="text"
              className="teams-modal-input"
              value={teamName}
              onChange={(event) => setTeamName(event.target.value)}
              placeholder="e.g., Powertrain"
            />
          </div>
          <button type="submit" className="hidden" />
        </form>
      </Modal>
    </>
  );
}