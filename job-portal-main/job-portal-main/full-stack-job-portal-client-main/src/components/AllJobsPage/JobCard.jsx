import React, { useState } from "react";
import styled from "styled-components";

import { TfiLocationPin } from "react-icons/tfi";
import { BsFillBriefcaseFill } from "react-icons/bs";
import { TbTargetArrow } from "react-icons/tb";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FiLock } from "react-icons/fi";

import advancedFormat from "dayjs/plugin/advancedFormat";
import dayjs from "dayjs";
dayjs.extend(advancedFormat);

import { useUserContext } from "../../context/UserContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const JobCard = ({ job }) => {
    const date = dayjs(job?.job_deadline).format("MMM Do, YYYY");
    const { user } = useUserContext();
    const navigate = useNavigate();
    const [applying, setApplying] = useState(false);

    // User is considered logged in if they have an email field
    const isLoggedIn = user && user.email;

    const handleApply = async (id) => {
        if (!isLoggedIn) {
            navigate("/login", { state: { from: "/all-jobs" } });
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

    return (
        <Wrapper>
            <div className="card-container">
                <div className="card-header">
                    <div className="logo">
                        <span>{job?.company?.charAt(0)}</span>
                    </div>
                    <div className="right">
                        <h2 className="title">{job?.position}</h2>
                        <h4 className="company">- {job?.company}</h4>
                    </div>
                </div>

                <div className="middle-row">
                    <div className="location" title="Deadline">
                        <FaRegCalendarAlt className="mr-2 text-lg" />
                        <span>{date}</span>
                    </div>
                    <div className="location">
                        <TfiLocationPin className="mr-2 text-lg" />
                        <span>{job?.job_location}</span>
                    </div>
                    <div className="type">
                        <BsFillBriefcaseFill className="mr-2 text-lg" />
                        <span className="capitalize">{job?.job_type}</span>
                    </div>
                    <div className="status capitalize">
                        <TbTargetArrow className="mr-2 text-lg" />
                        <span className={job?.status}>{job?.status}</span>
                    </div>
                </div>

                <div className="end-row">
                    <Link to={`/job/${job._id}`} className="detail-btn">
                        Details
                    </Link>

                    {/* Logged in → show Apply; Guest → show Login to Apply */}
                    {isLoggedIn ? (
                        <button
                            className="apply-btn"
                            onClick={() => handleApply(job._id)}
                            disabled={applying}
                        >
                            {applying ? "Applying..." : "Apply"}
                        </button>
                    ) : (
                        <button
                            className="login-apply-btn"
                            onClick={() =>
                                navigate("/login", { state: { from: "/all-jobs" } })
                            }
                            title="Login or Register to apply for this job"
                        >
                            <FiLock className="lock-icon" />
                            Login to Apply
                        </button>
                    )}

                    {/* Edit button for job owner */}
                    {isLoggedIn && user?._id === job?.created_by && (
                        <Link
                            to={`/dashboard/edit-job/${job._id}`}
                            className="detail-btn"
                        >
                            Edit
                        </Link>
                    )}
                </div>
            </div>
        </Wrapper>
    );
};

const Wrapper = styled.div`
    width: 100%;
    height: 100%;
    margin: 0 auto;

    .card-container {
        height: 100%;
        box-shadow: 0 4px 4px var(--shadow-medium),
            0 -2px 6px var(--shadow-medium);
        border-radius: 4px;
        padding: 2rem 1.5rem;
    }
    .card-container .card-header {
        display: flex;
        justify-content: flex-start;
        align-items: center;
    }
    .card-container .logo {
        margin-right: 18px;
        width: 50px;
        height: 50px;
        border-radius: 3px;
        background-color: #fb891f;
        display: flex;
        justify-content: center;
        align-items: center;
        color: var(--color-white);
        font-size: 30px;
        font-weight: 700;
        text-transform: uppercase;
        flex-shrink: 0;
    }
    .right .title {
        text-transform: capitalize;
        font-size: calc(15px + 0.3vw);
        font-weight: 600;
        color: var(--color-black);
        line-height: 24px;
    }
    .right .company {
        display: inline-block;
        text-transform: capitalize;
        font-size: calc(11px + 0.15vw);
        font-weight: 600;
        color: var(--color-black);
        letter-spacing: 1px;
        padding: 1px 2px;
        border-radius: 4px;
    }
    @media screen and (max-width: 550px) {
        .right .title { line-height: 18px; }
    }

    .middle-row {
        margin-top: 20px;
        display: grid;
        grid-template-columns: 1fr;
        grid-row-gap: calc(0.6rem + 0.09vw);
        align-items: center;
    }
    .location,
    .type,
    .status {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        font-size: 14px;
    }
    .status span {
        background-color: #fefe7d;
        padding: 2px 15px;
        border-radius: 6px;
        text-transform: uppercase;
        font-size: 12.5px;
        font-weight: 400;
        letter-spacing: 1px;
    }
    .status span.open     { background-color: #a0ffa3; }
    .status span.pending  { background-color: #fefe7d; }
    .status span.declined { background-color: #feb69a; }
    .status span.closed   { background-color: #ddd; }

    .end-row {
        margin-top: calc(18px + 0.4vw);
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
    }
    .end-row .detail-btn {
        padding: 5px 18px;
        text-transform: capitalize;
        background-color: var(--color-black);
        color: var(--color-white);
        border-radius: 4px;
        letter-spacing: 1px;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.3s linear;
        border: none;
        text-decoration: none;
    }
    .end-row .detail-btn:hover {
        background-color: var(--color-accent);
    }
    .end-row .apply-btn {
        padding: 5px 18px;
        text-transform: capitalize;
        background-color: var(--color-accent);
        color: var(--color-white);
        border-radius: 4px;
        letter-spacing: 1px;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.3s linear;
        border: none;
        outline: none;
        cursor: pointer;
    }
    .end-row .apply-btn:hover { background-color: var(--color-black); }
    .end-row .apply-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    /* Guest "Login to Apply" button */
    .end-row .login-apply-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 14px;
        background-color: transparent;
        color: #e87d2c;
        border: 1.5px solid #e87d2c;
        border-radius: 4px;
        letter-spacing: 0.5px;
        font-size: 13px;
        font-weight: 600;
        transition: all 0.25s ease;
        cursor: pointer;
        outline: none;
    }
    .end-row .login-apply-btn:hover {
        background-color: #e87d2c;
        color: #fff;
    }
    .end-row .login-apply-btn .lock-icon {
        font-size: 13px;
    }
`;

export default JobCard;
