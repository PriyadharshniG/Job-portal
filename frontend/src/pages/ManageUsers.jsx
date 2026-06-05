import React, { useState } from "react";
import { useUserContext } from "../context/UserContext";
import LoadingComTwo from "../components/shared/LoadingComTwo";
import styled from "styled-components";
import { MdDelete, MdAdminPanelSettings, MdWork, MdPerson } from "react-icons/md";
import Swal from "sweetalert2";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API = "https://job-portal-jk38.onrender.com/api/v1";
const fetcher = (url) => axios.get(url, { withCredentials: true }).then(r => r.data);

const ROLE_TABS = [
    { key: "user",      label: "Job Seekers",  icon: <MdPerson />,             color: "#4f6ef7", bg: "#eef1ff" },
    { key: "recruiter", label: "Recruiters",   icon: <MdWork />,               color: "#14b8a6", bg: "#f0fdfa" },
    { key: "admin",     label: "Admins",       icon: <MdAdminPanelSettings />, color: "#8b5cf6", bg: "#f5f3ff" },
];

const ManageUsers = () => {
    const { user: me } = useUserContext();
    const qc = useQueryClient();
    const [activeTab, setActiveTab] = useState("user");

    const { isPending, isError, data: usersData, error } = useQuery({
        queryKey: ["manage-users"],
        queryFn: () => fetcher(`${API}/admin/users`),
    });

    // Change Role Mutation
    const roleMutation = useMutation({
        mutationFn: ({ user_id, role }) =>
            axios.put(`${API}/admin/role`, { user_id, role }, { withCredentials: true }),
        onSuccess: () => {
            qc.invalidateQueries(["manage-users"]);
            Swal.fire({ title: "Done!", text: "Role updated.", icon: "success", timer: 1500, showConfirmButton: false });
        },
        onError: (e) =>
            Swal.fire({ title: "Error", text: e?.response?.data?.detail || "Failed.", icon: "error" }),
    });

    // Delete User Mutation
    const deleteMutation = useMutation({
        mutationFn: (user_id) =>
            axios.delete(`${API}/admin/users/${user_id}`, { withCredentials: true }),
        onSuccess: () => {
            qc.invalidateQueries(["manage-users"]);
            Swal.fire({ title: "Deleted!", text: "User removed.", icon: "success", timer: 1500, showConfirmButton: false });
        },
        onError: (e) =>
            Swal.fire({ title: "Error", text: e?.response?.data?.detail || "Failed.", icon: "error" }),
    });

    const confirmRoleChange = (user_id, role, username) => {
        Swal.fire({
            title: "Change Role?",
            text: `Set "${username}" as "${role}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#4f6ef7",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, change!",
        }).then(r => { if (r.isConfirmed) roleMutation.mutate({ user_id, role }); });
    };

    const confirmDelete = (user_id, username) => {
        Swal.fire({
            title: `Delete "${username}"?`,
            text: "This cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, delete!",
        }).then(r => { if (r.isConfirmed) deleteMutation.mutate(user_id); });
    };

    if (isPending) return <LoadingComTwo />;
    if (isError) return (
        <h2 style={{ textAlign: "center", color: "#ef4444", marginTop: "2rem" }}>
            {error?.message || "Failed to load users."}
        </h2>
    );

    const allUsers = usersData?.result || [];
    const counts = {
        user:      allUsers.filter(u => u.role === "user").length,
        recruiter: allUsers.filter(u => u.role === "recruiter").length,
        admin:     allUsers.filter(u => u.role === "admin").length,
    };
    const filtered = allUsers.filter(u => u.role === activeTab);
    const activeConf = ROLE_TABS.find(t => t.key === activeTab);

    return (
        <Wrapper $color={activeConf.color} $bg={activeConf.bg}>
            {/* Page Header */}
            <div className="page-header">
                <div className="header-left">
                    <h2>👥 Manage Members</h2>
                    <p>View, assign roles, and remove portal members</p>
                </div>
                <div className="total-pill">
                    Total: <strong>{allUsers.length}</strong> members
                </div>
            </div>

            {/* Role Tabs */}
            <div className="role-tabs">
                {ROLE_TABS.map(tab => (
                    <button
                        key={tab.key}
                        className={`role-tab ${activeTab === tab.key ? "active" : ""}`}
                        style={activeTab === tab.key
                            ? { background: tab.color, borderColor: tab.color }
                            : {}}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        <span className="tab-icon">{tab.icon}</span>
                        <span className="tab-label">{tab.label}</span>
                        <span className="tab-count"
                            style={activeTab === tab.key
                                ? { background: "rgba(255,255,255,0.25)", color: "white" }
                                : { background: tab.bg, color: tab.color }}>
                            {counts[tab.key]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Section title */}
            <div className="section-bar" style={{ borderLeftColor: activeConf.color }}>
                <span className="section-icon" style={{ color: activeConf.color }}>{activeConf.icon}</span>
                <span className="section-title">{activeConf.label}</span>
                <span className="section-count" style={{ background: activeConf.bg, color: activeConf.color }}>
                    {filtered.length} {filtered.length === 1 ? "member" : "members"}
                </span>
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <div className="empty-box">
                    <div className="empty-icon">📭</div>
                    <p>No {activeConf.label.toLowerCase()} found.</p>
                </div>
            ) : (
                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Username</th>
                                <th>Foundation ID</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Change Role To</th>
                                <th>Remove</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((user, index) => {
                                const isSelf = user._id === me?._id;
                                const num = index + 1 < 10 ? `0${index + 1}` : index + 1;
                                return (
                                    <tr key={user._id} className={isSelf ? "self-row" : ""}>
                                        <td className="num">{num}</td>
                                        <td className="uname">
                                            {user.username}
                                            {isSelf && <span className="you-tag">You</span>}
                                        </td>
                                        <td>
                                            <span className="fid-tag">{user.foundation_id || "—"}</span>
                                        </td>
                                        <td className="email">{user.email}</td>
                                        <td>
                                            {user.is_approved
                                                ? <span className="status-badge approved">✅ Active</span>
                                                : <span className="status-badge pending">⏳ Pending</span>}
                                        </td>
                                        <td>
                                            {isSelf ? (
                                                <span className="no-action">—</span>
                                            ) : (
                                                <div className="role-btns">
                                                    {activeTab !== "user" && (
                                                        <button
                                                            className="rbtn user"
                                                            onClick={() => confirmRoleChange(user._id, "user", user.username)}
                                                            disabled={roleMutation.isPending}
                                                        >
                                                            <MdPerson /> User
                                                        </button>
                                                    )}
                                                    {activeTab !== "recruiter" && (
                                                        <button
                                                            className="rbtn recruiter"
                                                            onClick={() => confirmRoleChange(user._id, "recruiter", user.username)}
                                                            disabled={roleMutation.isPending}
                                                        >
                                                            <MdWork /> Recruiter
                                                        </button>
                                                    )}
                                                    {activeTab !== "admin" && (
                                                        <button
                                                            className="rbtn admin"
                                                            onClick={() => confirmRoleChange(user._id, "admin", user.username)}
                                                            disabled={roleMutation.isPending}
                                                        >
                                                            <MdAdminPanelSettings /> Admin
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            {isSelf ? (
                                                <span className="no-action">—</span>
                                            ) : (
                                                <button
                                                    className="del-btn"
                                                    onClick={() => confirmDelete(user._id, user.username)}
                                                    disabled={deleteMutation.isPending}
                                                    title={`Delete ${user.username}`}
                                                >
                                                    <MdDelete />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </Wrapper>
    );
};

const Wrapper = styled.section`
    padding-bottom: 40px;

    /* Page Header */
    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 28px;
        flex-wrap: wrap;
        gap: 12px;
    }
    .header-left h2 {
        font-size: 22px;
        font-weight: 800;
        color: #111;
        margin-bottom: 4px;
    }
    .header-left p {
        font-size: 13px;
        color: #6b7280;
    }
    .total-pill {
        padding: 8px 18px;
        background: #f1f5f9;
        border: 1px solid #e2e8f0;
        border-radius: 999px;
        font-size: 13px;
        color: #475569;
        font-weight: 500;
        align-self: center;
    }
    .total-pill strong { color: #111; font-weight: 800; }

    /* Role Tabs */
    .role-tabs {
        display: flex;
        gap: 10px;
        margin-bottom: 24px;
        flex-wrap: wrap;
    }
    .role-tab {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        border: 2px solid #e5e7eb;
        background: white;
        cursor: pointer;
        color: #6b7280;
        transition: all 0.2s ease;
        box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .role-tab:hover {
        border-color: #c7d2fe;
        background: #f8faff;
        color: #4f6ef7;
        transform: translateY(-1px);
    }
    .role-tab.active {
        color: white;
        box-shadow: 0 4px 14px rgba(0,0,0,0.15);
        transform: translateY(-2px);
        border-color: transparent;
    }
    .tab-icon {
        font-size: 17px;
        display: flex;
        align-items: center;
    }
    .tab-label { font-weight: 700; }
    .tab-count {
        font-size: 12px;
        font-weight: 800;
        padding: 2px 9px;
        border-radius: 999px;
        min-width: 24px;
        text-align: center;
    }

    /* Section bar */
    .section-bar {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
        background: white;
        border-left: 4px solid;
        border-radius: 10px;
        margin-bottom: 16px;
        border: 1px solid #f0f0f0;
        border-left: 4px solid ${p => p.$color};
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .section-icon { font-size: 18px; display: flex; align-items: center; }
    .section-title { font-size: 15px; font-weight: 800; color: #111; flex: 1; }
    .section-count {
        font-size: 12px; font-weight: 700;
        padding: 3px 12px; border-radius: 999px;
    }

    /* Empty */
    .empty-box {
        text-align: center;
        padding: 60px 20px;
        background: white;
        border: 1px solid #f0f0f0;
        border-radius: 16px;
        color: #9ca3af;
    }
    .empty-icon { font-size: 40px; margin-bottom: 12px; }
    .empty-box p { font-size: 15px; font-weight: 500; }

    /* Table */
    .table-wrap {
        overflow-x: auto;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 14px;
        overflow: hidden;
        box-shadow: 0 2px 12px rgba(0,0,0,0.04);
    }
    .table {
        border-collapse: collapse;
        width: 100%;
        font-size: 13px;
    }
    .table thead {
        background: linear-gradient(135deg, #1e293b, #334155);
        color: white;
    }
    .table th {
        padding: 13px 16px;
        text-align: left;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.6px;
        text-transform: uppercase;
    }
    .table td {
        padding: 13px 16px;
        border-bottom: 1px solid #f3f4f6;
        vertical-align: middle;
    }
    .table tbody tr {
        transition: background 0.12s;
    }
    .table tbody tr:hover { background: #f8faff; }
    .table tbody tr.self-row { background: #fffbeb; }
    .table tbody tr:last-child td { border-bottom: none; }

    .num { font-size: 12px; color: #9ca3af; font-weight: 600; }
    .uname {
        font-weight: 700;
        color: #111;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .you-tag {
        font-size: 10px;
        background: #fef3c7;
        color: #92400e;
        border-radius: 999px;
        padding: 2px 8px;
        font-weight: 700;
    }
    .fid-tag {
        background: #fef3c7;
        color: #92400e;
        border-radius: 999px;
        padding: 3px 11px;
        font-size: 11px;
        font-weight: 700;
        white-space: nowrap;
    }
    .email { font-size: 12px; color: #6b7280; }

    .status-badge {
        font-size: 11px;
        font-weight: 700;
        padding: 3px 10px;
        border-radius: 999px;
        white-space: nowrap;
    }
    .status-badge.approved { background: #d1fae5; color: #065f46; }
    .status-badge.pending  { background: #fef3c7; color: #92400e; }

    /* Role change buttons */
    .role-btns {
        display: flex;
        gap: 5px;
        flex-wrap: wrap;
    }
    .rbtn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 7px;
        border: none;
        cursor: pointer;
        transition: all 0.15s;
        white-space: nowrap;
    }
    .rbtn:hover { transform: translateY(-1px); filter: brightness(1.1); }
    .rbtn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .rbtn.user      { background: #dbeafe; color: #1e40af; }
    .rbtn.recruiter { background: #ccfbf1; color: #0f766e; }
    .rbtn.admin     { background: #f3e8ff; color: #7e22ce; }

    .no-action { font-size: 12px; color: #d1d5db; }

    /* Delete */
    .del-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        border: none;
        background: #fee2e2;
        color: #991b1b;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.15s;
    }
    .del-btn:hover { background: #ef4444; color: white; transform: scale(1.1); }
    .del-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
`;

export default ManageUsers;
