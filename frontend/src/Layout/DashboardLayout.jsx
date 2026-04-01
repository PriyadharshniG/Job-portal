import React, { createContext, useContext, useState } from "react";
import Wrapper from "../assets/css/wrappers/Dashboard";
import { Outlet } from "react-router-dom";

import { SmallSidebar, LargeSidebar, DashboardNavbar } from "../components";
import Swal from "sweetalert2";
import { useUserContext } from "../context/UserContext";
import axios from "axios";

const DashboardContext = createContext();

const DashboardLayout = () => {
    const { handleFetchMe, user } = useUserContext();
    const [showSidebar, setShowSidebar] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const handleLogout = async () => {
        // Step 1 — Show confirmation popup
        const result = await Swal.fire({
            title: "Logout?",
            text: "Are you sure you want to log out?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#f59e0b",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, Logout",
            cancelButtonText: "Cancel",
        });

        // Step 2 — If user clicked "Yes, Logout"
        if (result.isConfirmed) {
            try {
                const response = await axios.post(
                    "http://localhost:8000/api/v1/auth/logout",
                    {},
                    { withCredentials: true }
                );
                Swal.fire({
                    icon: "success",
                    title: "Logged Out!",
                    text: response?.data?.message || "You have been logged out.",
                    timer: 1500,
                    showConfirmButton: false,
                });
                handleFetchMe();
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: error?.response?.data?.detail || "Logout failed. Try again.",
                });
            }
        }
    };

    // passing values
    const values = { handleLogout, showSidebar, setShowSidebar, sidebarCollapsed, setSidebarCollapsed };
    return (
        <DashboardContext.Provider value={values}>
            <Wrapper>
                <main className="dashboard">
                    <SmallSidebar />
                    <LargeSidebar />
                    <div className="">
                        <DashboardNavbar />
                        <div className="dashboard-page">
                            <Outlet />
                        </div>
                    </div>
                </main>
            </Wrapper>
        </DashboardContext.Provider>
    );
};

export const useDashboardContext = () => useContext(DashboardContext);
export default DashboardLayout;
