import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import styled from "styled-components";
import LoadingComTwo from "../components/shared/LoadingComTwo";
import Swal from "sweetalert2";

const API = "http://localhost:8000/api/v1";

const fetcher = (url) => axios.get(url, { withCredentials: true }).then(r => r.data);

const Admin = () => {
    const qc = useQueryClient();
    const [newFID, setNewFID] = useState("");
    const [newFIDName, setNewFIDName] = useState("");
    const [activeTab, setActiveTab] = useState("overview");

    // Stats
    const { data: stats, isPending: statsLoading } = useQuery({
        queryKey: ["admin_stats"],
        queryFn: () => fetcher(`${API}/admin/stats`),
    });

    // All Users
    const { data: usersData } = useQuery({
        queryKey: ["admin_users"],
        queryFn: () => fetcher(`${API}/admin/users`),
    });

    // Pending Users
    const { data: pendingData } = useQuery({
        queryKey: ["admin_pending"],
        queryFn: () => fetcher(`${API}/admin/pending`),
    });

    // Foundation IDs
    const { data: fidsData } = useQuery({
        queryKey: ["admin_fids"],
        queryFn: () => fetcher(`${API}/admin/foundation-ids`),
    });

    // Approve / Reject
    const approvalMutation = useMutation({
        mutationFn: ({ user_id, action }) =>
            axios.post(`${API}/admin/approve`, { user_id, action }, { withCredentials: true }),
        onSuccess: (_, vars) => {
            Swal.fire("Done!", `User ${vars.action}d successfully.`, "success");
            qc.invalidateQueries(["admin_pending"]);
            qc.invalidateQueries(["admin_users"]);
            qc.invalidateQueries(["admin_stats"]);
        },
    });

    // Change Role
    const roleMutation = useMutation({
        mutationFn: ({ user_id, role }) =>
            axios.put(`${API}/admin/role`, { user_id, role }, { withCredentials: true }),
        onSuccess: () => {
            Swal.fire("Done!", "User role updated.", "success");
            qc.invalidateQueries(["admin_users"]);
        },
    });

    // Add Foundation ID
    const addFIDMutation = useMutation({
        mutationFn: () =>
            axios.post(`${API}/admin/foundation-id`, { foundation_id: newFID, member_name: newFIDName }, { withCredentials: true }),
        onSuccess: () => {
            Swal.fire("Added!", `Foundation ID ${newFID} added.`, "success");
            setNewFID(""); setNewFIDName("");
            qc.invalidateQueries(["admin_fids"]);
        },
        onError: (e) => Swal.fire("Error", e?.response?.data?.detail, "error"),
    });

    // Delete Foundation ID
    const delFIDMutation = useMutation({
        mutationFn: (fid) => axios.delete(`${API}/admin/foundation-id/${fid}`, { withCredentials: true }),
        onSuccess: () => qc.invalidateQueries(["admin_fids"]),
    });

    if (statsLoading) return <LoadingComTwo />;

    const s = stats?.result || {};

    const statCards = [
        { label: "Total Members", value: s.total_users, color: "#4f6ef7", icon: "👥" },
        { label: "Admins", value: s.admins, color: "#8b5cf6", icon: "🛡️" },
        { label: "Recruiters", value: s.recruiters, color: "#14b8a6", icon: "🧑‍💼" },
        { label: "Job Seekers", value: s.members, color: "#10b981", icon: "👨‍💻" },
        { label: "Pending Approval", value: s.pending_approval, color: "#f59e0b", icon: "⏳" },
        { label: "Total Jobs", value: s.total_jobs, color: "#f97316", icon: "💼" },
        { label: "Total Applications", value: s.total_applications, color: "#6366f1", icon: "📋" },
        { label: "Foundation IDs", value: s.foundation_ids_count, color: "#ec4899", icon: "🪪" },
    ];

    return (
        <Wrapper>
            <div className="header">
                <h2>🛡️ Admin Control Panel</h2>
                <p>Manage members, Foundation IDs, approvals, and roles</p>
            </div>

            {/* Tab Nav */}
            <div className="tabs">
                {["overview", "pending", "users", "foundation-ids"].map(t => (
                    <button key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
                        {t === "overview" ? "📊 Overview" :
                            t === "pending" ? `⏳ Pending (${s.pending_approval || 0})` :
                                t === "users" ? "👥 All Users" : "🪪 Foundation IDs"}
                    </button>
                ))}
            </div>

            {/* OVERVIEW */}
            {activeTab === "overview" && (
                <div className="stat-grid">
                    {statCards.map(c => (
                        <div className="stat-card" key={c.label} style={{ borderLeftColor: c.color }}>
                            <div className="stat-icon">{c.icon}</div>
                            <div className="stat-num" style={{ color: c.color }}>{c.value ?? "—"}</div>
                            <div className="stat-label">{c.label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* PENDING APPROVAL */}
            {activeTab === "pending" && (
                <div className="section">
                    <h3>⏳ Pending Member Approvals</h3>
                    {!pendingData?.result?.length ? (
                        <div className="empty">✅ No pending approvals</div>
                    ) : (
                        <div className="user-list">
                            {pendingData.result.map(u => (
                                <div className="user-row" key={u._id}>
                                    <div className="user-info">
                                        <span className="uname">{u.username}</span>
                                        <span className="ufid">🪪 {u.foundation_id}</span>
                                        <span className="uemail">{u.email}</span>
                                        <span className={`urole role-${u.role}`}>{u.role}</span>
                                    </div>
                                    <div className="user-actions">
                                        <button className="btn-approve"
                                            onClick={() => approvalMutation.mutate({ user_id: u._id, action: "approve" })}>
                                            ✅ Approve
                                        </button>
                                        <button className="btn-reject"
                                            onClick={() => approvalMutation.mutate({ user_id: u._id, action: "reject" })}>
                                            ❌ Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ALL USERS */}
            {activeTab === "users" && (
                <div className="section">
                    <h3>👥 All Members ({usersData?.result?.length || 0})</h3>
                    <div className="user-list">
                        {usersData?.result?.map(u => (
                            <div className="user-row" key={u._id}>
                                <div className="user-info">
                                    <span className="uname">{u.username}</span>
                                    <span className="ufid">🪪 {u.foundation_id}</span>
                                    <span className="uemail">{u.email}</span>
                                    <span className={`urole role-${u.role}`}>{u.role}</span>
                                    {!u.is_approved && <span className="upending">⏳ Pending</span>}
                                </div>
                                <div className="user-actions">
                                    <select className="role-select"
                                        defaultValue={u.role}
                                        onChange={(e) => roleMutation.mutate({ user_id: u._id, role: e.target.value })}>
                                        <option value="user">user</option>
                                        <option value="recruiter">recruiter</option>
                                        <option value="admin">admin</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* FOUNDATION IDs */}
            {activeTab === "foundation-ids" && (
                <div className="section">
                    <h3>🪪 Foundation ID Management</h3>
                    <div className="fid-add">
                        <input type="text" placeholder="Foundation ID (e.g. VGLUG-007)" value={newFID} onChange={e => setNewFID(e.target.value)} />
                        <input type="text" placeholder="Member Name" value={newFIDName} onChange={e => setNewFIDName(e.target.value)} />
                        <button className="btn-add" onClick={() => addFIDMutation.mutate()} disabled={!newFID}>
                            ➕ Add ID
                        </button>
                    </div>
                    <div className="fid-list">
                        {fidsData?.result?.map(f => (
                            <div className="fid-row" key={f._id}>
                                <span className="fid-badge">🪪 {f.foundation_id}</span>
                                <span className="fid-name">{f.member_name || "—"}</span>
                                <button className="btn-del" onClick={() => delFIDMutation.mutate(f.foundation_id)}>🗑️</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Wrapper>
    );
};

const Wrapper = styled.section`
    padding: 8px 0 40px;

    .header { margin-bottom: 24px; }
    .header h2 { font-size: 22px; font-weight: 800; color: #111; }
    .header p { font-size: 13px; color: #6b7280; margin-top: 4px; }

    .tabs { display: flex; gap: 8px; margin-bottom: 28px; flex-wrap: wrap; }
    .tab { padding: 9px 20px; border-radius: 999px; font-size: 13px; font-weight: 600; border: 1.5px solid #e5e7eb; background: white; cursor: pointer; color: #6b7280; transition: 0.2s; }
    .tab.active, .tab:hover { background: #f59e0b; color: white; border-color: #f59e0b; }

    .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    @media (max-width: 900px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } }

    .stat-card { background: white; border: 1px solid #f0f0f0; border-left: 4px solid; border-radius: 14px; padding: 20px; transition: 0.25s; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    .stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
    .stat-icon { font-size: 28px; margin-bottom: 10px; }
    .stat-num { font-size: 36px; font-weight: 900; line-height: 1; margin-bottom: 6px; }
    .stat-label { font-size: 13px; color: #6b7280; font-weight: 500; }

    .section { background: white; border: 1px solid #f0f0f0; border-radius: 16px; padding: 24px; }
    .section h3 { font-size: 17px; font-weight: 800; color: #111; margin-bottom: 18px; }
    .empty { text-align: center; color: #6b7280; padding: 32px; font-size: 15px; }

    .user-list { display: flex; flex-direction: column; gap: 10px; }
    .user-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 14px 18px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; flex-wrap: wrap; }
    .user-info { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .uname { font-size: 14px; font-weight: 700; color: #111; }
    .ufid { font-size: 12px; background: #fef3c7; color: #92400e; border-radius: 999px; padding: 2px 10px; font-weight: 600; }
    .uemail { font-size: 12px; color: #6b7280; }
    .urole { font-size: 11px; font-weight: 700; border-radius: 999px; padding: 2px 10px; text-transform: uppercase; }
    .role-admin { background: #fce7f3; color: #9d174d; }
    .role-recruiter { background: #d1fae5; color: #065f46; }
    .role-user { background: #dbeafe; color: #1e40af; }
    .upending { font-size: 11px; color: #d97706; font-weight: 600; }

    .user-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
    .btn-approve { background: #10b981; color: white; border: none; border-radius: 8px; padding: 7px 14px; font-weight: 700; font-size: 12px; cursor: pointer; }
    .btn-reject { background: #ef4444; color: white; border: none; border-radius: 8px; padding: 7px 14px; font-weight: 700; font-size: 12px; cursor: pointer; }
    .role-select { border: 1.5px solid #e5e7eb; border-radius: 8px; padding: 6px 10px; font-size: 12px; font-weight: 600; cursor: pointer; outline: none; }

    .fid-add { display: flex; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; }
    .fid-add input { flex: 1; min-width: 180px; padding: 10px 14px; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 13px; outline: none; }
    .fid-add input:focus { border-color: #f59e0b; }
    .btn-add { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; border: none; border-radius: 10px; padding: 10px 20px; font-weight: 700; font-size: 13px; cursor: pointer; }
    .btn-add:disabled { opacity: 0.5; cursor: not-allowed; }

    .fid-list { display: flex; flex-direction: column; gap: 8px; }
    .fid-row { display: flex; align-items: center; gap: 14px; padding: 12px 16px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; }
    .fid-badge { font-size: 13px; font-weight: 700; color: #92400e; }
    .fid-name { flex: 1; font-size: 13px; color: #4b5563; }
    .btn-del { background: none; border: none; font-size: 18px; cursor: pointer; opacity: 0.6; transition: 0.2s; }
    .btn-del:hover { opacity: 1; }
`;

export default Admin;
