import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import styled from "styled-components";
import LoadingComTwo from "../components/shared/LoadingComTwo";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";

const API = "http://localhost:8000/api/v1";

const COLORS = ["#4f6ef7", "#8b5cf6", "#14b8a6", "#10b981", "#f97316", "#22c55e", "#6366f1", "#f59e0b"];

const Stats = () => {
    const { isPending, isError, data, error } = useQuery({
        queryKey: ["stats"],
        queryFn: async () => {
            const res = await axios.get(`${API}/admin/stats`, { withCredentials: true });
            return res.data?.result;
        },
    });

    if (isPending) return <LoadingComTwo />;
    if (isError) return <h2 style={{ textAlign: "center", color: "#ef4444", marginTop: "2rem" }}>{error?.message}</h2>;

    const s = data || {};

    const roleData = [
        { name: "Admins",     value: s.admins     || 0 },
        { name: "Recruiters", value: s.recruiters  || 0 },
        { name: "Members",    value: s.members     || 0 },
    ];

    const appStatusData = [
        { name: "Pending",   value: s.pending_apps   || 0 },
        { name: "Interview", value: s.interview_apps || 0 },
        { name: "Admitted",  value: s.accepted_apps  || 0 },
        { name: "Declined",  value: s.declined_apps  || 0 },
    ];

    const statCards = [
        { label: "Total Members",      value: s.total_users,        color: "#4f6ef7", icon: "👥" },
        { label: "Admins",             value: s.admins,             color: "#8b5cf6", icon: "🛡️" },
        { label: "Recruiters",         value: s.recruiters,         color: "#14b8a6", icon: "🧑‍💼" },
        { label: "Job Seekers",        value: s.members,            color: "#10b981", icon: "👨‍💻" },
        { label: "Total Jobs",         value: s.total_jobs,         color: "#f97316", icon: "💼" },
        { label: "Open Jobs",          value: s.open_jobs,          color: "#22c55e", icon: "🟢" },
        { label: "Total Applications", value: s.total_applications, color: "#6366f1", icon: "📋" },
        { label: "Pending Review",     value: s.pending_apps,       color: "#f59e0b", icon: "⏳" },
        { label: "Interviews",         value: s.interview_apps,     color: "#3b82f6", icon: "🎙️" },
        { label: "Admitted",           value: s.accepted_apps,      color: "#10b981", icon: "✅" },
        { label: "Declined",           value: s.declined_apps,      color: "#ef4444", icon: "❌" },
        { label: "Foundation IDs",     value: s.foundation_ids_count, color: "#a855f7", icon: "🪪" },
    ];

    const RADIAN = Math.PI / 180;
    const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const r = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + r * Math.cos(-midAngle * RADIAN);
        const y = cy + r * Math.sin(-midAngle * RADIAN);
        return percent > 0 ? (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        ) : null;
    };

    return (
        <Wrapper>
            <div className="page-header">
                <h2>📊 Dashboard Statistics</h2>
                <p>Real-time overview of VGLUG Foundation portal activity</p>
            </div>

            {/* Stats Grid */}
            <div className="stat-grid">
                {statCards.map(c => (
                    <div className="stat-card" key={c.label} style={{ borderLeftColor: c.color }}>
                        <div className="stat-icon">{c.icon}</div>
                        <div className="stat-num" style={{ color: c.color }}>{c.value ?? 0}</div>
                        <div className="stat-label">{c.label}</div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="charts-row">
                {/* Role Distribution Pie */}
                <div className="chart-box">
                    <h3>👤 Member Role Distribution</h3>
                    <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                            <Pie
                                data={roleData}
                                cx="50%" cy="50%"
                                outerRadius={90}
                                labelLine={false}
                                label={renderLabel}
                                dataKey="value"
                            >
                                {roleData.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Legend />
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Application Status Bar */}
                <div className="chart-box">
                    <h3>📋 Application Status Breakdown</h3>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={appStatusData} barSize={36}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                {appStatusData.map((_, i) => (
                                    <Cell key={i} fill={["#f59e0b", "#3b82f6", "#10b981", "#ef4444"][i]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Wrapper>
    );
};

const Wrapper = styled.section`
    padding: 8px 0 40px;

    .page-header { margin-bottom: 24px; }
    .page-header h2 { font-size: 22px; font-weight: 800; color: #111; }
    .page-header p  { font-size: 13px; color: #6b7280; margin-top: 4px; }

    .stat-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 14px;
        margin-bottom: 32px;
    }
    @media (max-width: 900px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 500px) { .stat-grid { grid-template-columns: 1fr 1fr; } }

    .stat-card {
        background: white;
        border: 1px solid #f0f0f0;
        border-left: 4px solid;
        border-radius: 14px;
        padding: 18px;
        transition: 0.25s;
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        cursor: default;
    }
    .stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
    .stat-icon { font-size: 24px; margin-bottom: 8px; }
    .stat-num  { font-size: 32px; font-weight: 900; line-height: 1; margin-bottom: 6px; }
    .stat-label { font-size: 12px; color: #6b7280; font-weight: 500; }

    .charts-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }
    @media (max-width: 768px) { .charts-row { grid-template-columns: 1fr; } }

    .chart-box {
        background: white;
        border: 1px solid #f0f0f0;
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .chart-box h3 { font-size: 15px; font-weight: 700; color: #111; margin-bottom: 16px; }
`;

export default Stats;
