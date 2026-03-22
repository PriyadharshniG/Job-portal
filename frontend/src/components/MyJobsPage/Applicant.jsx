import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import LoadingComTwo from "../shared/LoadingComTwo";
import { MdVisibility } from "react-icons/md";

const STATUS_COLOR = {
    pending: "#f59e0b",
    interview: "#3b82f6",
    accepted: "#10b981",
    declined: "#ef4444",
};

const Applicant = () => {
    const {
        isPending,
        isError,
        data: applications,
        error,
    } = useQuery({
        queryKey: ["my-applications"],
        queryFn: async () => {
            const response = await axios.get(
                `http://localhost:8000/api/v1/applications/my`,
                { withCredentials: true }
            );
            return response?.data?.result;
        },
    });

    if (isPending) return <LoadingComTwo />;

    if (isError) {
        return (
            <h2 style={{ textAlign: "center", marginTop: "2rem", color: "#ef4444" }}>
                {error?.message || "Failed to load applications."}
            </h2>
        );
    }

    if (!applications || applications.length === 0) {
        return (
            <div style={{ textAlign: "center", marginTop: "3rem", color: "#6b7280", fontSize: "16px" }}>
                📭 You haven't applied for any jobs yet.{" "}
                <Link to="/all-jobs" style={{ color: "#f59e0b", fontWeight: 700 }}>Browse Jobs →</Link>
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
                            <th>Job Position</th>
                            <th>Company</th>
                            <th>Applied On</th>
                            <th>Resume</th>
                            <th>Status</th>
                            <th>View</th>
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

                            return (
                                <tr key={app._id}>
                                    <td>{i}</td>
                                    <td className="position">{app?.position || "—"}</td>
                                    <td>{app?.company || "—"}</td>
                                    <td className="date">{appliedDate}</td>
                                    <td>
                                        {app?.resume_url ? (
                                            <span className="resume-tag" title={app.resume_url}>
                                                📄 {app.resume_url.length > 20 ? app.resume_url.slice(0, 20) + "…" : app.resume_url}
                                            </span>
                                        ) : (
                                            <span className="no-resume">—</span>
                                        )}
                                    </td>
                                    <td>
                                        <span
                                            className="status-badge"
                                            style={{
                                                background: STATUS_COLOR[app?.status] || "#6b7280",
                                            }}
                                        >
                                            {app?.status || "pending"}
                                        </span>
                                    </td>
                                    <td className="action-row">
                                        <Link
                                            to={`/job/${app?.job_id}`}
                                            className="action view"
                                            title="View Job Details"
                                        >
                                            <MdVisibility />
                                        </Link>
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
    }
    .table thead {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: white;
        font-size: 13px;
        letter-spacing: 0.5px;
        font-weight: 600;
        text-transform: uppercase;
    }
    .table th,
    .table td {
        text-align: left;
        padding: 13px 14px;
    }
    .table tbody tr {
        font-size: 14px;
        font-weight: 400;
        transition: background 0.15s;
        border-bottom: 1px solid #f3f4f6;
    }
    .table tbody tr:hover { background: #fffbeb; }
    .table tbody tr:last-child { border-bottom: none; }
    .position { font-weight: 600; color: #111; text-transform: capitalize; }
    .date { font-size: 12px; color: #6b7280; }

    .status-badge {
        display: inline-block;
        color: white;
        font-size: 11px;
        font-weight: 700;
        padding: 3px 10px;
        border-radius: 999px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .action-row {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .action.view {
        font-size: 20px;
        color: #10b981;
        transition: 0.2s;
    }
    .action.view:hover { color: #059669; transform: scale(1.15); }

    .resume-tag {
        display: inline-flex; align-items: center; gap: 4px;
        background: #fffbeb; color: #92400e;
        border: 1px solid #fde68a; border-radius: 6px;
        padding: 2px 8px; font-size: 11px; font-weight: 600;
        max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .no-resume { color: #9ca3af; font-size: 12px; }
`;

export default Applicant;
