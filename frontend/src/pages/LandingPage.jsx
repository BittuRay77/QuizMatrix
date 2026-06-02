import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

/* ─── DATA ─────────────────────────────────────────────────────────────── */

const NAV_LINKS = ['Features', 'How it works', 'For you', 'Testimonials'];

const PROBLEMS = [
  { label: 'Late feedback after interviews', icon: ClockIcon },
  { label: 'No personalized role guidance', icon: UsersIcon },
  { label: 'Hard to track actual growth', icon: TrendingIcon },
  { label: 'Inconsistent quality across tools', icon: ShieldIcon },
];

const FEATURES = [
  {
    icon: BrainIcon,
    title: 'AI Mock Interviews',
    desc: 'Role-specific sessions with dynamic questions and structured scoring rubrics tailored to your target role.',
  },
  {
    icon: MicIcon,
    title: 'Voice + Text Answers',
    desc: 'Respond naturally via microphone or type your answers, then review detailed instant feedback after each session.',
  },
  {
    icon: ChartIcon,
    title: 'Performance Analytics',
    desc: 'Track communication, relevance, technical depth, and behavioral fit with clean visual dashboards.',
  },
  {
    icon: BriefcaseIcon,
    title: 'Role & Difficulty Modes',
    desc: 'Practice frontend, backend, and HR rounds across easy, medium, and hard challenges mapped to real job descriptions.',
  },
  {
    icon: FileIcon,
    title: 'Mock Tests & Exam Engine',
    desc: 'Generate exam-ready practice with timed assessments and teacher-created question sets for structured learning.',
  },
  {
    icon: MessageIcon,
    title: 'Community Learning',
    desc: 'Forums, study groups, and doubt discussion spaces to accelerate preparation through peer-driven collaboration.',
  },
];

const STEPS = [
  { num: '01', title: 'Select role and mode', desc: 'Pick role, interview type, and difficulty. Resume mode personalizes the session to your background.' },
  { num: '02', title: 'Take AI-guided practice', desc: 'Answer timed questions through voice or text while the system tracks context, clarity, and confidence.' },
  { num: '03', title: 'Review actionable feedback', desc: 'Get scorecards, strengths, gaps, and improvement suggestions instantly after each session.' },
  { num: '04', title: 'Improve with dashboard loops', desc: 'Use history, mock tests, and study materials to continuously raise performance across every metric.' },
];

const TESTIMONIALS = [
  { name: 'Aman Verma', role: 'Final-year CSE student', initials: 'AV', quote: 'The AI interview feedback felt like a real mentor. My confidence in technical rounds improved within two weeks.' },
  { name: 'Priya Singh', role: 'Training coordinator', initials: 'PS', quote: 'Teacher dashboards and exam workflows helped us evaluate students faster with much better clarity.' },
  { name: 'Rohan Das', role: 'Backend developer intern', initials: 'RD', quote: 'The combination of mock tests and AI interview analytics made preparation structured and measurable.' },
];

const TYPING_LINES = [
  'Great structure. You explained trade-offs clearly.',
  'Improve by quantifying impact with a metric.',
  'Next target: reduce filler words by 15%.',
];

const BAR_DATA = [44, 58, 51, 62, 77, 81, 86];
const BAR_LABELS = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'];

/* ─── SVG ICONS (inline, no dep) ───────────────────────────────────────── */

function Icon({ children, size = 20, color = 'currentColor', ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

function ClockIcon(p) {
  return <Icon {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Icon>;
}
function UsersIcon(p) {
  return <Icon {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Icon>;
}
function TrendingIcon(p) {
  return <Icon {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></Icon>;
}
function ShieldIcon(p) {
  return <Icon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Icon>;
}
function BrainIcon(p) {
  return <Icon {...p}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></Icon>;
}
function MicIcon(p) {
  return <Icon {...p}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></Icon>;
}
function ChartIcon(p) {
  return <Icon {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></Icon>;
}
function BriefcaseIcon(p) {
  return <Icon {...p}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></Icon>;
}
function FileIcon(p) {
  return <Icon {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></Icon>;
}
function MessageIcon(p) {
  return <Icon {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></Icon>;
}
function CheckIcon(p) {
  return <Icon size={16} {...p}><polyline points="20 6 9 17 4 12"/></Icon>;
}
function GradCapIcon(p) {
  return <Icon size={24} {...p}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></Icon>;
}
function TeacherIcon(p) {
  return <Icon size={24} {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></Icon>;
}

/* ─── HOOKS ─────────────────────────────────────────────────────────────── */

function useTyping(lines) {
  const [text, setText] = useState('');
  const [li, setLi] = useState(0);
  const [ci, setCi] = useState(0);
  const active = useMemo(() => lines[li], [li, lines]);

  useEffect(() => {
    const done = ci >= active.length;
    const t = setTimeout(() => {
      if (done) {
        setCi(0);
        setLi(p => (p + 1) % lines.length);
        setText('');
      } else {
        setText(active.slice(0, ci + 1));
        setCi(p => p + 1);
      }
    }, done ? 1400 : 42);
    return () => clearTimeout(t);
  }, [active, ci, lines]);

  return text;
}

function useFadeIn() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function useBarAnimate() {
  const ref = useRef(null);
  const [heights, setHeights] = useState(BAR_DATA.map(() => 0));
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          BAR_DATA.forEach((v, i) => {
            setTimeout(() => setHeights(prev => {
              const next = [...prev]; next[i] = v; return next;
            }), i * 70);
          });
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, heights];
}

/* ─── SMALL COMPONENTS ──────────────────────────────────────────────────── */

function FadeSection({ children, className = '', style = {} }) {
  const [ref, visible] = useFadeIn();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: 'opacity 0.65s ease, transform 0.65s ease',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Eyebrow({ children }) {
  return (
    <p style={{
      fontSize: 11, fontWeight: 500, letterSpacing: '0.18em',
      textTransform: 'uppercase', color: '#3b82f6', marginBottom: 12,
    }}>
      {children}
    </p>
  );
}

function SectionTitle({ children, style = {} }) {
  return (
    <h2 style={{
      fontFamily: "'DM Serif Display', serif",
      fontSize: 'clamp(28px, 3.8vw, 46px)',
      lineHeight: 1.12, letterSpacing: '-0.5px',
      color: '#e8edf5', marginBottom: 12, ...style,
    }}>
      {children}
    </h2>
  );
}

function SectionDesc({ children }) {
  return (
    <p style={{ color: '#8fa3be', fontSize: 16, lineHeight: 1.8, maxWidth: 540, marginBottom: 40 }}>
      {children}
    </p>
  );
}

/* ─── MAIN COMPONENT ────────────────────────────────────────────────────── */

const LandingPage = () => {
  const typedText = useTyping(TYPING_LINES);
  const [barRef, barHeights] = useBarAnimate();

  /* ── styles object (kept here to avoid Tailwind purge issues) ── */
  const S = styles;

  return (
    <div style={S.root}>
      {/* Google Font */}
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap"
        rel="stylesheet"
      />

      {/* ── NAV ── */}
      <nav style={S.nav}>
        <div style={S.navLogo}>
          Quiz<span style={{ background: 'linear-gradient(135deg,#3b82f6,#14b8a6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Matrix</span>
        </div>
        <ul style={S.navLinks}>
          {NAV_LINKS.map(l => (
            <li key={l}>
              <a href={`#${l.toLowerCase().replace(/ /g, '-')}`} style={S.navLink}
                onMouseEnter={e => e.target.style.color = '#e8edf5'}
                onMouseLeave={e => e.target.style.color = '#8fa3be'}
              >{l}</a>
            </li>
          ))}
        </ul>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/login" style={S.btnGhost}>Log in</Link>
          <Link to="/register" style={S.btnPrimary}>Get started →</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={S.hero}>
        <div style={S.heroBg} />
        <FadeSection>
          <div style={S.heroEyebrow}>
            <span style={S.pulseDot} />
            AI-powered interview preparation
          </div>
        </FadeSection>
        <FadeSection style={{ transitionDelay: '0.08s' }}>
          <h1 style={S.heroH1}>
            Interview prep that<br />actually <em style={S.heroEm}>works</em>
          </h1>
        </FadeSection>
        <FadeSection style={{ transitionDelay: '0.16s' }}>
          <p style={S.heroSub}>
            Structured AI mock interviews, real-time feedback, and analytics — all in one workspace built for modern learners and educators.
          </p>
        </FadeSection>
        <FadeSection style={{ transitionDelay: '0.22s' }}>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={S.btnPrimary}>Start for free →</Link>
            <a href="#features" style={S.btnGhost}>See how it works</a>
          </div>
        </FadeSection>
        <FadeSection style={{ transitionDelay: '0.3s' }}>
          <div style={S.heroStats}>
            {[['42k+', 'Practice sessions'], ['94%', 'Confidence gain'], ['4.8★', 'User rating']].map(([n, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <span style={{ display: 'block', fontFamily: "'DM Serif Display', serif", fontSize: 34, color: '#e8edf5' }}>{n}</span>
                <span style={{ display: 'block', fontSize: 13, color: '#4d6480', marginTop: 2 }}>{l}</span>
              </div>
            ))}
          </div>
        </FadeSection>
      </section>

      {/* ── PROBLEM ── */}
      <section id="problem" style={S.section}>
        <div style={S.container}>
          <FadeSection><Eyebrow>The challenge</Eyebrow></FadeSection>
          <FadeSection><SectionTitle>Preparation is fragmented — feedback always arrives too late</SectionTitle></FadeSection>
          <FadeSection><SectionDesc>Most learners juggle random question banks, one-off mock tests, and generic advice. There is no real interview simulation loop.</SectionDesc></FadeSection>
          <FadeSection>
            <div style={S.grid4}>
              {PROBLEMS.map(({ label, icon: Ic }) => (
                <div key={label} style={S.problemCard}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#253448'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#1e2d42'}
                >
                  <div style={S.problemIconWrap}><Ic size={18} color="#93c5fd" /></div>
                  <p style={{ fontSize: 13, color: '#8fa3be', lineHeight: 1.65 }}>{label}</p>
                </div>
              ))}
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── SOLUTION ── */}
      <section id="solution" style={{ ...S.section, background: '#0d1117', borderTop: '0.5px solid #1e2d42', borderBottom: '0.5px solid #1e2d42' }}>
        <div style={S.container}>
          <FadeSection><Eyebrow>The solution</Eyebrow></FadeSection>
          <FadeSection><SectionTitle>One intelligent workspace from practice to performance</SectionTitle></FadeSection>
          <FadeSection><SectionDesc>QuizMatrix unifies interview simulation, exams, mock tests, discussion forums, and analytics into one smooth experience.</SectionDesc></FadeSection>
          <FadeSection>
            <div style={S.grid2}>
              {/* Why us */}
              <div style={S.card}>
                <h3 style={{ fontSize: 17, fontWeight: 500, color: '#e8edf5', marginBottom: 20 }}>Why teams choose QuizMatrix</h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    'AI interviews aligned to actual hiring rounds',
                    'Teacher and student workflows in one product',
                    'Continuous analytics instead of one-time scores',
                    'Real-time feedback for faster learning loops',
                  ].map(pt => (
                    <li key={pt} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: '#8fa3be', lineHeight: 1.65 }}>
                      <CheckIcon color="#3b82f6" style={{ marginTop: 2, flexShrink: 0 }} />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
              {/* AI feed */}
              <div style={S.card}>
                <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#3b82f6', marginBottom: 14 }}>AI feedback stream</p>
                <div style={S.feedbackBox}>
                  <span style={{ fontSize: 14, color: '#8fa3be', lineHeight: 1.7 }}>{typedText}</span>
                  <span style={S.cursor} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
                  {[['Communication', '84', '#3b82f6'], ['Technical', '79', '#14b8a6']].map(([label, val, col]) => (
                    <div key={label} style={S.scoreTile}>
                      <p style={{ fontSize: 11, color: '#4d6480', marginBottom: 6 }}>{label}</p>
                      <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: col }}>{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={S.section}>
        <div style={S.container}>
          <FadeSection><Eyebrow>Feature suite</Eyebrow></FadeSection>
          <FadeSection><SectionTitle>Everything you need for interview success</SectionTitle></FadeSection>
          <FadeSection><SectionDesc>Built for modern learners and institutions with role-based intelligence and fast execution.</SectionDesc></FadeSection>
          <FadeSection>
            <div style={S.grid3}>
              {FEATURES.map(({ icon: Ic, title, desc }) => (
                <FeatureCard key={title} Icon={Ic} title={title} desc={desc} />
              ))}
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ ...S.section, background: '#0d1117', borderTop: '0.5px solid #1e2d42', borderBottom: '0.5px solid #1e2d42' }}>
        <div style={S.container}>
          <FadeSection><Eyebrow>How it works</Eyebrow></FadeSection>
          <FadeSection><SectionTitle>A practical 4-step preparation loop</SectionTitle></FadeSection>
          <FadeSection>
            <div style={S.grid4}>
              {STEPS.map(({ num, title, desc }) => (
                <div key={num} style={S.stepCard}>
                  <div style={S.stepNum}>{num}</div>
                  <h3 style={{ fontSize: 14, fontWeight: 500, color: '#e8edf5', marginBottom: 8, lineHeight: 1.45 }}>{title}</h3>
                  <p style={{ fontSize: 13, color: '#4d6480', lineHeight: 1.7 }}>{desc}</p>
                </div>
              ))}
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── ROLES ── */}
      <section id="for-you" style={S.section}>
        <div style={S.container}>
          <FadeSection><Eyebrow>Role-based product</Eyebrow></FadeSection>
          <FadeSection><SectionTitle>Built for both learners and educators</SectionTitle></FadeSection>
          <FadeSection><SectionDesc>Two tailored experiences, one unified platform, shared outcomes.</SectionDesc></FadeSection>
          <FadeSection>
            <div style={S.grid2}>
              <RoleCard
                icon={<GradCapIcon color="#93c5fd" />}
                iconBg="rgba(59,130,246,0.1)"
                title="For students"
                dotColor="#3b82f6"
                items={[
                  'AI mock interviews with voice and text input',
                  'Mock tests and previous year papers',
                  'Personal history and growth dashboard',
                  'Community forums and doubt resolution',
                ]}
              />
              <RoleCard
                icon={<TeacherIcon color="#6ee7b7" />}
                iconBg="rgba(16,185,129,0.1)"
                title="For teachers"
                dotColor="#10b981"
                items={[
                  'Create and manage exams with access keys',
                  'Track student submissions and analytics',
                  'Upload study materials and past papers',
                  'Detailed batch-level performance insights',
                ]}
              />
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── DASHBOARD ── */}
      <section id="dashboard" style={{ ...S.section, background: '#0d1117', borderTop: '0.5px solid #1e2d42', borderBottom: '0.5px solid #1e2d42' }}>
        <div style={S.container}>
          <FadeSection><Eyebrow>Dashboard preview</Eyebrow></FadeSection>
          <FadeSection><SectionTitle>Clarity-first analytics at a glance</SectionTitle></FadeSection>
          <FadeSection>
            <div style={{ ...S.card, borderRadius: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
                {[['Interviews completed', '42'], ['Average confidence', '81%'], ['Skill growth', '+26%']].map(([l, v]) => (
                  <div key={l} style={S.scoreTile}>
                    <p style={{ fontSize: 12, color: '#4d6480', marginBottom: 8 }}>{l}</p>
                    <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#e8edf5' }}>{v}</p>
                  </div>
                ))}
              </div>
              {/* Bar chart */}
              <div ref={barRef} style={S.chartArea}>
                {BAR_DATA.map((_, i) => (
                  <div key={i} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: '100%', borderRadius: '4px 4px 0 0',
                      background: 'linear-gradient(180deg,#3b82f6,#1d4ed8)',
                      height: `${barHeights[i]}%`,
                      transition: 'height 0.9s cubic-bezier(0.34,1.56,0.64,1)',
                    }} />
                    <span style={{ fontSize: 10, color: '#4d6480' }}>{BAR_LABELS[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── AI PREVIEW ── */}
      <section id="ai-preview" style={S.section}>
        <div style={S.container}>
          <FadeSection><Eyebrow>AI interview experience</Eyebrow></FadeSection>
          <FadeSection><SectionTitle>Interactive UX with real-time guidance</SectionTitle></FadeSection>
          <FadeSection>
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 16 }}>
              {/* Question card */}
              <div style={S.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#e8edf5' }}>Question card</p>
                  <span style={{ background: 'rgba(239,68,68,0.1)', border: '0.5px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 12, fontWeight: 500, padding: '4px 12px', borderRadius: 100 }}>00:34</span>
                </div>
                <div style={{ ...S.innerBox, marginBottom: 12 }}>
                  <p style={{ fontSize: 14, color: '#8fa3be', lineHeight: 1.8 }}>
                    Explain how you would improve API latency while ensuring data consistency across distributed services.
                  </p>
                </div>
                <div style={{ ...S.innerBox, height: 96 }}>
                  <p style={{ fontSize: 12, color: '#4d6480', marginBottom: 10 }}>Answer draft...</p>
                  <div style={{ height: 8, borderRadius: 4, background: '#1e2d42', width: '72%', marginBottom: 8, animation: 'shimmer 1.5s ease-in-out infinite alternate' }} />
                  <div style={{ height: 8, borderRadius: 4, background: '#1e2d42', width: '48%', animation: 'shimmer 1.5s ease-in-out infinite alternate' }} />
                </div>
              </div>
              {/* Coaching */}
              <div style={S.card}>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#e8edf5', marginBottom: 14 }}>Instant AI coaching</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(59,130,246,0.08)', border: '0.5px solid rgba(59,130,246,0.2)', fontSize: 13, color: '#93c5fd', lineHeight: 1.65 }}>
                    Good structure: context → action → outcome.
                  </div>
                  <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(245,158,11,0.08)', border: '0.5px solid rgba(245,158,11,0.2)', fontSize: 13, color: '#fcd34d', lineHeight: 1.65 }}>
                    Add one metric to strengthen impact.
                  </div>
                  <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '0.5px solid rgba(16,185,129,0.2)', fontSize: 13, color: '#6ee7b7', lineHeight: 1.65 }}>
                    Excellent technical clarity throughout.
                  </div>
                </div>
                <Link to="/login" style={{ ...S.btnPrimary, display: 'inline-block', marginTop: 18, textDecoration: 'none' }}>
                  Try live interview →
                </Link>
              </div>
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" style={{ ...S.section, background: '#0d1117', borderTop: '0.5px solid #1e2d42', borderBottom: '0.5px solid #1e2d42' }}>
        <div style={S.container}>
          <FadeSection><Eyebrow>Loved by learners</Eyebrow></FadeSection>
          <FadeSection><SectionTitle>What users say</SectionTitle></FadeSection>
          <FadeSection>
            <div style={S.grid3}>
              {TESTIMONIALS.map(({ name, role, initials, quote }) => (
                <div key={name} style={S.card}>
                  <p style={{ fontSize: 14, color: '#8fa3be', lineHeight: 1.85, fontStyle: 'italic', marginBottom: 20 }}>
                    "{quote}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: '#93c5fd', flexShrink: 0 }}>
                      {initials}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#e8edf5' }}>{name}</p>
                      <p style={{ fontSize: 12, color: '#4d6480' }}>{role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ ...S.section, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: -200, left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle,rgba(59,130,246,0.1) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <FadeSection><Eyebrow>Get started today</Eyebrow></FadeSection>
        <FadeSection>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(30px,4.5vw,54px)', letterSpacing: '-0.8px', color: '#e8edf5', maxWidth: 680, margin: '0 auto 16px', lineHeight: 1.12 }}>
            Ready to ace your next interview?
          </h2>
        </FadeSection>
        <FadeSection>
          <p style={{ color: '#8fa3be', fontSize: 16, maxWidth: 460, margin: '0 auto 36px', lineHeight: 1.8 }}>
            Join thousands of learners and educators building real skills with AI-powered precision.
          </p>
        </FadeSection>
        <FadeSection>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={S.btnPrimary}>Start for free →</Link>
            <a href="mailto:demo@quizmatrix.com" style={S.btnGhost}>Schedule a demo</a>
          </div>
        </FadeSection>
      </section>

      {/* ── FOOTER ── */}
      <footer style={S.footer}>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: '#8fa3be' }}>
          Quiz<span style={{ color: '#3b82f6' }}>Matrix</span>
        </div>
        <p style={{ fontSize: 13, color: '#4d6480' }}>© 2025 QuizMatrix. All rights reserved.</p>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Privacy', 'Terms', 'Contact'].map(l => (
            <a key={l} href="#" style={{ fontSize: 13, color: '#4d6480', textDecoration: 'none' }}
              onMouseEnter={e => e.target.style.color = '#8fa3be'}
              onMouseLeave={e => e.target.style.color = '#4d6480'}
            >{l}</a>
          ))}
        </div>
      </footer>

      {/* shimmer keyframes */}
      <style>{`
        @keyframes shimmer { from { opacity: 0.4 } to { opacity: 0.9 } }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.4)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  );
};

/* ─── SUB-COMPONENTS ────────────────────────────────────────────────────── */

function FeatureCard({ Icon, title, desc }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        background: '#0d1117',
        border: `0.5px solid ${hovered ? '#253448' : '#1e2d42'}`,
        borderRadius: 14,
        padding: '1.75rem',
        position: 'relative',
        overflow: 'hidden',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.25s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg,#3b82f6,#14b8a6)',
        opacity: hovered ? 1 : 0, transition: 'opacity 0.3s',
      }} />
      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(59,130,246,0.08)', border: '0.5px solid rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
        <Icon size={20} color="#93c5fd" />
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 500, color: '#e8edf5', marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: 13, color: '#4d6480', lineHeight: 1.72 }}>{desc}</p>
    </div>
  );
}

function RoleCard({ icon, iconBg, title, dotColor, items }) {
  return (
    <div style={styles.card}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#253448'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#1e2d42'}
    >
      <div style={{ width: 48, height: 48, borderRadius: 12, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
        {icon}
      </div>
      <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#e8edf5', marginBottom: 16 }}>{title}</h3>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map(item => (
          <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: '#8fa3be', lineHeight: 1.6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, flexShrink: 0, marginTop: 7 }} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─── STYLE TOKENS ──────────────────────────────────────────────────────── */

const styles = {
  root: {
    minHeight: '100vh',
    background: '#07090f',
    color: '#e8edf5',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 15,
    lineHeight: 1.7,
    overflowX: 'hidden',
  },
  nav: {
    position: 'sticky', top: 0, zIndex: 100,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 3rem', height: 64,
    background: 'rgba(7,9,15,0.88)', backdropFilter: 'blur(16px)',
    borderBottom: '0.5px solid #1e2d42',
  },
  navLogo: { fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#e8edf5', letterSpacing: '-0.3px' },
  navLinks: { display: 'flex', gap: '2rem', listStyle: 'none' },
  navLink: { color: '#8fa3be', textDecoration: 'none', fontSize: 14, fontWeight: 400, transition: 'color 0.2s' },
  btnPrimary: {
    background: '#3b82f6', color: '#fff', border: 'none',
    padding: '11px 24px', borderRadius: 9, fontSize: 14, fontWeight: 500,
    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
    textDecoration: 'none', display: 'inline-block',
    transition: 'background 0.2s, transform 0.15s',
  },
  btnGhost: {
    background: 'transparent', color: '#8fa3be',
    border: '0.5px solid #253448', padding: '11px 24px',
    borderRadius: 9, fontSize: 14, fontWeight: 400,
    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
    textDecoration: 'none', display: 'inline-block',
    transition: 'border-color 0.2s, color 0.2s',
  },
  hero: {
    minHeight: '88vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    textAlign: 'center', padding: '6rem 2rem 4rem',
    position: 'relative', overflow: 'hidden',
  },
  heroBg: {
    position: 'absolute', top: -220, left: '50%', transform: 'translateX(-50%)',
    width: 720, height: 720,
    background: 'radial-gradient(circle,rgba(59,130,246,0.11) 0%,transparent 68%)',
    pointerEvents: 'none',
  },
  heroEyebrow: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: 'rgba(59,130,246,0.09)', border: '0.5px solid rgba(59,130,246,0.28)',
    color: '#93c5fd', fontSize: 12, fontWeight: 500,
    letterSpacing: '0.12em', textTransform: 'uppercase',
    padding: '5px 16px', borderRadius: 100, marginBottom: 28,
  },
  pulseDot: {
    display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
    background: '#3b82f6', animation: 'pulse-dot 2s infinite',
  },
  heroH1: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 'clamp(42px, 6vw, 80px)',
    lineHeight: 1.08, letterSpacing: '-1.5px',
    color: '#e8edf5', maxWidth: 820, marginBottom: 20,
  },
  heroEm: {
    fontStyle: 'italic',
    background: 'linear-gradient(135deg,#3b82f6,#14b8a6)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  heroSub: { color: '#8fa3be', fontSize: 17, maxWidth: 540, lineHeight: 1.8, marginBottom: 36 },
  heroStats: {
    display: 'flex', gap: '3rem', marginTop: '3.5rem',
    paddingTop: '3rem', borderTop: '0.5px solid #1e2d42',
  },
  section: { padding: '6rem 3rem', background: '#07090f' },
  container: { maxWidth: 1080, margin: '0 auto' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 },
  card: {
    background: '#0d1117', border: '0.5px solid #1e2d42',
    borderRadius: 16, padding: '1.875rem', transition: 'border-color 0.2s',
  },
  problemCard: {
    background: '#0d1117', border: '0.5px solid #1e2d42',
    borderRadius: 12, padding: '1.5rem', transition: 'border-color 0.2s',
  },
  problemIconWrap: {
    width: 36, height: 36, borderRadius: 8,
    background: 'rgba(59,130,246,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  stepCard: {
    background: '#0d1117', border: '0.5px solid #1e2d42',
    borderRadius: 12, padding: '1.5rem',
  },
  stepNum: {
    fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#3b82f6',
    marginBottom: 12, letterSpacing: '-0.5px',
  },
  feedbackBox: {
    background: '#111827', border: '0.5px solid #1e2d42',
    borderRadius: 10, padding: '1rem', minHeight: 64,
  },
  cursor: {
    display: 'inline-block', width: 2, height: 14,
    background: '#3b82f6', marginLeft: 2, verticalAlign: 'middle',
    animation: 'blink 1s step-end infinite',
  },
  scoreTile: {
    background: '#111827', border: '0.5px solid #1e2d42',
    borderRadius: 10, padding: '1rem',
  },
  chartArea: {
    background: '#111827', border: '0.5px solid #1e2d42',
    borderRadius: 12, padding: '1.25rem 1.5rem 1rem',
    height: 150, display: 'flex', alignItems: 'flex-end', gap: 10,
  },
  innerBox: {
    background: '#111827', border: '0.5px solid #1e2d42',
    borderRadius: 10, padding: '1rem',
  },
  footer: {
    padding: '2.5rem 3rem', borderTop: '0.5px solid #1e2d42',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
};

export default LandingPage;
