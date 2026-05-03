import { useState, useEffect, useCallback } from "react";
import { subscribeBookings, subscribeMessages } from '../firebase/services';
import { markMessageRead } from '../firebase/services';

// ─── Persistent storage helpers ───────────────────────────────────────────────
const CREDS_KEY   = "asmira_admin_creds";
const SESSION_KEY = "asmira_admin_session";

const DEFAULT_CREDS = { id: "admin", password: "asmira2024" };

function getCreds() {
  try {
    const raw = localStorage.getItem(CREDS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_CREDS;
  } catch { return DEFAULT_CREDS; }
}
function saveCreds(c) { localStorage.setItem(CREDS_KEY, JSON.stringify(c)); }
function isSessionValid() {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY) || "{}");
    return s.exp && Date.now() < s.exp;
  } catch { return false; }
}
function createSession() {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ exp: Date.now() + 8 * 60 * 60 * 1000 }));
}
function destroySession() { localStorage.removeItem(SESSION_KEY); }

// ─── Mock data (replace with Firebase calls in production) ───────────────────
// const MOCK_BOOKINGS = [
//   { id: "B001", name: "Priya Sharma", email: "priya@gmail.com", phone: "+91 98765 43210", city: "Valsad", service: "Individual Counselling", mode: "In-Person", time: "Weekday evenings", concern: "Anxiety and overthinking affecting daily life", consent: true, date: "2025-07-14T10:23:00", status: "pending" },
//   { id: "B002", name: "Rohan Mehta", email: "rohan.m@email.com", phone: "+91 91234 56789", city: "Surat", service: "Online Counselling", mode: "Online — Video Call", time: "Saturday mornings", concern: "Relationship issues and self-esteem", consent: true, date: "2025-07-13T14:05:00", status: "confirmed" },
//   { id: "B003", name: "Aisha Khan", email: "aisha.k@gmail.com", phone: "+91 87654 32109", city: "Mumbai", service: "Adolescent Counselling (Ages 12–18)", mode: "Online — Voice Call", time: "Sunday afternoons", concern: "Academic stress and peer pressure (for my 15-year-old)", consent: true, date: "2025-07-12T09:47:00", status: "completed" },
//   { id: "B004", name: "Vishal Patel", email: "vishal.p@yahoo.com", phone: "+91 99887 76655", city: "Valsad", service: "Parenting Guidance", mode: "In-Person", time: "Weekday mornings", concern: "Child behavioral challenges", consent: true, date: "2025-07-11T16:30:00", status: "pending" },
//   { id: "B005", name: "Sneha Joshi", email: "sneha.j@email.com", phone: "+91 77665 54433", city: "Navsari", service: "Emotional Wellness Session", mode: "Online — Video Call", time: "Flexible", concern: "", consent: true, date: "2025-07-10T11:15:00", status: "cancelled" },
//   { id: "B006", name: "Arjun Desai", email: "arjun.d@gmail.com", phone: "+91 88776 65544", city: "Valsad", service: "Individual Counselling", mode: "In-Person", time: "Tuesday evenings", concern: "Work-life balance and burnout", consent: true, date: "2025-07-09T08:55:00", status: "confirmed" },
// ];

// const MOCK_CONTACTS = [
//   { id: "C001", name: "Kavita Rao", email: "kavita.r@gmail.com", phone: "+91 90909 09090", subject: "Parenting Awareness Sessions", message: "Hello, I wanted to know more about your group parenting workshops. My daughter is 10 and I'm struggling with communication. Could you share more details about timings and fees?", date: "2025-07-14T08:10:00", read: false },
//   { id: "C002", name: "Manish Trivedi", email: "manish.t@outlook.com", phone: "", subject: "Individual Counselling", message: "I have been dealing with anxiety for a while and a friend suggested reaching out. I live in Valsad. What is your fee structure and is walk-in available?", date: "2025-07-13T19:42:00", read: false },
//   { id: "C003", name: "Ritu Shah", email: "ritu.s@gmail.com", phone: "+91 97531 86420", subject: "Online Counselling", message: "I'm based in Pune and would prefer online sessions. Could you let me know if you take on new clients currently and what the process looks like for first-timers?", date: "2025-07-12T13:20:00", read: true },
//   { id: "C004", name: "Hemant Kulkarni", email: "hemant.k@company.com", phone: "+91 80808 08080", subject: "Workshop / Corporate Program", message: "Our company would like to host an emotional wellness workshop for our 60-person team in Valsad. Looking for a half-day program. Please share your proposal.", date: "2025-07-10T10:05:00", read: true },
// ];

// ─── Color helpers ────────────────────────────────────────────────────────────
const STATUS_META = {
  pending:   { label: "Pending",   bg: "rgba(243,198,35,0.15)",  color: "#9a7200" },
  confirmed: { label: "Confirmed", bg: "rgba(34,197,94,0.12)",   color: "#166534" },
  completed: { label: "Completed", bg: "rgba(16,55,92,0.1)",     color: "#10375C" },
  cancelled: { label: "Cancelled", bg: "rgba(239,68,68,0.1)",    color: "#b91c1c" },
};

function fmtDate(iso) {
  return new Date(iso).toLocaleString("en-IN", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
}
function fmtDateShort(iso) {
  return new Date(iso).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
}

// ─── Inline styles (no external CSS needed) ───────────────────────────────────
const S = {
  // Page shell
  page: { minHeight:"100vh", background:"#0d1b2a", fontFamily:"'Plus Jakarta Sans', system-ui, sans-serif", color:"#e8edf4" },

  // Login screen
  loginWrap: { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg,#0d1b2a 0%,#10375C 60%,#1a4971 100%)", padding:"1.5rem" },
  loginCard: { width:"100%", maxWidth:"400px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"20px", padding:"2.5rem", backdropFilter:"blur(20px)" },
  loginLogo: { textAlign:"center", marginBottom:"2rem" },
  loginLogoInner: { display:"inline-flex", alignItems:"center", gap:"0.5rem", fontFamily:"'Cormorant Garamond', Georgia, serif", fontSize:"1.5rem", fontWeight:600, color:"#F4F6FF" },
  loginDot: { width:"9px", height:"9px", borderRadius:"50%", background:"#EB8317" },
  loginSub: { fontSize:"0.75rem", opacity:0.45, textAlign:"center", marginTop:"0.25rem", letterSpacing:"0.1em", textTransform:"uppercase" },
  loginField: { display:"flex", flexDirection:"column", gap:"0.35rem", marginBottom:"1rem" },
  loginLabel: { fontSize:"0.75rem", fontWeight:600, opacity:0.55, letterSpacing:"0.06em" },
  loginInput: { padding:"0.75rem 1rem", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"10px", color:"#e8edf4", fontSize:"0.9rem", outline:"none", fontFamily:"inherit", transition:"border-color 0.2s" },
  loginBtn: { width:"100%", padding:"0.85rem", background:"#EB8317", color:"#fff", border:"none", borderRadius:"50px", fontSize:"0.9rem", fontWeight:600, cursor:"pointer", fontFamily:"inherit", marginTop:"0.5rem", transition:"background 0.2s" },
  loginErr: { background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:"10px", padding:"0.75rem 1rem", fontSize:"0.8rem", color:"#fca5a5", marginBottom:"1rem" },
  loginHint: { textAlign:"center", fontSize:"0.72rem", opacity:0.35, marginTop:"1.25rem" },

  // Dashboard shell
  dash: { display:"flex", minHeight:"100vh" },
  sidebar: { width:"220px", flexShrink:0, background:"rgba(255,255,255,0.03)", borderRight:"1px solid rgba(255,255,255,0.06)", padding:"1.5rem 1rem", display:"flex", flexDirection:"column" },
  sidebarLogo: { display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"2rem", paddingLeft:"0.25rem" },
  sidebarLogoText: { fontFamily:"'Cormorant Garamond', Georgia, serif", fontSize:"1.2rem", fontWeight:600, color:"#F4F6FF", lineHeight:1.1 },
  sidebarLogoSub: { fontSize:"0.58rem", opacity:0.4, letterSpacing:"0.1em", textTransform:"uppercase" },
  navItem: (active) => ({ display:"flex", alignItems:"center", gap:"0.65rem", padding:"0.6rem 0.85rem", borderRadius:"10px", cursor:"pointer", fontSize:"0.85rem", fontWeight:500, background: active?"rgba(235,131,23,0.15)":"transparent", color: active?"#EB8317":"rgba(232,237,244,0.55)", border: active?"1px solid rgba(235,131,23,0.2)":"1px solid transparent", marginBottom:"0.25rem", transition:"all 0.2s" }),
  sidebarBottom: { marginTop:"auto" },
  logoutBtn: { display:"flex", alignItems:"center", gap:"0.6rem", padding:"0.6rem 0.85rem", borderRadius:"10px", cursor:"pointer", fontSize:"0.82rem", fontWeight:500, color:"rgba(232,237,244,0.4)", background:"transparent", border:"1px solid transparent", width:"100%", fontFamily:"inherit", transition:"all 0.2s" },

  // Main area
  main: { flex:1, overflowY:"auto", padding:"2rem" },
  topBar: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"2rem" },
  pageTitle: { fontFamily:"'Cormorant Garamond', Georgia, serif", fontSize:"2rem", fontWeight:600, color:"#F4F6FF", lineHeight:1.1 },
  pageSub: { fontSize:"0.8rem", opacity:0.45, marginTop:"0.25rem" },

  // Stats row
  statsRow: { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem", marginBottom:"2rem" },
  statCard: { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"14px", padding:"1.25rem" },
  statVal: { fontFamily:"'Cormorant Garamond', Georgia, serif", fontSize:"2.2rem", fontWeight:600, color:"#F3C623", lineHeight:1 },
  statLabel: { fontSize:"0.75rem", opacity:0.5, marginTop:"0.3rem" },

  // Table
  tableWrap: { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"16px", overflow:"hidden" },
  tableHead: { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"1.25rem 1.5rem", borderBottom:"1px solid rgba(255,255,255,0.06)" },
  tableTitle: { fontFamily:"'Cormorant Garamond', Georgia, serif", fontSize:"1.2rem", fontWeight:600, color:"#F4F6FF" },
  searchInput: { padding:"0.5rem 0.9rem", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"50px", color:"#e8edf4", fontSize:"0.8rem", outline:"none", fontFamily:"inherit", width:"200px" },
  table: { width:"100%", borderCollapse:"collapse" },
  th: { padding:"0.75rem 1rem", textAlign:"left", fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", opacity:0.4, borderBottom:"1px solid rgba(255,255,255,0.05)" },
  td: { padding:"0.9rem 1rem", fontSize:"0.82rem", borderBottom:"1px solid rgba(255,255,255,0.04)", verticalAlign:"top" },
  rowHover: { background:"rgba(255,255,255,0.025)", cursor:"pointer" },

  // Badge
  badge: (status) => ({ display:"inline-block", padding:"0.2rem 0.65rem", borderRadius:"50px", fontSize:"0.7rem", fontWeight:600, background:STATUS_META[status]?.bg||"rgba(255,255,255,0.1)", color:STATUS_META[status]?.color||"#aaa" }),
  unreadDot: { display:"inline-block", width:"7px", height:"7px", borderRadius:"50%", background:"#EB8317", marginRight:"0.4rem", flexShrink:0 },

  // Detail modal
  overlay: { position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(4px)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" },
  modal: { background:"#0f2238", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"20px", padding:"2rem", maxWidth:"560px", width:"100%", maxHeight:"85vh", overflowY:"auto" },
  modalTitle: { fontFamily:"'Cormorant Garamond', Georgia, serif", fontSize:"1.5rem", fontWeight:600, color:"#F4F6FF", marginBottom:"0.25rem" },
  modalSub: { fontSize:"0.75rem", opacity:0.4, marginBottom:"1.5rem" },
  fieldRow: { display:"flex", gap:"0.5rem", marginBottom:"0.5rem" },
  fieldKey: { fontSize:"0.72rem", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", opacity:0.4, width:"110px", flexShrink:0, paddingTop:"1px" },
  fieldVal: { fontSize:"0.85rem", color:"#e8edf4", lineHeight:1.6 },
  closeBtn: { padding:"0.55rem 1.5rem", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"50px", color:"#e8edf4", fontSize:"0.82rem", cursor:"pointer", fontFamily:"inherit" },
  statusSelect: { padding:"0.45rem 0.8rem", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", color:"#e8edf4", fontSize:"0.82rem", cursor:"pointer", fontFamily:"inherit", outline:"none" },

  // Settings
  settingsCard: { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"16px", padding:"2rem", maxWidth:"480px", marginBottom:"1.5rem" },
  settingsTitle: { fontFamily:"'Cormorant Garamond', Georgia, serif", fontSize:"1.2rem", fontWeight:600, color:"#F4F6FF", marginBottom:"0.25rem" },
  settingsSub: { fontSize:"0.78rem", opacity:0.45, marginBottom:"1.5rem" },
  settingsField: { display:"flex", flexDirection:"column", gap:"0.35rem", marginBottom:"1rem" },
  settingsLabel: { fontSize:"0.75rem", fontWeight:600, opacity:0.5, letterSpacing:"0.05em" },
  settingsInput: { padding:"0.7rem 1rem", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"10px", color:"#e8edf4", fontSize:"0.875rem", outline:"none", fontFamily:"inherit" },
  settingsBtn: { padding:"0.65rem 1.75rem", background:"#EB8317", color:"#fff", border:"none", borderRadius:"50px", fontSize:"0.875rem", fontWeight:600, cursor:"pointer", fontFamily:"inherit" },
  successMsg: { background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.2)", borderRadius:"10px", padding:"0.75rem 1rem", fontSize:"0.82rem", color:"#86efac", marginTop:"0.75rem" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function LoginScreen({ onLogin }) {
  const [id, setId]   = useState("");
  const [pw, setPw]   = useState("");
  const [err, setErr] = useState("");
  const [show, setShow] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    const creds = getCreds();
    if (id === creds.id && pw === creds.password) {
      createSession();
      onLogin();
    } else {
      setErr("Invalid Admin ID or password. Please try again.");
    }
  };

  return (
    <div style={S.loginWrap}>
      <div style={S.loginCard}>
        <div style={S.loginLogo}>
          <div style={S.loginLogoInner}>
            <div style={S.loginDot} />
            Asmira
          </div>
          <div style={S.loginSub}>Admin Portal</div>
        </div>

        <form onSubmit={submit}>
          {err && <div style={S.loginErr}>{err}</div>}

          <div style={S.loginField}>
            <label style={S.loginLabel}>Admin ID</label>
            <input style={S.loginInput} type="text" value={id}
              onChange={e => { setId(e.target.value); setErr(""); }}
              placeholder="Enter your admin ID" autoComplete="username" />
          </div>

          <div style={S.loginField}>
            <label style={S.loginLabel}>Password</label>
            <div style={{ position:"relative" }}>
              <input style={{ ...S.loginInput, width:"100%", paddingRight:"3rem" }}
                type={show ? "text" : "password"} value={pw}
                onChange={e => { setPw(e.target.value); setErr(""); }}
                placeholder="Enter password" autoComplete="current-password" />
              <button type="button" onClick={() => setShow(s => !s)}
                style={{ position:"absolute", right:"0.75rem", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"rgba(232,237,244,0.4)", cursor:"pointer", fontSize:"0.75rem", padding:0 }}>
                {show ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          <button type="submit" style={S.loginBtn}
            onMouseEnter={e => e.target.style.background="#10375C"}
            onMouseLeave={e => e.target.style.background="#EB8317"}>
            Sign In to Dashboard
          </button>
        </form>

        <div style={S.loginHint}>Default — ID: admin &nbsp;|&nbsp; Password: asmira2024</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  return <span style={S.badge(status)}>{STATUS_META[status]?.label || status}</span>;
}

function BookingDetail({ booking, onClose, onStatusChange }) {
  const [status, setStatus] = useState(booking.status);

  const handleStatus = (e) => {
    setStatus(e.target.value);
    onStatusChange(booking.id, e.target.value);
  };

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>
        <div style={S.modalTitle}>{booking.name}</div>
        <div style={S.modalSub}>Booking #{booking.id} · {fmtDate(booking.date)}</div>

        {[
          ["Email",    booking.email],
          ["Phone",    booking.phone],
          ["City",     booking.city],
          ["Service",  booking.service],
          ["Mode",     booking.mode],
          ["Preferred Time", booking.time || "—"],
          ["Concern",  booking.concern || "Not provided"],
        ].map(([k,v]) => (
          <div key={k} style={S.fieldRow}>
            <span style={S.fieldKey}>{k}</span>
            <span style={{ ...S.fieldVal, color: k==="Concern" ? "rgba(232,237,244,0.65)" : "#e8edf4" }}>{v}</span>
          </div>
        ))}

        <div style={{ ...S.fieldRow, alignItems:"center", marginTop:"0.5rem" }}>
          <span style={S.fieldKey}>Status</span>
          <select style={S.statusSelect} value={status} onChange={handleStatus}>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div style={{ display:"flex", gap:"0.75rem", marginTop:"1.75rem" }}>
          <button style={S.closeBtn} onClick={onClose}>Close</button>
          <a href={`mailto:${booking.email}`}
            style={{ ...S.closeBtn, background:"rgba(235,131,23,0.15)", borderColor:"rgba(235,131,23,0.3)", color:"#EB8317", textDecoration:"none", padding:"0.55rem 1.5rem", borderRadius:"50px", fontSize:"0.82rem", display:"inline-block" }}>
            Email Patient
          </a>
        </div>
      </div>
    </div>
  );
}

function ContactDetail({ contact, onClose, onMarkRead }) {
  useEffect(() => { if (!contact.read) onMarkRead(contact.id); }, []);

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>
        <div style={S.modalTitle}>{contact.name}</div>
        <div style={S.modalSub}>Message #{contact.id} · {fmtDate(contact.date)}</div>

        {[
          ["Email",   contact.email],
          ["Phone",   contact.phone || "Not provided"],
          ["Subject", contact.subject],
        ].map(([k,v]) => (
          <div key={k} style={S.fieldRow}>
            <span style={S.fieldKey}>{k}</span>
            <span style={S.fieldVal}>{v}</span>
          </div>
        ))}

        <div style={{ marginTop:"1rem", padding:"1rem", background:"rgba(255,255,255,0.04)", borderRadius:"12px", border:"1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", opacity:0.4, marginBottom:"0.6rem" }}>Message</div>
          <div style={{ fontSize:"0.875rem", lineHeight:1.75, color:"rgba(232,237,244,0.8)" }}>{contact.message}</div>
        </div>

        <div style={{ display:"flex", gap:"0.75rem", marginTop:"1.75rem" }}>
          <button style={S.closeBtn} onClick={onClose}>Close</button>
          <a href={`mailto:${contact.email}`}
            style={{ ...S.closeBtn, background:"rgba(235,131,23,0.15)", borderColor:"rgba(235,131,23,0.3)", color:"#EB8317", textDecoration:"none", padding:"0.55rem 1.5rem", borderRadius:"50px", fontSize:"0.82rem", display:"inline-block" }}>
            Reply via Email
          </a>
        </div>
      </div>
    </div>
  );
}
const markRead = async (id) => {
  await markMessageRead(id);
};

function BookingsTab({ bookings, onStatusChange }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);

  const filtered = bookings.filter(b => {
    const q = search.toLowerCase();
    const matchQ = !q || b.firstName.toLowerCase().includes(q) || b.email.toLowerCase().includes(q) || b.service.toLowerCase().includes(q) || b.city.toLowerCase().includes(q);
    const matchF = filter === "all" || b.status === filter;
    return matchQ && matchF;
  });

  const counts = { all: bookings.length, pending: bookings.filter(b=>b.status==="pending").length, confirmed: bookings.filter(b=>b.status==="confirmed").length, completed: bookings.filter(b=>b.status==="completed").length, cancelled: bookings.filter(b=>b.status==="cancelled").length };

  return (
    <div>
      {/* Stats */}
      <div style={S.statsRow}>
        {[["Total", counts.all, "#F3C623"], ["Pending", counts.pending, "#EB8317"], ["Confirmed", counts.confirmed, "#22c55e"], ["Completed", counts.completed, "#60a5fa"]].map(([l,v,c]) => (
          <div key={l} style={S.statCard}>
            <div style={{ ...S.statVal, color:c }}>{v}</div>
            <div style={S.statLabel}>{l} Bookings</div>
          </div>
        ))}
      </div>

      <div style={S.tableWrap}>
        <div style={S.tableHead}>
          <div style={S.tableTitle}>All Bookings</div>
          <div style={{ display:"flex", gap:"0.75rem", alignItems:"center" }}>
            {/* Filter pills */}
            {["all","pending","confirmed","completed","cancelled"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding:"0.3rem 0.85rem", borderRadius:"50px", border:"1px solid", fontSize:"0.72rem", fontWeight:600, cursor:"pointer", fontFamily:"inherit", textTransform:"capitalize",
                  background: filter===f ? "#EB8317" : "rgba(255,255,255,0.05)",
                  borderColor: filter===f ? "#EB8317" : "rgba(255,255,255,0.1)",
                  color: filter===f ? "#fff" : "rgba(232,237,244,0.5)" }}>
                {f==="all"?`All (${counts.all})`:f}
              </button>
            ))}
            <input style={S.searchInput} placeholder="Search bookings…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <table style={S.table}>
          <thead>
            <tr>
              {["Patient","Service","Mode","City","Date","Status"].map(h => <th key={h} style={S.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ ...S.td, textAlign:"center", opacity:0.4, padding:"2.5rem" }}>No bookings found</td></tr>
            ) : filtered.map(b => (
              <tr key={b.id}
                style={{ cursor:"pointer", background: hovered===b.id ? "rgba(255,255,255,0.025)" : "transparent", transition:"background 0.15s" }}
                onMouseEnter={() => setHovered(b.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setSelected(b)}>
                <td style={S.td}>
                  <div style={{ fontWeight:600, color:"#F4F6FF", marginBottom:"0.15rem" }}>{b.firstName}</div>
                  <div style={{ fontSize:"0.75rem", opacity:0.45 }}>{b.email}</div>
                </td>
                <td style={{ ...S.td, maxWidth:"160px" }}>
                  <div style={{ fontSize:"0.8rem", lineHeight:1.4 }}>{b.service}</div>
                </td>
                <td style={S.td}><div style={{ fontSize:"0.78rem", opacity:0.65 }}>{b.mode}</div></td>
                <td style={S.td}><div style={{ fontSize:"0.8rem" }}>{b.city}</div></td>
                <td style={S.td}><div style={{ fontSize:"0.75rem", opacity:0.5, whiteSpace:"nowrap" }}>{fmtDateShort(b.createdAt?.toDate())}</div></td>
                <td style={S.td}><StatusBadge status={b.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <BookingDetail booking={selected} onClose={() => setSelected(null)}
          onStatusChange={(id, newStatus) => { onStatusChange(id, newStatus); setSelected(s => ({ ...s, status: newStatus })); }} />
      )}
    </div>
  );
}

function ContactsTab({ contacts, onMarkRead }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q) || c.message.toLowerCase().includes(q);
    const matchF = filter === "all" || (filter==="unread" && !c.read) || (filter==="read" && c.read);
    return matchQ && matchF;
  });
  const updateStatus = async (id, status) => {
  await updateBookingStatus(id, status);
};
  const unreadCount = contacts.filter(c => !c.read).length;

  return (
    <div>
      <div style={S.statsRow}>
        {[["Total Messages", contacts.length, "#F3C623"], ["Unread", unreadCount, "#EB8317"], ["Read", contacts.length - unreadCount, "#60a5fa"], ["This Week", contacts.length, "#a78bfa"]].map(([l,v,c]) => (
          <div key={l} style={S.statCard}>
            <div style={{ ...S.statVal, color:c }}>{v}</div>
            <div style={S.statLabel}>{l}</div>
          </div>
        ))}
      </div>

      <div style={S.tableWrap}>
        <div style={S.tableHead}>
          <div style={S.tableTitle}>All Messages</div>
          <div style={{ display:"flex", gap:"0.75rem", alignItems:"center" }}>
            {[["all","All"],["unread","Unread"],["read","Read"]].map(([v,l]) => (
              <button key={v} onClick={() => setFilter(v)}
                style={{ padding:"0.3rem 0.85rem", borderRadius:"50px", border:"1px solid", fontSize:"0.72rem", fontWeight:600, cursor:"pointer", fontFamily:"inherit",
                  background: filter===v ? "#EB8317" : "rgba(255,255,255,0.05)",
                  borderColor: filter===v ? "#EB8317" : "rgba(255,255,255,0.1)",
                  color: filter===v ? "#fff" : "rgba(232,237,244,0.5)" }}>
                {l}
              </button>
            ))}
            <input style={S.searchInput} placeholder="Search messages…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <table style={S.table}>
          <thead>
            <tr>
              {["Sender","Subject","Preview","Date","Status"].map(h => <th key={h} style={S.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ ...S.td, textAlign:"center", opacity:0.4, padding:"2.5rem" }}>No messages found</td></tr>
            ) : filtered.map(c => (
              <tr key={c.id}
                style={{ cursor:"pointer", background: hovered===c.id ? "rgba(255,255,255,0.025)" : "transparent", transition:"background 0.15s" }}
                onMouseEnter={() => setHovered(c.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setSelected(c)}>
                <td style={S.td}>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.35rem" }}>
                    {!c.read && <div style={S.unreadDot} />}
                    <div>
                      <div style={{ fontWeight: c.read ? 400 : 600, color:"#F4F6FF", marginBottom:"0.1rem" }}>{c.name}</div>
                      <div style={{ fontSize:"0.72rem", opacity:0.4 }}>{c.email}</div>
                    </div>
                  </div>
                </td>
                <td style={S.td}><div style={{ fontSize:"0.8rem", fontWeight: c.read ? 400 : 500 }}>{c.subject}</div></td>
                <td style={{ ...S.td, maxWidth:"200px" }}>
                  <div style={{ fontSize:"0.78rem", opacity:0.5, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"180px" }}>{c.message}</div>
                </td>
                <td style={S.td}><div style={{ fontSize:"0.75rem", opacity:0.45, whiteSpace:"nowrap" }}>{fmtDateShort(c.date)}</div></td>
                <td style={S.td}>
                  <span style={{ display:"inline-block", padding:"0.18rem 0.6rem", borderRadius:"50px", fontSize:"0.68rem", fontWeight:600,
                    background: c.read ? "rgba(255,255,255,0.06)" : "rgba(235,131,23,0.15)",
                    color: c.read ? "rgba(232,237,244,0.4)" : "#EB8317" }}>
                    {c.read ? "Read" : "New"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <ContactDetail contact={selected} onClose={() => setSelected(null)}
          onMarkRead={(id) => { onMarkRead(id); setSelected(s => ({ ...s, read:true })); }} />
      )}
    </div>
  );
}

function SettingsTab({ onLogout }) {
  const [id, setId]     = useState("");
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confPw, setConfPw] = useState("");
  const [msg, setMsg]   = useState({ type:"", text:"" });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const save = (e) => {
    e.preventDefault();
    setMsg({ type:"", text:"" });
    const creds = getCreds();
    if (oldPw !== creds.password) { setMsg({ type:"err", text:"Current password is incorrect." }); return; }
    if (newPw.length < 6) { setMsg({ type:"err", text:"New password must be at least 6 characters." }); return; }
    if (newPw !== confPw) { setMsg({ type:"err", text:"Passwords do not match." }); return; }
    const newId = id.trim() || creds.id;
    saveCreds({ id:newId, password:newPw });
    setMsg({ type:"ok", text:"Credentials updated successfully. Please use your new credentials on next login." });
    setId(""); setOldPw(""); setNewPw(""); setConfPw("");
  };

  const currentId = getCreds().id;

  return (
    <div>
      <div style={S.settingsCard}>
        <div style={S.settingsTitle}>Change Admin Credentials</div>
        <div style={S.settingsSub}>Update your Admin ID and/or password. You'll need your current password to make changes.</div>

        <div style={{ marginBottom:"1rem", padding:"0.75rem 1rem", background:"rgba(255,255,255,0.04)", borderRadius:"10px", fontSize:"0.8rem", opacity:0.55 }}>
          Current Admin ID: <strong style={{ color:"#F3C623", opacity:1 }}>{currentId}</strong>
        </div>

        <form onSubmit={save}>
          <div style={S.settingsField}>
            <label style={S.settingsLabel}>New Admin ID (leave blank to keep current)</label>
            <input style={S.settingsInput} type="text" value={id} onChange={e => setId(e.target.value)} placeholder={`Current: ${currentId}`} autoComplete="off" />
          </div>
          <div style={S.settingsField}>
            <label style={S.settingsLabel}>Current Password *</label>
            <div style={{ position:"relative" }}>
              <input style={{ ...S.settingsInput, width:"100%", paddingRight:"3.5rem" }}
                type={showOld?"text":"password"} value={oldPw} onChange={e=>setOldPw(e.target.value)} placeholder="Enter current password" required />
              <button type="button" onClick={()=>setShowOld(s=>!s)} style={{ position:"absolute",right:"0.75rem",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"rgba(232,237,244,0.4)",cursor:"pointer",fontSize:"0.7rem",padding:0 }}>{showOld?"HIDE":"SHOW"}</button>
            </div>
          </div>
          <div style={S.settingsField}>
            <label style={S.settingsLabel}>New Password *</label>
            <div style={{ position:"relative" }}>
              <input style={{ ...S.settingsInput, width:"100%", paddingRight:"3.5rem" }}
                type={showNew?"text":"password"} value={newPw} onChange={e=>setNewPw(e.target.value)} placeholder="Minimum 6 characters" required />
              <button type="button" onClick={()=>setShowNew(s=>!s)} style={{ position:"absolute",right:"0.75rem",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"rgba(232,237,244,0.4)",cursor:"pointer",fontSize:"0.7rem",padding:0 }}>{showNew?"HIDE":"SHOW"}</button>
            </div>
          </div>
          <div style={S.settingsField}>
            <label style={S.settingsLabel}>Confirm New Password *</label>
            <input style={S.settingsInput} type="password" value={confPw} onChange={e=>setConfPw(e.target.value)} placeholder="Re-enter new password" required />
          </div>

          {msg.text && (
            <div style={msg.type==="ok" ? S.successMsg : S.loginErr}>{msg.text}</div>
          )}

          <button type="submit" style={{ ...S.settingsBtn, marginTop:"1rem" }}
            onMouseEnter={e=>e.target.style.background="#10375C"}
            onMouseLeave={e=>e.target.style.background="#EB8317"}>
            Update Credentials
          </button>
        </form>
      </div>

      <div style={S.settingsCard}>
        <div style={S.settingsTitle}>Session</div>
        <div style={S.settingsSub}>Sessions last 8 hours. Sign out to end your current session immediately.</div>
        <button onClick={onLogout} style={{ ...S.settingsBtn, background:"rgba(239,68,68,0.15)", color:"#fca5a5", border:"1px solid rgba(239,68,68,0.2)" }}
          onMouseEnter={e=>{ e.target.style.background="rgba(239,68,68,0.25)"; e.target.style.color="#fca5a5"; }}
          onMouseLeave={e=>{ e.target.style.background="rgba(239,68,68,0.15)"; e.target.style.color="#fca5a5"; }}>
          Sign Out
        </button>
      </div>

      <div style={S.settingsCard}>
        <div style={S.settingsTitle}>Firebase Integration</div>
        <div style={S.settingsSub}>This demo uses local mock data. To connect to your live Firebase Firestore:</div>
        <ol style={{ fontSize:"0.82rem", opacity:0.6, lineHeight:1.9, paddingLeft:"1.25rem" }}>
          <li>Add this page to your Vite project as <code style={{ background:"rgba(255,255,255,0.08)", padding:"0.1rem 0.4rem", borderRadius:"4px", fontSize:"0.78rem" }}>src/pages/Admin.jsx</code></li>
          <li>Add route <code style={{ background:"rgba(255,255,255,0.08)", padding:"0.1rem 0.4rem", borderRadius:"4px", fontSize:"0.78rem" }}>/admin</code> in <code style={{ background:"rgba(255,255,255,0.08)", padding:"0.1rem 0.4rem", borderRadius:"4px", fontSize:"0.78rem" }}>App.jsx</code></li>
          <li>Replace <code style={{ background:"rgba(255,255,255,0.08)", padding:"0.1rem 0.4rem", borderRadius:"4px", fontSize:"0.78rem" }}>MOCK_BOOKINGS</code> / <code style={{ background:"rgba(255,255,255,0.08)", padding:"0.1rem 0.4rem", borderRadius:"4px", fontSize:"0.78rem" }}>MOCK_CONTACTS</code> with <code style={{ background:"rgba(255,255,255,0.08)", padding:"0.1rem 0.4rem", borderRadius:"4px", fontSize:"0.78rem" }}>getDocs()</code> calls from <code style={{ background:"rgba(255,255,255,0.08)", padding:"0.1rem 0.4rem", borderRadius:"4px", fontSize:"0.78rem" }}>firebase/services.js</code></li>
          <li>Move credentials to Firebase Auth or your <code style={{ background:"rgba(255,255,255,0.08)", padding:"0.1rem 0.4rem", borderRadius:"4px", fontSize:"0.78rem" }}>admin</code> Firestore document for server-side security</li>
        </ol>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
function Dashboard({ onLogout }) {
  const [tab, setTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [contacts, setContacts] = useState([]);

  const updateStatus = useCallback((id, status) => {
    setBookings(bs => bs.map(b => b.id === id ? { ...b, status } : b));
  }, []);

  useEffect(() => {
  const unsubBookings = subscribeBookings(setBookings);
  const unsubMessages = subscribeMessages(setContacts);

  return () => {
    unsubBookings();
    unsubMessages();
  };
}, []);

  const markRead = useCallback((id) => {
    setContacts(cs => cs.map(c => c.id === id ? { ...c, read:true } : c));
  }, []);

  const unreadCount = contacts.filter(c => !c.read).length;
  const pendingCount = bookings.filter(b => b.status === "pending").length;

  const NAV = [
    { id:"bookings", label:"Bookings", badge: pendingCount },
    { id:"contacts", label:"Messages", badge: unreadCount },
    { id:"settings", label:"Settings",  badge: 0 },
  ];

  const Icons = {
    bookings: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    contacts: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    settings: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  };

  return (
    <div style={S.dash}>
      {/* Sidebar */}
      <aside style={S.sidebar}>
        <div style={S.sidebarLogo}>
          <div style={{ ...S.loginDot, width:"8px", height:"8px" }} />
          <div>
            <div style={S.sidebarLogoText}>Asmira</div>
            <div style={S.sidebarLogoSub}>Admin</div>
          </div>
        </div>

        <nav>
          {NAV.map(n => (
            <button key={n.id} style={S.navItem(tab===n.id)} onClick={() => setTab(n.id)}>
              {Icons[n.id]}
              <span style={{ flex:1, textAlign:"left" }}>{n.label}</span>
              {n.badge > 0 && (
                <span style={{ minWidth:"18px", height:"18px", borderRadius:"50%", background:"#EB8317", color:"#fff", fontSize:"0.65rem", fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 4px" }}>{n.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div style={S.sidebarBottom}>
          <div style={{ padding:"0.75rem 0.85rem", marginBottom:"0.5rem", opacity:0.35, fontSize:"0.72rem", lineHeight:1.5 }}>
            Signed in as<br/><strong style={{ color:"#F3C623", opacity:1 }}>{getCreds().id}</strong>
          </div>
          <button style={S.logoutBtn} onClick={onLogout}
            onMouseEnter={e => { e.currentTarget.style.background="rgba(239,68,68,0.12)"; e.currentTarget.style.color="#fca5a5"; e.currentTarget.style.borderColor="rgba(239,68,68,0.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="rgba(232,237,244,0.4)"; e.currentTarget.style.borderColor="transparent"; }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={S.main}>
        <div style={S.topBar}>
          <div>
            <div style={S.pageTitle}>
              {tab === "bookings" && "Bookings"}
              {tab === "contacts" && "Messages"}
              {tab === "settings" && "Settings"}
            </div>
            <div style={S.pageSub}>
              {tab === "bookings" && `${bookings.length} total · ${pendingCount} pending review`}
              {tab === "contacts" && `${contacts.length} total · ${unreadCount} unread`}
              {tab === "settings" && "Manage credentials & session"}
            </div>
          </div>
          <div style={{ fontSize:"0.75rem", opacity:0.35 }}>
            {new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
          </div>
        </div>

        {tab === "bookings" && <BookingsTab bookings={bookings} onStatusChange={updateStatus} />}
        {tab === "contacts" && <ContactsTab contacts={contacts} onMarkRead={markRead} />}
        {tab === "settings" && <SettingsTab onLogout={onLogout} />}
      </main>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [loggedIn, setLoggedIn] = useState(isSessionValid());

  const handleLogin  = () => setLoggedIn(true);
  const handleLogout = () => { destroySession(); setLoggedIn(false); };

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  return (
    <div style={S.page}>
      {loggedIn
        ? <Dashboard onLogout={handleLogout} />
        : <LoginScreen onLogin={handleLogin} />
      }
    </div>
  );
}