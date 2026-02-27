import { useState, useRef, useEffect, useCallback } from "react";

// ─── Inline styles as CSS-in-JS (no external deps beyond React) ────────────────
const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');
`;

const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:         #060B18;
    --bg2:        #0A1628;
    --glass:      rgba(255,255,255,0.04);
    --glass-hover:rgba(255,255,255,0.07);
    --border:     rgba(80,180,255,0.12);
    --border-hover:rgba(80,180,255,0.28);
    --blue:       #0078D4;
    --blue-light: #1A9AFF;
    --cyan:       #50D9FF;
    --cyan-dim:   rgba(80,217,255,0.15);
    --indigo:     #6366F1;
    --text:       #E8F0FF;
    --text-dim:   #7A8FA8;
    --text-muted: #3D5068;
    --success:    #22D3A0;
    --warn:       #F59E0B;
    --danger:     #F43F5E;
    --radius:     16px;
    --radius-sm:  10px;
    --font-head:  'Syne', sans-serif;
    --font-mono:  'JetBrains Mono', monospace;
  }

  html, body, #root {
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-head);
    overflow-x: hidden;
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }

  /* Mesh gradient background */
  .mesh-bg {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 80% 60% at 10% 0%, rgba(0,120,212,0.18) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 90% 10%, rgba(99,102,241,0.12) 0%, transparent 55%),
      radial-gradient(ellipse 50% 70% at 50% 100%, rgba(80,217,255,0.08) 0%, transparent 60%),
      var(--bg);
    animation: meshShift 14s ease-in-out infinite alternate;
  }
  @keyframes meshShift {
    0%   { filter: hue-rotate(0deg) brightness(1); }
    100% { filter: hue-rotate(12deg) brightness(1.04); }
  }

  /* Grid overlay */
  .grid-overlay {
    position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0.025;
    background-image:
      linear-gradient(rgba(80,217,255,1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(80,217,255,1) 1px, transparent 1px);
    background-size: 60px 60px;
  }

  /* Glass card */
  .card {
    background: var(--glass);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    transition: border-color .25s, background .25s, transform .2s;
  }
  .card:hover { border-color: var(--border-hover); }

  /* Animations */
  @keyframes fadeUp {
    from { opacity:0; transform: translateY(24px); }
    to   { opacity:1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity:0; } to { opacity:1; }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(1);    opacity:.6; }
    100% { transform: scale(1.55); opacity:0;  }
  }
  @keyframes scan-line {
    0%   { top: 0%; }
    100% { top: 100%; }
  }
  @keyframes wave {
    0%, 100% { transform: scaleY(0.3); }
    50%       { transform: scaleY(1);   }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes slideIn {
    from { opacity:0; transform: translateX(-16px); }
    to   { opacity:1; transform: translateX(0); }
  }
  @keyframes countUp {
    from { opacity:0; transform: scale(0.8); }
    to   { opacity:1; transform: scale(1); }
  }

  .animate-fadeUp { animation: fadeUp .5s cubic-bezier(.16,1,.3,1) both; }
  .animate-fadeIn { animation: fadeIn .4s ease both; }

  /* Upload zone */
  .upload-zone {
    border: 2px dashed var(--border);
    border-radius: var(--radius);
    cursor: pointer;
    transition: all .25s;
    position: relative;
    overflow: hidden;
  }
  .upload-zone:hover, .upload-zone.drag-over {
    border-color: var(--cyan);
    background: rgba(80,217,255,0.04);
    transform: scale(1.005);
  }
  .upload-zone.has-file {
    border-style: solid;
    border-color: var(--blue-light);
    background: rgba(0,120,212,0.06);
  }

  /* Button */
  .btn-primary {
    background: linear-gradient(135deg, var(--blue) 0%, var(--blue-light) 60%, var(--cyan) 100%);
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    font-family: var(--font-head);
    font-weight: 700;
    font-size: 15px;
    letter-spacing: .5px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: opacity .2s, transform .15s, box-shadow .2s;
    box-shadow: 0 0 28px rgba(0,120,212,0.35);
  }
  .btn-primary::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(rgba(255,255,255,0.15), transparent);
    opacity: 0;
    transition: opacity .2s;
  }
  .btn-primary:hover::after { opacity: 1; }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 0 40px rgba(0,150,255,0.5); }
  .btn-primary:active { transform: translateY(0); }
  .btn-primary:disabled {
    opacity: .45;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  /* Select */
  .select-field {
    background: var(--glass);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text);
    font-family: var(--font-head);
    font-size: 14px;
    transition: border-color .2s;
    appearance: none;
    cursor: pointer;
  }
  .select-field:focus { outline: none; border-color: var(--blue-light); }
  .select-field option { background: #0A1628; }

  /* Progress / shimmer */
  .shimmer-text {
    background: linear-gradient(90deg, var(--text-dim) 25%, var(--cyan) 50%, var(--text-dim) 75%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 2s linear infinite;
  }

  /* Tag pill */
  .tag {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px;
    border-radius: 99px;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: .3px;
  }

  /* Transcription */
  .transcription-text {
    font-family: var(--font-mono);
    font-size: 13px;
    line-height: 1.9;
    color: var(--text-dim);
    white-space: pre-wrap;
    word-break: break-word;
  }
`;

// ─── SVG Logo ──────────────────────────────────────────────────────────────────
function AzurelyLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#50D9FF" />
          <stop offset="1" stopColor="#0078D4" />
        </linearGradient>
      </defs>
      {/* Cloud arc */}
      <path d="M8 26C4.686 26 2 23.314 2 20C2 17.05 4.12 14.6 6.96 14.1C7.44 10.15 10.85 7 15 7C17.6 7 19.9 8.22 21.4 10.1C22.25 9.4 23.35 9 24.5 9C27.54 9 30 11.46 30 14.5C30 14.67 29.99 14.83 29.97 15H30C33.31 15 36 17.69 36 21C36 24.31 33.31 27 30 27H8V26Z"
        fill="url(#lg1)" opacity="0.9" />
      {/* Waveform bars */}
      <rect x="13" y="30" width="3" height="8" rx="1.5" fill="#50D9FF" opacity="0.9" />
      <rect x="18.5" y="27" width="3" height="14" rx="1.5" fill="#1A9AFF" />
      <rect x="24" y="31" width="3" height="6" rx="1.5" fill="#50D9FF" opacity="0.7" />
      <rect x="7.5" y="32" width="3" height="4" rx="1.5" fill="#50D9FF" opacity="0.5" />
      <rect x="29" y="32" width="3" height="4" rx="1.5" fill="#50D9FF" opacity="0.5" />
    </svg>
  );
}

// ─── Waveform animation (processing state) ────────────────────────────────────
function WaveformVisualizer({ active }) {
  const bars = Array.from({ length: 28 });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: 48 }}>
      {bars.map((_, i) => (
        <div
          key={i}
          style={{
            width: 3,
            borderRadius: 2,
            background: `linear-gradient(to top, #0078D4, #50D9FF)`,
            height: "100%",
            transform: "scaleY(0.2)",
            transformOrigin: "center",
            animation: active ? `wave ${0.6 + (i % 5) * 0.12}s ease-in-out ${(i * 0.045) % 0.6}s infinite alternate` : "none",
            transition: "transform .3s",
            opacity: active ? 1 : 0.3,
          }}
        />
      ))}
    </div>
  );
}

// ─── Stat badge ───────────────────────────────────────────────────────────────
function StatBadge({ label, value, color = "var(--cyan)" }) {
  return (
    <div className="card" style={{ padding: "12px 18px", display: "flex", flexDirection: "column", gap: 3, minWidth: 110 }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>{label}</span>
      <span style={{ fontSize: 18, fontWeight: 800, color, animation: "countUp .5s cubic-bezier(.16,1,.3,1) both" }}>{value}</span>
    </div>
  );
}

// ─── Action Item Card ─────────────────────────────────────────────────────────
function ActionCard({ item, index }) {
  const hasDeadline = item.deadline && item.deadline !== "null" && item.deadline !== null;
  const hasAssignee = item.assignee && item.assignee !== "null" && item.assignee !== null;

  return (
    <div
      className="card"
      style={{
        padding: "16px 18px",
        borderLeft: "3px solid var(--blue-light)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        animation: `slideIn .4s cubic-bezier(.16,1,.3,1) ${index * 0.08}s both`,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{
          width: 22, height: 22, borderRadius: "50%",
          background: "rgba(0,120,212,0.2)",
          border: "1.5px solid var(--blue-light)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, marginTop: 1,
        }}>
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--cyan)", fontWeight: 700 }}>{String(index + 1).padStart(2, "0")}</span>
        </div>
        <p style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.5, color: "var(--text)" }}>{item.task}</p>
      </div>

      {(hasAssignee || hasDeadline) && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingLeft: 32 }}>
          {hasAssignee && (
            <span className="tag" style={{ background: "rgba(99,102,241,0.15)", color: "#A5B4FC", border: "1px solid rgba(99,102,241,0.25)" }}>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M1 11c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              {item.assignee}
            </span>
          )}
          {hasDeadline && (
            <span className="tag" style={{ background: "rgba(245,158,11,0.12)", color: "#FCD34D", border: "1px solid rgba(245,158,11,0.2)" }}>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M6 3v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              {item.deadline}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Processing overlay ───────────────────────────────────────────────────────
function ProcessingState({ fileName }) {
  const steps = ["Uploading audio file...", "Transcribing speech...", "Analyzing content with AI...", "Extracting action items...", "Generating summary..."];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32, padding: "48px 24px", textAlign: "center" }}>
      {/* Pulse rings */}
      <div style={{ position: "relative", width: 96, height: 96 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            position: "absolute", inset: 0,
            borderRadius: "50%",
            border: "1.5px solid rgba(80,217,255,0.3)",
            animation: `pulse-ring 2.4s ease-out ${i * 0.6}s infinite`,
          }} />
        ))}
        <div style={{
          position: "absolute", inset: "50%", transform: "translate(-50%,-50%)",
          width: 56, height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(0,120,212,0.4), rgba(80,217,255,0.2))",
          border: "1.5px solid var(--cyan)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <AzurelyLogo size={28} />
        </div>
      </div>

      <WaveformVisualizer active />

      <div>
        <div className="shimmer-text" style={{ fontSize: 15, fontWeight: 600, fontFamily: "var(--font-mono)", marginBottom: 6 }}>
          {steps[step]}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          {fileName}
        </div>
      </div>

      {/* Progress dots */}
      <div style={{ display: "flex", gap: 8 }}>
        {steps.map((_, i) => (
          <div key={i} style={{
            width: i === step ? 18 : 6,
            height: 6,
            borderRadius: 3,
            background: i <= step ? "var(--blue-light)" : "var(--text-muted)",
            transition: "all .4s cubic-bezier(.16,1,.3,1)",
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── Results view ─────────────────────────────────────────────────────────────
function Results({ data, onReset }) {
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <StatBadge label="Duration" value={data.duration_estimate || "—"} color="var(--cyan)" />
          <StatBadge label="Language" value={data.language_detected || "—"} color="#A5B4FC" />
          <StatBadge label="Actions" value={data.action_items?.length || 0} color="var(--success)" />
          <StatBadge label="Key Points" value={data.key_points?.length || 0} color="var(--warn)" />
        </div>
        <button
          onClick={onReset}
          style={{
            background: "var(--glass)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
            color: "var(--text-dim)", fontFamily: "var(--font-head)", fontSize: 13, padding: "8px 16px",
            cursor: "pointer", transition: "all .2s",
            display: "flex", alignItems: "center", gap: 6,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.color = "var(--text)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-dim)"; }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          New meeting
        </button>
      </div>

      {/* Summary — hero card */}
      <div className="card animate-fadeUp" style={{
        padding: "28px 28px",
        background: "linear-gradient(135deg, rgba(0,120,212,0.12) 0%, rgba(80,217,255,0.05) 100%)",
        border: "1px solid rgba(80,217,255,0.2)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative corner */}
        <div style={{
          position: "absolute", top: -1, right: -1,
          width: 80, height: 80,
          background: "linear-gradient(225deg, rgba(80,217,255,0.15) 0%, transparent 60%)",
          borderRadius: "0 16px 0 0",
        }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <div style={{
            width: 4, height: 20, borderRadius: 2,
            background: "linear-gradient(to bottom, var(--cyan), var(--blue))",
          }} />
          <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--cyan)", letterSpacing: 2, textTransform: "uppercase" }}>Executive Summary</span>
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.75, color: "var(--text)", fontWeight: 400 }}>
          {data.summary}
        </p>
      </div>

      {/* Two-column: key points + actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 16 }}>

        {/* Key Points */}
        <div className="card animate-fadeUp" style={{ padding: "22px", animationDelay: ".1s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M8 3l5 5-5 5" stroke="var(--cyan)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--cyan)", letterSpacing: 2, textTransform: "uppercase" }}>Key Points</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {data.key_points?.map((pt, i) => (
              <div
                key={i}
                style={{
                  display: "flex", gap: 12, alignItems: "flex-start",
                  animation: `slideIn .4s cubic-bezier(.16,1,.3,1) ${.15 + i * 0.07}s both`,
                }}
              >
                <div style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "var(--blue-light)",
                  flexShrink: 0, marginTop: 7,
                  boxShadow: "0 0 6px rgba(26,154,255,0.6)",
                }} />
                <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--text)", fontWeight: 400 }}>{pt}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Items */}
        <div className="card animate-fadeUp" style={{ padding: "22px", animationDelay: ".15s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="12" height="12" rx="2" stroke="var(--success)" strokeWidth="1.5" />
              <path d="M5.5 8l2 2 3-3.5" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--success)", letterSpacing: 2, textTransform: "uppercase" }}>Action Items</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.action_items?.map((item, i) => (
              <ActionCard key={i} item={item} index={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Transcription — collapsible */}
      <div
        className="card animate-fadeUp"
        style={{ padding: "0", animationDelay: ".2s", overflow: "hidden" }}
      >
        <button
          onClick={() => setTranscriptOpen(o => !o)}
          style={{
            width: "100%", background: "none", border: "none",
            padding: "18px 22px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            cursor: "pointer", color: "var(--text-dim)",
            fontFamily: "var(--font-head)", fontSize: 13,
            transition: "color .2s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--text-dim)"}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" />
              <path d="M3.5 4.5h7M3.5 7h5M3.5 9.5h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>
              Full Transcription
            </span>
          </div>
          <svg
            width="14" height="14" viewBox="0 0 14 14" fill="none"
            style={{ transform: transcriptOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform .25s" }}
          >
            <path d="M2.5 5l4.5 4.5L11.5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div style={{
          maxHeight: transcriptOpen ? 400 : 0,
          overflow: "hidden",
          transition: "max-height .4s cubic-bezier(.16,1,.3,1)",
        }}>
          <div style={{
            padding: "0 22px 22px",
            borderTop: "1px solid var(--border)",
            paddingTop: 16,
          }}>
            <p className="transcription-text">{data.transcription}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState("en-US");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Inject styles
  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.textContent = FONTS + GLOBAL_CSS;
    document.head.appendChild(styleEl);
    return () => document.head.removeChild(styleEl);
  }, []);

  const handleFile = useCallback((f) => {
    if (!f) return;
    const allowed = ["audio/mpeg", "audio/wav", "audio/x-m4a", "audio/ogg", "video/mp4", "audio/mp4", "audio/x-wav"];
    const ext = f.name.split(".").pop().toLowerCase();
    const allowedExts = ["mp3", "wav", "m4a", "ogg", "mp4"];
    if (!allowedExts.includes(ext)) {
      setError("Unsupported format. Please upload MP3, WAV, M4A, OGG, or MP4.");
      return;
    }
    setFile(f);
    setError("");
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleSubmit = async () => {
    if (!file) return;
    setStatus("loading");
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", language);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/analyze`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error: ${res.status}`);
      }
      const data = await res.json();
      setResult(data);
      setStatus("success");
    } catch (err) {
      setError(err.message || "Connection failed. Make sure the backend is running on localhost:8000.");
      setStatus("error");
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setStatus("idle");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const langs = [
    { value: "en-US", label: "English (US)" },
    { value: "en-GB", label: "English (UK)" },
    { value: "es-ES", label: "Español (España)" },
    { value: "es-MX", label: "Español (México)" },
    { value: "pt-BR", label: "Português (Brasil)" },
  ];

  const fmtBytes = (b) => b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`;

  return (
    <>
      <div className="mesh-bg" />
      <div className="grid-overlay" />

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>

        {/* ── Nav ── */}
        <nav style={{
          position: "sticky", top: 0, zIndex: 100,
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          background: "rgba(6,11,24,0.7)",
          padding: "0 clamp(20px, 5vw, 48px)",
          height: 60,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <AzurelyLogo size={30} />
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px", color: "var(--text)" }}>
              Azurely
            </span>
            <span style={{
              marginLeft: 4, padding: "2px 8px",
              background: "rgba(80,217,255,0.1)",
              border: "1px solid rgba(80,217,255,0.2)",
              borderRadius: 99, fontSize: 10,
              fontFamily: "var(--font-mono)", color: "var(--cyan)",
              letterSpacing: 1,
            }}>BETA</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: status === "loading" ? "var(--warn)" : "var(--success)",
              boxShadow: `0 0 8px ${status === "loading" ? "var(--warn)" : "var(--success)"}`,
              animation: status === "loading" ? "pulse-ring 1.2s ease-out infinite" : "none",
            }} />
            <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
              {status === "loading" ? "Processing" : "API Connected"}
            </span>
          </div>
        </nav>

        {/* ── Main ── */}
        <main style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "clamp(32px, 6vw, 64px) clamp(20px, 5vw, 40px)",
        }}>

          {/* Hero header */}
          {status !== "success" && (
            <div style={{ textAlign: "center", marginBottom: 48, animation: "fadeUp .6s cubic-bezier(.16,1,.3,1) both" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "6px 14px",
                background: "rgba(0,120,212,0.1)", border: "1px solid rgba(0,120,212,0.2)",
                borderRadius: 99, fontSize: 12, fontFamily: "var(--font-mono)",
                color: "var(--blue-light)", marginBottom: 20, letterSpacing: 1,
              }}>
                ✦ AI-Powered Meeting Intelligence
              </div>
              <h1 style={{
                fontSize: "clamp(32px, 6vw, 54px)", fontWeight: 800,
                lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: 14,
              }}>
                Turn meetings into{" "}
                <span style={{
                  background: "linear-gradient(90deg, var(--blue-light), var(--cyan))",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>clarity</span>
              </h1>
              <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.65, maxWidth: 480, margin: "0 auto" }}>
                Upload your meeting recording. Azurely transcribes, summarizes, and extracts action items — instantly.
              </p>
            </div>
          )}

          {/* ── Upload form ── */}
          {status === "idle" || status === "error" ? (
            <div className="card animate-fadeUp" style={{ padding: "clamp(24px, 4vw, 40px)" }}>

              {/* Drop zone */}
              <div
                className={`upload-zone ${dragOver ? "drag-over" : ""} ${file ? "has-file" : ""}`}
                style={{ padding: "clamp(32px, 5vw, 52px) 24px", textAlign: "center", marginBottom: 20 }}
                onClick={() => !file && fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp3,.wav,.m4a,.ogg,.mp4"
                  style={{ display: "none" }}
                  onChange={e => handleFile(e.target.files[0])}
                />

                {file ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: "linear-gradient(135deg, rgba(0,120,212,0.25), rgba(80,217,255,0.1))",
                      border: "1.5px solid var(--blue-light)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18V5l12-2v13" stroke="var(--cyan)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="6" cy="18" r="3" stroke="var(--cyan)" strokeWidth="1.8" />
                        <circle cx="18" cy="16" r="3" stroke="var(--cyan)" strokeWidth="1.8" />
                      </svg>
                    </div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{file.name}</p>
                      <p style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                        {fmtBytes(file.size)} · {file.name.split(".").pop().toUpperCase()}
                      </p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      style={{
                        background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)",
                        borderRadius: 8, color: "var(--danger)", fontSize: 12,
                        padding: "5px 12px", cursor: "pointer", fontFamily: "var(--font-head)",
                        transition: "all .2s",
                      }}
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 16,
                      background: "var(--glass)",
                      border: "1.5px solid var(--border)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all .25s",
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="var(--text-dim)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        <polyline points="17 8 12 3 7 8" stroke="var(--text-dim)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="12" y1="3" x2="12" y2="15" stroke="var(--text-dim)" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                        <span style={{ color: "var(--blue-light)", cursor: "pointer" }}>Click to upload</span>
                        {" "}<span style={{ color: "var(--text-dim)", fontWeight: 400 }}>or drag and drop</span>
                      </p>
                      <p style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                        MP3 · WAV · M4A · OGG · MP4
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Language + submit row */}
              <div style={{ display: "flex", gap: 12, alignItems: "stretch", flexWrap: "wrap" }}>
                <div style={{ flex: "0 0 auto", position: "relative" }}>
                  <label style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                    Language
                  </label>
                  <div style={{ position: "relative" }}>
                    <select
                      className="select-field"
                      value={language}
                      onChange={e => setLanguage(e.target.value)}
                      style={{ padding: "10px 36px 10px 14px", paddingRight: 36, minWidth: 180 }}
                    >
                      {langs.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                    <svg style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                      width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 4.5l4 4 4-4" stroke="var(--text-dim)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "transparent", letterSpacing: 1, display: "block", marginBottom: 6 }}>
                    &nbsp;
                  </label>
                  <button
                    className="btn-primary"
                    disabled={!file || status === "loading"}
                    onClick={handleSubmit}
                    style={{ width: "100%", padding: "11px 24px", height: 42 }}
                  >
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 1l2.5 5 5.5.8-4 3.9.94 5.5L8 13.5 3.06 16.2 4 10.7 0 6.8l5.5-.8z" fill="white" opacity=".8" />
                      </svg>
                      Analyze Meeting
                    </span>
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  marginTop: 16, padding: "12px 16px",
                  background: "rgba(244,63,94,0.08)",
                  border: "1px solid rgba(244,63,94,0.2)",
                  borderRadius: "var(--radius-sm)",
                  display: "flex", alignItems: "flex-start", gap: 10,
                  animation: "fadeIn .3s ease both",
                }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="8" cy="8" r="7" stroke="var(--danger)" strokeWidth="1.2" />
                    <path d="M8 5v3.5M8 10.5v.5" stroke="var(--danger)" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  <p style={{ fontSize: 13, color: "var(--danger)", lineHeight: 1.5 }}>{error}</p>
                </div>
              )}
            </div>
          ) : status === "loading" ? (
            <div className="card animate-fadeIn">
              <ProcessingState fileName={file?.name} />
            </div>
          ) : (
            <Results data={result} onReset={handleReset} />
          )}

          {/* Feature pills at bottom */}
          {status === "idle" && (
            <div style={{
              display: "flex", justifyContent: "center", gap: 10,
              flexWrap: "wrap", marginTop: 36,
              animation: "fadeUp .7s cubic-bezier(.16,1,.3,1) .2s both",
            }}>
              {["Powered by Azure AI", "Real-time transcription", "Multi-language support", "Action item extraction"].map(f => (
                <span key={f} style={{
                  fontSize: 12, fontFamily: "var(--font-mono)",
                  color: "var(--text-muted)",
                  padding: "5px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: 99,
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <span style={{ color: "var(--blue-light)", fontSize: 10 }}>✦</span> {f}
                </span>
              ))}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer style={{
          textAlign: "center", padding: "24px",
          borderTop: "1px solid var(--border)",
          color: "var(--text-muted)",
          fontFamily: "var(--font-mono)",
          fontSize: 11, letterSpacing: .5,
        }}>
          AZURELY · BUILT ON AZURE AI · HACKATHON 2025
        </footer>
      </div>
    </>
  );
}
