import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import vglugLogo from "../assets/media/vglug-logo.png";

const Logo = () => {
    return (
        <Wrapper>
            <Link to="/" className="logo-link">
                <img src={vglugLogo} alt="VGLUG Foundation" className="logo-img" />
                <span className="logo-text">
                    <span className="logo-vglug">VGLUG</span>
                    <span className="logo-portal"> Job Portal</span>
                </span>
            </Link>
        </Wrapper>
    );
};

const Wrapper = styled.div`
    .logo-link {
        display: flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
        user-select: none;
    }

    .logo-img {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        object-fit: cover;
    }

    .logo-text {
        display: flex;
        align-items: baseline;
        gap: 3px;
        font-size: 18px;
        font-weight: 800;
        letter-spacing: -0.3px;
        line-height: 1;
    }

    .logo-vglug {
        background: linear-gradient(135deg, var(--color-primary, #4f6ef7), var(--color-accent, #8b5cf6));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .logo-portal {
        color: var(--color-black, #0f172a);
        font-weight: 700;
    }

    @media screen and (max-width: 600px) {
        .logo-text { font-size: 15px; }
        .logo-img { width: 28px; height: 28px; }
    }
`;

export default Logo;
