import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import Swal from "sweetalert2";
import styled from "styled-components";

const API = "http://localhost:8000/api/v1";

const Register = () => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        if (data.password !== data.confirmPassword) {
            Swal.fire({ icon: "error", title: "Error", text: "Passwords do not match." });
            return;
        }
        setIsLoading(true);
        try {
            const res = await axios.post(`${API}/auth/register`, {
                username: data.username,
                foundation_id: data.foundation_id,
                email: data.email,
                password: data.password,
                role: data.role,
            }, { withCredentials: true });
            Swal.fire({ icon: "success", title: "Registered!", text: res.data.message });
            reset();
            navigate("/login");
        } catch (err) {
            Swal.fire({ icon: "error", title: "Oops!", text: err?.response?.data?.detail || "Registration failed." });
        }
        setIsLoading(false);
    };

    return (
        <Wrapper>
            <div className="container">
                <div className="logo-wrap">
                    <img src="/src/assets/media/vglug-logo.png" alt="VGLUG Foundation" style={{ width: "40px", height: "40px", borderRadius: "50%" }} />
                    <span className="logo-text">VGLUG Foundation</span>
                </div>
                <h1>Create Account</h1>
                <p className="sub">Exclusive access for Foundation members only</p>

                <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                    {/* Username */}
                    <div className="field">
                        <label>Full Name</label>
                        <input type="text" placeholder="Your full name"
                            {...register("username", { required: "Name is required", minLength: { value: 3, message: "Min 3 characters" } })} />
                        {errors.username && <span className="err">{errors.username.message}</span>}
                    </div>

                    {/* Foundation ID */}
                    <div className="field">
                        <label>Foundation ID <span className="badge">🔐 Required</span></label>
                        <input type="text" placeholder="e.g. VGLUG-001"
                            {...register("foundation_id", { required: "Foundation ID is required" })} />
                        {errors.foundation_id && <span className="err">{errors.foundation_id.message}</span>}
                    </div>

                    {/* Email */}
                    <div className="field">
                        <label>Email</label>
                        <input type="email" placeholder="your@email.com"
                            {...register("email", { required: "Email is required" })} />
                        {errors.email && <span className="err">{errors.email.message}</span>}
                    </div>

                    {/* Role */}
                    <div className="field">
                        <label>Register As</label>
                        <select {...register("role", { required: true })}>
                            <option value="user">👨‍💻 Member (Job Seeker)</option>
                            <option value="recruiter">🧑‍💼 Recruiter / Project Lead</option>
                        </select>
                    </div>

                    {/* Password */}
                    <div className="field">
                        <label>Password</label>
                        <input type="password" placeholder="Min 8 chars, 1 uppercase, 1 number"
                            {...register("password", {
                                required: "Password is required",
                                minLength: { value: 8, message: "Min 8 characters" },
                                pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/, message: "Needs uppercase, lowercase & number" }
                            })} />
                        {errors.password && <span className="err">{errors.password.message}</span>}
                    </div>

                    {/* Confirm Password */}
                    <div className="field">
                        <label>Confirm Password</label>
                        <input type="password" placeholder="Repeat password"
                            {...register("confirmPassword", { required: "Please confirm password" })} />
                        {errors.confirmPassword && <span className="err">{errors.confirmPassword.message}</span>}
                    </div>

                    <button type="submit" disabled={isLoading} className="btn">
                        {isLoading ? "Registering..." : "Create Account"}
                    </button>
                </form>

                <p className="footer-link">
                    Already have an account? <Link to="/login">Login now</Link>
                </p>
                <div className="notice">
                    ⚠️ You need a valid VGLUG Foundation ID to register. Contact admin if you don't have one.
                </div>
            </div>
        </Wrapper>
    );
};

const Wrapper = styled.div`
    min-height: 100vh;
    background: linear-gradient(135deg, #0a0f1e 0%, #0f172a 100%);
    display: flex; justify-content: center; align-items: center; padding: 40px 20px;

    .container {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 20px;
        padding: 48px 44px;
        width: 100%; max-width: 420px;
        backdrop-filter: blur(12px);
    }
    .logo-wrap { display:flex; align-items:center; gap:10px; justify-content:center; margin-bottom:20px; }
    .logo-icon { font-size:32px; }
    .logo-text { font-size:18px; font-weight:800; color:#f59e0b; }
    h1 { text-align:center; font-size:22px; font-weight:800; color:#fff; margin-bottom:4px; }
    .sub { text-align:center; font-size:12px; color:rgba(255,255,255,0.4); margin-bottom:28px; }

    .field { display:flex; flex-direction:column; gap:5px; margin-bottom:18px; }
    .field label { font-size:12px; font-weight:600; color:rgba(255,255,255,0.65); display:flex; align-items:center; gap:8px; }
    .badge { background:rgba(245,158,11,0.2); color:#fcd34d; border:1px solid rgba(245,158,11,0.35); border-radius:999px; padding:1px 8px; font-size:10px; }
    .field input, .field select {
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 10px; padding: 11px 14px;
        color: #fff; font-size: 13px;
        transition: 0.2s;
    }
    .field input::placeholder { color: rgba(255,255,255,0.3); }
    .field input:focus, .field select:focus { outline:none; border-color: rgba(245,158,11,0.6); background: rgba(255,255,255,0.08); }
    .field select option { background: #1e293b; color: #fff; }
    .err { font-size:11px; color:#f87171; }

    .btn {
        width:100%; padding:13px; border:none; border-radius:12px;
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color:#fff; font-size:15px; font-weight:700; cursor:pointer;
        margin-top:8px; transition:0.25s;
    }
    .btn:hover { transform:translateY(-1px); box-shadow:0 8px 24px rgba(245,158,11,0.35); }
    .btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }

    .footer-link { text-align:center; font-size:12px; color:rgba(255,255,255,0.4); margin-top:18px; }
    .footer-link a { color:#f59e0b; font-weight:600; }

    .notice { margin-top:18px; background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.2); border-radius:10px; padding:12px; font-size:11.5px; color:rgba(245,158,11,0.8); text-align:center; line-height:1.5; }
`;

export default Register;
