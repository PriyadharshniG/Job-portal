import axios from "axios";
import React from "react";
import styled from "styled-components";
import LoadingComTwo from "../shared/LoadingComTwo";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";

const API = "http://localhost:8000/api/v1";

const STATUS_COLOR = {
    pending:   { bg: "#fef3c7", color: "#92400e" },
    interview: { bg: "#dbeafe", color: "#1e3a8a" },
    accepted:  { bg: "#d1fae5", color: "#065f46" },
    declined:  { bg: "#fee2e2", color: "#991b1b" },
};

const Recruiter = () => {
    const qc = useQueryClient();

    const { isPending, isError, data: applications, error } = useQuery({
        queryKey: ["rec-applications"],
        queryFn: async () => {
            const response = await axios.get(
                `${API}/applications/recruiter-jobs`,
                { withCredentials: true }
            );
            return response?.data?.result;
        },
    });

    const statusMutation = useMutation({
        mutationFn: ({ application_id, status }) =>
            axios.put(`${API}/applications/status`, { application_id, status }, { withCredentials: true }),
        onSuccess: (_, vars) => {
            qc.invalidateQueries(["rec-applications"]);
            const label = vars.status === "accepted" ? "✅ Admitted" : vars.status === "declined" ? "❌ Declined" : "✔ Updated";
            Swal.fire({ icon: "success", title: label, timer: 1500, showConfirmButton: false });
        },
        onError: (err) =>
            Swal.fire({ icon: "error", title: "Error", text: err?.response?.data?.detail || "Failed." }),
    });

    if (isPending) return <LoadingComTwo />;

    if (isError) {
        return (
            <div style={{ textAlign: "center", marginTop: "3rem", color: "#ef4444", fontSize: "16px" }}>
                ⚠ {error?.response?.data?.detail || error?.message || "Failed to load applications."}
            </div>
        );
    }

    if (!applications || applications.length === 0) {
        return (
            <div style={{ textAlign: "center", marginTop: "3rem", color: "#6b7280", fontSize: "16px" }}>
                📭 No applications received for your jobs yet.
            </div>
        );
    }

    return (
        <Wrapper>
            <div className="content-row">
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
                        {applications.map((app, index) => {
                            const i = index + 1 < 10 ? `0${index + 1}` : index + 1;
                            const appliedDate = app?.applied_at
                                ? new Date(app.applied_at).toLocaleDateString("en-IN", {
                                      day: "2-digit", month: "short", year: "numeric",
                                  })
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
                                            <a
                                                href={`http://localhost:8000${app.resume_url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="resume-link"
                                            >
                                                📄 View PDF
                                            </a>
                                        ) : <span className="no-resume">—</span>}
                                    </td>
                                    <td>
                                        <div className="status-col">
                                            <span className="status-badge" style={{ background: sc.bg, color: sc.color }}>
                                                {app?.status || "pending"}
                                            </span>
                                            {rejectedByAdmin && (
                                                <span className="admin-rejected">
                                                    ⚠ Rejected by Admin
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="action-row">
                                        {/* If rejected by admin, show locked message */}
                                        {rejectedByAdmin ? (
                                            <span className="admin-lock">🔒 Admin Decision</span>
                                        ) : (
                                            <>
                                                {app?.status !== "accepted" && (
                                                    <button
                                                        className="act-btn admit"
                                                        disabled={statusMutation.isPending}
                                                        onClick={() =>
                                                            statusMutation.mutate({ application_id: app._id, status: "accepted" })
                                                        }
                                                    >✅ Admit</button>
                                                )}
                                                {app?.status !== "interview" && app?.status !== "accepted" && (
                                                    <button
                                                        className="act-btn interview"
                                                        disabled={statusMutation.isPending}
                                                        onClick={() =>
                                                            statusMutation.mutate({ application_id: app._id, status: "interview" })
                                                        }
                                                    >🎙️ Interview</button>
                                                )}
                                                {app?.status !== "declined" && (
                                                    <button
                                                        className="act-btn decline"
                                                        disabled={statusMutation.isPending}
                                                        onClick={() =>
                                                            statusMutation.mutate({ application_id: app._id, status: "declined" })
                                                        }
                                                    >❌ Decline</button>
                                                )}
                                            </>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </Wrapper>
    );
};

const Wrapper = styled.section`
    .content-row {
        overflow-x: auto;
        margin-top: calc(1.5rem + 0.5vw);
    }
    .table {
        border-collapse: collapse;
        border-spacing: 0;
        width: 100%;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        overflow: hidden;
        font-size: 13px;
    }
    .table thead {
        background: linear-gradient(135deg, #1e293b, #334155);
        color: white;
        font-size: 12px;
        letter-spacing: 0.5px;
        font-weight: 600;
        text-transform: uppercase;
    }
    .table th,
    .table td {
        text-align: left;
        padding: 11px 13px;
    }
    .table tbody tr {
        border-bottom: 1px solid #f3f4f6;
        transition: background 0.12s;
    }
    .table tbody tr:hover { background: #f8faff; }
    .table tbody tr:last-child { border-bottom: none; }

    .applicant-name { font-weight: 700; color: #111; }
    .fid-tag {
        background: #fef3c7; color: #92400e;
        border-radius: 999px; padding: 2px 10px;
        font-size: 11px; font-weight: 700;
    }
    .position { font-weight: 600; color: #374151; text-transform: capitalize; }
    .date { font-size: 12px; color: #9ca3af; }

    .resume-link {
        color: #4f6ef7; font-weight: 700; font-size: 12px;
        text-decoration: none; display: inline-flex; align-items: center; gap: 4px;
        padding: 3px 8px; background: #eef1ff; border-radius: 6px; transition: 0.15s;
    }
    .resume-link:hover { background: #4f6ef7; color: white; }
    .no-resume { color: #9ca3af; font-size: 12px; }

    .status-col { display: flex; flex-direction: column; gap: 4px; }
    .status-badge {
        display: inline-block;
        padding: 3px 10px; border-radius: 999px;
        font-size: 11px; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.4px;
        width: fit-content;
    }
    .admin-rejected {
        font-size: 10px; color: #7c3aed; background: #ede9fe;
        border-radius: 4px; padding: 2px 6px; font-weight: 700;
        width: fit-content; white-space: nowrap;
    }

    .action-row {
        display: flex;
        gap: 5px;
        flex-wrap: wrap;
        align-items: center;
    }
    .admin-lock {
        font-size: 11px; color: #9ca3af; font-style: italic;
        background: #f3f4f6; padding: 3px 8px; border-radius: 6px;
        white-space: nowrap;
    }
    .act-btn {
        padding: 4px 10px; border-radius: 6px;
        font-size: 11px; font-weight: 700;
        border: none; cursor: pointer;
        transition: 0.15s; white-space: nowrap;
    }
    .act-btn:hover { transform: translateY(-1px); }
    .act-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .act-btn.admit    { background: #d1fae5; color: #065f46; }
    .act-btn.admit:hover { background: #10b981; color: white; }
    .act-btn.interview { background: #dbeafe; color: #1e40af; }
    .act-btn.interview:hover { background: #3b82f6; color: white; }
    .act-btn.decline  { background: #fee2e2; color: #991b1b; }
    .act-btn.decline:hover { background: #ef4444; color: white; }
`;

export default Recruiter;
