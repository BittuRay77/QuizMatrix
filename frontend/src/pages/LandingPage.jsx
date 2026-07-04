import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import {
  Instagram,
  Facebook,
  Github,
  Linkedin,
  Brain,
  Timer,
  LayoutDashboard,
  GraduationCap,
  ShieldCheck,
  BarChart3,
  Download,
  Smartphone,
  Zap,
  Lock,
  Mail,
  MessageCircle,
  MapPin,
  Clock,
  Sun,
  Moon,
  Menu,
  X,
  ArrowRight,
  Users,
  FileText,
  Send,
} from "lucide-react";
import { useTheme } from '../context/ThemeContext.jsx';

/* ─── DATA ───────────────────────────────────────────────── */

const FEATURES = [
  { icon: Brain,            title: "Smart Online Quizzes", tags: ["MCQ", "Auto-Eval", "Real-time"],       desc: "Real-time MCQ exams with instant auto-evaluation. Zero manual checking — results appear the moment students submit." },
  { icon: Timer,            title: "Timer-Based Exams",    tags: ["Countdown", "Auto-Submit", "Fair Play"], desc: "Set fixed durations and let the system auto-submit. Creates a fair, stress-tested environment for every student." },
  { icon: LayoutDashboard,  title: "Teacher Dashboard",    tags: ["Create", "Edit", "Manage"],            desc: "Create quizzes in minutes — add, edit, or delete questions from a single clean management panel." },
  { icon: GraduationCap,    title: "Student Dashboard",    tags: ["Results", "Progress", "History"],      desc: "Browse available quizzes, see instant results after submission, and track performance over time." },
  { icon: ShieldCheck,      title: "Secure Login System",  tags: ["JWT Auth", "Role-Based", "Encrypted"], desc: "Role-based portals for students and teachers, protected by JWT authentication and encrypted data storage." },
  { icon: BarChart3,        title: "Instant Analytics",    tags: ["Analytics", "Insights", "History"],    desc: "Real-time score calculation, full result history, and performance insights to help every student improve." },
];

/* ─── CUSTOM HOOKS ───────────────────────────────────────── */
function useScrollReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function useCountUp(target, duration = 1800) {
  const ref = useRef(null);
  const [display, setDisplay] = useState("0");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); obs.disconnect(); } },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const num = parseInt(target.replace(/[^0-9]/g, ""), 10);
    if (!num) { setDisplay(target); return; }
    const step = num / (duration / 16);
    let cur = 0;
    const timer = setInterval(() => {
      cur = Math.min(cur + step, num);
      const formatted = target.replace(/[0-9,]+/, Math.floor(cur).toLocaleString());
      setDisplay(formatted);
      if (cur >= num) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return [ref, display];
}

/* ─── SHARED STYLES (LIGHT/DARK AWARE) ──────────────────── */
/*
  Design tokens — warm, editorial "studio paper" palette:
  bg      #F5F1E9 (cream)      / dark #191510 (warm near-black espresso)
  surface #FFFFFF               / dark #221D16
  ink     #2B241C (warm black)  / dark #F2ECE0
  muted   #7A7266               / dark #A69C8C
  accent  #C05F3C (clay/terracotta) — used sparingly, one accent only
  accent-deep #9C4A2C (hover/pressed state)
  hairline rgba(43,36,28,0.12)  / dark rgba(242,236,224,0.12)
*/
function useStyles() {
  const { darkMode } = useTheme();

  const ink = darkMode ? "#F2ECE0" : "#2B241C";
  const muted = darkMode ? "#A69C8C" : "#7A7266";
  const accent = "#C74634";
  const accentDeep = "#A63A2B";
  const hairline = darkMode ? "rgba(242,236,224,0.12)" : "rgba(43,36,28,0.12)";
  const surface = darkMode ? "#221D16" : "#FFFFFF";

  return {
    ink, muted, accent, accentDeep, hairline, surface,
    page: {
      fontFamily: "'Inter', sans-serif",
      background: darkMode ? "#191510" : "#F5F1E9",
      minHeight: "100vh",
      color: ink,
    },
    nav: {
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: darkMode ? "rgba(25,21,16,0.90)" : "rgba(245,241,233,0.90)",
      backdropFilter: "blur(18px)",
      borderBottom: `1px solid ${hairline}`,
      padding: "0 5%", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
    },
    logo: { fontFamily: "'Source Serif 4', serif", fontWeight: 700, fontSize: "1.35rem", color: ink, letterSpacing: "-0.02em", cursor: "pointer", userSelect: "none" },
    navLink: { color: muted, fontSize: "0.9rem", fontWeight: 500, cursor: "pointer", padding: "4px 0", borderBottom: "2px solid transparent", transition: "all 0.2s" },
    section: {
      padding: "6rem 5%",
      background: darkMode ? "#191510" : "#F5F1E9",
    },
    sectionW: { padding: "6rem 5%", background: surface },
    label: { fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: accent, marginBottom: 10 },
    h2: { fontFamily: "'Source Serif 4', serif", fontWeight: 600, fontSize: "clamp(1.8rem,3.5vw,2.6rem)", lineHeight: 1.15, letterSpacing: "-0.02em", margin: "0 0 0.8rem", color: ink },
    sub: { color: muted, fontSize: "1rem", lineHeight: 1.75, maxWidth: 520 },
    card: {
      background: darkMode ? "#221D16" : "#FFFFFF",
      border: `1px solid ${hairline}`,
      borderRadius: 14, padding: "1.6rem",
      boxShadow: darkMode ? "0 10px 32px rgba(0,0,0,0.35)" : "0 10px 32px rgba(43,36,28,0.05)",
    },
    btnPrimary: { background: accent, color: "#FBF7EF", padding: "11px 26px", borderRadius: 10, fontWeight: 600, fontSize: "0.92rem", cursor: "pointer", border: "none", display: "inline-flex", alignItems: "center", gap: 8, transition: "transform 0.15s, box-shadow 0.2s, background 0.2s" },
    btnOutline: {
      background: "transparent",
      color: ink,
      padding: "11px 26px", borderRadius: 10, fontWeight: 600, fontSize: "0.92rem", cursor: "pointer",
      border: `1.5px solid ${hairline}`,
      display: "inline-flex", alignItems: "center", gap: 8, transition: "all 0.2s",
    },
  };
}

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @media(max-width:768px) { .qm-desktop-nav { display:none !important; } .qm-hamburger { display:flex !important; } }
  @media(min-width:769px) { .qm-mobile-menu { display:none !important; } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
  @keyframes progressAnim { from { width:28%; } to { width:80%; } }
  .qm-reveal { opacity:0; transform:translateY(28px); transition: opacity 0.55s ease, transform 0.55s ease; }
  .qm-reveal.vis { opacity:1; transform:translateY(0); }
  .qm-slide-l { opacity:0; transform:translateX(-30px); transition: all 0.65s ease; }
  .qm-slide-l.vis { opacity:1; transform:translateX(0); }
  .qm-slide-r { opacity:0; transform:translateX(30px); transition: all 0.65s ease; }
  .qm-slide-r.vis { opacity:1; transform:translateX(0); }
  .qm-feat-card { transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s !important; }
  .qm-feat-card:hover { transform:translateY(-4px) !important; border-color:#C05F3C55 !important; }
  .qm-test-card:hover { transform:translateY(-3px); }
  .qm-btn-p:hover { transform:translateY(-2px) !important; background:#9C4A2C !important; box-shadow:0 14px 26px rgba(192,95,60,0.28) !important; }
  .qm-btn-o:hover { border-color:#C05F3C !important; color:#C05F3C !important; }
  .qm-progress-bar { animation: progressAnim 2.5s ease-in-out infinite alternate; }
  input:focus, textarea:focus, select:focus { border-color:#C05F3C !important; box-shadow:0 0 0 3px rgba(192,95,60,0.15) !important; outline:none; }
  @media(max-width:800px) { .qm-how-grid { grid-template-columns:1fr !important; } }
  @media(max-width:700px) { .qm-contact-grid { grid-template-columns:1fr !important; } .qm-form-row { grid-template-columns:1fr !important; } }
  @media(max-width:768px) { .qm-footer-grid { grid-template-columns:1fr 1fr !important; } }
  @media(max-width:480px) { .qm-footer-grid { grid-template-columns:1fr !important; } }
`;

/* ─── NAVBAR ─────────────────────────────────────────────── */
function Navbar({ page, setPage }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  const S = useStyles();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (p) => {
    setPage(p);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollTo = (id) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 60);
  };
  const navigate = useNavigate();

  const navItems = [
    { label: "Features",     action: () => { go("home"); scrollTo("features"); } },
    { label: "How it Works", action: () => { go("home"); scrollTo("how-it-works"); } },
    { label: "Mock Tests",   action: () => navigate("/mock-test") },
    { label: "Contact",      action: () => go("contact") },
  ];

  return (
    <>
      <Helmet>
        <title>
          QuizMatrix | AI-Powered Exam Management & Placement Preparation Platform
        </title>

        <meta
          name="description"
          content="QuizMatrix is a comprehensive AI-powered EdTech and placement preparation platform that helps students and educators with online exams, AI mock interviews, performance analytics, study materials, previous year question papers, aptitude practice, DSA preparation, and interview readiness."
        />

        <meta
          name="keywords"
          content="
          QuizMatrix,
          AI Mock Interview,
          Placement Preparation Platform,
          Online Quiz Platform,
          Exam Management System,
          MCQ Practice Website,
          AI Interview Feedback,
          Interview Readiness Platform,
          Student Performance Analytics,
          Previous Year Question Papers,
          Study Materials PDF,
          Aptitude Questions,
          Logical Reasoning Practice,
          Verbal Ability Preparation,
          DSA Preparation,
          Educational Technology Platform,
          B.Tech Placement Preparation,
          AI Powered EdTech Platform,
          Online Assessment Platform,
          College Exam Portal,
          Competitive Exam Quiz,
          JavaScript Quiz,
          Python Quiz,
          Live Testing Platform,
          Career Growth Platform
          "
        />

        <meta name="robots" content="index, follow" />

        <meta
          property="og:title"
          content="QuizMatrix - AI-Powered Exam Management & Interview Readiness Platform"
        />

        <meta
          property="og:description"
          content="Prepare for exams, placements, and interviews with AI-powered analytics, mock interviews, aptitude practice, and study materials."
        />

        <meta property="og:type" content="website" />

        <meta
          property="og:url"
          content="https://quizmatrix.vercel.app/"
        />

        <meta property="og:site_name" content="QuizMatrix" />

        <meta
          name="twitter:card"
          content="summary_large_image"
        />

        <meta
          name="twitter:title"
          content="QuizMatrix - AI Powered EdTech Platform"
        />

        <meta
          name="twitter:description"
          content="AI-powered exam management, placement preparation and interview readiness platform."
        />

        <link
          rel="canonical"
          href="https://quizmatrix.vercel.app/"
        />
      </Helmet>

      <style>{GLOBAL_CSS}</style>

      <button
        onClick={toggleDarkMode}
        style={{
          position: 'fixed', bottom: 16, right: 16, zIndex: 999,
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 16px', borderRadius: 999,
          border: `1px solid ${S.hairline}`,
          background: S.surface, color: S.ink,
          boxShadow: darkMode ? '0 12px 28px rgba(0,0,0,0.4)' : '0 12px 28px rgba(43,36,28,0.12)',
          fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
        }}
      >
        {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        {darkMode ? 'Light mode' : 'Dark mode'}
      </button>

      <nav style={{ ...S.nav, boxShadow: scrolled ? (darkMode ? "0 2px 20px rgba(0,0,0,0.4)" : "0 2px 20px rgba(43,36,28,0.06)") : "none" }}>
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2 group" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: S.accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 16px rgba(192,95,60,0.3)" }}>
              <span style={{ color: "#FBF7EF", fontFamily: "'Source Serif 4', serif", fontWeight: 700, fontSize: "1.15rem" }}>Q</span>
            </div>
            <span style={S.logo}>QuizMatrix</span>
          </Link>
        </div>

        {/* Desktop */}
        <div className="qm-desktop-nav" style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          {navItems.map(({ label, action }) => (
            <span key={label} onClick={action} style={S.navLink}
              onMouseEnter={e => { e.target.style.color = S.accent; e.target.style.borderBottomColor = S.accent; }}
              onMouseLeave={e => { e.target.style.color = S.muted; e.target.style.borderBottomColor = "transparent"; }}>
              {label}
            </span>
          ))}

          {/* Desktop Mobile App Download Section */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", borderLeft: `1px solid ${S.hairline}`, paddingLeft: "1.5rem" }}>
            <span style={{ fontSize: "0.85rem", color: S.muted, fontWeight: 500 }}>
              Get our App:
            </span>
            <a
              href="/app/app-release.apk"
              download="QuizMatrix.apk"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: S.ink,
                color: S.surface,
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: "600",
                textDecoration: "none",
                transition: "opacity 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              <Download size={14} />
              Download APK
            </a>
          </div>

          <button
            className="qm-btn-p"
            style={S.btnPrimary}
            onClick={() => navigate("/login")}
          >
            Login Now
          </button>
        </div>

        {/* Hamburger */}
        <button className="qm-hamburger" onClick={() => setMenuOpen(!menuOpen)}
          style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 4, alignItems: "center", justifyContent: "center", color: S.ink }}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="qm-mobile-menu" style={{ position: "fixed", top: 64, left: 0, right: 0, background: S.surface, borderBottom: `1px solid ${S.hairline}`, padding: "1rem 5%", zIndex: 99, display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          {navItems.map(({ label, action }) => (
            <span key={label} onClick={() => { action(); setMenuOpen(false); }}
              style={{ color: S.ink, padding: "0.5rem 0", borderBottom: `1px solid ${S.hairline}`, cursor: "pointer", fontWeight: 500, fontSize: "0.95rem" }}>
              {label}
            </span>
          ))}

          {/* Mobile Menu App Download Section */}
          <div style={{ padding: "0.5rem 0", borderBottom: `1px solid ${S.hairline}`, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", color: S.muted }}>
              Try our Mobile App for a better experience!
            </span>
            <a
              href="/app/app-release.apk"
              download="QuizMatrix.apk"
              onClick={() => setMenuOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                background: S.ink,
                color: S.surface,
                padding: "10px",
                borderRadius: "8px",
                fontSize: "0.9rem",
                fontWeight: "600",
                textDecoration: "none"
              }}
            >
              <Download size={16} />
              Download Mobile App (APK)
            </a>
          </div>

          <button className="qm-btn-p" style={{ ...S.btnPrimary, justifyContent: "center", marginTop: 4 }} onClick={() => { navigate("/login"); setMenuOpen(false); }}>
            Login Now
          </button>
        </div>
      )}
    </>
  );
}

/* ─── HERO ───────────────────────────────────────────────── */
function Hero({ setPage }) {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const S = useStyles();
  return (
    <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "7rem 5% 5rem", background: darkMode ? "#191510" : "#F5F1E9", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "12%", right: "6%", width: 340, height: 340, background: "radial-gradient(circle,rgba(192,95,60,0.10),transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", left: "4%", width: 280, height: 280, background: "radial-gradient(circle,rgba(192,95,60,0.06),transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto" }}>
        

        <h1 style={{ fontFamily: "'Source Serif 4', serif", fontWeight: 600, fontSize: "clamp(2.6rem,6vw,4.6rem)", lineHeight: 1.08, letterSpacing: "-0.02em", color: S.ink, marginBottom: 20, animation: "fadeUp 0.7s ease 0.1s both" }}>
          Ace Every Exam with<br />
          <span style={{ color: S.accent }}>QuizMatrix</span>
        </h1>

        <p style={{ color: S.muted, fontSize: "1.1rem", lineHeight: 1.75, maxWidth: 560, margin: "0 auto 2.5rem", animation: "fadeUp 0.7s ease 0.2s both" }}>
          The ultimate AI-powered platform for online exams, mock interviews, aptitude preparation, DSA practice, previous year papers, and performance analytics. Built for students and educators.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", animation: "fadeUp 0.7s ease 0.3s both" }}>
          <button className="qm-btn-p" style={S.btnPrimary} onClick={() => navigate("/login")}>
            Start For Free <ArrowRight size={16} />
          </button>
          <button className="qm-btn-o" style={S.btnOutline} onClick={() => navigate("/mock-test")}>
            <FileText size={16} /> Try a Mock Test
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── FEATURE CARD (own component) ──────────────────────── */
function FeatureCard({ feature, delay }) {
  const [ref, vis] = useScrollReveal();
  const S = useStyles();
  return (
    <div ref={ref} className={`qm-feat-card qm-reveal${vis ? " vis" : ""}`}
      style={{ ...S.card, position: "relative", paddingLeft: "1.9rem", transitionDelay: `${delay}s` }}>
      <span style={{ position: "absolute", left: 0, top: "1.6rem", bottom: "1.6rem", width: 3, background: S.accent, borderRadius: 2 }} />
      <h3 style={{ fontFamily: "'Source Serif 4', serif", fontWeight: 600, fontSize: "1.08rem", marginBottom: 8, color: S.ink }}>{feature.title}</h3>
      <p style={{ color: S.muted, fontSize: "0.875rem", lineHeight: 1.7, marginBottom: 14 }}>{feature.desc}</p>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {feature.tags.map(t => (
          <span key={t} style={{ fontSize: "0.72rem", padding: "3px 10px", borderRadius: 100, background: S.hairline, color: S.muted, fontWeight: 600 }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

/* ─── FEATURES SECTION ───────────────────────────────────── */
function Features() {
  const S = useStyles();
  return (
    <section id="features" style={S.sectionW}>
      <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
        <div style={S.label}>What We Offer</div>
        <h2 style={{ ...S.h2, textAlign: "center" }}>Everything You Need to <span style={{ color: S.accent }}>Quiz Smarter</span></h2>
        <p style={{ ...S.sub, margin: "0 auto" }}>From creating quizzes to tracking performance — every tool, built right in.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "1.2rem", maxWidth: 1200, margin: "0 auto" }}>
        {FEATURES.map((f, i) => <FeatureCard key={f.title} feature={f} delay={i * 0.07} />)}
      </div>
    </section>
  );
}

/* ─── HOW IT WORKS ───────────────────────────────────────── */
function HowItWorks() {
  const [leftRef, leftVis] = useScrollReveal();
  const [rightRef, rightVis] = useScrollReveal();
  const S = useStyles();

  const steps = [
    { n: "01", h: "Create Your Account",  p: "Sign up as Teacher or Student. JWT-based authentication keeps your data fully secure and private." },
    { n: "02", h: "Build or Join a Quiz", p: "Teachers create MCQ quizzes with timers. Students browse available exams and join with one click." },
    { n: "03", h: "Get Instant Results",  p: "Auto-evaluation delivers your score the moment the quiz ends. Review answers and track improvement." },
  ];

  return (
    <section id="how-it-works" style={S.section}>
      <div className="qm-how-grid" style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
        <div ref={leftRef} className={`qm-slide-l${leftVis ? " vis" : ""}`}>
          <div style={S.label}>Simple Process</div>
          <h2 style={S.h2}>Up & Running in <span style={{ color: S.accent }}>3 Easy Steps</span></h2>
          <p style={{ ...S.sub, marginBottom: "2.5rem" }}>Whether you're a teacher or student, QuizMatrix gets you going in minutes.</p>
          {steps.map((s, i) => (
            <div key={s.n} style={{ display: "flex", gap: 16, paddingBottom: 28, position: "relative" }}>
              {i < steps.length - 1 && (
                <div style={{ position: "absolute", left: 20, top: 50, width: 2, height: "calc(100% - 20px)", background: `linear-gradient(to bottom, ${S.hairline}, transparent)` }} />
              )}
              <div style={{ minWidth: 42, height: 42, borderRadius: 10, background: S.ink, display: "flex", alignItems: "center", justifyContent: "center", color: S.surface, fontFamily: "'Source Serif 4', serif", fontWeight: 700, fontSize: "0.85rem", flexShrink: 0 }}>
                {s.n}
              </div>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: "1rem", color: S.ink, marginBottom: 5 }}>{s.h}</h4>
                <p style={{ color: S.muted, fontSize: "0.875rem", lineHeight: 1.65 }}>{s.p}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mock browser */}
        <div ref={rightRef} className={`qm-slide-r${rightVis ? " vis" : ""}`}>
          <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
            <div style={{ background: S.hairline, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${S.hairline}` }}>
              <div style={{ display: "flex", gap: 5 }}>
                {["#e07856","#d4a24e","#8a9a6e"].map(c => <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, display: "inline-block" }} />)}
              </div>
              <div style={{ flex: 1, background: "rgba(122,114,102,0.14)", borderRadius: 6, padding: "3px 10px", fontSize: "0.72rem", color: S.muted }}>quizmatrix.app/quiz/live</div>
            </div>
            <div style={{ padding: "1.4rem" }}>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: S.ink, marginBottom: 6 }}>Computer Science — Data Structures</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.74rem", color: S.accent, background: "rgba(192,95,60,0.10)", padding: "3px 10px", borderRadius: 100, marginBottom: 14 }}>
                <Clock size={12} /> 08:42 remaining
              </div>
              <div style={{ fontSize: "0.84rem", fontWeight: 500, color: S.ink, marginBottom: 12, lineHeight: 1.55 }}>Q3. Which data structure uses LIFO order?</div>
              {[["A","Queue",false],["B","Stack",true],["C","Linked List",false],["D","Tree",false]].map(([l, opt, sel]) => (
                <div key={l} style={{
                  background: sel ? "rgba(192,95,60,0.10)" : "rgba(122,114,102,0.06)",
                  border: `1px solid ${sel ? "rgba(192,95,60,0.35)" : S.hairline}`,
                  borderRadius: 8, padding: "8px 12px", fontSize: "0.8rem", marginBottom: 6,
                  color: sel ? S.accent : S.muted,
                  fontWeight: sel ? 600 : 400, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: sel ? S.accent : S.hairline, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.68rem", color: sel ? "#FBF7EF" : S.muted, fontWeight: 700, flexShrink: 0 }}>{l}</span>
                  {opt} {sel && "✓"}
                </div>
              ))}
              <div style={{ height: 5, background: S.hairline, borderRadius: 3, marginTop: 14 }}>
                <div className="qm-progress-bar" style={{ height: "100%", background: S.accent, borderRadius: 3 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontSize: "0.7rem", color: S.muted }}>
                <span>3 of 10 questions</span><span>60% complete</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── CTA STRIP ──────────────────────────────────────────── */
function CTAStrip({ setPage }) {
  const [ref, vis] = useScrollReveal();
  const { darkMode } = useTheme();
  const S = useStyles();

  return (
    <>
      {/* 1. Existing Section */}
      <section style={{ background: darkMode ? "#221D16" : "#FBF0E9", borderTop: `1px solid ${S.hairline}`, padding: "5rem 5%", textAlign: "center" }}>
        <div ref={ref} className={`qm-reveal${vis ? " vis" : ""}`}>
          <div style={S.label}>Join Thousands of Learners</div>
          <h2 style={{ ...S.h2, textAlign: "center" }}>Ready to <span style={{ color: S.accent }}>Transform</span> How You Learn?</h2>
          <p style={{ ...S.sub, margin: "0 auto 2rem" }}>Sign up free today. No credit card needed. Start quizzing in under 2 minutes.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="qm-btn-p" style={S.btnPrimary} onClick={() => { setPage("home"); window.scrollTo({ top: 0 }); }}>
              <GraduationCap size={16} /> I'm a Student
            </button>
            <button className="qm-btn-p" style={{ ...S.btnPrimary, background: S.ink }} onClick={() => { setPage("home"); window.scrollTo({ top: 0 }); }}>
              <Users size={16} /> I'm a Teacher
            </button>
          </div>
        </div>
      </section>

      {/* 2. App Section (Theme Matched) */}
      <section style={{ width: "100%", background: S.surface, borderTop: `1px solid ${S.hairline}`, padding: "5rem 5%", fontFamily: "'Inter', sans-serif" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "3rem" }}>

          {/* Left Side: Content & Advantages */}
          <div style={{ flex: 1, minWidth: 300, textAlign: "left" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(192,95,60,0.10)", color: S.accent, padding: "4px 12px", borderRadius: 100, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>
              <Zap size={12} /> QuizMatrix Android App
            </span>

            <h2 style={{ ...S.h2, fontSize: "clamp(1.8rem,3.5vw,2.4rem)", marginBottom: 16 }}>
              Prefer Mobile? Get Our <span style={{ color: S.accent }}>Official APK</span>
            </h2>

            <p style={{ color: S.muted, fontSize: "1rem", lineHeight: 1.75, marginBottom: "2rem" }}>
              Website se bhi behtar, fast aur lag-free experience ke liye hamara mobile app install karein.
              Aapko milenge instant real-time updates aur customized quiz dashboards directly aapke phone par.
            </p>

            {/* Advantages List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "2rem" }}>
              {[
                { title: "Optimized Layout", desc: "Mobile screen ke liye perfect fit UI design." },
                { title: "Faster Loading",   desc: "Kam data aur slow internet me bhi smooth working." },
                { title: "Safe & Secure",    desc: "Official direct compiled package, completely safe to install." }
              ].map((item, index) => (
                <div key={index} style={{ borderLeft: `2px solid ${S.hairline}`, paddingLeft: 14 }}>
                  <h4 style={{ fontSize: "1rem", fontWeight: 600, color: S.ink, marginBottom: 2 }}>{item.title}</h4>
                  <p style={{ fontSize: "0.875rem", color: S.muted, margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <a
              href="/app/app-release.apk"
              download="QuizMatrix.apk"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                background: S.accent,
                color: "#FBF7EF",
                padding: "14px 24px",
                borderRadius: 10,
                fontSize: "0.92rem",
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 12px 26px rgba(192,95,60,0.28)",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = S.accentDeep; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = S.accent; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <Download size={18} />
              Download App Now (.apk)
            </a>
          </div>

        </div>
      </section>
    </>
  );
}

/* ─── CONTACT PAGE ───────────────────────────────────────── */
function ContactPage() {
  const [form, setForm] = useState({
    fname: "",
    lname: "",
    email: "",
    role: "",
    subject: "",
    message: "",
  });

  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const S = useStyles();

  const inp = {
    width: "100%",
    background: "transparent",
    border: `1px solid ${S.hairline}`,
    borderRadius: 8,
    padding: "10px 14px",
    color: S.ink,
    fontSize: "0.9rem",
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "'Inter',sans-serif",
  };

  const lbl = {
    fontSize: "0.75rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: S.muted,
    display: "block",
    marginBottom: 5,
  };

  const handleSubmit = async () => {
    if (!form.email || !form.message) {
      toast.error("Please fill in Email and Message.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "https://quizmatrix.onrender.com/api/contact",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSent(true);

        setForm({
          fname: "",
          lname: "",
          email: "",
          role: "",
          subject: "",
          message: "",
        });

        setTimeout(() => {
          setSent(false);
        }, 5000);
      } else {
        toast.error(data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Contact Form Error:", error);
      toast.error("Server Error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const contactDetails = [
    { icon: Mail,          label: "Email Us",       val: "ujjwalku69@gmail.com" },
    { icon: MessageCircle, label: "WhatsApp",       val: "+91 7257981450" },
    { icon: MapPin,        label: "Location",       val: "Kolkata, West Bengal, India" },
    { icon: Clock,         label: "Support Hours",  val: "Mon–Sat, 9 AM – 7 PM IST" },
  ];

  return (
    <div style={{ paddingTop: 80, minHeight: "100vh", background: S.page.background }}>
      <div style={{ padding: "4rem 5% 2rem", textAlign: "center" }}>
        <div style={S.label}>Get In Touch</div>
        <h1 style={{ ...S.h2, textAlign: "center" }}>
          Contact <span style={{ color: S.accent }}>QuizMatrix</span>
        </h1>
        <p style={{ ...S.sub, margin: "0 auto" }}>
          Questions, feedback, or partnership enquiries — we're here to help.
        </p>
      </div>

      <div
        className="qm-contact-grid"
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          padding: "2rem 5% 5rem",
          display: "grid",
          gridTemplateColumns: "1fr 1.5fr",
          gap: "2.5rem",
          alignItems: "start",
        }}
      >
        {/* Contact Info */}
        <div>
          <h3 style={{ fontFamily: "'Source Serif 4', serif", fontWeight: 600, fontSize: "1.15rem", color: S.ink, marginBottom: 12 }}>
            Let's Talk
          </h3>

          <p style={{ color: S.muted, fontSize: "0.875rem", lineHeight: 1.7, marginBottom: 20 }}>
            Whether you're a student, teacher, or institution — our team is
            ready to help you get the most out of QuizMatrix.
          </p>

          {contactDetails.map((d) => (
            <div
              key={d.label}
              style={{
                borderBottom: `1px solid ${S.hairline}`,
                padding: "10px 0",
              }}
            >
              <div style={{ fontWeight: 600, fontSize: "0.82rem", color: S.ink }}>
                {d.label}
              </div>
              <div style={{ fontSize: "0.82rem", color: S.muted, marginTop: 2 }}>
                {d.val}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div style={{ ...S.card, padding: "2rem" }}>
          <h3 style={{ fontFamily: "'Source Serif 4', serif", fontWeight: 600, fontSize: "1.1rem", color: S.ink, marginBottom: 20 }}>
            Send Us a Message
          </h3>

          <div
            className="qm-form-row"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div>
              <label style={lbl}>First Name</label>
              <input
                style={inp}
                value={form.fname}
                onChange={(e) =>
                  setForm({ ...form, fname: e.target.value })
                }
              />
            </div>

            <div>
              <label style={lbl}>Last Name</label>
              <input
                style={inp}
                value={form.lname}
                onChange={(e) =>
                  setForm({ ...form, lname: e.target.value })
                }
              />
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={lbl}>Email Address</label>
            <input
              type="email"
              style={inp}
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={lbl}>I Am A</label>
            <select
              style={inp}
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value })
              }
            >
              <option value="">Select role...</option>
              <option>Student</option>
              <option>Teacher / Educator</option>
              <option>School / Institution</option>
              <option>Other</option>
            </select>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={lbl}>Subject</label>
            <input
              style={inp}
              value={form.subject}
              onChange={(e) =>
                setForm({ ...form, subject: e.target.value })
              }
            />
          </div>

          <div style={{ marginBottom: "1.2rem" }}>
            <label style={lbl}>Message</label>
            <textarea
              style={{ ...inp, minHeight: 110, resize: "vertical" }}
              value={form.message}
              onChange={(e) =>
                setForm({ ...form, message: e.target.value })
              }
            />
          </div>

          <button
            className="qm-btn-p"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              ...S.btnPrimary,
              width: "100%",
              justifyContent: "center",
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Sending..." : <>Send Message <Send size={16} /></>}
          </button>

          {sent && (
            <div
              style={{
                marginTop: 12,
                background: "rgba(138,154,110,0.12)",
                border: "1px solid rgba(138,154,110,0.35)",
                borderRadius: 8,
                padding: "10px 14px",
                color: "#5F7248",
                fontSize: "0.875rem",
                textAlign: "center",
              }}
            >
              Message sent successfully! We'll reply soon.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── FOOTER ─────────────────────────────────────────────── */
function Footer({ setPage }) {
  const navigate = useNavigate();
  const S = useStyles();
  const go = (p) => {
    if (typeof p === "string" && p.startsWith("/")) {
      navigate(p);
    } else {
      setPage(p);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const cols = [
    { title: "Quick Links", links: [["Home","home"],["Features","home"],["Mock Test","/mock-test"],["Contact","contact"]] },
    { title: "Platform",    links: [["Student Login","home"],["Teacher Login","home"],["Register Free","home"],["Browse Quizzes","mock-tests"]] },
    { title: "Legal",       links: [["Privacy Policy","home"],["Terms of Service","home"],["Cookie Policy","home"],["Accessibility","home"]] },
  ];

  return (
    <footer style={{ background: "#191510", color: "#A69C8C", padding: "4rem 5% 2rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="qm-footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "2.5rem", marginBottom: "2.5rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: S.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#FBF7EF", fontFamily: "'Source Serif 4', serif", fontWeight: 700, fontSize: "1rem" }}>Q</span>
              </div>
              <span style={{ fontFamily: "'Source Serif 4', serif", fontWeight: 700, fontSize: "1.15rem", color: "#F2ECE0" }}>QuizMatrix</span>
            </div>
            <p style={{ fontSize: "0.875rem", lineHeight: 1.75, maxWidth: 260, marginBottom: 20 }}>Smart online quizzes for the modern classroom. Built for students, designed for teachers.</p>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { icon: <Instagram size={17} />, name: "Instagram", link: "https://instagram.com/your_username" },
                { icon: <Facebook size={17} />,  name: "Facebook",  link: "https://facebook.com/your_username" },
                { icon: <Github size={17} />,    name: "GitHub",    link: "https://github.com/ujjwal-kumar04" },
                { icon: <Linkedin size={17} />,  name: "LinkedIn",  link: "https://linkedin.com/in/your_profile" },
              ].map((item) => (
                <a
                  key={item.name}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={item.name}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: "rgba(242,236,224,0.05)",
                    border: "1px solid rgba(242,236,224,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#A69C8C",
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = S.accent; e.currentTarget.style.color = "#FBF7EF"; e.currentTarget.style.borderColor = S.accent; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(242,236,224,0.05)"; e.currentTarget.style.color = "#A69C8C"; e.currentTarget.style.borderColor = "rgba(242,236,224,0.1)"; }}
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>
          {cols.map(col => (
            <div key={col.title}>
              <h4 style={{ color: "#F2ECE0", fontWeight: 700, fontSize: "0.88rem", marginBottom: 14 }}>{col.title}</h4>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {col.links.map(([label, pg]) => (
                  <li key={label}>
                    <span onClick={() => go(pg)} style={{ color: "#7A7266", fontSize: "0.85rem", cursor: "pointer" }}
                      onMouseEnter={e => e.target.style.color = "#A69C8C"}
                      onMouseLeave={e => e.target.style.color = "#7A7266"}>
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(242,236,224,0.08)", paddingTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <p style={{ fontSize: "0.8rem" }}>© 2026 QuizMatrix. All rights reserved. Built with care for learners.</p>
          <p style={{ fontSize: "0.75rem", color: "#4A443A" }}>Secure · Fast · Reliable</p>
        </div>
      </div>
    </footer>
  );
}

/* ─── HOMEPAGE ───────────────────────────────────────────── */
function HomePage({ setPage }) {
  return (
    <>
      <Hero setPage={setPage} />
      <Features />
      <HowItWorks />
      <CTAStrip setPage={setPage} />
      <Footer setPage={setPage} />
    </>
  );
}

/* ─── ROOT APP ───────────────────────────────────────────── */
export default function App() {
  const [page, setPage] = useState("home");
  useEffect(() => { window.scrollTo({ top: 0 }); }, [page]);

  const S = useStyles();

  return (
    <div style={S.page}>
      <Navbar page={page} setPage={setPage} />
      {page === "home"    && <HomePage setPage={setPage} />}
      {page === "contact" && <><ContactPage /><Footer setPage={setPage} /></>}
    </div>
  );
}