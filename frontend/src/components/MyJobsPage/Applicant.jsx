import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import LoadingComTwo from "../shared/LoadingComTwo";
import { MdVisibility } from "react-icons/md";
import { FiSearch } from "react-icons/fi";
import {
    TfiLocationPin,
} from "react-icons/tfi";
import { BsFillBriefcaseFill } from "react-icons/bs";
import { FaRegCalendarAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
dayjs.extend(advancedFormat);

const STATUS_COLOR = {
    pending:   { bg: "#fef3c7", color: "#92400e",  label: "⏳ Pending" },
    interview: { bg: "#dbeafe", color: "#1e3a8a",  label: "🎙️ Interview" },
    accepted:  { bg: "#d1fae5", color: "#065f46",  label: "✅ Accepted" },
    declined:  { bg: "#fee2e2", color: "#991b1b",  label: "❌ Rejected" },
};

/* ──────────────────────────────────────────
   Mini inline Job card for the Browse section
────────────────────────────────────────── */
const MiniJobCard = ({ job, appliedIds, onApplied }) => {
    const [applying, setApplying] = useState(false);
    const deadline = dayjs(job?.job_deadline).format("MMM Do, YYYY");
    const alreadyApplied = appliedIds.has(job._id);

    const handleApply = async () => {
        setApplying(true);
        try {
            const response = await axios.post(
                `http://localhost:8000/api/v1/applications/apply`,
                { job_id: job._id, resume_url: "" },
                { withCredentials: true }
            );
            Swal.fire({
                icon: "success",
                title: "Applied! 🎉",
                text: response?.data?.message || "Application submitted!",
                timer: 1800,
                showConfirmButton: false,
            });
            onApplied(job._id);
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: err?.response?.data?.detail || "Something went wrong.",
            });
        }
        setApplying(false);
    };

    return (
        <div className="mini-card">
            <div className="mini-logo">{job?.company?.charAt(0)}</div>
            <div className="mini-info">
                <h4 className="mini-title">{job?.position}</h4>
                <span className="mini-company">{job?.company}</span>
                <div className="mini-meta">
                    <span><FaRegCalendarAlt /> {deadline}</span>
                    <span><TfiLocationPin /> {job?.job_location}</span>
                    <span><BsFillBriefcaseFill /> {job?.job_type}</span>
                </div>
            </div>
            <div className="mini-actions">
                <Link to={`/job/${job._id}`} className="mini-detail-btn">Details</Link>
                <button
                    className={`mini-apply-btn${alreadyApplied ? " applied" : ""}`}
                    onClick={handleApply}
                    disabled={applying || alreadyApplied}
                >
                    {alreadyApplied ? "✓ Applied" : applying ? "Applying…" : "Apply"}
                </button>
            </div>
        </div>
    );
};

/* ──────────────────────────────────────────
   Main Applicant Component
────────────────────────────────────────── */
const Applicant = () => {
    const queryClient = useQueryClient();
    const [newlyApplied, setNewlyApplied] = useState(new Set());

    /* My Applications */
    const {
        isPending,
        isError,
        data: applications,
        error,
    } = useQuery({
        queryKey: ["my-applications"],
        queryFn: async () => {
            const res = await axios.get(
                `http://localhost:8000/api/v1/applications/my`,
                { withCredentials: true }
            );
            return res?.data?.result;
        },
    });

    /* All available jobs */
    const { data: jobsData, isLoading: jobsLoading } = useQuery({
        queryKey: ["browse-jobs-inline"],
        queryFn: async () => {
            const res = await axios.get(
                `http://localhost:8000/api/v1/jobs/all?page=1&limit=20`,
                { withCredentials: true }
            );
            return res?.data?.result || [];
        },
    });

    const handleApplied = (jobId) => {
        setNewlyApplied((prev) => new Set([...prev, jobId]));
        // refresh my-applications list
        queryClient.invalidateQueries({ queryKey: ["my-applications"] });
    };

    // Combine server-applied ids + newly applied this session
    const appliedJobIds = new Set([
        ...(applications?.map((a) => a.job_id) || []),
        ...newlyApplied,
    ]);

    if (isPending) return <LoadingComTwo />;

    if (isError) {
        return (
            <h2 style={{ textAlign: "center", marginTop: "2rem", color: "#ef4444" }}>
                {error?.message || "Failed to load applications."}
            </h2>
        );
    }

    /* normalize jobs list from API response shape */
    const jobsList = Array.isArray(jobsData) ? jobsData : [];

    return (
        <Wrapper>
            {/* ── SECTION 1: My Applications ── */}
            <div className="section-header">
                <h3 className="section-title">📋 My Applications</h3>
            </div>

            {applications && applications.length > 0 ? (
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
                                const sc = STATUS_COLOR[app?.status] || {
                                    bg: "#f3f4f6", color: "#374151", label: app?.status,
                                };
                                const isDeclined = app?.status === "declined";

                                return (
                                    <tr key={app._id}>
                                        <td>{i}</td>
                                        <td className="position">{app?.position || "—"}</td>
                                        <td className="company">{app?.company || "—"}</td>
                                        <td className="date">{appliedDate}</td>
                                        <td>
                                            {app?.resume_url ? (
                                                <a
                                                    href={`http://localhost:8000${app.resume_url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="resume-link"
                                                >
                                                    📄 My Resume
                                                </a>
                                            ) : (
                                                <span className="no-resume">—</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="status-col">
                                                <span
                                                    className="status-badge"
                                                    style={{ background: sc.bg, color: sc.color }}
                                                >
                                                    {sc.label || app?.status || "pending"}
                                                </span>
                                                {isDeclined && app?.rejected_by && (
                                                    <span className="rejection-info">
                                                        {app.rejected_by === "admin"
                                                            ? "🛡️ Rejected by Admin"
                                                            : "🧑‍💼 Rejected by Recruiter"}
                                                        {app?.rejected_by_name ? ` (${app.rejected_by_name})` : ""}
                                                    </span>
                                                )}
                                            </div>
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
            ) : (
                <div className="empty-apps">
                    <span>📭</span>
                    <p>You haven't applied for any jobs yet. Browse jobs below and apply!</p>
                </div>
            )}

            {/* ── SECTION 2: Browse Available Jobs (same page) ── */}
            <div className="browse-section">
                <div className="section-header">
                    <h3 className="section-title">
                        <FiSearch /> Browse Available Jobs
                    </h3>
                    <span className="section-sub">Apply directly from here — no page change!</span>
                </div>

                {jobsLoading ? (
                    <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
                        Loading jobs…
                    </div>
                ) : jobsList.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>
                        No jobs available right now.
                    </div>
                ) : (
                    <div className="jobs-grid">
                        {jobsList.map((job) => (
                            <MiniJobCard
                                key={job._id}
                                job={job}
                                appliedIds={appliedJobIds}
                                onApplied={handleApplied}
                            />
                        ))}
                    </div>
                )}
            </div>
        </Wrapper>
    );
};

const Wrapper = styled.section`
    /* ── Section headers ── */
    .section-header {
        display: flex;
        align-items: baseline;
        gap: 12px;
        margin-top: 2rem;
        margin-bottom: 0.75rem;
        flex-wrap: wrap;
    }
    .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 700;
        color: #1e293b;
        padding-bottom: 6px;
        border-bottom: 3px solid #4f6ef7;
    }
    .section-sub {
        font-size: 12px;
        color: #6b7280;
        font-style: italic;
    }

    /* ── Empty state ── */
    .empty-apps {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 20px;
        background: #f8fafc;
        border: 1px dashed #cbd5e1;
        border-radius: 10px;
        color: #64748b;
        font-size: 14px;
        font-weight: 500;
        margin-top: 1rem;
    }
    .empty-apps span { font-size: 1.5rem; }

    /* ── Applications table ── */
    .content-row {
        overflow-x: auto;
        margin-top: 0.75rem;
    }
    .table {
        border-collapse: collapse;
        width: 100%;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        overflow: hidden;
    }
    .table thead {
        background: linear-gradient(135deg, #4f6ef7, #7b93f9);
        color: white;
        font-size: 12px;
        letter-spacing: 0.5px;
        font-weight: 600;
        text-transform: uppercase;
    }
    .table th, .table td { text-align: left; padding: 13px 14px; }
    .table tbody tr {
        font-size: 14px;
        border-bottom: 1px solid #f3f4f6;
        transition: background 0.15s;
    }
    .table tbody tr:hover { background: #f0f4ff; }
    .table tbody tr:last-child { border-bottom: none; }

    .position { font-weight: 700; color: #111; text-transform: capitalize; }
    .company  { font-weight: 500; color: #374151; }
    .date     { font-size: 12px; color: #6b7280; }

    .status-col { display: flex; flex-direction: column; gap: 4px; }
    .status-badge {
        display: inline-block;
        font-size: 11px; font-weight: 700;
        padding: 4px 12px; border-radius: 999px;
        text-transform: uppercase; letter-spacing: 0.4px;
        width: fit-content;
    }
    .rejection-info {
        font-size: 10px; font-weight: 600; color: #7c3aed;
        background: #ede9fe; border-radius: 4px;
        padding: 2px 7px; width: fit-content; white-space: nowrap;
    }
    .resume-link {
        color: #4f6ef7; font-weight: 700; font-size: 12px;
        text-decoration: none; display: inline-flex; align-items: center; gap: 4px;
        padding: 3px 8px; background: #eef1ff; border-radius: 6px; transition: 0.15s;
    }
    .resume-link:hover { background: #4f6ef7; color: white; }
    .no-resume { color: #9ca3af; font-size: 12px; }
    .action-row { display: flex; align-items: center; gap: 8px; }
    .action.view { font-size: 20px; color: #4f6ef7; transition: 0.2s; }
    .action.view:hover { color: #3a57e8; transform: scale(1.15); }

    /* ── Browse section ── */
    .browse-section { margin-top: 2.5rem; }

    .jobs-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 16px;
        margin-top: 1rem;
    }

    /* ── Mini Job Card ── */
    .mini-card {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        transition: box-shadow 0.2s, transform 0.2s;
    }
    .mini-card:hover {
        box-shadow: 0 6px 20px rgba(79,110,247,0.15);
        transform: translateY(-2px);
    }
    .mini-logo {
        width: 42px; height: 42px;
        background: linear-gradient(135deg, #f59e0b, #d97706);
        border-radius: 10px;
        display: flex; align-items: center; justify-content: center;
        color: white; font-size: 22px; font-weight: 800;
        text-transform: uppercase; flex-shrink: 0;
    }
    .mini-info { flex: 1; }
    .mini-title {
        font-size: 15px; font-weight: 700;
        color: #111; text-transform: capitalize;
        line-height: 1.3; margin-bottom: 2px;
    }
    .mini-company {
        font-size: 12px; color: #6b7280; font-weight: 600;
        text-transform: capitalize;
    }
    .mini-meta {
        display: flex; flex-direction: column; gap: 4px; margin-top: 8px;
    }
    .mini-meta span {
        display: flex; align-items: center; gap: 6px;
        font-size: 12px; color: #475569;
    }
    .mini-actions {
        display: flex; gap: 8px; align-items: center; flex-wrap: wrap;
        margin-top: 4px;
    }
    .mini-detail-btn {
        padding: 6px 16px;
        background: #1e293b; color: #fff;
        border-radius: 6px; font-size: 13px; font-weight: 600;
        text-decoration: none; transition: 0.2s;
    }
    .mini-detail-btn:hover { background: #334155; }

    .mini-apply-btn {
        padding: 6px 16px;
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: #fff; border: none; border-radius: 6px;
        font-size: 13px; font-weight: 700; cursor: pointer;
        transition: 0.2s; box-shadow: 0 2px 8px rgba(245,158,11,0.3);
    }
    .mini-apply-btn:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 14px rgba(245,158,11,0.45);
    }
    .mini-apply-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .mini-apply-btn.applied {
        background: linear-gradient(135deg, #10b981, #059669);
        box-shadow: 0 2px 8px rgba(16,185,129,0.3);
    }
`;

export default Applicant;
