import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";
import Swal from "sweetalert2";
import { FiGithub, FiRefreshCw, FiTrash2, FiStar, FiExternalLink } from "react-icons/fi";
import { useUserContext } from "../context/UserContext";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const API = "http://localhost:8000/api/v1";

const GitHubConnect = () => {
    const { user, handleFetchMe } = useUserContext();
    const [username, setUsername] = useState(user?.github_username || "");
    const [loading, setLoading] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);

    const connected = !!user?.github_username;
    const repos = user?.github_repos || [];
    const languages = user?.github_languages || [];

    const handleConnect = async () => {
        const uname = username.trim();
        if (!uname) {
            Swal.fire({ icon: "warning", title: "Enter a username", text: "Please enter your GitHub username." });
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post(`${API}/student/github/connect`, { github_username: uname }, { withCredentials: true });
            await handleFetchMe();
            Swal.fire({
                icon: "success",
                title: "GitHub Connected! 🎉",
                html: `<b>${res.data.github?.github_repos?.length || 0} repositories</b> fetched.<br>Languages auto-added to your skills!`,
                timer: 3500,
                showConfirmButton: false,
            });
        } catch (err) {
            Swal.fire({ icon: "error", title: "Connection Failed", text: err?.response?.data?.detail || "Could not connect GitHub." });
        }
        setLoading(false);
    };

    const handleDisconnect = async () => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Disconnect GitHub?",
            text: "This will remove your GitHub repos and profile from your account.",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            confirmButtonText: "Yes, Disconnect",
        });
        if (!result.isConfirmed) return;
        setDisconnecting(true);
        try {
            await axios.delete(`${API}/student/github/disconnect`, { withCredentials: true });
            setUsername("");
            await handleFetchMe();
            Swal.fire({ icon: "success", title: "Disconnected", timer: 1500, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: "error", title: "Error", text: err?.response?.data?.detail || "Could not disconnect." });
        }
        setDisconnecting(false);
    };

    const handleResync = async () => {
        if (!user?.github_username) return;
        setUsername(user.github_username);
        setLoading(true);
        try {
            const res = await axios.post(`${API}/student/github/connect`, { github_username: user.github_username }, { withCredentials: true });
            await handleFetchMe();
            Swal.fire({ icon: "success", title: "Re-synced!", text: `${res.data.github?.github_repos?.length || 0} repositories updated.`, timer: 2000, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: "error", title: "Sync Failed", text: err?.response?.data?.detail || "Could not sync." });
        }
        setLoading(false);
    };

    return (
        <Wrapper>
            <div className="page-head">
                <div className="page-title-group">
                    <FiGithub className="page-icon" />
                    <div>
                        <h1 className="page-title">GitHub Integration</h1>
                        <p className="page-sub">Connect your GitHub to showcase repos & auto-detect tech skills</p>
                    </div>
                </div>
            </div>

            {/* ── Connect / Status Card ── */}
            <div className="card connect-card">
                {connected ? (
                    <div className="connected-status">
                        <div className="gh-profile">
                            {user?.github_avatar && (
                                <img src={user.github_avatar} alt="GitHub Avatar" className="gh-avatar" />
                            )}
                            <div className="gh-details">
                                <div className="gh-name-row">
                                    <span className="gh-username">@{user.github_username}</span>
                                    <span className="connected-badge">✓ Connected</span>
                                </div>
                                {user?.github_bio && <p className="gh-bio">{user.github_bio}</p>}
                                <div className="gh-stats">
                                    <span>📦 {repos.length} repos</span>
                                    <span>💻 {languages.length} languages</span>
                                    {user?.github_synced_at && (
                                        <span>🔄 Synced {dayjs(user.github_synced_at).fromNow()}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="connected-actions">
                            <a href={user.github_url || `https://github.com/${user.github_username}`}
                                target="_blank" rel="noopener noreferrer" className="view-btn">
                                <FiExternalLink size={13} /> View Profile
                            </a>
                            <button className="resync-btn" onClick={handleResync} disabled={loading}>
                                <FiRefreshCw size={13} className={loading ? "spin" : ""} />
                                {loading ? "Syncing…" : "Re-sync"}
                            </button>
                            <button className="disconnect-btn" onClick={handleDisconnect} disabled={disconnecting}>
                                <FiTrash2 size={13} />
                                {disconnecting ? "Disconnecting…" : "Disconnect"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="connect-form">
                        <div className="connect-illustration">
                            <FiGithub size={64} className="big-gh-icon" />
                            <p className="connect-desc">
                                Connect your GitHub profile to automatically fetch your repositories, detect programming languages, and enhance your skill set.
                            </p>
                        </div>
                        <div className="input-row">
                            <div className="input-prefix">github.com/</div>
                            <input
                                type="text"
                                placeholder="your-username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleConnect()}
                                className="gh-input"
                                disabled={loading}
                            />
                            <button className="connect-btn" onClick={handleConnect} disabled={loading}>
                                {loading ? "Connecting…" : "Connect"}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Languages Detected ── */}
            {connected && languages.length > 0 && (
                <div className="card">
                    <h3 className="card-title">💻 Detected Languages</h3>
                    <p className="card-sub">These have been added to your skills automatically</p>
                    <div className="lang-tags">
                        {languages.map(l => (
                            <span key={l} className="lang-tag">{l}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Repositories ── */}
            {connected && repos.length > 0 && (
                <div className="card">
                    <h3 className="card-title">📦 Repositories ({repos.length})</h3>
                    <p className="card-sub">Your non-forked public repositories</p>
                    <div className="repos-grid">
                        {repos.map(r => (
                            <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer" className="repo-card">
                                <div className="repo-header">
                                    <span className="repo-name">📁 {r.name}</span>
                                    {r.stars > 0 && (
                                        <span className="repo-stars"><FiStar size={11} /> {r.stars}</span>
                                    )}
                                </div>
                                {r.description && <p className="repo-desc">{r.description.slice(0, 80)}{r.description.length > 80 ? "…" : ""}</p>}
                                <div className="repo-footer">
                                    {r.language && <span className="repo-lang">{r.language}</span>}
                                    {r.updated_at && (
                                        <span className="repo-updated">{dayjs(r.updated_at).fromNow()}</span>
                                    )}
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {connected && repos.length === 0 && (
                <div className="card empty-repos">
                    <p>No public repositories found for this account.</p>
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

    .page-head { display: flex; }
    .page-title-group { display: flex; align-items: center; gap: 14px; }
    .page-icon { font-size: 1.8rem; color: #1e293b; }
    .page-title { font-size: 1.3rem; font-weight: 800; color: #0f172a; }
    .page-sub { font-size: 12px; color: #64748b; margin-top: 2px; }

    .card {
        background: #fff;
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        border: 1px solid #f1f5f9;
    }
    .card-title { font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
    .card-sub { font-size: 12px; color: #64748b; margin-bottom: 14px; }

    /* ── Connect form ── */
    .connect-card { }
    .connect-illustration { text-align: center; margin-bottom: 1.5rem; }
    .big-gh-icon { color: #1e293b; margin-bottom: 12px; }
    .connect-desc { font-size: 14px; color: #64748b; max-width: 500px; margin: 0 auto; line-height: 1.6; }

    .input-row {
        display: flex; align-items: center; gap: 0;
        border: 1.5px solid #e2e8f0; border-radius: 12px; overflow: hidden;
        max-width: 500px; margin: 0 auto;
        transition: 0.2s;
    }
    .input-row:focus-within { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
    .input-prefix {
        padding: 11px 14px; background: #f8fafc;
        font-size: 14px; color: #64748b; font-weight: 600;
        border-right: 1px solid #e2e8f0; white-space: nowrap;
    }
    .gh-input {
        flex: 1; padding: 11px 14px; border: none; outline: none;
        font-size: 14px; color: #0f172a;
    }
    .connect-btn {
        padding: 11px 22px; background: linear-gradient(135deg, #1e293b, #334155);
        color: #fff; border: none; font-size: 14px; font-weight: 700;
        cursor: pointer; transition: 0.2s; white-space: nowrap;
    }
    .connect-btn:hover:not(:disabled) { background: linear-gradient(135deg, #0f172a, #1e293b); }
    .connect-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    /* ── Connected status ── */
    .connected-status { display: flex; flex-direction: column; gap: 1.25rem; }
    .gh-profile { display: flex; gap: 1rem; align-items: flex-start; }
    .gh-avatar {
        width: 64px; height: 64px; border-radius: 50%;
        border: 3px solid #e2e8f0; flex-shrink: 0;
    }
    .gh-details { flex: 1; }
    .gh-name-row { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; flex-wrap: wrap; }
    .gh-username { font-size: 1rem; font-weight: 800; color: #0f172a; }
    .connected-badge {
        background: #dcfce7; color: #166534;
        border-radius: 999px; padding: 2px 10px;
        font-size: 11px; font-weight: 700;
    }
    .gh-bio { font-size: 13px; color: #64748b; margin-bottom: 8px; }
    .gh-stats { display: flex; gap: 14px; flex-wrap: wrap; }
    .gh-stats span { font-size: 12px; color: #475569; font-weight: 600; }

    .connected-actions { display: flex; gap: 10px; flex-wrap: wrap; }
    .view-btn {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 8px 16px; background: #1e293b; color: #fff;
        border-radius: 8px; font-size: 13px; font-weight: 600;
        text-decoration: none; transition: 0.2s;
    }
    .view-btn:hover { background: #0f172a; }
    .resync-btn {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 8px 16px; background: #eef2ff; color: #4338ca;
        border: 1px solid #c7d2fe; border-radius: 8px;
        font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s;
    }
    .resync-btn:hover:not(:disabled) { background: #e0e7ff; }
    .resync-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .disconnect-btn {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 8px 16px; background: #fff; color: #ef4444;
        border: 1px solid #fca5a5; border-radius: 8px;
        font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s;
    }
    .disconnect-btn:hover:not(:disabled) { background: #fef2f2; }
    .disconnect-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .spin { animation: spin 1s linear infinite; }

    /* ── Languages ── */
    .lang-tags { display: flex; flex-wrap: wrap; gap: 8px; }
    .lang-tag {
        background: #ecfdf5; color: #065f46;
        border: 1px solid #a7f3d0; border-radius: 999px;
        padding: 5px 14px; font-size: 12px; font-weight: 600;
    }

    /* ── Repos grid ── */
    .repos-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 12px;
        margin-top: 4px;
    }
    .repo-card {
        background: #f8fafc; border: 1px solid #e2e8f0;
        border-radius: 12px; padding: 14px;
        text-decoration: none; transition: 0.2s;
        display: flex; flex-direction: column; gap: 6px;
    }
    .repo-card:hover { border-color: #6366f1; box-shadow: 0 4px 14px rgba(99,102,241,0.12); background: #fff; }
    .repo-header { display: flex; justify-content: space-between; align-items: center; }
    .repo-name { font-size: 13px; font-weight: 700; color: #1e293b; }
    .repo-stars { display: flex; align-items: center; gap: 3px; font-size: 12px; color: #f59e0b; font-weight: 600; }
    .repo-desc { font-size: 12px; color: #64748b; line-height: 1.5; flex: 1; }
    .repo-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; }
    .repo-lang {
        background: #e0e7ff; color: #4338ca;
        border-radius: 999px; padding: 2px 8px; font-size: 11px; font-weight: 600;
    }
    .repo-updated { font-size: 11px; color: #9ca3af; }

    .empty-repos {
        text-align: center; color: #9ca3af; font-size: 13px;
    }
`;

export default GitHubConnect;
