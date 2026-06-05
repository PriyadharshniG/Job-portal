import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";
import Swal from "sweetalert2";
import { FiSearch, FiDownload, FiUser, FiGithub, FiMail, FiMapPin, FiX, FiExternalLink } from "react-icons/fi";

const API = "https://job-portal-jk38.onrender.com/api/v1";

/* ── Candidate Profile Modal ── */
const CandidateModal = ({ candidate, onClose }) => {
    if (!candidate) return null;
    return (
        <ModalOverlay onClick={onClose}>
            <ModalBox onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}><FiX size={18} /></button>
                <div className="modal-header">
                    <div className="modal-avatar">
                        {candidate.github_avatar
                            ? <img src={candidate.github_avatar} alt="avatar" />
                            : <span>{(candidate.username || "U")[0].toUpperCase()}</span>
                        }
                    </div>
                    <div className="modal-info">
                        <h2>{candidate.username}</h2>
                        <span className="fid-tag">🪪 {candidate.foundation_id}</span>
                        <div className="meta-row">
                            {candidate.email && <span><FiMail size={12} /> {candidate.email}</span>}
                            {candidate.location && <span><FiMapPin size={12} /> {candidate.location}</span>}
                        </div>
                    </div>
                </div>

                {candidate.bio && <p className="modal-bio">{candidate.bio}</p>}

                <div className="modal-grid">
                    {candidate.education && (
                        <div className="modal-field">
                            <span className="field-label">🎓 Education</span>
                            <span className="field-val">{candidate.education}</span>
                        </div>
                    )}
                    {candidate.experience && (
                        <div className="modal-field">
                            <span className="field-label">💼 Experience</span>
                            <span className="field-val">{candidate.experience}</span>
                        </div>
                    )}
                </div>

                {candidate.skills?.length > 0 && (
                    <div className="modal-section">
                        <h4>⚡ Skills</h4>
                        <div className="skill-tags">
                            {candidate.skills.map(s => <span key={s} className="skill-tag">{s}</span>)}
                        </div>
                    </div>
                )}

                {candidate.github_username && (
                    <div className="modal-section">
                        <h4><FiGithub size={13} /> GitHub</h4>
                        <a href={candidate.github_url || `https://github.com/${candidate.github_username}`}
                            target="_blank" rel="noopener noreferrer" className="gh-link">
                            @{candidate.github_username}
                            <FiExternalLink size={11} />
                        </a>
                        {candidate.github_languages?.length > 0 && (
                            <div className="skill-tags" style={{ marginTop: 8 }}>
                                {candidate.github_languages.map(l => <span key={l} className="skill-tag lang">{l}</span>)}
                            </div>
                        )}
                    </div>
                )}

                {candidate.certifications?.length > 0 && (
                    <div className="modal-section">
                        <h4>🏅 Certifications</h4>
                        {candidate.certifications.map(c => (
                            <div key={c._id} className="cert-row">
                                <span>{c.title}</span>
                                {c.issuer && <span className="cert-issuer">{c.issuer}</span>}
                            </div>
                        ))}
                    </div>
                )}

                {candidate.projects?.length > 0 && (
                    <div className="modal-section">
                        <h4>🔗 Projects</h4>
                        {candidate.projects.map(p => (
                            <a key={p._id} href={p.url} target="_blank" rel="noopener noreferrer" className="proj-row">
                                <span>{p.title}</span>
                                <FiExternalLink size={11} />
                            </a>
                        ))}
                    </div>
                )}

                {candidate.resume && (
                    <div className="modal-actions">
                        <a href={`https://job-portal-jk38.onrender.com${candidate.resume}`} target="_blank"
                            rel="noopener noreferrer" className="view-resume-btn">
                            📄 View Resume
                        </a>
                        <a href={`https://job-portal-jk38.onrender.com${candidate.resume}`} download
                            className="dl-resume-btn">
                            <FiDownload size={13} /> Download Resume
                        </a>
                    </div>
                )}
            </ModalBox>
        </ModalOverlay>
    );
};

/* ── Main Component ── */
const CandidateSearch = () => {
    const [skill, setSkill]   = useState("");
    const [name, setName]     = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [selected, setSelected] = useState(null);

    const handleSearch = async (e) => {
        e?.preventDefault();
        if (!skill && !name) {
            Swal.fire({ icon: "info", title: "Enter a search term", text: "Please enter a skill or name to search." });
            return;
        }
        setLoading(true);
        setSearched(true);
        try {
            const params = new URLSearchParams();
            if (skill) params.append("skill", skill);
            if (name)  params.append("name", name);
            const res = await axios.get(`${API}/recruiter/candidates/search?${params}`, { withCredentials: true });
            setResults(res.data?.result || []);
        } catch (err) {
            Swal.fire({ icon: "error", title: "Search failed", text: err?.response?.data?.detail || "Could not search." });
        }
        setLoading(false);
    };

    const handleExport = async () => {
        try {
            const res = await axios.get(`${API}/recruiter/applications/export`, {
                withCredentials: true, responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement("a");
            a.href = url; a.download = "candidate_applications.csv";
            document.body.appendChild(a); a.click();
            a.remove(); window.URL.revokeObjectURL(url);
        } catch (err) {
            Swal.fire({ icon: "error", title: "Export failed", text: "Could not export applications." });
        }
    };

    return (
        <Wrapper>
            <div className="page-head">
                <div className="page-title-group">
                    <FiSearch className="page-icon" />
                    <div>
                        <h1 className="page-title">Search Candidates</h1>
                        <p className="page-sub">Find job seekers by skill set or name</p>
                    </div>
                </div>
                <button className="export-btn" onClick={handleExport}>
                    <FiDownload size={14} /> Export to Excel
                </button>
            </div>

            {/* ── Search Bar ── */}
            <div className="card">
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-field">
                        <label>Search by Skill</label>
                        <input
                            type="text"
                            placeholder="e.g. Python, React, Machine Learning"
                            value={skill}
                            onChange={e => setSkill(e.target.value)}
                        />
                    </div>
                    <div className="search-field">
                        <label>Search by Name</label>
                        <input
                            type="text"
                            placeholder="e.g. John Doe"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="search-btn" disabled={loading}>
                        <FiSearch size={15} />
                        {loading ? "Searching…" : "Search"}
                    </button>
                </form>
            </div>

            {/* ── Results ── */}
            {searched && (
                <div className="results-section">
                    <div className="results-header">
                        <h3>{loading ? "Searching…" : `${results.length} candidate${results.length !== 1 ? "s" : ""} found`}</h3>
                    </div>

                    {!loading && results.length === 0 && (
                        <div className="empty">
                            <FiUser size={40} />
                            <p>No candidates found matching your search.</p>
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="candidates-grid">
                            {results.map(c => (
                                <div key={c._id} className="candidate-card">
                                    <div className="card-top">
                                        <div className="c-avatar">
                                            {c.github_avatar
                                                ? <img src={c.github_avatar} alt="avatar" />
                                                : <span>{(c.username || "U")[0].toUpperCase()}</span>
                                            }
                                        </div>
                                        <div className="c-info">
                                            <h4 className="c-name">{c.username}</h4>
                                            <span className="c-fid">🪪 {c.foundation_id}</span>
                                            {c.location && <span className="c-loc"><FiMapPin size={10} /> {c.location}</span>}
                                        </div>
                                    </div>

                                    {c.skills?.length > 0 && (
                                        <div className="c-skills">
                                            {c.skills.slice(0, 5).map(s => (
                                                <span key={s} className={`c-skill-tag ${skill && s.toLowerCase().includes(skill.toLowerCase()) ? "matched" : ""}`}>
                                                    {s}
                                                </span>
                                            ))}
                                            {c.skills.length > 5 && <span className="more-tag">+{c.skills.length - 5}</span>}
                                        </div>
                                    )}

                                    <div className="c-actions">
                                        <button className="view-btn" onClick={() => setSelected(c)}>
                                            <FiUser size={13} /> View Profile
                                        </button>
                                        {c.resume && (
                                            <a href={`https://job-portal-jk38.onrender.com${c.resume}`} download
                                                className="dl-btn" title="Download Resume">
                                                <FiDownload size={13} /> Resume
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Profile Modal ── */}
            {selected && <CandidateModal candidate={selected} onClose={() => setSelected(null)} />}
        </Wrapper>
    );
};

const Wrapper = styled.div`
    width: 100%; padding: 1.5rem 0;
    display: flex; flex-direction: column; gap: 1.25rem;
    font-family: 'Inter', sans-serif;

    .page-head { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
    .page-title-group { display:flex; align-items:center; gap:14px; }
    .page-icon { font-size:1.8rem; color:#6366f1; }
    .page-title { font-size:1.3rem; font-weight:800; color:#0f172a; }
    .page-sub { font-size:12px; color:#64748b; margin-top:2px; }

    .export-btn {
        display:inline-flex; align-items:center; gap:7px;
        padding:10px 18px; background:linear-gradient(135deg,#10b981,#059669);
        color:#fff; border:none; border-radius:10px;
        font-size:13px; font-weight:700; cursor:pointer; transition:0.2s;
    }
    .export-btn:hover { transform:translateY(-1px); box-shadow:0 4px 16px rgba(16,185,129,0.35); }

    .card { background:#fff; border-radius:16px; padding:1.5rem; box-shadow:0 2px 12px rgba(0,0,0,0.06); border:1px solid #f1f5f9; }

    .search-form { display:flex; gap:12px; align-items:flex-end; flex-wrap:wrap; }
    .search-field { display:flex; flex-direction:column; gap:5px; flex:1; min-width:180px; }
    .search-field label { font-size:12px; font-weight:700; color:#374151; }
    .search-field input {
        padding:10px 14px; border:1.5px solid #e2e8f0; border-radius:10px;
        font-size:13px; color:#0f172a; outline:none; transition:0.2s;
    }
    .search-field input:focus { border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,0.1); }
    .search-btn {
        display:inline-flex; align-items:center; gap:7px;
        padding:10px 22px; background:linear-gradient(135deg,#4338ca,#6366f1);
        color:#fff; border:none; border-radius:10px;
        font-size:13px; font-weight:700; cursor:pointer; transition:0.2s;
        white-space:nowrap;
    }
    .search-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 4px 16px rgba(67,56,202,0.35); }
    .search-btn:disabled { opacity:0.6; cursor:not-allowed; }

    .results-section { display:flex; flex-direction:column; gap:1rem; }
    .results-header h3 { font-size:14px; font-weight:700; color:#1e293b; }

    .empty { display:flex; flex-direction:column; align-items:center; gap:12px; padding:3rem; color:#9ca3af; text-align:center; }
    .empty p { font-size:13px; }

    .candidates-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:14px; }
    .candidate-card {
        background:#fff; border:1px solid #f1f5f9; border-radius:16px;
        padding:1.25rem; display:flex; flex-direction:column; gap:12px;
        box-shadow:0 2px 10px rgba(0,0,0,0.05); transition:0.2s;
    }
    .candidate-card:hover { box-shadow:0 6px 20px rgba(99,102,241,0.12); border-color:#c7d2fe; transform:translateY(-2px); }

    .card-top { display:flex; align-items:center; gap:12px; }
    .c-avatar {
        width:48px; height:48px; border-radius:50%;
        background:linear-gradient(135deg,#6366f1,#4338ca);
        display:flex; align-items:center; justify-content:center;
        font-size:1.3rem; font-weight:800; color:#fff; flex-shrink:0; overflow:hidden;
    }
    .c-avatar img { width:100%; height:100%; object-fit:cover; }
    .c-info { flex:1; min-width:0; }
    .c-name { font-size:14px; font-weight:700; color:#1e293b; }
    .c-fid { font-size:11px; background:#fef3c7; color:#92400e; border-radius:999px; padding:1px 8px; display:inline-block; font-weight:700; margin-top:2px; }
    .c-loc { font-size:11px; color:#64748b; display:flex; align-items:center; gap:3px; margin-top:3px; }

    .c-skills { display:flex; flex-wrap:wrap; gap:5px; }
    .c-skill-tag { background:#eef2ff; color:#4338ca; border-radius:999px; padding:3px 10px; font-size:11px; font-weight:600; border:1px solid #c7d2fe; }
    .c-skill-tag.matched { background:#fef3c7; color:#92400e; border-color:#fcd34d; }
    .more-tag { background:#f3f4f6; color:#6b7280; border-radius:999px; padding:3px 8px; font-size:11px; }

    .c-actions { display:flex; gap:8px; flex-wrap:wrap; }
    .view-btn {
        display:inline-flex; align-items:center; gap:5px;
        padding:7px 14px; background:#eef2ff; color:#4338ca;
        border:1px solid #c7d2fe; border-radius:8px;
        font-size:12px; font-weight:700; cursor:pointer; transition:0.2s;
    }
    .view-btn:hover { background:#4338ca; color:#fff; border-color:#4338ca; }
    .dl-btn {
        display:inline-flex; align-items:center; gap:5px;
        padding:7px 14px; background:#ecfdf5; color:#065f46;
        border:1px solid #a7f3d0; border-radius:8px;
        font-size:12px; font-weight:700; text-decoration:none; transition:0.2s;
    }
    .dl-btn:hover { background:#10b981; color:#fff; border-color:#10b981; }
`;

const ModalOverlay = styled.div`
    position:fixed; inset:0; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px);
    z-index:1000; display:flex; align-items:center; justify-content:center; padding:20px;
`;

const ModalBox = styled.div`
    background:#fff; border-radius:20px; padding:2rem;
    width:100%; max-width:600px; max-height:90vh; overflow-y:auto;
    position:relative; box-shadow:0 20px 60px rgba(0,0,0,0.3);
    animation: modalIn 0.2s ease;
    @keyframes modalIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }

    .close-btn {
        position:absolute; top:1rem; right:1rem;
        background:#f1f5f9; border:none; border-radius:50%;
        width:32px; height:32px; display:flex; align-items:center; justify-content:center;
        cursor:pointer; color:#64748b; transition:0.15s;
    }
    .close-btn:hover { background:#ef4444; color:#fff; }

    .modal-header { display:flex; gap:1rem; align-items:flex-start; margin-bottom:1rem; }
    .modal-avatar {
        width:64px; height:64px; border-radius:50%; flex-shrink:0;
        background:linear-gradient(135deg,#6366f1,#4338ca);
        display:flex; align-items:center; justify-content:center;
        font-size:1.8rem; font-weight:800; color:#fff; overflow:hidden;
    }
    .modal-avatar img { width:100%; height:100%; object-fit:cover; }
    .modal-info h2 { font-size:1.1rem; font-weight:800; color:#0f172a; }
    .fid-tag { display:inline-block; font-size:11px; background:#fef3c7; color:#92400e; border-radius:999px; padding:2px 10px; font-weight:700; margin:4px 0; }
    .meta-row { display:flex; gap:12px; flex-wrap:wrap; margin-top:4px; }
    .meta-row span { font-size:12px; color:#64748b; display:flex; align-items:center; gap:4px; }

    .modal-bio { font-size:13px; color:#64748b; line-height:1.6; margin-bottom:1rem; }

    .modal-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:1rem; }
    .modal-field { background:#f8fafc; border-radius:10px; padding:10px; }
    .field-label { display:block; font-size:11px; font-weight:700; color:#94a3b8; margin-bottom:4px; }
    .field-val { font-size:13px; font-weight:600; color:#1e293b; }

    .modal-section { margin-top:1rem; border-top:1px solid #f1f5f9; padding-top:1rem; }
    .modal-section h4 { font-size:13px; font-weight:700; color:#1e293b; margin-bottom:8px; display:flex; align-items:center; gap:6px; }
    .skill-tags { display:flex; flex-wrap:wrap; gap:6px; }
    .skill-tag { background:#eef2ff; color:#4338ca; border-radius:999px; padding:3px 10px; font-size:11px; font-weight:600; border:1px solid #c7d2fe; }
    .skill-tag.lang { background:#ecfdf5; color:#065f46; border-color:#a7f3d0; }

    .gh-link {
        display:inline-flex; align-items:center; gap:6px;
        color:#4338ca; font-weight:700; font-size:13px; text-decoration:none;
    }
    .gh-link:hover { color:#6366f1; }

    .cert-row { display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #f1f5f9; font-size:13px; color:#334155; font-weight:600; }
    .cert-issuer { font-size:11px; color:#64748b; }

    .proj-row {
        display:flex; justify-content:space-between; align-items:center;
        padding:7px 10px; margin-top:5px; background:#f8fafc;
        border-radius:8px; text-decoration:none; color:#334155;
        font-size:13px; font-weight:600; transition:0.15s;
    }
    .proj-row:hover { background:#6366f1; color:#fff; }

    .modal-actions { display:flex; gap:10px; margin-top:1.5rem; padding-top:1rem; border-top:1px solid #f1f5f9; flex-wrap:wrap; }
    .view-resume-btn {
        padding:10px 20px; background:#eef2ff; color:#4338ca;
        border-radius:10px; font-size:13px; font-weight:700;
        text-decoration:none; transition:0.2s;
    }
    .view-resume-btn:hover { background:#4338ca; color:#fff; }
    .dl-resume-btn {
        display:inline-flex; align-items:center; gap:6px;
        padding:10px 20px; background:linear-gradient(135deg,#10b981,#059669);
        color:#fff; border-radius:10px; font-size:13px; font-weight:700;
        text-decoration:none; transition:0.2s;
    }
    .dl-resume-btn:hover { transform:translateY(-1px); box-shadow:0 4px 14px rgba(16,185,129,0.35); }
`;

export default CandidateSearch;
