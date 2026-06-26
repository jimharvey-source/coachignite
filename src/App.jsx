import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://fdiitxhgfytvlbtokbok.supabase.co",
  "sb_publishable_JQMFDaTz5g-2ZlitosUTeA_C9B48-Lc"
);

const ORANGE = "#FF9800";
const ORANGE_LIGHT = "#FFF8F0";
const ORANGE_DARK = "#E65100";

const COLORS = {
  navy: "#0F2A4A",
  navyMid: "#1A3D6B",
  orange: ORANGE,
  orangeLight: ORANGE_LIGHT,
  orangeDark: ORANGE_DARK,
  slate: "#64748B",
  slateLight: "#F8FAFC",
  border: "#E2E8F0",
  text: "#0F172A",
  muted: "#64748B",
  white: "#FFFFFF",
  amber: "#D97706",
  amberLight: "#FFFBEB",
  red: "#DC2626",
  green: "#16A34A",
  greenLight: "#F0FDF4",
  blue: "#2563EB",
  blueLight: "#EFF6FF",
};

// ─── Challenge / Support Zone ────────────────────────────────────────────────

function getChallengeZone(skillLevel, confidenceLevel) {
  const highSkill = skillLevel === "High";
  const medSkill = skillLevel === "Medium";
  const highConf = confidenceLevel === "High";
  const medConf = confidenceLevel === "Medium";
  const lowConf = confidenceLevel === "Low";
  const lowSkill = skillLevel === "Low";

  if (highSkill && highConf) return {
    zone: "Growth Zone",
    color: COLORS.green, colorLight: COLORS.greenLight, icon: "🚀",
    summary: "High capability, high confidence. This person is ready to be stretched and will thrive with the right challenge. Your coaching here is about unlocking potential, not building basics.",
    managerGuidance: "Set high expectations and give genuine autonomy. Ask questions that push their thinking rather than directing. Your role is to challenge assumptions and help them see further than they currently do.",
    supportLevel: "High challenge, lighter touch support. Monthly coaching rhythm."
  };
  if (highSkill && medConf) return {
    zone: "Growth Zone",
    color: COLORS.green, colorLight: COLORS.greenLight, icon: "✅",
    summary: "Strong capability but not fully confident in it. Your coaching should surface the evidence of their competence and help them trust what they already know.",
    managerGuidance: "Focus on building confidence through evidence. Remind them of past successes. Ask them what they would advise someone else in this situation — they usually know the answer.",
    supportLevel: "Moderate support. Regular check-ins focused on reinforcing capability."
  };
  if (medSkill && medConf) return {
    zone: "Growth Zone",
    color: COLORS.green, colorLight: COLORS.greenLight, icon: "📈",
    summary: "Building capability with reasonable confidence. Good coaching territory — they are open to learning and have enough confidence to engage honestly with development areas.",
    managerGuidance: "Balance challenge with support. Introduce stretch gradually. Use the GROW sequence carefully — ensure they leave each conversation with clarity and commitment, not just a list of things to improve.",
    supportLevel: "Regular structured support. Fortnightly coaching conversations."
  };
  if (lowSkill && highConf) return {
    zone: "Danger Zone",
    color: COLORS.red, colorLight: "#FEF2F2", icon: "⚠️",
    summary: "High confidence masking genuine skill gaps is one of the most delicate coaching situations. They may not fully see the gap — or may be defensive about it. Handle with care.",
    managerGuidance: "Do not let confidence do the work of competence. Create space for honest reflection without deflating them. Use reality-checking questions carefully. Agree specific, measurable development steps.",
    supportLevel: "Intensive coaching. Weekly sessions with clear milestones and agreed measures of progress."
  };
  if (lowSkill && lowConf) return {
    zone: "Danger Zone",
    color: COLORS.red, colorLight: "#FEF2F2", icon: "⚠️",
    summary: "Low skill and low confidence together require careful, structured support. This person needs both practical capability-building and consistent encouragement — in that order.",
    managerGuidance: "Start with small, achievable wins. Build confidence through success before raising the bar. Coaching questions need to be carefully chosen — open-ended questions can feel overwhelming at this stage. Be more directive than usual.",
    supportLevel: "Intensive support. Weekly sessions, very clear actions, short feedback loops."
  };
  if (lowSkill && medConf) return {
    zone: "Moderate Challenge",
    color: COLORS.amber, colorLight: COLORS.amberLight, icon: "📊",
    summary: "Developing skill with reasonable confidence. Good foundation for coaching — they are willing but need structured support to build the right capabilities.",
    managerGuidance: "Focus on one development area at a time. Use GROW to build clear action plans. Celebrate progress visibly — it reinforces the link between effort and improvement.",
    supportLevel: "Regular support. Weekly or fortnightly coaching with structured action review."
  };
  if (highSkill && lowConf) return {
    zone: "Coasting",
    color: COLORS.amber, colorLight: COLORS.amberLight, icon: "😐",
    summary: "High skill, low confidence — often the most frustrating combination for a manager to witness. This person is capable of far more than they are doing. The blocker is internal.",
    managerGuidance: "The coaching here is entirely confidence-focused. Surface evidence of their competence. Ask them what they notice about their own performance. Avoid over-praising — instead, help them develop their own accurate self-assessment.",
    supportLevel: "Focused support. Regular coaching conversations centred on confidence and self-belief."
  };
  return {
    zone: "Moderate Challenge",
    color: COLORS.amber, colorLight: COLORS.amberLight, icon: "📊",
    summary: "A mixed profile — some capability, some confidence. The right coaching approach depends on which factor is the limiting one. Explore both before settling on an approach.",
    managerGuidance: "Start by establishing which factor — skill or confidence — is the main limiter right now. Then direct your coaching questions accordingly.",
    supportLevel: "Regular structured support. Fortnightly coaching conversations."
  };
}

// ─── Cadence ─────────────────────────────────────────────────────────────────

function getCadenceGuidance(skillLevel, confidenceLevel, coachingGoal) {
  const lowSkill = skillLevel === "Low";
  const highSkill = skillLevel === "High";
  const lowConf = confidenceLevel === "Low";
  const highConf = confidenceLevel === "High";

  if (lowSkill || lowConf) return {
    frequency: "Weekly coaching sessions",
    format: "Structured 30-minute conversation with agreed actions and written follow-up",
    rationale: "Developing skill or confidence requires consistent contact. Weekly sessions catch problems early and ensure momentum is maintained between conversations.",
    managerNote: "Book weekly 30-minute sessions. Come prepared with 2–3 coaching questions focused on progress, blockers, and next steps. Keep a brief written record of what was agreed.",
    delegateeNote: "I would like us to meet weekly while you are working through this — 30 minutes, with a brief update from you beforehand covering what progress you have made and what you would like to think through together."
  };
  if (highSkill && highConf) return {
    frequency: "Monthly coaching conversation",
    format: "60-minute development conversation with written reflection beforehand",
    rationale: "A highly capable, confident person does not need close coaching oversight. Monthly gives space for genuine reflection and keeps the development relationship alive without becoming management.",
    managerNote: "Monthly sessions — 60 minutes, with a written reflection from them in advance. Focus on bigger questions: what are they learning, where are they heading, what would they want to be doing differently in twelve months?",
    delegateeNote: "I would like a monthly conversation — not a progress check, a development conversation. I will ask you to send a brief written reflection beforehand so we can use the time well."
  };
  if (coachingGoal === "reflection") return {
    frequency: "Single structured debrief session",
    format: "60-minute post-event coaching conversation",
    rationale: "Reflective coaching after a significant event requires depth rather than frequency. One well-structured session with the right questions produces more learning than several brief check-ins.",
    managerNote: "Book a 60-minute session within a week of the event. Come with GROW questions prepared. The goal is insight and commitment, not evaluation.",
    delegateeNote: "I would like to set aside 60 minutes to think through what happened together. This is not a review — it is a conversation to help you extract the learning."
  };
  return {
    frequency: "Fortnightly coaching check-in",
    format: "30-minute structured conversation with brief written update beforehand",
    rationale: "Fortnightly contact maintains momentum and gives enough space between sessions for real progress to occur. It is close enough to catch problems early without feeling like surveillance.",
    managerNote: "Fortnightly 30-minute sessions. Ask for a brief written update beforehand: what progress, what blockers, what they want to think through. Use the session to coach, not to report.",
    delegateeNote: "I would like a brief update from you a day before each fortnightly session — what progress you have made, what is getting in the way, and what you would like to work through together."
  };
}

// ─── ICS download ────────────────────────────────────────────────────────────

function generateICS({ coachingTopic, personName, managerName, cadence }) {
  const freq = cadence.frequency.toLowerCase();
  let rrule = "RRULE:FREQ=MONTHLY";
  if (freq.includes("weekly")) rrule = "RRULE:FREQ=WEEKLY";
  else if (freq.includes("fortnightly")) rrule = "RRULE:FREQ=WEEKLY;INTERVAL=2";
  const now = new Date(), start = new Date(now);
  start.setDate(now.getDate() + 7);
  const day = start.getDay();
  if (day === 0) start.setDate(start.getDate() + 1);
  if (day === 6) start.setDate(start.getDate() + 2);
  start.setHours(9, 0, 0, 0);
  const end = new Date(start.getTime() + 30 * 60000);
  const pad = (n) => String(n).padStart(2, "0");
  const fmt = (d) => `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const lines = [
    "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//The Message Business//CoachIgnite//EN",
    "CALSCALE:GREGORIAN","METHOD:PUBLISH","BEGIN:VEVENT",
    `UID:coachignite-${Date.now()}@themessagebusiness.com`,
    `SUMMARY:Coaching: ${coachingTopic} — ${personName}`,
    `DTSTART:${fmt(start)}`,`DTEND:${fmt(end)}`,
    `DESCRIPTION:${cadence.managerNote.replace(/\n/g,"\\n")}`,
    `ORGANIZER;CN=${managerName}:mailto:organizer@coachignite.app`,
    rrule,"STATUS:CONFIRMED","BEGIN:VALARM","TRIGGER:-PT15M","ACTION:DISPLAY",
    "DESCRIPTION:Reminder","END:VALARM","END:VEVENT","END:VCALENDAR"
  ].join("\r\n");
  const blob = new Blob([lines], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `coachignite-${personName.replace(/\s+/g,"-").toLowerCase()}.ics`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Local storage ────────────────────────────────────────────────────────────

function getUsageCount() { try { return parseInt(localStorage.getItem("ci_usage") || "0"); } catch { return 0; } }
function incrementUsage() { try { localStorage.setItem("ci_usage", String(getUsageCount() + 1)); } catch {} }
function getSavedSessions() { try { return JSON.parse(localStorage.getItem("ci_saved") || "[]"); } catch { return []; } }
function saveLocalSession(data) {
  try {
    const s = getSavedSessions();
    s.unshift({ ...data, id: Date.now(), date: new Date().toLocaleDateString("en-GB") });
    localStorage.setItem("ci_saved", JSON.stringify(s.slice(0, 20)));
  } catch {}
}

const FREE_LIMIT = 3;

// ─── Reusable components ──────────────────────────────────────────────────────

function Badge({ color, children }) {
  const styles = {
    orange: { bg: COLORS.orangeLight, text: COLORS.orangeDark },
    amber:  { bg: COLORS.amberLight,  text: COLORS.amber },
    green:  { bg: COLORS.greenLight,  text: COLORS.green },
    blue:   { bg: COLORS.blueLight,   text: COLORS.blue },
    purple: { bg: "#F5F3FF", text: "#7C3AED" },
  };
  const s = styles[color] || styles.orange;
  return (
    <span style={{ background: s.bg, color: s.text, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, letterSpacing: "0.04em", textTransform: "uppercase" }}>
      {children}
    </span>
  );
}

function OutputBox({ title, content, badge }) {
  const [copied, setCopied] = useState(false);
  const [text, setText] = useState(content);
  useEffect(() => { setText(content); }, [content]);
  const copy = () => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); };
  const emailIt = () => {
    const s = encodeURIComponent(`CoachIgnite: ${title}`), b = encodeURIComponent(text);
    const a = document.createElement("a"); a.href = `mailto:?subject=${s}&body=${b}`; a.target = "_blank";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };
  const shareIt = async () => {
    if (navigator.share) { try { await navigator.share({ title: `CoachIgnite: ${title}`, text }); } catch { emailIt(); } }
    else { emailIt(); }
  };
  return (
    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: COLORS.slateLight }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy }}>{title}</span>
        {badge && <Badge color={badge.color}>{badge.label}</Badge>}
      </div>
      <div style={{ padding: "8px 12px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", gap: 8 }}>
        <button onClick={copy} style={{ fontSize: 12, padding: "5px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 6, background: copied ? COLORS.greenLight : COLORS.white, color: copied ? COLORS.green : COLORS.slate, cursor: "pointer", fontWeight: 500 }}>{copied ? "Copied" : "Copy"}</button>
        <button onClick={shareIt} style={{ fontSize: 12, padding: "5px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 6, background: COLORS.white, color: COLORS.slate, cursor: "pointer", fontWeight: 500 }}>Share</button>
      </div>
      <textarea value={text} onChange={e => setText(e.target.value)} style={{ width: "100%", minHeight: 280, padding: "16px 20px", border: "none", outline: "none", resize: "vertical", fontSize: 13.5, lineHeight: 1.7, color: COLORS.text, fontFamily: "Georgia, serif", boxSizing: "border-box", background: COLORS.white }} />
    </div>
  );
}

function TextField({ label, value, onChange, placeholder, multiline, required, hint }) {
  const style = { width: "100%", padding: "9px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 14, color: COLORS.text, background: COLORS.white, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.navy, marginBottom: 4 }}>
        {label}{required && <span style={{ color: COLORS.red }}> *</span>}
      </label>
      {hint && <p style={{ fontSize: 12, color: COLORS.muted, margin: "0 0 6px", fontFamily: "sans-serif" }}>{hint}</p>}
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} style={{ ...style, resize: "vertical" }} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={style} />
      }
    </div>
  );
}

function ToggleGroup({ label, value, onChange, options, hint }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.navy, marginBottom: 4 }}>{label}</label>
      {hint && <p style={{ fontSize: 12, color: COLORS.muted, margin: "0 0 8px", fontFamily: "sans-serif" }}>{hint}</p>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {options.map(o => (
          <button key={o.value} onClick={() => onChange(o.value)}
            style={{ padding: "7px 16px", border: `1.5px solid ${value === o.value ? COLORS.orange : COLORS.border}`, borderRadius: 8, background: value === o.value ? COLORS.orangeLight : COLORS.white, color: value === o.value ? COLORS.orangeDark : COLORS.slate, fontSize: 13, fontWeight: value === o.value ? 600 : 400, cursor: "pointer", transition: "all 0.15s" }}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Auth Modal ───────────────────────────────────────────────────────────────

function AuthModal({ onClose }) {
  const [email, setEmail] = useState(""), [sent, setSent] = useState(false), [loading, setLoading] = useState(false), [error, setError] = useState("");
  const send = async () => {
    if (!email.trim()) { setError("Please enter your email."); return; }
    setLoading(true); setError("");
    const { error: e } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: window.location.origin } });
    if (e) { setError(e.message); setLoading(false); return; }
    setSent(true); setLoading(false);
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}>
      <div style={{ background: COLORS.white, borderRadius: 16, padding: "36px 32px", maxWidth: 420, width: "100%" }}>
        {!sent ? (<>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ width: 52, height: 52, background: COLORS.orangeLight, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 22 }}>✉️</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: COLORS.navy, margin: "0 0 8px", fontFamily: "sans-serif" }}>Sign in to CoachIgnite</h2>
            <p style={{ fontSize: 14, color: COLORS.muted, margin: 0, fontFamily: "sans-serif", lineHeight: 1.6 }}>Enter your email and we will send you a magic link. No password needed.</p>
          </div>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="your@email.com"
            style={{ width: "100%", padding: "10px 14px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 14, color: COLORS.text, outline: "none", boxSizing: "border-box", fontFamily: "sans-serif", marginBottom: 12 }} />
          {error && <p style={{ fontSize: 13, color: COLORS.red, margin: "0 0 10px", fontFamily: "sans-serif" }}>{error}</p>}
          <button onClick={send} disabled={loading}
            style={{ width: "100%", padding: 11, background: COLORS.navy, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "sans-serif", marginBottom: 10 }}>
            {loading ? "Sending..." : "Send magic link"}
          </button>
          <button onClick={onClose} style={{ width: "100%", background: "none", border: "none", color: COLORS.muted, fontSize: 13, cursor: "pointer", padding: 4, fontFamily: "sans-serif" }}>Cancel</button>
        </>) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📬</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: COLORS.navy, margin: "0 0 10px", fontFamily: "sans-serif" }}>Check your email</h2>
            <p style={{ fontSize: 14, color: COLORS.muted, lineHeight: 1.6, margin: "0 0 20px", fontFamily: "sans-serif" }}>We sent a magic link to <strong>{email}</strong>.</p>
            <button onClick={onClose} style={{ background: "none", border: "none", color: COLORS.muted, fontSize: 13, cursor: "pointer", fontFamily: "sans-serif" }}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Upgrade Modal ────────────────────────────────────────────────────────────

function UpgradeModal({ onClose, triggered }) {
  const [loadingPlan, setLoadingPlan] = useState(null), [checkoutError, setCheckoutError] = useState("");
  const plans = [
    { id: "monthly",  name: "Monthly",  price: "£4.99",  period: "/month",   desc: "Full access, cancel anytime.",     highlight: false },
    { id: "annual",   name: "Annual",   price: "£59.99", period: "/year",    desc: "Best value — two months free.",    highlight: true  },
    { id: "lifetime", name: "Lifetime", price: "£49.99", period: "one-off",  desc: "Pay once, use forever.",           highlight: false },
  ];
  const handleCheckout = async (planId) => {
    setLoadingPlan(planId); setCheckoutError("");
    try {
      const r = await fetch("/api/stripe-checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan: planId, origin: window.location.origin }) });
      const d = await r.json();
      if (d.url) { window.location.href = d.url; } else { setCheckoutError("Something went wrong."); setLoadingPlan(null); }
    } catch { setCheckoutError("Something went wrong."); setLoadingPlan(null); }
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}>
      <div style={{ background: COLORS.white, borderRadius: 16, padding: "36px 32px", maxWidth: 520, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, background: COLORS.orangeLight, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 22 }}>★</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: COLORS.navy, margin: "0 0 8px", fontFamily: "sans-serif" }}>
            {triggered === "limit" ? "You have used your 3 free sessions" : "Unlock CoachIgnite"}
          </h2>
          <p style={{ fontSize: 14, color: COLORS.muted, margin: 0, lineHeight: 1.6, fontFamily: "sans-serif" }}>Unlimited coaching sessions, session history, challenge zone analysis, and full GROW conversation guides.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {plans.map(plan => (
            <div key={plan.id} style={{ border: `${plan.highlight ? 2 : 1}px solid ${plan.highlight ? COLORS.orange : COLORS.border}`, borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", background: plan.highlight ? COLORS.orangeLight : COLORS.white, gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy, fontFamily: "sans-serif" }}>{plan.name}</span>
                  {plan.highlight && <Badge color="orange">Most popular</Badge>}
                </div>
                <p style={{ fontSize: 12.5, color: COLORS.muted, margin: 0, fontFamily: "sans-serif" }}>{plan.desc}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: COLORS.navy, fontFamily: "sans-serif" }}>{plan.price}</span>
                  <span style={{ fontSize: 12, color: COLORS.muted, fontFamily: "sans-serif" }}> {plan.period}</span>
                </div>
                <button onClick={() => handleCheckout(plan.id)} disabled={!!loadingPlan}
                  style={{ padding: "8px 18px", background: plan.highlight ? COLORS.orange : COLORS.navy, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: loadingPlan ? "not-allowed" : "pointer", fontFamily: "sans-serif", opacity: loadingPlan && loadingPlan !== plan.id ? 0.5 : 1, minWidth: 80 }}>
                  {loadingPlan === plan.id ? "..." : "Select"}
                </button>
              </div>
            </div>
          ))}
        </div>
        {checkoutError && <p style={{ fontSize: 13, color: COLORS.red, textAlign: "center", margin: "0 0 12px", fontFamily: "sans-serif" }}>{checkoutError}</p>}
        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: 12, color: COLORS.muted, margin: 0, fontFamily: "sans-serif" }}>Secure payment by Stripe. Cancel anytime.</p>
          <button onClick={onClose} style={{ background: "none", border: "none", color: COLORS.muted, fontSize: 13, cursor: "pointer", padding: 4, fontFamily: "sans-serif" }}>Maybe later</button>
        </div>
      </div>
    </div>
  );
}

// ─── History Panel ────────────────────────────────────────────────────────────

function HistoryPanel({ items, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "flex-end", zIndex: 1000 }}>
      <div style={{ background: COLORS.white, width: "100%", maxWidth: 460, height: "100vh", overflowY: "auto", padding: "28px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: COLORS.navy, margin: 0 }}>Session history</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: COLORS.slate }}>×</button>
        </div>
        {items.length === 0
          ? <p style={{ color: COLORS.muted, fontSize: 14 }}>No saved sessions yet.</p>
          : items.map(item => (
            <div key={item.id} style={{ border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy }}>{item.coachingTopic || "Untitled session"}</span>
                <span style={{ fontSize: 12, color: COLORS.muted }}>{item.date || ""}</span>
              </div>
              <p style={{ fontSize: 13, color: COLORS.muted, margin: "0 0 6px" }}>{item.managerName} coaching {item.personName}</p>
              {item.coachingGoal && <Badge color="orange">{item.coachingGoal}</Badge>}
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function CoachIgnite() {
  const [form, setForm] = useState({
    managerName: "", personName: "", personRole: "",
    coachingTopic: "", context: "", coachingGoal: "",
    skillLevel: "", confidenceLevel: "",
    saveLocally: false,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeTrigger, setUpgradeTrigger] = useState("manual");
  const [showHistory, setShowHistory] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [usageCount, setUsageCount] = useState(getUsageCount());
  const [history, setHistory] = useState(getSavedSessions());
  const [isPro, setIsPro] = useState(() => { try { return localStorage.getItem("ci_pro") === "true"; } catch { return false; } });
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [user, setUser] = useState(null);
  const [topicCheck, setTopicCheck] = useState(null);
  const [sharpenedTopic, setSharpenedTopic] = useState("");
  const [topicAccepted, setTopicAccepted] = useState(false);
  const [challengeZone, setChallengeZone] = useState(null);
  const [cadence, setCadence] = useState(null);
  const resultsRef = useRef(null);
  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { if (session?.user) setUser(session.user); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) setUser(session.user); else setUser(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("session_id")) {
      try { localStorage.setItem("ci_pro", "true"); } catch {}
      setIsPro(true); setShowSuccessBanner(true);
      window.history.replaceState({}, "", "/");
      setTimeout(() => setShowSuccessBanner(false), 6000);
    }
    if (params.get("cancelled")) window.history.replaceState({}, "", "/");
  }, []);

  useEffect(() => {
    if (form.skillLevel && form.confidenceLevel) {
      setChallengeZone(getChallengeZone(form.skillLevel, form.confidenceLevel));
      setCadence(getCadenceGuidance(form.skillLevel, form.confidenceLevel, form.coachingGoal));
    } else {
      setChallengeZone(null); setCadence(null);
    }
  }, [form.skillLevel, form.confidenceLevel, form.coachingGoal]);

  const validate = () => {
    if (!form.managerName.trim()) return "Manager name is required.";
    if (!form.personName.trim()) return "Person name is required.";
    if (!form.coachingTopic.trim()) return "Coaching topic is required.";
    if (!form.coachingGoal) return "Please select a goal for this conversation.";
    if (!form.skillLevel) return "Please select a skill level.";
    if (!form.confidenceLevel) return "Please select a confidence level.";
    return null;
  };

  const buildCheckPrompt = () =>
    `You are reviewing a manager's coaching topic before they generate a coaching guide.

COACHING TOPIC: ${form.coachingTopic}
CONTEXT: ${form.context || "Not provided"}

Decide whether the topic is specific enough to produce useful coaching questions.

A topic is TOO VAGUE if it describes a general area rather than a specific situation, behaviour, or development need. For example: "communication" is vague. "Struggling to give clear direction to the team in project kick-off meetings" is specific.

A topic is SPECIFIC ENOUGH if it describes a clear situation, behaviour, or development goal with enough context to generate relevant GROW questions.

Respond in EXACTLY this format:
STATUS: [PASS or FAIL]
REASON: [One plain sentence.]
SHARPENED: [If FAIL, rewrite as a specific coaching topic. If PASS, repeat original unchanged.]`;

  const buildPrompt = (topic) => {
    const zone = getChallengeZone(form.skillLevel, form.confidenceLevel);
    const c = getCadenceGuidance(form.skillLevel, form.confidenceLevel, form.coachingGoal);
    return `You are an expert management coach helping a manager prepare for a coaching conversation with a team member. Generate a practical, GROW-structured coaching guide.

INPUTS:
- Manager: ${form.managerName}
- Person being coached: ${form.personName}${form.personRole ? ` (${form.personRole})` : ""}
- Coaching topic: ${topic}
- Additional context: ${form.context || "Not provided"}
- Goal for this conversation: ${form.coachingGoal}
- Skill level: ${form.skillLevel}
- Confidence level: ${form.confidenceLevel}

CHALLENGE / SUPPORT ZONE:
- Zone: ${zone.zone}
- Summary: ${zone.summary}
- Manager guidance: ${zone.managerGuidance}
- Support level: ${zone.supportLevel}

COACHING GOAL DEFINITIONS:
- Awareness: Help the person understand their own strengths, gaps, or blind spots more clearly.
- Commitment: Help the person who knows what to do but isn't doing it to commit to action.
- Reflection: Post-event debrief — extract learning from something that has already happened.

FIXED COACHING PRINCIPLES (always include both in the conversation guide):
1. Give the person advance notice of the topic before the conversation — never ambush with developmental feedback.
2. Ask for their view before sharing yours — good people are usually harder on themselves than you would be.

CADENCE (use exactly):
- Frequency: ${c.frequency}
- Format: ${c.format}
- Rationale: ${c.rationale}
- Manager note: ${c.managerNote}
- Person note: ${c.delegateeNote}

OUTPUT RULES (apply to every section below, without exception):
- Plain text only. No markdown of any kind. No asterisks for bold or emphasis, no ## or ### headings, no hyphen, asterisk, or bullet lists, no backticks. Where you work through the GROW stages, label each one in plain text followed by a colon, exactly like this: "Goal: ..." then "Reality: ..." then "Options: ..." then "Will: ...". Never put asterisks or bold around the GROW labels or any other heading. For lists of questions, write them as a simple numbered list ("1. ... 2. ...") in plain text.
- No exclamation marks anywhere.
- No rallying-cry or cheerleading closings. Do not end on lines like "you've got this", "you'll smash it", or "I believe in you". Close on something concrete: the next step, or when the next conversation will be.
- UK English throughout. Plain, direct, warm. Active voice.
- Write to and about ${form.personName} by first name. Do not feed evaluative ratings back to the reader: never write "your low confidence" or "given your medium skill". Write the implication instead.

YOUR RESPONSE MUST USE EXACTLY THIS FORMAT:

COACHING_APPROACH: [One sentence — the single most important thing for ${form.managerName} to hold in mind going into this conversation.]

CONVERSATION_GUIDE: [A structured coaching guide for ${form.managerName}. Begin with the two fixed principles (advance notice; ask first). Then work through GROW: for each stage, give 3–4 specific, open questions tailored to this topic and this person's profile. After the Will section, include a commitment check: ask them on a scale of 1–10 how committed they are. If the answer is below 7, instruct the manager to go back to Options — something is unresolved. Practical, direct, minimum 450 words.]

DEVELOPMENT_SUMMARY: [A post-session summary written for ${form.personName} to receive after the conversation. Written in ${form.managerName}'s voice. Covers: what was discussed, what was agreed, what ${form.personName} has committed to, and when the next conversation will be. Warm and plain — the warmth comes from being specific and genuine, not from praise or encouragement. This summary is written before the conversation happens, so deliberately leave blank fields for the things that can only be filled in afterwards: write them as plain square brackets, for example [agreed actions], [by when], [next session date]. These blanks are intentional and the manager completes them after the session — do not invent or guess them. Keep the brackets as plain text with no asterisks or formatting. Minimum 200 words.]`;
  };

  const generate = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    if (!isPro && usageCount >= FREE_LIMIT) { setUpgradeTrigger("limit"); setShowUpgrade(true); return; }
    setError("");
    if (!topicAccepted) {
      setLoading(true); setTopicCheck(null);
      try {
        const r = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: buildCheckPrompt() }] }) });
        const d = await r.json();
        const text = d.choices?.[0]?.message?.content || "";
        const status = (text.match(/STATUS:\s*(PASS|FAIL)/i)?.[1] || "PASS").toUpperCase();
        const reason = text.match(/REASON:\s*(.+)/i)?.[1]?.trim() || "";
        const sharpened = text.match(/SHARPENED:\s*([\s\S]+)/i)?.[1]?.trim() || form.coachingTopic;
        if (status === "PASS") { setSharpenedTopic(form.coachingTopic); setTopicAccepted(true); await runGenerate(form.coachingTopic); }
        else { setTopicCheck({ reason, sharpened }); setSharpenedTopic(sharpened); setLoading(false); }
      } catch { setError("Something went wrong. Please try again."); setLoading(false); }
      return;
    }
    await runGenerate(sharpenedTopic || form.coachingTopic);
  };

  const runGenerate = async (topic) => {
    setLoading(true); setResult(null);
    try {
      const r = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: buildPrompt(topic) }] }) });
      const d = await r.json();
      const text = d.choices?.[0]?.message?.content || "";
      const approachMatch = text.match(/COACHING_APPROACH:\s*([\s\S]+?)(?=CONVERSATION_GUIDE:|$)/i);
      const guideMatch = text.match(/CONVERSATION_GUIDE:\s*([\s\S]+?)(?=DEVELOPMENT_SUMMARY:|$)/i);
      const summaryMatch = text.match(/DEVELOPMENT_SUMMARY:\s*([\s\S]+)/i);
      const approach = approachMatch?.[1]?.trim() || "";
      const guide = guideMatch?.[1]?.trim() || text;
      const summary = summaryMatch?.[1]?.trim() || "";
      const parsed = {
        approach, guide, summary,
        coachingTopic: topic,
        managerName: form.managerName,
        personName: form.personName,
        coachingGoal: form.coachingGoal,
        challengeZone: getChallengeZone(form.skillLevel, form.confidenceLevel),
        cadence: getCadenceGuidance(form.skillLevel, form.confidenceLevel, form.coachingGoal),
      };
      setResult(parsed);
      if (!isPro) { incrementUsage(); setUsageCount(getUsageCount()); }
      if (form.saveLocally) { saveLocalSession({ coachingTopic: topic, managerName: form.managerName, personName: form.personName, coachingGoal: form.coachingGoal }); setHistory(getSavedSessions()); }
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  const resetAll = () => {
    setTopicCheck(null); setSharpenedTopic(""); setTopicAccepted(false);
    setResult(null); window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const signOut = async () => {
    await supabase.auth.signOut(); setUser(null); setIsPro(false);
    try { localStorage.removeItem("ci_pro"); } catch {}
  };
  const remaining = isPro ? null : Math.max(0, FREE_LIMIT - usageCount);

  // ─── Flame SVG ──────────────────────────────────────────────────────────────
  const FlameIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: 18, height: 18 }}>
      <path d="M12 2C12 2 7 8 7 13a5 5 0 0010 0c0-5-5-11-5-11z" fill="white" opacity="0.9"/>
      <path d="M12 8C12 8 9.5 11.5 9.5 14a2.5 2.5 0 005 0c0-2.5-2.5-6-2.5-6z" fill="white" opacity="0.6"/>
    </svg>
  );

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: "#F8FAFC", minHeight: "100vh" }}>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} triggered={upgradeTrigger} />}
      {showHistory && <HistoryPanel items={history} onClose={() => setShowHistory(false)} />}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showSuccessBanner && (
        <div style={{ background: COLORS.green, padding: "12px 24px", textAlign: "center" }}>
          <span style={{ color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: "sans-serif" }}>Payment successful — welcome to CoachIgnite Pro.</span>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ background: "#ffffff", borderBottom: "1px solid #e8e8f0", padding: "0 24px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", height: 68 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, background: ORANGE, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <FlameIcon />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.25rem", fontWeight: 600, color: "#1a1a2e", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                Coach <span style={{ color: ORANGE }}>Ignite</span>
              </span>
              <span style={{ fontFamily: "system-ui, sans-serif", fontSize: "0.65rem", fontWeight: 400, color: "#9b9bb0", letterSpacing: "0.08em", textTransform: "uppercase" }}>Part of the Management Ignition Suite</span>
            </div>
            <Badge color={isPro ? "green" : "amber"}>{isPro ? "Pro" : "Beta"}</Badge>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button onClick={() => setShowHistory(true)} style={{ background: "none", border: "none", color: "#6b6b85", fontSize: 13, cursor: "pointer", padding: 0, fontFamily: "system-ui, sans-serif" }}>History</button>
            {user ? (
              <>
                <span style={{ fontSize: 12, color: "#9b9bb0", fontFamily: "system-ui, sans-serif" }}>{user.email}</span>
                <button onClick={signOut} style={{ background: "none", border: "1px solid #d0d0e0", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: "#6b6b85", fontFamily: "system-ui, sans-serif", cursor: "pointer" }}>Sign out</button>
              </>
            ) : (
              <button onClick={() => setShowAuth(true)} style={{ background: "none", border: "1px solid #d0d0e0", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: "#6b6b85", fontFamily: "system-ui, sans-serif", cursor: "pointer" }}>Sign in</button>
            )}
            {!isPro && (
              <>
                <div style={{ background: "#fff8f0", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: "#3d3d56", fontFamily: "system-ui, sans-serif" }}>{remaining} free {remaining === 1 ? "use" : "uses"} left</div>
                <button onClick={() => { setUpgradeTrigger("manual"); setShowUpgrade(true); }} style={{ background: ORANGE, border: "none", borderRadius: 20, padding: "5px 14px", fontSize: 12, color: "#fff", fontFamily: "system-ui, sans-serif", fontWeight: 600, cursor: "pointer" }}>Upgrade</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Hero ── */}
      <div style={{ background: COLORS.navy, borderBottom: `3px solid ${ORANGE}`, paddingBottom: 32 }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "28px 24px 0" }}>
          <h1 style={{ fontSize: 30, fontWeight: 700, color: "#fff", margin: "0 0 10px", lineHeight: 1.25, letterSpacing: "-0.02em" }}>
            Prepare for the conversation.<br/>Build the relationship.
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1.6, fontFamily: "sans-serif" }}>
            Describe the person and the situation. Get a GROW-structured coaching guide and a development summary — ready before you walk in.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "28px 24px 60px" }}>

        {/* ── Form ── */}
        <div style={{ background: COLORS.white, borderRadius: 14, border: `1px solid ${COLORS.border}`, padding: "28px 28px", marginBottom: 24 }}>

          <h2 style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy, margin: "0 0 22px", fontFamily: "sans-serif", borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 14 }}>
            The coaching situation
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
            <TextField label="Your name" value={form.managerName} onChange={f("managerName")} placeholder="Your name" required />
            <TextField label="Person you are coaching" value={form.personName} onChange={f("personName")} placeholder="Their name" required />
          </div>
          <TextField label="Their role" value={form.personRole} onChange={f("personRole")} placeholder="e.g. Senior Account Manager" />
          <TextField label="Coaching topic" value={form.coachingTopic} onChange={f("coachingTopic")}
            placeholder="e.g. Struggling to give clear direction in project kick-off meetings"
            hint="Be specific — describe a situation, behaviour, or development need, not just a general area."
            required multiline />
          <TextField label="Context and what you have observed" value={form.context} onChange={f("context")}
            placeholder="What have you seen? What has happened? What makes this the right time to address it?"
            multiline />

          <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 20, marginTop: 4 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy, margin: "0 0 16px", fontFamily: "sans-serif" }}>Goal for this conversation</h3>
            <ToggleGroup
              label="What do you most want this person to leave with?"
              value={form.coachingGoal}
              onChange={f("coachingGoal")}
              options={[
                { value: "Awareness", label: "Awareness — understand themselves better" },
                { value: "Commitment", label: "Commitment — agree to take action" },
                { value: "Reflection", label: "Reflection — extract learning from experience" },
              ]}
            />
          </div>

          <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 20, marginTop: 4 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy, margin: "0 0 16px", fontFamily: "sans-serif" }}>
              About {form.personName || "the person"}
            </h3>
            <ToggleGroup
              label="Skill level for this area"
              value={form.skillLevel}
              onChange={f("skillLevel")}
              options={[{ value: "Low", label: "Low" }, { value: "Medium", label: "Medium" }, { value: "High", label: "High" }]}
            />
            <ToggleGroup
              label="Confidence level"
              value={form.confidenceLevel}
              onChange={f("confidenceLevel")}
              options={[{ value: "Low", label: "Low" }, { value: "Medium", label: "Medium" }, { value: "High", label: "High" }]}
            />
          </div>

          {/* Challenge zone preview */}
          {challengeZone && (
            <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 20, marginTop: 4 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy, margin: "0 0 12px", fontFamily: "sans-serif" }}>Challenge and support assessment</h3>
              <div style={{ background: challengeZone.colorLight, border: `1px solid ${challengeZone.color}`, borderRadius: 10, padding: "14px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 16 }}>{challengeZone.icon}</span>
                  <p style={{ fontSize: 14, fontWeight: 700, color: challengeZone.color, margin: 0, fontFamily: "sans-serif" }}>{challengeZone.zone}</p>
                </div>
                <p style={{ fontSize: 13, color: COLORS.text, margin: "0 0 4px", fontFamily: "sans-serif", lineHeight: 1.5 }}>{challengeZone.summary}</p>
                <p style={{ fontSize: 12.5, color: COLORS.muted, margin: 0, fontStyle: "italic", fontFamily: "sans-serif" }}>{challengeZone.supportLevel}</p>
              </div>
            </div>
          )}

          {/* Cadence preview */}
          {cadence && (
            <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 20, marginTop: 4 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy, margin: "0 0 12px", fontFamily: "sans-serif" }}>Suggested coaching cadence</h3>
              <div style={{ background: COLORS.orangeLight, border: `1px solid ${ORANGE}`, borderRadius: 10, padding: "14px 18px" }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.orangeDark, margin: "0 0 4px", fontFamily: "sans-serif" }}>{cadence.frequency}</p>
                <p style={{ fontSize: 13, color: COLORS.text, margin: "0 0 6px", fontFamily: "sans-serif" }}>{cadence.format}</p>
                <p style={{ fontSize: 12.5, color: COLORS.muted, margin: 0, fontStyle: "italic", fontFamily: "sans-serif", lineHeight: 1.5 }}>{cadence.rationale}</p>
              </div>
            </div>
          )}

          <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 16, marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: COLORS.muted, fontFamily: "sans-serif" }}>
              <input type="checkbox" checked={form.saveLocally} onChange={e => setForm(p => ({ ...p, saveLocally: e.target.checked }))} style={{ width: 15, height: 15 }} />
              Save this session to history
            </label>
            {error && <p style={{ fontSize: 13, color: COLORS.red, margin: 0, fontFamily: "sans-serif" }}>{error}</p>}
          </div>

          <button onClick={generate} disabled={loading}
            style={{ width: "100%", marginTop: 16, padding: 14, background: loading ? COLORS.slate : COLORS.navy, color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "sans-serif", letterSpacing: "0.01em", transition: "background 0.2s" }}>
            {loading ? "Generating your coaching guide..." : "Generate coaching guide"}
          </button>

          {!isPro && remaining <= 1 && !loading && (
            <p style={{ textAlign: "center", fontSize: 12, color: COLORS.amber, marginTop: 10, fontFamily: "sans-serif" }}>
              {remaining === 0 ? "You've used all free sessions." : "Last free session."}{" "}
              <span style={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => { setUpgradeTrigger("limit"); setShowUpgrade(true); }}>Upgrade for unlimited access.</span>
            </p>
          )}
        </div>

        {/* ── Topic sharpening ── */}
        {topicCheck && !topicAccepted && (
          <div style={{ background: COLORS.amberLight, border: `1px solid ${COLORS.amber}`, borderRadius: 14, padding: "24px 28px", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>⚠️</div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy, margin: "0 0 4px", fontFamily: "sans-serif" }}>Your coaching topic needs sharpening</p>
                <p style={{ fontSize: 13, color: COLORS.text, margin: 0, fontFamily: "sans-serif", lineHeight: 1.6 }}>{topicCheck.reason}</p>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.navy, marginBottom: 6, fontFamily: "sans-serif" }}>Suggested rewrite — edit if needed:</label>
              <textarea value={sharpenedTopic} onChange={e => setSharpenedTopic(e.target.value)} rows={3}
                style={{ width: "100%", padding: "10px 14px", border: `1.5px solid ${COLORS.amber}`, borderRadius: 8, fontSize: 13.5, lineHeight: 1.6, color: COLORS.text, fontFamily: "Georgia, serif", boxSizing: "border-box", background: COLORS.white, outline: "none", resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={() => { setTopicAccepted(true); runGenerate(sharpenedTopic); }}
                style={{ padding: "10px 20px", background: COLORS.navy, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "sans-serif" }}>
                Use this — generate guide
              </button>
              <button onClick={() => { setTopicCheck(null); setTopicAccepted(true); setSharpenedTopic(form.coachingTopic); runGenerate(form.coachingTopic); }}
                style={{ padding: "10px 20px", background: COLORS.white, color: COLORS.navy, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "sans-serif" }}>
                Keep my original wording
              </button>
            </div>
          </div>
        )}

        {/* ── Results ── */}
        {result && (
          <div ref={resultsRef}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.navy, margin: 0, fontFamily: "sans-serif" }}>Your coaching guide</h2>
              <Badge color="orange">Ready to use</Badge>
            </div>

            {/* Coaching approach */}
            {result.approach && (
              <div style={{ background: COLORS.navy, borderRadius: 12, padding: "18px 22px", marginBottom: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px", fontFamily: "sans-serif" }}>The most important thing to hold in mind</p>
                <p style={{ fontSize: 15, color: "#fff", margin: 0, fontFamily: "Georgia, serif", lineHeight: 1.6, fontStyle: "italic" }}>"{result.approach}"</p>
              </div>
            )}

            {/* Zone + cadence row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div style={{ background: result.challengeZone.colorLight, border: `1px solid ${result.challengeZone.color}`, borderRadius: 10, padding: "14px 18px" }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: result.challengeZone.color, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px", fontFamily: "sans-serif" }}>Challenge and support zone</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy, margin: "0 0 4px" }}>{result.challengeZone.icon} {result.challengeZone.zone}</p>
                <p style={{ fontSize: 12, color: COLORS.muted, margin: 0, fontFamily: "sans-serif", lineHeight: 1.4 }}>{result.challengeZone.managerGuidance}</p>
              </div>
              <div style={{ background: COLORS.orangeLight, border: `1px solid ${ORANGE}`, borderRadius: 10, padding: "14px 18px" }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: COLORS.orangeDark, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px", fontFamily: "sans-serif" }}>Coaching cadence</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy, margin: "0 0 4px" }}>{result.cadence.frequency}</p>
                <p style={{ fontSize: 12, color: COLORS.muted, margin: 0, fontFamily: "sans-serif", lineHeight: 1.4 }}>{result.cadence.format}</p>
              </div>
            </div>

            {/* Cadence detail + ICS */}
            <div style={{ background: COLORS.orangeLight, border: `1px solid ${ORANGE}`, borderRadius: 12, padding: "18px 22px", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, background: ORANGE, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🔁</div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: COLORS.orangeDark, textTransform: "uppercase", letterSpacing: "0.06em", margin: 0, fontFamily: "sans-serif" }}>Recommended coaching rhythm</p>
                </div>
                {!result.cadence.frequency.toLowerCase().includes("single") && (
                  <button onClick={() => generateICS({ coachingTopic: result.coachingTopic, personName: result.personName, managerName: result.managerName, cadence: result.cadence })}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: ORANGE, color: "#fff", border: "none", borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "sans-serif", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: 14 }}>📅</span> Add to calendar
                  </button>
                )}
              </div>
              <p style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.6, margin: "0 0 8px", fontFamily: "sans-serif" }}><strong>Manager note:</strong> {result.cadence.managerNote}</p>
              <p style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.6, margin: 0, fontStyle: "italic", fontFamily: "sans-serif" }}><strong>What to say to {result.personName}:</strong> {result.cadence.delegateeNote}</p>
            </div>

            <OutputBox
              title={`Coaching conversation guide — for ${result.managerName}`}
              content={result.guide}
              badge={{ color: "orange", label: "Manager only" }}
            />
            <OutputBox
              title={`Development summary — for ${result.personName}`}
              content={result.summary}
              badge={{ color: "blue", label: "Share after the conversation" }}
            />

            <div style={{ background: COLORS.slateLight, borderRadius: 10, padding: "14px 18px", border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <p style={{ fontSize: 13, color: COLORS.muted, margin: 0, fontFamily: "sans-serif" }}>Both outputs are editable. Adjust to fit your voice before the conversation.</p>
              <button onClick={resetAll} style={{ fontSize: 13, padding: "7px 16px", background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.navy, cursor: "pointer", fontFamily: "sans-serif", fontWeight: 500 }}>New session</button>
            </div>
          </div>
        )}

        {/* ── How it works (pre-generate) ── */}
        {!result && !loading && (
          <div style={{ marginTop: 8 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 16px", fontFamily: "sans-serif" }}>How it works</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {[
                { n: "1", title: "Describe the situation", desc: "Tell us who you are coaching, what the topic is, and what you have observed." },
                { n: "2", title: "Set the conversation goal", desc: "Awareness, commitment, or reflection — the goal shapes the questions you will ask." },
                { n: "3", title: "Get your guide", desc: "Receive a GROW conversation guide and a development summary ready to share." },
              ].map(s => (
                <div key={s.n} style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "16px 18px" }}>
                  <div style={{ width: 28, height: 28, background: ORANGE, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 10, fontFamily: "sans-serif" }}>{s.n}</div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, margin: "0 0 4px", fontFamily: "sans-serif" }}>{s.title}</p>
                  <p style={{ fontSize: 12.5, color: COLORS.muted, margin: 0, lineHeight: 1.5, fontFamily: "sans-serif" }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div style={{ borderTop: `1px solid ${COLORS.border}`, marginTop: 40, paddingTop: 20, textAlign: "center" }}>
          <p style={{ fontSize: 12, color: COLORS.muted, margin: 0, fontFamily: "sans-serif" }}>
            CoachIgnite by <a href="https://themessagebusiness.com" style={{ color: ORANGE, textDecoration: "none" }}>The Message Business</a>
            {!isPro && <> · {remaining} free {remaining === 1 ? "use" : "uses"} remaining · <span style={{ textDecoration: "underline", cursor: "pointer", color: COLORS.blue }} onClick={() => { setUpgradeTrigger("manual"); setShowUpgrade(true); }}>Upgrade to Pro</span></>}
            {isPro && <> · <span style={{ color: COLORS.green, fontWeight: 600 }}>Pro — unlimited access</span></>}
          </p>
        </div>

      </div>
    </div>
  );
}
