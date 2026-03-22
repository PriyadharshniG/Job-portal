import styled from "styled-components";

const Wrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    max-width: 1280px;
    margin: 0 auto;
    padding: calc(2rem + 2vh) calc(1.5rem + 2vw);
    position: relative;

    /* Decorative background blobs */
    &::before {
        content: '';
        position: fixed;
        top: -10%;
        right: -5%;
        width: 500px;
        height: 500px;
        background: radial-gradient(circle, rgba(79,110,247,0.12) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 0;
    }
    &::after {
        content: '';
        position: fixed;
        bottom: 10%;
        left: -5%;
        width: 400px;
        height: 400px;
        background: radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 0;
    }

    .hero-content {
        width: 100%;
        display: grid;
        grid-template-columns: minmax(auto, 580px) minmax(auto, 480px);
        justify-content: space-between;
        align-items: center;
        gap: 3rem;
        position: relative;
        z-index: 1;
    }

    .text-content {
        display: flex;
        flex-direction: column;
        gap: 0;
    }

    .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(79, 110, 247, 0.1);
        border: 1px solid rgba(79, 110, 247, 0.25);
        color: var(--color-primary);
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 1.2px;
        text-transform: uppercase;
        padding: 6px 14px;
        border-radius: var(--radius-full);
        margin-bottom: 1.4rem;
        width: fit-content;
    }
    .eyebrow-dot {
        width: 6px;
        height: 6px;
        background: var(--color-primary);
        border-radius: 50%;
        animation: pulse-dot 2s ease-in-out infinite;
    }

    @keyframes pulse-dot {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(0.7); }
    }

    h1 {
        font-size: clamp(2rem, 3.5vw, 3.5rem);
        font-weight: 800;
        letter-spacing: -1px;
        line-height: 1.15;
        color: var(--color-black);
        margin-bottom: 1.5rem;
    }
    h1 .fancy {
        background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .hero-desc {
        font-size: clamp(0.95rem, 1.2vw, 1.1rem);
        font-weight: 400;
        line-height: 1.8;
        color: var(--color-text-light);
        margin-bottom: 2.5rem;
        max-width: 480px;
    }

    .stats-row {
        display: flex;
        gap: 2rem;
        margin-bottom: 2.5rem;
        flex-wrap: wrap;
    }

    .stat-item {
        display: flex;
        flex-direction: column;
    }
    .stat-number {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--color-black);
        line-height: 1;
    }
    .stat-label {
        font-size: 0.75rem;
        color: var(--color-muted);
        font-weight: 500;
        margin-top: 4px;
    }

    .btn-grp {
        display: flex;
        flex-wrap: wrap;
        justify-content: start;
        align-items: center;
        gap: 1rem;
    }

    .btn {
        text-decoration: none;
        text-transform: capitalize;
        font-weight: 600;
        font-size: 1rem;
        color: var(--color-white);
        background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
        border: none;
        padding: 14px 32px;
        border-radius: var(--radius-full);
        transition: var(--transition);
        box-shadow: var(--shadow-primary);
        position: relative;
        overflow: hidden;
    }
    .btn::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
        opacity: 0;
        transition: var(--transition);
    }
    .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 30px rgba(79, 110, 247, 0.5);
    }
    .btn:hover::before { opacity: 1; }
    .btn:active { transform: translateY(0); }

    .btn-secondary {
        text-decoration: none;
        font-weight: 600;
        font-size: 1rem;
        color: var(--color-text);
        background: transparent;
        border: 1.5px solid var(--color-border);
        padding: 13px 28px;
        border-radius: var(--radius-full);
        transition: var(--transition);
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .btn-secondary:hover {
        border-color: var(--color-primary);
        color: var(--color-primary);
        background: rgba(79,110,247,0.05);
    }

    /* Hero Image */
    .placeholder {
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
    }
    .img-card {
        position: relative;
        border-radius: var(--radius-xl);
        overflow: hidden;
        box-shadow: var(--shadow-xl);
        background: linear-gradient(145deg, #e0e7ff, #f0f4ff);
    }
    .img-card::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(79,110,247,0.08), rgba(139,92,246,0.08));
        z-index: 1;
        pointer-events: none;
    }
    .placeholder img {
        width: 100%;
        max-width: 480px;
        object-fit: cover;
        border-radius: var(--radius-xl);
        display: block;
        transition: var(--transition-slow);
    }
    .placeholder img:hover { transform: scale(1.02); }

    /* Floating badge */
    .float-badge {
        position: absolute;
        bottom: -16px;
        left: -16px;
        background: white;
        border-radius: var(--radius-lg);
        padding: 14px 20px;
        box-shadow: var(--shadow-lg);
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 10;
        min-width: 180px;
        animation: float 3s ease-in-out infinite;
    }
    .float-badge-2 {
        position: absolute;
        top: -14px;
        right: -14px;
        background: white;
        border-radius: var(--radius-lg);
        padding: 12px 18px;
        box-shadow: var(--shadow-lg);
        z-index: 10;
        animation: float 3.5s ease-in-out infinite reverse;
    }
    @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
    }
    .badge-icon {
        width: 36px; height: 36px;
        background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
        border-radius: var(--radius-sm);
        display: flex; align-items: center; justify-content: center;
        font-size: 18px;
    }
    .badge-info { display: flex; flex-direction: column; gap: 2px; }
    .badge-num { font-size: 16px; font-weight: 800; color: var(--color-black); line-height: 1; }
    .badge-text { font-size: 11px; color: var(--color-muted); font-weight: 500; }

    @media screen and (max-width: 900px) {
        .hero-content {
            grid-template-columns: 1fr;
            gap: 2rem;
        }
        .placeholder { order: -1; }
        .placeholder img { max-width: 100%; }
        .float-badge { display: none; }
        .float-badge-2 { display: none; }
    }

    @media screen and (max-width: 600px) {
        padding: 1.5rem 1rem;
        h1 { font-size: 2rem; }
        .stats-row { gap: 1.5rem; }
        .btn-grp { flex-direction: column; align-items: flex-start; }
        .btn, .btn-secondary { width: 100%; text-align: center; justify-content: center; }
    }
`;

export default Wrapper;
