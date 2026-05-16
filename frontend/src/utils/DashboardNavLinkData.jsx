import React from "react";

import { IoIosStats } from "react-icons/io";
import { RiMenuAddFill } from "react-icons/ri";
import { FiUser, FiGithub, FiAward, FiFolder, FiStar, FiSearch, FiZap } from "react-icons/fi";
import { FaUserShield } from "react-icons/fa";
import { MdManageAccounts } from "react-icons/md";
import { FaBriefcase } from "react-icons/fa";
import { FaUsers } from "react-icons/fa6";

const AdminLinks = [
    {
        text: "profile",
        path: ".",
        icon: <FiUser />,
    },
    {
        text: "stats",
        path: "stats",
        icon: <IoIosStats />,
    },
    {
        text: "admin",
        path: "admin",
        icon: <FaUserShield />,
    },
    {
        text: "manage users",
        path: "manage-users",
        icon: <FaUsers />,
    },
];

const RecruiterLinks = [
    {
        text: "profile",
        path: ".",
        icon: <FiUser />,
    },
    {
        text: "add job",
        path: "add-jobs",
        icon: <RiMenuAddFill />,
    },
    {
        text: "manage jobs",
        path: "manage-jobs",
        icon: <MdManageAccounts />,
    },
    {
        text: "Applications",
        path: "my-jobs",
        icon: <FaBriefcase />,
    },
    {
        text: "Search Candidates",
        path: "candidate-search",
        icon: <FiSearch />,
    },
    {
        text: "Screening Q's",
        path: "screening-questions",
        icon: <FiZap />,
    },
];

const UserLinks = [
    {
        text: "profile",
        path: ".",
        icon: <FiUser />,
    },
    {
        text: "My Skills",
        path: "skills",
        icon: <FiStar />,
    },
    {
        text: "GitHub",
        path: "github",
        icon: <FiGithub />,
    },
    {
        text: "Certifications",
        path: "certifications",
        icon: <FiAward />,
    },
    {
        text: "Projects",
        path: "projects",
        icon: <FiFolder />,
    },
    {
        text: "My Applications",
        path: "my-jobs",
        icon: <FaBriefcase />,
    },
];

export { AdminLinks, RecruiterLinks, UserLinks };
