import React, { useState } from "react";
import styled from "styled-components";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Swal from "sweetalert2";
import LoadingComTwo from "../components/shared/LoadingComTwo";
import Navbar from "../components/shared/Navbar";
import { useUserContext } from "../context/UserContext";
import { FiLock } from "react-icons/fi";
import { MdAccessTime } from "react-icons/md";

import advancedFormat from "dayjs/plugin/advancedFormat";
import dayjs from "dayjs";
dayjs.extend(advancedFormat);

const Job = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useUserContext();
    const [applying, setApplying] = useState(false);

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

    const handleApply = async () => {
        if (!isLoggedIn) {
            navigate("/login", { state: { from: `/job/${id}` } });
            return;
        }
        setApplying(true);
        try {
            const response = await axios.post(
                `http://localhost:8000/api/v1/applications/apply`,
                { job_id: id },
                { withCredentials: true }
            );
            Swal.fire({
                icon: "success",
                title: "Applied!",
                text: response?.data?.message,
            });
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
                                <button
                                    className="apply-btn"
                                    onClick={handleApply}
                                    disabled={applying}
                                >
                                    {applying ? "Submitting..." : "Apply Now"}
                                </button>
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
        border-radius: 8px;
        border-left: 4px solid var(--color-accent, #e87d2c);
    }
    .apply .info {
        font-size: calc(12px + 0.15vw);
        font-weight: 600;
        opacity: 0.8;
        margin-bottom: 1rem;
    }
    .apply-actions { margin-top: 1rem; }

    .apply-btn {
        padding: 10px 28px;
        background-color: var(--color-accent, #e87d2c);
        color: #fff;
        border: none;
        border-radius: 6px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.25s;
        letter-spacing: 0.5px;
    }
    .apply-btn:hover { background-color: #c8641a; }
    .apply-btn:disabled { opacity: 0.6; cursor: not-allowed; }

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
