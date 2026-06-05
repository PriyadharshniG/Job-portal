import axios from "axios";
import React, { useState } from "react";
import styled from "styled-components";
import LoadingComTwo from "../shared/LoadingComTwo";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { FiDownload, FiFilter } from "react-icons/fi";

const API = "https://job-portal-jk38.onrender.com/api/v1";

const STATUS_COLOR = {
    pending:     { bg: "#fef3c7", color: "#92400e" },
    interview:   { bg: "#dbeafe", color: "#1e3a8a" },
    shortlisted: { bg: "#ede9fe", color: "#5b21b6" },
    accepted:    { bg: "#d1fae5", color: "#065f46" },
    declined:    { bg: "#fee2e2", color: "#991b1b" },
};

const Recruiter = () => {
    const qc = useQueryClient();
    const [statusFilter, setStatusFilter] = useState("all");

    const { isPending, isError, data: applications, error } = useQuery({
        queryKey: ["rec-applications"],
        queryFn: async () => {
            const res = await axios.get(`${API}/applications/recruiter-jobs`, { withCredentials: true });
            return res?.data?.result;
        },
    });

    const statusMutation = useMutation({
        mutationFn: ({ application_id, status }) =>
            axios.put(`${API}/applications/status`, { application_id, status }, { withCredentials: true }),
        onSuccess: (_, vars) => {
            qc.invalidateQueries(["rec-applications"]);
            const labels = { accepted: "✅ Admitted", declined: "❌ Declined", shortlisted: "⭐ Shortlisted", interview: "🎙 Interview Set" };
            Swal.fire({ icon: "success", title: labels[vars.status] || "✔ Updated", timer: 1500, showConfirmButton: false });
        },
        onError: (err) =>
            Swal.fire({ icon: "error", title: "Error", text: err?.response?.data?.detail || "Failed." }),
    });

    const handleExport = async () => {
        try {
            const res = await axios.get(`${API}/recruiter/applications/export`, {
                withCredentials: true, responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement("a");
            a.href = url;
            a.download = `applications_${new Date().toISOString().slice(0,10)}.csv`;
            document.body.appendChild(a); a.click();
            a.remove(); window.URL.revokeObjectURL(url);
            Swal.fire({ icon: "success", title: "Exported!", text: "Applications saved as CSV (opens in Excel).", timer: 2000, showConfirmButton: false });
        } catch {
            Swal.fire({ icon: "error", title: "Export failed", text: "Could not export applications." });
        }
    };

    if (isPending) return <LoadingComTwo />;
    if (isError) {
        return (
            <div style={{ textAlign: "center", marginTop: "3rem", color: "#ef4444", fontSize: "16px" }}>
                ⚠ {error?.response?.data?.detail || error?.message || "Failed to load applications."}
            </div>
        );
    }

    const allApps = applications || [];
    const filtered = statusFilter === "all" ? allApps : allApps.filter(a => a.status === statusFilter);

    if (allApps.length === 0) {
        return (
            <div style={{ textAlign: "center", marginTop: "3rem", color: "#6b7280", fontSize: "16px" }}>
                📭 No applications received for your jobs yet.
            </div>
        );
    }

    // Stats
    const statCounts = {
        all: allApps.length,
        pending: allApps.filter(a => a.status === "pending").length,
        shortlisted: allApps.filter(a => a.status === "shortlisted").length,
        interview: allApps.filter(a => a.status === "interview").length,
        accepted: allApps.filter(a => a.status === "accepted").length,
        declined: allApps.filter(a => a.status === "declined").length,
    };

    return (
        <Wrapper>
            {/* ── Top bar ── */}
            <div className="top-bar">
                <div className="stats-row">
                    {Object.entries(statCounts).map(([key, val]) => (
                        <button
                            key={key}
                            className={`stat-pill ${statusFilter === key ? "active" : ""}`}
                            onClick={() => setStatusFilter(key)}
                        >
                            <span className="pill-label">{key === "all" ? "All" : key.charAt(0).toUpperCase() + key.slice(1)}</span>
                            <span className="pill-count">{val}</span>
                        </button>
                    ))}
                </div>
                <button className="export-btn" onClick={handleExport}>
                    <FiDownload size={13} /> Export Excel
                </button>
            </div>

            {/* ── Table ── */}
            <div className="content-row">
                {filtered.length === 0 ? (
                    <div className="empty-filter">No applications with status "{statusFilter}".</div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Applicant</th>
                                <th>Foundation ID</th>
                                <th>Job Position</th>
                                <th>Company</th>
                                <th>Applied On</th>
                                <th>Resume</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((app, index) => {
                                const i = index + 1 < 10 ? `0${index + 1}` : index + 1;
                                const appliedDate = app?.applied_at
                                    ? new Date(app.applied_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                                    : "—";
                                const sc = STATUS_COLOR[app?.status] || { bg: "#f3f4f6", color: "#374151" };
                                const rejectedByAdmin = app?.status === "declined" && app?.rejected_by === "admin";

                                return (
                                    <tr key={app._id}>
                                        <td>{i}</td>
                                        <td className="applicant-name">{app?.username || "—"}</td>
                                        <td><span className="fid-tag">{app?.foundation_id || "—"}</span></td>
                                        <td className="position">{app?.position || "—"}</td>
                                        <td>{app?.company || "—"}</td>
                                        <td className="date">{appliedDate}</td>
                                        <td>
                                            {app?.resume_url ? (
                                                <div className="resume-actions">
                                                    <a href={`https://job-portal-jk38.onrender.com${app.resume_url}`}
                                                        target="_blank" rel="noopener noreferrer"
                                                        className="resume-link">📄 View</a>
                                                    <a href={`https://job-portal-jk38.onrender.com${app.resume_url}`}
                                                        download className="resume-dl">⬇ DL</a>
                                                </div>
                                            ) : <span className="no-resume">—</span>}
                                        </td>
                                        <td>
                                            <div className="status-col">
                                                <span className="status-badge" style={{ background: sc.bg, color: sc.color }}>
                                                    {app?.status || "pending"}
                                                </span>
                                                {rejectedByAdmin && (
                                                    <span className="admin-rejected">⚠ Admin</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="action-row">
                                            {rejectedByAdmin ? (
                                                <span className="admin-lock">🔒 Admin Decision</span>
                                            ) : (
                                                <>
                                                    {app?.status !== "shortlisted" && app?.status !== "accepted" && (
                                                        <button className="act-btn shortlist"
                                                            disabled={statusMutation.isPending}
                                                            onClick={() => statusMutation.mutate({ application_id: app._id, status: "shortlisted" })}>
                                                            ⭐ Shortlist
                                                        </button>
                                                    )}
                                                    {app?.status !== "interview" && app?.status !== "accepted" && (
                                                        <button className="act-btn interview"
                                                            disabled={statusMutation.isPending}
                                                            onClick={() => statusMutation.mutate({ application_id: app._id, status: "interview" })}>
                                                            🎙 Interview
                                                        </button>
                                                    )}
                                                    {app?.status !== "accepted" && (
                                                        <button className="act-btn admit"
                                                            disabled={statusMutation.isPending}
                                                            onClick={() => statusMutation.mutate({ application_id: app._id, status: "accepted" })}>
                                                            ✅ Admit
                                                        </button>
                                                    )}
                                                    {app?.status !== "declined" && (
                                                        <button className="act-btn decline"
                                                            disabled={statusMutation.isPending}
                                                            onClick={() => statusMutation.mutate({ application_id: app._id, status: "declined" })}>
                                                            ❌ Decline
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </Wrapper>
    );
};

const Wrapper = styled.section`
    .top-bar { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:1rem; }
    .stats-row { display:flex; gap:8px; flex-wrap:wrap; }
    .stat-pill {
        display:flex; align-items:center; gap:6px;
        padding:6px 14px; border-radius:999px;
        border:1.5px solid #e2e8f0; background:#f8fafc;
        font-size:12px; font-weight:600; color:#475569;
        cursor:pointer; transition:0.15s;
    }
    .stat-pill:hover { border-color:#6366f1; color:#4338ca; }
    .stat-pill.active { background:#eef2ff; border-color:#6366f1; color:#4338ca; }
    .pill-count { background:#e0e7ff; color:#4338ca; border-radius:999px; padding:1px 7px; font-size:11px; font-weight:800; }
    .stat-pill.active .pill-count { background:#4338ca; color:#fff; }

    .export-btn {
        display:inline-flex; align-items:center; gap:6px;
        padding:8px 16px; background:linear-gradient(135deg,#10b981,#059669);
        color:#fff; border:none; border-radius:9px;
        font-size:12px; font-weight:700; cursor:pointer; transition:0.2s;
    }
    .export-btn:hover { transform:translateY(-1px); box-shadow:0 3px 12px rgba(16,185,129,0.35); }

    .content-row { overflow-x:auto; }
    .empty-filter { text-align:center; padding:3rem; color:#9ca3af; font-size:13px; }

    .table { border-collapse:collapse; border-spacing:0; width:100%; border:1px solid #e5e7eb; border-radius:10px; overflow:hidden; font-size:13px; }
    .table thead { background:linear-gradient(135deg,#1e293b,#334155); color:white; font-size:12px; letter-spacing:0.5px; font-weight:600; text-transform:uppercase; }
    .table th, .table td { text-align:left; padding:11px 13px; }
    .table tbody tr { border-bottom:1px solid #f3f4f6; transition:background 0.12s; }
    .table tbody tr:hover { background:#f8faff; }
    .table tbody tr:last-child { border-bottom:none; }

    .applicant-name { font-weight:700; color:#111; }
    .fid-tag { background:#fef3c7; color:#92400e; border-radius:999px; padding:2px 10px; font-size:11px; font-weight:700; }
    .position { font-weight:600; color:#374151; text-transform:capitalize; }
    .date { font-size:12px; color:#9ca3af; }

    .resume-actions { display:flex; gap:4px; flex-wrap:wrap; }
    .resume-link { color:#4f6ef7; font-weight:700; font-size:11px; text-decoration:none; padding:2px 7px; background:#eef1ff; border-radius:5px; transition:0.15s; }
    .resume-link:hover { background:#4f6ef7; color:white; }
    .resume-dl { color:#065f46; font-weight:700; font-size:11px; text-decoration:none; padding:2px 7px; background:#d1fae5; border-radius:5px; transition:0.15s; }
    .resume-dl:hover { background:#10b981; color:white; }
    .no-resume { color:#9ca3af; font-size:12px; }

    .status-col { display:flex; flex-direction:column; gap:4px; }
    .status-badge { display:inline-block; padding:3px 10px; border-radius:999px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.4px; width:fit-content; }
    .admin-rejected { font-size:10px; color:#7c3aed; background:#ede9fe; border-radius:4px; padding:2px 6px; font-weight:700; width:fit-content; white-space:nowrap; }

    .action-row { display:flex; gap:5px; flex-wrap:wrap; align-items:center; }
    .admin-lock { font-size:11px; color:#9ca3af; font-style:italic; background:#f3f4f6; padding:3px 8px; border-radius:6px; white-space:nowrap; }
    .act-btn { padding:4px 9px; border-radius:6px; font-size:11px; font-weight:700; border:none; cursor:pointer; transition:0.15s; white-space:nowrap; }
    .act-btn:hover { transform:translateY(-1px); }
    .act-btn:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
    .act-btn.shortlist  { background:#ede9fe; color:#5b21b6; }
    .act-btn.shortlist:hover  { background:#7c3aed; color:white; }
    .act-btn.admit    { background:#d1fae5; color:#065f46; }
    .act-btn.admit:hover { background:#10b981; color:white; }
    .act-btn.interview { background:#dbeafe; color:#1e40af; }
    .act-btn.interview:hover { background:#3b82f6; color:white; }
    .act-btn.decline  { background:#fee2e2; color:#991b1b; }
    .act-btn.decline:hover { background:#ef4444; color:white; }
`;

export default Recruiter;
