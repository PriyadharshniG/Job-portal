import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";
import Swal from "sweetalert2";
import { FiAward, FiPlus, FiTrash2, FiExternalLink, FiUpload } from "react-icons/fi";
import { useUserContext } from "../context/UserContext";
import dayjs from "dayjs";

const API = "https://job-portal-jk38.onrender.com/api/v1";

const Certifications = () => {
    const { user, handleFetchMe } = useUserContext();
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ title: "", issuer: "", issued_date: "" });
    const [certFile, setCertFile] = useState(null);

    const certs = user?.certifications || [];

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const ext = file.name.split(".").pop().toLowerCase();
        if (!["pdf","jpg","jpeg","png","webp"].includes(ext)) {
            Swal.fire({ icon: "warning", title: "Invalid file", text: "Please upload PDF or image file." });
            return;
        }
        setCertFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) {
            Swal.fire({ icon: "warning", title: "Title required", text: "Please enter the certification title." });
            return;
        }
        setSaving(true);
        try {
            const fd = new FormData();
            fd.append("title", form.title);
            fd.append("issuer", form.issuer);
            fd.append("issued_date", form.issued_date);
            if (certFile) fd.append("file", certFile);

            await axios.post(`${API}/student/certifications/upload`, fd, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" },
            });
            await handleFetchMe();
            setForm({ title: "", issuer: "", issued_date: "" });
            setCertFile(null);
            setShowForm(false);
            Swal.fire({ icon: "success", title: "Certification Added! 🏅", timer: 1800, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: "error", title: "Failed", text: err?.response?.data?.detail || "Could not add certification." });
        }
        setSaving(false);
    };

    const handleDelete = async (certId, title) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Remove certification?",
            text: `Remove "${title}" from your profile?`,
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            confirmButtonText: "Remove",
        });
        if (!result.isConfirmed) return;
        try {
            await axios.delete(`${API}/student/certifications/${certId}`, { withCredentials: true });
            await handleFetchMe();
            Swal.fire({ icon: "success", title: "Removed", timer: 1200, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: "error", title: "Error", text: err?.response?.data?.detail || "Could not remove." });
        }
    };

    return (
        <Wrapper>
            <div className="page-head">
                <div className="page-title-group">
                    <FiAward className="page-icon" />
                    <div>
                        <h1 className="page-title">Certifications</h1>
                        <p className="page-sub">Upload and showcase your certificates and course completions</p>
                    </div>
                </div>
                <button className="add-new-btn" onClick={() => setShowForm(!showForm)}>
                    <FiPlus size={15} /> {showForm ? "Cancel" : "Add Certification"}
                </button>
            </div>

            {/* ── Add Form ── */}
            {showForm && (
                <div className="card form-card">
                    <h3 className="card-title">Add New Certification</h3>
                    <form onSubmit={handleSubmit} className="cert-form">
                        <div className="form-row">
                            <div className="field">
                                <label>Certification Title *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. AWS Certified Developer"
                                    value={form.title}
                                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="field">
                                <label>Issuing Organization</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Amazon, Google, Udemy"
                                    value={form.issuer}
                                    onChange={e => setForm(f => ({ ...f, issuer: e.target.value }))}
                                />
                            </div>
                            <div className="field">
                                <label>Issue Date</label>
                                <input
                                    type="date"
                                    value={form.issued_date}
                                    onChange={e => setForm(f => ({ ...f, issued_date: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="file-section">
                            <label className="file-label">
                                <FiUpload size={13} />
                                {certFile ? certFile.name : "Upload Certificate (PDF/Image) — Optional"}
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" style={{ display: "none" }} onChange={handleFileChange} />
                            </label>
                            {certFile && (
                                <button type="button" className="clear-file" onClick={() => setCertFile(null)}>✕ Remove file</button>
                            )}
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="submit-btn" disabled={saving}>
                                {saving ? "Saving…" : "Save Certification"}
                            </button>
                            <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Certification List ── */}
            {certs.length > 0 ? (
                <div className="certs-grid">
                    {certs.map(cert => (
                        <div key={cert._id} className="cert-card">
                            <div className="cert-badge">🏅</div>
                            <div className="cert-body">
                                <h4 className="cert-title">{cert.title}</h4>
                                {cert.issuer && <p className="cert-issuer">{cert.issuer}</p>}
                                {cert.issued_date && (
                                    <p className="cert-date">📅 {dayjs(cert.issued_date).format("MMM YYYY")}</p>
                                )}
                                <p className="cert-added">Added {dayjs(cert.added_at).format("MMM D, YYYY")}</p>
                            </div>
                            <div className="cert-actions">
                                {cert.file_url && (
                                    <a
                                        href={`https://job-portal-jk38.onrender.com${cert.file_url}`}
                                        target="_blank" rel="noopener noreferrer"
                                        className="view-cert-btn"
                                        title="View Certificate"
                                    >
                                        <FiExternalLink size={13} /> View
                                    </a>
                                )}
                                <button
                                    className="delete-cert-btn"
                                    onClick={() => handleDelete(cert._id, cert.title)}
                                    title="Remove"
                                >
                                    <FiTrash2 size={13} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card empty-state">
                    <FiAward size={48} />
                    <h3>No certifications yet</h3>
                    <p>Add your certificates, online courses, and professional qualifications to strengthen your profile.</p>
                    <button className="add-new-btn" onClick={() => setShowForm(true)}>
                        <FiPlus size={14} /> Add Your First Certification
                    </button>
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

    .page-head {
        display: flex; justify-content: space-between; align-items: center;
        flex-wrap: wrap; gap: 12px;
    }
    .page-title-group { display: flex; align-items: center; gap: 14px; }
    .page-icon { font-size: 1.8rem; color: #f59e0b; }
    .page-title { font-size: 1.3rem; font-weight: 800; color: #0f172a; }
    .page-sub { font-size: 12px; color: #64748b; margin-top: 2px; }

    .add-new-btn {
        display: inline-flex; align-items: center; gap: 7px;
        padding: 10px 20px; background: linear-gradient(135deg, #f59e0b, #d97706);
        color: #fff; border: none; border-radius: 10px;
        font-size: 13px; font-weight: 700; cursor: pointer; transition: 0.2s;
    }
    .add-new-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(245,158,11,0.35); }

    .card {
        background: #fff;
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        border: 1px solid #f1f5f9;
    }
    .card-title { font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 1.25rem; }

    /* ── Form ── */
    .cert-form { display: flex; flex-direction: column; gap: 1rem; }
    .form-row {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 14px;
    }
    .field { display: flex; flex-direction: column; gap: 5px; }
    .field label { font-size: 12px; font-weight: 700; color: #374151; }
    .field input {
        padding: 9px 13px; border: 1.5px solid #e2e8f0; border-radius: 9px;
        font-size: 13px; color: #0f172a; outline: none; transition: 0.2s;
    }
    .field input:focus { border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,0.1); }

    .file-section { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .file-label {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 9px 18px; border: 1.5px dashed #d97706;
        background: #fffbeb; color: #92400e;
        border-radius: 9px; font-size: 13px; font-weight: 600;
        cursor: pointer; transition: 0.2s;
    }
    .file-label:hover { background: #fef3c7; }
    .clear-file {
        background: none; border: none; color: #ef4444;
        font-size: 12px; font-weight: 600; cursor: pointer;
    }

    .form-actions { display: flex; gap: 10px; }
    .submit-btn {
        padding: 10px 24px; background: linear-gradient(135deg, #4338ca, #6366f1);
        color: #fff; border: none; border-radius: 10px;
        font-size: 13px; font-weight: 700; cursor: pointer; transition: 0.2s;
    }
    .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(67,56,202,0.35); }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .cancel-btn {
        padding: 10px 18px; background: #f8fafc; color: #64748b;
        border: 1px solid #e2e8f0; border-radius: 10px;
        font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s;
    }
    .cancel-btn:hover { background: #f1f5f9; }

    /* ── Cert Grid ── */
    .certs-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 14px;
    }
    .cert-card {
        background: #fff;
        border: 1px solid #f1f5f9;
        border-radius: 14px;
        padding: 1.25rem;
        display: flex;
        gap: 12px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        transition: 0.2s;
        position: relative;
    }
    .cert-card:hover { box-shadow: 0 6px 20px rgba(245,158,11,0.12); border-color: #fcd34d; transform: translateY(-2px); }
    .cert-badge { font-size: 2rem; flex-shrink: 0; }
    .cert-body { flex: 1; min-width: 0; }
    .cert-title { font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 2px; word-break: break-word; }
    .cert-issuer { font-size: 12px; color: #4338ca; font-weight: 600; }
    .cert-date { font-size: 11px; color: #64748b; margin-top: 4px; }
    .cert-added { font-size: 11px; color: #9ca3af; margin-top: 4px; }
    .cert-actions {
        display: flex; flex-direction: column; gap: 6px; align-items: flex-end;
    }
    .view-cert-btn {
        display: inline-flex; align-items: center; gap: 4px;
        padding: 4px 10px; background: #eef2ff; color: #4338ca;
        border-radius: 6px; font-size: 11px; font-weight: 700;
        text-decoration: none; transition: 0.15s;
    }
    .view-cert-btn:hover { background: #4338ca; color: #fff; }
    .delete-cert-btn {
        background: none; border: none; color: #ef4444;
        cursor: pointer; opacity: 0.5; transition: 0.15s;
        padding: 4px;
    }
    .delete-cert-btn:hover { opacity: 1; }

    /* ── Empty ── */
    .empty-state {
        display: flex; flex-direction: column;
        align-items: center; gap: 12px; padding: 3rem;
        color: #9ca3af; text-align: center;
    }
    .empty-state svg { color: #f59e0b; opacity: 0.4; }
    .empty-state h3 { font-size: 1.1rem; font-weight: 700; color: #374151; }
    .empty-state p { font-size: 13px; max-width: 380px; line-height: 1.6; }
`;

export default Certifications;
