import React, { useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import Swal from "sweetalert2";
import { useUserContext } from "../context/UserContext";

const API = "https://job-portal-jk38.onrender.com/api/v1";

const Login = () => {
    const { handleFetchMe } = useUserContext();
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [showForgot, setShowForgot] = useState(false);
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const res = await axios.post(`${API}/auth/login`, {
                foundation_id: data.foundation_id.trim().toUpperCase(),
                password: data.password,
            }, { withCredentials: true });
            Swal.fire({
                icon: "success", title: "Welcome! 🎉",
                text: res.data.message,
                timer: 1500, showConfirmButton: false,
            });
            handleFetchMe();
            reset();
            navigate("/dashboard");
        } catch (err) {
            Swal.fire({
                icon: "error", title: "Login Failed",
                text: err?.response?.data?.detail || "Something went wrong.",
            });
        }
        setIsLoading(false);
    };

    return (
        <>
            <Wrapper>
                {/* Left Panel */}
                <div className="left-panel">
                    <div className="left-blob lb1" />
                    <div className="left-blob lb2" />
                    <div className="left-content">
                        <div className="brand">
                            <img src="/src/assets/media/vglug-logo.png" alt="VGLUG" style={{ width: "32px", height: "32px", borderRadius: "50%", verticalAlign: "middle", marginRight: "8px" }} />
                            VGLUG Foundation
                        </div>
                        <h2>Internal Job Portal</h2>
                        <p>Exclusive access for verified VGLUG Foundation members. Connect, collaborate, and grow within the foundation ecosystem.</p>
                        <div className="features">
                            <div className="feat"><span>🔐</span><span>Foundation ID verified access</span></div>
                            <div className="feat"><span>💼</span><span>Internal jobs, internships & projects</span></div>
                            <div className="feat"><span>🎯</span><span>Smart skill-based job matching</span></div>
                            <div className="feat"><span>🛡️</span><span>Admin-controlled secure platform</span></div>
                        </div>
                    </div>
                </div>

                {/* Right Panel — Form */}
                <div className="right-panel">
                    <div className="form-card">
                        <div className="badge">
                            <img src="/src/assets/media/vglug-logo.png" alt="VGLUG" style={{ width: "18px", height: "18px", borderRadius: "50%", verticalAlign: "middle", marginRight: "5px" }} />
                            Member Login
                        </div>
                        <h1>Sign In</h1>
                        <p className="sub">Use your Foundation ID to access the portal</p>

                        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                            {/* Foundation ID */}
                            <div className="field">
                                <label>Foundation ID</label>
                                <div className="input-wrap">
                                    <span className="icon">🪪</span>
                                    <input
                                        type="text"
                                        placeholder="e.g. VGLUG-001"
                                        autoComplete="off"
                                        {...register("foundation_id", { required: "Foundation ID is required" })}
                                    />
                                </div>
                                {errors.foundation_id && <span className="err">⚠ {errors.foundation_id.message}</span>}
                            </div>

                            {/* Password */}
                            <div className="field">
                                <div className="label-row">
                                    <label>Password</label>
                                    <button type="button" className="forgot-link" onClick={() => setShowForgot(true)}>
                                        Forgot password?
                                    </button>
                                </div>
                                <div className="input-wrap">
                                    <span className="icon">🔒</span>
                                    <input
                                        type={showPass ? "text" : "password"}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        {...register("password", { required: "Password is required" })}
                                    />
                                    <button type="button" className="eye" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                                        {showPass ? "🙈" : "👁️"}
                                    </button>
                                </div>
                                {errors.password && <span className="err">⚠ {errors.password.message}</span>}
                            </div>

                            <button type="submit" className="btn" disabled={isLoading}>
                                {isLoading ? <><span className="spin" /> Signing in...</> : "Sign In →"}
                            </button>
                        </form>

                        <p className="register-link">
                            New member? <Link to="/register">Create an account →</Link>
                        </p>
                        <div className="notice">
                            🔒 Access restricted to VGLUG Foundation members only
                        </div>
                    </div>
                </div>
            </Wrapper>

            {/* Forgot Password Modal */}
            {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
        </>
    );
};

/* ── Forgot / Reset Password Modal ─────────────────────── */
const ForgotPasswordModal = ({ onClose }) => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const onReset = async (data) => {
        if (data.new_password !== data.confirm_password) {
            Swal.fire({ icon: "error", title: "Mismatch", text: "Passwords do not match." });
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post(`${API}/auth/reset-password`, {
                foundation_id: data.foundation_id.trim().toUpperCase(),
                email: data.email.trim(),
                new_password: data.new_password,
            });
            Swal.fire({ icon: "success", title: "Password Reset!", text: res.data.message, timer: 2000, showConfirmButton: false });
            onClose();
        } catch (err) {
            Swal.fire({ icon: "error", title: "Failed", text: err?.response?.data?.detail || "Something went wrong." });
        }
        setLoading(false);
    };

    return (
        <ModalOverlay onClick={(e) => e.target === e.currentTarget && onClose()}>
            <ModalCard>
                <div className="modal-header">
                    <h2>Reset Password</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>
                <p className="modal-sub">Enter your Foundation ID + registered email to set a new password</p>

                <form onSubmit={handleSubmit(onReset)}>
                    <div className="field">
                        <label>Foundation ID</label>
                        <input type="text" placeholder="e.g. VGLUG-001"
                            {...register("foundation_id", { required: "Foundation ID is required" })} />
                        {errors.foundation_id && <span className="err">{errors.foundation_id.message}</span>}
                    </div>

                    <div className="field">
                        <label>Registered Email <span className="hint">(for verification)</span></label>
                        <input type="email" placeholder="your@email.com"
                            {...register("email", { required: "Email is required" })} />
                        {errors.email && <span className="err">{errors.email.message}</span>}
                    </div>

                    <div className="field">
                        <label>New Password</label>
                        <div className="pw-wrap">
                            <input type={showNew ? "text" : "password"} placeholder="Min 8 characters"
                                {...register("new_password", {
                                    required: "New password is required",
                                    minLength: { value: 8, message: "Min 8 characters" }
                                })} />
                            <button type="button" className="eye" onClick={() => setShowNew(!showNew)}>{showNew ? "🙈" : "👁️"}</button>
                        </div>
                        {errors.new_password && <span className="err">{errors.new_password.message}</span>}
                    </div>

                    <div className="field">
                        <label>Confirm New Password</label>
                        <div className="pw-wrap">
                            <input type={showConfirm ? "text" : "password"} placeholder="Repeat password"
                                {...register("confirm_password", { required: "Please confirm password" })} />
                            <button type="button" className="eye" onClick={() => setShowConfirm(!showConfirm)}>{showConfirm ? "🙈" : "👁️"}</button>
                        </div>
                        {errors.confirm_password && <span className="err">{errors.confirm_password.message}</span>}
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>
            </ModalCard>
        </ModalOverlay>
    );
};

/* ── Styles ─────────────────────────────────────────────── */
const Wrapper = styled.div`
    width: 100%; min-height: 100vh; display: flex;

    .left-panel {
        flex: 1; position: relative; overflow: hidden;
        background: linear-gradient(145deg, #0a0f1e 0%, #111827 60%, #0f172a 100%);
        display: flex; align-items: center; justify-content: center; padding: 60px 50px;
    }
    @media (max-width: 768px) { .left-panel { display: none; } }

    .left-blob { position: absolute; border-radius: 50%; filter: blur(70px); pointer-events: none; }
    .lb1 { width: 360px; height: 360px; background: rgba(245,158,11,0.2); top: -80px; right: -80px; }
    .lb2 { width: 300px; height: 300px; background: rgba(16,185,129,0.1); bottom: -60px; left: -40px; }

    .left-content { position: relative; z-index: 1; max-width: 380px; }
    .brand { font-size: 18px; font-weight: 800; color: #f59e0b; margin-bottom: 28px; }
    .left-content h2 { font-size: 36px; font-weight: 900; color: #fff; letter-spacing: -1px; line-height: 1.1; margin-bottom: 16px; }
    .left-content > p { font-size: 15px; color: rgba(255,255,255,0.45); line-height: 1.7; margin-bottom: 32px; }
    .features { display: flex; flex-direction: column; gap: 14px; }
    .feat { display: flex; align-items: center; gap: 12px; font-size: 14px; color: rgba(255,255,255,0.7); font-weight: 500; }
    .feat > span:first-child { width: 36px; height: 36px; background: rgba(255,255,255,0.07); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }

    .right-panel {
        flex: 1; display: flex; align-items: center; justify-content: center;
        padding: 40px 24px; background: #f9faff;
    }
    .form-card { width: 100%; max-width: 420px; }

    .badge { display: inline-block; background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.3); color: #d97706; font-size: 13px; font-weight: 700; padding: 5px 16px; border-radius: 999px; margin-bottom: 16px; }
    h1 { font-size: 28px; font-weight: 900; color: #111; letter-spacing: -0.5px; margin-bottom: 6px; }
    .sub { font-size: 13.5px; color: #6b7280; margin-bottom: 28px; }

    form { display: flex; flex-direction: column; gap: 18px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field label { font-size: 13px; font-weight: 700; color: #374151; }
    .label-row { display: flex; justify-content: space-between; align-items: center; }

    .forgot-link {
        background: none; border: none; cursor: pointer;
        font-size: 12.5px; font-weight: 600; color: #d97706;
        padding: 0; transition: 0.2s;
    }
    .forgot-link:hover { text-decoration: underline; color: #b45309; }

    .input-wrap {
        display: flex; align-items: center;
        background: white; border: 1.5px solid #e5e7eb;
        border-radius: 12px; overflow: hidden;
        transition: 0.2s; box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    .input-wrap:focus-within { border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,0.12); }
    .icon { padding: 0 12px; font-size: 16px; }
    .input-wrap input { flex: 1; padding: 12px 12px 12px 0; border: none; outline: none; font-size: 14px; font-weight: 500; color: #111; background: transparent; font-family: inherit; }
    .input-wrap input::placeholder { color: #9ca3af; font-weight: 400; }
    .eye { background: none; border: none; padding: 0 12px; cursor: pointer; font-size: 16px; opacity: 0.6; transition: 0.2s; }
    .eye:hover { opacity: 1; }
    .err { font-size: 12px; font-weight: 600; color: #ef4444; }

    .btn {
        width: 100%; padding: 14px; font-size: 15px; font-weight: 700;
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: white; border: none; border-radius: 12px;
        cursor: pointer; transition: 0.25s; margin-top: 4px;
        display: flex; align-items: center; justify-content: center; gap: 8px;
        font-family: inherit; box-shadow: 0 4px 18px rgba(245,158,11,0.35);
    }
    .btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(245,158,11,0.45); }
    .btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
    .spin { width: 15px; height: 15px; border: 2px solid rgba(255,255,255,0.35); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .register-link { text-align: center; font-size: 13px; color: #6b7280; margin-top: 20px; }
    .register-link a { color: #d97706; font-weight: 700; }
    .register-link a:hover { text-decoration: underline; }

    .notice { margin-top: 18px; background: rgba(245,158,11,0.06); border: 1px solid rgba(245,158,11,0.2); border-radius: 10px; padding: 12px; font-size: 12px; color: #92400e; text-align: center; line-height: 1.5; }
`;

const ModalOverlay = styled.div`
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; padding: 20px;
    animation: fadeIn 0.2s ease;
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
`;

const ModalCard = styled.div`
    background: #fff; border-radius: 20px;
    padding: 36px 40px; width: 100%; max-width: 440px;
    box-shadow: 0 24px 60px rgba(0,0,0,0.22);
    animation: slideUp 0.25s ease;
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .modal-header h2 { font-size: 22px; font-weight: 800; color: #111; }
    .close-btn { background: none; border: none; font-size: 18px; cursor: pointer; color: #6b7280; padding: 4px 8px; border-radius: 6px; transition: 0.15s; }
    .close-btn:hover { background: #f3f4f6; color: #111; }
    .modal-sub { font-size: 13px; color: #6b7280; margin-bottom: 24px; }

    form { display: flex; flex-direction: column; gap: 16px; }
    .field { display: flex; flex-direction: column; gap: 5px; }
    .field label { font-size: 12.5px; font-weight: 700; color: #374151; }
    .hint { font-size: 11px; font-weight: 400; color: #9ca3af; margin-left: 4px; }
    .field input {
        padding: 11px 14px; border: 1.5px solid #e5e7eb;
        border-radius: 10px; font-size: 14px; color: #111;
        outline: none; transition: 0.2s; font-family: inherit;
    }
    .field input:focus { border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,0.1); }
    .pw-wrap { display: flex; align-items: center; border: 1.5px solid #e5e7eb; border-radius: 10px; overflow: hidden; transition: 0.2s; }
    .pw-wrap:focus-within { border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,0.1); }
    .pw-wrap input { flex: 1; padding: 11px 12px; border: none; outline: none; font-size: 14px; color: #111; font-family: inherit; }
    .eye { background: none; border: none; padding: 0 12px; cursor: pointer; font-size: 15px; opacity: 0.55; }
    .eye:hover { opacity: 1; }
    .err { font-size: 11.5px; color: #ef4444; font-weight: 600; }

    .submit-btn {
        width: 100%; padding: 13px; border: none; border-radius: 12px;
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: #fff; font-size: 15px; font-weight: 700;
        cursor: pointer; transition: 0.25s; font-family: inherit;
        box-shadow: 0 4px 16px rgba(245,158,11,0.3); margin-top: 4px;
    }
    .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 22px rgba(245,158,11,0.4); }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
`;

export default Login;
