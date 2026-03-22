import React, { useEffect, useRef } from "react";
import Wrapper from "../assets/css/wrappers/LandingPage";
import { Link } from "react-router-dom";
import photo from "../assets/media/LandingPage/hero.png";
import Navbar from "../components/shared/Navbar";
import HowWorks from "../components/Home Page/HowWorks";
import Team from "../components/Home Page/Team";
import Brands from "../components/Home Page/Brands";
import Testimonial from "../components/Home Page/Testimonial";

const Landing = () => {
    const navbarRef = useRef(null);
    const heroRef = useRef(null);

    useEffect(() => {
        const navbarHeight = navbarRef.current.getBoundingClientRect().height;
        heroRef.current.style.minHeight = `calc(100vh - ${navbarHeight}px)`;
    }, []);

    return (
        <>
            <Navbar navbarRef={navbarRef} />
            <Wrapper ref={heroRef}>
                <div className="hero-content">
                    {/* Text Content */}
                    <div className="text-content">
                        <div className="eyebrow">
                            <span className="eyebrow-dot"></span>
                            #1 Job Portal Platform
                        </div>

                        <h1>
                            Find Your <span className="fancy">Dream Job</span>{" "}
                            &amp; Build Your Career
                        </h1>

                        <p className="hero-desc">
                            Discover thousands of job opportunities from top companies
                            worldwide. Connect with recruiters, showcase your skills,
                            and land the role you deserve — all in one place.
                        </p>

                        <div className="stats-row">
                            <div className="stat-item">
                                <span className="stat-number">50K+</span>
                                <span className="stat-label">Active Jobs</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">12K+</span>
                                <span className="stat-label">Companies</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">95%</span>
                                <span className="stat-label">Success Rate</span>
                            </div>
                        </div>

                        <div className="btn-grp">
                            <Link className="btn" to="/all-jobs">
                                🚀 Browse Jobs
                            </Link>
                            <Link className="btn-secondary" to="/register">
                                <span>Post a Job</span>
                                <span>→</span>
                            </Link>
                        </div>
                    </div>

                    {/* Image / Visual */}
                    <div className="placeholder">
                        <div className="img-card">
                            <img src={photo} alt="Job portal hero illustration" />
                        </div>

                        {/* Floating badge 1 */}
                        <div className="float-badge">
                            <div className="badge-icon">💼</div>
                            <div className="badge-info">
                                <span className="badge-num">2,340</span>
                                <span className="badge-text">New jobs today</span>
                            </div>
                        </div>

                        {/* Floating badge 2 */}
                        <div className="float-badge-2">
                            <div style={{ fontSize: "24px" }}>⭐</div>
                            <div className="badge-info">
                                <span className="badge-num">4.9/5</span>
                                <span className="badge-text">User rating</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Wrapper>

            <div>
                <HowWorks />
                <Team />
                <Testimonial />
                <Brands />
            </div>
        </>
    );
};

export default Landing;
