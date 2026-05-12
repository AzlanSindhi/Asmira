import { useState, useEffect, useCallback } from 'react';
import {
  subscribeBookings,
  subscribeMessages,
  subscribeFeedback,
  markMessageRead,
  updateBookingStatus,
  sendConfirmationEmail,
} from '../firebase/services';

// ── Auth helpers ──────────────────────────────────────────────────────────────
const CREDS_KEY   = 'asmira_admin_creds';
const SESSION_KEY = 'asmira_admin_session';
const DEFAULT_CREDS = { id: 'admin', password: 'asmira2024' };

function getCreds() {
  try { const r = localStorage.getItem(CREDS_KEY); return r ? JSON.parse(r) : DEFAULT_CREDS; }
  catch { return DEFAULT_CREDS; }
}
function saveCreds(c) { localStorage.setItem(CREDS_KEY, JSON.stringify(c)); }
function isSessionValid() {
  try { const s = JSON.parse(localStorage.getItem(SESSION_KEY) || '{}'); return s.exp && Date.now() < s.exp; }
  catch { return false; }
}
function createSession() { localStorage.setItem(SESSION_KEY, JSON.stringify({ exp: Date.now() + 8 * 3600 * 1000 })); }
function destroySession() { localStorage.removeItem(SESSION_KEY); }

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  pending:   { bg: 'rgba(243,198,35,0.18)',  text: '#92620a' },
  confirmed: { bg: 'rgba(34,197,94,0.15)',   text: '#166534' },
  completed: { bg: 'rgba(96,165,250,0.15)',  text: '#1e40af' },
  cancelled: { bg: 'rgba(239,68,68,0.13)',   text: '#991b1b' },
};

function fmtDate(val) {
  if (!val) return '—';
  const d = val?.toDate ? val.toDate() : new Date(val);
  if (isNaN(d)) return '—';
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function fmtShort(val) {
  if (!val) return '—';
  const d = val?.toDate ? val.toDate() : new Date(val);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fullName(b) {
  return `${b.firstName || ''} ${b.lastName || ''}`.trim() || b.name || '(No name)';
}

const navy  = '#0d1b2a';
const mid   = '#10375C';
const amber = '#EB8317';
const gold  = '#F3C623';
const cream = '#F4F6FF';

const S = {
  page:     { minHeight: '100vh', background: navy, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: '#e8edf4', fontSize: '14px' },
  lWrap:    { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg,${navy} 0%,${mid} 60%,#1a4971 100%)`, padding: '1.5rem' },
  lCard:    { width: '100%', maxWidth: '380px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '20px', padding: '2.25rem', backdropFilter: 'blur(20px)' },
  lInput:   { padding: '0.65rem 0.9rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.11)', borderRadius: '10px', color: '#e8edf4', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' },
  lBtn:     { padding: '0.75rem', background: amber, color: '#fff', border: 'none', borderRadius: '50px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', width: '100%' },
  lErr:     { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#fca5a5', marginBottom: '1rem' },
  dash:     { display: 'flex', minHeight: '100vh' },
  side:     { width: '210px', flexShrink: 0, background: 'rgba(255,255,255,0.03)', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '1.5rem 0.9rem', display: 'flex', flexDirection: 'column' },
  main:     { flex: 1, overflowY: 'auto', padding: '1.75rem 2rem' },
  card:     { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1.25rem' },
  tWrap:    { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' },
  th:       { padding: '0.65rem 1rem', textAlign: 'left', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.35, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' },
  td:       { padding: '0.85rem 1rem', fontSize: '0.82rem', borderBottom: '1px solid rgba(255,255,255,0.04)', verticalAlign: 'top', lineHeight: 1.5 },
  overlay:  { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  modal:    { background: '#0f2238', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '2rem', maxWidth: '580px', width: '100%', maxHeight: '88vh', overflowY: 'auto' },
  mInput:   { padding: '0.6rem 0.85rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#e8edf4', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' },
  mTA:      { padding: '0.6rem 0.85rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#e8edf4', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', width: '100%', resize: 'vertical', minHeight: '100px', boxSizing: 'border-box', lineHeight: 1.6 },
};

// ── Shared ────────────────────────────────────────────────────────────────────
function Badge({ status }) {
  const c = STATUS_COLORS[status] || { bg: 'rgba(255,255,255,0.08)', text: 'rgba(232,237,244,0.5)' };
  return (
    <span style={{ display:'inline-block', padding:'0.18rem 0.65rem', borderRadius:'50px', fontSize:'0.68rem', fontWeight:700, background:c.bg, color:c.text }}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : '—'}
    </span>
  );
}

function NavBtn({ icon, label, badge, active, onClick }) {
  const [hov,setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:'flex', alignItems:'center', gap:'0.6rem', padding:'0.6rem 0.8rem', borderRadius:'10px', cursor:'pointer', fontSize:'0.82rem', fontWeight:500,
        background: active?'rgba(235,131,23,0.15)':hov?'rgba(255,255,255,0.05)':'transparent',
        color: active?amber:hov?'rgba(232,237,244,0.75)':'rgba(232,237,244,0.45)',
        border: active?'1px solid rgba(235,131,23,0.2)':'1px solid transparent',
        width:'100%', fontFamily:'inherit', marginBottom:'0.2rem', transition:'all 0.15s' }}>
      <span style={{fontSize:'15px'}}>{icon}</span>
      <span style={{flex:1,textAlign:'left'}}>{label}</span>
      {badge>0 && <span style={{minWidth:'18px',height:'18px',borderRadius:'50%',background:amber,color:'#fff',fontSize:'0.62rem',fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',padding:'0 3px'}}>{badge}</span>}
    </button>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={S.card}>
      <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:'2rem',fontWeight:600,color:color||gold,lineHeight:1}}>{value}</div>
      <div style={{fontSize:'0.72rem',opacity:0.45,marginTop:'0.3rem'}}>{label}</div>
    </div>
  );
}

function FieldRow({ label, value }) {
  return (
    <div style={{display:'flex',gap:'0.5rem',marginBottom:'0.55rem',alignItems:'flex-start'}}>
      <span style={{fontSize:'0.68rem',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',opacity:0.38,width:'120px',flexShrink:0,paddingTop:'2px'}}>{label}</span>
      <span style={{fontSize:'0.855rem',color:'rgba(232,237,244,0.85)',lineHeight:1.6,flex:1,wordBreak:'break-word'}}>{value||'—'}</span>
    </div>
  );
}

function SectionBox({ children, mb }) {
  return (
    <div style={{background:'rgba(255,255,255,0.03)',borderRadius:'12px',padding:'1.1rem 1.25rem',marginBottom:mb||'1.25rem',border:'1px solid rgba(255,255,255,0.06)'}}>
      {children}
    </div>
  );
}

function BoxLabel({ children }) {
  return <div style={{fontSize:'0.65rem',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',opacity:0.35,marginBottom:'0.75rem'}}>{children}</div>;
}

// ── BOOKING MODAL ─────────────────────────────────────────────────────────────
function BookingModal({ booking, onClose, onStatusChange }) {
  const [status,      setStatus]      = useState(booking.status || 'pending');
  const [updating,    setUpdating]    = useState(false);
  const [note,        setNote]        = useState('');
  const [emailSending,setEmailSending]= useState(false);
  const [emailResult, setEmailResult] = useState('');

  const handleStatus = async (s) => {
    setUpdating(true);
    setStatus(s);
    await updateBookingStatus(booking.id, s);
    onStatusChange(booking.id, s);
    setUpdating(false);
  };

  const handleSendEmail = async () => {
    setEmailSending(true);
    setEmailResult('');
    const result = await sendConfirmationEmail(booking, note);
    setEmailResult(result.success ? 'ok' : 'err');
    setEmailSending(false);
  };

  const name = fullName(booking);

  return (
    <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={S.modal}>
        <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:'1.5rem',fontWeight:600,color:cream}}>{name}</div>
        <div style={{fontSize:'0.72rem',opacity:0.38,marginBottom:'1.5rem'}}>Booking request · {fmtDate(booking.createdAt)}</div>

        <SectionBox>
          <BoxLabel>Patient Details</BoxLabel>
          <FieldRow label="Full Name"     value={name} />
          <FieldRow label="Email"         value={booking.email} />
          <FieldRow label="Phone"         value={booking.phone} />
          <FieldRow label="Date of Birth" value={booking.dob} />
        </SectionBox>

        <SectionBox>
          <BoxLabel>Appointment Details</BoxLabel>
          <FieldRow label="Service"        value={booking.sessionType} />
          <FieldRow label="Type"           value={booking.appointmentType} />
          <FieldRow label="Preferred Date" value={booking.preferredDate} />
          <FieldRow label="Preferred Time" value={booking.preferredTime} />
          <FieldRow label="Reason"         value={booking.reason} />
          <FieldRow label="Heard From"     value={booking.referral} />
        </SectionBox>

        {/* Status buttons */}
        <div style={{marginBottom:'1.25rem'}}>
          <div style={{fontSize:'0.72rem',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',opacity:0.38,marginBottom:'0.5rem'}}>Update Status</div>
          <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
            {['pending','confirmed','completed','cancelled'].map(s=>{
              const c = STATUS_COLORS[s];
              const isActive = status===s;
              return (
                <button key={s} onClick={()=>handleStatus(s)} disabled={updating}
                  style={{padding:'0.35rem 0.9rem',borderRadius:'50px',fontSize:'0.75rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit',border:'1px solid',
                    background:isActive?c.bg:'rgba(255,255,255,0.05)',
                    color:isActive?c.text:'rgba(232,237,244,0.5)',
                    borderColor:isActive?c.text+'55':'rgba(255,255,255,0.1)',
                    opacity:updating?0.5:1,transition:'all 0.15s'}}>
                  {s.charAt(0).toUpperCase()+s.slice(1)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Email composer */}
        <div style={{background:'rgba(235,131,23,0.06)',borderRadius:'12px',padding:'1.1rem 1.25rem',marginBottom:'1.5rem',border:'1px solid rgba(235,131,23,0.15)'}}>
          <div style={{fontSize:'0.72rem',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:amber,marginBottom:'0.6rem'}}>📧 Send Confirmation Email</div>
          <p style={{fontSize:'0.78rem',opacity:0.6,marginBottom:'0.75rem',lineHeight:1.55}}>
            A professional confirmation will be sent to <strong style={{color:cream}}>{booking.email}</strong>. Add an optional personal note:
          </p>
          <textarea style={S.mTA} rows={3}
            placeholder="e.g. 'Please bring any previous reports.' · 'Your session is confirmed for Tuesday at 3pm.' · 'Use the main entrance.'"
            value={note} onChange={e=>setNote(e.target.value)} />
          {emailResult==='ok' && (
            <div style={{marginTop:'0.6rem',fontSize:'0.78rem',color:'#86efac',background:'rgba(34,197,94,0.1)',padding:'0.5rem 0.75rem',borderRadius:'8px'}}>
              ✅ Confirmation email sent to {booking.email}
            </div>
          )}
          {emailResult==='err' && (
            <div style={{marginTop:'0.6rem',fontSize:'0.78rem',color:'#fca5a5',background:'rgba(239,68,68,0.1)',padding:'0.5rem 0.75rem',borderRadius:'8px'}}>
              ❌ Email failed. Please check your EmailJS config in services.js.
            </div>
          )}
          <button onClick={handleSendEmail} disabled={emailSending}
            style={{marginTop:'0.75rem',padding:'0.55rem 1.5rem',background:amber,color:'#fff',border:'none',borderRadius:'50px',fontSize:'0.8rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit',opacity:emailSending?0.6:1}}>
            {emailSending?'Sending…':'📧 Send Confirmation Email'}
          </button>
        </div>

        {/* Footer actions */}
        <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap'}}>
          <button onClick={onClose} style={{padding:'0.55rem 1.35rem',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.11)',borderRadius:'50px',color:'#e8edf4',fontSize:'0.8rem',cursor:'pointer',fontFamily:'inherit'}}>Close</button>
          <a href={`tel:${booking.phone}`} style={{padding:'0.55rem 1.35rem',background:'rgba(34,197,94,0.12)',border:'1px solid rgba(34,197,94,0.25)',borderRadius:'50px',color:'#86efac',fontSize:'0.8rem',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:'0.3rem'}}>📞 Call</a>
          <a href={`mailto:${booking.email}`} style={{padding:'0.55rem 1.35rem',background:'rgba(235,131,23,0.12)',border:'1px solid rgba(235,131,23,0.25)',borderRadius:'50px',color:amber,fontSize:'0.8rem',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:'0.3rem'}}>✉ Email</a>
        </div>
      </div>
    </div>
  );
}

// ── MESSAGE MODAL ─────────────────────────────────────────────────────────────
function MessageModal({ msg, onClose, onRead }) {
  useEffect(()=>{ if(!msg.read) onRead(msg.id); },[]);
  return (
    <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={S.modal}>
        <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:'1.5rem',fontWeight:600,color:cream}}>{msg.name}</div>
        <div style={{fontSize:'0.72rem',opacity:0.38,marginBottom:'1.5rem'}}>Message · {fmtDate(msg.createdAt)}</div>
        <SectionBox>
          <FieldRow label="From"    value={msg.name} />
          <FieldRow label="Email"   value={msg.email} />
          <FieldRow label="Phone"   value={msg.phone} />
          <FieldRow label="Subject" value={msg.subject} />
        </SectionBox>
        <SectionBox mb="1.5rem">
          <BoxLabel>Message</BoxLabel>
          <p style={{fontSize:'0.875rem',lineHeight:1.75,color:'rgba(232,237,244,0.82)',whiteSpace:'pre-wrap'}}>{msg.message}</p>
        </SectionBox>
        <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap'}}>
          <button onClick={onClose} style={{padding:'0.55rem 1.35rem',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.11)',borderRadius:'50px',color:'#e8edf4',fontSize:'0.8rem',cursor:'pointer',fontFamily:'inherit'}}>Close</button>
          <a href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject||'')}`}
            style={{padding:'0.55rem 1.35rem',background:'rgba(235,131,23,0.12)',border:'1px solid rgba(235,131,23,0.25)',borderRadius:'50px',color:amber,fontSize:'0.8rem',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:'0.3rem'}}>✉ Reply via Email</a>
          {msg.phone && <a href={`tel:${msg.phone}`} style={{padding:'0.55rem 1.35rem',background:'rgba(34,197,94,0.12)',border:'1px solid rgba(34,197,94,0.25)',borderRadius:'50px',color:'#86efac',fontSize:'0.8rem',textDecoration:'none'}}>📞 Call</a>}
        </div>
      </div>
    </div>
  );
}

// ── BOOKINGS TAB ──────────────────────────────────────────────────────────────
function BookingsTab({ bookings, onStatusChange }) {
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('all');
  const [selected, setSelected] = useState(null);
  const [hovered,  setHovered]  = useState(null);

  const counts = {
    all:       bookings.length,
    pending:   bookings.filter(b=>b.status==='pending').length,
    confirmed: bookings.filter(b=>b.status==='confirmed').length,
    completed: bookings.filter(b=>b.status==='completed').length,
    cancelled: bookings.filter(b=>b.status==='cancelled').length,
  };

  const filtered = bookings.filter(b=>{
    const q = search.toLowerCase();
    const n = fullName(b).toLowerCase();
    const matchQ = !q || n.includes(q) || (b.email||'').toLowerCase().includes(q) || (b.sessionType||'').toLowerCase().includes(q) || (b.phone||'').includes(q);
    return matchQ && (filter==='all' || b.status===filter);
  });

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'1.75rem'}}>
        <StatCard label="Total"     value={counts.all}       color={gold} />
        <StatCard label="Pending"   value={counts.pending}   color={amber} />
        <StatCard label="Confirmed" value={counts.confirmed} color="#22c55e" />
        <StatCard label="Completed" value={counts.completed} color="#60a5fa" />
      </div>

      <div style={S.tWrap}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1rem 1.25rem',borderBottom:'1px solid rgba(255,255,255,0.06)',flexWrap:'wrap',gap:'0.75rem'}}>
          <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:'1.2rem',fontWeight:600,color:cream}}>All Bookings</div>
          <div style={{display:'flex',gap:'0.5rem',alignItems:'center',flexWrap:'wrap'}}>
            {['all','pending','confirmed','completed','cancelled'].map(f=>(
              <button key={f} onClick={()=>setFilter(f)}
                style={{padding:'0.25rem 0.75rem',borderRadius:'50px',border:'1px solid',fontSize:'0.68rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit',textTransform:'capitalize',
                  background:filter===f?amber:'rgba(255,255,255,0.05)',borderColor:filter===f?amber:'rgba(255,255,255,0.1)',color:filter===f?'#fff':'rgba(232,237,244,0.45)'}}>
                {f==='all'?`All (${counts.all})`:`${f} (${counts[f]})`}
              </button>
            ))}
            <input style={{...S.lInput,width:'180px',padding:'0.4rem 0.8rem',fontSize:'0.78rem'}}
              placeholder="Search name, email, phone…" value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
        </div>

        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:'680px'}}>
            <thead><tr>{['Patient','Service','Preferred Date','Appointment Type','Booked On','Status'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.length===0
                ? <tr><td colSpan={6} style={{...S.td,textAlign:'center',opacity:0.35,padding:'2.5rem'}}>No bookings found</td></tr>
                : filtered.map(b=>(
                  <tr key={b.id} onClick={()=>setSelected(b)}
                    onMouseEnter={()=>setHovered(b.id)} onMouseLeave={()=>setHovered(null)}
                    style={{cursor:'pointer',background:hovered===b.id?'rgba(255,255,255,0.025)':'transparent',transition:'background 0.12s'}}>
                    <td style={S.td}>
                      <div style={{fontWeight:600,color:cream}}>{fullName(b)}</div>
                      <div style={{fontSize:'0.72rem',opacity:0.4,marginTop:'0.1rem'}}>{b.email}</div>
                      <div style={{fontSize:'0.72rem',opacity:0.4}}>{b.phone}</div>
                    </td>
                    <td style={{...S.td,maxWidth:'160px'}}><div style={{fontSize:'0.8rem',lineHeight:1.4}}>{b.sessionType||'—'}</div></td>
                    <td style={S.td}>
                      <div style={{fontSize:'0.8rem'}}>{b.preferredDate||'—'}</div>
                      <div style={{fontSize:'0.72rem',opacity:0.4}}>{b.preferredTime||''}</div>
                    </td>
                    <td style={S.td}><div style={{fontSize:'0.78rem',opacity:0.65}}>{b.appointmentType||'—'}</div></td>
                    <td style={S.td}><div style={{fontSize:'0.75rem',opacity:0.5,whiteSpace:'nowrap'}}>{fmtShort(b.createdAt)}</div></td>
                    <td style={S.td}><Badge status={b.status} /></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <BookingModal booking={selected} onClose={()=>setSelected(null)}
          onStatusChange={(id,s)=>{ onStatusChange(id,s); setSelected(p=>({...p,status:s})); }} />
      )}
    </div>
  );
}

// ── MESSAGES TAB ──────────────────────────────────────────────────────────────
function MessagesTab({ messages, onRead }) {
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('all');
  const [selected, setSelected] = useState(null);
  const [hovered,  setHovered]  = useState(null);
  const unread = messages.filter(m=>!m.read).length;
  const weekAgo = Date.now() - 7*86400*1000;

  const filtered = messages.filter(m=>{
    const q = search.toLowerCase();
    const matchQ = !q||(m.name||'').toLowerCase().includes(q)||(m.email||'').toLowerCase().includes(q)||(m.subject||'').toLowerCase().includes(q)||(m.message||'').toLowerCase().includes(q);
    return matchQ&&(filter==='all'||(filter==='unread'&&!m.read)||(filter==='read'&&m.read));
  });

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'1.75rem'}}>
        <StatCard label="Total"     value={messages.length}           color={gold} />
        <StatCard label="Unread"    value={unread}                    color={amber} />
        <StatCard label="Read"      value={messages.length-unread}    color="#60a5fa" />
        <StatCard label="This Week" value={messages.filter(m=>{ const d=m.createdAt?.toDate?m.createdAt.toDate():new Date(m.createdAt); return d>weekAgo; }).length} color="#a78bfa" />
      </div>

      <div style={S.tWrap}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1rem 1.25rem',borderBottom:'1px solid rgba(255,255,255,0.06)',flexWrap:'wrap',gap:'0.75rem'}}>
          <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:'1.2rem',fontWeight:600,color:cream}}>All Messages</div>
          <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
            {[['all','All'],['unread','Unread'],['read','Read']].map(([v,l])=>(
              <button key={v} onClick={()=>setFilter(v)}
                style={{padding:'0.25rem 0.75rem',borderRadius:'50px',border:'1px solid',fontSize:'0.68rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit',
                  background:filter===v?amber:'rgba(255,255,255,0.05)',borderColor:filter===v?amber:'rgba(255,255,255,0.1)',color:filter===v?'#fff':'rgba(232,237,244,0.45)'}}>
                {l}
              </button>
            ))}
            <input style={{...S.lInput,width:'175px',padding:'0.4rem 0.8rem',fontSize:'0.78rem'}}
              placeholder="Search messages…" value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
        </div>

        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:'560px'}}>
            <thead><tr>{['Sender','Subject','Preview','Date','Status'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.length===0
                ? <tr><td colSpan={5} style={{...S.td,textAlign:'center',opacity:0.35,padding:'2.5rem'}}>No messages found</td></tr>
                : filtered.map(m=>(
                  <tr key={m.id} onClick={()=>setSelected(m)}
                    onMouseEnter={()=>setHovered(m.id)} onMouseLeave={()=>setHovered(null)}
                    style={{cursor:'pointer',background:hovered===m.id?'rgba(255,255,255,0.025)':!m.read?'rgba(243,198,35,0.03)':'transparent',transition:'background 0.12s'}}>
                    <td style={S.td}>
                      <div style={{display:'flex',alignItems:'center',gap:'0.4rem'}}>
                        {!m.read&&<div style={{width:'6px',height:'6px',borderRadius:'50%',background:amber,flexShrink:0}}/>}
                        <div>
                          <div style={{fontWeight:m.read?400:600,color:cream}}>{m.name}</div>
                          <div style={{fontSize:'0.72rem',opacity:0.38}}>{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={S.td}><div style={{fontSize:'0.8rem',fontWeight:m.read?400:500}}>{m.subject}</div></td>
                    <td style={{...S.td,maxWidth:'200px'}}><div style={{fontSize:'0.75rem',opacity:0.42,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.message}</div></td>
                    <td style={S.td}><div style={{fontSize:'0.72rem',opacity:0.42,whiteSpace:'nowrap'}}>{fmtShort(m.createdAt)}</div></td>
                    <td style={S.td}>
                      <span style={{display:'inline-block',padding:'0.18rem 0.6rem',borderRadius:'50px',fontSize:'0.68rem',fontWeight:600,
                        background:m.read?'rgba(255,255,255,0.06)':'rgba(235,131,23,0.15)',color:m.read?'rgba(232,237,244,0.35)':amber}}>
                        {m.read?'Read':'New'}
                      </span>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {selected&&<MessageModal msg={selected} onClose={()=>setSelected(null)} onRead={id=>{ onRead(id); setSelected(p=>({...p,read:true})); }} />}
    </div>
  );
}

// ── FEEDBACK TAB ──────────────────────────────────────────────────────────────
function FeedbackTab({ feedback }) {
  const [hovered,setHovered] = useState(null);
  const total = feedback.length;
  const avg = total ? (feedback.reduce((s,f)=>s+(Number(f.rating)||0),0)/total).toFixed(1) : '—';
  const fiveStars = feedback.filter(f=>Number(f.rating)===5).length;
  const recommend = feedback.filter(f=>f.wouldReturn==='yes').length;

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'1.75rem'}}>
        <StatCard label="Total Reviews"    value={total}      color={gold} />
        <StatCard label="Avg. Rating"      value={avg}        color={amber} />
        <StatCard label="5-Star Reviews"   value={fiveStars}  color="#22c55e" />
        <StatCard label="Would Recommend"  value={recommend}  color="#60a5fa" />
      </div>

      <div style={S.tWrap}>
        <div style={{padding:'1rem 1.25rem',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:'1.2rem',fontWeight:600,color:cream}}>Patient Feedback</div>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:'580px'}}>
            <thead><tr>{['Patient','Service','Rating','Feedback','Recommend','Date'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {total===0
                ? <tr><td colSpan={6} style={{...S.td,textAlign:'center',opacity:0.35,padding:'2.5rem'}}>No feedback received yet. It will appear here once patients submit feedback from the Contact page.</td></tr>
                : feedback.map(f=>(
                  <tr key={f.id} onMouseEnter={()=>setHovered(f.id)} onMouseLeave={()=>setHovered(null)}
                    style={{background:hovered===f.id?'rgba(255,255,255,0.025)':'transparent',transition:'background 0.12s'}}>
                    <td style={S.td}>
                      <div style={{fontWeight:600,color:cream}}>{f.patientName||'—'}</div>
                      <div style={{fontSize:'0.72rem',opacity:0.38}}>{f.email||''}</div>
                    </td>
                    <td style={S.td}><div style={{fontSize:'0.8rem'}}>{f.sessionType||'—'}</div></td>
                    <td style={S.td}>
                      <div style={{color:gold,fontSize:'1rem',letterSpacing:'0.05em'}}>
                        {'★'.repeat(Number(f.rating)||0)}{'☆'.repeat(Math.max(0,5-(Number(f.rating)||0)))}
                      </div>
                      <div style={{fontSize:'0.7rem',opacity:0.4}}>{f.rating}/5</div>
                    </td>
                    <td style={{...S.td,maxWidth:'220px'}}><div style={{fontSize:'0.78rem',opacity:0.55,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.feedback}</div></td>
                    <td style={S.td}>
                      <span style={{fontSize:'0.75rem',fontWeight:600,
                        color:f.wouldReturn==='yes'?'#22c55e':f.wouldReturn==='maybe'?amber:'#ef4444'}}>
                        {f.wouldReturn==='yes'?'✓ Yes':f.wouldReturn==='maybe'?'~ Maybe':'✗ No'}
                      </span>
                    </td>
                    <td style={S.td}><div style={{fontSize:'0.72rem',opacity:0.42,whiteSpace:'nowrap'}}>{fmtShort(f.createdAt)}</div></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── SETTINGS TAB ──────────────────────────────────────────────────────────────
function SettingsTab({ onLogout }) {
  const [newId, setNewId]   = useState('');
  const [oldPw, setOldPw]   = useState('');
  const [newPw, setNewPw]   = useState('');
  const [confPw,setConfPw]  = useState('');
  const [msg,   setMsg]     = useState({type:'',text:''});
  const [showO, setShowO]   = useState(false);
  const [showN, setShowN]   = useState(false);
  const curId = getCreds().id;

  const save = e => {
    e.preventDefault(); setMsg({type:'',text:''});
    const c = getCreds();
    if(oldPw!==c.password)  { setMsg({type:'err',text:'Current password is incorrect.'}); return; }
    if(newPw.length<6)       { setMsg({type:'err',text:'New password must be at least 6 characters.'}); return; }
    if(newPw!==confPw)       { setMsg({type:'err',text:'Passwords do not match.'}); return; }
    saveCreds({id:newId.trim()||c.id,password:newPw});
    setMsg({type:'ok',text:'Credentials updated. Use your new credentials next time you sign in.'});
    setNewId(''); setOldPw(''); setNewPw(''); setConfPw('');
  };

  const fRow = {display:'flex',flexDirection:'column',gap:'0.35rem',marginBottom:'0.9rem'};
  const lLbl = {fontSize:'0.7rem',fontWeight:600,opacity:0.45,letterSpacing:'0.06em'};

  return (
    <div style={{maxWidth:'480px'}}>
      <div style={{...S.card,marginBottom:'1.25rem'}}>
        <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:'1.2rem',fontWeight:600,color:cream,marginBottom:'0.25rem'}}>Change Admin Credentials</div>
        <div style={{fontSize:'0.78rem',opacity:0.42,marginBottom:'1.25rem'}}>You need your current password to make changes.</div>
        <div style={{padding:'0.65rem 0.9rem',background:'rgba(243,198,35,0.08)',border:'1px solid rgba(243,198,35,0.15)',borderRadius:'10px',fontSize:'0.78rem',marginBottom:'1.25rem'}}>
          Current Admin ID: <strong style={{color:gold}}>{curId}</strong>
        </div>
        <form onSubmit={save}>
          <div style={fRow}>
            <label style={lLbl}>New Admin ID <span style={{opacity:0.5}}>(blank = keep current)</span></label>
            <input style={S.mInput} type="text" value={newId} onChange={e=>setNewId(e.target.value)} placeholder={`Currently: ${curId}`} autoComplete="off" />
          </div>
          <div style={fRow}>
            <label style={lLbl}>Current Password *</label>
            <div style={{position:'relative'}}>
              <input style={{...S.mInput,paddingRight:'3.5rem'}} type={showO?'text':'password'} value={oldPw} onChange={e=>setOldPw(e.target.value)} required />
              <button type="button" onClick={()=>setShowO(s=>!s)} style={{position:'absolute',right:'0.75rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'rgba(232,237,244,0.35)',cursor:'pointer',fontSize:'0.62rem',padding:0,fontFamily:'inherit'}}>{showO?'HIDE':'SHOW'}</button>
            </div>
          </div>
          <div style={fRow}>
            <label style={lLbl}>New Password * <span style={{opacity:0.5}}>(min. 6 characters)</span></label>
            <div style={{position:'relative'}}>
              <input style={{...S.mInput,paddingRight:'3.5rem'}} type={showN?'text':'password'} value={newPw} onChange={e=>setNewPw(e.target.value)} required />
              <button type="button" onClick={()=>setShowN(s=>!s)} style={{position:'absolute',right:'0.75rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'rgba(232,237,244,0.35)',cursor:'pointer',fontSize:'0.62rem',padding:0,fontFamily:'inherit'}}>{showN?'HIDE':'SHOW'}</button>
            </div>
          </div>
          <div style={fRow}>
            <label style={lLbl}>Confirm New Password *</label>
            <input style={S.mInput} type="password" value={confPw} onChange={e=>setConfPw(e.target.value)} required />
          </div>
          {msg.text&&(
            <div style={{padding:'0.7rem 0.9rem',borderRadius:'10px',fontSize:'0.78rem',marginBottom:'0.75rem',
              background:msg.type==='ok'?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)',
              border:`1px solid ${msg.type==='ok'?'rgba(34,197,94,0.2)':'rgba(239,68,68,0.2)'}`,
              color:msg.type==='ok'?'#86efac':'#fca5a5'}}>
              {msg.text}
            </div>
          )}
          <button type="submit" style={{padding:'0.6rem 1.75rem',background:amber,color:'#fff',border:'none',borderRadius:'50px',fontSize:'0.875rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit',marginTop:'0.25rem'}}>
            Update Credentials
          </button>
        </form>
      </div>

      <div style={S.card}>
        <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:'1.2rem',fontWeight:600,color:cream,marginBottom:'0.25rem'}}>Session</div>
        <div style={{fontSize:'0.78rem',opacity:0.42,marginBottom:'1.25rem'}}>Sessions last 8 hours. Sign out to end your current session immediately.</div>
        <button onClick={onLogout} style={{padding:'0.6rem 1.75rem',background:'rgba(239,68,68,0.12)',color:'#fca5a5',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'50px',fontSize:'0.82rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ── DASHBOARD SHELL ───────────────────────────────────────────────────────────
function Dashboard({ onLogout }) {
  const [tab,      setTab]      = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(()=>{
    let loaded = 0;
    const check = () => { loaded++; if(loaded>=3) setLoading(false); };
    const unsubB = subscribeBookings(d=>{ setBookings(d); check(); });
    const unsubM = subscribeMessages(d=>{ setMessages(d); check(); });
    const unsubF = subscribeFeedback(d=>{ setFeedback(d); check(); });
    return ()=>{ unsubB(); unsubM(); unsubF(); };
  },[]);

  const updateStatus = useCallback((id,status)=>{
    setBookings(bs=>bs.map(b=>b.id===id?{...b,status}:b));
  },[]);

  const handleRead = useCallback(async id=>{
    await markMessageRead(id);
    setMessages(ms=>ms.map(m=>m.id===id?{...m,read:true}:m));
  },[]);

  const pending = bookings.filter(b=>b.status==='pending').length;
  const unread  = messages.filter(m=>!m.read).length;

  const NAV = [
    {id:'bookings',icon:'📋',label:'Bookings',badge:pending},
    {id:'messages',icon:'✉', label:'Messages', badge:unread},
    {id:'feedback',icon:'⭐',label:'Feedback',  badge:0},
    {id:'settings',icon:'⚙', label:'Settings',  badge:0},
  ];

  return (
    <div style={S.dash}>
      <aside style={S.side}>
        <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'2rem',paddingLeft:'0.25rem'}}>
          <div style={{width:'8px',height:'8px',borderRadius:'50%',background:amber}}/>
          <div>
            <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:'1.15rem',fontWeight:600,color:cream,lineHeight:1.1}}>Asmira</div>
            <div style={{fontSize:'0.58rem',opacity:0.35,letterSpacing:'0.1em',textTransform:'uppercase'}}>Admin Dashboard</div>
          </div>
        </div>
        <nav style={{flex:1}}>
          {NAV.map(n=><NavBtn key={n.id} icon={n.icon} label={n.label} badge={n.badge} active={tab===n.id} onClick={()=>setTab(n.id)} />)}
        </nav>
        <div>
          <div style={{padding:'0.6rem 0.8rem',marginBottom:'0.5rem',fontSize:'0.72rem',opacity:0.32,lineHeight:1.5}}>
            Signed in as<br/><strong style={{color:gold,opacity:1}}>{getCreds().id}</strong>
          </div>
          <NavBtn icon="🚪" label="Sign Out" badge={0} active={false} onClick={onLogout} />
        </div>
      </aside>

      <main style={S.main}>
        {loading ? (
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',flexDirection:'column',gap:'1rem'}}>
            <div style={{width:'36px',height:'36px',border:'3px solid rgba(235,131,23,0.2)',borderTopColor:amber,borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
            <div style={{fontSize:'0.85rem',opacity:0.4}}>Loading your dashboard…</div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.75rem'}}>
              <div>
                <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:'1.9rem',fontWeight:600,color:cream,lineHeight:1.1}}>
                  {tab==='bookings'?'Bookings':tab==='messages'?'Messages':tab==='feedback'?'Feedback':'Settings'}
                </div>
                <div style={{fontSize:'0.75rem',opacity:0.38,marginTop:'0.2rem'}}>
                  {tab==='bookings'&&`${bookings.length} total · ${pending} awaiting review`}
                  {tab==='messages'&&`${messages.length} total · ${unread} unread`}
                  {tab==='feedback'&&`${feedback.length} patient responses`}
                  {tab==='settings'&&'Manage credentials & session'}
                </div>
              </div>
              <div style={{fontSize:'0.72rem',opacity:0.3}}>
                {new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
              </div>
            </div>
            {tab==='bookings'&&<BookingsTab bookings={bookings} onStatusChange={updateStatus} />}
            {tab==='messages'&&<MessagesTab messages={messages} onRead={handleRead} />}
            {tab==='feedback'&&<FeedbackTab feedback={feedback} />}
            {tab==='settings'&&<SettingsTab onLogout={onLogout} />}
          </>
        )}
      </main>
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [id,setId]     = useState('');
  const [pw,setPw]     = useState('');
  const [err,setErr]   = useState('');
  const [show,setShow] = useState(false);
const submit = e => {
  e.preventDefault();

  const c = getCreds();

  console.log({
    enteredId: id,
    enteredPw: pw,
    stored: c
  });

  if (
    id.trim() === c.id.trim() &&
    pw.trim() === c.password.trim()
  ) {
    createSession();
    onLogin();
  } else {
    setErr('Incorrect Admin ID or password. Please try again.');
  }
};
  return (
    <div style={S.lWrap}>
      <div style={S.lCard}>
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:'0.5rem',fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:'1.5rem',fontWeight:600,color:cream}}>
            <div style={{width:'9px',height:'9px',borderRadius:'50%',background:amber}}/>
            Asmira Wellness
          </div>
          <div style={{fontSize:'0.68rem',opacity:0.38,letterSpacing:'0.12em',textTransform:'uppercase',marginTop:'0.25rem'}}>Admin Portal</div>
        </div>
        <form onSubmit={submit}>
          {err&&<div style={S.lErr}>{err}</div>}
          <div style={{marginBottom:'0.9rem'}}>
            <div style={{fontSize:'0.7rem',fontWeight:600,opacity:0.45,letterSpacing:'0.07em',marginBottom:'0.35rem'}}>ADMIN ID</div>
            <input style={S.lInput} type="text" value={id} onChange={e=>{setId(e.target.value);setErr('');}} autoComplete="username" />
          </div>
          <div style={{marginBottom:'1.25rem'}}>
            <div style={{fontSize:'0.7rem',fontWeight:600,opacity:0.45,letterSpacing:'0.07em',marginBottom:'0.35rem'}}>PASSWORD</div>
            <div style={{position:'relative'}}>
              <input style={{...S.lInput,paddingRight:'3.5rem'}} type={show?'text':'password'} value={pw} onChange={e=>{setPw(e.target.value);setErr('');}} autoComplete="current-password" />
              <button type="button" onClick={()=>setShow(s=>!s)} style={{position:'absolute',right:'0.75rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'rgba(232,237,244,0.35)',cursor:'pointer',fontSize:'0.65rem',fontFamily:'inherit',padding:0}}>
                {show?'HIDE':'SHOW'}
              </button>
            </div>
          </div>
          <button type="submit" style={S.lBtn}>Sign In →</button>
        </form>
        <div style={{textAlign:'center',fontSize:'0.7rem',opacity:0.28,marginTop:'1.25rem'}}>
          Default: ID = admin · Password = asmira2024
        </div>
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [loggedIn, setLoggedIn] = useState(isSessionValid());

  useEffect(()=>{
    const l = document.createElement('link');
    l.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap';
    l.rel  = 'stylesheet';
    document.head.appendChild(l);
  },[]);

  return (
    <div style={S.page}>
      {loggedIn
        ? <Dashboard onLogout={()=>{destroySession();setLoggedIn(false);}} />
        : <LoginScreen onLogin={()=>{createSession();setLoggedIn(true);}} />
      }
    </div>
  );
}