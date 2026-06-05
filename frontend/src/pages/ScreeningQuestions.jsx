import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";
import Swal from "sweetalert2";
import { FiZap, FiCopy, FiChevronDown, FiPlus, FiX } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";

const API = "https://job-portal-jk38.onrender.com/api/v1";

const DIFFICULTY_COLORS = {
    easy:   { bg: "#dcfce7", color: "#166534" },
    medium: { bg: "#dbeafe", color: "#1e3a8a" },
    hard:   { bg: "#fee2e2", color: "#991b1b" },
};
const TYPE_COLORS = {
    technical:  { bg: "#eef2ff", color: "#4338ca" },
    behavioral: { bg: "#fef3c7", color: "#92400e" },
};

const ScreeningQuestions = () => {
    const [selectedJobId, setSelectedJobId] = useState("");
    const [position, setPosition] = useState("");
    const [skills, setSkills] = useState([]);
    const [skillInput, setSkillInput] = useState("");
    const [difficulty, setDifficulty] = useState("medium");
    const [count, setCount] = useState(10);
    const [questions, setQuestions] = useState([]);
    const [generating, setGenerating] = useState(false);
    const [generated, setGenerated] = useState(false);

    // Fetch recruiter's jobs for the dropdown
    const { data: jobsData } = useQuery({
        queryKey: ["rec-jobs"],
        queryFn: async () => {
            const r = await axios.get(`${API}/jobs/recruiter`, { withCredentials: true });
            return r.data?.result || [];
        },
    });

    const jobs = jobsData || [];

    const handleJobSelect = (jobId) => {
        setSelectedJobId(jobId);
        if (!jobId) { setPosition(""); setSkills([]); return; }
        const job = jobs.find(j => j._id === jobId);
        if (job) {
            setPosition(job.position || "");
            setSkills(job.job_skills || []);
        }
    };

    const addSkill = () => {
        const s = skillInput.trim();
        if (!s) return;
        if (!skills.includes(s)) setSkills(prev => [...prev, s]);
        setSkillInput("");
    };
    const removeSkill = (s) => setSkills(prev => prev.filter(x => x !== s));

    const handleGenerate = async () => {
        if (!position.trim()) {
            Swal.fire({ icon: "warning", title: "Position required", text: "Enter the job position." });
            return;
        }
        setGenerating(true);
        try {
            const res = await axios.post(`${API}/recruiter/screening-questions`, {
                job_id: selectedJobId || null,
                position, skills, difficulty, count,
            }, { withCredentials: true });
            setQuestions(res.data?.questions || []);
            setGenerated(true);
        } catch (err) {
            Swal.fire({ icon: "error", title: "Failed", text: err?.response?.data?.detail || "Could not generate questions." });
        }
        setGenerating(false);
    };

    const copyAll = () => {
        const text = questions.map((q, i) => `${i + 1}. [${q.type.toUpperCase()}] ${q.question}`).join("\n");
        navigator.clipboard.writeText(text);
        Swal.fire({ icon: "success", title: "Copied!", timer: 1200, showConfirmButton: false });
    };

    const copyOne = (q) => {
        navigator.clipboard.writeText(q.question);
        Swal.fire({ icon: "success", title: "Copied!", timer: 900, showConfirmButton: false });
    };

    return (
        <Wrapper>
            <div className="page-head">
                <div className="page-title-group">
                    <FiZap className="page-icon" />
                    <div>
                        <h1 className="page-title">AI Screening Questions</h1>
                        <p className="page-sub">Generate relevant interview questions based on job skills and role</p>
                    </div>
                </div>
            </div>

            {/* ── Config Card ── */}
            <div className="card">
                <h3 className="card-title">Configure Generator</h3>
                <div className="form-grid">
                    {/* Job selector */}
                    <div className="field full-span">
                        <label>Select Job (optional — auto-fills skills)</label>
                        <div className="select-wrap">
                            <select value={selectedJobId} onChange={e => handleJobSelect(e.target.value)}>
                                <option value="">— Enter manually below —</option>
                                {jobs.map(j => (
                                    <option key={j._id} value={j._id}>{j.position} @ {j.company}</option>
                                ))}
                            </select>
                            <FiChevronDown className="select-icon" />
                        </div>
                    </div>

                    {/* Position */}
                    <div className="field">
                        <label>Job Position *</label>
                        <input type="text" placeholder="e.g. Backend Developer, Data Analyst"
                            value={position} onChange={e => setPosition(e.target.value)} />
                    </div>

                    {/* Difficulty */}
                    <div className="field">
                        <label>Difficulty Level</label>
                        <div className="select-wrap">
                            <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                                <option value="easy">Easy — Fresher / Intern</option>
                                <option value="medium">Medium — 1-3 Years Experience</option>
                                <option value="hard">Hard — Senior / Lead</option>
                            </select>
                            <FiChevronDown className="select-icon" />
                        </div>
                    </div>

                    {/* Count */}
                    <div className="field">
                        <label>Number of Questions ({count})</label>
                        <input type="range" min={5} max={25} step={1}
                            value={count} onChange={e => setCount(Number(e.target.value))}
                            className="range-input" />
                        <div className="range-labels"><span>5</span><span>25</span></div>
                    </div>

                    {/* Skills */}
                    <div className="field full-span">
                        <label>Required Skills (add manually or from job)</label>
                        <div className="skill-input-row">
                            <input type="text" placeholder="Type a skill and press Enter"
                                value={skillInput}
                                onChange={e => setSkillInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())}
                            />
                            <button type="button" className="add-skill-btn" onClick={addSkill}>
                                <FiPlus size={14} />
                            </button>
                        </div>
                        {skills.length > 0 && (
                            <div className="skill-chips">
                                {skills.map(s => (
                                    <span key={s} className="skill-chip">
                                        {s}
                                        <button onClick={() => removeSkill(s)}><FiX size={10} /></button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <button className="generate-btn" onClick={handleGenerate} disabled={generating}>
                    <FiZap size={15} />
                    {generating ? "Generating…" : `Generate ${count} Questions`}
                </button>
            </div>

            {/* ── Generated Questions ── */}
            {generated && questions.length > 0 && (
                <div className="card">
                    <div className="questions-head">
                        <h3 className="card-title">
                            🎯 {questions.length} Questions for <span className="pos-highlight">{position}</span>
                        </h3>
                        <button className="copy-all-btn" onClick={copyAll}>
                            <FiCopy size={13} /> Copy All
                        </button>
                    </div>

                    <div className="questions-list">
                        {questions.map((q, i) => {
                            const diff = DIFFICULTY_COLORS[q.difficulty] || DIFFICULTY_COLORS.medium;
                            const typ  = TYPE_COLORS[q.type] || TYPE_COLORS.technical;
                            return (
                                <div key={i} className="question-card">
                                    <div className="q-number">{i + 1}</div>
                                    <div className="q-body">
                                        <p className="q-text">{q.question}</p>
                                        <div className="q-tags">
                                            <span className="q-badge" style={{ background: typ.bg, color: typ.color }}>
                                                {q.type}
                                            </span>
                                            <span className="q-badge" style={{ background: diff.bg, color: diff.color }}>
                                                {q.difficulty}
                                            </span>
                                            {q.skill && q.skill !== "General" && (
                                                <span className="q-skill">{q.skill}</span>
                                            )}
                                        </div>
                                    </div>
                                    <button className="copy-q-btn" onClick={() => copyOne(q)} title="Copy question">
                                        <FiCopy size={13} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </Wrapper>
    );
};

const Wrapper = styled.div`
    width:100%; padding:1.5rem 0;
    display:flex; flex-direction:column; gap:1.25rem;
    font-family:'Inter',sans-serif;

    .page-head { display:flex; align-items:center; }
    .page-title-group { display:flex; align-items:center; gap:14px; }
    .page-icon { font-size:1.8rem; color:#f59e0b; }
    .page-title { font-size:1.3rem; font-weight:800; color:#0f172a; }
    .page-sub { font-size:12px; color:#64748b; margin-top:2px; }

    .card { background:#fff; border-radius:16px; padding:1.5rem; box-shadow:0 2px 12px rgba(0,0,0,0.06); border:1px solid #f1f5f9; }
    .card-title { font-size:15px; font-weight:700; color:#1e293b; margin-bottom:1.25rem; }

    .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:1.25rem; }
    @media(max-width:600px){ .form-grid { grid-template-columns:1fr; } }
    .full-span { grid-column:1/-1; }
    .field { display:flex; flex-direction:column; gap:6px; }
    .field label { font-size:12px; font-weight:700; color:#374151; }
    .field input[type=text] {
        padding:10px 13px; border:1.5px solid #e2e8f0; border-radius:9px;
        font-size:13px; color:#0f172a; outline:none; transition:0.2s;
    }
    .field input[type=text]:focus { border-color:#f59e0b; box-shadow:0 0 0 3px rgba(245,158,11,0.1); }

    .select-wrap { position:relative; }
    .select-wrap select {
        width:100%; padding:10px 36px 10px 13px;
        border:1.5px solid #e2e8f0; border-radius:9px;
        font-size:13px; color:#0f172a; outline:none;
        appearance:none; background:#fff; cursor:pointer; transition:0.2s;
    }
    .select-wrap select:focus { border-color:#f59e0b; }
    .select-icon { position:absolute; right:12px; top:50%; transform:translateY(-50%); color:#9ca3af; pointer-events:none; }

    .range-input { width:100%; accent-color:#f59e0b; cursor:pointer; }
    .range-labels { display:flex; justify-content:space-between; font-size:11px; color:#9ca3af; }

    .skill-input-row { display:flex; gap:8px; }
    .skill-input-row input { flex:1; padding:10px 13px; border:1.5px solid #e2e8f0; border-radius:9px; font-size:13px; outline:none; transition:0.2s; }
    .skill-input-row input:focus { border-color:#f59e0b; }
    .add-skill-btn {
        padding:0 14px; background:#f59e0b; color:#fff; border:none;
        border-radius:9px; cursor:pointer; transition:0.2s; font-size:14px;
    }
    .add-skill-btn:hover { background:#d97706; }
    .skill-chips { display:flex; flex-wrap:wrap; gap:7px; margin-top:8px; }
    .skill-chip {
        display:flex; align-items:center; gap:6px;
        background:#fef3c7; color:#92400e;
        border:1px solid #fcd34d; border-radius:999px;
        padding:4px 12px; font-size:12px; font-weight:600;
    }
    .skill-chip button { background:none; border:none; cursor:pointer; color:#d97706; display:flex; align-items:center; }

    .generate-btn {
        display:inline-flex; align-items:center; gap:8px;
        padding:12px 28px; background:linear-gradient(135deg,#f59e0b,#d97706);
        color:#fff; border:none; border-radius:12px;
        font-size:14px; font-weight:700; cursor:pointer; transition:0.2s;
    }
    .generate-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 20px rgba(245,158,11,0.4); }
    .generate-btn:disabled { opacity:0.6; cursor:not-allowed; }

    /* Questions */
    .questions-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; flex-wrap:wrap; gap:10px; }
    .pos-highlight { color:#4338ca; }
    .copy-all-btn {
        display:inline-flex; align-items:center; gap:6px;
        padding:8px 16px; background:#eef2ff; color:#4338ca;
        border:1px solid #c7d2fe; border-radius:8px;
        font-size:12px; font-weight:700; cursor:pointer; transition:0.15s;
    }
    .copy-all-btn:hover { background:#4338ca; color:#fff; }

    .questions-list { display:flex; flex-direction:column; gap:10px; }
    .question-card {
        display:flex; gap:14px; align-items:flex-start;
        padding:14px; background:#f8fafc;
        border:1px solid #e2e8f0; border-radius:12px; transition:0.15s;
    }
    .question-card:hover { border-color:#6366f1; background:#fff; box-shadow:0 3px 12px rgba(99,102,241,0.08); }
    .q-number {
        width:28px; height:28px; border-radius:50%;
        background:linear-gradient(135deg,#6366f1,#4338ca);
        color:#fff; font-size:12px; font-weight:800;
        display:flex; align-items:center; justify-content:center; flex-shrink:0;
    }
    .q-body { flex:1; }
    .q-text { font-size:13px; font-weight:600; color:#1e293b; line-height:1.6; margin-bottom:8px; }
    .q-tags { display:flex; gap:6px; flex-wrap:wrap; }
    .q-badge { border-radius:999px; padding:2px 10px; font-size:11px; font-weight:700; }
    .q-skill { background:#f3f4f6; color:#6b7280; border-radius:999px; padding:2px 10px; font-size:11px; font-weight:600; }
    .copy-q-btn {
        background:none; border:none; cursor:pointer; color:#9ca3af;
        opacity:0.5; transition:0.15s; padding:4px; flex-shrink:0;
    }
    .copy-q-btn:hover { opacity:1; color:#4338ca; }
`;

export default ScreeningQuestions;
