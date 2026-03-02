/* eslint-disable react/prop-types */
import styled from "styled-components";
import Logo from "../Logo";
import { NavLink } from "react-router-dom";

const Navbar = ({ navbarRef }) => {
    return (
        <Wrapper ref={navbarRef}>
            <div className="container">
                <Logo />
                <nav className="nav-links">
                    <NavLink className="nav-item" to="/all-jobs">
                        Browse Jobs
                    </NavLink>
                    <NavLink className="nav-item" to="/dashboard">
                        Dashboard
                    </NavLink>
                </nav>
                <div className="nav-actions">
                    <NavLink className="btn-login" to="/login">
                        Log In
                    </NavLink>
                    <NavLink className="btn-register" to="/register">
                        Get Started →
                    </NavLink>
                </div>
            </div>
        </Wrapper>
    );
};

const Wrapper = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(226, 232, 240, 0.8);
    padding: 0;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 1px 20px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;

    .container {
        width: 100%;
        max-width: 1280px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 2rem;
        gap: 2rem;
    }

    /* Center nav links */
    .nav-links {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
        justify-content: center;
    }

    .nav-item {
        font-size: 14.5px;
        font-weight: 500;
        color: var(--color-text-light);
        padding: 8px 16px;
        border-radius: var(--radius-full);
        transition: var(--transition);
        position: relative;
    }
    .nav-item:hover {
        color: var(--color-primary);
        background: rgba(79, 110, 247, 0.06);
    }
    .nav-item.active {
        color: var(--color-primary);
        background: rgba(79, 110, 247, 0.08);
        font-weight: 600;
    }

    /* Action buttons */
    .nav-actions {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .btn-login {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text);
        padding: 8px 20px;
        border-radius: var(--radius-full);
        border: 1.5px solid var(--color-border);
        transition: var(--transition);
        white-space: nowrap;
    }
    .btn-login:hover {
        border-color: var(--color-primary);
        color: var(--color-primary);
        background: rgba(79, 110, 247, 0.04);
    }

    .btn-register {
        font-size: 14px;
        font-weight: 600;
        color: white;
        background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
        padding: 9px 22px;
        border-radius: var(--radius-full);
        transition: var(--transition);
        box-shadow: 0 2px 12px rgba(79, 110, 247, 0.3);
        white-space: nowrap;
    }
    .btn-register:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 20px rgba(79, 110, 247, 0.45);
    }
    .btn-register:active {
        transform: translateY(0);
    }

    @media screen and (max-width: 768px) {
        .nav-links { display: none; }
        .container { padding: 0.9rem 1.2rem; }
        .btn-login { display: none; }
    }
    @media screen and (max-width: 400px) {
        .btn-register { padding: 8px 16px; font-size: 13px; }
    }
`;

export default Navbar;
