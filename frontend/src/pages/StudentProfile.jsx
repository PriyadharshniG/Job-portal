import React, { useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import {
    FiEdit2, FiGithub, FiAward, FiFolder, FiUpload,
    FiMapPin, FiBriefcase, FiBook, FiStar, FiExternalLink,
    FiUser, FiMail, FiShield
} from "react-icons/fi";
import { useUserContext } from "../context/UserContext";
import axios from "axios";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
dayjs.extend(advancedFormat);

const API = "https://job-portal-jk38.onrender.com/api/v1";

const StudentProfile = () => {
    const { user, handleFetchMe } = useUserContext();
    const [uploading, setUploading] = useState(false);
    const [resumeFile, setResumeFile] = useState(null);
    const [extractedSkills, setExtractedSkills] = useState([]);
    const [showSkillPreview, setShowSkillPreview] = useState(false);

    const joinDate = dayjs(user?.created_at).format("MMM Do, YYYY");

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const ext = file.name.split(".").pop().toLowerCase();
        if (!["pdf", "docx"].includes(ext)) {
            Swal.fire({ icon: "warning", title: "Wrong Format", text: "Only PDF or DOCX files are allowed." });
            return;
        }
        setResumeFile(file);
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await axios.post(`${API}/student/resume/upload`, formData, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (res.data?.extracted_skills?.length > 0) {
                setExtractedSkills(res.data.extracted_skills);
                setShowSkillPreview(true);
            }
            handleFetchMe();
            Swal.fire({
                icon: "success",
                title: "Resume Uploaded! 🎉",
                html: `<b>${res.data.extracted_skills?.length || 0} skills</b> extracted from your resume.`,
                timer: 3000,
                showConfirmButton: false,
            });
        } catch (err) {
            Swal.fire({ icon: "error", title: "Upload Failed", text: err?.response?.data?.detail || "Something went wrong." });
        }
        setUploading(false);
    };

    const handleAddExtractedSkills = async () => {
        try {
            await axios.put(`${API}/student/skills`, { skills: [...(user?.skills || []), ...extractedSkills] }, { withCredentials: true });
            handleFetchMe();
            setShowSkillPreview(false);
            setExtractedSkills([]);
            Swal.fire({ icon: "success", title: "Skills Added!", timer: 1800, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: "error", title: "Failed", text: err?.response?.data?.detail || "Could not save skills." });
        }
    };

    return (
        <Wrapper>
            {/* ── Hero Card ── */}
            <div className="hero-card">
                <div className="hero-bg" />
                <div className="hero-body">
                    <div className="avatar-ring">
                        <div className="avatar-inner">
                            {user?.github_avatar ? (
                                <img src={user.github_avatar} alt="avatar" className="avatar-img" />
                            ) : (
                                <span className="avatar-letter">{(user?.username || "U")[0].toUpperCase()}</span>
                            )}
                        </div>
                    </div>
                    <div className="hero-info">
                        <h1 className="hero-name">{user?.username}</h1>
                        <p className="hero-fid">🪪 {user?.foundation_id}</p>
                        <div className="hero-tags">
                            <span className="role-badge">{user?.role}</span>
                            {user?.location && <span className="loc-badge"><FiMapPin size={11} /> {user.location}</span>}
                            {user?.github_username && (
                                <a href={user.github_url || `https://github.com/${user.github_username}`}
                                    target="_blank" rel="noopener noreferrer" className="github-badge">
                                    <FiGithub size={11} /> {user.github_username}
                                </a>
                            )}
                        </div>
                        {user?.bio && <p className="hero-bio">{user.bio}</p>}
                    </div>
                    <div className="hero-actions">
                        <Link to={`/dashboard/edit-profile/${user?._id}`} className="action-btn primary">
                            <FiEdit2 size={14} /> Edit Profile
                        </Link>
                        <Link to="/dashboard/skills" className="action-btn secondary">
                            <FiStar size={14} /> Manage Skills
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid-two">
                {/* ── Left Column ── */}
                <div className="col-left">
                    {/* Info Card */}
                    <div className="card">
                        <h3 className="card-title"><FiUser /> Personal Info</h3>
                        <div className="info-list">
                            <div className="info-row"><FiMail size={14} /><span>{user?.email}</span></div>
                            <div className="info-row"><FiBook size={14} /><span>{user?.education || "Not set"}</span></div>
                            <div className="info-row"><FiBriefcase size={14} /><span>{user?.experience || "Not set"}</span></div>
                            <div className="info-row"><FiShield size={14} /><span>Joined {joinDate}</span></div>
                        </div>
                    </div>

                    {/* Resume Card */}
                    <div className="card">
                        <h3 className="card-title"><FiUpload /> Resume</h3>
                        {user?.resume ? (
                            <div className="resume-box">
                                <span className="resume-icon">📄</span>
                                <div className="resume-info">
                                    <span className="resume-fname">{user?.resume_filename || "Resume"}</span>
                                    <a href={`https://job-portal-jk38.onrender.com${user.resume}`} target="_blank" rel="noopener noreferrer" className="resume-view">
                                        View <FiExternalLink size={11} />
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <p className="empty-text">No resume uploaded yet.</p>
                        )}
                        <label className={`upload-btn ${uploading ? "loading" : ""}`}>
                            <FiUpload size={13} />
                            {uploading ? "Uploading & Extracting Skills…" : user?.resume ? "Replace Resume" : "Upload Resume (PDF/DOCX)"}
                            <input type="file" accept=".pdf,.docx" style={{ display: "none" }} onChange={handleResumeUpload} disabled={uploading} />
                        </label>
                        <p className="upload-hint">AI will auto-extract your skills from the resume</p>

                        {/* Extracted Skills Preview */}
                        {showSkillPreview && extractedSkills.length > 0 && (
                            <div className="skill-preview">
                                <p className="preview-title">🤖 AI Extracted {extractedSkills.length} skills:</p>
                                <div className="preview-tags">
                                    {extractedSkills.map(s => <span key={s} className="preview-tag">{s}</span>)}
                                </div>
                                <div className="preview-actions">
                                    <button onClick={handleAddExtractedSkills} className="add-skills-btn">Add to Profile</button>
                                    <button onClick={() => setShowSkillPreview(false)} className="dismiss-btn">Dismiss</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right Column ── */}
                <div className="col-right">
                    {/* Skills Card */}
                    <div className="card">
                        <div className="card-head">
                            <h3 className="card-title"><FiStar /> Skills</h3>
                            <Link to="/dashboard/skills" className="card-action">Manage →</Link>
                        </div>
                        {user?.skills?.length > 0 ? (
                            <div className="skill-tags">
                                {user.skills.map(s => <span key={s} className="skill-tag">{s}</span>)}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>No skills added yet.</p>
                                <Link to="/dashboard/skills" className="empty-link">Add Skills →</Link>
                            </div>
                        )}
                    </div>

                    {/* GitHub Card */}
                    <div className="card">
                        <div className="card-head">
                            <h3 className="card-title"><FiGithub /> GitHub</h3>
                            <Link to="/dashboard/github" className="card-action">
                                {user?.github_username ? "Manage →" : "Connect →"}
                            </Link>
                        </div>
                        {user?.github_username ? (
                            <div className="github-summary">
                                <div className="gh-meta">
                                    <span>👤 {user.github_username}</span>
                                    <span>📦 {user?.github_repos?.length || 0} repos</span>
                                </div>
                                {user?.github_languages?.length > 0 && (
                                    <div className="skill-tags" style={{ marginTop: 8 }}>
                                        {user.github_languages.slice(0, 6).map(l => (
                                            <span key={l} className="skill-tag lang">{l}</span>
                                        ))}
                                    </div>
                                )}
                                <div className="gh-repos">
                                    {(user?.github_repos || []).slice(0, 3).map(r => (
                                        <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer" className="gh-repo">
                                            <span className="repo-name">📁 {r.name}</span>
                                            {r.language && <span className="repo-lang">{r.language}</span>}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>GitHub not connected.</p>
                                <Link to="/dashboard/github" className="empty-link">Connect GitHub →</Link>
                            </div>
                        )}
                    </div>

                    {/* Certifications Card */}
                    <div className="card">
                        <div className="card-head">
                            <h3 className="card-title"><FiAward /> Certifications</h3>
                            <Link to="/dashboard/certifications" className="card-action">Manage →</Link>
                        </div>
                        {user?.certifications?.length > 0 ? (
                            <div className="cert-list">
                                {user.certifications.slice(0, 3).map(c => (
                                    <div key={c._id} className="cert-item">
                                        <span className="cert-icon">🏅</span>
                                        <div>
                                            <p className="cert-title">{c.title}</p>
                                            {c.issuer && <p className="cert-issuer">{c.issuer}</p>}
                                        </div>
                                    </div>
                                ))}
                                {user.certifications.length > 3 && (
                                    <Link to="/dashboard/certifications" className="see-more">+{user.certifications.length - 3} more →</Link>
                                )}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>No certifications added.</p>
                                <Link to="/dashboard/certifications" className="empty-link">Add Certifications →</Link>
                            </div>
                        )}
                    </div>

                    {/* Projects Card */}
                    <div className="card">
                        <div className="card-head">
                            <h3 className="card-title"><FiFolder /> Projects</h3>
                            <Link to="/dashboard/projects" className="card-action">Manage →</Link>
                        </div>
                        {user?.projects?.length > 0 ? (
                            <div className="proj-list">
                                {user.projects.slice(0, 3).map(p => (
                                    <a key={p._id} href={p.url} target="_blank" rel="noopener noreferrer" className="proj-item">
                                        <span className="proj-icon">🔗</span>
                                        <div>
                                            <p className="proj-title">{p.title}</p>
                                            {p.description && <p className="proj-desc">{p.description.slice(0, 60)}{p.description.length > 60 ? "…" : ""}</p>}
                                        </div>
                                        <FiExternalLink size={13} className="proj-ext" />
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>No projects added.</p>
                                <Link to="/dashboard/projects" className="empty-link">Add Projects →</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Wrapper>
    );
};

const Wrapper = styled.div`
    width: 100%;
    padding: 1.5rem 0;
    font-family: 'Inter', sans-serif;

    /* ── Hero ── */
    .hero-card {
        position: relative;
        border-radius: 20px;
        overflow: hidden;
        margin-bottom: 1.5rem;
        box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .hero-bg {
        position: absolute; inset: 0;
        background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);
        height: 110px;
    }
    .hero-body {
        position: relative;
        padding: 70px 2rem 1.5rem;
        background: #fff;
        display: flex;
        align-items: flex-start;
        gap: 1.5rem;
        flex-wrap: wrap;
    }
    .avatar-ring {
        width: 80px; height: 80px;
        border-radius: 50%;
        background: linear-gradient(135deg, #f59e0b, #d97706);
        padding: 3px;
        flex-shrink: 0;
        margin-top: -45px;
        box-shadow: 0 4px 16px rgba(245,158,11,0.4);
    }
    .avatar-inner {
        width: 100%; height: 100%;
        border-radius: 50%;
        background: #fff;
        display: flex; align-items: center; justify-content: center;
        overflow: hidden;
    }
    .avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
    .avatar-letter { font-size: 2rem; font-weight: 800; color: #4338ca; }

    .hero-info { flex: 1; min-width: 200px; }
    .hero-name { font-size: 1.3rem; font-weight: 800; color: #0f172a; margin-bottom: 2px; }
    .hero-fid { font-size: 12px; color: #6b7280; font-weight: 600; margin-bottom: 8px; }
    .hero-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
    .role-badge {
        background: #eef2ff; color: #4338ca;
        border-radius: 999px; padding: 2px 10px;
        font-size: 11px; font-weight: 700; text-transform: capitalize;
    }
    .loc-badge {
        display: flex; align-items: center; gap: 4px;
        background: #f0fdf4; color: #166534;
        border-radius: 999px; padding: 2px 10px;
        font-size: 11px; font-weight: 600;
    }
    .github-badge {
        display: flex; align-items: center; gap: 4px;
        background: #f1f5f9; color: #334155;
        border-radius: 999px; padding: 2px 10px;
        font-size: 11px; font-weight: 600;
        text-decoration: none; transition: 0.2s;
    }
    .github-badge:hover { background: #1e293b; color: #fff; }
    .hero-bio { font-size: 13px; color: #64748b; line-height: 1.5; }

    .hero-actions { display: flex; gap: 10px; flex-wrap: wrap; align-self: center; }
    .action-btn {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 8px 18px; border-radius: 10px;
        font-size: 13px; font-weight: 600;
        text-decoration: none; transition: 0.2s;
    }
    .action-btn.primary {
        background: linear-gradient(135deg, #4338ca, #6366f1);
        color: #fff; box-shadow: 0 3px 12px rgba(67,56,202,0.3);
    }
    .action-btn.primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(67,56,202,0.4); }
    .action-btn.secondary {
        background: #f8fafc; color: #334155;
        border: 1px solid #e2e8f0;
    }
    .action-btn.secondary:hover { background: #f1f5f9; border-color: #cbd5e1; }

    /* ── Two-col grid ── */
    .grid-two {
        display: grid;
        grid-template-columns: 300px 1fr;
        gap: 1.25rem;
        align-items: start;
    }
    @media (max-width: 768px) {
        .grid-two { grid-template-columns: 1fr; }
    }

    .col-left, .col-right { display: flex; flex-direction: column; gap: 1.25rem; }

    /* ── Card ── */
    .card {
        background: #fff;
        border-radius: 16px;
        padding: 1.25rem;
        box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        border: 1px solid #f1f5f9;
    }
    .card-head {
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 1rem;
    }
    .card-title {
        display: flex; align-items: center; gap: 8px;
        font-size: 14px; font-weight: 700; color: #1e293b;
    }
    .card-action {
        font-size: 12px; font-weight: 700; color: #4338ca;
        text-decoration: none; transition: 0.15s;
    }
    .card-action:hover { color: #6366f1; }

    /* ── Info list ── */
    .info-list { display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }
    .info-row {
        display: flex; align-items: center; gap: 10px;
        font-size: 13px; color: #475569; font-weight: 500;
    }
    .info-row svg { color: #94a3b8; flex-shrink: 0; }

    /* ── Resume ── */
    .resume-box {
        display: flex; align-items: center; gap: 10px;
        padding: 10px; background: #f8fafc;
        border-radius: 10px; border: 1px solid #e2e8f0;
        margin-bottom: 10px;
    }
    .resume-icon { font-size: 1.8rem; }
    .resume-info { display: flex; flex-direction: column; gap: 2px; }
    .resume-fname { font-size: 13px; font-weight: 600; color: #334155; }
    .resume-view {
        display: inline-flex; align-items: center; gap: 4px;
        font-size: 11px; font-weight: 700; color: #4338ca; text-decoration: none;
    }
    .resume-view:hover { color: #6366f1; }
    .upload-btn {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 9px 18px;
        background: linear-gradient(135deg, #4338ca, #6366f1);
        color: #fff; border-radius: 10px;
        font-size: 13px; font-weight: 600;
        cursor: pointer; transition: 0.2s;
        border: none; width: 100%; justify-content: center;
        margin-top: 4px;
    }
    .upload-btn:hover:not(.loading) { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(67,56,202,0.35); }
    .upload-btn.loading { opacity: 0.7; cursor: not-allowed; }
    .upload-hint { font-size: 11px; color: #94a3b8; text-align: center; margin-top: 6px; }
    .empty-text { font-size: 13px; color: #9ca3af; margin-bottom: 10px; }

    /* Skill preview */
    .skill-preview {
        margin-top: 12px; padding: 12px;
        background: #eff6ff; border-radius: 12px;
        border: 1px solid #bfdbfe;
    }
    .preview-title { font-size: 12px; font-weight: 700; color: #1d4ed8; margin-bottom: 8px; }
    .preview-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
    .preview-tag {
        background: #dbeafe; color: #1e40af;
        border-radius: 999px; padding: 3px 10px;
        font-size: 11px; font-weight: 600;
    }
    .preview-actions { display: flex; gap: 8px; }
    .add-skills-btn {
        padding: 6px 14px; background: #2563eb; color: #fff;
        border: none; border-radius: 8px; font-size: 12px;
        font-weight: 700; cursor: pointer; transition: 0.2s;
    }
    .add-skills-btn:hover { background: #1d4ed8; }
    .dismiss-btn {
        padding: 6px 14px; background: transparent; color: #6b7280;
        border: 1px solid #e5e7eb; border-radius: 8px;
        font-size: 12px; font-weight: 600; cursor: pointer;
    }

    /* ── Skills ── */
    .skill-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
    .skill-tag {
        background: #eef2ff; color: #4338ca;
        border-radius: 999px; padding: 4px 12px;
        font-size: 12px; font-weight: 600;
        border: 1px solid #c7d2fe;
    }
    .skill-tag.lang {
        background: #ecfdf5; color: #065f46;
        border-color: #a7f3d0;
    }

    /* ── GitHub ── */
    .github-summary { margin-top: 4px; }
    .gh-meta { display: flex; gap: 16px; font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 8px; }
    .gh-repos { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
    .gh-repo {
        display: flex; align-items: center; justify-content: space-between;
        padding: 8px 10px; background: #f8fafc;
        border-radius: 8px; border: 1px solid #e2e8f0;
        text-decoration: none; transition: 0.15s;
    }
    .gh-repo:hover { background: #f1f5f9; border-color: #cbd5e1; }
    .repo-name { font-size: 12px; font-weight: 600; color: #334155; }
    .repo-lang { font-size: 11px; background: #e0e7ff; color: #4338ca; border-radius: 999px; padding: 2px 8px; }

    /* ── Certifications ── */
    .cert-list { display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }
    .cert-item { display: flex; align-items: flex-start; gap: 10px; }
    .cert-icon { font-size: 1.2rem; flex-shrink: 0; }
    .cert-title { font-size: 13px; font-weight: 700; color: #1e293b; }
    .cert-issuer { font-size: 11px; color: #64748b; }
    .see-more { font-size: 12px; color: #4338ca; font-weight: 700; text-decoration: none; }
    .see-more:hover { color: #6366f1; }

    /* ── Projects ── */
    .proj-list { display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }
    .proj-item {
        display: flex; align-items: flex-start; gap: 10px;
        padding: 10px; background: #f8fafc;
        border: 1px solid #e2e8f0; border-radius: 10px;
        text-decoration: none; transition: 0.15s;
    }
    .proj-item:hover { background: #f1f5f9; border-color: #4338ca; }
    .proj-icon { font-size: 1.2rem; flex-shrink: 0; }
    .proj-title { font-size: 13px; font-weight: 700; color: #1e293b; }
    .proj-desc { font-size: 11px; color: #64748b; }
    .proj-ext { color: #94a3b8; margin-left: auto; flex-shrink: 0; }

    /* ── Empty state ── */
    .empty-state { text-align: center; padding: 12px 0; }
    .empty-state p { font-size: 13px; color: #9ca3af; margin-bottom: 6px; }
    .empty-link {
        font-size: 12px; font-weight: 700; color: #4338ca; text-decoration: none;
    }
    .empty-link:hover { color: #6366f1; }
`;

export default StudentProfile;
