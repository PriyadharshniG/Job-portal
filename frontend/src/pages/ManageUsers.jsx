import React from "react";
import { useUserContext } from "../context/UserContext";
import LoadingComTwo from "../components/shared/LoadingComTwo";
import { CiSquarePlus } from "react-icons/ci";
import styled from "styled-components";
import { MdDelete } from "react-icons/md";

import Swal from "sweetalert2";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API = "http://localhost:8000/api/v1";
const fetcher = (url) => axios.get(url, { withCredentials: true }).then(r => r.data);

const ManageUsers = () => {
    const { user: me } = useUserContext();
    const qc = useQueryClient();

    const { isPending, isError, data: users, error } = useQuery({
        queryKey: ["manage-users"],
        queryFn: () => fetcher(`${API}/admin/users`),
    });

    // Change Role Mutation
    const roleMutation = useMutation({
        mutationFn: ({ user_id, role }) =>
            axios.put(`${API}/admin/role`, { user_id, role }, { withCredentials: true }),
        onSuccess: () => {
            qc.invalidateQueries(["manage-users"]);
            Swal.fire({ title: "Done!", text: "Role updated successfully.", icon: "success", timer: 1500, showConfirmButton: false });
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
            Swal.fire({ title: "Deleted!", text: "User has been removed.", icon: "success", timer: 1500, showConfirmButton: false });
        },
        onError: (e) =>
            Swal.fire({ title: "Error", text: e?.response?.data?.detail || "Failed to delete.", icon: "error" }),
    });

    const confirmRoleChange = (user_id, role) => {
        Swal.fire({
            title: "Change Role?",
            text: `Set this user as "${role}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#f59e0b",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, change it!",
        }).then(result => {
            if (result.isConfirmed) roleMutation.mutate({ user_id, role });
        });
    };

    const confirmDelete = (user_id, username) => {
        Swal.fire({
            title: `Delete "${username}"?`,
            text: "This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, delete!",
        }).then(result => {
            if (result.isConfirmed) deleteMutation.mutate(user_id);
        });
    };

    if (isPending) return <LoadingComTwo />;

    if (isError) {
        return (
            <h2 style={{ textAlign: "center", color: "#ef4444", marginTop: "2rem" }}>
                {error?.message || "Failed to load users."}
            </h2>
        );
    }

    if (!users?.result?.length) {
        return (
            <h2 style={{ textAlign: "center", color: "#6b7280", marginTop: "2rem" }}>
                -- User List is Empty --
            </h2>
        );
    }

    return (
        <Wrapper>
            <div className="title-row">
                Manage Users
                <CiSquarePlus className="ml-1 text-xl md:text-2xl" />
            </div>
            <div className="content-row">
                <table className="table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Username</th>
                            <th>Foundation ID</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users?.result?.map((user, index) => {
                            let i = index + 1 < 10 ? `0${index + 1}` : index + 1;
                            const isSelf = user?._id === me._id;
                            return (
                                <tr key={user._id}>
                                    <td>{i}</td>
                                    <td className="uname">{user?.username}</td>
                                    <td><span className="fid-tag">{user?.foundation_id || "—"}</span></td>
                                    <td className="email">{user?.email}</td>
                                    <td>
                                        <span className={`role-badge role-${user?.role}`}>
                                            {user?.role}
                                        </span>
                                    </td>
                                    <td className="action-row">
                                        {isSelf ? (
                                            <span className="self-tag">You</span>
                                        ) : (
                                            <>
                                                {user?.role !== "admin" && (
                                                    <button
                                                        className="action-btn admin"
                                                        onClick={() => confirmRoleChange(user._id, "admin")}
                                                        disabled={roleMutation.isPending}
                                                    >
                                                        Admin
                                                    </button>
                                                )}
                                                {user?.role !== "recruiter" && (
                                                    <button
                                                        className="action-btn recruiter"
                                                        onClick={() => confirmRoleChange(user._id, "recruiter")}
                                                        disabled={roleMutation.isPending}
                                                    >
                                                        Recruiter
                                                    </button>
                                                )}
                                                {user?.role !== "user" && (
                                                    <button
                                                        className="action-btn user"
                                                        onClick={() => confirmRoleChange(user._id, "user")}
                                                        disabled={roleMutation.isPending}
                                                    >
                                                        User
                                                    </button>
                                                )}
                                                <button
                                                    className="action-btn delete"
                                                    onClick={() => confirmDelete(user._id, user.username)}
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    <MdDelete style={{ marginRight: "3px", verticalAlign: "middle" }} />
                                                    Delete
                                                </button>
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
    .title-row {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        font-size: calc(0.9rem + 0.4vw);
        text-transform: capitalize;
        letter-spacing: 1px;
        font-weight: 600;
        opacity: 0.85;
        color: var(--color-black);
        position: relative;
    }
    .title-row:before {
        content: "";
        position: absolute;
        bottom: -4px;
        left: 0;
        width: calc(30px + 0.7vw);
        height: calc(2px + 0.1vw);
        background-color: var(--color-primary);
    }
    .content-row {
        overflow-x: auto;
        margin-top: calc(2rem + 0.5vw);
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
        padding: 12px 14px;
    }
    .table tbody tr {
        border-bottom: 1px solid #f3f4f6;
        transition: background 0.12s;
    }
    .table tbody tr:hover { background: #f8faff; }
    .table tbody tr:last-child { border-bottom: none; }

    .uname { font-weight: 700; color: #111; }
    .email { font-size: 12px; color: #6b7280; }

    .fid-tag {
        background: #fef3c7; color: #92400e;
        border-radius: 999px; padding: 2px 10px;
        font-size: 11px; font-weight: 700;
    }

    .role-badge {
        display: inline-block;
        font-size: 11px; font-weight: 700;
        border-radius: 999px; padding: 2px 10px;
        text-transform: uppercase;
    }
    .role-admin     { background: #fce7f3; color: #9d174d; }
    .role-recruiter { background: #d1fae5; color: #065f46; }
    .role-user      { background: #dbeafe; color: #1e40af; }

    .self-tag {
        font-size: 12px; color: #9ca3af; font-style: italic;
    }

    .action-row {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
    }
    .action-btn {
        font-size: 12px;
        padding: 4px 10px;
        border-radius: 6px;
        color: #fff;
        text-transform: capitalize;
        font-weight: 600;
        border: none;
        cursor: pointer;
        transition: 0.15s;
        display: inline-flex;
        align-items: center;
    }
    .action-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
    .action-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .action-btn.recruiter { background-color: #14b8a6; }
    .action-btn.admin     { background-color: #8b5cf6; }
    .action-btn.user      { background-color: #3b82f6; }
    .action-btn.delete    { background-color: #ef4444; }
`;

export default ManageUsers;
