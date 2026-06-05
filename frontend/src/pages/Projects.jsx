import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";
import Swal from "sweetalert2";
import { FiFolder, FiPlus, FiTrash2, FiExternalLink, FiLink } from "react-icons/fi";
import { useUserContext } from "../context/UserContext";
import dayjs from "dayjs";

const API = "https://job-portal-jk38.onrender.com/api/v1";

const Projects = () => {
    const { user, handleFetchMe } = useUserContext();
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ title: "", description: "", url: "", tech_stack: "" });

    const projects = user?.projects || [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.url.trim()) {
            Swal.fire({ icon: "warning", title: "Missing fields", text: "Title and URL are required." });
            return;
        }
        if (!form.url.startsWith("http")) {
            Swal.fire({ icon: "warning", title: "Invalid URL", text: "URL must start with http:// or https://" });
            return;
        }
        setSaving(true);
        try {
            const tech_stack = form.tech_stack
                .split(",")
                .map(t => t.trim())
                .filter(Boolean);
            await axios.post(
                `${API}/student/projects/add`,
                { title: form.title, description: form.description, url: form.url, tech_stack },
                { withCredentials: true }
            );
            await handleFetchMe();
            setForm({ title: "", description: "", url: "", tech_stack: "" });
            setShowForm(false);
            Swal.fire({ icon: "success", title: "Project Added! 🚀", timer: 1800, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: "error", title: "Failed", text: err?.response?.data?.detail || "Could not add project." });
        }
        setSaving(false);
    };

    const handleDelete = async (projectId, title) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Remove project?",
            text: `Remove "${title}" from your profile?`,
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            confirmButtonText: "Remove",
        });
        if (!result.isConfirmed) return;
        try {
            await axios.delete(`${API}/student/projects/${projectId}`, { withCredentials: true });
            await handleFetchMe();
            Swal.fire({ icon: "success", title: "Removed", timer: 1200, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: "error", title: "Error", text: err?.response?.data?.detail || "Could not remove." });
        }
    };

    return (
        <Wrapper>
            <div className="page-head">
                <div className="page-title-group">
                    <FiFolder className="page-icon" />
                    <div>
                        <h1 className="page-title">Project Links</h1>
                        <p className="page-sub">Showcase your projects with live links and tech stacks</p>
                    </div>
                </div>
                <button className="add-new-btn" onClick={() => setShowForm(!showForm)}>
                    <FiPlus size={15} /> {showForm ? "Cancel" : "Add Project"}
                </button>
            </div>

            {/* ── Add Form ── */}
            {showForm && (
                <div className="card form-card">
                    <h3 className="card-title">Add New Project</h3>
                    <form onSubmit={handleSubmit} className="proj-form">
                        <div className="form-grid">
                            <div className="field full-span">
                                <label>Project Title *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. E-Commerce Website, Portfolio, ML Model"
                                    value={form.title}
                                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="field full-span">
                                <label>Project URL *</label>
                                <div className="url-input-row">
                                    <FiLink size={14} className="url-icon" />
                                    <input
                                        type="url"
                                        placeholder="https://github.com/username/project or https://myproject.com"
                                        value={form.url}
                                        onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="field">
                                <label>Tech Stack <span className="optional">(comma-separated)</span></label>
                                <input
                                    type="text"
                                    placeholder="React, Node.js, MongoDB"
                                    value={form.tech_stack}
                                    onChange={e => setForm(f => ({ ...f, tech_stack: e.target.value }))}
                                />
                            </div>
                            <div className="field full-span">
                                <label>Description <span className="optional">(optional)</span></label>
                                <textarea
                                    placeholder="Brief description of the project, what it does, your role…"
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="submit-btn" disabled={saving}>
                                {saving ? "Saving…" : "Add Project"}
                            </button>
                            <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Project List ── */}
            {projects.length > 0 ? (
                <div className="projects-grid">
                    {projects.map(proj => (
                        <div key={proj._id} className="proj-card">
                            <div className="proj-header">
                                <div className="proj-icon-wrap">
                                    <FiFolder size={20} />
                                </div>
                                <div className="proj-title-row">
                                    <h4 className="proj-title">{proj.title}</h4>
                                    <span className="proj-date">{dayjs(proj.added_at).format("MMM D, YYYY")}</span>
                                </div>
                                <button className="delete-btn" onClick={() => handleDelete(proj._id, proj.title)} title="Remove">
                                    <FiTrash2 size={14} />
                                </button>
                            </div>

                            {proj.description && (
                                <p className="proj-desc">{proj.description}</p>
                            )}

                            {proj.tech_stack?.length > 0 && (
                                <div className="tech-tags">
                                    {proj.tech_stack.map(t => (
                                        <span key={t} className="tech-tag">{t}</span>
                                    ))}
                                </div>
                            )}

                            <div className="proj-footer">
                                <a href={proj.url} target="_blank" rel="noopener noreferrer" className="proj-link">
                                    <FiExternalLink size={13} />
                                    {proj.url.includes("github.com") ? "View on GitHub" : "Visit Project"}
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card empty-state">
                    <FiFolder size={48} />
                    <h3>No projects added yet</h3>
                    <p>Add your GitHub projects, live websites, or any work you're proud of to make your profile stand out.</p>
                    <button className="add-new-btn" onClick={() => setShowForm(true)}>
                        <FiPlus size={14} /> Add Your First Project
                    </button>
                </div>
            )}
        </Wrapper>
    );
};

const Wrapper = styled.div`
    width: 100%;
    padding: 1.5rem 0;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    font-family: 'Inter', sans-serif;

    .page-head {
        display: flex; justify-content: space-between; align-items: center;
        flex-wrap: wrap; gap: 12px;
    }
    .page-title-group { display: flex; align-items: center; gap: 14px; }
    .page-icon { font-size: 1.8rem; color: #6366f1; }
    .page-title { font-size: 1.3rem; font-weight: 800; color: #0f172a; }
    .page-sub { font-size: 12px; color: #64748b; margin-top: 2px; }

    .add-new-btn {
        display: inline-flex; align-items: center; gap: 7px;
        padding: 10px 20px; background: linear-gradient(135deg, #6366f1, #4338ca);
        color: #fff; border: none; border-radius: 10px;
        font-size: 13px; font-weight: 700; cursor: pointer; transition: 0.2s;
    }
    .add-new-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(99,102,241,0.35); }

    .card {
        background: #fff;
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        border: 1px solid #f1f5f9;
    }
    .card-title { font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 1.25rem; }

    /* ── Form ── */
    .proj-form { display: flex; flex-direction: column; gap: 1rem; }
    .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
    }
    @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
    .full-span { grid-column: 1 / -1; }
    .field { display: flex; flex-direction: column; gap: 5px; }
    .field label { font-size: 12px; font-weight: 700; color: #374151; }
    .optional { font-weight: 400; color: #9ca3af; }
    .field input, .field textarea {
        padding: 9px 13px; border: 1.5px solid #e2e8f0; border-radius: 9px;
        font-size: 13px; color: #0f172a; outline: none; transition: 0.2s;
        font-family: inherit; resize: vertical;
    }
    .field input:focus, .field textarea:focus {
        border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
    }
    .url-input-row {
        display: flex; align-items: center;
        border: 1.5px solid #e2e8f0; border-radius: 9px; overflow: hidden;
        transition: 0.2s;
    }
    .url-input-row:focus-within { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
    .url-icon { padding: 0 10px; color: #9ca3af; flex-shrink: 0; }
    .url-input-row input { border: none; flex: 1; padding: 9px 8px; box-shadow: none; outline: none; font-size: 13px; }
    .url-input-row input:focus { box-shadow: none; }

    .form-actions { display: flex; gap: 10px; }
    .submit-btn {
        padding: 10px 24px; background: linear-gradient(135deg, #4338ca, #6366f1);
        color: #fff; border: none; border-radius: 10px;
        font-size: 13px; font-weight: 700; cursor: pointer; transition: 0.2s;
    }
    .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(67,56,202,0.35); }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .cancel-btn {
        padding: 10px 18px; background: #f8fafc; color: #64748b;
        border: 1px solid #e2e8f0; border-radius: 10px;
        font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s;
    }
    .cancel-btn:hover { background: #f1f5f9; }

    /* ── Projects Grid ── */
    .projects-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 14px;
    }
    .proj-card {
        background: #fff;
        border: 1px solid #f1f5f9;
        border-radius: 16px;
        padding: 1.25rem;
        display: flex; flex-direction: column; gap: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        transition: 0.2s;
    }
    .proj-card:hover { box-shadow: 0 6px 20px rgba(99,102,241,0.12); border-color: #c7d2fe; transform: translateY(-2px); }

    .proj-header { display: flex; align-items: flex-start; gap: 10px; }
    .proj-icon-wrap {
        width: 38px; height: 38px; border-radius: 10px;
        background: linear-gradient(135deg, #6366f1, #4338ca);
        display: flex; align-items: center; justify-content: center;
        color: #fff; flex-shrink: 0;
    }
    .proj-title-row { flex: 1; min-width: 0; }
    .proj-title { font-size: 14px; font-weight: 700; color: #1e293b; word-break: break-word; }
    .proj-date { font-size: 11px; color: #9ca3af; }
    .delete-btn {
        background: none; border: none; color: #ef4444;
        cursor: pointer; opacity: 0.4; transition: 0.15s; padding: 2px; flex-shrink: 0;
    }
    .delete-btn:hover { opacity: 1; }

    .proj-desc { font-size: 13px; color: #64748b; line-height: 1.55; }

    .tech-tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .tech-tag {
        background: #eef2ff; color: #4338ca;
        border-radius: 999px; padding: 3px 10px;
        font-size: 11px; font-weight: 600;
        border: 1px solid #c7d2fe;
    }

    .proj-footer { margin-top: auto; }
    .proj-link {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 8px 14px; background: #f8fafc;
        border: 1px solid #e2e8f0; border-radius: 8px;
        font-size: 12px; font-weight: 600; color: #334155;
        text-decoration: none; transition: 0.2s;
    }
    .proj-link:hover { background: #6366f1; color: #fff; border-color: #6366f1; }

    /* ── Empty ── */
    .empty-state {
        display: flex; flex-direction: column;
        align-items: center; gap: 12px; padding: 3rem;
        color: #9ca3af; text-align: center;
    }
    .empty-state svg { color: #6366f1; opacity: 0.35; }
    .empty-state h3 { font-size: 1.1rem; font-weight: 700; color: #374151; }
    .empty-state p { font-size: 13px; max-width: 380px; line-height: 1.6; }
`;

export default Projects;
