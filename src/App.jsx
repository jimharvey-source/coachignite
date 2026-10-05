import { useState, useEffect, useRef } from "react";

// The way back to the app, from the header and from the end of every result.
const DASHBOARD_URL = "https://app.management-ignition.com/";
// PDF file names: tool, person, then what the work is about, so a saved file says what it is.
const pdfName = (...parts) => parts
  .map(s => String(s || "").replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 60).trim())
  .filter(Boolean).join(" - ") + ".pdf";

import {
  createSuiteClient,
  personIdFromUrl,
  loadPerson,
  hasSuiteAccess,
  saveToolSession,
  sourceSessionIdFromUrl,
  loadSession,
  parseSharpened,
  findPersonByName,
  createPerson,
  personRecordUrl,
  splitName,
} from "./mi-session.js";

const supabase = createSuiteClient({
  url: "https://fdiitxhgfytvlbtokbok.supabase.co",
  anonKey: "sb_publishable_JQMFDaTz5g-2ZlitosUTeA_C9B48-Lc",
});

// Coach Ignite's tool colour. An identity mark only: the 3px top line.
// Never text, never a button fill, never a panel ground or border.
const ORANGE = "#ff9800";

// Management Ignition design system, 4 October 2026. Same names, new values.
// Teal (accent) is the method speaking: never a button fill, never a link.
const COLORS = {
  navy: "#1b2a4a",        // ink: headlines, primary buttons
  navyMid: "#2a3d63",     // ink-2: body copy
  slate: "#5d6b7f",
  slateLight: "#f6f8fb",  // canvas
  border: "#e2e7ee",      // rule
  text: "#1b2a4a",
  muted: "#5d6b7f",
  white: "#ffffff",
  amber: "#8a5300",       // warn
  amberLight: "#fff3e0",
  red: "#b3261e",         // danger
  green: "#1e6b45",
  greenLight: "#e8f4ec",
  blue: "#2a3d63",
  blueLight: "#eef2f6",
  teal: "#0e7c7b",        // accent
  tealLight: "#e9f3f3",   // accent-soft; text on it is ink
  canvas: "#f6f8fb",
  sunk: "#eef2f6",
  tool: ORANGE,           // Coach Ignite
};

// Names arrive as typed. "joyce adams" shows as "Joyce Adams". Display only.
const displayName = (s) => String(s || "").trim().split(/\s+/).map(w => w ? w.charAt(0).toUpperCase() + w.slice(1) : w).join(" ");

const FONT = {
  sans: '"Instrument Sans", -apple-system, "SF Pro Text", "Segoe UI", Helvetica, Arial, sans-serif',
  spoken: 'Fraunces, "Iowan Old Style", Georgia, serif',
};
const SHADOW = "0 1px 2px rgba(27,42,74,0.05), 0 18px 44px -28px rgba(27,42,74,0.30)";

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
    teal:   { bg: COLORS.tealLight,  text: COLORS.navy },
    amber:  { bg: COLORS.amberLight, text: COLORS.amber },
    green:  { bg: COLORS.greenLight, text: COLORS.green },
    blue:   { bg: COLORS.sunk,       text: COLORS.navyMid },
  };
  const s = styles[color] || styles.blue;
  return (
    <span style={{ background: s.bg, color: s.text, fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 999, letterSpacing: "0.01em", fontFamily: FONT.sans }}>
      {children}
    </span>
  );
}

function OutputBox({ title, content, badge, spoken }) {
  const [copied, setCopied] = useState(false);
  const [text, setText] = useState(content);
  useEffect(() => { setText(content); }, [content]);
  const copy = () => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); };
  const emailIt = () => {
    const s = encodeURIComponent(`Coach Ignite: ${title}`), b = encodeURIComponent(text);
    const a = document.createElement("a"); a.href = `mailto:?subject=${s}&body=${b}`; a.target = "_blank";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };
  const shareIt = async () => {
    if (navigator.share) { try { await navigator.share({ title: `Coach Ignite: ${title}`, text }); } catch { emailIt(); } }
    else { emailIt(); }
  };
  return (
    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", background: COLORS.white }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: COLORS.navy }}>{title}</span>
        {badge && <Badge color={badge.color}>{badge.label}</Badge>}
      </div>
      <div style={{ padding: "8px 12px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", gap: 8 }}>
        <button onClick={copy} style={{ fontSize: 13, minHeight: 36, padding: "0 14px", border: `1px solid ${COLORS.border}`, borderRadius: 10, background: copied ? COLORS.greenLight : COLORS.white, color: copied ? COLORS.green : COLORS.navy, cursor: "pointer", fontWeight: 500, fontFamily: FONT.sans }}>{copied ? "Copied" : "Copy"}</button>
        <button onClick={shareIt} style={{ fontSize: 13, minHeight: 36, padding: "0 14px", border: `1px solid ${COLORS.border}`, borderRadius: 10, background: COLORS.white, color: COLORS.navy, cursor: "pointer", fontWeight: 500, fontFamily: FONT.sans }}>Share</button>
      </div>
      <textarea value={text} onChange={e => setText(e.target.value)} style={spoken
        ? { width: "100%", minHeight: 320, padding: "24px 28px", border: "none", outline: "none", resize: "vertical", fontSize: 19, lineHeight: "30px", color: COLORS.navy, fontFamily: FONT.spoken, fontVariationSettings: '"SOFT" 0, "WONK" 0', fontWeight: 400, boxSizing: "border-box", background: COLORS.white }
        : { width: "100%", minHeight: 280, padding: "20px 24px", border: "none", outline: "none", resize: "vertical", fontSize: 15, lineHeight: 1.65, color: COLORS.navyMid, fontFamily: FONT.sans, boxSizing: "border-box", background: COLORS.white }} />
    </div>
  );
}

function TextField({ label, value, onChange, placeholder, multiline, required, hint }) {
  const style = { width: "100%", minHeight: 44, padding: "10px 16px", border: `1px solid ${COLORS.border}`, borderRadius: 10, fontSize: 15, color: COLORS.text, background: COLORS.white, boxSizing: "border-box", fontFamily: FONT.sans };
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, letterSpacing: "0.01em", color: COLORS.muted, marginBottom: 8 }}>
        {label}{required && <span style={{ color: COLORS.red }}> *</span>}
      </label>
      {hint && <p style={{ fontSize: 14, color: COLORS.navyMid, margin: "-2px 0 8px", lineHeight: "20px", fontFamily: FONT.sans }}>{hint}</p>}
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
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, letterSpacing: "0.01em", color: COLORS.muted, marginBottom: 8 }}>{label}</label>
      {hint && <p style={{ fontSize: 14, color: COLORS.navyMid, margin: "-2px 0 8px", lineHeight: "20px", fontFamily: FONT.sans }}>{hint}</p>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {options.map(o => (
          <button key={o.value} onClick={() => onChange(o.value)}
            aria-pressed={value === o.value} style={{ minHeight: 40, padding: "8px 18px", lineHeight: 1.35, border: `1px solid ${value === o.value ? COLORS.navy : COLORS.border}`, boxShadow: value === o.value ? `inset 0 0 0 1px ${COLORS.navy}` : "none", borderRadius: 10, background: value === o.value ? COLORS.sunk : COLORS.white, color: COLORS.navy, fontSize: 14, fontWeight: value === o.value ? 600 : 400, cursor: "pointer", fontFamily: FONT.sans, textAlign: "left", transition: "all 0.15s" }}>
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
    <div style={{ position: "fixed", inset: 0, background: "rgba(27,42,74,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}>
      <div style={{ background: COLORS.white, borderRadius: 22, boxShadow: SHADOW, padding: "40px 36px", maxWidth: 420, width: "100%" }}>
        {!sent ? (<>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em", color: COLORS.navy, margin: "0 0 8px", fontFamily: FONT.sans }}>Sign in to Coach Ignite</h2>
            <p style={{ fontSize: 14, color: COLORS.muted, margin: 0, fontFamily: FONT.sans, lineHeight: 1.6 }}>Enter your email and we will send you a magic link. No password needed.</p>
          </div>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="your@email.com"
            style={{ width: "100%", minHeight: 44, padding: "10px 16px", border: `1px solid ${COLORS.border}`, borderRadius: 10, fontSize: 15, color: COLORS.text, boxSizing: "border-box", fontFamily: FONT.sans, marginBottom: 12 }} />
          {error && <p style={{ fontSize: 13, color: COLORS.red, margin: "0 0 10px", fontFamily: FONT.sans }}>{error}</p>}
          <button onClick={send} disabled={loading}
            style={{ width: "100%", minHeight: 44, padding: "0 24px", background: COLORS.navy, color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: FONT.sans, marginBottom: 10 }}>
            {loading ? "Sending..." : "Send magic link"}
          </button>
          <button onClick={onClose} style={{ width: "100%", background: "none", border: "none", color: COLORS.muted, fontSize: 13, cursor: "pointer", padding: 4, fontFamily: FONT.sans }}>Cancel</button>
        </>) : (
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em", color: COLORS.navy, margin: "0 0 10px", fontFamily: FONT.sans }}>Check your email</h2>
            <p style={{ fontSize: 14, color: COLORS.muted, lineHeight: 1.6, margin: "0 0 20px", fontFamily: FONT.sans }}>We sent a magic link to <strong>{email}</strong>.</p>
            <button onClick={onClose} style={{ background: "none", border: "none", color: COLORS.muted, fontSize: 13, cursor: "pointer", fontFamily: FONT.sans }}>Close</button>
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
    { id: "annual",   name: "Annual",   price: "£59.99", period: "/year",    desc: "Best value: two months free.",    highlight: true  },
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
    <div style={{ position: "fixed", inset: 0, background: "rgba(27,42,74,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}>
      <div style={{ background: COLORS.white, borderRadius: 22, boxShadow: SHADOW, padding: "40px 36px", maxWidth: 520, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em", color: COLORS.navy, margin: "0 0 8px", fontFamily: FONT.sans }}>
            {triggered === "limit" ? "You have used your 3 free sessions" : triggered === "pdf" ? "Download this as a branded PDF" : "Coach Ignite Pro"}
          </h2>
          <p style={{ fontSize: 14, color: COLORS.muted, margin: 0, lineHeight: 1.6, fontFamily: FONT.sans }}>{triggered === "pdf" ? "Pro lets you download the full coaching pack, the GROW conversation guide and the development summary to complete after the session, as a branded PDF." : "Unlimited coaching sessions, session history, challenge zone analysis, and full GROW conversation guides."}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {plans.map(plan => (
            <div key={plan.id} style={{ border: `1px solid ${plan.highlight ? COLORS.navy : COLORS.border}`, boxShadow: plan.highlight ? `inset 0 0 0 1px ${COLORS.navy}` : "none", borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", background: COLORS.white, gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: COLORS.navy, fontFamily: FONT.sans }}>{plan.name}</span>
                  {plan.highlight && <Badge color="teal">Most popular</Badge>}
                </div>
                <p style={{ fontSize: 13, color: COLORS.navyMid, margin: 0, fontFamily: FONT.sans }}>{plan.desc}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 18, fontWeight: 600, color: COLORS.navy, fontFamily: FONT.sans }}>{plan.price}</span>
                  <span style={{ fontSize: 12, color: COLORS.muted, fontFamily: FONT.sans }}> {plan.period}</span>
                </div>
                <button onClick={() => handleCheckout(plan.id)} disabled={!!loadingPlan}
                  style={{ minHeight: 40, padding: "0 18px", background: plan.highlight ? COLORS.navy : COLORS.white, color: plan.highlight ? "#fff" : COLORS.navy, border: `1px solid ${plan.highlight ? COLORS.navy : COLORS.border}`, borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: loadingPlan ? "not-allowed" : "pointer", fontFamily: FONT.sans, opacity: loadingPlan && loadingPlan !== plan.id ? 0.5 : 1, minWidth: 80 }}>
                  {loadingPlan === plan.id ? "..." : "Select"}
                </button>
              </div>
            </div>
          ))}
        </div>
        {checkoutError && <p style={{ fontSize: 13, color: COLORS.red, textAlign: "center", margin: "0 0 12px", fontFamily: FONT.sans }}>{checkoutError}</p>}
        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <p style={{ fontSize: 12, color: COLORS.muted, margin: 0, fontFamily: FONT.sans }}>Secure payment by Stripe. Cancel anytime.</p>
          <button onClick={onClose} style={{ background: "none", border: "none", color: COLORS.muted, fontSize: 13, cursor: "pointer", padding: 4, fontFamily: FONT.sans }}>Maybe later</button>
        </div>
      </div>
    </div>
  );
}

// ─── History Panel ────────────────────────────────────────────────────────────

function HistoryPanel({ items, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(27,42,74,0.55)", display: "flex", justifyContent: "flex-end", zIndex: 1000 }}>
      <div style={{ background: COLORS.white, width: "100%", maxWidth: 460, height: "100vh", overflowY: "auto", padding: "28px 24px", boxShadow: SHADOW, fontFamily: FONT.sans }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.01em", color: COLORS.navy, margin: 0 }}>Session history</h3>
          <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", fontSize: 24, minWidth: 44, minHeight: 44, cursor: "pointer", color: COLORS.navy, fontFamily: FONT.sans }}>×</button>
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
              {item.coachingGoal && <Badge color="blue">{item.coachingGoal}</Badge>}
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
  const [person, setPerson] = useState(null);
  const [saveState, setSaveState] = useState("idle");
  // Started in the tool rather than from the app: is this person already on the team?
  const [teamMatch, setTeamMatch] = useState(null);
  const [addedPerson, setAddedPerson] = useState(null);
  const [fromSession, setFromSession] = useState(null);
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

  // The suite. Who is signed in, do they have access, and which person are
  // they working on. Entitlement is one call now, replacing the local flag.
  useEffect(() => {
    if (!user) { setPerson(null); return; }
    let cancelled = false;

    (async () => {
      const paid = await hasSuiteAccess(supabase);
      if (!cancelled && paid) setIsPro(true);

      // A session handed across from another tool. Feedback sends the
      // development point here so the coaching starts from it.
      const from = await loadSession(supabase, sourceSessionIdFromUrl());
      if (!cancelled && from) {
        setFromSession(from);
        const note = from.outputs?.output || from.outputs?.briefingNote || "";
        setForm(prev => ({
          ...prev,
          context: prev.context || note,
          coachingTopic: prev.coachingTopic || (from.title ? `Following ${from.title}` : ""),
        }));
      }

      const p = await loadPerson(supabase, personIdFromUrl());
      if (cancelled || !p) return;
      setPerson(p);

      setForm(prev => ({
        ...prev,
        personName: prev.personName
          || [p.first_name, p.last_name].filter(Boolean).join(" "),
        personRole: prev.personRole || p.role_title || "",
      }));
    })();

    return () => { cancelled = true; };
  }, [user]);

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
SHARPENED: [If FAIL, rewrite as a specific coaching topic, one sentence at most. If PASS, repeat original unchanged. Write nothing after it.]`;

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
- Do not use em dashes in the output: use a comma, a colon, or a full stop instead. Do not use the words "leverage", "empower", "unlock", "journey", "delve", "robust", "seamless", "inspire", or the phrase "moving forward".
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
        const sharpened = parseSharpened(text, form.coachingTopic, 250);
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

  const resetAll = () => { setSaveState("idle"); setAddedPerson(null);
    setTopicCheck(null); setSharpenedTopic(""); setTopicAccepted(false);
    setResult(null); window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (!result || !user || person) { setTeamMatch(null); return; }
    let cancelled = false;
    findPersonByName(supabase, (result?.personName || form.personName)).then(({ person: match, error: findError }) => {
      if (findError) console.error("findPersonByName failed:", findError.message);
      if (!cancelled) setTeamMatch(match || null);
    });
    return () => { cancelled = true; };
  }, [result, user, person]);

  const saveToPerson = async () => {
    if (!result) return;
    setSaveState("saving");

    // Three cases: sent here from the app with a person; started here with a name that is
    // already on the team; started here with someone new, who is added first.
    let target = person || teamMatch;
    if (!target) {
      const { person: created, error: addError } = await createPerson(supabase, (result?.personName || form.personName));
      if (addError || !created) {
        console.error("createPerson failed:", addError?.message);
        setSaveState("idle");
        setError("That person could not be added to your team, so nothing was saved.");
        return;
      }
      target = created;
      setAddedPerson(created);
    }
    setPerson(target);

    const { error: saveError } = await saveToolSession(supabase, {
      tool: "coach",
      personId: target.id,
      sourceSessionId: fromSession?.id || null,
      title: result.coachingTopic,
      inputs: form,
      outputs: {
        approach: result.approach,
        guide: result.guide,
        summary: result.summary,
        coachingGoal: result.coachingGoal,
        cadence: result.cadence,
        challengeZone: result.challengeZone,
      },
    });

    if (saveError) {
      setSaveState("idle");
      setError("That could not be saved to the person record.");
      return;
    }
    setSaveState("saved");
  };

  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const downloadPdf = async () => {
    if (!result) return;
    if (!isPro) { setUpgradeTrigger("pdf"); setShowUpgrade(true); return; }
    setDownloadingPdf(true);
    try {
      const res = await fetch("/api/generate-pdf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tool: "coach", form, result }) });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = pdfName("Coach Ignite", result.personName || form.personName, form.coachingTopic);
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError("The PDF could not be generated. Please try again.");
    } finally {
      setDownloadingPdf(false);
    }
  };
  const signOut = async () => {
    await supabase.auth.signOut(); setUser(null); setIsPro(false);
    try { localStorage.removeItem("ci_pro"); } catch {}
  };
  const remaining = isPro ? null : Math.max(0, FREE_LIMIT - usageCount);

  return (
    <div style={{ fontFamily: FONT.sans, background: COLORS.canvas, color: COLORS.text, minHeight: "100vh" }}>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} triggered={upgradeTrigger} />}
      {showHistory && <HistoryPanel items={history} onClose={() => setShowHistory(false)} />}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showSuccessBanner && (
        <div style={{ background: COLORS.tealLight, padding: "12px 24px", textAlign: "center" }}>
          <span style={{ color: COLORS.navy, fontSize: 14, fontWeight: 600, fontFamily: FONT.sans }}>Payment successful. Welcome to Coach Ignite Pro.</span>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ height: 3, background: COLORS.tool }} />
      <div style={{ background: COLORS.canvas, borderBottom: `1px solid ${COLORS.border}`, padding: "0 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 68, gap: 12, flexWrap: "wrap", padding: "10px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/mi-mark.svg" alt="" width="26" height="26" style={{ display: "block" }} />
            <span style={{ fontSize: 18, fontWeight: 600, color: COLORS.navy, letterSpacing: "-0.02em" }}>Coach Ignite</span>
            <Badge color={isPro ? "green" : "blue"}>{isPro ? "Pro" : "Beta"}</Badge>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <a href={DASHBOARD_URL} style={{ background: "none", border: "none", color: COLORS.navyMid, fontSize: 14, fontWeight: 500, cursor: "pointer", padding: "8px 6px", fontFamily: FONT.sans, textDecoration: "none" }}>Back to dashboard</a>
            <button onClick={() => setShowHistory(true)} style={{ background: "none", border: "none", color: COLORS.navyMid, fontSize: 14, fontWeight: 500, cursor: "pointer", padding: "8px 6px", fontFamily: FONT.sans }}>History</button>
            {user ? (
              <>
                <span style={{ fontSize: 13, color: COLORS.muted, fontFamily: FONT.sans }}>{user.email}</span>
                <button onClick={signOut} style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 10, minHeight: 36, padding: "0 14px", fontSize: 14, color: COLORS.navy, fontFamily: FONT.sans, cursor: "pointer" }}>Sign out</button>
              </>
            ) : (
              <button onClick={() => setShowAuth(true)} style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 10, minHeight: 36, padding: "0 14px", fontSize: 14, color: COLORS.navy, fontFamily: FONT.sans, cursor: "pointer" }}>Sign in</button>
            )}
            {!isPro && (
              <>
                <span style={{ background: COLORS.sunk, borderRadius: 999, padding: "4px 12px", fontSize: 13, color: COLORS.navyMid, fontFamily: FONT.sans }}>{remaining} free {remaining === 1 ? "use" : "uses"} left</span>
                <button onClick={() => { setUpgradeTrigger("manual"); setShowUpgrade(true); }} style={{ background: COLORS.navy, border: "none", borderRadius: 10, minHeight: 36, padding: "0 16px", fontSize: 14, color: "#fff", fontFamily: FONT.sans, fontWeight: 600, cursor: "pointer" }}>Upgrade</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Hero ── */}
      <div style={{ background: COLORS.canvas }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px 8px" }}>
          <h1 style={{ fontSize: "clamp(32px, 6vw, 40px)", fontWeight: 600, color: COLORS.navy, margin: "0 0 12px", lineHeight: 1.1, letterSpacing: "-0.03em" }}>
            Prepare for the conversation.<br/>Build the relationship.
          </h1>
          <p style={{ fontSize: 18, lineHeight: "28px", color: COLORS.navyMid, margin: 0, maxWidth: "40rem", fontFamily: FONT.sans }}>
            Describe the person and the situation. Get a GROW-structured coaching guide and a development summary, ready before you walk in.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "28px 24px 60px" }}>

        {/* ── Form ── */}
        <div style={{ background: COLORS.white, borderRadius: 22, boxShadow: SHADOW, padding: "clamp(24px, 5vw, 48px)", marginBottom: 32 }}>

          <h2 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.01em", color: COLORS.navy, margin: "0 0 24px", fontFamily: FONT.sans }}>
            The coaching situation
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0 20px" }}>
            <TextField label="Your name" value={form.managerName} onChange={f("managerName")} placeholder="Your name" required />
            <TextField label="Person you are coaching" value={form.personName} onChange={f("personName")} placeholder="Their name" required />
          </div>
          <TextField label="Their role" value={form.personRole} onChange={f("personRole")} placeholder="e.g. Senior Account Manager" />
          <TextField label="Coaching topic" value={form.coachingTopic} onChange={f("coachingTopic")}
            placeholder="e.g. Struggling to give clear direction in project kick-off meetings"
            hint="Be specific. Describe a situation, behaviour or development need, not just a general area."
            required multiline />
          <TextField label="Context and what you have observed" value={form.context} onChange={f("context")}
            placeholder="What have you seen? What has happened? What makes this the right time to address it?"
            multiline />

          <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 20, marginTop: 4 }}>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: COLORS.navy, margin: "0 0 16px", fontFamily: FONT.sans }}>Goal for this conversation</h3>
            <ToggleGroup
              label="What do you most want this person to leave with?"
              value={form.coachingGoal}
              onChange={f("coachingGoal")}
              options={[
                { value: "Awareness", label: "Awareness: understand themselves better" },
                { value: "Commitment", label: "Commitment: agree to take action" },
                { value: "Reflection", label: "Reflection: extract learning from experience" },
              ]}
            />
          </div>

          <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 20, marginTop: 4 }}>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: COLORS.navy, margin: "0 0 16px", fontFamily: FONT.sans }}>
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
              <h3 style={{ fontSize: 17, fontWeight: 600, color: COLORS.navy, margin: "0 0 12px", fontFamily: FONT.sans }}>Challenge and support assessment</h3>
              <div style={{ background: COLORS.sunk, borderRadius: 10, padding: "16px 20px" }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: COLORS.navy, margin: "0 0 6px", fontFamily: FONT.sans }}>{challengeZone.zone}</p>
                <p style={{ fontSize: 14, color: COLORS.navyMid, margin: "0 0 6px", fontFamily: FONT.sans, lineHeight: "20px" }}>{challengeZone.summary}</p>
                <p style={{ fontSize: 13, color: COLORS.navyMid, margin: 0, fontFamily: FONT.sans, lineHeight: 1.5 }}>{challengeZone.supportLevel}</p>
              </div>
            </div>
          )}

          {/* Cadence preview */}
          {cadence && (
            <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 20, marginTop: 4 }}>
              <h3 style={{ fontSize: 17, fontWeight: 600, color: COLORS.navy, margin: "0 0 12px", fontFamily: FONT.sans }}>Suggested coaching cadence</h3>
              <div style={{ background: COLORS.tealLight, borderRadius: 10, padding: "16px 20px" }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: COLORS.navy, margin: "0 0 4px", fontFamily: FONT.sans }}>{cadence.frequency}</p>
                <p style={{ fontSize: 14, color: COLORS.navy, margin: "0 0 6px", fontFamily: FONT.sans }}>{cadence.format}</p>
                <p style={{ fontSize: 13, color: COLORS.navyMid, margin: 0, fontFamily: FONT.sans, lineHeight: 1.5 }}>{cadence.rationale}</p>
              </div>
            </div>
          )}

          <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 16, marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14, color: COLORS.navyMid, fontFamily: FONT.sans }}>
              <input type="checkbox" checked={form.saveLocally} onChange={e => setForm(p => ({ ...p, saveLocally: e.target.checked }))} style={{ width: 18, height: 18, accentColor: COLORS.navy }} />
              Save this session to history
            </label>
            {error && <p style={{ fontSize: 14, color: COLORS.red, margin: 0, fontFamily: FONT.sans }}>{error}</p>}
          </div>

          <button onClick={generate} disabled={loading}
            style={{ width: "100%", marginTop: 20, minHeight: 52, padding: "0 24px", background: COLORS.navy, opacity: loading ? 0.7 : 1, color: "#fff", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: FONT.sans, transition: "opacity 0.2s" }}>
            {loading ? "Generating your coaching guide..." : "Generate coaching guide"}
          </button>

          {!isPro && remaining <= 1 && !loading && (
            <p style={{ textAlign: "center", fontSize: 13, color: COLORS.amber, marginTop: 12, fontFamily: FONT.sans }}>
              {remaining === 0 ? "You've used all free sessions." : "Last free session."}{" "}
              <span style={{ textDecoration: "underline", textUnderlineOffset: 4, cursor: "pointer" }} onClick={() => { setUpgradeTrigger("limit"); setShowUpgrade(true); }}>Upgrade for unlimited access.</span>
            </p>
          )}
        </div>

        {/* ── Topic sharpening ── */}
        {topicCheck && !topicAccepted && (
          <div style={{ background: COLORS.amberLight, borderRadius: 10, padding: "24px 28px", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 17, fontWeight: 600, color: COLORS.navy, margin: "0 0 4px", fontFamily: FONT.sans }}>Your coaching topic needs sharpening</p>
                <p style={{ fontSize: 14, color: COLORS.navyMid, margin: 0, fontFamily: FONT.sans, lineHeight: 1.6 }}>{topicCheck.reason}</p>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.navy, marginBottom: 8, fontFamily: FONT.sans }}>Suggested rewrite. Edit it if you need to.</label>
              <textarea value={sharpenedTopic} onChange={e => setSharpenedTopic(e.target.value)} rows={3}
                style={{ width: "100%", padding: "12px 16px", border: `1px solid ${COLORS.border}`, borderRadius: 10, fontSize: 15, lineHeight: 1.6, color: COLORS.text, fontFamily: FONT.sans, boxSizing: "border-box", background: COLORS.white, resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={() => { setTopicAccepted(true); runGenerate(sharpenedTopic); }}
                style={{ minHeight: 44, padding: "0 24px", background: COLORS.navy, color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: FONT.sans }}>
                Use this and generate the guide
              </button>
              <button onClick={() => { setTopicCheck(null); setTopicAccepted(true); setSharpenedTopic(form.coachingTopic); runGenerate(form.coachingTopic); }}
                style={{ minHeight: 44, padding: "0 24px", background: COLORS.white, color: COLORS.navy, border: `1px solid ${COLORS.border}`, borderRadius: 10, fontSize: 15, fontWeight: 500, cursor: "pointer", fontFamily: FONT.sans }}>
                Keep my original wording
              </button>
            </div>
          </div>
        )}

        {/* ── Results ── */}
        {result && (
          <div ref={resultsRef}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              <h2 style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em", color: COLORS.navy, margin: 0, fontFamily: FONT.sans }}>Your coaching guide</h2>
              <Badge color="green">Ready to use</Badge>
            </div>

            {/* Coaching approach */}
            {result.approach && (
              <div style={{ background: COLORS.tealLight, borderRadius: 10, padding: "20px 24px", marginBottom: 20 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, letterSpacing: "0.01em", margin: "0 0 6px", fontFamily: FONT.sans }}>The most important thing to hold in mind</p>
                <p style={{ fontSize: 17, fontWeight: 500, color: COLORS.navy, margin: 0, fontFamily: FONT.sans, lineHeight: 1.5 }}>{result.approach}</p>
              </div>
            )}

            {/* Zone + cadence row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginBottom: 20 }}>
              <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "20px 24px" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.muted, letterSpacing: "0.01em", margin: "0 0 4px", fontFamily: FONT.sans }}>Challenge and support zone</p>
                <p style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.01em", color: COLORS.navy, margin: "0 0 6px" }}>{result.challengeZone.zone}</p>
                <p style={{ fontSize: 14, color: COLORS.navyMid, margin: 0, fontFamily: FONT.sans, lineHeight: "20px" }}>{result.challengeZone.managerGuidance}</p>
              </div>
              <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "20px 24px" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.muted, letterSpacing: "0.01em", margin: "0 0 4px", fontFamily: FONT.sans }}>Coaching cadence</p>
                <p style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.01em", color: COLORS.navy, margin: "0 0 6px" }}>{result.cadence.frequency}</p>
                <p style={{ fontSize: 14, color: COLORS.navyMid, margin: 0, fontFamily: FONT.sans, lineHeight: "20px" }}>{result.cadence.format}</p>
              </div>
            </div>

            {/* Cadence detail + ICS */}
            <div style={{ background: COLORS.tealLight, borderRadius: 10, padding: "20px 24px", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, letterSpacing: "0.01em", margin: 0, fontFamily: FONT.sans }}>Recommended coaching rhythm</p>
                </div>
                {!result.cadence.frequency.toLowerCase().includes("single") && (
                  <button onClick={() => generateICS({ coachingTopic: result.coachingTopic, personName: result.personName, managerName: result.managerName, cadence: result.cadence })}
                    style={{ display: "flex", alignItems: "center", minHeight: 40, padding: "0 18px", background: COLORS.navy, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT.sans, whiteSpace: "nowrap" }}>
                    Add to calendar
                  </button>
                )}
              </div>
              <p style={{ fontSize: 14, color: COLORS.navy, lineHeight: 1.6, margin: "0 0 10px", fontFamily: FONT.sans }}><strong style={{ fontWeight: 600 }}>Manager note:</strong> {result.cadence.managerNote}</p>
              <p style={{ fontSize: 14, color: COLORS.navy, lineHeight: 1.6, margin: 0, fontFamily: FONT.sans }}><strong style={{ fontWeight: 600 }}>What to say to {result.personName}:</strong> {result.cadence.delegateeNote}</p>
            </div>

            <OutputBox
              title={`Coaching conversation guide for ${displayName(result.managerName)}`}
              content={result.guide}
              badge={{ color: "blue", label: "Manager only" }}
            />
            <OutputBox
              title={`Development summary for ${displayName(result.personName)}`}
              content={result.summary}
              badge={{ color: "teal", label: "Share after the conversation" }}
              spoken
            />

            <div style={{ background: COLORS.white, borderRadius: 10, padding: "16px 20px", border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <p style={{ fontSize: 14, color: COLORS.navyMid, margin: 0, fontFamily: FONT.sans }}>Both outputs are editable. Adjust to fit your voice before the conversation.</p>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                {user && splitName((result?.personName || form.personName)) && (
                  <button onClick={saveToPerson} disabled={saveState !== "idle"} style={{ fontSize: 14, minHeight: 44, padding: "0 20px", background: saveState === "saved" ? COLORS.greenLight : COLORS.navy, border: saveState === "saved" ? `1px solid ${COLORS.green}` : "none", borderRadius: 10, color: saveState === "saved" ? COLORS.green : "#fff", cursor: saveState === "idle" ? "pointer" : "default", fontFamily: FONT.sans, fontWeight: 600 }}>
                    {saveState === "saved" ? `Saved to ${(person || teamMatch).first_name}'s record` : saveState === "saving" ? "Saving..." : (person || teamMatch) ? `Save to ${(person || teamMatch).first_name}'s record` : `Add ${splitName((result?.personName || form.personName)).first_name} to your team and save`}
                  </button>
                )}
                <button onClick={downloadPdf} disabled={downloadingPdf} style={{ fontSize: 14, minHeight: 44, padding: "0 20px", background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.navy, cursor: downloadingPdf ? "default" : "pointer", fontFamily: FONT.sans, fontWeight: 600, opacity: downloadingPdf ? 0.7 : 1 }}>{downloadingPdf ? "Preparing PDF..." : (isPro ? "Download PDF" : "Download PDF (Pro)")}</button>
                <a href={DASHBOARD_URL} style={{ fontSize: 14, minHeight: 44, padding: "0 20px", background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.navy, cursor: "pointer", fontFamily: FONT.sans, fontWeight: 600, display: "inline-flex", alignItems: "center", textDecoration: "none" }}>Back to dashboard</a>
                <button onClick={resetAll} style={{ fontSize: 14, minHeight: 44, padding: "0 20px", background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.navy, cursor: "pointer", fontFamily: FONT.sans, fontWeight: 500 }}>New session</button>
              </div>
            </div>
            {addedPerson && saveState === "saved" && (
              <p style={{ fontSize: 14, lineHeight: "22px", color: COLORS.navyMid, margin: 0, fontFamily: FONT.sans }}>
                {addedPerson.first_name} is now on your team. <a href={personRecordUrl(addedPerson.id)} style={{ color: COLORS.navy, textUnderlineOffset: 4 }}>Open {addedPerson.first_name}&rsquo;s record</a> to add their role and what they respond to. Every tool reads it.
              </p>
            )}
          </div>
        )}

        {/* ── How it works (pre-generate) ── */}
        {!result && !loading && (
          <div style={{ marginTop: 8 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: COLORS.muted, letterSpacing: "0.01em", margin: "0 0 16px", fontFamily: FONT.sans }}>How it works</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
              {[
                { n: "1", title: "Describe the situation", desc: "Tell us who you are coaching, what the topic is, and what you have observed." },
                { n: "2", title: "Set the conversation goal", desc: "Awareness, commitment or reflection. The goal shapes the questions you will ask." },
                { n: "3", title: "Get your guide", desc: "Receive a GROW conversation guide and a development summary ready to share." },
              ].map(s => (
                <div key={s.n} style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "20px 22px" }}>
                  <div style={{ fontSize: 20, fontWeight: 600, color: COLORS.teal, marginBottom: 8, fontFamily: FONT.sans }}>{s.n}</div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: COLORS.navy, margin: "0 0 4px", fontFamily: FONT.sans }}>{s.title}</p>
                  <p style={{ fontSize: 14, color: COLORS.navyMid, margin: 0, lineHeight: "20px", fontFamily: FONT.sans }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div style={{ borderTop: `1px solid ${COLORS.border}`, marginTop: 40, paddingTop: 20, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: COLORS.muted, margin: 0, fontFamily: FONT.sans }}>
            Coach Ignite, part of <a href="https://management-ignition.com" style={{ color: COLORS.navyMid, textUnderlineOffset: 4 }}>Management Ignition</a>
            {!isPro && <> · {remaining} free {remaining === 1 ? "use" : "uses"} remaining · <span style={{ textDecoration: "underline", textUnderlineOffset: 4, cursor: "pointer", color: COLORS.navyMid }} onClick={() => { setUpgradeTrigger("manual"); setShowUpgrade(true); }}>Upgrade to Pro</span></>}
            {isPro && <> · <span style={{ color: COLORS.green, fontWeight: 600 }}>Pro, unlimited access</span></>}
          </p>
        </div>

      </div>
    </div>
  );
}
