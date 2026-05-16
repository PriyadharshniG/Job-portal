import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";
import Swal from "sweetalert2";
import { FiPlus, FiX, FiStar, FiZap } from "react-icons/fi";
import { useUserContext } from "../context/UserContext";

const API = "http://localhost:8000/api/v1";

// Predefined popular skills for quick-add
const POPULAR_SKILLS = [
    "Python","JavaScript","TypeScript","Java","C++","React","Node.js","Django","FastAPI",
    "MongoDB","MySQL","PostgreSQL","Docker","AWS","Git","Machine Learning","Deep Learning",
    "TensorFlow","Pandas","NumPy","Flutter","Android","iOS","Linux","Bash","GraphQL",
    "Vue.js","Angular","Next.js","Redis","Kubernetes","CI/CD","Figma","Agile","Scrum",
];

const SkillsManager = () => {
    const { user, handleFetchMe } = useUserContext();
    const [newSkill, setNewSkill] = useState("");
    const [saving, setSaving] = useState(false);

    const skills = user?.skills || [];

    const addSkill = async (skill) => {
        const s = (skill || newSkill).trim();
        if (!s) return;
        if (skills.map(x => x.toLowerCase()).includes(s.toLowerCase())) {
            Swal.fire({ icon: "info", title: "Already added!", timer: 1200, showConfirmButton: false });
            return;
        }
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append("skill", s);
            await axios.post(`${API}/student/skills/add`, formData, { withCredentials: true });
            handleFetchMe();
            setNewSkill("");
        } catch (err) {
            Swal.fire({ icon: "error", title: "Error", text: err?.response?.data?.detail || "Could not add skill." });
        }
        setSaving(false);
    };

    const removeSkill = async (skill) => {
        const result = await Swal.fire({
            icon: "question",
            title: "Remove skill?",
            text: `Remove "${skill}" from your profile?`,
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            confirmButtonText: "Remove",
            cancelButtonText: "Cancel",
        });
        if (!result.isConfirmed) return;
        setSaving(true);
        try {
            await axios.delete(`${API}/student/skills/${encodeURIComponent(skill)}`, { withCredentials: true });
            handleFetchMe();
        } catch (err) {
            Swal.fire({ icon: "error", title: "Error", text: err?.response?.data?.detail || "Could not remove." });
        }
        setSaving(false);
    };

    const saveAll = async () => {
        setSaving(true);
        try {
            await axios.put(`${API}/student/skills`, { skills }, { withCredentials: true });
            handleFetchMe();
            Swal.fire({ icon: "success", title: "Skills saved!", timer: 1500, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: "error", title: "Error", text: err?.response?.data?.detail || "Could not save." });
        }
        setSaving(false);
    };

    const quickAdd = (skill) => addSkill(skill);

    return (
        <Wrapper>
            <div className="page-head">
                <div className="page-title-group">
                    <FiStar className="page-icon" />
                    <div>
                        <h1 className="page-title">Manage Skills</h1>
                        <p className="page-sub">Add, remove, and organise your technical skills</p>
                    </div>
                </div>
            </div>

            {/* ── Add Skill ── */}
            <div className="card">
                <h3 className="card-title">Add a Skill</h3>
                <div className="add-row">
                    <input
                        type="text"
                        placeholder="e.g. React, Python, Docker…"
                        value={newSkill}
                        onChange={e => setNewSkill(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && addSkill()}
                        className="skill-input"
                        disabled={saving}
                    />
                    <button className="add-btn" onClick={() => addSkill()} disabled={saving || !newSkill.trim()}>
                        <FiPlus size={16} /> Add
                    </button>
                </div>
            </div>

            {/* ── Current Skills ── */}
            <div className="card">
                <div className="card-head">
                    <h3 className="card-title">Your Skills <span className="count-badge">{skills.length}</span></h3>
                    {skills.length > 0 && (
                        <button className="save-btn" onClick={saveAll} disabled={saving}>
                            {saving ? "Saving…" : "Save All"}
                        </button>
                    )}
                </div>

                {skills.length > 0 ? (
                    <div className="skills-grid">
                        {skills.map(s => (
                            <div key={s} className="skill-chip">
                                <span>{s}</span>
                                <button className="remove-btn" onClick={() => removeSkill(s)} disabled={saving} title="Remove">
                                    <FiX size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty">
                        <FiStar size={36} />
                        <p>No skills added yet. Add some from the input above or from popular skills below.</p>
                    </div>
                )}
            </div>

            {/* ── Quick Add Popular Skills ── */}
            <div className="card">
                <h3 className="card-title"><FiZap size={14} /> Quick-Add Popular Skills</h3>
                <p className="quick-sub">Click any skill below to instantly add it to your profile</p>
                <div className="quick-grid">
                    {POPULAR_SKILLS.map(s => {
                        const alreadyAdded = skills.map(x => x.toLowerCase()).includes(s.toLowerCase());
                        return (
                            <button
                                key={s}
                                className={`quick-chip ${alreadyAdded ? "added" : ""}`}
                                onClick={() => !alreadyAdded && quickAdd(s)}
                                disabled={alreadyAdded || saving}
                            >
                                {alreadyAdded ? "✓ " : "+ "}
                                {s}
                            </button>
                        );
                    })}
                </div>
            </div>
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

    .page-head { display: flex; justify-content: space-between; align-items: center; }
    .page-title-group { display: flex; align-items: center; gap: 14px; }
    .page-icon { font-size: 1.8rem; color: #f59e0b; }
    .page-title { font-size: 1.3rem; font-weight: 800; color: #0f172a; }
    .page-sub { font-size: 12px; color: #64748b; margin-top: 2px; }

    .card {
        background: #fff;
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        border: 1px solid #f1f5f9;
    }
    .card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .card-title {
        font-size: 14px; font-weight: 700; color: #1e293b;
        display: flex; align-items: center; gap: 8px; margin-bottom: 1rem;
    }
    .count-badge {
        background: #eef2ff; color: #4338ca;
        border-radius: 999px; padding: 2px 9px;
        font-size: 11px; font-weight: 700;
    }

    .add-row { display: flex; gap: 10px; }
    .skill-input {
        flex: 1; padding: 10px 14px;
        border: 1.5px solid #e2e8f0; border-radius: 10px;
        font-size: 14px; color: #0f172a;
        outline: none; transition: 0.2s;
    }
    .skill-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
    .add-btn {
        display: flex; align-items: center; gap: 6px;
        padding: 10px 20px; background: linear-gradient(135deg, #4338ca, #6366f1);
        color: #fff; border: none; border-radius: 10px;
        font-size: 14px; font-weight: 700; cursor: pointer; transition: 0.2s;
        white-space: nowrap;
    }
    .add-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(67,56,202,0.35); }
    .add-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .save-btn {
        padding: 7px 18px; background: #10b981; color: #fff;
        border: none; border-radius: 8px; font-size: 13px;
        font-weight: 700; cursor: pointer; transition: 0.2s;
    }
    .save-btn:hover:not(:disabled) { background: #059669; }
    .save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .skills-grid { display: flex; flex-wrap: wrap; gap: 10px; }
    .skill-chip {
        display: flex; align-items: center; gap: 8px;
        background: #eef2ff; color: #4338ca;
        border: 1px solid #c7d2fe; border-radius: 999px;
        padding: 7px 14px; font-size: 13px; font-weight: 600;
        transition: 0.15s;
    }
    .skill-chip:hover { border-color: #6366f1; box-shadow: 0 2px 8px rgba(99,102,241,0.15); }
    .remove-btn {
        background: none; border: none; cursor: pointer;
        color: #6366f1; display: flex; align-items: center;
        padding: 0; opacity: 0.6; transition: 0.15s;
    }
    .remove-btn:hover { opacity: 1; color: #ef4444; }
    .remove-btn:disabled { opacity: 0.3; cursor: not-allowed; }

    .empty {
        display: flex; flex-direction: column; align-items: center;
        gap: 10px; padding: 2rem; color: #9ca3af; text-align: center;
    }
    .empty p { font-size: 13px; max-width: 300px; }

    .quick-sub { font-size: 12px; color: #64748b; margin-top: -8px; margin-bottom: 14px; }
    .quick-grid { display: flex; flex-wrap: wrap; gap: 8px; }
    .quick-chip {
        padding: 6px 14px; border-radius: 999px;
        font-size: 12px; font-weight: 600; cursor: pointer;
        border: 1.5px solid #e2e8f0; background: #f8fafc; color: #475569;
        transition: 0.15s;
    }
    .quick-chip:hover:not(.added):not(:disabled) {
        background: #eef2ff; color: #4338ca; border-color: #6366f1;
    }
    .quick-chip.added {
        background: #ecfdf5; color: #065f46; border-color: #a7f3d0;
        cursor: default;
    }
    .quick-chip:disabled { opacity: 0.6; }
`;

export default SkillsManager;
