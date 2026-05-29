import React, { useState, useRef } from "react";
import styled from "styled-components";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Swal from "sweetalert2";
import LoadingComTwo from "../components/shared/LoadingComTwo";
import Navbar from "../components/shared/Navbar";
import { useUserContext } from "../context/UserContext";
import { FiLock, FiPaperclip } from "react-icons/fi";
import { MdAccessTime } from "react-icons/md";

import advancedFormat from "dayjs/plugin/advancedFormat";
import dayjs from "dayjs";
dayjs.extend(advancedFormat);

const Job = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useUserContext();
    const [applying, setApplying] = useState(false);
    const [resumeFile, setResumeFile] = useState(null);
    const fileInputRef = useRef(null);

    const isLoggedIn = user && user.email;

    const {
        isLoading,
        isError,
        data: jobData,
        error,
    } = useQuery({
        queryKey: ["job", id],
        queryFn: async () => {
            const res = await axios.get(
                `http://localhost:8000/api/v1/jobs/${id}`,
                { withCredentials: true }
            );
            return res.data?.result;
        },
    });

    const handleResumeChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.type !== "application/pdf") {
            Swal.fire({ icon: "warning", title: "PDF Only", text: "Please select a PDF file." });
            e.target.value = "";
            return;
        }
        setResumeFile(file);
    };

    const handleApply = async () => {
        if (!isLoggedIn) {
            navigate("/login", { state: { from: `/job/${id}` } });
            return;
        }

        // ── Resume is MANDATORY ──────────────────────────────
        if (!resumeFile) {
            Swal.fire({
                icon: "warning",
                title: "Resume Required",
                text: "Please attach your resume (PDF) before applying.",
                confirmButtonColor: "#f59e0b",
            });
            return;
        }

        setApplying(true);
        try {
            // Step 1: Upload resume PDF → backend extracts skills automatically
            const formData = new FormData();
            formData.append("file", resumeFile);
            const uploadRes = await axios.post(
                `http://localhost:8000/api/v1/applications/upload-resume`,
                formData,
                {
                    withCredentials: true,
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            const resume_url = uploadRes.data.resume_url;

            // Step 2: Submit application with the uploaded resume URL
            const response = await axios.post(
                `http://localhost:8000/api/v1/applications/apply`,
                { job_id: id, resume_url },
                { withCredentials: true }
            );
            const result = await Swal.fire({
                icon: "success",
                title: "Applied! 🎉",
                text: response?.data?.message || "Your application has been submitted successfully.",
                showCancelButton: true,
                confirmButtonText: "🔍 Browse More Jobs",
                cancelButtonText: "Stay Here",
                confirmButtonColor: "#4f6ef7",
                cancelButtonColor: "#6b7280",
            });
            setResumeFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            if (result.isConfirmed) {
                navigate("/all-jobs");
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: error?.response?.data?.detail || "Something went wrong.",
            });
        }
        setApplying(false);
    };

    const deadline = jobData?.job_deadline
        ? dayjs(jobData.job_deadline).format("MMM Do, YYYY")
        : "N/A";

    if (isLoading) return <LoadingComTwo />;
    if (isError) return <h2 style={{ textAlign: "center", marginTop: "4rem" }}>{error?.message}</h2>;

    return (
        <>
            <Navbar />
            <Wrapper>
                <div className="top-row">
                    <h2 className="title">
                        <span className="capitalize">Job Title: </span>
                        {jobData?.position}
                    </h2>
                    <h4 className="company">
                        <span className="fancy">Posted by: </span>
                        {jobData?.company}
                    </h4>
                    <h4 className="post-date">
                        <MdAccessTime className="text-lg mr-1" />
                        {dayjs(jobData?.created_at).format("MMM Do, YYYY")}
                    </h4>
                </div>

                <div className="middle-row">
                    <div className="description">
                        <h3 className="sec-title">Description</h3>
                        <p>{jobData?.job_description}</p>
                    </div>

                    <h4 className="deadline">
                        Deadline: <span>{deadline}</span>
                    </h4>
                    <h4 className="vacancy">
                        Vacancy: <span>{jobData?.job_vacancy}</span>
                    </h4>
                    <h4 className="salary">
                        Salary: <span>{jobData?.job_salary}</span>
                    </h4>
                    <h4 className="location">
                        Location: <span>{jobData?.job_location}</span>
                    </h4>

                    {jobData?.job_skills?.length > 0 && (
                        <div className="requirement">
                            <h3 className="sec-title">Required Skills</h3>
                            <ul>
                                {jobData.job_skills.map((skill) => (
                                    <li key={skill}>{skill}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {jobData?.job_facilities?.length > 0 && (
                        <div className="facility">
                            <h3 className="sec-title">Facilities</h3>
                            <ul>
                                {jobData.job_facilities.map((f) => (
                                    <li key={f}>{f}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="apply">
                        <h3 className="sec-title">Apply</h3>
                        <p className="info">Contact: {jobData?.job_contact}</p>

                        <div className="apply-actions">
                            {isLoggedIn ? (
                                <div className="apply-logged-in">
                                    {/* Resume Upload */}
                                    <div className="resume-section">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="application/pdf"
                                            id="resume-upload"
                                            style={{ display: "none" }}
                                            onChange={handleResumeChange}
                                        />
                                        <button
                                            type="button"
                                            className="resume-btn"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <FiPaperclip />
                                            {resumeFile ? "Change Resume" : "Attach Resume (PDF)"}
                                        </button>
                                        {resumeFile && (
                                            <div className="resume-preview">
                                                <span className="resume-icon">📄</span>
                                                <span className="resume-name">{resumeFile.name}</span>
                                                <button
                                                    className="resume-remove"
                                                    onClick={() => {
                                                        setResumeFile(null);
                                                        if (fileInputRef.current) fileInputRef.current.value = "";
                                                    }}
                                                >✕</button>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        className="apply-btn"
                                        onClick={handleApply}
                                        disabled={applying}
                                        title={!resumeFile ? "Please attach your resume first" : "Submit your application"}
                                    >
                                        {applying ? "Submitting..." : "Apply Now"}
                                    </button>
                                    {!resumeFile && (
                                        <p className="resume-hint">⚠️ Resume is required to apply</p>
                                    )}
                                </div>
                            ) : (
                                <div className="guest-apply">
                                    <p className="guest-msg">
                                        You must be logged in to apply for this job.
                                    </p>
                                    <div className="guest-btns">
                                        <button
                                            className="login-btn"
                                            onClick={() =>
                                                navigate("/login", {
                                                    state: { from: `/job/${id}` },
                                                })
                                            }
                                        >
                                            <FiLock /> Login to Apply
                                        </button>
                                        <Link to="/register" className="register-btn">
                                            Register
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Wrapper>
        </>
    );
};

const Wrapper = styled.section`
    padding: 2rem 1.5rem;
    max-width: 1000px;
    margin: 0 auto;
    margin-bottom: calc(20px + 1vw);
    width: 100%;

    .top-row {
        margin-bottom: calc(30px + 1vw);
    }
    .top-row .title {
        font-size: calc(14px + 1vw);
        text-align: center;
    }
    .top-row .company {
        font-size: calc(11px + 0.35vw);
        text-align: center;
        text-transform: capitalize;
        font-weight: 600;
        margin-top: 4px;
        opacity: 0.75;
    }
    .top-row .post-date {
        font-size: 11px;
        font-weight: 600;
        text-align: center;
        opacity: 0.75;
        margin-top: 8px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .middle-row .sec-title {
        font-size: calc(14px + 0.15vw);
        font-weight: 600;
        text-transform: capitalize;
        opacity: 0.8;
        text-decoration: underline;
        margin-bottom: 6px;
    }
    .middle-row .description {
        margin-bottom: calc(16px + 0.3vw);
    }
    .middle-row .description p {
        font-size: calc(12px + 0.15vw);
        line-height: 23px;
        text-align: justify;
    }
    .middle-row .deadline,
    .middle-row .vacancy,
    .middle-row .salary,
    .middle-row .location {
        font-size: calc(13px + 0.1vw);
        font-weight: 600;
        opacity: 0.8;
        margin: 6px 0;
    }
    .middle-row .requirement,
    .middle-row .facility {
        margin: calc(12px + 0.3vw) 0;
    }
    .middle-row .requirement ul,
    .middle-row .facility ul {
        list-style: circle;
        margin-left: calc(30px + 0.5vw);
        margin-top: 6px;
    }
    .middle-row .requirement ul li,
    .middle-row .facility ul li {
        font-size: calc(12px + 0.15vw);
        text-transform: capitalize;
        padding: 2px 0;
    }

    /* Apply section */
    .apply {
        margin-top: calc(20px + 0.5vw);
        padding: 1.5rem;
        background: #f8f9ff;
        border-radius: 12px;
        border-left: 4px solid #f59e0b;
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .apply .info {
        font-size: calc(12px + 0.15vw);
        font-weight: 600;
        opacity: 0.8;
        margin-bottom: 1rem;
    }
    .apply-actions { margin-top: 1rem; }
    .apply-logged-in { display: flex; flex-direction: column; gap: 16px; }

    /* Resume upload */
    .resume-section { display: flex; flex-direction: column; gap: 10px; }
    .resume-btn {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 10px 20px;
        background: white;
        border: 2px dashed #d97706;
        border-radius: 10px;
        font-size: 14px; font-weight: 600; color: #92400e;
        cursor: pointer; transition: 0.2s;
        width: fit-content;
    }
    .resume-btn:hover { background: #fffbeb; border-color: #f59e0b; color: #78350f; }

    .resume-preview {
        display: inline-flex; align-items: center; gap: 10px;
        padding: 10px 16px;
        background: #fffbeb; border: 1px solid #fde68a;
        border-radius: 10px;
        font-size: 13px; font-weight: 600; color: #92400e;
        max-width: 420px;
    }
    .resume-icon { font-size: 20px; flex-shrink: 0; }
    .resume-name {
        flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .resume-remove {
        background: none; border: none; font-size: 15px; cursor: pointer;
        color: #b45309; opacity: 0.7; padding: 0 2px;
        transition: 0.15s; flex-shrink: 0;
    }
    .resume-remove:hover { opacity: 1; color: #dc2626; }

    .apply-btn {
        padding: 12px 32px;
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: #fff;
        border: none;
        border-radius: 10px;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        transition: 0.25s;
        letter-spacing: 0.5px;
        box-shadow: 0 4px 14px rgba(245,158,11,0.35);
        width: fit-content;
    }
    .apply-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(245,158,11,0.45); }
    .apply-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

    .resume-hint {
        font-size: 12px;
        color: #b45309;
        font-weight: 600;
        margin-top: 4px;
        display: flex;
        align-items: center;
        gap: 4px;
    }


    .guest-apply .guest-msg {
        font-size: 14px;
        color: #666;
        margin-bottom: 12px;
        font-style: italic;
    }
    .guest-btns {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
    }
    .login-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 9px 22px;
        background-color: var(--color-accent, #e87d2c);
        color: #fff;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.25s;
    }
    .login-btn:hover { background-color: #c8641a; }

    .register-btn {
        display: flex;
        align-items: center;
        padding: 9px 22px;
        background-color: transparent;
        color: var(--color-accent, #e87d2c);
        border: 2px solid var(--color-accent, #e87d2c);
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        text-decoration: none;
        transition: all 0.25s;
    }
    .register-btn:hover {
        background-color: var(--color-accent, #e87d2c);
        color: #fff;
    }
`;

export default Job;
