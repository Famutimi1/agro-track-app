import { useState } from "react";
import {
  Leaf, Check, ArrowRight, Star, Menu, X, Moon, Sun,
  Home, CreditCard, FileText, MessageSquare, User,
  Bell, TrendingUp, Shield, Globe, Zap, Lock, Unlock,
  ChevronRight, MapPin, Phone, Camera, Mic, Send,
  Download, Eye, Flag, Search, Filter, BarChart2,
  Wallet, AlertTriangle, CheckCircle, Clock,
  RefreshCw, Layers, Settings, LogOut
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

// ─── SHARED THEME — matches agrotrack-full exactly ───────────────────────────
const theme = {
  light: {
    bg:"#f0fdf4", surface:"#ffffff", border:"#e5e7eb",
    text:"#111827", muted:"#6b7280", inputBg:"#f9fafb",
    navBg:"rgba(255,255,255,0.97)",
    sidebarBg:"#1B5E20", sidebarBorder:"#145214",
  },
  dark: {
    bg:"#111827", surface:"#1f2937", border:"#374151",
    text:"#f9fafb", muted:"#9ca3af", inputBg:"#374151",
    navBg:"rgba(17,24,39,0.97)",
    sidebarBg:"#0f1923", sidebarBorder:"#1f2937",
  },
};

// ─── LANDING DATA ─────────────────────────────────────────────────────────────
const navLinks = ["Features","How It Works","Pricing","Testimonials","Contact"];

const stats = [
  {v:"₦4.2B+", l:"Loans Tracked",     icon:"💰"},
  {v:"23,450",  l:"Farmers Verified",  icon:"👨‍🌾"},
  {v:"12",      l:"States Active",     icon:"🗺️"},
  {v:"87%",     l:"Repayment Rate",    icon:"📈"},
];

const features = [
  {icon:"🗺️", title:"Real-Time Portfolio Map",    desc:"See exactly where every loan is on an interactive map of Nigeria. No more guessing where your money went.", col:"#16a34a", bg:"#dcfce7", dbg:"#0a2010"},
  {icon:"🔐", title:"Layered Disbursement",        desc:"Release funds in tranches tied to verified farm activity. Reduces diversion and misuse of agricultural loans by up to 67%.", col:"#2563eb", bg:"#dbeafe", dbg:"#0d1a30"},
  {icon:"📊", title:"FarmScore Credit Engine",     desc:"The first agricultural credit score built for Nigerian smallholders. Portable, transparent, and accepted by major banks.", col:"#7c3aed", bg:"#ede9fe", dbg:"#1a0d30"},
  {icon:"👨‍🌾", title:"Field Agent Network",          desc:"Deploy verified agents to register farmers in remote areas. GPS-tagged farm boundaries, photo verification, offline sync.", col:"#d97706", bg:"#fef3c7", dbg:"#2d1a00"},
  {icon:"📱", title:"USSD & WhatsApp Access",      desc:"Every farmer — even without a smartphone — can check balance, submit reports, and make repayments via USSD.", col:"#0891b2", bg:"#e0f2fe", dbg:"#0a2030"},
  {icon:"🤖", title:"AI-Powered Risk Analysis",    desc:"Predict defaults before they happen. Satellite crop monitoring, weather risk overlays, and FarmScore analytics in one place.", col:"#be185d", bg:"#fce7f3", dbg:"#2d0a1a"},
];

const steps = [
  {n:"01", who:"Lender",   icon:"🏛️", title:"Create a Program",     desc:"Set up a loan or grant with eligibility criteria, disbursement layers, and documentation requirements in minutes."},
  {n:"02", who:"Farmer",   icon:"👨‍🌾", title:"Register & Apply",     desc:"Farmers register via app, USSD, or field agent. BVN/NIN verified. Farm GPS-mapped. Application in one tap."},
  {n:"03", who:"Agent",    icon:"✅",  title:"Verify on the Ground", desc:"Field agents visit farms, confirm identity, map boundaries, and submit photo reports — even offline."},
  {n:"04", who:"Platform", icon:"💰",  title:"Disburse in Layers",   desc:"Funds release in tranches only when farmers prove previous disbursement was used correctly."},
  {n:"05", who:"Platform", icon:"📈",  title:"Track & Score",        desc:"Repayments, farm reports and performance build each farmer's FarmScore — a portable credit identity."},
];

const testimonials = [
  {name:"Dr. Emeka Okonkwo",  role:"Director, CBN Anchor Borrowers Programme", text:"AgroTrack gave us visibility we never had before. We could see exactly where our disbursements were going — down to the GPS coordinate of each farm.", stars:5},
  {name:"Hajiya Aisha Musa",  role:"Program Officer, NIRSAL",                  text:"The layered disbursement feature alone has reduced fund diversion by over 60% in our pilot. It's now a non-negotiable requirement for all grant programs.", stars:5},
  {name:"Tunde Adeyemi",      role:"Head of Agri-Finance, Union Bank",         text:"FarmScore has transformed how we assess agricultural borrowers. We can now lend confidently to farmers who previously had no credit history at all.", stars:5},
];

const pricing = [
  {plan:"Starter",    price:"₦250K", period:"/mo", desc:"For NGOs and state agencies piloting agricultural lending",   hot:false, features:["500 borrowers","3 programs","Lender dashboard","Email + SMS alerts","FarmScore basic","CSV export"]},
  {plan:"Growth",     price:"₦750K", period:"/mo", desc:"For banks and ministries managing active loan portfolios",     hot:true,  features:["5,000 borrowers","Unlimited programs","Full geospatial map","Field agent management","FarmScore API","WhatsApp integration","Priority support"]},
  {plan:"Enterprise", price:"Custom", period:"",   desc:"For CBN, NIRSAL, and national-scale programs",                hot:false, features:["Unlimited borrowers","White-label option","Custom integrations","Dedicated manager","Satellite monitoring","Full audit trail","On-site training"]},
];

const markets = [
  {flag:"🇳🇬", c:"Nigeria",     s:"Launched", col:"#16a34a"},
  {flag:"🇬🇭", c:"Ghana",       s:"Q1 2026",  col:"#2563eb"},
  {flag:"🇰🇪", c:"Kenya",       s:"Q2 2026",  col:"#7c3aed"},
  {flag:"🇹🇿", c:"Tanzania",    s:"Q3 2026",  col:"#d97706"},
  {flag:"🇮🇳", c:"India",       s:"2027",     col:"#0891b2"},
  {flag:"🌎",  c:"Latin America",s:"2027",    col:"#be185d"},
];

// ─── BORROWER DASHBOARD DATA ──────────────────────────────────────────────────
const loanHistory = [
  {month:"Jan",disbursed:200,repaid:0},  {month:"Feb",disbursed:340,repaid:85},
  {month:"Mar",disbursed:0,  repaid:85}, {month:"Apr",disbursed:310,repaid:85},
  {month:"May",disbursed:0,  repaid:85}, {month:"Jun",disbursed:0,  repaid:85},
];
const scoreHistory = [
  {m:"Jan",s:680},{m:"Feb",s:695},{m:"Mar",s:710},{m:"Apr",s:740},{m:"May",s:775},{m:"Jun",s:815},
];
const cropPie = [
  {name:"Rice",value:60,color:"#16a34a"},{name:"Maize",value:25,color:"#2563eb"},{name:"Other",value:15,color:"#f59e0b"},
];

const borrowerPrograms = [
  {name:"CBN Rice Farmers Support Fund 2025", lender:"Central Bank of Nigeria",    amount:"Up to ₦2M",   rate:"9%",  match:96, col:"#16a34a", bg:"#dcfce7", dbg:"#0a2010"},
  {name:"Kebbi Rice Irrigation Scheme 2025",  lender:"Kebbi State Government",     amount:"Up to ₦750K", rate:"7%",  match:88, col:"#2563eb", bg:"#dbeafe", dbg:"#0d1a30"},
  {name:"NIRSAL Cassava Value Chain Grant",   lender:"NIRSAL",                     amount:"Up to ₦500K", rate:"0%",  match:74, col:"#7c3aed", bg:"#ede9fe", dbg:"#1a0d30"},
  {name:"Ekiti State Youth Agro Fund",        lender:"Ekiti State Ministry of Agric",amount:"Up to ₦300K",rate:"5%", match:65, col:"#d97706", bg:"#fef3c7", dbg:"#2d1a00"},
];

const borrowerActivities = [
  {icon:"💰", text:"Layer 2 disbursement of ₦340,000 processed",   time:"2 days ago",  col:"#16a34a", bg:"#dcfce7", dbg:"#0a2010"},
  {icon:"✅", text:"June farm report submitted — +15 FarmScore pts", time:"4 days ago",  col:"#2563eb", bg:"#dbeafe", dbg:"#0d1a30"},
  {icon:"🔥", text:"5th consecutive on-time repayment!",             time:"Jun 5",       col:"#f59e0b", bg:"#fef3c7", dbg:"#2d1a00"},
  {icon:"⚠️", text:"July repayment of ₦85,000 due in 3 days",      time:"Today",       col:"#dc2626", bg:"#fee2e2", dbg:"#2d0a0a"},
];

// ─── SHARED SMALL COMPONENTS ──────────────────────────────────────────────────
function Toggle({ on, onToggle }) {
  return (
    <div onClick={onToggle} style={{ width:46, height:26, borderRadius:13, background:on?"#1B5E20":"#4b5563", cursor:"pointer", position:"relative", transition:"background 0.25s", flexShrink:0, border:`2px solid ${on?"#16a34a":"#6b7280"}` }}>
      <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff", position:"absolute", top:2, left:on?22:2, transition:"left 0.25s", boxShadow:"0 2px 6px rgba(0,0,0,0.3)" }}/>
    </div>
  );
}

function ScoreRing({ score, size=80 }) {
  const r=(size/2)-8; const circ=2*Math.PI*r; const pct=score/850;
  const col=score>=750?"#16a34a":score>=600?"#2563eb":score>=450?"#f59e0b":"#ef4444";
  const label=score>=750?"Platinum":score>=650?"Gold":score>=500?"Silver":"Bronze";
  return (
    <div style={{ position:"relative", width:size, height:size }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={7}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={7} strokeDasharray={circ} strokeDashoffset={circ*(1-pct)} strokeLinecap="round"/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column" }}>
        <span style={{ fontSize:size>60?18:12, fontWeight:800, color:col, lineHeight:1 }}>{score}</span>
        {size>60 && <span style={{ fontSize:10, color:"rgba(255,255,255,0.6)", marginTop:2 }}>{label}</span>}
      </div>
    </div>
  );
}

function Badge({ text, bg, col }) {
  return <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:5, background:bg, color:col }}>{text}</span>;
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
function LandingPage({ dark, setView, page, setPage, setAuthView }) {
  const T = dark ? theme.dark : theme.light;
  const [email, setEmail]     = useState("");
  const [sent, setSent]       = useState(false);
  const [menuOpen, setMenu]   = useState(false);
  const [faq, setFaq]         = useState(null);

  const sec  = (extra={}) => ({ padding:"96px 24px", ...extra });
  const wrap  = { maxWidth:1200, margin:"0 auto" };
  const pill  = { fontSize:11, fontWeight:700, color:"#16a34a", textTransform:"uppercase", letterSpacing:"0.1em", background: dark?"#0a2010":"#dcfce7", padding:"4px 14px", borderRadius:20, display:"inline-block", marginBottom:14 };
  const h2    = (col="#111827") => ({ fontSize:clamp(32,42), fontWeight:900, color: dark?"#f9fafb":col, margin:"0 0 16px", letterSpacing:"-0.5px", lineHeight:1.15 });
  const body  = { fontSize:16, color: dark?"#9ca3af":"#6b7280", lineHeight:1.75, margin:"0 0 32px" };

  function clamp(min,max){ return `clamp(${min}px, 4vw, ${max}px)`; }

  // If a public sub-page is active, render it
  if (page && page !== "home") {
    return <PublicPage page={page} setPage={setPage} dark={dark} setView={setView} setAuthView={setAuthView} T={T} sec={sec} wrap={wrap} pill={pill} h2={h2} body={body} />;
  }

  return (
    <div style={{ background: dark?"#111827":"#fff", color: T.text, transition:"background 0.3s, color 0.3s" }}>

      {/* ── NAV ── */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, background:T.navBg, backdropFilter:"blur(16px)", borderBottom:`1px solid ${T.border}` }}>
        <div style={{ ...wrap, display:"flex", alignItems:"center", height:68, gap:32, padding:"0 24px" }}>
          <button onClick={()=>setPage("home")} style={{ display:"flex", alignItems:"center", gap:8, background:"none", border:"none", cursor:"pointer", padding:0 }}>
            <div style={{ width:34, height:34, background:"linear-gradient(135deg,#1B5E20,#2E7D32)", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Leaf size={17} color="#F9A825"/>
            </div>
            <span style={{ fontWeight:900, fontSize:19, color:dark?"#f9fafb":"#1B5E20", letterSpacing:"-0.3px" }}>AgroTrack</span>
          </button>
          <div style={{ display:"flex", gap:4, flex:1, marginLeft:8 }}>
            {navLinks.map(l=>(
              <button key={l} onClick={()=>setPage(l.toLowerCase().replace(/\s+/g,"-"))} style={{ fontSize:13, color: page===l.toLowerCase().replace(/\s+/g,"-")?"#1B5E20":T.muted, textDecoration:"none", fontWeight: page===l.toLowerCase().replace(/\s+/g,"-")?700:500, background:"none", border:"none", cursor:"pointer", padding:"6px 12px", borderRadius:8, transition:"color 0.15s" }}>
                {l}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <button onClick={()=>setAuthView("borrower-register")} style={{ padding:"7px 16px", borderRadius:8, border:`1px solid ${T.border}`, background:"none", color:T.text, fontSize:13, fontWeight:600, cursor:"pointer" }}>
              Borrower Portal
            </button>
            <button onClick={()=>setAuthView("login")} style={{ padding:"7px 18px", borderRadius:8, border:"none", background:"#F9A825", color:"#1B5E20", fontSize:13, fontWeight:700, cursor:"pointer" }}>
              Lender Login →
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight:"100vh", display:"flex", alignItems:"center", background: dark?"linear-gradient(160deg,#0a1a0a 0%,#0f1923 40%,#111827 100%)":"linear-gradient(160deg,#042007 0%,#0a3010 50%,#1B5E20 100%)", position:"relative", overflow:"hidden", paddingTop:68 }}>
        {/* Animated orbs */}
        {[{t:"15%",l:"5%",s:400,o:0.06},{t:"60%",l:"60%",s:600,o:0.04},{t:"30%",l:"75%",s:300,o:0.08}].map((o,i)=>(
          <div key={i} style={{ position:"absolute", top:o.t, left:o.l, width:o.s, height:o.s, borderRadius:"50%", background:`radial-gradient(circle, rgba(249,168,37,${o.o}) 0%, transparent 70%)`, pointerEvents:"none" }}/>
        ))}
        {/* Grid overlay */}
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize:"60px 60px", pointerEvents:"none" }}/>

        <div style={{ ...wrap, width:"100%", padding:"80px 24px", position:"relative", display:"grid", gridTemplateColumns:"1fr 480px", gap:60, alignItems:"center" }}>
          <div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:"rgba(249,168,37,0.12)", border:"1px solid rgba(249,168,37,0.25)", borderRadius:20, padding:"5px 14px", marginBottom:28 }}>
              <span style={{ fontSize:14 }}>🇳🇬</span>
              <span style={{ fontSize:12, color:"#F9A825", fontWeight:700 }}>Built for Nigeria · Scaling to the world</span>
            </div>
            <h1 style={{ fontSize:"clamp(40px,5.5vw,72px)", fontWeight:900, color:"#fff", lineHeight:1.08, margin:"0 0 24px", letterSpacing:"-2px" }}>
              Every Loan.<br/>Every Farm.<br/><span style={{ color:"#F9A825" }}>Fully Tracked.</span>
            </h1>
            <p style={{ fontSize:18, color:"rgba(255,255,255,0.65)", lineHeight:1.75, margin:"0 0 36px", maxWidth:500 }}>
              AgroTrack is the agricultural loan and grant management platform that brings full accountability, transparency, and intelligence to every naira of farming finance.
            </p>
            <div style={{ display:"flex", gap:12, marginBottom:32, flexWrap:"wrap" }}>
              <button onClick={()=>setPage("contact")} style={{ padding:"15px 30px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#F9A825,#f59e0b)", color:"#1B5E20", fontSize:15, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", gap:8, boxShadow:"0 8px 30px rgba(249,168,37,0.35)" }}>
                Request a Demo <ArrowRight size={16}/>
              </button>
              <button onClick={()=>setAuthView("borrower-register")} style={{ padding:"15px 30px", borderRadius:12, border:"1px solid rgba(255,255,255,0.2)", background:"rgba(255,255,255,0.07)", color:"#fff", fontSize:15, fontWeight:600, cursor:"pointer" }}>
                Register as Farmer →
              </button>
            </div>
            <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
              {["No setup fees","Free 30-day pilot","Setup in 48 hours"].map(t=>(
                <span key={t} style={{ display:"flex", alignItems:"center", gap:5, fontSize:13, color:"rgba(255,255,255,0.5)" }}>
                  <Check size={13} color="#4ade80"/>{t}
                </span>
              ))}
            </div>
          </div>

          {/* Hero dashboard card */}
          <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:24, padding:20, backdropFilter:"blur(20px)", boxShadow:"0 40px 80px rgba(0,0,0,0.4)" }}>
            <div style={{ background:"#111827", borderRadius:16, padding:20, border:"1px solid rgba(255,255,255,0.06)" }}>
              {/* Mini KPIs */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
                {[["₦4.25B","Disbursed","#16a34a"],["23,450","Borrowers","#2563eb"],["87.3%","Repayment","#F9A825"]].map(([v,l,c])=>(
                  <div key={l} style={{ background:"#1f2937", borderRadius:10, padding:"12px 8px", textAlign:"center", border:"1px solid rgba(255,255,255,0.05)" }}>
                    <p style={{ fontSize:17, fontWeight:800, color:c, margin:"0 0 3px" }}>{v}</p>
                    <p style={{ fontSize:10, color:"#9ca3af", margin:0 }}>{l}</p>
                  </div>
                ))}
              </div>
              {/* Borrower at risk */}
              <div style={{ background:"#1f2937", borderRadius:12, padding:14, marginBottom:12, border:"1px solid rgba(255,255,255,0.05)" }}>
                <p style={{ fontSize:10, color:"#9ca3af", fontWeight:700, margin:"0 0 10px", textTransform:"uppercase", letterSpacing:"0.06em" }}>Borrowers Needing Attention</p>
                {[{n:"Emeka Chukwu",s:"Anambra",d:"47d overdue",sc:420,c:"#ef4444"},{n:"Musa Garba",s:"Kebbi",d:"18d overdue",sc:445,c:"#f59e0b"},{n:"Grace Adeleke",s:"Oyo",d:"22d overdue",sc:510,c:"#f59e0b"}].map((b,i)=>(
                  <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:26, height:26, borderRadius:"50%", background:"#1B5E20", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, color:"#4ade80" }}>{b.n.split(" ").map(x=>x[0]).join("")}</div>
                      <div><p style={{ color:"#f9fafb", fontSize:11, fontWeight:600, margin:0 }}>{b.n}</p><p style={{ color:"#9ca3af", fontSize:9, margin:0 }}>{b.s}</p></div>
                    </div>
                    <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                      <span style={{ fontSize:9, fontWeight:700, background:b.c+"22", color:b.c, padding:"2px 7px", borderRadius:4 }}>{b.d}</span>
                      <span style={{ fontSize:9, fontWeight:700, color:b.c }}>{b.sc}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Layers + score */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 100px", gap:10 }}>
                <div style={{ background:"#1f2937", borderRadius:10, padding:12, border:"1px solid rgba(255,255,255,0.05)" }}>
                  <p style={{ fontSize:9, color:"#9ca3af", fontWeight:700, margin:"0 0 8px", textTransform:"uppercase" }}>Disbursement Layers</p>
                  {[["L1","Released","#16a34a",true],["L2","Released","#16a34a",true],["L3","Locked","#6b7280",false]].map(([l,s,c,rel])=>(
                    <div key={l} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                      <div style={{ width:18, height:18, borderRadius:4, background:c+"22", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {rel?<Check size={9} color={c}/>:<Lock size={8} color={c}/>}
                      </div>
                      <span style={{ fontSize:9, color:c, fontWeight:600, flex:1 }}>{l} · {s}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background:"linear-gradient(135deg,#1B5E20,#2E7D32)", borderRadius:10, padding:12, textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4 }}>
                  <p style={{ color:"rgba(255,255,255,0.6)", fontSize:8, fontWeight:700, margin:0, textTransform:"uppercase" }}>FarmScore</p>
                  <p style={{ color:"#F9A825", fontSize:26, fontWeight:900, margin:0 }}>815</p>
                  <span style={{ background:"#F9A825", color:"#1B5E20", fontSize:8, fontWeight:800, padding:"2px 6px", borderRadius:8 }}>🏆 GOLD</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position:"absolute", bottom:30, left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
          <p style={{ color:"rgba(255,255,255,0.35)", fontSize:11, margin:0 }}>Scroll to explore</p>
          <div style={{ width:1, height:40, background:"linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)" }}/>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ background:"linear-gradient(135deg,#F9A825,#f59e0b)", padding:"32px 24px" }}>
        <div style={{ ...wrap, display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:20, textAlign:"center" }}>
          {stats.map(({v,l,icon})=>(
            <div key={l}>
              <p style={{ fontSize:12, marginBottom:6 }}>{icon}</p>
              <p style={{ fontSize:"clamp(24px,3vw,38px)", fontWeight:900, color:"#1B5E20", margin:"0 0 4px" }}>{v}</p>
              <p style={{ fontSize:13, color:"rgba(27,94,32,0.7)", margin:0, fontWeight:600 }}>{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ ...sec(), background: dark?"#111827":"#fff" }}>
        <div style={wrap}>
          <div style={{ textAlign:"center", marginBottom:64 }}>
            <div style={pill}>Platform Features</div>
            <h2 style={h2()}>Everything you need to<br/><span style={{ color:"#1B5E20" }}>fund farming responsibly</span></h2>
            <p style={{ ...body, maxWidth:520, margin:"0 auto 0" }}>One platform. Complete accountability. From application to final repayment — every step tracked and scored.</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
            {features.map(({icon,title,desc,col,bg,dbg})=>(
              <div key={title} style={{ background: dark?dbg:bg, border:`1px solid ${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"}`, borderRadius:20, padding:28, transition:"transform 0.2s, box-shadow 0.2s" }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow=`0 20px 50px ${col}30`;}}
                onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
                <div style={{ width:52, height:52, borderRadius:14, background: dark?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.8)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, marginBottom:18, boxShadow:`0 4px 16px ${col}30` }}>{icon}</div>
                <h3 style={{ fontSize:17, fontWeight:700, color: dark?"#f9fafb":"#111827", margin:"0 0 10px" }}>{title}</h3>
                <p style={{ fontSize:13, color:T.muted, lineHeight:1.7, margin:0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ ...sec(), background: dark?"#111827":"#f0fdf4" }}>
        <div style={wrap}>
          <div style={{ textAlign:"center", marginBottom:64 }}>
            <div style={pill}>How It Works</div>
            <h2 style={h2()}>From program launch to<br/><span style={{ color:"#1B5E20" }}>final repayment</span></h2>
          </div>
          <div style={{ position:"relative" }}>
            <div style={{ position:"absolute", left:39, top:0, bottom:0, width:2, background:`linear-gradient(to bottom, #1B5E20, #F9A825, #1B5E20)`, opacity:0.3 }}/>
            {steps.map(({n,who,icon,title,desc},i)=>(
              <div key={n} style={{ display:"grid", gridTemplateColumns:"80px 1fr", gap:28, alignItems:"flex-start", marginBottom:i<steps.length-1?32:0, position:"relative" }}>
                <div style={{ textAlign:"center", zIndex:1 }}>
                  <div style={{ width:56, height:56, borderRadius:"50%", background:"linear-gradient(135deg,#1B5E20,#2E7D32)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, margin:"0 auto 6px", boxShadow:"0 8px 24px rgba(27,94,32,0.4)", border:"3px solid #F9A825" }}>{icon}</div>
                  <span style={{ fontSize:10, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:"0.05em" }}>{n}</span>
                </div>
                <div style={{ background: dark?"#1f2937":"#fff", border:`1px solid ${T.border}`, borderRadius:16, padding:"20px 24px", marginTop:6 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                    <h3 style={{ fontSize:17, fontWeight:700, color:T.text, margin:0 }}>{title}</h3>
                    <span style={{ fontSize:10, fontWeight:700, padding:"2px 9px", borderRadius:20, background:dark?"#0a2010":"#dcfce7", color:"#16a34a" }}>{who}</span>
                  </div>
                  <p style={{ fontSize:14, color:T.muted, lineHeight:1.7, margin:0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ ...sec(), background: dark?"#111827":"#fff" }}>
        <div style={wrap}>
          <div style={{ textAlign:"center", marginBottom:60 }}>
            <div style={pill}>Testimonials</div>
            <h2 style={h2()}>Trusted by Nigeria's<br/><span style={{ color:"#1B5E20" }}>top agricultural lenders</span></h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24 }}>
            {testimonials.map(({name,role,text,stars},i)=>(
              <div key={i} style={{ background: dark?"#1f2937":"#f9fafb", border:`1px solid ${T.border}`, borderRadius:20, padding:28, position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"linear-gradient(90deg,#1B5E20,#F9A825)" }}/>
                <div style={{ display:"flex", gap:2, marginBottom:16 }}>
                  {Array(stars).fill(0).map((_,j)=><Star key={j} size={15} fill="#F9A825" color="#F9A825"/>)}
                </div>
                <p style={{ fontSize:14, color:T.muted, lineHeight:1.75, margin:"0 0 20px", fontStyle:"italic" }}>"{text}"</p>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#1B5E20,#2E7D32)", display:"flex", alignItems:"center", justifyContent:"center", color:"#F9A825", fontWeight:700, fontSize:12, flexShrink:0 }}>
                    {name.split(" ").map(x=>x[0]).join("").slice(0,2)}
                  </div>
                  <div>
                    <p style={{ fontSize:13, fontWeight:700, color:T.text, margin:0 }}>{name}</p>
                    <p style={{ fontSize:11, color:T.muted, margin:0 }}>{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ ...sec(), background: dark?"#111827":"#f0fdf4" }}>
        <div style={wrap}>
          <div style={{ textAlign:"center", marginBottom:60 }}>
            <div style={pill}>Pricing</div>
            <h2 style={h2()}>Transparent pricing.<br/><span style={{ color:"#1B5E20" }}>No hidden fees.</span></h2>
            <p style={{ ...body, maxWidth:440, margin:"0 auto 0" }}>Start free for 30 days. No credit card required. Cancel anytime.</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24, alignItems:"center" }}>
            {pricing.map(({plan,price,period,desc,features:feats,hot})=>(
              <div key={plan} style={{ background: hot?"linear-gradient(160deg,#1B5E20,#2E7D32)":(dark?"#1f2937":"#fff"), border: hot?"none":`1px solid ${T.border}`, borderRadius:24, padding:"32px 28px", boxShadow: hot?"0 24px 64px rgba(27,94,32,0.4)":"none", transform: hot?"scale(1.05)":"scale(1)", position:"relative", overflow:"hidden" }}>
                {hot && <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"linear-gradient(90deg,#F9A825,#f59e0b)" }}/>}
                {hot && <div style={{ background:"#F9A825", color:"#1B5E20", fontSize:10, fontWeight:800, padding:"3px 12px", borderRadius:20, display:"inline-block", marginBottom:14, letterSpacing:"0.06em" }}>MOST POPULAR</div>}
                <h3 style={{ fontSize:22, fontWeight:900, color: hot?"#fff":T.text, margin:"0 0 6px" }}>{plan}</h3>
                <p style={{ fontSize:12, color: hot?"rgba(255,255,255,0.6)":T.muted, margin:"0 0 22px", lineHeight:1.5 }}>{desc}</p>
                <div style={{ marginBottom:26 }}>
                  <span style={{ fontSize:40, fontWeight:900, color: hot?"#F9A825":"#1B5E20" }}>{price}</span>
                  <span style={{ fontSize:14, color: hot?"rgba(255,255,255,0.55)":T.muted }}>{period}</span>
                </div>
                <div style={{ marginBottom:28, display:"flex", flexDirection:"column", gap:10 }}>
                  {feats.map(f=>(
                    <div key={f} style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:18, height:18, borderRadius:"50%", background: hot?"rgba(255,255,255,0.2)":"#dcfce7", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <Check size={10} color={hot?"#fff":"#16a34a"}/>
                      </div>
                      <span style={{ fontSize:13, color: hot?"rgba(255,255,255,0.85)":T.muted }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button style={{ width:"100%", padding:"13px", borderRadius:12, border: hot?"none":`2px solid #1B5E20`, background: hot?"#F9A825":"transparent", color: hot?"#1B5E20":"#1B5E20", fontSize:14, fontWeight:800, cursor:"pointer" }}>
                  {plan==="Enterprise"?"Contact Sales":"Get Started Free"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GLOBAL ── */}
      <section style={{ ...sec(), background: dark?"#111827":"#111827" }}>
        <div style={{ ...wrap, display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"center" }}>
          <div>
            <div style={{ ...pill, background:"rgba(249,168,37,0.15)", color:"#F9A825" }}>Global Roadmap</div>
            <h2 style={{ fontSize:"clamp(30px,4vw,44px)", fontWeight:900, color:"#fff", margin:"0 0 16px", lineHeight:1.15 }}>
              Built for Nigeria.<br/><span style={{ color:"#4ade80" }}>Scaling everywhere.</span>
            </h2>
            <p style={{ fontSize:15, color:"rgba(255,255,255,0.55)", lineHeight:1.75, margin:"0 0 32px" }}>The same accountability gap exists in Ghana, Kenya, Tanzania, India, and Latin America. AgroTrack is architected for global scale — only currency and ID verification layer changes per country.</p>
            <button style={{ padding:"13px 28px", borderRadius:12, border:"none", background:"#F9A825", color:"#1B5E20", fontSize:14, fontWeight:800, cursor:"pointer" }}>Learn About Global Expansion →</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
            {markets.map(({flag,c,s,col})=>(
              <div key={c} style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${s==="Launched"?"#16a34a40":"rgba(255,255,255,0.07)"}`, borderRadius:16, padding:"18px 10px", textAlign:"center" }}>
                <p style={{ fontSize:30, margin:"0 0 8px" }}>{flag}</p>
                <p style={{ fontSize:12, fontWeight:700, color:"#fff", margin:"0 0 6px" }}>{c}</p>
                <span style={{ fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:10, background: s==="Launched"?"#dcfce7":"rgba(255,255,255,0.08)", color: s==="Launched"?"#16a34a":"rgba(255,255,255,0.4)" }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ ...sec(), background:"linear-gradient(135deg,#1B5E20,#2E7D32)", textAlign:"center", position:"relative", overflow:"hidden" }}>
        {[{t:"10%",l:"5%",s:300},{t:"60%",l:"80%",s:400}].map((o,i)=>(
          <div key={i} style={{ position:"absolute", top:o.t, left:o.l, width:o.s, height:o.s, borderRadius:"50%", background:"rgba(255,255,255,0.04)", pointerEvents:"none" }}/>
        ))}
        <div style={{ ...wrap, position:"relative" }}>
          <h2 style={{ fontSize:"clamp(32px,5vw,56px)", fontWeight:900, color:"#fff", margin:"0 0 16px", letterSpacing:"-1px" }}>
            Ready to track every naira?
          </h2>
          <p style={{ fontSize:18, color:"rgba(255,255,255,0.7)", margin:"0 auto 40px", maxWidth:520, lineHeight:1.7 }}>
            Join CBN, NIRSAL, and state governments already using AgroTrack to bring real accountability to agricultural finance.
          </p>
          {!sent ? (
            <div style={{ display:"flex", gap:12, maxWidth:500, margin:"0 auto 24px", boxShadow:"0 8px 32px rgba(0,0,0,0.2)", borderRadius:14, overflow:"hidden" }}>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter your work email address" style={{ flex:1, padding:"16px 20px", border:"none", fontSize:14, outline:"none", background:"#fff" }}/>
              <button onClick={()=>email&&setSent(true)} style={{ padding:"16px 24px", border:"none", background:"#F9A825", color:"#1B5E20", fontSize:14, fontWeight:800, cursor:"pointer", whiteSpace:"nowrap" }}>
                Get Demo →
              </button>
            </div>
          ) : (
            <div style={{ display:"inline-flex", alignItems:"center", gap:10, background:"rgba(255,255,255,0.15)", borderRadius:14, padding:"16px 28px", marginBottom:24 }}>
              <Check size={20} color="#4ade80"/>
              <span style={{ color:"#fff", fontSize:15, fontWeight:600 }}>We'll be in touch within 24 hours!</span>
            </div>
          )}
          <div style={{ display:"flex", justifyContent:"center", gap:24, flexWrap:"wrap" }}>
            {["No credit card","Free 30-day pilot","Dedicated onboarding"].map(t=>(
              <span key={t} style={{ display:"flex", alignItems:"center", gap:5, fontSize:13, color:"rgba(255,255,255,0.6)" }}>
                <Check size={12} color="#4ade80"/>{t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:"#0a1208", padding:"60px 24px 32px" }}>
        <div style={{ ...wrap, display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:48, marginBottom:48 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18 }}>
              <div style={{ width:34, height:34, background:"linear-gradient(135deg,#1B5E20,#2E7D32)", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center" }}><Leaf size={17} color="#F9A825"/></div>
              <span style={{ fontWeight:900, fontSize:19, color:"#fff" }}>AgroTrack</span>
            </div>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.35)", lineHeight:1.7, marginBottom:20, maxWidth:260 }}>The agricultural loan and grant management platform built for Nigeria and the world.</p>
            <div style={{ display:"flex", gap:10 }}>
              {["𝕏","in","f","yt"].map(s=>(
                <div key={s} style={{ width:34, height:34, borderRadius:8, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                  <span style={{ fontSize:12, color:"rgba(255,255,255,0.5)" }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
          {[{t:"Product",ls:[["Features","features"],["How It Works","how-it-works"],["Pricing","pricing"],["Testimonials","testimonials"],["Contact","contact"],["API Docs","contact"]]},{t:"Company",ls:[["About Us","contact"],["Careers","contact"],["Press","contact"],["Partners","contact"],["Blog","contact"],["Contact","contact"]]},{t:"Legal",ls:[["Privacy Policy","contact"],["Terms of Service","contact"],["Cookie Policy","contact"],["Compliance","contact"],["Data Security","contact"]]}].map(({t,ls})=>(
            <div key={t}>
              <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.5)", margin:"0 0 16px", textTransform:"uppercase", letterSpacing:"0.08em" }}>{t}</p>
              {ls.map(([l,target])=>(
                <p key={l} onClick={()=>setPage(target)} style={{ fontSize:13, color:"rgba(255,255,255,0.3)", margin:"0 0 10px", cursor:"pointer", transition:"color 0.15s" }}
                  onMouseEnter={e=>e.currentTarget.style.color="rgba(255,255,255,0.7)"}
                  onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.3)"}
                >{l}</p>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:24, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.25)", margin:0 }}>© 2025 AgroTrack Technologies Ltd. RC: 1234567 · All rights reserved.</p>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.25)", margin:0 }}>🇳🇬 Made in Nigeria · Built for the world</p>
        </div>
      </footer>
    </div>
  );
}

// ─── SHARED NAV for public pages ──────────────────────────────────────────────
function PublicNav({ dark, page, setPage, setView, setAuthView, T, wrap }) {
  return (
    <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, background:T.navBg, backdropFilter:"blur(16px)", borderBottom:`1px solid ${T.border}` }}>
      <div style={{ ...wrap, display:"flex", alignItems:"center", height:68, gap:32, padding:"0 24px" }}>
        <button onClick={()=>setPage("home")} style={{ display:"flex", alignItems:"center", gap:8, background:"none", border:"none", cursor:"pointer", padding:0 }}>
          <div style={{ width:34, height:34, background:"linear-gradient(135deg,#1B5E20,#2E7D32)", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Leaf size={17} color="#F9A825"/>
          </div>
          <span style={{ fontWeight:900, fontSize:19, color:dark?"#f9fafb":"#1B5E20", letterSpacing:"-0.3px" }}>AgroTrack</span>
        </button>
        <div style={{ display:"flex", gap:4, flex:1, marginLeft:8 }}>
          {["Features","How It Works","Pricing","Testimonials","Contact"].map(l=>{
            const key = l.toLowerCase().replace(/\s+/g,"-");
            const active = page===key;
            return (
              <button key={l} onClick={()=>setPage(key)} style={{ fontSize:13, color: active?"#1B5E20":T.muted, fontWeight: active?700:500, background: active?(dark?"#0a2010":"#dcfce7"):"none", border:"none", cursor:"pointer", padding:"6px 12px", borderRadius:8, transition:"all 0.15s" }}>
                {l}
              </button>
            );
          })}
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <button onClick={()=>setAuthView&&setAuthView("borrower-register")} style={{ padding:"7px 16px", borderRadius:8, border:`1px solid ${T.border}`, background:"none", color:T.text, fontSize:13, fontWeight:600, cursor:"pointer" }}>
            Borrower Portal
          </button>
          <button onClick={()=>setAuthView&&setAuthView("login")} style={{ padding:"7px 18px", borderRadius:8, border:"none", background:"#F9A825", color:"#1B5E20", fontSize:13, fontWeight:700, cursor:"pointer" }}>
            Lender Login →
          </button>
        </div>
      </div>
    </nav>
  );
}

// ─── PUBLIC PAGES ─────────────────────────────────────────────────────────────
function PublicPage({ page, setPage, dark, setView, setAuthView, T, sec, wrap, pill, h2, body }) {
  const textC   = T.text;
  const mutedC  = T.muted;
  const surface = T.surface;
  const borderC = T.border;
  const inputBg = T.inputBg;
  const bg      = dark?"#111827":"#f0fdf4";

  // ── FEATURES PAGE ──────────────────────────────────────────────────────────
  if (page==="features") return (
    <div style={{ background:dark?"#111827":"#fff", minHeight:"100vh" }}>
      <PublicNav dark={dark} page={page} setPage={setPage} setView={setView} setAuthView={setAuthView} T={T} wrap={wrap}/>
      <div style={{ paddingTop:68 }}>

        {/* Hero */}
        <section style={{ background:"linear-gradient(160deg,#042007,#1B5E20)", padding:"80px 24px 96px", textAlign:"center" }}>
          <div style={{ ...wrap }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:"rgba(249,168,37,0.15)", border:"1px solid rgba(249,168,37,0.25)", borderRadius:20, padding:"5px 14px", marginBottom:24 }}>
              <span style={{ fontSize:12, color:"#F9A825", fontWeight:700 }}>Platform Features</span>
            </div>
            <h1 style={{ fontSize:"clamp(36px,5vw,60px)", fontWeight:900, color:"#fff", lineHeight:1.1, margin:"0 0 20px", letterSpacing:"-1.5px" }}>
              One platform. Every tool you need<br/>to <span style={{ color:"#F9A825" }}>fund farming responsibly.</span>
            </h1>
            <p style={{ fontSize:18, color:"rgba(255,255,255,0.65)", maxWidth:580, margin:"0 auto", lineHeight:1.75 }}>
              From loan creation to final repayment — AgroTrack gives lenders, borrowers and field agents everything they need in one accountable system.
            </p>
          </div>
        </section>

        {/* Core features deep-dive */}
        <section style={{ ...sec(), background:dark?"#111827":"#fff" }}>
          <div style={wrap}>
            {[
              { icon:"🗺️", title:"Real-Time Geospatial Portfolio Map", tag:"Lender Feature", color:"#16a34a", bg:dark?"#0a2010":"#dcfce7",
                points:["See every borrower's farm location on an interactive Nigeria map","Heat maps of loan concentration, repayment rates and default clusters","Flood risk and market proximity overlays from satellite data","GPS farm boundary mapping by field agents with offline sync","Click any dot to see the borrower profile and loan status instantly"],
                stat:"94%", statLabel:"of lenders say the map revealed risks they didn't know existed" },
              { icon:"🔐", title:"Layered Disbursement System", tag:"Accountability Core", color:"#2563eb", bg:dark?"#0d1a30":"#dbeafe",
                points:["Divide every loan into 2–4 tranches tied to verified farm activity","Layer 1: Land preparation funds released at approval","Layer 2: Planting funds released after farm photos submitted","Layer 3: Maintenance funds released after crop growth confirmed","Each layer requires proof documents and optional agent confirmation"],
                stat:"67%", statLabel:"reduction in fund diversion vs lump-sum disbursement" },
              { icon:"📊", title:"FarmScore Agricultural Credit Engine", tag:"Proprietary Technology", color:"#7c3aed", bg:dark?"#1a0d30":"#ede9fe",
                points:["0–850 score built specifically for Nigerian smallholder farmers","Inputs: BVN/NIN verification, farm GPS, repayment history, reporting consistency","Score is portable — exportable as a PDF for bank loan applications","Banks and MFIs can query FarmScore via API (revenue stream for you)","Score updates automatically after every repayment and farm report"],
                stat:"3.2×", statLabel:"more loan applications approved with FarmScore vs no data" },
              { icon:"👨‍🌾", title:"Field Agent Network", tag:"Ground-Level Verification", color:"#d97706", bg:dark?"#2d1a00":"#fef3c7",
                points:["Agents register farmers on their behalf in remote areas","GPS walk-the-perimeter farm boundary mapping via phone","Photo verification with automatic geotag and timestamp","Offline mode — works without internet, syncs when connected","Agents paid per verified farmer and per monitoring visit"],
                stat:"12,000+", statLabel:"farmers registered via field agents across 12 states" },
              { icon:"📱", title:"USSD & WhatsApp Integration", tag:"Last-Mile Access", color:"#0891b2", bg:dark?"#0a2030":"#e0f2fe",
                points:["Any farmer — even with a ₦5,000 feature phone — can use AgroTrack","USSD: check balance, repay, submit basic reports, check FarmScore","WhatsApp bot: register, receive updates, upload farm photos, message lender","SMS repayment reminders sent 3 days and 1 day before due date","Voice note option for low-literacy farmers submitting reports"],
                stat:"31%", statLabel:"of all repayments made via USSD and mobile money" },
              { icon:"🤖", title:"AI-Powered Risk & Analytics", tag:"Intelligence Layer", color:"#be185d", bg:dark?"#2d0a1a":"#fce7f3",
                points:["Default prediction engine based on FarmScore trajectory and behaviour patterns","Satellite NDVI crop monitoring — see if crops are actually growing","Weather risk overlays for flood zones and drought-prone areas","Cohort analysis to compare which loan programs perform best","Exportable compliance reports for CBN, NIRSAL, and donor audits"],
                stat:"78%", statLabel:"accuracy in predicting defaults 60 days in advance" },
            ].map(({icon,title,tag,color,bg,points,stat,statLabel},i)=>(
              <div key={i} style={{ display:"grid", gridTemplateColumns: i%2===0?"1fr 420px":"420px 1fr", gap:60, alignItems:"center", marginBottom:96, paddingBottom:96, borderBottom:i<5?`1px solid ${borderC}`:"none" }}>
                <div style={{ order: i%2===0?0:1 }}>
                  <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:dark?bg+"80":bg, border:`1px solid ${color}30`, borderRadius:20, padding:"4px 12px", marginBottom:16 }}>
                    <span style={{ fontSize:16 }}>{icon}</span>
                    <span style={{ fontSize:11, fontWeight:700, color, textTransform:"uppercase", letterSpacing:"0.06em" }}>{tag}</span>
                  </div>
                  <h2 style={{ fontSize:"clamp(24px,3vw,36px)", fontWeight:800, color:textC, margin:"0 0 20px", lineHeight:1.2 }}>{title}</h2>
                  <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:28 }}>
                    {points.map((p,pi)=>(
                      <div key={pi} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                        <div style={{ width:20, height:20, borderRadius:"50%", background:dark?bg:bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                          <Check size={11} color={color}/>
                        </div>
                        <span style={{ fontSize:14, color:mutedC, lineHeight:1.6 }}>{p}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>setPage("contact")} style={{ padding:"11px 24px", borderRadius:10, border:"none", background:color, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                    Learn More →
                  </button>
                </div>
                <div style={{ order: i%2===0?1:0, background:dark?bg+"60":bg, border:`1px solid ${color}25`, borderRadius:24, padding:36, textAlign:"center" }}>
                  <p style={{ fontSize:72, margin:"0 0 16px" }}>{icon}</p>
                  <p style={{ fontSize:"clamp(40px,6vw,72px)", fontWeight:900, color, margin:"0 0 8px", lineHeight:1 }}>{stat}</p>
                  <p style={{ fontSize:14, color:mutedC, margin:0, lineHeight:1.6, maxWidth:260, marginLeft:"auto", marginRight:"auto" }}>{statLabel}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section style={{ background:"linear-gradient(135deg,#1B5E20,#2E7D32)", padding:"72px 24px", textAlign:"center" }}>
          <div style={wrap}>
            <h2 style={{ fontSize:36, fontWeight:900, color:"#fff", margin:"0 0 16px" }}>See all features in action</h2>
            <p style={{ fontSize:16, color:"rgba(255,255,255,0.7)", margin:"0 0 28px" }}>Book a free 30-minute demo with our team.</p>
            <button onClick={()=>setAuthView("lender-signup")} style={{ padding:"14px 32px", borderRadius:12, border:"none", background:"#F9A825", color:"#1B5E20", fontSize:15, fontWeight:800, cursor:"pointer" }}>Book a Free Demo →</button>
          </div>
        </section>
      </div>
    </div>
  );

  // ── HOW IT WORKS PAGE ──────────────────────────────────────────────────────
  if (page==="how-it-works") return (
    <div style={{ background:dark?"#111827":"#fff", minHeight:"100vh" }}>
      <PublicNav dark={dark} page={page} setPage={setPage} setView={setView} setAuthView={setAuthView} T={T} wrap={wrap}/>
      <div style={{ paddingTop:68 }}>

        {/* Hero */}
        <section style={{ background:"linear-gradient(160deg,#042007,#1B5E20)", padding:"80px 24px 96px", textAlign:"center" }}>
          <div style={wrap}>
            <h1 style={{ fontSize:"clamp(36px,5vw,60px)", fontWeight:900, color:"#fff", lineHeight:1.1, margin:"0 0 20px", letterSpacing:"-1.5px" }}>
              From program launch<br/>to <span style={{ color:"#F9A825" }}>final repayment.</span>
            </h1>
            <p style={{ fontSize:18, color:"rgba(255,255,255,0.65)", maxWidth:520, margin:"0 auto", lineHeight:1.75 }}>
              AgroTrack connects lenders, farmers, and field agents in one transparent workflow — with accountability at every step.
            </p>
          </div>
        </section>

        {/* Who is involved */}
        <section style={{ ...sec(), background:dark?"#111827":"#fff" }}>
          <div style={wrap}>
            <div style={{ textAlign:"center", marginBottom:60 }}>
              <div style={{ ...pill }}>The Three Actors</div>
              <h2 style={h2()}>Who uses AgroTrack?</h2>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20, marginBottom:80 }}>
              {[
                {icon:"🏛️",label:"Lenders",who:"Government agencies, banks, NGOs and agribusinesses",color:"#1B5E20",bg:dark?"#0a2010":"#dcfce7",actions:["Create loan programs","Review and approve applications","Monitor portfolio in real-time","Disburse funds in layers","Generate compliance reports"]},
                {icon:"👨‍🌾",label:"Borrowers",who:"Individual smallholder farmers and cooperatives",color:"#2563eb",bg:dark?"#0d1a30":"#dbeafe",actions:["Register with BVN/NIN","Discover eligible programs","Apply in minutes","Submit farm reports","Track FarmScore and repay"]},
                {icon:"🤝",label:"Field Agents",who:"Extension workers and community officers on the ground",color:"#7c3aed",bg:dark?"#1a0d30":"#ede9fe",actions:["Register farmers on their behalf","GPS-map farm boundaries","Conduct verification visits","Submit photo reports offline","Earn per farmer verified"]},
              ].map(({icon,label,who,color,bg:cbg,actions})=>(
                <div key={label} style={{ background:dark?cbg+"50":cbg, border:`1px solid ${color}25`, borderRadius:20, padding:28 }}>
                  <p style={{ fontSize:48, margin:"0 0 16px" }}>{icon}</p>
                  <h3 style={{ fontSize:20, fontWeight:800, color:textC, margin:"0 0 6px" }}>{label}</h3>
                  <p style={{ fontSize:13, color:mutedC, margin:"0 0 20px", lineHeight:1.6 }}>{who}</p>
                  {actions.map((a,i)=>(
                    <div key={i} style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8 }}>
                      <div style={{ width:6, height:6, borderRadius:"50%", background:color, flexShrink:0 }}/>
                      <span style={{ fontSize:13, color:mutedC }}>{a}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Step-by-step */}
            <div style={{ textAlign:"center", marginBottom:60 }}>
              <div style={{ ...pill }}>Step by Step</div>
              <h2 style={h2()}>The full loan lifecycle</h2>
              <p style={{ ...body, maxWidth:500, margin:"0 auto 0" }}>Every loan on AgroTrack follows a structured, verified, and transparent journey from creation to final repayment.</p>
            </div>

            <div style={{ position:"relative" }}>
              {/* Timeline line */}
              <div style={{ position:"absolute", left:"50%", top:0, bottom:0, width:2, background:`linear-gradient(to bottom, #1B5E20, #F9A825, #1B5E20)`, opacity:0.25, transform:"translateX(-50%)" }}/>

              {[
                {n:"01",icon:"🏛️",who:"Lender",title:"Create a Loan Program",desc:"The lender logs into the dashboard, sets the total fund pool, eligibility criteria (crop type, location, gender, cooperative membership), loan amount range, interest rate, repayment period, and disbursement layer structure. The program is published and immediately visible to eligible farmers.",side:"left"},
                {n:"02",icon:"📱",who:"Borrower",title:"Farmer Discovers & Applies",desc:"Farmers discover matching programs on the mobile app, via USSD, or through a field agent. The eligibility checker shows their match percentage. Applications take under 5 minutes — BVN/NIN auto-verified, farm GPS captured, photos uploaded.",side:"right"},
                {n:"03",icon:"✅",who:"Field Agent",title:"On-Ground Verification",desc:"A field agent visits the farm, confirms the farmer's identity, GPS-maps the farm boundaries by walking the perimeter, and takes geotagged photos. Verification reports are submitted even offline and sync when internet is available.",side:"left"},
                {n:"04",icon:"🔍",who:"Lender",title:"Application Review & Approval",desc:"The lender sees the full KYC profile, farm photos, GPS location, and agent verification report. FarmScore is calculated automatically. Low-risk borrowers can be auto-approved. Approval triggers the first disbursement layer immediately.",side:"right"},
                {n:"05",icon:"💰",who:"Platform",title:"Layer 1 Disbursed",desc:"The first tranche (e.g. 30% of loan) is released directly to the farmer's bank account or mobile money. This covers land preparation costs. The farmer receives an SMS and WhatsApp confirmation immediately.",side:"left"},
                {n:"06",icon:"📸",who:"Borrower",title:"Farmer Submits Activity Report",desc:"After using Layer 1 funds, the farmer submits a farm activity report with timestamped, geotagged photos of their farm. They select their crop growth stage, report any challenges, and optionally leave a voice note. This triggers Layer 2 review.",side:"right"},
                {n:"07",icon:"💰",who:"Platform",title:"Layers 2 & 3 Released on Verified Activity",desc:"Each subsequent layer is released only after the previous one is verified. This creates a verified trail of fund usage. Diversion becomes nearly impossible — funds only flow when farm activity is proven.",side:"left"},
                {n:"08",icon:"🔥",who:"Borrower",title:"Repayment & Score Building",desc:"Farmers repay via bank transfer, USSD, mobile money, or in-kind produce. Every on-time repayment builds their FarmScore and repayment streak. After full repayment, their portable credit history is locked in — usable for future loans from any lender.",side:"right"},
              ].map(({n,icon,who,title,desc,side},i)=>(
                <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 64px 1fr", gap:0, marginBottom:40, alignItems:"center" }}>
                  {side==="left" ? (
                    <>
                      <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:16, padding:24, marginRight:24 }}>
                        <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:12 }}>
                          <span style={{ fontSize:24 }}>{icon}</span>
                          <span style={{ fontSize:10, fontWeight:700, background:dark?"#0a2010":"#dcfce7", color:"#16a34a", padding:"2px 9px", borderRadius:20 }}>{who}</span>
                        </div>
                        <h3 style={{ fontSize:17, fontWeight:700, color:textC, margin:"0 0 8px" }}>{title}</h3>
                        <p style={{ fontSize:13, color:mutedC, lineHeight:1.7, margin:0 }}>{desc}</p>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:0, zIndex:1 }}>
                        <div style={{ width:48, height:48, borderRadius:"50%", background:"linear-gradient(135deg,#1B5E20,#2E7D32)", display:"flex", alignItems:"center", justifyContent:"center", color:"#F9A825", fontWeight:800, fontSize:13, border:"3px solid #F9A825", boxShadow:"0 0 0 4px "+(dark?"#111827":"#fff") }}>{n}</div>
                      </div>
                      <div/>
                    </>
                  ) : (
                    <>
                      <div/>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", zIndex:1 }}>
                        <div style={{ width:48, height:48, borderRadius:"50%", background:"linear-gradient(135deg,#1B5E20,#2E7D32)", display:"flex", alignItems:"center", justifyContent:"center", color:"#F9A825", fontWeight:800, fontSize:13, border:"3px solid #F9A825", boxShadow:"0 0 0 4px "+(dark?"#111827":"#fff") }}>{n}</div>
                      </div>
                      <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:16, padding:24, marginLeft:24 }}>
                        <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:12 }}>
                          <span style={{ fontSize:24 }}>{icon}</span>
                          <span style={{ fontSize:10, fontWeight:700, background:dark?"#0a2010":"#dcfce7", color:"#16a34a", padding:"2px 9px", borderRadius:20 }}>{who}</span>
                        </div>
                        <h3 style={{ fontSize:17, fontWeight:700, color:textC, margin:"0 0 8px" }}>{title}</h3>
                        <p style={{ fontSize:13, color:mutedC, lineHeight:1.7, margin:0 }}>{desc}</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ background:"linear-gradient(135deg,#1B5E20,#2E7D32)", padding:"72px 24px", textAlign:"center" }}>
          <div style={wrap}>
            <h2 style={{ fontSize:36, fontWeight:900, color:"#fff", margin:"0 0 16px" }}>Ready to see it live?</h2>
            <p style={{ fontSize:16, color:"rgba(255,255,255,0.7)", margin:"0 0 28px" }}>Watch a full walkthrough of the AgroTrack lifecycle with real Nigerian loan data.</p>
            <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
              <button onClick={()=>setAuthView("lender-signup")} style={{ padding:"14px 32px", borderRadius:12, border:"none", background:"#F9A825", color:"#1B5E20", fontSize:15, fontWeight:800, cursor:"pointer" }}>Book a Demo →</button>
              <button onClick={()=>setView("borrower")} style={{ padding:"14px 32px", borderRadius:12, border:"1px solid rgba(255,255,255,0.3)", background:"rgba(255,255,255,0.08)", color:"#fff", fontSize:15, fontWeight:600, cursor:"pointer" }}>Try Borrower Portal</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  // ── PRICING PAGE ───────────────────────────────────────────────────────────
  if (page==="pricing") {
    const [annual, setAnnual] = useState(false);
    const plans = [
      { name:"Starter", monthly:250, desc:"For NGOs and state agencies piloting agricultural lending", color:"#6b7280", features:[{f:"Up to 500 borrowers",ok:true},{f:"3 active programs",ok:true},{f:"Lender dashboard",ok:true},{f:"Email + SMS alerts",ok:true},{f:"FarmScore basic view",ok:true},{f:"CSV export",ok:true},{f:"Geospatial map view",ok:false},{f:"Field agent app",ok:false},{f:"FarmScore API access",ok:false},{f:"WhatsApp integration",ok:false},{f:"White-label option",ok:false}] },
      { name:"Growth",  monthly:750, desc:"For banks and ministries managing active portfolios", color:"#1B5E20", hot:true, features:[{f:"Up to 5,000 borrowers",ok:true},{f:"Unlimited programs",ok:true},{f:"Full lender dashboard",ok:true},{f:"Email, SMS & WhatsApp alerts",ok:true},{f:"FarmScore full access",ok:true},{f:"CSV + PDF export",ok:true},{f:"Geospatial map view",ok:true},{f:"Field agent app",ok:true},{f:"FarmScore API access",ok:true},{f:"WhatsApp integration",ok:true},{f:"White-label option",ok:false}] },
      { name:"Enterprise", monthly:null, desc:"For CBN, NIRSAL and national-scale programs", color:"#7c3aed", features:[{f:"Unlimited borrowers",ok:true},{f:"Unlimited programs",ok:true},{f:"Full lender dashboard",ok:true},{f:"All alert channels",ok:true},{f:"FarmScore full access",ok:true},{f:"All export formats",ok:true},{f:"Geospatial map view",ok:true},{f:"Field agent app",ok:true},{f:"FarmScore API access",ok:true},{f:"WhatsApp integration",ok:true},{f:"White-label option",ok:true}] },
    ];
    const faq = [
      {q:"Can I switch plans mid-month?",a:"Yes — you can upgrade at any time and we'll prorate the difference. Downgrading takes effect at the next billing cycle."},
      {q:"Is there a free trial?",a:"All plans include a free 30-day pilot with full feature access. No credit card required to start."},
      {q:"How is the transaction fee calculated?",a:"We charge 0.5–1.5% on every loan disbursed through the platform. This scales with volume — larger programs get better rates."},
      {q:"Can state governments get their own branded version?",a:"Yes — our white-label Enterprise plan lets state ministries deploy AgroTrack under their own brand with custom colors and domain."},
      {q:"What currencies do you support?",a:"Currently Nigerian Naira (₦) natively. Ghana Cedi, Kenyan Shilling, and USD support are launching in 2026 for our global expansion."},
      {q:"How do I pay?",a:"We accept bank transfers, Paystack, Flutterwave, and invoice billing for government agencies. Monthly or annual options available."},
    ];
    const [openFaq, setOpenFaq] = useState(null);
    return (
      <div style={{ background:dark?"#111827":"#fff", minHeight:"100vh" }}>
        <PublicNav dark={dark} page={page} setPage={setPage} setView={setView} setAuthView={setAuthView} T={T} wrap={wrap}/>
        <div style={{ paddingTop:68 }}>
          {/* Hero */}
          <section style={{ background:"linear-gradient(160deg,#042007,#1B5E20)", padding:"80px 24px 96px", textAlign:"center" }}>
            <div style={wrap}>
              <h1 style={{ fontSize:"clamp(36px,5vw,60px)", fontWeight:900, color:"#fff", lineHeight:1.1, margin:"0 0 20px", letterSpacing:"-1.5px" }}>
                Transparent pricing.<br/><span style={{ color:"#F9A825" }}>No hidden fees.</span>
              </h1>
              <p style={{ fontSize:18, color:"rgba(255,255,255,0.65)", maxWidth:500, margin:"0 auto 32px", lineHeight:1.75 }}>Start with a free 30-day pilot. No credit card. No commitment.</p>
              {/* Toggle */}
              <div style={{ display:"inline-flex", alignItems:"center", gap:12, background:"rgba(255,255,255,0.1)", borderRadius:50, padding:"5px 5px 5px 16px" }}>
                <span style={{ fontSize:13, color:"rgba(255,255,255,0.8)", fontWeight:600 }}>Monthly</span>
                <div onClick={()=>setAnnual(!annual)} style={{ width:48, height:26, borderRadius:13, background:annual?"#F9A825":"rgba(255,255,255,0.3)", cursor:"pointer", position:"relative", transition:"background 0.25s" }}>
                  <div style={{ width:20, height:20, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:annual?24:3, transition:"left 0.25s" }}/>
                </div>
                <span style={{ fontSize:13, color:"rgba(255,255,255,0.8)", fontWeight:600 }}>Annual</span>
                <span style={{ background:"#F9A825", color:"#1B5E20", fontSize:11, fontWeight:800, padding:"3px 10px", borderRadius:20 }}>Save 20%</span>
              </div>
            </div>
          </section>

          {/* Plans */}
          <section style={{ padding:"0 24px", marginTop:-48 }}>
            <div style={{ ...wrap, display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20, alignItems:"stretch" }}>
              {plans.map(({name,monthly,desc,color,hot,features:feats})=>(
                <div key={name} style={{ background:hot?"linear-gradient(160deg,#1B5E20,#2E7D32)":surface, border:hot?"none":`1px solid ${borderC}`, borderRadius:24, padding:"32px 28px", boxShadow:hot?"0 24px 64px rgba(27,94,32,0.4)":dark?"none":"0 4px 20px rgba(0,0,0,0.06)", position:"relative", overflow:"hidden" }}>
                  {hot && <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"linear-gradient(90deg,#F9A825,#f59e0b)" }}/>}
                  {hot && <div style={{ background:"#F9A825", color:"#1B5E20", fontSize:10, fontWeight:800, padding:"3px 12px", borderRadius:20, display:"inline-block", marginBottom:14, letterSpacing:"0.05em" }}>MOST POPULAR</div>}
                  <h3 style={{ fontSize:22, fontWeight:900, color:hot?"#fff":textC, margin:"0 0 6px" }}>{name}</h3>
                  <p style={{ fontSize:12, color:hot?"rgba(255,255,255,0.6)":mutedC, margin:"0 0 22px", lineHeight:1.5 }}>{desc}</p>
                  <div style={{ marginBottom:28 }}>
                    {monthly ? (
                      <>
                        <span style={{ fontSize:40, fontWeight:900, color:hot?"#F9A825":color }}>₦{annual?Math.round(monthly*0.8).toLocaleString():monthly.toLocaleString()}K</span>
                        <span style={{ fontSize:14, color:hot?"rgba(255,255,255,0.55)":mutedC }}>/mo</span>
                        {annual && <span style={{ fontSize:11, color:hot?"#F9A825":color, display:"block", marginTop:4 }}>Save ₦{Math.round(monthly*0.2).toLocaleString()}K/month billed annually</span>}
                      </>
                    ) : <span style={{ fontSize:32, fontWeight:900, color:hot?"#F9A825":color }}>Custom</span>}
                  </div>
                  <div style={{ marginBottom:28 }}>
                    {feats.map(({f,ok})=>(
                      <div key={f} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                        <div style={{ width:18, height:18, borderRadius:"50%", background: ok?(hot?"rgba(255,255,255,0.2)":"#dcfce7"):(dark?"#374151":"#f3f4f6"), display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          {ok ? <Check size={10} color={hot?"#fff":"#16a34a"}/> : <span style={{ fontSize:10, color:mutedC }}>—</span>}
                        </div>
                        <span style={{ fontSize:13, color: ok?(hot?"rgba(255,255,255,0.9)":textC):mutedC }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>setAuthView("lender-signup")} style={{ width:"100%", padding:"13px", borderRadius:12, border:hot?"none":`2px solid ${color}`, background:hot?"#F9A825":"transparent", color:hot?"#1B5E20":color, fontSize:14, fontWeight:800, cursor:"pointer" }}>
                    {monthly?"Start Free Trial":"Contact Sales"}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Transaction fee note */}
          <section style={{ ...sec(), background:dark?"#111827":"#fff" }}>
            <div style={{ ...wrap, display:"grid", gridTemplateColumns:"1fr 1fr", gap:48 }}>
              <div>
                <div style={{ ...pill }}>Additional Revenue Stream</div>
                <h2 style={h2()}>Transaction-based fees</h2>
                <p style={{ fontSize:15, color:mutedC, lineHeight:1.75, marginBottom:24 }}>In addition to the monthly subscription, AgroTrack charges a small transaction fee on each loan disbursed through the platform — covering payment processing, verification, and infrastructure costs.</p>
                {[{tier:"Up to ₦50M/month disbursed",fee:"1.5% per disbursement"},{tier:"₦50M–₦500M/month",fee:"1.0% per disbursement"},{tier:"₦500M+/month",fee:"0.5% per disbursement"}].map(({tier,fee})=>(
                  <div key={tier} style={{ display:"flex", justifyContent:"space-between", padding:"12px 16px", background:dark?"#1f2937":"#f9fafb", border:`1px solid ${borderC}`, borderRadius:10, marginBottom:8 }}>
                    <span style={{ fontSize:13, color:mutedC }}>{tier}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:textC }}>{fee}</span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ ...pill }}>Earn With AgroTrack</div>
                <h2 style={h2()}>FarmScore API revenue</h2>
                <p style={{ fontSize:15, color:mutedC, lineHeight:1.75, marginBottom:24 }}>Banks, MFIs and other lenders can query FarmScore data for borrowers registered on AgroTrack. You earn a share of every API call sold to third parties.</p>
                {[{who:"Commercial banks",fee:"₦1,500 per query"},{who:"Microfinance banks",fee:"₦800 per query"},{who:"Agri-fintechs",fee:"₦500 per query"}].map(({who,fee})=>(
                  <div key={who} style={{ display:"flex", justifyContent:"space-between", padding:"12px 16px", background:dark?"#1f2937":"#f9fafb", border:`1px solid ${borderC}`, borderRadius:10, marginBottom:8 }}>
                    <span style={{ fontSize:13, color:mutedC }}>{who}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:"#1B5E20" }}>{fee}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div style={{ maxWidth:760, margin:"64px auto 0" }}>
              <h3 style={{ fontSize:24, fontWeight:800, color:textC, textAlign:"center", marginBottom:32 }}>Frequently Asked Questions</h3>
              {faq.map(({q,a},i)=>(
                <div key={i} style={{ border:`1px solid ${borderC}`, borderRadius:14, marginBottom:8, overflow:"hidden" }}>
                  <button onClick={()=>setOpenFaq(openFaq===i?null:i)} style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px", background: openFaq===i?(dark?"#1f2937":"#f9fafb"):surface, border:"none", cursor:"pointer", textAlign:"left" }}>
                    <span style={{ fontSize:14, fontWeight:600, color:textC }}>{q}</span>
                    <span style={{ fontSize:18, color:mutedC, transform:openFaq===i?"rotate(45deg)":"none", transition:"transform 0.2s", flexShrink:0 }}>+</span>
                  </button>
                  {openFaq===i && <div style={{ padding:"0 20px 16px", background:dark?"#1f2937":"#f9fafb" }}><p style={{ fontSize:14, color:mutedC, lineHeight:1.7, margin:0 }}>{a}</p></div>}
                </div>
              ))}
            </div>
          </section>

          <section style={{ background:"linear-gradient(135deg,#1B5E20,#2E7D32)", padding:"72px 24px", textAlign:"center" }}>
            <div style={wrap}>
              <h2 style={{ fontSize:36, fontWeight:900, color:"#fff", margin:"0 0 16px" }}>Start your free 30-day pilot</h2>
              <p style={{ fontSize:16, color:"rgba(255,255,255,0.7)", margin:"0 0 28px" }}>No credit card. No setup fee. Full platform access.</p>
              <button onClick={()=>setAuthView("lender-signup")} style={{ padding:"14px 32px", borderRadius:12, border:"none", background:"#F9A825", color:"#1B5E20", fontSize:15, fontWeight:800, cursor:"pointer" }}>Get Started Free →</button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // ── TESTIMONIALS PAGE ──────────────────────────────────────────────────────
  if (page==="testimonials") {
    const allTestimonials = [
      {name:"Dr. Emeka Okonkwo",role:"Director, CBN Anchor Borrowers Programme",org:"Central Bank of Nigeria",text:"AgroTrack gave us visibility we never had before. We could see exactly where our disbursements were going — down to the GPS coordinate of each farm. Default rates in our pilot dropped by 31% in the first 6 months.",stars:5,tag:"Government"},
      {name:"Hajiya Aisha Musa",role:"Program Officer",org:"NIRSAL",text:"The layered disbursement feature alone has reduced fund diversion by over 60% in our pilot. It's now a non-negotiable requirement for all our grant programs. The field agent network is particularly impressive for reaching rural farmers.",stars:5,tag:"Development Finance"},
      {name:"Tunde Adeyemi",role:"Head of Agri-Finance",org:"Union Bank of Nigeria",text:"FarmScore has transformed how we assess agricultural borrowers. We can now lend confidently to farmers who previously had no credit history. Our agri-loan book has grown 4× in one year with AgroTrack as our underwriting layer.",stars:5,tag:"Commercial Bank"},
      {name:"Engr. Bola Olatunde",role:"Commissioner for Agriculture",org:"Ekiti State Government",text:"We launched a ₦500M farmer support fund through AgroTrack and had full visibility into every disbursement. The platform's local language support (Yoruba interface) meant even our elderly farmers could register without help.",stars:5,tag:"State Government"},
      {name:"Dr. Ngozi Eze",role:"Country Director",org:"USAID Feed the Future Nigeria",text:"The impact reporting module alone saved us weeks of manual data collection. We generated a full donor report — hectares farmed, jobs created, yield — in 15 minutes. This is the gold standard for agricultural grant management.",stars:5,tag:"International NGO"},
      {name:"Alhaji Musa Dankwabo",role:"President",org:"Kebbi State Rice Farmers Association",text:"Before AgroTrack, our members had to travel to the state capital to even find out if they qualified for a loan. Now they check on their USSD phone from the farm. 847 of our members got funded in the first planting season.",stars:5,tag:"Cooperative"},
    ];
    const caseStudies = [
      {title:"CBN Anchor Borrowers: From 63% to 91% Repayment",org:"Central Bank of Nigeria",metric:"28% improvement",desc:"By switching from lump-sum to layered disbursement and introducing FarmScore minimum thresholds, the CBN pilot achieved a 28 percentage-point jump in repayment rates within two planting seasons.",tag:"Government",color:"#1B5E20",bg:dark?"#0a2010":"#dcfce7"},
      {title:"NIRSAL Cassava Grant — Zero Diversion",org:"NIRSAL",metric:"₦312M tracked",desc:"312 million naira in cassava processing grants tracked through AgroTrack with full audit trail. Not a single diversion case reported. Every tranche tied to verified farm photos and agent confirmation.",tag:"Development Finance",color:"#2563eb",bg:dark?"#0d1a30":"#dbeafe"},
      {title:"Union Bank Agri-Loan Book 4× Growth",org:"Union Bank of Nigeria",metric:"4× portfolio growth",desc:"Union Bank integrated AgroTrack's FarmScore API into their credit decisioning. Approval rates increased from 22% to 67% for smallholder applicants while non-performing loans decreased from 18% to 6%.",tag:"Commercial Bank",color:"#7c3aed",bg:dark?"#1a0d30":"#ede9fe"},
    ];
    return (
      <div style={{ background:dark?"#111827":"#fff", minHeight:"100vh" }}>
        <PublicNav dark={dark} page={page} setPage={setPage} setView={setView} setAuthView={setAuthView} T={T} wrap={wrap}/>
        <div style={{ paddingTop:68 }}>
          <section style={{ background:"linear-gradient(160deg,#042007,#1B5E20)", padding:"80px 24px 96px", textAlign:"center" }}>
            <div style={wrap}>
              <h1 style={{ fontSize:"clamp(36px,5vw,60px)", fontWeight:900, color:"#fff", lineHeight:1.1, margin:"0 0 20px", letterSpacing:"-1.5px" }}>
                Trusted by Nigeria's<br/><span style={{ color:"#F9A825" }}>most respected lenders.</span>
              </h1>
              <p style={{ fontSize:18, color:"rgba(255,255,255,0.65)", maxWidth:520, margin:"0 auto", lineHeight:1.75 }}>
                From CBN to state governments, NGOs and commercial banks — here's what they say after deploying AgroTrack.
              </p>
            </div>
          </section>

          {/* Testimonials grid */}
          <section style={{ ...sec(), background:dark?"#111827":"#fff" }}>
            <div style={wrap}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20, marginBottom:72 }}>
                {allTestimonials.map(({name,role,org,text,stars,tag},i)=>(
                  <div key={i} style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:20, padding:28, position:"relative", overflow:"hidden" }}>
                    <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"linear-gradient(90deg,#1B5E20,#F9A825)" }}/>
                    <div style={{ display:"inline-block", background:dark?"#0a2010":"#dcfce7", color:"#16a34a", fontSize:10, fontWeight:700, padding:"2px 9px", borderRadius:20, marginBottom:14 }}>{tag}</div>
                    <div style={{ display:"flex", gap:2, marginBottom:14 }}>
                      {Array(stars).fill(0).map((_,j)=><Star key={j} size={14} fill="#F9A825" color="#F9A825"/>)}
                    </div>
                    <p style={{ fontSize:14, color:mutedC, lineHeight:1.75, margin:"0 0 20px", fontStyle:"italic" }}>"{text}"</p>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,#1B5E20,#2E7D32)", display:"flex", alignItems:"center", justifyContent:"center", color:"#F9A825", fontWeight:700, fontSize:12, flexShrink:0 }}>
                        {name.split(" ").map(x=>x[0]).join("").slice(0,2)}
                      </div>
                      <div>
                        <p style={{ fontSize:13, fontWeight:700, color:textC, margin:0 }}>{name}</p>
                        <p style={{ fontSize:11, color:mutedC, margin:0 }}>{role} · {org}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Case studies */}
              <div style={{ marginBottom:16 }}>
                <div style={{ ...pill }}>Case Studies</div>
                <h2 style={h2()}>Real results, real numbers</h2>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
                {caseStudies.map(({title,org,metric,desc,tag,color,bg:cbg})=>(
                  <div key={title} style={{ background:dark?cbg+"50":cbg, border:`1px solid ${color}25`, borderRadius:20, padding:28 }}>
                    <span style={{ fontSize:11, fontWeight:700, color, background: dark?cbg:cbg+"80", padding:"2px 9px", borderRadius:20, marginBottom:16, display:"inline-block" }}>{tag}</span>
                    <p style={{ fontSize:42, fontWeight:900, color, margin:"12px 0 8px" }}>{metric}</p>
                    <h3 style={{ fontSize:17, fontWeight:700, color:textC, margin:"0 0 10px", lineHeight:1.3 }}>{title}</h3>
                    <p style={{ fontSize:13, color:mutedC, lineHeight:1.7, margin:"0 0 16px" }}>{desc}</p>
                    <p style={{ fontSize:12, fontWeight:600, color:mutedC }}>— {org}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section style={{ background:"linear-gradient(135deg,#1B5E20,#2E7D32)", padding:"72px 24px", textAlign:"center" }}>
            <div style={wrap}>
              <h2 style={{ fontSize:36, fontWeight:900, color:"#fff", margin:"0 0 16px" }}>Become a success story</h2>
              <p style={{ fontSize:16, color:"rgba(255,255,255,0.7)", margin:"0 0 28px" }}>Join the organizations already transforming agricultural finance in Nigeria.</p>
              <button onClick={()=>setAuthView("lender-signup")} style={{ padding:"14px 32px", borderRadius:12, border:"none", background:"#F9A825", color:"#1B5E20", fontSize:15, fontWeight:800, cursor:"pointer" }}>Start Your Free Pilot →</button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // ── CONTACT PAGE ───────────────────────────────────────────────────────────
  if (page==="contact") {
    const [form, setForm] = useState({name:"",org:"",email:"",phone:"",type:"",message:"",interest:""});
    const [submitted, setSubmitted] = useState(false);
    const submit = () => { if(form.name&&form.email) setSubmitted(true); };
    return (
      <div style={{ background:dark?"#111827":"#fff", minHeight:"100vh" }}>
        <PublicNav dark={dark} page={page} setPage={setPage} setView={setView} setAuthView={setAuthView} T={T} wrap={wrap}/>
        <div style={{ paddingTop:68 }}>
          <section style={{ background:"linear-gradient(160deg,#042007,#1B5E20)", padding:"80px 24px 96px", textAlign:"center" }}>
            <div style={wrap}>
              <h1 style={{ fontSize:"clamp(36px,5vw,60px)", fontWeight:900, color:"#fff", lineHeight:1.1, margin:"0 0 20px", letterSpacing:"-1.5px" }}>
                Let's talk about<br/><span style={{ color:"#F9A825" }}>your programs.</span>
              </h1>
              <p style={{ fontSize:18, color:"rgba(255,255,255,0.65)", maxWidth:520, margin:"0 auto", lineHeight:1.75 }}>
                Whether you're a state ministry, development bank, or NGO — we'll walk you through a free pilot tailored to your programs.
              </p>
            </div>
          </section>

          <section style={{ padding:"0 24px", marginTop:-48, paddingBottom:96 }}>
            <div style={{ ...wrap, display:"grid", gridTemplateColumns:"1fr 440px", gap:48, alignItems:"start" }}>

              {/* Contact form */}
              <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:24, padding:40, boxShadow:dark?"none":"0 8px 32px rgba(0,0,0,0.08)" }}>
                {submitted ? (
                  <div style={{ textAlign:"center", padding:"40px 0" }}>
                    <div style={{ width:72, height:72, borderRadius:"50%", background:dark?"#0a2010":"#dcfce7", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
                      <CheckCircle size={36} color="#16a34a"/>
                    </div>
                    <h2 style={{ fontSize:22, fontWeight:800, color:textC, margin:"0 0 10px" }}>Message Received!</h2>
                    <p style={{ fontSize:14, color:mutedC, lineHeight:1.7, margin:"0 0 24px" }}>Our team will reach out within 24 hours to schedule your free demo. Check your email at <strong>{form.email}</strong></p>
                    <button onClick={()=>setSubmitted(false)} style={{ padding:"10px 24px", borderRadius:10, border:`1px solid ${borderC}`, background:"none", color:mutedC, fontSize:13, cursor:"pointer" }}>Send another message</button>
                  </div>
                ) : (
                  <>
                    <h2 style={{ fontSize:22, fontWeight:800, color:textC, margin:"0 0 6px" }}>Book a Free Demo</h2>
                    <p style={{ fontSize:14, color:mutedC, margin:"0 0 28px" }}>Fill in below and we'll set up a 30-minute walkthrough within 24 hours.</p>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                        {[["name","Full Name *","e.g. Dr. Emeka Okonkwo"],["org","Organisation *","e.g. Federal Ministry of Agriculture"]].map(([k,l,ph])=>(
                          <div key={k}>
                            <label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em" }}>{l}</label>
                            <input value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} placeholder={ph} style={{ width:"100%", background:inputBg, border:`1px solid ${borderC}`, borderRadius:10, padding:"10px 14px", fontSize:13, color:textC, outline:"none", boxSizing:"border-box" }}/>
                          </div>
                        ))}
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                        {[["email","Work Email *","e.g. name@ministry.gov.ng"],["phone","Phone Number","e.g. +234 803 000 0000"]].map(([k,l,ph])=>(
                          <div key={k}>
                            <label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em" }}>{l}</label>
                            <input value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} placeholder={ph} style={{ width:"100%", background:inputBg, border:`1px solid ${borderC}`, borderRadius:10, padding:"10px 14px", fontSize:13, color:textC, outline:"none", boxSizing:"border-box" }}/>
                          </div>
                        ))}
                      </div>
                      <div>
                        <label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em" }}>Organisation Type *</label>
                        <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} style={{ width:"100%", background:inputBg, border:`1px solid ${borderC}`, borderRadius:10, padding:"10px 14px", fontSize:13, color:textC, outline:"none" }}>
                          <option value="">Select your type...</option>
                          {["Federal Government Agency","State Government Ministry","Commercial Bank","Microfinance Bank","NGO / Development Organisation","International Donor","Agribusiness / Cooperative","Other"].map(t=><option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em" }}>Primary Interest</label>
                        <select value={form.interest} onChange={e=>setForm({...form,interest:e.target.value})} style={{ width:"100%", background:inputBg, border:`1px solid ${borderC}`, borderRadius:10, padding:"10px 14px", fontSize:13, color:textC, outline:"none" }}>
                          <option value="">What brings you here?</option>
                          {["Lender Dashboard & Portfolio Management","Layered Disbursement System","FarmScore Credit Engine","Field Agent Network","USSD / WhatsApp Integration","White-label Enterprise Plan","API Integration","General Enquiry"].map(t=><option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em" }}>Message</label>
                        <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Tell us about your program — fund size, number of farmers, states, timeline..." style={{ width:"100%", background:inputBg, border:`1px solid ${borderC}`, borderRadius:10, padding:"10px 14px", fontSize:13, color:textC, outline:"none", minHeight:100, resize:"vertical", boxSizing:"border-box" }}/>
                      </div>
                      <button onClick={submit} style={{ padding:"14px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#1B5E20,#2E7D32)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:"0 6px 20px rgba(27,94,32,0.35)" }}>
                        🚀 Book My Free Demo
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Right side info */}
              <div style={{ paddingTop:40 }}>
                <h3 style={{ fontSize:20, fontWeight:800, color:textC, margin:"0 0 6px" }}>What happens next?</h3>
                <p style={{ fontSize:14, color:mutedC, margin:"0 0 28px", lineHeight:1.7 }}>We respond to all enquiries within 24 business hours.</p>
                {[{n:"01",t:"We review your enquiry",d:"Our team reads your message and prepares a demo tailored to your program type and scale."},{n:"02",t:"30-minute video call",d:"We walk you through the platform live, using example data from programs similar to yours."},{n:"03",t:"Free 30-day pilot",d:"You get full access to the platform with up to 100 test borrowers — no credit card, no commitment."},{n:"04",t:"Go live",d:"We help you onboard your first loan program and train your team. Average go-live time: 48 hours."}].map(({n,t,d})=>(
                  <div key={n} style={{ display:"flex", gap:14, marginBottom:24 }}>
                    <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#1B5E20,#2E7D32)", display:"flex", alignItems:"center", justifyContent:"center", color:"#F9A825", fontWeight:800, fontSize:12, flexShrink:0 }}>{n}</div>
                    <div>
                      <p style={{ fontSize:14, fontWeight:700, color:textC, margin:"0 0 4px" }}>{t}</p>
                      <p style={{ fontSize:13, color:mutedC, margin:0, lineHeight:1.6 }}>{d}</p>
                    </div>
                  </div>
                ))}

                <div style={{ background:dark?"#0a2010":"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:16, padding:20, marginTop:8 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:"#16a34a", margin:"0 0 12px" }}>📞 Prefer to call?</p>
                  {[{l:"Phone",v:"+234 909 000 0000"},{l:"WhatsApp",v:"+234 909 000 0001"},{l:"Email",v:"hello@agrotrack.ng"},{l:"Office",v:"Plot 234, Garki Area 11, Abuja, FCT"}].map(({l,v})=>(
                    <div key={l} style={{ display:"flex", gap:10, marginBottom:8 }}>
                      <span style={{ fontSize:12, color:mutedC, width:60, flexShrink:0 }}>{l}</span>
                      <span style={{ fontSize:12, fontWeight:600, color:textC }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return null;
}

// ─── BORROWER WEB DASHBOARD ───────────────────────────────────────────────────
const bNavItems = [
  {icon:Home,         label:"Overview"},
  {icon:CreditCard,   label:"My Loans"},
  {icon:FileText,     label:"Farm Reports"},
  {icon:TrendingUp,   label:"FarmScore"},
  {icon:MessageSquare,label:"Messages"},
  {icon:Globe,        label:"Discover"},
  {icon:Settings,     label:"Settings"},
];

function BorrowerDashboard({ dark, setView }) {
  const T       = dark ? theme.dark : theme.light;
  const [nav, setNav]       = useState("Overview");
  const [sideOpen, setSide] = useState(true);

  const surface  = T.surface;
  const borderC  = T.border;
  const textC    = T.text;
  const mutedC   = T.muted;
  const bg       = T.bg;
  const inputBg  = T.inputBg;

  const card = (extra={}) => ({ background:surface, border:`1px solid ${borderC}`, borderRadius:16, padding:20, ...extra });

  // ── Overview Page ──
  const OverviewPage = () => (
    <div style={{ padding:24, overflowY:"auto", flex:1 }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:textC, margin:"0 0 4px" }}>Good morning, Bello Musa 👋</h1>
        <p style={{ fontSize:13, color:mutedC, margin:0 }}>Friday, 13 June 2025 · Kebbi State · Rice Farmer</p>
      </div>

      {/* Top KPI cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        {[
          {label:"FarmScore",     value:"815",     sub:"🏆 Gold Member",         grad:"linear-gradient(135deg,#1B5E20,#2E7D32)", icon:"📊"},
          {label:"Active Loan",   value:"₦850K",   sub:"CBN Rice Fund",          grad:"linear-gradient(135deg,#1565C0,#1976D2)", icon:"💰"},
          {label:"Amount Repaid", value:"₦510K",   sub:"60% complete",           grad:"linear-gradient(135deg,#6A1B9A,#7B1FA2)", icon:"✅"},
          {label:"Next Payment",  value:"₦85K",    sub:"Due Jul 5 · 22 days",    grad:"linear-gradient(135deg,#E65100,#F57C00)", icon:"📅"},
        ].map(({label,value,sub,grad,icon},i)=>(
          <div key={i} style={{ background: dark?"#1f2937":grad, border: dark?`1px solid ${borderC}`:"none", borderRadius:16, padding:20, boxShadow: dark?"none":"0 6px 24px rgba(0,0,0,0.15)", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:-10, right:-10, width:60, height:60, borderRadius:"50%", background:"rgba(255,255,255,0.1)" }}/>
            <p style={{ fontSize:22, margin:"0 0 8px" }}>{icon}</p>
            <p style={{ fontSize:11, fontWeight:600, color: dark?"#9ca3af":"rgba(255,255,255,0.7)", margin:"0 0 4px", textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</p>
            <p style={{ fontSize:24, fontWeight:800, color: dark?"#f9fafb":"#fff", margin:"0 0 4px" }}>{value}</p>
            <p style={{ fontSize:11, color: dark?"#9ca3af":"rgba(255,255,255,0.65)", margin:0 }}>{sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:16, marginBottom:16 }}>
        {/* Loan history chart */}
        <div style={card()}>
          <h3 style={{ fontSize:14, fontWeight:700, color:textC, margin:"0 0 4px" }}>Loan Activity</h3>
          <p style={{ fontSize:12, color:mutedC, margin:"0 0 16px" }}>Disbursements vs repayments (₦ thousands)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={loanHistory} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark?"#374151":"#f3f4f6"} vertical={false}/>
              <XAxis dataKey="month" tick={{ fontSize:11, fill:mutedC }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:11, fill:mutedC }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background:dark?"#1f2937":"#fff", border:`1px solid ${borderC}`, borderRadius:10, fontSize:12 }}/>
              <Bar dataKey="disbursed" fill="#1B5E20" radius={[5,5,0,0]} name="Disbursed"/>
              <Bar dataKey="repaid"    fill="#F9A825" radius={[5,5,0,0]} name="Repaid"/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* FarmScore ring + breakdown */}
        <div style={card()}>
          <h3 style={{ fontSize:14, fontWeight:700, color:textC, margin:"0 0 16px" }}>FarmScore</h3>
          <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:16 }}>
            <ScoreRing score={815} size={100}/>
            <div>
              <p style={{ fontSize:28, fontWeight:900, color:"#16a34a", margin:"0 0 4px" }}>815</p>
              <span style={{ background:"#F9A825", color:"#1B5E20", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:10 }}>🏆 Gold Member</span>
              <p style={{ fontSize:12, color:mutedC, margin:"6px 0 0" }}>Top 12% of all farmers</p>
            </div>
          </div>
          {[{l:"Identity",v:95,c:"#16a34a"},{l:"Repayment",v:88,c:"#16a34a"},{l:"Farm Reports",v:82,c:"#2563eb"},{l:"Utilisation",v:79,c:"#2563eb"},{l:"Experience",v:70,c:"#f59e0b"}].map(({l,v,c})=>(
            <div key={l} style={{ marginBottom:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                <span style={{ fontSize:11, color:mutedC }}>{l}</span>
                <span style={{ fontSize:11, fontWeight:700, color:textC }}>{v}</span>
              </div>
              <div style={{ height:4, borderRadius:4, background:dark?"#374151":"#e5e7eb" }}>
                <div style={{ width:`${v}%`, height:"100%", borderRadius:4, background:c }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {/* Disbursement layers */}
        <div style={card()}>
          <h3 style={{ fontSize:14, fontWeight:700, color:textC, margin:"0 0 16px" }}>Disbursement Layers — CBN Rice Fund</h3>
          {[
            {l:"Layer 1 — Land Preparation",  pct:30, amount:"₦255,000", status:"Released",  date:"Feb 2025", col:"#16a34a", bg:"#dcfce7", dbg:"#0a2010"},
            {l:"Layer 2 — Planting & Inputs", pct:40, amount:"₦340,000", status:"Released",  date:"Apr 2025", col:"#2563eb", bg:"#dbeafe", dbg:"#0d1a30"},
            {l:"Layer 3 — Crop Maintenance",  pct:30, amount:"₦255,000", status:"Locked",    date:"Aug 2025", col:"#6b7280", bg:"#f3f4f6", dbg:"#1a1f26"},
          ].map(({l,pct,amount,status,date,col,bg,dbg})=>(
            <div key={l} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:`1px solid ${borderC}` }}>
              <div style={{ width:36, height:36, borderRadius:10, background: dark?dbg:bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                {status==="Released" ? <Unlock size={15} color={col}/> : <Lock size={15} color={col}/>}
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:13, fontWeight:600, color:textC, margin:"0 0 2px" }}>{l}</p>
                <p style={{ fontSize:11, color:mutedC, margin:0 }}>{date} · {pct}% of total</p>
              </div>
              <div style={{ textAlign:"right" }}>
                <p style={{ fontSize:14, fontWeight:700, color:col, margin:"0 0 2px" }}>{amount}</p>
                <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:5, background: dark?dbg:bg, color:col }}>{status}</span>
              </div>
            </div>
          ))}
          <button style={{ width:"100%", marginTop:14, padding:11, borderRadius:10, border:"none", background:"#1B5E20", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>
            📊 View Full Loan Details
          </button>
        </div>

        {/* Activity + quick actions */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={card()}>
            <h3 style={{ fontSize:14, fontWeight:700, color:textC, margin:"0 0 14px" }}>Recent Activity</h3>
            {borrowerActivities.map((a,i)=>(
              <div key={i} style={{ display:"flex", gap:10, marginBottom:12 }}>
                <div style={{ width:32, height:32, borderRadius:9, background: dark?a.dbg:a.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>{a.icon}</div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:12, color:textC, margin:"0 0 2px", lineHeight:1.4 }}>{a.text}</p>
                  <p style={{ fontSize:11, color:mutedC, margin:0 }}>{a.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={card()}>
            <h3 style={{ fontSize:14, fontWeight:700, color:textC, margin:"0 0 12px" }}>Quick Actions</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {[{icon:"💳",label:"Make Repayment",col:"#16a34a",bg:"#dcfce7",dbg:"#0a2010"},{icon:"📸",label:"Submit Report",col:"#2563eb",bg:"#dbeafe",dbg:"#0d1a30"},{icon:"🔍",label:"Browse Programs",col:"#7c3aed",bg:"#ede9fe",dbg:"#1a0d30"},{icon:"📄",label:"Download Score",col:"#d97706",bg:"#fef3c7",dbg:"#2d1a00"}].map(({icon,label,col,bg,dbg})=>(
                <button key={label} style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 10px", borderRadius:10, border:`1px solid ${dark?dbg:bg}`, background: dark?dbg:bg, cursor:"pointer" }}>
                  <span style={{ fontSize:18 }}>{icon}</span>
                  <span style={{ fontSize:12, fontWeight:600, color:col, textAlign:"left" }}>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Discover Page ──
  const DiscoverPage = () => (
    <div style={{ padding:24, overflowY:"auto", flex:1 }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:textC, margin:"0 0 4px" }}>Available Programs</h1>
        <p style={{ fontSize:13, color:mutedC, margin:0 }}>Programs you are eligible for based on your profile and FarmScore</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
        {borrowerPrograms.map((p,i)=>(
          <div key={i} style={{ background:surface, border:`1px solid ${p.match>80?(dark?"#16a34a50":"#bbf7d0"):borderC}`, borderRadius:16, overflow:"hidden" }}>
            <div style={{ height:3, background: p.match>80?"linear-gradient(90deg,#1B5E20,#F9A825)":borderC }}/>
            <div style={{ padding:18 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                <div style={{ flex:1, paddingRight:10 }}>
                  <p style={{ fontSize:14, fontWeight:700, color:textC, margin:"0 0 4px" }}>{p.name}</p>
                  <p style={{ fontSize:11, color:mutedC, margin:0 }}>{p.lender}</p>
                </div>
                <span style={{ fontSize:12, fontWeight:800, color:p.col, background: dark?p.dbg:p.bg, padding:"4px 10px", borderRadius:8, flexShrink:0 }}>{p.match}% match</span>
              </div>
              <div style={{ display:"flex", gap:8, marginBottom:14 }}>
                {[p.amount, `${p.rate} p.a.`].map(t=><span key={t} style={{ fontSize:11, padding:"3px 9px", borderRadius:6, background:dark?"#374151":"#f3f4f6", color:mutedC }}>{t}</span>)}
              </div>
              <div style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:11, color:mutedC }}>Eligibility match</span>
                  <span style={{ fontSize:11, fontWeight:700, color:p.col }}>{p.match}%</span>
                </div>
                <div style={{ height:5, borderRadius:5, background:dark?"#374151":"#e5e7eb" }}>
                  <div style={{ width:`${p.match}%`, height:"100%", borderRadius:5, background:p.col }}/>
                </div>
              </div>
              <button style={{ width:"100%", padding:"10px", borderRadius:10, border:"none", background:"#1B5E20", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                Apply Now →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── FarmScore Page ──
  const FarmScorePage = () => (
    <div style={{ padding:24, overflowY:"auto", flex:1 }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:textC, margin:"0 0 4px" }}>My FarmScore</h1>
        <p style={{ fontSize:13, color:mutedC, margin:0 }}>Your agricultural credit identity — accepted by banks and lenders nationwide</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"320px 1fr", gap:16 }}>
        {/* Score card */}
        <div style={{ background:"linear-gradient(160deg,#1B5E20,#2E7D32)", borderRadius:20, padding:28, textAlign:"center" }}>
          <p style={{ color:"rgba(255,255,255,0.65)", fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 20px" }}>Your FarmScore</p>
          <div style={{ position:"relative", width:140, height:140, margin:"0 auto 20px" }}>
            <svg width={140} height={140} style={{ transform:"rotate(-90deg)" }}>
              <circle cx={70} cy={70} r={58} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={10}/>
              <circle cx={70} cy={70} r={58} fill="none" stroke="#F9A825" strokeWidth={10} strokeDasharray={364} strokeDashoffset={364*(1-815/850)} strokeLinecap="round"/>
            </svg>
            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column" }}>
              <span style={{ fontSize:40, fontWeight:900, color:"#F9A825" }}>815</span>
              <span style={{ fontSize:11, color:"rgba(255,255,255,0.6)" }}>out of 850</span>
            </div>
          </div>
          <span style={{ background:"#F9A825", color:"#1B5E20", fontSize:13, fontWeight:800, padding:"5px 16px", borderRadius:20 }}>🏆 Gold Member</span>
          <p style={{ color:"rgba(255,255,255,0.65)", fontSize:12, margin:"12px 0 20px" }}>Top 12% of all AgroTrack farmers</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
            {[{l:"+47 pts",s:"Last 3 months"},{l:"35 pts",s:"To Platinum"}].map(({l,s})=>(
              <div key={s} style={{ background:"rgba(255,255,255,0.1)", borderRadius:10, padding:"10px 8px" }}>
                <p style={{ color:"#fff", fontSize:16, fontWeight:700, margin:"0 0 2px" }}>{l}</p>
                <p style={{ color:"rgba(255,255,255,0.55)", fontSize:10, margin:0 }}>{s}</p>
              </div>
            ))}
          </div>
          <button style={{ width:"100%", padding:"12px", borderRadius:10, border:"none", background:"#F9A825", color:"#1B5E20", fontSize:13, fontWeight:700, cursor:"pointer" }}>
            📄 Download Score Report
          </button>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {/* Score trend chart */}
          <div style={card()}>
            <h3 style={{ fontSize:14, fontWeight:700, color:textC, margin:"0 0 4px" }}>Score History</h3>
            <p style={{ fontSize:12, color:mutedC, margin:"0 0 16px" }}>Last 6 months</p>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={scoreHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke={dark?"#374151":"#f0f0f0"}/>
                <XAxis dataKey="m" tick={{ fontSize:11, fill:mutedC }} axisLine={false} tickLine={false}/>
                <YAxis domain={[650,870]} tick={{ fontSize:11, fill:mutedC }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background:dark?"#1f2937":"#fff", border:`1px solid ${borderC}`, borderRadius:10, fontSize:12 }}/>
                <Line type="monotone" dataKey="s" stroke="#16a34a" strokeWidth={3} dot={{ fill:"#F9A825", strokeWidth:2, r:4 }} name="Score"/>
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Score breakdown */}
          <div style={card()}>
            <h3 style={{ fontSize:14, fontWeight:700, color:textC, margin:"0 0 14px" }}>Score Breakdown</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {[{l:"Identity Verification",v:95,c:"#16a34a"},{l:"Repayment History",v:88,c:"#16a34a"},{l:"Farm Activity Reports",v:82,c:"#2563eb"},{l:"Loan Utilisation",v:79,c:"#2563eb"},{l:"Farming Experience",v:70,c:"#f59e0b"},{l:"Cooperative Standing",v:65,c:"#f59e0b"}].map(({l,v,c})=>(
                <div key={l} style={{ background:dark?"#374151":"#f9fafb", borderRadius:10, padding:"12px 14px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ fontSize:11, color:mutedC }}>{l}</span>
                    <span style={{ fontSize:12, fontWeight:700, color:c }}>{v}</span>
                  </div>
                  <div style={{ height:5, borderRadius:5, background:dark?"#374151":"#e5e7eb" }}>
                    <div style={{ width:`${v}%`, height:"100%", borderRadius:5, background:c }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div style={{ background: dark?"#0d1a30":"#eff6ff", border:"1px solid #bfdbfe", borderRadius:14, padding:16 }}>
            <p style={{ fontSize:13, fontWeight:700, color:"#2563eb", margin:"0 0 10px" }}>💡 Boost Your Score</p>
            {["Submit farm reports on time every month — +15 pts each","Make your next repayment 3 days early — +8 pts","Join a registered cooperative — +10 pts one-time","Upload a full land title document — +5 pts"].map((t,i)=>(
              <div key={i} style={{ display:"flex", gap:8, marginBottom:8 }}>
                <ArrowRight size={13} color="#2563eb" style={{ marginTop:1, flexShrink:0 }}/>
                <p style={{ fontSize:12, color:mutedC, margin:0, lineHeight:1.5 }}>{t}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ── My Loans Page ──
  const MyLoansPage = () => (
    <div style={{ padding:24, overflowY:"auto", flex:1 }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:textC, margin:"0 0 4px" }}>My Loans</h1>
        <p style={{ fontSize:13, color:mutedC, margin:0 }}>All active and past loan applications</p>
      </div>
      {/* Active loan card */}
      <div style={{ background:"linear-gradient(135deg,#1B5E20,#2E7D32)", borderRadius:20, padding:24, marginBottom:20, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-20, right:-20, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.06)" }}/>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
          <div>
            <span style={{ background:"rgba(255,255,255,0.2)", color:"#fff", fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:20, letterSpacing:"0.05em" }}>● ACTIVE LOAN</span>
            <h2 style={{ color:"#fff", fontSize:20, fontWeight:800, margin:"10px 0 4px" }}>CBN Rice Farmers Support Fund 2025</h2>
            <p style={{ color:"rgba(255,255,255,0.65)", fontSize:13, margin:0 }}>Central Bank of Nigeria · Loan ID: LN-20250134</p>
          </div>
          <div style={{ textAlign:"right" }}>
            <p style={{ color:"rgba(255,255,255,0.65)", fontSize:11, margin:"0 0 4px" }}>Total Loan</p>
            <p style={{ color:"#F9A825", fontSize:30, fontWeight:900, margin:0 }}>₦850,000</p>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
          {[{l:"Disbursed",v:"₦850,000",c:"#fff"},{l:"Repaid",v:"₦510,000",c:"#4ade80"},{l:"Outstanding",v:"₦340,000",c:"#fbbf24"},{l:"Interest Rate",v:"9% p.a.",c:"#fff"}].map(({l,v,c})=>(
            <div key={l} style={{ background:"rgba(255,255,255,0.1)", borderRadius:12, padding:"12px 14px" }}>
              <p style={{ color:"rgba(255,255,255,0.6)", fontSize:11, margin:"0 0 4px" }}>{l}</p>
              <p style={{ color:c, fontSize:16, fontWeight:700, margin:0 }}>{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Repayment schedule */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        <div style={card()}>
          <h3 style={{ fontSize:14, fontWeight:700, color:textC, margin:"0 0 14px" }}>Repayment Schedule</h3>
          {[{m:"Apr 2025",amt:"₦85,000",s:"Paid",d:"Apr 5",c:"#16a34a"},{m:"May 2025",amt:"₦85,000",s:"Paid",d:"May 5",c:"#16a34a"},{m:"Jun 2025",amt:"₦85,000",s:"Paid",d:"Jun 5",c:"#16a34a"},{m:"Jul 2025",amt:"₦85,000",s:"Due",d:"Jul 5",c:"#f59e0b"},{m:"Aug 2025",amt:"₦85,000",s:"Upcoming",d:"Aug 5",c:"#9ca3af"},{m:"Sep 2025",amt:"₦85,000",s:"Upcoming",d:"Sep 5",c:"#9ca3af"}].map(({m,amt,s,d,c})=>(
            <div key={m} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 0", borderBottom:`1px solid ${borderC}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:28, height:28, borderRadius:8, background: s==="Paid"?(dark?"#0a2010":"#dcfce7"):s==="Due"?(dark?"#2d1a00":"#fef3c7"):(dark?"#1f2937":"#f3f4f6"), display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>
                  {s==="Paid"?"✓":s==="Due"?"!":"○"}
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:textC, margin:0 }}>{m}</p>
                  <p style={{ fontSize:11, color:mutedC, margin:0 }}>Due {d}</p>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <p style={{ fontSize:13, fontWeight:700, color:textC, margin:"0 0 2px" }}>{amt}</p>
                <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:5, background: s==="Paid"?(dark?"#0a2010":"#dcfce7"):s==="Due"?(dark?"#2d1a00":"#fef3c7"):(dark?"#1f2937":"#f3f4f6"), color:c }}>{s}</span>
              </div>
            </div>
          ))}
          <button style={{ width:"100%", marginTop:14, padding:"11px", borderRadius:10, border:"none", background:"#1B5E20", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>💳 Make Repayment</button>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {/* Loan progress */}
          <div style={card()}>
            <h3 style={{ fontSize:14, fontWeight:700, color:textC, margin:"0 0 14px" }}>Loan Progress</h3>
            <div style={{ marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:12, color:mutedC }}>Repayment progress</span>
                <span style={{ fontSize:12, fontWeight:700, color:"#16a34a" }}>60%</span>
              </div>
              <div style={{ height:10, borderRadius:10, background:dark?"#374151":"#e5e7eb", overflow:"hidden" }}>
                <div style={{ width:"60%", height:"100%", borderRadius:10, background:"linear-gradient(90deg,#1B5E20,#16a34a)", boxShadow:"0 0 10px #16a34a50" }}/>
              </div>
            </div>
            {[{l:"Loan Started",v:"Jan 2025"},{l:"End Date",v:"Jan 2026"},{l:"Months Remaining",v:"7 months"},{l:"Payments Made",v:"6 of 12"},{l:"Early Payment Bonus",v:"+8 FarmScore pts"}].map(({l,v})=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${borderC}` }}>
                <span style={{ fontSize:12, color:mutedC }}>{l}</span>
                <span style={{ fontSize:12, fontWeight:600, color:textC }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Streak */}
          <div style={{ background:"linear-gradient(135deg,#f59e0b,#d97706)", borderRadius:14, padding:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:32 }}>🔥</span>
              <div>
                <p style={{ color:"#fff", fontSize:15, fontWeight:700, margin:"0 0 2px" }}>5-Month Streak!</p>
                <p style={{ color:"rgba(255,255,255,0.75)", fontSize:12, margin:0 }}>Pay on time — 1 more month unlocks Platinum</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Past loans */}
      <div style={card()}>
        <h3 style={{ fontSize:14, fontWeight:700, color:textC, margin:"0 0 14px" }}>Loan History</h3>
        {[{name:"Kebbi Pilot Scheme 2024",lender:"Kebbi State Govt",amount:"₦200,000",status:"Completed",period:"Jan–Dec 2024"},{name:"BOA Starter Loan 2023",lender:"Bank of Agriculture",amount:"₦50,000",status:"Completed",period:"Mar–Sep 2023"}].map((l,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderBottom:`1px solid ${borderC}` }}>
            <div>
              <p style={{ fontSize:13, fontWeight:600, color:textC, margin:"0 0 2px" }}>{l.name}</p>
              <p style={{ fontSize:11, color:mutedC, margin:0 }}>{l.lender} · {l.period}</p>
            </div>
            <div style={{ textAlign:"right" }}>
              <p style={{ fontSize:14, fontWeight:700, color:textC, margin:"0 0 4px" }}>{l.amount}</p>
              <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:5, background:dark?"#0d1a30":"#dbeafe", color:"#2563eb" }}>{l.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Farm Reports Page ──
  const FarmReportsPage = () => {
    const [showForm, setShowForm] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [stage, setStage] = useState(2);
    const reports = [
      {month:"May 2025",stage:"Flowering 🌸",photos:4,challenge:"None",score:"+15 pts",verified:true},
      {month:"Apr 2025",stage:"Growing 🌿",  photos:3,challenge:"Pest pressure",score:"+8 pts", verified:true},
      {month:"Mar 2025",stage:"Planting 🌱", photos:5,challenge:"None",score:"+15 pts",verified:true},
      {month:"Feb 2025",stage:"Planting 🌱", photos:3,challenge:"Labour shortage",score:"+10 pts",verified:true},
    ];
    return (
      <div style={{ padding:24, overflowY:"auto", flex:1 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:700, color:textC, margin:"0 0 4px" }}>Farm Reports</h1>
            <p style={{ fontSize:13, color:mutedC, margin:0 }}>Monthly reports unlock disbursement layers and boost your FarmScore</p>
          </div>
          <button onClick={()=>setShowForm(true)} style={{ padding:"9px 18px", borderRadius:10, border:"none", background:"#1B5E20", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
            <FileText size={14}/> Submit June Report
          </button>
        </div>

        {/* Alert banner */}
        <div style={{ background:dark?"#0d1a30":"#eff6ff", border:"1px solid #93c5fd", borderRadius:14, padding:"14px 18px", marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:20 }}>📢</span>
          <div>
            <p style={{ fontSize:13, fontWeight:700, color:"#2563eb", margin:"0 0 2px" }}>June report unlocks your Layer 2 disbursement</p>
            <p style={{ fontSize:12, color:mutedC, margin:0 }}>Submit with at least 3 farm photos to release ₦340,000</p>
          </div>
          <button onClick={()=>setShowForm(true)} style={{ marginLeft:"auto", padding:"7px 16px", borderRadius:8, border:"none", background:"#2563eb", color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", flexShrink:0 }}>Submit Now</button>
        </div>

        {/* Submit form */}
        {showForm && !submitted && (
          <div style={{ ...card(), marginBottom:20, border:`2px solid #1B5E20` }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:textC, margin:"0 0 16px" }}>📝 June 2025 Farm Report</h3>
            <div style={{ marginBottom:14 }}>
              <p style={{ fontSize:12, fontWeight:600, color:mutedC, textTransform:"uppercase", letterSpacing:"0.05em", margin:"0 0 10px" }}>Crop Growth Stage</p>
              <div style={{ display:"flex", gap:8 }}>
                {[{s:"🌱",l:"Planting",i:0},{s:"🌿",l:"Growing",i:1},{s:"🌸",l:"Flowering",i:2},{s:"🌾",l:"Harvesting",i:3}].map(({s,l,i})=>(
                  <button key={i} onClick={()=>setStage(i)} style={{ flex:1, padding:"12px 6px", borderRadius:12, border:`2px solid ${stage===i?"#1B5E20":borderC}`, background: stage===i?(dark?"#0a2010":"#dcfce7"):inputBg, cursor:"pointer", textAlign:"center" }}>
                    <p style={{ fontSize:22, margin:"0 0 4px" }}>{s}</p>
                    <p style={{ fontSize:11, fontWeight:600, color: stage===i?"#16a34a":mutedC, margin:0 }}>{l}</p>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:14 }}>
              <p style={{ fontSize:12, fontWeight:600, color:mutedC, textTransform:"uppercase", letterSpacing:"0.05em", margin:"0 0 8px" }}>Farm Photos (min. 3)</p>
              <div style={{ display:"flex", gap:8 }}>
                {[1,2,3,4].map(n=>(
                  <div key={n} style={{ width:90, height:90, borderRadius:12, background:dark?"#374151":"#f3f4f6", border:`1px dashed ${borderC}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4, cursor:"pointer" }}>
                    <Camera size={20} color={mutedC}/>
                    <span style={{ fontSize:10, color:mutedC }}>Photo {n}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:14 }}>
              <p style={{ fontSize:12, fontWeight:600, color:mutedC, textTransform:"uppercase", letterSpacing:"0.05em", margin:"0 0 8px" }}>Challenges Faced</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {["None 😊","Pests 🐛","Drought ☀️","Flooding 🌊","Labour","Market access"].map(c=>(
                  <button key={c} style={{ fontSize:12, padding:"6px 14px", borderRadius:20, border:`1px solid ${c==="None 😊"?"#1B5E20":borderC}`, background: c==="None 😊"?"#1B5E20":(dark?"#374151":"#f3f4f6"), color: c==="None 😊"?"#fff":mutedC, cursor:"pointer" }}>{c}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:16 }}>
              <p style={{ fontSize:12, fontWeight:600, color:mutedC, textTransform:"uppercase", letterSpacing:"0.05em", margin:"0 0 6px" }}>Additional Notes</p>
              <textarea placeholder="Any other observations about your farm this month..." style={{ width:"100%", background:inputBg, border:`1px solid ${borderC}`, borderRadius:10, padding:"10px 14px", fontSize:13, color:textC, outline:"none", resize:"vertical", minHeight:72, boxSizing:"border-box" }}/>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setShowForm(false)} style={{ flex:1, padding:"11px", borderRadius:10, border:`1px solid ${borderC}`, background:"none", color:mutedC, fontSize:13, cursor:"pointer" }}>Cancel</button>
              <button onClick={()=>{setSubmitted(true);setShowForm(false);}} style={{ flex:2, padding:"11px", borderRadius:10, border:"none", background:"#1B5E20", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>📤 Submit Report</button>
            </div>
          </div>
        )}
        {submitted && (
          <div style={{ background:dark?"#0a2010":"#dcfce7", border:"1px solid #bbf7d0", borderRadius:14, padding:16, marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
            <CheckCircle size={22} color="#16a34a"/>
            <div>
              <p style={{ fontSize:13, fontWeight:700, color:"#16a34a", margin:"0 0 2px" }}>June report submitted! +15 FarmScore points earned.</p>
              <p style={{ fontSize:12, color:mutedC, margin:0 }}>Your Layer 2 disbursement of ₦340,000 is now being processed.</p>
            </div>
          </div>
        )}

        {/* Past reports */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {reports.map((r,i)=>(
            <div key={i} style={card()}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:dark?"#0a2010":"#dcfce7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>🌱</div>
                  <div>
                    <p style={{ fontSize:14, fontWeight:700, color:textC, margin:"0 0 2px" }}>{r.month} Report</p>
                    <p style={{ fontSize:12, color:mutedC, margin:0 }}>Stage: {r.stage}</p>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <span style={{ fontSize:13, fontWeight:700, color:"#16a34a", background:dark?"#0a2010":"#dcfce7", padding:"4px 12px", borderRadius:8 }}>{r.score}</span>
                  {r.verified && <span style={{ fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:5, background:dark?"#0d1a30":"#dbeafe", color:"#2563eb" }}>✓ Verified</span>}
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                {[{l:"Photos",v:`${r.photos} uploaded`},{l:"Challenge",v:r.challenge},{l:"Agent Verified",v:"Yes"}].map(({l,v})=>(
                  <div key={l} style={{ background:dark?"#111827":"#f9fafb", borderRadius:8, padding:"8px 10px" }}>
                    <p style={{ fontSize:10, color:mutedC, margin:"0 0 2px", textTransform:"uppercase", letterSpacing:"0.04em" }}>{l}</p>
                    <p style={{ fontSize:12, fontWeight:600, color:textC, margin:0 }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── Messages Page ──
  const MessagesPage = () => {
    const [msg, setMsg] = useState("");
    const [msgs, setMsgs] = useState([
      {from:"lender",text:"Your Layer 2 disbursement of ₦340,000 has been processed and will reflect in your account within 24 hours.",time:"2 days ago"},
      {from:"borrower",text:"Thank you! I have already purchased seedlings and fertilizer from the approved supplier.",time:"2 days ago"},
      {from:"lender",text:"Excellent. Please submit your planting photos within 7 days to keep your FarmScore on track.",time:"1 day ago"},
      {from:"system",text:"🔔 Your June farm report is due in 3 days. Submit to unlock Layer 3 disbursement.",time:"Today"},
      {from:"lender",text:"Reminder: Your July repayment of ₦85,000 is due on July 5th.",time:"Today"},
    ]);
    const send = () => {
      if(!msg.trim()) return;
      setMsgs([...msgs,{from:"borrower",text:msg,time:"Just now"}]);
      setMsg("");
    };
    return (
      <div style={{ flex:1, display:"flex", flexDirection:"column", height:"calc(100vh - 60px)" }}>
        {/* Header */}
        <div style={{ padding:"14px 24px", background:surface, borderBottom:`1px solid ${borderC}`, display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:42, height:42, borderRadius:"50%", background:"linear-gradient(135deg,#1B5E20,#2E7D32)", display:"flex", alignItems:"center", justifyContent:"center", color:"#F9A825", fontWeight:700, fontSize:13 }}>FM</div>
          <div>
            <p style={{ fontSize:14, fontWeight:700, color:textC, margin:"0 0 2px" }}>Federal Ministry of Agriculture</p>
            <p style={{ fontSize:12, color:mutedC, margin:0 }}>CBN Rice Farmers Support Fund · 🟢 Online</p>
          </div>
          <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
            <button style={{ padding:"7px 14px", borderRadius:8, border:`1px solid ${borderC}`, background:"none", color:mutedC, fontSize:12, cursor:"pointer" }}>📋 View Loan</button>
            <button style={{ padding:"7px 14px", borderRadius:8, border:"none", background:"#1B5E20", color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer" }}>📤 Submit Report</button>
          </div>
        </div>
        {/* Messages */}
        <div style={{ flex:1, overflowY:"auto", padding:24, display:"flex", flexDirection:"column", gap:14, background:dark?"#111827":"#f8fffe" }}>
          {msgs.map((m,i)=>(
            m.from==="system" ? (
              <div key={i} style={{ textAlign:"center" }}>
                <span style={{ fontSize:12, color:mutedC, background:dark?"#1f2937":"#f3f4f6", padding:"6px 14px", borderRadius:20, display:"inline-block" }}>{m.text}</span>
              </div>
            ) : (
              <div key={i} style={{ display:"flex", justifyContent:m.from==="borrower"?"flex-end":"flex-start" }}>
                <div style={{ maxWidth:"65%", display:"flex", flexDirection:"column", alignItems:m.from==="borrower"?"flex-end":"flex-start", gap:4 }}>
                  <div style={{ padding:"12px 16px", borderRadius:m.from==="lender"?"6px 18px 18px 18px":"18px 6px 18px 18px", background: m.from==="lender"?(dark?"#1B5E20":"#1B5E20"):(dark?"#374151":"#fff"), boxShadow:"0 2px 8px rgba(0,0,0,0.08)" }}>
                    <p style={{ fontSize:13, color:m.from==="lender"?"#fff":textC, margin:0, lineHeight:1.55 }}>{m.text}</p>
                  </div>
                  <span style={{ fontSize:10, color:mutedC }}>{m.time}</span>
                </div>
              </div>
            )
          ))}
        </div>
        {/* Quick replies */}
        <div style={{ padding:"8px 24px", background:surface, borderTop:`1px solid ${borderC}` }}>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:8 }}>
            {["✅ Payment confirmed","📸 Photos submitted","❓ Query about Layer 3","🙏 Thank you"].map(t=>(
              <button key={t} onClick={()=>setMsg(t)} style={{ fontSize:11, padding:"4px 12px", borderRadius:16, border:`1px solid ${borderC}`, background:inputBg, color:mutedC, cursor:"pointer" }}>{t}</button>
            ))}
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Type a message..." style={{ flex:1, background:inputBg, border:`1px solid ${borderC}`, borderRadius:12, padding:"11px 16px", fontSize:13, color:textC, outline:"none" }}/>
            <button onClick={send} style={{ width:44, height:44, borderRadius:12, background:"#1B5E20", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Send size={16} color="#fff"/>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── Borrower Settings Page ──
  const BorrowerSettingsPage = () => {
    const [notifs, setNotifs] = useState({sms:true,whatsapp:true,email:false,repayReminder:true,scoreUpdate:true});
    const Toggle2 = ({on,onToggle}) => (
      <div onClick={onToggle} style={{ width:44,height:24,borderRadius:12,background:on?"#1B5E20":"#374151",cursor:"pointer",position:"relative",transition:"background 0.2s",flexShrink:0,border:`2px solid ${on?"#16a34a":"#6b7280"}` }}>
        <div style={{ width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:1,left:on?21:1,transition:"left 0.2s",boxShadow:"0 2px 4px rgba(0,0,0,0.3)" }}/>
      </div>
    );
    const Row = ({l,d,k}) => (
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 0",borderBottom:`1px solid ${borderC}` }}>
        <div><p style={{ fontSize:13,fontWeight:600,color:textC,margin:"0 0 2px" }}>{l}</p><p style={{ fontSize:11,color:mutedC,margin:0 }}>{d}</p></div>
        <Toggle2 on={notifs[k]} onToggle={()=>setNotifs(n=>({...n,[k]:!n[k]}))}/>
      </div>
    );
    return (
      <div style={{ padding:24, overflowY:"auto", flex:1 }}>
        <div style={{ marginBottom:20 }}>
          <h1 style={{ fontSize:22, fontWeight:700, color:textC, margin:"0 0 4px" }}>Settings</h1>
          <p style={{ fontSize:13, color:mutedC, margin:0 }}>Manage your account, notifications and preferences</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          {/* Profile */}
          <div style={card()}>
            <h3 style={{ fontSize:14, fontWeight:700, color:textC, margin:"0 0 16px" }}>My Profile</h3>
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16, paddingBottom:16, borderBottom:`1px solid ${borderC}` }}>
              <div style={{ width:56,height:56,borderRadius:"50%",background:"linear-gradient(135deg,#1B5E20,#2E7D32)",display:"flex",alignItems:"center",justifyContent:"center",color:"#F9A825",fontWeight:800,fontSize:18,flexShrink:0 }}>BM</div>
              <div>
                <p style={{ fontSize:16,fontWeight:700,color:textC,margin:"0 0 3px" }}>Bello Musa</p>
                <span style={{ background:"#F9A825",color:"#1B5E20",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20 }}>🏆 Gold · FarmScore 815</span>
              </div>
            </div>
            {[{l:"Farmer ID",v:"FMR-0034"},{l:"State",v:"Kebbi State"},{l:"LGA",v:"Birnin Kebbi"},{l:"Primary Crop",v:"Rice"},{l:"Farm Size",v:"5.1 hectares"},{l:"Phone",v:"0706 xxx xxxx"},{l:"BVN Status",v:"✓ Verified"},{l:"NIN Status",v:"✓ Verified"}].map(({l,v})=>(
              <div key={l} style={{ display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${borderC}` }}>
                <span style={{ fontSize:12,color:mutedC }}>{l}</span>
                <span style={{ fontSize:12,fontWeight:600,color:v.includes("✓")?"#16a34a":textC }}>{v}</span>
              </div>
            ))}
            <button style={{ width:"100%",marginTop:14,padding:"10px",borderRadius:10,border:`1px solid ${borderC}`,background:"none",color:textC,fontSize:13,fontWeight:600,cursor:"pointer" }}>✏️ Edit Profile</button>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {/* Notifications */}
            <div style={card()}>
              <h3 style={{ fontSize:14, fontWeight:700, color:textC, margin:"0 0 14px" }}>Notifications</h3>
              <Row l="SMS Alerts"        d="Receive updates via SMS"             k="sms"/>
              <Row l="WhatsApp Updates"  d="Get messages on WhatsApp"            k="whatsapp"/>
              <Row l="Email Digest"      d="Weekly summary to your email"        k="email"/>
              <Row l="Repayment Reminders" d="Alert 3 days before payment due"   k="repayReminder"/>
              <Row l="Score Updates"     d="Notify me when FarmScore changes"    k="scoreUpdate"/>
            </div>

            {/* Language */}
            <div style={card()}>
              <h3 style={{ fontSize:14, fontWeight:700, color:textC, margin:"0 0 14px" }}>Language / Harshe / Ede</h3>
              {["English","Hausa — هَوُسَ","Yoruba","Igbo","Nigerian Pidgin"].map((lang,i)=>(
                <div key={lang} onClick={()=>{}} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${borderC}`,cursor:"pointer" }}>
                  <div style={{ width:18,height:18,borderRadius:"50%",border:`2px solid ${i===0?"#1B5E20":borderC}`,display:"flex",alignItems:"center",justifyContent:"center" }}>
                    {i===0 && <div style={{ width:8,height:8,borderRadius:"50%",background:"#1B5E20" }}/>}
                  </div>
                  <span style={{ fontSize:13,color:i===0?textC:mutedC,fontWeight:i===0?600:400 }}>{lang}</span>
                </div>
              ))}
            </div>

            {/* Bank details */}
            <div style={card()}>
              <h3 style={{ fontSize:14, fontWeight:700, color:textC, margin:"0 0 14px" }}>Bank Account</h3>
              {[{l:"Bank Name",v:"First Bank of Nigeria"},{l:"Account Number",v:"30•• •••• 7721"},{l:"Account Name",v:"Bello Musa"}].map(({l,v})=>(
                <div key={l} style={{ display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${borderC}` }}>
                  <span style={{ fontSize:12,color:mutedC }}>{l}</span>
                  <span style={{ fontSize:12,fontWeight:600,color:textC }}>{v}</span>
                </div>
              ))}
              <button style={{ width:"100%",marginTop:12,padding:"9px",borderRadius:9,border:`1px solid ${borderC}`,background:"none",color:textC,fontSize:13,cursor:"pointer" }}>Update Bank Details</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderNav = () => {
    if (nav==="Overview")     return <OverviewPage/>;
    if (nav==="My Loans")     return <MyLoansPage/>;
    if (nav==="Farm Reports") return <FarmReportsPage/>;
    if (nav==="FarmScore")    return <FarmScorePage/>;
    if (nav==="Messages")     return <MessagesPage/>;
    if (nav==="Discover")     return <DiscoverPage/>;
    if (nav==="Settings")     return <BorrowerSettingsPage/>;
    return (
      <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12 }}>
        <span style={{ fontSize:40 }}>🌱</span>
        <p style={{ fontSize:16,fontWeight:700,color:textC,margin:0 }}>{nav}</p>
        <p style={{ fontSize:13,color:mutedC }}>Coming soon</p>
      </div>
    );
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", background:bg, fontFamily:"'Inter',system-ui,sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ width:sideOpen?220:64, flexShrink:0, background: T.sidebarBg, borderRight:`1px solid ${T.sidebarBorder}`, display:"flex", flexDirection:"column", transition:"width 0.25s", overflow:"hidden" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"18px 16px", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ width:32, height:32, background:"#F9A825", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Leaf size={16} color="#1B5E20"/></div>
          {sideOpen && <span style={{ color:"#fff", fontWeight:800, fontSize:17, whiteSpace:"nowrap" }}>AgroTrack</span>}
        </div>
        {/* Farmer profile mini */}
        {sideOpen && (
          <div style={{ padding:"14px 16px", borderBottom:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#F9A825,#f59e0b)", display:"flex", alignItems:"center", justifyContent:"center", color:"#1B5E20", fontWeight:800, fontSize:12, flexShrink:0 }}>BM</div>
            <div style={{ minWidth:0 }}>
              <p style={{ color:"#fff", fontSize:12, fontWeight:700, margin:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>Bello Musa</p>
              <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                <span style={{ background:"#F9A825", color:"#1B5E20", fontSize:9, fontWeight:800, padding:"1px 6px", borderRadius:8 }}>🏆 GOLD</span>
                <span style={{ color:"rgba(255,255,255,0.5)", fontSize:10 }}>815</span>
              </div>
            </div>
          </div>
        )}
        <nav style={{ flex:1, padding:"10px 8px" }}>
          {bNavItems.map(({icon:Icon,label})=>(
            <button key={label} onClick={()=>setNav(label)} style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"10px 12px", borderRadius:10, background: nav===label?"#F9A825":"transparent", color: nav===label?"#1B5E20":"rgba(255,255,255,0.6)", fontWeight: nav===label?700:400, fontSize:13, border:"none", cursor:"pointer", whiteSpace:"nowrap", marginBottom:2 }}>
              <Icon size={17} style={{ flexShrink:0 }}/>
              {sideOpen && <span>{label}</span>}
            </button>
          ))}
        </nav>
        {sideOpen && (
          <div style={{ padding:"12px 8px", borderTop:"1px solid rgba(255,255,255,0.08)" }}>
            <button onClick={()=>setView("landing")} style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"10px 12px", borderRadius:10, background:"transparent", color:"rgba(255,255,255,0.4)", fontSize:12, border:"none", cursor:"pointer" }}>
              <LogOut size={15}/> Back to Website
            </button>
          </div>
        )}
      </aside>

      {/* Main */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        {/* Topbar */}
        <header style={{ height:60, display:"flex", alignItems:"center", padding:"0 24px", gap:14, background:surface, borderBottom:`1px solid ${borderC}`, position:"sticky", top:0, zIndex:10 }}>
          <button onClick={()=>setSide(!sideOpen)} style={{ background:"none", border:"none", cursor:"pointer", color:mutedC }}>
            <Menu size={20}/>
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, maxWidth:340, background:inputBg, border:`1px solid ${borderC}`, borderRadius:10, padding:"7px 12px" }}>
            <Search size={14} color={mutedC}/>
            <input style={{ background:"none", border:"none", outline:"none", fontSize:13, flex:1, color:textC }} placeholder="Search programs, reports..."/>
          </div>
          <div style={{ display:"flex", gap:10, marginLeft:"auto", alignItems:"center" }}>
            <div style={{ position:"relative" }}>
              <button style={{ width:34, height:34, borderRadius:9, border:`1px solid ${borderC}`, background:dark?"#374151":"#eff6ff", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                <Bell size={15} color={dark?"#9ca3af":"#2563eb"}/>
              </button>
              <span style={{ position:"absolute", top:-3, right:-3, width:14, height:14, background:"#ef4444", borderRadius:"50%", color:"#fff", fontSize:9, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700 }}>2</span>
            </div>
            {/* Repayment streak */}
            <div style={{ display:"flex", alignItems:"center", gap:6, background: dark?"#2d1a00":"#fef3c7", border:"1px solid #fde68a", borderRadius:20, padding:"5px 12px" }}>
              <span style={{ fontSize:14 }}>🔥</span>
              <span style={{ fontSize:12, fontWeight:700, color:"#d97706" }}>5-month streak</span>
            </div>
            {/* Next payment alert */}
            <div style={{ display:"flex", alignItems:"center", gap:6, background: dark?"#0d1a30":"#dbeafe", border:"1px solid #93c5fd", borderRadius:20, padding:"5px 12px" }}>
              <Clock size={13} color="#2563eb"/>
              <span style={{ fontSize:12, fontWeight:700, color:"#2563eb" }}>₦85K due Jul 5</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column" }}>
          {renderNav()}
        </div>
      </div>
    </div>
  );
}


// ─── AUTH SHELL ───────────────────────────────────────────────────────────────
function AuthShell({ dark, children, wide=false }) {
  const T = dark ? theme.dark : theme.light;
  return (
    <div style={{ minHeight:"100vh", background:dark?"#111827":"#f0fdf4", display:"flex", flexDirection:"column" }}>
      <div style={{ height:60, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 32px", background:T.surface, borderBottom:`1px solid ${T.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:32,height:32,background:"linear-gradient(135deg,#1B5E20,#2E7D32)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center" }}>
            <Leaf size={16} color="#F9A825"/>
          </div>
          <span style={{ fontWeight:900, fontSize:18, color:dark?"#f9fafb":"#1B5E20" }}>AgroTrack</span>
        </div>
        <span style={{ fontSize:13, color:T.muted }}>Need help? <span style={{ color:"#1B5E20", fontWeight:600 }}>support@agrotrack.ng</span></span>
      </div>
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"32px 24px" }}>
        <div style={{ width:"100%", maxWidth:wide?860:460, background:T.surface, border:`1px solid ${T.border}`, borderRadius:24, padding:"40px 44px", boxShadow:dark?"none":"0 8px 40px rgba(0,0,0,0.08)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function StepDots({ total, current, color="#1B5E20", dark }) {
  return (
    <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:28 }}>
      {Array.from({length:total}).map((_,i)=>(
        <div key={i} style={{ width:i===current?24:8, height:8, borderRadius:4, background:i<=current?color:(dark?"#374151":"#e5e7eb"), transition:"all 0.3s" }}/>
      ))}
    </div>
  );
}

// ─── LENDER LOGIN ─────────────────────────────────────────────────────────────
function LenderLogin({ dark, setView, setAuthView }) {
  const T = dark ? theme.dark : theme.light;
  const [email,setEmail]   = useState("");
  const [pw,setPw]         = useState("");
  const [showPw,setShowPw] = useState(false);
  const [loading,setLoad]  = useState(false);
  const inp = { width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:10,padding:"11px 14px",fontSize:14,color:T.text,outline:"none",boxSizing:"border-box" };
  const go = () => { setLoad(true); setTimeout(()=>{ setLoad(false); setView("lender"); },1200); };
  return (
    <AuthShell dark={dark}>
      <div style={{ textAlign:"center", marginBottom:28 }}>
        <div style={{ width:56,height:56,background:"linear-gradient(135deg,#1B5E20,#2E7D32)",borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px" }}>
          <Leaf size={26} color="#F9A825"/>
        </div>
        <h1 style={{ fontSize:24,fontWeight:800,color:T.text,margin:"0 0 6px" }}>Welcome back</h1>
        <p style={{ fontSize:14,color:T.muted,margin:0 }}>Sign in to your lender account</p>
      </div>
      <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
        <div>
          <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.05em" }}>Work Email</label>
          <input style={inp} type="email" placeholder="you@organisation.gov.ng" value={email} onChange={e=>setEmail(e.target.value)}/>
        </div>
        <div>
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
            <label style={{ fontSize:11,fontWeight:600,color:T.muted,textTransform:"uppercase",letterSpacing:"0.05em" }}>Password</label>
            <button onClick={()=>setAuthView("forgot")} style={{ fontSize:12,color:"#1B5E20",fontWeight:600,background:"none",border:"none",cursor:"pointer" }}>Forgot password?</button>
          </div>
          <div style={{ position:"relative" }}>
            <input style={inp} type={showPw?"text":"password"} placeholder="••••••••••" value={pw} onChange={e=>setPw(e.target.value)}/>
            <button onClick={()=>setShowPw(!showPw)} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:T.muted,fontSize:12 }}>{showPw?"Hide":"Show"}</button>
          </div>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <input type="checkbox" id="rem" style={{ accentColor:"#1B5E20" }}/>
          <label htmlFor="rem" style={{ fontSize:13,color:T.muted,cursor:"pointer" }}>Keep me signed in for 30 days</label>
        </div>
        <button onClick={go} disabled={loading} style={{ padding:"13px",borderRadius:12,border:"none",background:loading?"#9ca3af":"linear-gradient(135deg,#1B5E20,#2E7D32)",color:"#fff",fontSize:14,fontWeight:700,cursor:loading?"default":"pointer",boxShadow:loading?"none":"0 4px 16px rgba(27,94,32,0.35)" }}>
          {loading?"Signing in...":"Sign In to Dashboard →"}
        </button>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ flex:1,height:1,background:T.border }}/><span style={{ fontSize:12,color:T.muted }}>or</span><div style={{ flex:1,height:1,background:T.border }}/>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
          {[{l:"Google Workspace",i:"🔵"},{l:"Microsoft SSO",i:"🟦"}].map(({l,i})=>(
            <button key={l} style={{ padding:"10px",borderRadius:10,border:`1px solid ${T.border}`,background:T.inputBg,color:T.text,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}><span>{i}</span>{l}</button>
          ))}
        </div>
        <button onClick={()=>setAuthView("2fa")} style={{ padding:"10px",borderRadius:10,border:`1px solid ${T.border}`,background:"none",color:T.muted,fontSize:13,cursor:"pointer" }}>Test 2FA screen →</button>
      </div>
      <p style={{ textAlign:"center",fontSize:13,color:T.muted,marginTop:24,marginBottom:0 }}>
        No account? <button onClick={()=>setAuthView("lender-signup")} style={{ color:"#1B5E20",fontWeight:700,background:"none",border:"none",cursor:"pointer" }}>Sign up free →</button>
      </p>
    </AuthShell>
  );
}

// ─── LENDER SIGN UP ───────────────────────────────────────────────────────────
function LenderSignup({ dark, setView, setAuthView }) {
  const T = dark ? theme.dark : theme.light;
  const [step,setStep] = useState(0);
  const [plan,setPlan] = useState("growth");
  const [annual,setAnn] = useState(false);
  const [loading,setLoad] = useState(false);
  const [form,setForm] = useState({ orgName:"",regNumber:"",orgType:"",email:"",phone:"",state:"",firstName:"",lastName:"",role:"",password:"",confirm:"",cardNumber:"",expiry:"",cvv:"",billing:"" });
  const inp = { width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:10,padding:"11px 14px",fontSize:14,color:T.text,outline:"none",boxSizing:"border-box" };
  const steps = ["Organisation","Admin Account","Choose Plan","Payment","Go Live!"];
  const plans = [
    { id:"starter",  label:"Starter",    price:250,  desc:"NGOs & pilot programs",    feats:["500 borrowers","3 programs","Basic dashboard"] },
    { id:"growth",   label:"Growth",     price:750,  desc:"Banks & ministries",        feats:["5,000 borrowers","Unlimited programs","Geospatial map","FarmScore API"], hot:true },
    { id:"enterprise",label:"Enterprise",price:null, desc:"National scale programs",   feats:["Unlimited everything","White-label","Dedicated manager"] },
  ];
  const nigerianStates = ["Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Benue","Cross River","Delta","Ekiti","Enugu","FCT","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara"];
  const next = () => {
    if (step===3) { setLoad(true); setTimeout(()=>{ setLoad(false); setStep(4); },1600); return; }
    setStep(s=>Math.min(s+1,steps.length-1));
  };
  const pwChecks = [form.password.length>=8,/\d/.test(form.password),/[^a-zA-Z0-9]/.test(form.password),form.password.length>=10&&/\d/.test(form.password)&&/[^a-zA-Z0-9]/.test(form.password)];

  return (
    <AuthShell dark={dark} wide={step===2}>
      <div style={{ textAlign:"center",marginBottom:6 }}>
        <h1 style={{ fontSize:22,fontWeight:800,color:T.text,margin:"0 0 4px" }}>{steps[step]}</h1>
        <p style={{ fontSize:13,color:T.muted,margin:"0 0 20px" }}>Step {step+1} of {steps.length}</p>
      </div>
      <StepDots total={steps.length} current={step} dark={dark}/>

      {step===0 && (
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <div>
            <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.05em" }}>Organisation Name *</label>
            <input style={inp} placeholder="e.g. Federal Ministry of Agriculture" value={form.orgName} onChange={e=>setForm({...form,orgName:e.target.value})}/>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <div>
              <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase" }}>RC / Reg. Number</label>
              <input style={inp} placeholder="RC-1234567" value={form.regNumber} onChange={e=>setForm({...form,regNumber:e.target.value})}/>
            </div>
            <div>
              <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase" }}>Organisation Type *</label>
              <select style={inp} value={form.orgType} onChange={e=>setForm({...form,orgType:e.target.value})}>
                <option value="">Select...</option>
                {["Federal Government","State Government","Commercial Bank","Microfinance Bank","NGO / Development Org","International Donor","Agribusiness"].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <div>
              <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase" }}>Official Email *</label>
              <input style={inp} type="email" placeholder="admin@org.gov.ng" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
            </div>
            <div>
              <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase" }}>Phone Number *</label>
              <input style={inp} placeholder="+234 800 000 0000" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
            </div>
          </div>
          <div>
            <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase" }}>Primary State *</label>
            <select style={inp} value={form.state} onChange={e=>setForm({...form,state:e.target.value})}>
              <option value="">Select state...</option>
              {nigerianStates.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ background:dark?"#0a2010":"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"10px 14px" }}>
            <p style={{ fontSize:12,color:"#16a34a",fontWeight:600,margin:0 }}>🔒 We verify all organisations before activation — within 24 hours.</p>
          </div>
        </div>
      )}

      {step===1 && (
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <div>
              <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase" }}>First Name *</label>
              <input style={inp} placeholder="e.g. Emeka" value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})}/>
            </div>
            <div>
              <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase" }}>Last Name *</label>
              <input style={inp} placeholder="e.g. Okonkwo" value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})}/>
            </div>
          </div>
          <div>
            <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase" }}>Your Role / Title *</label>
            <input style={inp} placeholder="e.g. Director, Agri-Finance" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}/>
          </div>
          <div>
            <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase" }}>Password *</label>
            <input style={inp} type="password" placeholder="Min 8 chars, 1 number, 1 symbol" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
            {form.password && (
              <div style={{ display:"flex",gap:4,marginTop:6 }}>
                {["8+ chars","Number","Symbol","Strong"].map((l,i)=>(
                  <div key={l} style={{ flex:1,textAlign:"center" }}>
                    <div style={{ height:4,borderRadius:4,background:pwChecks[i]?"#16a34a":T.border,marginBottom:3 }}/>
                    <span style={{ fontSize:9,color:pwChecks[i]?"#16a34a":T.muted }}>{l}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase" }}>Confirm Password *</label>
            <input style={inp} type="password" placeholder="Re-enter password" value={form.confirm} onChange={e=>setForm({...form,confirm:e.target.value})}/>
            {form.confirm && <p style={{ fontSize:12,color:form.password===form.confirm?"#16a34a":"#ef4444",margin:"4px 0 0" }}>{form.password===form.confirm?"✓ Passwords match":"✗ Passwords do not match"}</p>}
          </div>
          <div style={{ background:dark?"#0d1a30":"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,padding:"10px 14px" }}>
            <p style={{ fontSize:12,color:"#2563eb",fontWeight:600,margin:"0 0 2px" }}>Two-factor authentication required</p>
            <p style={{ fontSize:11,color:T.muted,margin:0 }}>You'll set up 2FA on your first login — mandatory for all lender accounts.</p>
          </div>
        </div>
      )}

      {step===2 && (
        <div>
          <div style={{ display:"flex",justifyContent:"center",alignItems:"center",gap:10,marginBottom:24 }}>
            <span style={{ fontSize:13,color:T.muted,fontWeight:600 }}>Monthly</span>
            <div onClick={()=>setAnn(!annual)} style={{ width:46,height:24,borderRadius:12,background:annual?"#1B5E20":"#9ca3af",cursor:"pointer",position:"relative",transition:"background 0.25s" }}>
              <div style={{ width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:annual?24:3,transition:"left 0.25s" }}/>
            </div>
            <span style={{ fontSize:13,color:T.muted,fontWeight:600 }}>Annual</span>
            <span style={{ background:"#F9A825",color:"#1B5E20",fontSize:11,fontWeight:800,padding:"2px 10px",borderRadius:20 }}>Save 20%</span>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14 }}>
            {plans.map(({id,label,price,desc,feats,hot})=>(
              <div key={id} onClick={()=>setPlan(id)} style={{ border:`2px solid ${plan===id?"#1B5E20":T.border}`,borderRadius:16,padding:18,cursor:"pointer",background:plan===id?(dark?"#0a2010":"#f0fdf4"):T.surface,position:"relative",transition:"all 0.2s" }}>
                {hot && <div style={{ position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",background:"#F9A825",color:"#1B5E20",fontSize:9,fontWeight:800,padding:"2px 10px",borderRadius:10,whiteSpace:"nowrap" }}>POPULAR</div>}
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
                  <h3 style={{ fontSize:16,fontWeight:800,color:T.text,margin:0 }}>{label}</h3>
                  <div style={{ width:18,height:18,borderRadius:"50%",border:`2px solid ${plan===id?"#1B5E20":T.border}`,display:"flex",alignItems:"center",justifyContent:"center" }}>
                    {plan===id && <div style={{ width:8,height:8,borderRadius:"50%",background:"#1B5E20" }}/>}
                  </div>
                </div>
                <p style={{ fontSize:11,color:T.muted,margin:"0 0 10px" }}>{desc}</p>
                <p style={{ fontSize:price?22:16,fontWeight:900,color:"#1B5E20",margin:"0 0 10px" }}>
                  {price?`₦${annual?Math.round(price*0.8):price}K/mo`:"Custom"}
                </p>
                {feats.map(f=>(
                  <div key={f} style={{ display:"flex",gap:6,alignItems:"center",marginBottom:6 }}>
                    <Check size={11} color="#16a34a"/>
                    <span style={{ fontSize:11,color:T.muted }}>{f}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {step===3 && (
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <div style={{ background:dark?"#0a2010":"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:12,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <div>
              <p style={{ fontSize:13,fontWeight:700,color:T.text,margin:"0 0 2px" }}>Growth Plan · {annual?"Annual":"Monthly"}</p>
              <p style={{ fontSize:12,color:T.muted,margin:0 }}>Up to 5,000 borrowers · Unlimited programs</p>
            </div>
            <p style={{ fontSize:18,fontWeight:800,color:"#1B5E20",margin:0 }}>₦{annual?"7,200K/yr":"750K/mo"}</p>
          </div>
          <div style={{ display:"flex",gap:10 }}>
            {["💳 Card","🏦 Bank Transfer","📱 Paystack"].map((m,i)=>(
              <button key={m} style={{ flex:1,padding:"9px",borderRadius:10,border:`2px solid ${i===2?"#1B5E20":T.border}`,background:i===2?(dark?"#0a2010":"#f0fdf4"):T.inputBg,color:i===2?"#1B5E20":T.muted,fontSize:12,fontWeight:i===2?700:400,cursor:"pointer" }}>{m}</button>
            ))}
          </div>
          <div style={{ background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:14,padding:16,display:"flex",flexDirection:"column",gap:12 }}>
            <div>
              <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase" }}>Card Number</label>
              <div style={{ display:"flex",alignItems:"center",gap:10,background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 14px" }}>
                <input style={{ flex:1,background:"none",border:"none",outline:"none",fontSize:14,color:T.text,letterSpacing:"0.1em" }} placeholder="1234  5678  9012  3456" value={form.cardNumber} onChange={e=>setForm({...form,cardNumber:e.target.value})} maxLength={19}/>
                <span style={{ fontSize:18 }}>💳</span>
              </div>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10 }}>
              {[["expiry","Expiry","MM/YY"],["cvv","CVV","•••"],["billing","Post Code","900001"]].map(([k,l,ph])=>(
                <div key={k}>
                  <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase" }}>{l}</label>
                  <input style={inp} placeholder={ph} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:"flex",gap:8,padding:"10px 14px",background:dark?"#1a1a00":"#fefce8",border:"1px solid #fde68a",borderRadius:10 }}>
            <span>🔒</span>
            <p style={{ fontSize:12,color:T.muted,margin:0 }}>Payments encrypted via Paystack. AgroTrack never stores card details.</p>
          </div>
          {loading && <p style={{ fontSize:14,color:"#1B5E20",fontWeight:600,textAlign:"center" }}>Processing payment...</p>}
        </div>
      )}

      {step===4 && (
        <div style={{ textAlign:"center",padding:"20px 0" }}>
          <div style={{ width:80,height:80,borderRadius:"50%",background:"linear-gradient(135deg,#1B5E20,#2E7D32)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px" }}>
            <CheckCircle size={40} color="#F9A825"/>
          </div>
          <h2 style={{ fontSize:24,fontWeight:800,color:T.text,margin:"0 0 10px" }}>Account Created! 🎉</h2>
          <p style={{ fontSize:14,color:T.muted,margin:"0 0 24px" }}>Welcome to AgroTrack, {form.firstName||"there"}. A verification email has been sent to <strong style={{ color:T.text }}>{form.email||"your email"}</strong>.</p>
          <div style={{ background:dark?"#0a2010":"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:14,padding:"16px 20px",marginBottom:24,textAlign:"left" }}>
            <p style={{ fontSize:13,fontWeight:700,color:"#1B5E20",margin:"0 0 10px" }}>What happens next</p>
            {["Organisation verification within 24 hrs","Activation email to confirm account","Set up your first loan program","Field agents start registering farmers"].map((s,i)=>(
              <div key={i} style={{ display:"flex",gap:8,marginBottom:8 }}>
                <div style={{ width:20,height:20,borderRadius:"50%",background:"#1B5E20",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  <span style={{ fontSize:10,fontWeight:700,color:"#fff" }}>{i+1}</span>
                </div>
                <span style={{ fontSize:13,color:T.muted }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display:"flex",gap:10,marginTop:24 }}>
        {step>0 && step<4 && (
          <button onClick={()=>setStep(s=>s-1)} style={{ flex:1,padding:"12px",borderRadius:12,border:`1px solid ${T.border}`,background:"none",color:T.muted,fontSize:14,cursor:"pointer" }}>← Back</button>
        )}
        {step<4 && (
          <button onClick={next} disabled={loading} style={{ flex:step>0?2:1,padding:"12px",borderRadius:12,border:"none",background:loading?"#9ca3af":"linear-gradient(135deg,#1B5E20,#2E7D32)",color:"#fff",fontSize:14,fontWeight:700,cursor:loading?"default":"pointer",boxShadow:loading?"none":"0 4px 16px rgba(27,94,32,0.3)" }}>
            {loading?"Processing...":step===3?"🚀 Complete & Launch":"Continue →"}
          </button>
        )}
        {step===4 && (
          <button onClick={()=>setView("lender-setup")} style={{ flex:1,padding:"12px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#1B5E20,#2E7D32)",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer" }}>
            Set Up My First Program →
          </button>
        )}
      </div>
      {step===0 && <p style={{ textAlign:"center",fontSize:13,color:T.muted,marginTop:20,marginBottom:0 }}>Have an account? <button onClick={()=>setAuthView("login")} style={{ color:"#1B5E20",fontWeight:700,background:"none",border:"none",cursor:"pointer" }}>Sign in</button></p>}
    </AuthShell>
  );
}

// ─── LENDER SETUP WIZARD ─────────────────────────────────────────────────────
function LenderSetupWizard({ dark, setView }) {
  const T = dark ? theme.dark : theme.light;
  const [step,setStep] = useState(0);
  const [form,setForm] = useState({ progName:"",progType:"Loan",totalFund:"",crops:[],minLoan:"",maxLoan:"",interest:"",duration:"12",layers:[{name:"Land Preparation",pct:"30",trigger:"Loan Approval"},{name:"Planting & Inputs",pct:"40",trigger:"Layer 1 report submitted"},{name:"Crop Maintenance",pct:"30",trigger:"Crop growth confirmed"}],agentName:"",agentPhone:"",agentState:"" });
  const inp = { width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:10,padding:"11px 14px",fontSize:14,color:T.text,outline:"none",boxSizing:"border-box" };
  const steps = ["Welcome","First Program","Disbursement Layers","Invite Agent","You're Live!"];
  const crops = ["Rice","Cassava","Maize","Yam","Cocoa","Cashew","Tomato","Oil Palm","Other"];
  const toggle = (arr,val) => arr.includes(val)?arr.filter(v=>v!==val):[...arr,val];
  const layerCols = [{bg:dark?"#0a2010":"#dcfce7",c:"#16a34a"},{bg:dark?"#0d1a30":"#dbeafe",c:"#2563eb"},{bg:dark?"#2d1a00":"#fef3c7",c:"#d97706"}];

  return (
    <AuthShell dark={dark} wide={step===2}>
      <div style={{ textAlign:"center",marginBottom:6 }}>
        <h1 style={{ fontSize:22,fontWeight:800,color:T.text,margin:"0 0 4px" }}>{steps[step]}</h1>
        <p style={{ fontSize:13,color:T.muted,margin:"0 0 20px" }}>Step {step+1} of {steps.length}</p>
      </div>
      <StepDots total={steps.length} current={step} dark={dark}/>

      {step===0 && (
        <div style={{ textAlign:"center",padding:"10px 0 20px" }}>
          <p style={{ fontSize:56,margin:"0 0 16px" }}>🌾</p>
          <p style={{ fontSize:15,color:T.muted,lineHeight:1.75,margin:"0 0 24px" }}>Welcome! This 4-step wizard launches your first agricultural loan program in under 10 minutes.</p>
          {[{n:"01",t:"Create your first program",d:"Fund pool, eligibility, loan terms"},{n:"02",t:"Set disbursement layers",d:"Define tranche release triggers"},{n:"03",t:"Invite a field agent",d:"Register & verify farmers on the ground"},{n:"04",t:"Go live",d:"Farmers can start applying immediately"}].map(({n,t,d})=>(
            <div key={n} style={{ display:"flex",gap:12,alignItems:"flex-start",padding:"12px 14px",background:dark?"#1f2937":"#f9fafb",borderRadius:12,marginBottom:8,textAlign:"left" }}>
              <div style={{ width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#1B5E20,#2E7D32)",display:"flex",alignItems:"center",justifyContent:"center",color:"#F9A825",fontSize:11,fontWeight:800,flexShrink:0 }}>{n}</div>
              <div><p style={{ fontSize:13,fontWeight:700,color:T.text,margin:"0 0 2px" }}>{t}</p><p style={{ fontSize:12,color:T.muted,margin:0 }}>{d}</p></div>
            </div>
          ))}
        </div>
      )}

      {step===1 && (
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <div>
            <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase" }}>Program Name *</label>
            <input style={inp} placeholder="e.g. CBN Rice Farmers Support Fund 2025" value={form.progName} onChange={e=>setForm({...form,progName:e.target.value})}/>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <div>
              <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase" }}>Type</label>
              <select style={inp} value={form.progType} onChange={e=>setForm({...form,progType:e.target.value})}><option>Loan</option><option>Grant</option><option>Hybrid</option></select>
            </div>
            <div>
              <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase" }}>Total Fund (₦M)</label>
              <input style={inp} type="number" placeholder="e.g. 500" value={form.totalFund} onChange={e=>setForm({...form,totalFund:e.target.value})}/>
            </div>
            <div>
              <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase" }}>Min Loan (₦)</label>
              <input style={inp} type="number" placeholder="50,000" value={form.minLoan} onChange={e=>setForm({...form,minLoan:e.target.value})}/>
            </div>
            <div>
              <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase" }}>Max Loan (₦)</label>
              <input style={inp} type="number" placeholder="2,000,000" value={form.maxLoan} onChange={e=>setForm({...form,maxLoan:e.target.value})}/>
            </div>
            <div>
              <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase" }}>Interest % p.a.</label>
              <input style={inp} type="number" placeholder="9" value={form.interest} onChange={e=>setForm({...form,interest:e.target.value})}/>
            </div>
            <div>
              <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase" }}>Duration</label>
              <select style={inp} value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})}>{[3,6,9,12,18,24,36].map(m=><option key={m} value={m}>{m} months</option>)}</select>
            </div>
          </div>
          <div>
            <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:8,textTransform:"uppercase" }}>Eligible Crops</label>
            <div style={{ display:"flex",flexWrap:"wrap",gap:7 }}>
              {crops.map(c=>(
                <button key={c} onClick={()=>setForm({...form,crops:toggle(form.crops,c)})} style={{ fontSize:12,padding:"5px 12px",borderRadius:20,border:`1px solid ${form.crops.includes(c)?"#1B5E20":T.border}`,background:form.crops.includes(c)?(dark?"#0a2010":"#dcfce7"):T.inputBg,color:form.crops.includes(c)?"#16a34a":T.muted,cursor:"pointer",fontWeight:form.crops.includes(c)?600:400 }}>{c}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step===2 && (
        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          <div style={{ background:dark?"#0d1a30":"#eff6ff",border:"1px solid #bfdbfe",borderRadius:12,padding:"12px 16px",marginBottom:4 }}>
            <p style={{ fontSize:13,fontWeight:700,color:"#2563eb",margin:"0 0 3px" }}>💡 Layered disbursement reduces fund diversion by 67%</p>
            <p style={{ fontSize:12,color:T.muted,margin:0 }}>Each tranche only releases when the previous one is verified through farm activity reports.</p>
          </div>
          {form.layers.map((layer,i)=>{
            const lc = layerCols[i]||layerCols[0];
            return (
              <div key={i} style={{ border:`1px solid ${T.border}`,borderRadius:14,padding:16 }}>
                <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
                  <div style={{ width:28,height:28,borderRadius:"50%",background:lc.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:lc.c }}>{i+1}</div>
                  <span style={{ fontSize:14,fontWeight:700,color:T.text }}>Layer {i+1}</span>
                  <span style={{ marginLeft:"auto",fontSize:13,fontWeight:700,color:lc.c }}>{layer.pct}%</span>
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 80px",gap:10,marginBottom:10 }}>
                  <div>
                    <label style={{ fontSize:10,color:T.muted,display:"block",marginBottom:4,textTransform:"uppercase" }}>Layer Name</label>
                    <input style={inp} value={layer.name} onChange={e=>{const l=[...form.layers];l[i]={...l[i],name:e.target.value};setForm({...form,layers:l});}}/>
                  </div>
                  <div>
                    <label style={{ fontSize:10,color:T.muted,display:"block",marginBottom:4,textTransform:"uppercase" }}>% Share</label>
                    <input style={inp} type="number" value={layer.pct} onChange={e=>{const l=[...form.layers];l[i]={...l[i],pct:e.target.value};setForm({...form,layers:l});}}/>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize:10,color:T.muted,display:"block",marginBottom:4,textTransform:"uppercase" }}>Release Trigger</label>
                  <input style={inp} value={layer.trigger} onChange={e=>{const l=[...form.layers];l[i]={...l[i],trigger:e.target.value};setForm({...form,layers:l});}}/>
                </div>
              </div>
            );
          })}
          <button onClick={()=>setForm({...form,layers:[...form.layers,{name:"",pct:"",trigger:""}]})} style={{ border:`1px dashed ${T.border}`,borderRadius:12,padding:"11px",background:"none",color:T.muted,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
            + Add another layer
          </button>
        </div>
      )}

      {step===3 && (
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <p style={{ fontSize:14,color:T.muted,margin:0,lineHeight:1.7 }}>Field agents register farmers in remote areas, verify farms via GPS, and submit photo reports. Invite your first agent below.</p>
          <div>
            <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase" }}>Agent Full Name *</label>
            <input style={inp} placeholder="e.g. Ibrahim Salisu" value={form.agentName} onChange={e=>setForm({...form,agentName:e.target.value})}/>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <div>
              <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase" }}>Phone Number *</label>
              <input style={inp} placeholder="+234 803 000 0000" value={form.agentPhone} onChange={e=>setForm({...form,agentPhone:e.target.value})}/>
            </div>
            <div>
              <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase" }}>Zone / State</label>
              <input style={inp} placeholder="e.g. Kebbi State" value={form.agentState} onChange={e=>setForm({...form,agentState:e.target.value})}/>
            </div>
          </div>
          <div style={{ background:dark?"#0a2010":"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:12,padding:"12px 16px" }}>
            <p style={{ fontSize:13,fontWeight:700,color:"#16a34a",margin:"0 0 4px" }}>How agents get started</p>
            <p style={{ fontSize:12,color:T.muted,margin:0 }}>We'll SMS {form.agentName||"your agent"} a download link for the AgroTrack Field Agent app. They register and get auto-assigned to your programs.</p>
          </div>
          <p style={{ fontSize:12,color:T.muted,margin:0 }}>💡 You can invite more agents from the Field Agents page at any time.</p>
        </div>
      )}

      {step===4 && (
        <div style={{ textAlign:"center",padding:"10px 0 20px" }}>
          <p style={{ fontSize:64,margin:"0 0 16px" }}>🚀</p>
          <h2 style={{ fontSize:22,fontWeight:800,color:T.text,margin:"0 0 10px" }}>You're all set!</h2>
          <p style={{ fontSize:14,color:T.muted,margin:"0 0 28px",lineHeight:1.7 }}>
            <strong style={{ color:T.text }}>{form.progName||"Your program"}</strong> is live. {form.agentName||"Your agent"} has been invited. Farmers can start applying immediately.
          </p>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:28,textAlign:"left" }}>
            {[{i:"🏛️",t:"Program Live",d:form.progName||"First program created"},{i:"🔐",t:`${form.layers.length} Layers Set`,d:"Layered disbursement active"},{i:"👨‍💼",t:"Agent Invited",d:form.agentName||"Notification sent"},{i:"📊",t:"FarmScore Active",d:"Auto-scoring enabled"}].map(({i,t,d})=>(
              <div key={t} style={{ background:dark?"#0a2010":"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:12,padding:"14px 16px",display:"flex",gap:10 }}>
                <span style={{ fontSize:22 }}>{i}</span>
                <div><p style={{ fontSize:13,fontWeight:700,color:"#16a34a",margin:0 }}>{t}</p><p style={{ fontSize:12,color:T.muted,margin:0 }}>{d}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display:"flex",gap:10,marginTop:24 }}>
        {step>0 && step<4 && <button onClick={()=>setStep(s=>s-1)} style={{ flex:1,padding:"12px",borderRadius:12,border:`1px solid ${T.border}`,background:"none",color:T.muted,fontSize:14,cursor:"pointer" }}>← Back</button>}
        {step<4 && <button onClick={()=>setStep(s=>s+1)} style={{ flex:step>0?2:1,padding:"12px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#1B5E20,#2E7D32)",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 16px rgba(27,94,32,0.3)" }}>{step===3?"🚀 Launch Platform →":"Continue →"}</button>}
        {step===4 && <button onClick={()=>setView("lender")} style={{ flex:1,padding:"12px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#1B5E20,#2E7D32)",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer" }}>Open Dashboard →</button>}
      </div>
    </AuthShell>
  );
}

// ─── BORROWER REGISTRATION ────────────────────────────────────────────────────
function BorrowerRegister({ dark, setView }) {
  const T = dark ? theme.dark : theme.light;
  const [step,setStep] = useState(0);
  const [otp,setOtp]   = useState(["","","","","",""]);
  const [form,setForm] = useState({ phone:"",firstName:"",lastName:"",dob:"",gender:"",state:"",lga:"",bvn:"",nin:"",cropTypes:[],farmSize:"",farmUnit:"hectares",bankName:"",accountNumber:"" });
  const inp = { width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:10,padding:"11px 14px",fontSize:14,color:T.text,outline:"none",boxSizing:"border-box" };
  const steps = ["Phone & OTP","Your Identity","Farm Details","Bank Account","Done! 🌾"];
  const crops = ["Rice","Cassava","Maize","Yam","Cocoa","Cashew","Tomato","Pepper","Oil Palm","Vegetables","Other"];
  const toggle = (arr,val) => arr.includes(val)?arr.filter(v=>v!==val):[...arr,val];

  return (
    <AuthShell dark={dark}>
      {/* Language bar */}
      <div style={{ display:"flex",gap:6,marginBottom:20,justifyContent:"center" }}>
        {[["🇬🇧","English"],["🌍","Hausa"],["🌍","Yoruba"],["🌍","Igbo"],["🌍","Pidgin"]].map(([f,l],i)=>(
          <button key={l} style={{ fontSize:11,padding:"4px 10px",borderRadius:20,border:`1px solid ${i===0?"#1B5E20":T.border}`,background:i===0?(dark?"#0a2010":"#dcfce7"):T.inputBg,color:i===0?"#16a34a":T.muted,cursor:"pointer",fontWeight:i===0?600:400 }}>{f} {l}</button>
        ))}
      </div>
      <div style={{ textAlign:"center",marginBottom:6 }}>
        <h1 style={{ fontSize:22,fontWeight:800,color:T.text,margin:"0 0 4px" }}>{steps[step]}</h1>
        <p style={{ fontSize:13,color:T.muted,margin:"0 0 20px" }}>Step {step+1} of {steps.length}</p>
      </div>
      <StepDots total={steps.length} current={step} color="#16a34a" dark={dark}/>

      {step===0 && (
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <div>
            <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase" }}>Phone Number *</label>
            <div style={{ display:"flex",gap:8 }}>
              <div style={{ padding:"11px 10px",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:10,fontSize:13,color:T.text,flexShrink:0 }}>🇳🇬 +234</div>
              <input style={inp} placeholder="080 0000 0000" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} type="tel"/>
            </div>
          </div>
          <div>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
              <label style={{ fontSize:11,fontWeight:600,color:T.muted,textTransform:"uppercase" }}>OTP Code</label>
              <button style={{ fontSize:12,color:"#1B5E20",fontWeight:600,background:"none",border:"none",cursor:"pointer" }}>Resend code</button>
            </div>
            <div style={{ display:"flex",gap:8 }}>
              {otp.map((d,i)=>(
                <input key={i} maxLength={1} value={d} onChange={e=>{const n=[...otp];n[i]=e.target.value;setOtp(n);}} style={{ flex:1,background:T.inputBg,border:`2px solid ${d?"#16a34a":T.border}`,borderRadius:10,padding:"14px 4px",fontSize:20,fontWeight:700,color:T.text,textAlign:"center",outline:"none" }}/>
              ))}
            </div>
            <p style={{ fontSize:12,color:T.muted,marginTop:8,textAlign:"center" }}>OTP sent to {form.phone||"your number"}. Expires in 5 min.</p>
          </div>
          <div style={{ background:dark?"#0d1a30":"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,padding:"10px 14px" }}>
            <p style={{ fontSize:12,color:T.muted,margin:0 }}>No smartphone? Register via field agent or dial <strong>*737*99#</strong> for USSD.</p>
          </div>
        </div>
      )}

      {step===1 && (
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <div>
              <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase" }}>First Name *</label>
              <input style={inp} placeholder="e.g. Bello" value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})}/>
            </div>
            <div>
              <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase" }}>Last Name *</label>
              <input style={inp} placeholder="e.g. Musa" value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})}/>
            </div>
            <div>
              <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase" }}>Date of Birth</label>
              <input style={inp} type="date" value={form.dob} onChange={e=>setForm({...form,dob:e.target.value})}/>
            </div>
            <div>
              <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase" }}>Gender</label>
              <select style={inp} value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})}><option value="">Select...</option><option>Male</option><option>Female</option><option>Prefer not to say</option></select>
            </div>
          </div>
          <div style={{ background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:14,padding:16 }}>
            <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase" }}>BVN (Bank Verification Number) *</label>
            <div style={{ display:"flex",gap:8 }}>
              <input style={{ ...inp,letterSpacing:"0.15em" }} placeholder="12345678901" maxLength={11} value={form.bvn} onChange={e=>setForm({...form,bvn:e.target.value})}/>
              <button style={{ padding:"0 16px",borderRadius:10,border:"none",background:form.bvn.length===11?"#1B5E20":"#9ca3af",color:"#fff",fontSize:13,fontWeight:600,cursor:form.bvn.length===11?"pointer":"default",flexShrink:0 }}>{form.bvn.length===11?"✓ Done":"Verify"}</button>
            </div>
            {form.bvn.length===11 && <p style={{ fontSize:12,color:"#16a34a",fontWeight:600,margin:"6px 0 0" }}>✓ BVN verified — Bello Musa</p>}
          </div>
          <div style={{ background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:14,padding:16 }}>
            <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase" }}>NIN (National ID Number) *</label>
            <div style={{ display:"flex",gap:8 }}>
              <input style={{ ...inp,letterSpacing:"0.15em" }} placeholder="12345678901" maxLength={11} value={form.nin} onChange={e=>setForm({...form,nin:e.target.value})}/>
              <button style={{ padding:"0 16px",borderRadius:10,border:"none",background:form.nin.length===11?"#1B5E20":"#9ca3af",color:"#fff",fontSize:13,fontWeight:600,cursor:form.nin.length===11?"pointer":"default",flexShrink:0 }}>{form.nin.length===11?"✓ Done":"Verify"}</button>
            </div>
          </div>
        </div>
      )}

      {step===2 && (
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <div>
              <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase" }}>State</label>
              <select style={inp} value={form.state} onChange={e=>setForm({...form,state:e.target.value})}><option value="">Select...</option>{["Benue","Ekiti","Kebbi","Kaduna","Kogi","Lagos","Niger","Oyo","Taraba","Others"].map(s=><option key={s}>{s}</option>)}</select>
            </div>
            <div>
              <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase" }}>LGA</label>
              <input style={inp} placeholder="e.g. Birnin Kebbi" value={form.lga} onChange={e=>setForm({...form,lga:e.target.value})}/>
            </div>
          </div>
          <div style={{ background:dark?"#0d1a30":"#eff6ff",border:"1px solid #bfdbfe",borderRadius:12,padding:14 }}>
            <p style={{ fontSize:13,fontWeight:700,color:"#2563eb",margin:"0 0 8px" }}>📍 Farm GPS Location</p>
            <div style={{ display:"flex",gap:8 }}>
              <input style={inp} defaultValue="12.4539° N, 4.1975° E" readOnly/>
              <button style={{ padding:"0 14px",borderRadius:10,border:"none",background:"#2563eb",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",flexShrink:0 }}>📍 GPS</button>
            </div>
          </div>
          <div>
            <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase" }}>Farm Size</label>
            <div style={{ display:"flex",gap:8 }}>
              <input style={inp} type="number" placeholder="e.g. 5.1" value={form.farmSize} onChange={e=>setForm({...form,farmSize:e.target.value})}/>
              <select style={{ ...inp,width:120 }} value={form.farmUnit} onChange={e=>setForm({...form,farmUnit:e.target.value})}><option>hectares</option><option>acres</option><option>plots</option></select>
            </div>
          </div>
          <div>
            <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:8,textTransform:"uppercase" }}>Crops Grown</label>
            <div style={{ display:"flex",flexWrap:"wrap",gap:7 }}>
              {crops.map(c=><button key={c} onClick={()=>setForm({...form,cropTypes:toggle(form.cropTypes,c)})} style={{ fontSize:12,padding:"5px 12px",borderRadius:20,border:`1px solid ${form.cropTypes.includes(c)?"#1B5E20":T.border}`,background:form.cropTypes.includes(c)?(dark?"#0a2010":"#dcfce7"):T.inputBg,color:form.cropTypes.includes(c)?"#16a34a":T.muted,cursor:"pointer",fontWeight:form.cropTypes.includes(c)?600:400 }}>{c}</button>)}
            </div>
          </div>
          <div>
            <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:8,textTransform:"uppercase" }}>Farm Photos (min. 3)</label>
            <div style={{ display:"flex",gap:8 }}>
              {[1,2,3].map(n=><div key={n} style={{ flex:1,aspectRatio:"1",borderRadius:12,background:T.inputBg,border:`1px dashed ${T.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,cursor:"pointer" }}><Camera size={20} color={T.muted}/><span style={{ fontSize:11,color:T.muted }}>Photo {n}</span></div>)}
            </div>
          </div>
        </div>
      )}

      {step===3 && (
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <div>
            <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase" }}>Bank Name *</label>
            <select style={inp} value={form.bankName} onChange={e=>setForm({...form,bankName:e.target.value})}><option value="">Select your bank...</option>{["Access Bank","First Bank","GTBank","UBA","Zenith Bank","Kuda Bank","OPay","PalmPay","Moniepoint","Other"].map(b=><option key={b}>{b}</option>)}</select>
          </div>
          <div>
            <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase" }}>Account Number *</label>
            <div style={{ display:"flex",gap:8 }}>
              <input style={{ ...inp,letterSpacing:"0.1em" }} placeholder="0123456789" maxLength={10} value={form.accountNumber} onChange={e=>setForm({...form,accountNumber:e.target.value})}/>
              <button style={{ padding:"0 14px",borderRadius:10,border:"none",background:form.accountNumber.length===10?"#1B5E20":"#9ca3af",color:"#fff",fontSize:13,fontWeight:600,cursor:form.accountNumber.length===10?"pointer":"default",flexShrink:0 }}>Verify</button>
            </div>
            {form.accountNumber.length===10 && <p style={{ fontSize:12,color:"#16a34a",fontWeight:600,margin:"6px 0 0" }}>✓ BELLO MUSA — First Bank</p>}
          </div>
          <div style={{ background:dark?"#0a2010":"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:12,padding:14 }}>
            <p style={{ fontSize:13,fontWeight:700,color:"#16a34a",margin:"0 0 4px" }}>No bank account?</p>
            <div style={{ display:"flex",gap:8 }}>{["OPay","PalmPay","Moniepoint"].map(m=><button key={m} style={{ fontSize:12,padding:"4px 12px",borderRadius:20,border:`1px solid ${T.border}`,background:T.inputBg,color:T.muted,cursor:"pointer" }}>{m}</button>)}</div>
          </div>
          <div style={{ display:"flex",gap:8,padding:"10px 14px",background:dark?"#1a1a00":"#fefce8",border:"1px solid #fde68a",borderRadius:10 }}>
            <span>🔒</span>
            <p style={{ fontSize:12,color:T.muted,margin:0 }}>Details encrypted. Used only for loan disbursements.</p>
          </div>
        </div>
      )}

      {step===4 && (
        <div style={{ textAlign:"center",padding:"10px 0 20px" }}>
          <div style={{ width:80,height:80,borderRadius:"50%",background:"linear-gradient(135deg,#1B5E20,#2E7D32)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px" }}>
            <CheckCircle size={40} color="#F9A825"/>
          </div>
          <h2 style={{ fontSize:22,fontWeight:800,color:T.text,margin:"0 0 10px" }}>Welcome, {form.firstName||"Farmer"}! 🌾</h2>
          <p style={{ fontSize:14,color:T.muted,margin:"0 0 24px" }}>Your profile is ready. Browse programs and apply for your first loan.</p>
          <div style={{ background:"linear-gradient(135deg,#1B5E20,#2E7D32)",borderRadius:16,padding:20,marginBottom:20 }}>
            <p style={{ color:"rgba(255,255,255,0.7)",fontSize:12,margin:"0 0 4px",textTransform:"uppercase",fontWeight:600 }}>Your Starting FarmScore</p>
            <p style={{ color:"#F9A825",fontSize:48,fontWeight:900,margin:"0 0 4px" }}>520</p>
            <span style={{ background:"rgba(255,255,255,0.2)",color:"#fff",fontSize:11,fontWeight:700,padding:"3px 12px",borderRadius:20 }}>🥈 Silver — keep growing!</span>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,textAlign:"left" }}>
            {[{i:"🔍",t:"Browse programs",d:"See loans you qualify for"},{i:"📸",t:"Submit farm report",d:"+15 FarmScore points"},{i:"📱",t:"Download app",d:"AgroTrack farmer app"},{i:"💬",t:"USSD access",d:"Dial *737*99# anytime"}].map(({i,t,d})=>(
              <div key={t} style={{ background:dark?"#1f2937":"#f9fafb",border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 14px",display:"flex",gap:10 }}>
                <span style={{ fontSize:20 }}>{i}</span>
                <div><p style={{ fontSize:13,fontWeight:700,color:T.text,margin:0 }}>{t}</p><p style={{ fontSize:11,color:T.muted,margin:0 }}>{d}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display:"flex",gap:10,marginTop:24 }}>
        {step>0 && step<4 && <button onClick={()=>setStep(s=>s-1)} style={{ flex:1,padding:"12px",borderRadius:12,border:`1px solid ${T.border}`,background:"none",color:T.muted,fontSize:14,cursor:"pointer" }}>← Back</button>}
        {step<4 && <button onClick={()=>setStep(s=>s+1)} style={{ flex:step>0?2:1,padding:"12px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#1B5E20,#2E7D32)",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 16px rgba(27,94,32,0.3)" }}>{step===3?"Complete Registration 🌾":"Continue →"}</button>}
        {step===4 && <button onClick={()=>setView("borrower")} style={{ flex:1,padding:"12px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#1B5E20,#2E7D32)",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer" }}>Open Dashboard →</button>}
      </div>
      {step===0 && <p style={{ textAlign:"center",fontSize:13,color:T.muted,marginTop:18,marginBottom:0 }}>Already registered? <button onClick={()=>setView("borrower")} style={{ color:"#1B5E20",fontWeight:700,background:"none",border:"none",cursor:"pointer" }}>Sign in</button></p>}
    </AuthShell>
  );
}

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
function ForgotPassword({ dark, setAuthView }) {
  const T = dark ? theme.dark : theme.light;
  const [step,setStep]   = useState(0);
  const [email,setEmail] = useState("");
  const [otp,setOtp]     = useState(["","","","","",""]);
  const [pw,setPw]       = useState("");
  const [conf,setConf]   = useState("");
  const inp = { width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:10,padding:"11px 14px",fontSize:14,color:T.text,outline:"none",boxSizing:"border-box" };
  const titles = ["Reset Password","Enter OTP","New Password","Done! ✅"];
  const subs   = ["Enter your work email","OTP sent to "+email,"Choose a strong new password","You can sign in with your new password"];
  return (
    <AuthShell dark={dark}>
      <div style={{ textAlign:"center",marginBottom:24 }}>
        <div style={{ width:52,height:52,background:dark?"#0d1a30":"#dbeafe",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",fontSize:26 }}>🔐</div>
        <h1 style={{ fontSize:22,fontWeight:800,color:T.text,margin:"0 0 6px" }}>{titles[step]}</h1>
        <p style={{ fontSize:13,color:T.muted,margin:0 }}>{subs[step]}</p>
      </div>
      <StepDots total={4} current={step} color="#2563eb" dark={dark}/>

      {step===0 && (
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <div>
            <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase" }}>Work Email</label>
            <input style={inp} type="email" placeholder="you@organisation.gov.ng" value={email} onChange={e=>setEmail(e.target.value)}/>
          </div>
          <button onClick={()=>email&&setStep(1)} style={{ padding:"13px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#2563eb,#1d4ed8)",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer" }}>Send Reset Code →</button>
        </div>
      )}

      {step===1 && (
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <div>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:8 }}>
              <label style={{ fontSize:11,fontWeight:600,color:T.muted,textTransform:"uppercase" }}>6-Digit OTP</label>
              <button style={{ fontSize:12,color:"#2563eb",fontWeight:600,background:"none",border:"none",cursor:"pointer" }}>Resend</button>
            </div>
            <div style={{ display:"flex",gap:8 }}>
              {otp.map((d,i)=><input key={i} maxLength={1} value={d} onChange={e=>{const n=[...otp];n[i]=e.target.value;setOtp(n);}} style={{ flex:1,background:T.inputBg,border:`2px solid ${d?"#2563eb":T.border}`,borderRadius:10,padding:"14px 4px",fontSize:20,fontWeight:700,color:T.text,textAlign:"center",outline:"none" }}/>)}
            </div>
          </div>
          <button onClick={()=>setStep(2)} style={{ padding:"13px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#2563eb,#1d4ed8)",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer" }}>Verify →</button>
        </div>
      )}

      {step===2 && (
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          {[["New Password",pw,setPw],["Confirm Password",conf,setConf]].map(([l,v,set])=>(
            <div key={l}>
              <label style={{ fontSize:11,fontWeight:600,color:T.muted,display:"block",marginBottom:5,textTransform:"uppercase" }}>{l}</label>
              <input style={inp} type="password" placeholder="Min 8 characters" value={v} onChange={e=>set(e.target.value)}/>
            </div>
          ))}
          {pw && conf && <p style={{ fontSize:12,color:pw===conf?"#16a34a":"#ef4444",margin:0 }}>{pw===conf?"✓ Passwords match":"✗ Passwords do not match"}</p>}
          <button onClick={()=>pw&&conf&&pw===conf&&setStep(3)} style={{ padding:"13px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#1B5E20,#2E7D32)",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer" }}>Set New Password →</button>
        </div>
      )}

      {step===3 && (
        <div style={{ textAlign:"center" }}>
          <p style={{ fontSize:56,margin:"0 0 16px" }}>✅</p>
          <p style={{ fontSize:14,color:T.muted,margin:"0 0 24px" }}>Password updated successfully. Sign in with your new credentials.</p>
          <button onClick={()=>setAuthView("login")} style={{ width:"100%",padding:"13px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#1B5E20,#2E7D32)",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer" }}>Sign In →</button>
        </div>
      )}
      {step<3 && <p style={{ textAlign:"center",fontSize:13,color:T.muted,marginTop:20,marginBottom:0 }}><button onClick={()=>setAuthView("login")} style={{ color:"#1B5E20",fontWeight:700,background:"none",border:"none",cursor:"pointer" }}>← Back to sign in</button></p>}
    </AuthShell>
  );
}

// ─── 2FA SCREEN ───────────────────────────────────────────────────────────────
function TwoFactorAuth({ dark, setView, setAuthView }) {
  const T = dark ? theme.dark : theme.light;
  const [code,setCode]     = useState(["","","","","",""]);
  const [method,setMethod] = useState("app");
  const [loading,setLoad]  = useState(false);
  const allFilled = code.every(d=>d!=="");
  const verify = () => { if(!allFilled) return; setLoad(true); setTimeout(()=>{ setLoad(false); setView("lender"); },1000); };
  return (
    <AuthShell dark={dark}>
      <div style={{ textAlign:"center",marginBottom:24 }}>
        <div style={{ width:64,height:64,background:"linear-gradient(135deg,#1B5E20,#2E7D32)",borderRadius:18,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:28 }}>🔐</div>
        <h1 style={{ fontSize:22,fontWeight:800,color:T.text,margin:"0 0 6px" }}>Two-Factor Authentication</h1>
        <p style={{ fontSize:13,color:T.muted,margin:0 }}>Enter the 6-digit code to verify your identity</p>
      </div>
      <div style={{ display:"flex",gap:8,marginBottom:24 }}>
        {[{k:"app",l:"Authenticator App",i:"📱"},{k:"sms",l:"SMS Code",i:"💬"},{k:"email",l:"Email OTP",i:"📧"}].map(({k,l,i})=>(
          <button key={k} onClick={()=>setMethod(k)} style={{ flex:1,padding:"9px 6px",borderRadius:10,border:`2px solid ${method===k?"#1B5E20":T.border}`,background:method===k?(dark?"#0a2010":"#f0fdf4"):T.inputBg,color:method===k?"#1B5E20":T.muted,fontSize:11,fontWeight:method===k?700:400,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
            <span style={{ fontSize:18 }}>{i}</span>{l}
          </button>
        ))}
      </div>
      <div style={{ display:"flex",gap:8,marginBottom:16 }}>
        {code.map((d,i)=>(
          <input key={i} maxLength={1} value={d} onChange={e=>{const n=[...code];n[i]=e.target.value;setCode(n);}} style={{ flex:1,background:T.inputBg,border:`2px solid ${d?"#1B5E20":T.border}`,borderRadius:12,padding:"16px 4px",fontSize:22,fontWeight:800,color:T.text,textAlign:"center",outline:"none",transition:"border-color 0.15s" }}/>
        ))}
      </div>
      <p style={{ fontSize:12,color:T.muted,textAlign:"center",marginBottom:20 }}>
        {method==="app"&&"Open your authenticator app and enter the current 6-digit code."}
        {method==="sms"&&<>OTP sent via SMS — expires in 5 min. <button style={{ color:"#1B5E20",fontWeight:600,background:"none",border:"none",cursor:"pointer",fontSize:12 }}>Resend</button></>}
        {method==="email"&&"Check your inbox — OTP expires in 10 minutes."}
      </p>
      <button onClick={verify} disabled={!allFilled||loading} style={{ width:"100%",padding:"13px",borderRadius:12,border:"none",background:(!allFilled||loading)?"#9ca3af":"linear-gradient(135deg,#1B5E20,#2E7D32)",color:"#fff",fontSize:14,fontWeight:700,cursor:(!allFilled||loading)?"default":"pointer",boxShadow:allFilled&&!loading?"0 4px 16px rgba(27,94,32,0.35)":"none",transition:"all 0.2s" }}>
        {loading?"Verifying...":"Verify & Enter Dashboard →"}
      </button>
      <div style={{ display:"flex",gap:8,padding:"12px 14px",background:dark?"#1f2937":"#f9fafb",border:`1px solid ${T.border}`,borderRadius:12,marginTop:14 }}>
        <span>💡</span>
        <p style={{ fontSize:12,color:T.muted,margin:0 }}>Having trouble? <button onClick={()=>setAuthView&&setAuthView("forgot")} style={{ color:"#1B5E20",fontWeight:600,background:"none",border:"none",cursor:"pointer",fontSize:12 }}>Use backup code</button> or <button style={{ color:"#1B5E20",fontWeight:600,background:"none",border:"none",cursor:"pointer",fontSize:12 }}>contact support</button></p>
      </div>
    </AuthShell>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function AgroTrackPublic() {
  const [dark,setDark]         = useState(false);
  const [view,setView]         = useState("landing");
  const [page,setPage]         = useState("home");
  const [authView,setAuthView] = useState(null);

  const handleSetPage = (p) => { setPage(p); setView("landing"); setAuthView(null); };
  const handleSetView = (v) => { setView(v); setAuthView(null); };
  const T = dark ? theme.dark : theme.light;
  const onDark = !authView && view==="landing" && page==="home";

  return (
    <div style={{ minHeight:"100vh", fontFamily:"'Inter',system-ui,sans-serif" }}>
      {/* Dark mode toggle */}
      <div style={{ position:"fixed", top:16, right:20, zIndex:300 }}>
        <button onClick={()=>setDark(!dark)} style={{ width:38, height:38, borderRadius:10, border:`1px solid ${onDark?"rgba(255,255,255,0.2)":T.border}`, background:onDark?"rgba(0,0,0,0.3)":(dark?"#374151":"#fef9c3"), backdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.2s" }}>
          {dark ? <Sun size={16} color={onDark?"#F9A825":"#f59e0b"}/> : <Moon size={16} color={onDark?"#fff":"#374151"}/>}
        </button>
      </div>

      {/* Auth flows */}
      {authView==="login"             && <LenderLogin      dark={dark} setView={handleSetView} setAuthView={setAuthView}/>}
      {authView==="lender-signup"     && <LenderSignup     dark={dark} setView={handleSetView} setAuthView={setAuthView}/>}
      {authView==="borrower-register" && <BorrowerRegister dark={dark} setView={handleSetView}/>}
      {authView==="forgot"            && <ForgotPassword   dark={dark} setAuthView={setAuthView}/>}
      {authView==="2fa"               && <TwoFactorAuth    dark={dark} setView={handleSetView} setAuthView={setAuthView}/>}

      {/* Main views */}
      {!authView && view==="landing"      && <LandingPage dark={dark} setView={handleSetView} page={page} setPage={handleSetPage} setAuthView={setAuthView}/>}
      {!authView && view==="lender-setup" && <LenderSetupWizard dark={dark} setView={handleSetView}/>}
      {!authView && view==="borrower"     && <BorrowerDashboard dark={dark} setView={(v)=>{ setView(v); setPage("home"); setAuthView(null); }}/>}
      {!authView && view==="lender"       && (
        <div style={{ minHeight:"100vh", background:T.bg, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
          <p style={{ fontSize:18,fontWeight:700,color:T.text }}>✅ Login successful! Open <strong>agrotrack-full</strong> for the full lender dashboard.</p>
          <div style={{ display:"flex",gap:10 }}>
            <button onClick={()=>{ setView("landing"); setAuthView(null); }} style={{ padding:"10px 24px",borderRadius:10,border:`1px solid ${T.border}`,background:"none",color:T.muted,fontSize:13,cursor:"pointer" }}>← Back to Landing</button>
            <button onClick={()=>setAuthView("2fa")} style={{ padding:"10px 24px",borderRadius:10,border:"none",background:"#1B5E20",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer" }}>Test 2FA →</button>
          </div>
        </div>
      )}
    </div>
  );
}
