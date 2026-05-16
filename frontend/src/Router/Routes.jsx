import { createBrowserRouter } from "react-router-dom";
import HomeLayout from "../Layout/HomeLayout";
import DashboardLayout from "../Layout/DashboardLayout";

import {
    Register, Login, Landing, Error,
    AllJobs, Stats, Profile, StudentProfile, Admin,
    EditJob, AddJob, ManageJobs, Job, MyJobs,
    EditProfile, ManageUsers,
    SkillsManager, GitHubConnect, Certifications, Projects,
    CandidateSearch, ScreeningQuestions,
} from "../pages";

import { JobContext } from "../context/JobContext";
import CommonProtectRoute from "../components/shared/CommonProtectRoute";
import ProtectAdminRoute from "../components/shared/ProtectAdminRoute";
import RecruiterRoute from "../components/shared/RecruiterRoute";

const router = createBrowserRouter([
    {
        path: "/",
        element: <HomeLayout />,
        errorElement: <Error />,
        children: [
            { index: true, element: <Landing /> },
            {
                path: "all-jobs",
                element: <JobContext><AllJobs /></JobContext>,
            },
            {
                path: "job/:id",
                element: <JobContext><Job /></JobContext>,
            },
            { path: "register", element: <Register /> },
            { path: "login",    element: <Login /> },
            {
                path: "dashboard",
                element: (
                    <CommonProtectRoute>
                        <JobContext>
                            <DashboardLayout />
                        </JobContext>
                    </CommonProtectRoute>
                ),
                children: [
                    // ── Default home (student profile) ──
                    { index: true, element: <StudentProfile /> },

                    // ── Shared ──
                    { path: "edit-profile/:id", element: <EditProfile /> },

                    // ── Student / User routes ──
                    { path: "skills",         element: <CommonProtectRoute><SkillsManager /></CommonProtectRoute> },
                    { path: "github",         element: <CommonProtectRoute><GitHubConnect /></CommonProtectRoute> },
                    { path: "certifications", element: <CommonProtectRoute><Certifications /></CommonProtectRoute> },
                    { path: "projects",       element: <CommonProtectRoute><Projects /></CommonProtectRoute> },
                    { path: "my-jobs",        element: <CommonProtectRoute><MyJobs /></CommonProtectRoute> },

                    // ── Recruiter routes ──
                    { path: "add-jobs",              element: <RecruiterRoute><AddJob /></RecruiterRoute> },
                    { path: "manage-jobs",           element: <RecruiterRoute><ManageJobs /></RecruiterRoute> },
                    { path: "edit-job/:id",          element: <RecruiterRoute><EditJob /></RecruiterRoute> },
                    {
                        path: "candidate-search",
                        element: <RecruiterRoute><CandidateSearch /></RecruiterRoute>,
                    },
                    {
                        path: "screening-questions",
                        element: <RecruiterRoute><ScreeningQuestions /></RecruiterRoute>,
                    },

                    // ── Admin routes ──
                    { path: "stats",        element: <ProtectAdminRoute><Stats /></ProtectAdminRoute> },
                    { path: "manage-users", element: <ProtectAdminRoute><ManageUsers /></ProtectAdminRoute> },
                    { path: "admin",        element: <ProtectAdminRoute><Admin /></ProtectAdminRoute> },
                ],
            },
        ],
    },
]);

export default router;
