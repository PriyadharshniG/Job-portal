import React from "react";
import { BiUserCircle } from "react-icons/bi";
import styled from "styled-components";
import DashboardNavLinks from "./DashboardNavLinks";
import { useDashboardContext } from "../../Layout/DashboardLayout";
import { useUserContext } from "../../context/UserContext";

const LargeSidebar = () => {
    const { user } = useUserContext();
    const { sidebarCollapsed } = useDashboardContext();

    return (
        <Wrapper $collapsed={sidebarCollapsed}>
            <div className="sidebar-container">
                {/* Profile section */}
                <div className="profile">
                    <BiUserCircle className="profile-icon" />
                    {!sidebarCollapsed && (
                        <>
                            <h6 className="profile-name">{user?.username}</h6>
                            <p className="profile-role">{user?.role}</p>
                        </>
                    )}
                </div>

                {/* Divider */}
                <div className="divider" />

                {/* Nav links */}
                <div className="content">
                    <DashboardNavLinks collapsed={sidebarCollapsed} />
                </div>
            </div>
        </Wrapper>
    );
};

const Wrapper = styled.aside`
    display: none;

    @media (min-width: 992px) {
        display: block;
        box-shadow: 1px 0 0 0 rgba(0, 0, 0, 0.08);
        flex-shrink: 0;

        .sidebar-container {
            background: #ffffff;
            min-height: 100vh;
            height: 100%;
            width: ${p => p.$collapsed ? "68px" : "240px"};
            transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
            padding: 1.5rem 0 2rem;
            display: flex;
            flex-direction: column;
            border-right: 1px solid #e2e8f0;
        }

        /* Profile */
        .profile {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: ${p => p.$collapsed ? "0 0 8px" : "0 16px 8px"};
            text-align: center;
            transition: padding 0.28s ease;
        }
        .profile-icon {
            font-size: ${p => p.$collapsed ? "2rem" : "3rem"};
            color: var(--color-primary);
            transition: font-size 0.28s ease;
        }
        .profile-name {
            font-size: 13px;
            font-weight: 700;
            color: #111;
            margin-top: 6px;
            white-space: nowrap;
            overflow: hidden;
        }
        .profile-role {
            font-size: 11px;
            font-weight: 600;
            text-transform: capitalize;
            color: var(--color-primary);
            background: #eef1ff;
            border-radius: 999px;
            padding: 2px 10px;
            margin-top: 4px;
            white-space: nowrap;
        }

        /* Divider */
        .divider {
            height: 1px;
            background: #e2e8f0;
            margin: 12px ${p => p.$collapsed ? "10px" : "16px"};
            transition: margin 0.28s ease;
        }

        /* Nav links */
        .content {
            flex: 1;
            position: sticky;
            top: 0;
        }

        /* Nav links styles (used by DashboardNavLinks) */
        .nav-links {
            display: flex;
            flex-direction: column;
            gap: 2px;
            padding: 4px 8px;
        }
        .nav-link {
            display: flex;
            align-items: center;
            gap: ${p => p.$collapsed ? "0" : "10px"};
            justify-content: ${p => p.$collapsed ? "center" : "flex-start"};
            color: #64748b;
            padding: ${p => p.$collapsed ? "10px 0" : "10px 12px"};
            border-radius: 10px;
            text-transform: capitalize;
            transition: all 0.25s ease;
            font-weight: 500;
            font-size: 14px;
            white-space: nowrap;
            overflow: hidden;
            position: relative;
        }
        .nav-link:hover {
            background: #f1f5f9;
            color: var(--color-primary);
        }
        .icon {
            font-size: 1.35rem;
            display: grid;
            place-items: center;
            flex-shrink: 0;
            transition: transform 0.15s;
        }
        .nav-link:hover .icon {
            transform: scale(1.1);
        }
        .link-text {
            overflow: hidden;
            max-width: ${p => p.$collapsed ? "0" : "160px"};
            opacity: ${p => p.$collapsed ? "0" : "1"};
            transition: max-width 0.28s ease, opacity 0.2s ease;
            display: inline-block;
        }
        .active {
            background: #eef1ff;
            color: var(--color-primary);
            font-weight: 700;
        }
        .active .icon {
            color: var(--color-primary);
        }

        /* Tooltip on collapsed */
        .nav-link[data-tooltip]:hover::after {
            content: attr(data-tooltip);
            position: absolute;
            left: calc(100% + 10px);
            top: 50%;
            transform: translateY(-50%);
            background: #1e293b;
            color: white;
            font-size: 12px;
            font-weight: 600;
            padding: 5px 10px;
            border-radius: 7px;
            white-space: nowrap;
            z-index: 999;
            pointer-events: none;
            display: block;
        }
    }
`;

export default LargeSidebar;
