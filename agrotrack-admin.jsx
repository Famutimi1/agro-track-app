import { useState } from "react";
import {
  LayoutDashboard, Users, Banknote, Settings, Bell,
  Search, Moon, Sun, Menu, Leaf, Shield, Globe,
  TrendingUp, AlertTriangle, CheckCircle, XCircle,
  Eye, Edit, Trash2, ToggleLeft, ToggleRight,
  Download, Filter, MoreHorizontal, RefreshCw,
  MessageSquare, Flag, Star, Zap, Lock, Unlock,
  BarChart2, PieChart as PieIcon, Activity,
  ChevronDown, ChevronUp, Plus, ArrowUpRight,
  ArrowDownRight, Clock, DollarSign, Database,
  Server, Cpu, Wifi, HardDrive, AlertCircle
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";

// ─── THEME ───────────────────────────────────────────────────────────────────
const T = {
  light: { bg:"#f8fafc", surface:"#ffffff", border:"#e2e8f0", text:"#0f172a", muted:"#64748b", inputBg:"#f1f5f9", sidebarBg:"#0f172a", sidebarBorder:"#1e293b" },
  dark:  { bg:"#020617", surface:"#0f172a", border:"#1e293b", text:"#f8fafc", muted:"#94a3b8", inputBg:"#1e293b", sidebarBg:"#020617", sidebarBorder:"#0f172a" },
};

// ─── DATA ────────────────────────────────────────────────────────────────────
const platformMetrics = [
  { label:"Total Lender Accounts", value:"247",     sub:"Active on platform",      trend:"+12 this month",  up:true,  icon:"🏛️", grad:"linear-gradient(135deg,#1B5E20,#2E7D32)" },
  { label:"Total Farmers",          value:"87,340",  sub:"Registered borrowers",    trend:"+2,341 this month",up:true, icon:"👨‍🌾", grad:"linear-gradient(135deg,#1565C0,#1976D2)" },
  { label:"Total Loans Disbursed",  value:"₦18.4B",  sub:"Across all programs",     trend:"+₦2.1B vs last mo",up:true, icon:"💰", grad:"linear-gradient(135deg,#6A1B9A,#7B1FA2)" },
  { label:"Platform Revenue",       value:"₦142M",   sub:"This month",              trend:"+18% vs last mo",  up:true, icon:"📈", grad:"linear-gradient(135deg,#B45309,#D97706)" },
  { label:"Active Programs",        value:"1,240",   sub:"Across all lenders",      trend:"+89 this month",   up:true, icon:"🎯", grad:"linear-gradient(135deg,#0891b2,#0e7490)" },
  { label:"Default Rate",           value:"7.8%",    sub:"Platform-wide avg",       trend:"-0.4% vs last mo", up:true, icon:"⚠️", grad:"linear-gradient(135deg,#B71C1C,#C62828)" },
];

const growthData = [
  { m:"Jan", lenders:180, farmers:52000, revenue:98  },
  { m:"Feb", lenders:192, farmers:58000, revenue:108 },
  { m:"Mar", lenders:205, farmers:63000, revenue:115 },
  { m:"Apr", lenders:214, farmers:69000, revenue:122 },
  { m:"May", lenders:228, farmers:75000, revenue:131 },
  { m:"Jun", lenders:247, farmers:87340, revenue:142 },
];

const revenueBreakdown = [
  { name:"SaaS Subscriptions", value:68, color:"#1B5E20" },
  { name:"Transaction Fees",   value:22, color:"#F9A825" },
  { name:"FarmScore API",      value:6,  color:"#2563eb" },
  { name:"White-Label",        value:4,  color:"#7c3aed" },
];

const lenderAccounts = [
  { id:"LND-001", name:"Federal Ministry of Agriculture", type:"Federal Government", plan:"Enterprise", status:"Active",   farmers:23450, disbursed:"₦4.25B", revenue:"₦18.2M", joined:"Jan 2024", nextBilling:"Jul 1", flags:0 },
  { id:"LND-002", name:"Central Bank of Nigeria (ABP)",   type:"Federal Government", plan:"Enterprise", status:"Active",   farmers:31200, disbursed:"₦8.10B", revenue:"₦24.5M", joined:"Nov 2023", nextBilling:"Jul 1", flags:0 },
  { id:"LND-003", name:"NIRSAL",                          type:"Development Finance",plan:"Enterprise", status:"Active",   farmers:8340,  disbursed:"₦1.80B", revenue:"₦12.0M", joined:"Feb 2024", nextBilling:"Jul 1", flags:0 },
  { id:"LND-004", name:"Ekiti State Ministry of Agric",   type:"State Government",   plan:"Growth",     status:"Active",   farmers:1240,  disbursed:"₦180M",  revenue:"₦750K",  joined:"Apr 2024", nextBilling:"Jul 5", flags:1 },
  { id:"LND-005", name:"Union Bank Agri-Finance Desk",    type:"Commercial Bank",    plan:"Growth",     status:"Active",   farmers:4320,  disbursed:"₦920M",  revenue:"₦2.1M",  joined:"Mar 2024", nextBilling:"Jul 3", flags:0 },
  { id:"LND-006", name:"USAID Feed the Future Nigeria",   type:"International NGO",  plan:"Growth",     status:"Active",   farmers:5610,  disbursed:"₦1.10B", revenue:"₦750K",  joined:"Dec 2023", nextBilling:"Jul 1", flags:0 },
  { id:"LND-007", name:"Kebbi State Government",          type:"State Government",   plan:"Growth",     status:"Suspended",farmers:980,   disbursed:"₦280M",  revenue:"₦750K",  joined:"Jan 2024", nextBilling:"—",     flags:3 },
  { id:"LND-008", name:"Savannah Agri MFB",               type:"Microfinance Bank",  plan:"Starter",    status:"Trial",    farmers:124,   disbursed:"₦18M",   revenue:"₦0",     joined:"Jun 2024", nextBilling:"Jul 15",flags:0 },
  { id:"LND-009", name:"GIZ Nigeria Agriculture Program", type:"International NGO",  plan:"Growth",     status:"Active",   farmers:2180,  disbursed:"₦420M",  revenue:"₦750K",  joined:"Feb 2024", nextBilling:"Jul 2", flags:0 },
  { id:"LND-010", name:"North-West State Agric Fund",     type:"State Government",   plan:"Starter",    status:"Pending",  farmers:0,     disbursed:"₦0",     revenue:"₦0",     joined:"Jun 2024", nextBilling:"—",     flags:0 },
];

const tickets = [
  { id:"TKT-2401", lender:"Ekiti State Ministry", subject:"Field agents not appearing on map", priority:"High",   status:"Open",       created:"2 hrs ago",  assigned:"Adaeze O." },
  { id:"TKT-2399", lender:"Union Bank",           subject:"FarmScore API returning 429 errors", priority:"High",   status:"In Progress",created:"5 hrs ago",  assigned:"Emeka C." },
  { id:"TKT-2397", lender:"NIRSAL",               subject:"WhatsApp notifications delayed by 4hr",priority:"Medium",status:"In Progress",created:"1 day ago",  assigned:"Bello M." },
  { id:"TKT-2395", lender:"Savannah MFB",          subject:"Cannot upload org logo > 500KB",   priority:"Low",    status:"Open",       created:"2 days ago", assigned:"Unassigned" },
  { id:"TKT-2392", lender:"USAID Nigeria",         subject:"Export to PDF missing columns",     priority:"Medium", status:"Resolved",   created:"3 days ago", assigned:"Ngozi E." },
  { id:"TKT-2388", lender:"Kebbi State Govt",      subject:"Account suspended — billing dispute",priority:"High",  status:"Escalated",  created:"4 days ago", assigned:"Ibrahim S." },
];

const featureFlags = [
  { name:"Satellite Crop Monitoring (NDVI)", desc:"Enables satellite imagery layer on map view", beta:true,  plans:["Enterprise"], enabled:true  },
  { name:"AI Default Prediction Engine",     desc:"ML-powered default risk scoring",            beta:true,  plans:["Enterprise","Growth"], enabled:true  },
  { name:"WhatsApp Bot Integration",         desc:"Two-way WhatsApp messaging for borrowers",   beta:false, plans:["Enterprise","Growth"], enabled:true  },
  { name:"Cooperative Group Loans",          desc:"Multi-member cooperative loan applications", beta:true,  plans:["Enterprise","Growth","Starter"], enabled:true },
  { name:"In-Kind (Produce) Repayments",     desc:"Allow repayment via harvested produce",      beta:false, plans:["Enterprise","Growth"], enabled:true  },
  { name:"USSD Self-Registration",           desc:"Farmers register via *737*99# USSD code",   beta:false, plans:["Enterprise","Growth","Starter"], enabled:true },
  { name:"FarmScore API External Access",    desc:"Third-party banks query FarmScore via API",  beta:false, plans:["Enterprise"], enabled:false },
  { name:"Bulk SMS Broadcast",               desc:"Send SMS to all borrowers in a program",     beta:false, plans:["Enterprise","Growth"], enabled:true  },
  { name:"Multi-Currency Support",           desc:"GHS, KES, USD support for global expansion", beta:true,  plans:["Enterprise"], enabled:false },
  { name:"Auto-Approve High FarmScore",      desc:"Auto-approve borrowers scoring 750+",        beta:true,  plans:["Enterprise","Growth"], enabled:false },
];

const systemHealth = [
  { name:"API Gateway",       status:"Operational", uptime:"99.98%", latency:"42ms",  icon:"🌐" },
  { name:"Database Cluster",  status:"Operational", uptime:"99.99%", latency:"8ms",   icon:"🗄️" },
  { name:"File Storage (S3)", status:"Operational", uptime:"100%",   latency:"120ms", icon:"☁️" },
  { name:"SMS Service",       status:"Degraded",    uptime:"98.2%",  latency:"1.2s",  icon:"📱" },
  { name:"WhatsApp API",      status:"Operational", uptime:"99.7%",  latency:"380ms", icon:"💬" },
  { name:"FarmScore Engine",  status:"Operational", uptime:"99.95%", latency:"210ms", icon:"📊" },
  { name:"Map / Geospatial",  status:"Operational", uptime:"99.9%",  latency:"95ms",  icon:"🗺️" },
  { name:"USSD Gateway",      status:"Operational", uptime:"99.6%",  latency:"650ms", icon:"📲" },
];

const adminNavItems = [
  { icon:LayoutDashboard, label:"Overview" },
  { icon:Users,           label:"Lender Accounts" },
  { icon:BarChart2,       label:"Platform Analytics" },
  { icon:MessageSquare,   label:"Support Tickets" },
  { icon:Zap,             label:"Feature Flags" },
  { icon:Activity,        label:"System Health" },
  { icon:DollarSign,      label:"Billing & Revenue" },
  { icon:Shield,          label:"Security & Audit" },
  { icon:Settings,        label:"Admin Settings" },
];

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function AdminSidebar({ dark, open, nav, setNav }) {
  const th = dark ? T.dark : T.light;
  return (
    <aside style={{ width:open?240:68, flexShrink:0, background:th.sidebarBg, borderRight:`1px solid ${th.sidebarBorder}`, display:"flex", flexDirection:"column", transition:"width 0.25s", overflow:"hidden", minHeight:"100vh" }}>
      <div style={{ padding:"20px 16px", borderBottom:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:34, height:34, background:"linear-gradient(135deg,#dc2626,#b91c1c)", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <Shield size={17} color="#fff"/>
        </div>
        {open && (
          <div>
            <p style={{ color:"#f8fafc", fontWeight:800, fontSize:14, margin:0, whiteSpace:"nowrap" }}>AgroTrack Admin</p>
            <p style={{ color:"rgba(255,255,255,0.4)", fontSize:10, margin:0 }}>Super Admin Console</p>
          </div>
        )}
      </div>
      <nav style={{ flex:1, padding:"12px 8px", display:"flex", flexDirection:"column", gap:1 }}>
        {adminNavItems.map(({ icon:Icon, label }) => (
          <button key={label} onClick={()=>setNav(label)} style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"9px 10px", borderRadius:8, background: nav===label?"rgba(220,38,38,0.15)":"transparent", color: nav===label?"#ef4444":"rgba(255,255,255,0.5)", fontWeight: nav===label?700:400, fontSize:13, border:"none", cursor:"pointer", whiteSpace:"nowrap", borderLeft: nav===label?"2px solid #ef4444":"2px solid transparent" }}>
            <Icon size={16} style={{ flexShrink:0 }}/>
            {open && <span>{label}</span>}
          </button>
        ))}
      </nav>
      {open && (
        <div style={{ padding:"12px 16px", borderTop:"1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:30, height:30, borderRadius:"50%", background:"linear-gradient(135deg,#dc2626,#b91c1c)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:11, fontWeight:700 }}>SA</div>
            <div>
              <p style={{ color:"#f8fafc", fontSize:12, fontWeight:600, margin:0 }}>Super Admin</p>
              <p style={{ color:"rgba(255,255,255,0.35)", fontSize:10, margin:0 }}>admin@agrotrack.ng</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function StatusPill({ status }) {
  const map = {
    Active:      { bg:"#dcfce7", col:"#16a34a" },
    Suspended:   { bg:"#fee2e2", col:"#dc2626" },
    Trial:       { bg:"#dbeafe", col:"#2563eb" },
    Pending:     { bg:"#fef3c7", col:"#d97706" },
    Open:        { bg:"#fee2e2", col:"#dc2626" },
    "In Progress":{ bg:"#fef3c7", col:"#d97706" },
    Resolved:    { bg:"#dcfce7", col:"#16a34a" },
    Escalated:   { bg:"#fce7f3", col:"#be185d" },
    Operational: { bg:"#dcfce7", col:"#16a34a" },
    Degraded:    { bg:"#fef3c7", col:"#d97706" },
    Down:        { bg:"#fee2e2", col:"#dc2626" },
  };
  const s = map[status] || { bg:"#f3f4f6", col:"#6b7280" };
  return <span style={{ fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:5, background:s.bg, color:s.col }}>{status}</span>;
}

function PlanBadge({ plan }) {
  const map = { Enterprise:{ bg:"#fce7f3", col:"#be185d" }, Growth:{ bg:"#dbeafe", col:"#1d4ed8" }, Starter:{ bg:"#dcfce7", col:"#16a34a" } };
  const s = map[plan] || { bg:"#f3f4f6", col:"#6b7280" };
  return <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:4, background:s.bg, color:s.col }}>{plan}</span>;
}

// ─── OVERVIEW PAGE ────────────────────────────────────────────────────────────
function OverviewPage({ dark }) {
  const th = dark ? T.dark : T.light;
  const card = { background:th.surface, border:`1px solid ${th.border}`, borderRadius:16, padding:20 };

  return (
    <main style={{ flex:1, padding:24, overflowY:"auto" }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:800, color:th.text, margin:"0 0 4px" }}>Platform Overview</h1>
        <p style={{ fontSize:13, color:th.muted, margin:0 }}>Friday, 13 Jun 2025 · All systems nominal · Last sync 2 min ago</p>
      </div>

      {/* KPI grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
        {platformMetrics.map(({ label, value, sub, trend, up, icon, grad }, i) => (
          <div key={i} style={{ background:dark?"#0f172a":grad, border:dark?`1px solid ${th.border}`:"none", borderRadius:16, padding:20, position:"relative", overflow:"hidden", boxShadow:dark?"none":"0 4px 20px rgba(0,0,0,0.15)" }}>
            <div style={{ position:"absolute", top:-10, right:-10, width:64, height:64, borderRadius:"50%", background:"rgba(255,255,255,0.08)" }}/>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
              <p style={{ fontSize:11, fontWeight:600, color:dark?"#94a3b8":"rgba(255,255,255,0.7)", margin:0, textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</p>
              <span style={{ fontSize:20 }}>{icon}</span>
            </div>
            <p style={{ fontSize:26, fontWeight:800, color:dark?"#f8fafc":"#fff", margin:"0 0 6px" }}>{value}</p>
            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
              {up ? <ArrowUpRight size={12} color={dark?"#4ade80":"rgba(255,255,255,0.9)"}/> : <ArrowDownRight size={12} color={dark?"#f87171":"rgba(255,255,255,0.7)"}/>}
              <span style={{ fontSize:11, color:dark?"#94a3b8":"rgba(255,255,255,0.75)" }}>{trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:14, marginBottom:14 }}>
        <div style={card}>
          <h3 style={{ fontSize:14, fontWeight:700, color:th.text, margin:"0 0 4px" }}>Platform Growth</h3>
          <p style={{ fontSize:12, color:th.muted, margin:"0 0 16px" }}>Lenders, farmers and monthly revenue (₦M)</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark?"#1e293b":"#f0f0f0"}/>
              <XAxis dataKey="m" tick={{ fontSize:11, fill:th.muted }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:11, fill:th.muted }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background:th.surface, border:`1px solid ${th.border}`, borderRadius:10, fontSize:12 }}/>
              <Area type="monotone" dataKey="revenue" stroke="#dc2626" fill={dark?"#1a0a0a":"#fee2e2"} strokeWidth={2} name="Revenue (₦M)"/>
              <Area type="monotone" dataKey="lenders" stroke="#1B5E20" fill={dark?"#0a1a0a":"#dcfce7"} strokeWidth={2} name="Lenders"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={card}>
          <h3 style={{ fontSize:14, fontWeight:700, color:th.text, margin:"0 0 4px" }}>Revenue Breakdown</h3>
          <p style={{ fontSize:12, color:th.muted, margin:"0 0 12px" }}>By stream this month</p>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={revenueBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={3} dataKey="value">
                {revenueBreakdown.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip contentStyle={{ background:th.surface, border:`1px solid ${th.border}`, borderRadius:8, fontSize:12 }} formatter={v=>[`${v}%`]}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", flexDirection:"column", gap:6, marginTop:8 }}>
            {revenueBreakdown.map(({ name, value, color }) => (
              <div key={name} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ width:9, height:9, borderRadius:"50%", background:color, display:"inline-block" }}/>
                  <span style={{ fontSize:11, color:th.muted }}>{name}</span>
                </div>
                <span style={{ fontSize:12, fontWeight:700, color:th.text }}>{value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System health mini */}
      <div style={card}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:th.text, margin:0 }}>System Health</h3>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#16a34a" }}/>
            <span style={{ fontSize:12, color:"#16a34a", fontWeight:600 }}>7/8 Systems Operational</span>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
          {systemHealth.map(({ name, status, uptime, latency, icon }) => (
            <div key={name} style={{ background:dark?"#0f172a":"#f8fafc", border:`1px solid ${status==="Degraded"?"#fde68a":th.border}`, borderRadius:10, padding:"12px 14px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                <span style={{ fontSize:16 }}>{icon}</span>
                <StatusPill status={status}/>
              </div>
              <p style={{ fontSize:12, fontWeight:600, color:th.text, margin:"0 0 3px" }}>{name}</p>
              <p style={{ fontSize:10, color:th.muted, margin:0 }}>↑{uptime} · {latency}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

// ─── LENDER ACCOUNTS PAGE ─────────────────────────────────────────────────────
function LenderAccountsPage({ dark }) {
  const th = dark ? T.dark : T.light;
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = lenderAccounts.filter(l =>
    (filter === "All" || l.status === filter) &&
    (l.name.toLowerCase().includes(search.toLowerCase()) || l.type.toLowerCase().includes(search.toLowerCase()))
  );

  if (selected) {
    const a = lenderAccounts.find(l => l.id === selected);
    return (
      <main style={{ flex:1, overflowY:"auto" }}>
        <div style={{ padding:"16px 24px", background:th.surface, borderBottom:`1px solid ${th.border}`, display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={()=>setSelected(null)} style={{ fontSize:13, color:th.muted, background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>← Back to Accounts</button>
          <span style={{ color:th.border }}>|</span>
          <span style={{ fontSize:13, color:th.muted }}>{a.id}</span>
        </div>
        <div style={{ padding:24 }}>
          {/* Account hero */}
          <div style={{ background:th.surface, border:`1px solid ${th.border}`, borderRadius:16, padding:24, marginBottom:16 }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:16, marginBottom:20 }}>
              <div style={{ width:52, height:52, borderRadius:14, background:"linear-gradient(135deg,#0f172a,#1e293b)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:16, flexShrink:0 }}>
                {a.name.split(" ").map(w=>w[0]).join("").slice(0,2)}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                  <h2 style={{ fontSize:18, fontWeight:800, color:th.text, margin:0 }}>{a.name}</h2>
                  <StatusPill status={a.status}/>
                  <PlanBadge plan={a.plan}/>
                  {a.flags>0 && <span style={{ fontSize:10, fontWeight:700, background:"#fee2e2", color:"#dc2626", padding:"2px 8px", borderRadius:4 }}>⚑ {a.flags} Flag{a.flags>1?"s":""}</span>}
                </div>
                <p style={{ fontSize:13, color:th.muted, margin:0 }}>{a.type} · Joined {a.joined} · ID: {a.id}</p>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button style={{ padding:"8px 16px", borderRadius:8, border:`1px solid ${th.border}`, background:"none", color:th.muted, fontSize:13, cursor:"pointer" }}>Edit Account</button>
                <button style={{ padding:"8px 16px", borderRadius:8, border:"none", background:"#dc2626", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>{a.status==="Active"?"Suspend":"Reactivate"}</button>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", borderTop:`1px solid ${th.border}` }}>
              {[{l:"Total Farmers",v:a.farmers.toLocaleString()},{l:"Total Disbursed",v:a.disbursed},{l:"Platform Revenue",v:a.revenue},{l:"Next Billing",v:a.nextBilling},{l:"Support Tickets",v:`${a.flags} open`}].map(({l,v})=>(
                <div key={l} style={{ padding:"14px 16px", borderRight:`1px solid ${th.border}` }}>
                  <p style={{ fontSize:11, color:th.muted, margin:"0 0 4px" }}>{l}</p>
                  <p style={{ fontSize:16, fontWeight:700, color:th.text, margin:0 }}>{v}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {/* Feature flags for this account */}
            <div style={{ background:th.surface, border:`1px solid ${th.border}`, borderRadius:16, padding:20 }}>
              <h3 style={{ fontSize:14, fontWeight:700, color:th.text, margin:"0 0 14px" }}>Feature Flags — {a.name.split(" ")[0]}</h3>
              {featureFlags.filter(f=>f.plans.some(p=>p===a.plan)).map(f=>(
                <div key={f.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid ${th.border}` }}>
                  <div style={{ flex:1, paddingRight:12 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <p style={{ fontSize:13, fontWeight:600, color:th.text, margin:0 }}>{f.name}</p>
                      {f.beta && <span style={{ fontSize:9, fontWeight:700, background:"#ede9fe", color:"#7c3aed", padding:"1px 6px", borderRadius:4 }}>BETA</span>}
                    </div>
                    <p style={{ fontSize:11, color:th.muted, margin:"2px 0 0" }}>{f.desc}</p>
                  </div>
                  <div style={{ width:38, height:20, borderRadius:10, background:f.enabled?"#1B5E20":"#374151", cursor:"pointer", position:"relative", flexShrink:0 }}>
                    <div style={{ width:14, height:14, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:f.enabled?21:3, transition:"left 0.2s" }}/>
                  </div>
                </div>
              ))}
            </div>

            {/* Billing */}
            <div style={{ background:th.surface, border:`1px solid ${th.border}`, borderRadius:16, padding:20 }}>
              <h3 style={{ fontSize:14, fontWeight:700, color:th.text, margin:"0 0 14px" }}>Billing History</h3>
              {[{d:"Jun 1",amt:a.plan==="Enterprise"?"₦25M":a.plan==="Growth"?"₦750K":"₦250K",s:"Paid"},{d:"May 1",amt:a.plan==="Enterprise"?"₦25M":a.plan==="Growth"?"₦750K":"₦250K",s:"Paid"},{d:"Apr 1",amt:a.plan==="Enterprise"?"₦25M":a.plan==="Growth"?"₦750K":"₦250K",s:"Paid"}].map(({d,amt,s})=>(
                <div key={d} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${th.border}` }}>
                  <div>
                    <p style={{ fontSize:13, fontWeight:600, color:th.text, margin:"0 0 2px" }}>{a.plan} Subscription</p>
                    <p style={{ fontSize:11, color:th.muted, margin:0 }}>{d}, 2025</p>
                  </div>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <span style={{ fontSize:14, fontWeight:700, color:th.text }}>{amt}</span>
                    <StatusPill status={s}/>
                  </div>
                </div>
              ))}
              <button style={{ width:"100%", marginTop:14, padding:"10px", borderRadius:10, border:`1px solid ${th.border}`, background:"none", color:th.muted, fontSize:13, cursor:"pointer" }}>View Full Billing History</button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ flex:1, padding:24, overflowY:"auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:th.text, margin:"0 0 4px" }}>Lender Accounts</h1>
          <p style={{ fontSize:13, color:th.muted, margin:0 }}>Manage all {lenderAccounts.length} lender organisations on the platform</p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:8, border:`1px solid ${th.border}`, background:th.surface, color:th.muted, fontSize:12, cursor:"pointer" }}>
            <Download size={13}/> Export
          </button>
          <button style={{ padding:"8px 16px", borderRadius:8, border:"none", background:"#dc2626", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
            <Plus size={14}/> Add Lender
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        {[{l:"Total Accounts",v:lenderAccounts.length,c:"#0f172a",bg:dark?"#1e293b":"#f1f5f9"},{l:"Active",v:lenderAccounts.filter(l=>l.status==="Active").length,c:"#16a34a",bg:dark?"#0a2010":"#dcfce7"},{l:"Trial",v:lenderAccounts.filter(l=>l.status==="Trial").length,c:"#2563eb",bg:dark?"#0d1a30":"#dbeafe"},{l:"Suspended",v:lenderAccounts.filter(l=>l.status==="Suspended").length,c:"#dc2626",bg:dark?"#2d0a0a":"#fee2e2"}].map(({l,v,c,bg})=>(
          <div key={l} style={{ background:dark?"#0f172a":bg, border:`1px solid ${dark?"#1e293b":"transparent"}`, borderRadius:12, padding:"14px 16px" }}>
            <p style={{ fontSize:22, fontWeight:800, color:dark?"#f8fafc":c, margin:"0 0 3px" }}>{v}</p>
            <p style={{ fontSize:12, color:th.muted, margin:0 }}>{l}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:10, marginBottom:16, alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, maxWidth:320, background:th.inputBg, border:`1px solid ${th.border}`, borderRadius:10, padding:"8px 12px" }}>
          <Search size={14} color={th.muted}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} style={{ background:"none", border:"none", outline:"none", fontSize:13, flex:1, color:th.text }} placeholder="Search lenders..."/>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {["All","Active","Trial","Suspended","Pending"].map(s=>(
            <button key={s} onClick={()=>setFilter(s)} style={{ fontSize:12, padding:"6px 12px", borderRadius:8, border:`1px solid ${filter===s?"#dc2626":th.border}`, background:filter===s?"#dc2626":th.surface, color:filter===s?"#fff":th.muted, fontWeight:filter===s?600:400, cursor:"pointer" }}>{s}</button>
          ))}
        </div>
        <span style={{ marginLeft:"auto", fontSize:12, color:th.muted }}>{filtered.length} accounts</span>
      </div>

      {/* Table */}
      <div style={{ background:th.surface, border:`1px solid ${th.border}`, borderRadius:16, overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ background:dark?"#020617":"#f8fafc" }}>
                {["Organisation","Type","Plan","Status","Farmers","Disbursed","Revenue","Flags","Next Billing","Actions"].map(h=>(
                  <th key={h} style={{ textAlign:"left", padding:"10px 16px", fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", color:th.muted, borderBottom:`1px solid ${th.border}`, whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a,i)=>(
                <tr key={i} style={{ borderBottom:`1px solid ${th.border}`, cursor:"pointer" }} onClick={()=>setSelected(a.id)}>
                  <td style={{ padding:"12px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#0f172a,#1e293b)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:10, fontWeight:700, flexShrink:0 }}>
                        {a.name.split(" ").map(w=>w[0]).join("").slice(0,2)}
                      </div>
                      <div>
                        <p style={{ fontSize:13, fontWeight:600, color:th.text, margin:0 }}>{a.name}</p>
                        <p style={{ fontSize:10, color:th.muted, margin:0 }}>{a.id}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:"12px 16px", color:th.muted, fontSize:11 }}>{a.type}</td>
                  <td style={{ padding:"12px 16px" }}><PlanBadge plan={a.plan}/></td>
                  <td style={{ padding:"12px 16px" }}><StatusPill status={a.status}/></td>
                  <td style={{ padding:"12px 16px", color:th.text, fontWeight:600 }}>{a.farmers.toLocaleString()}</td>
                  <td style={{ padding:"12px 16px", color:"#1B5E20", fontWeight:600 }}>{a.disbursed}</td>
                  <td style={{ padding:"12px 16px", color:th.text }}>{a.revenue}</td>
                  <td style={{ padding:"12px 16px" }}>
                    {a.flags>0 ? <span style={{ fontSize:11, fontWeight:700, background:"#fee2e2", color:"#dc2626", padding:"2px 8px", borderRadius:5 }}>⚑ {a.flags}</span> : <span style={{ color:th.muted, fontSize:12 }}>—</span>}
                  </td>
                  <td style={{ padding:"12px 16px", color:th.muted, fontSize:12 }}>{a.nextBilling}</td>
                  <td style={{ padding:"12px 16px" }} onClick={e=>e.stopPropagation()}>
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={()=>setSelected(a.id)} style={{ width:26, height:26, borderRadius:6, background:dark?"#1e293b":"#f1f5f9", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Eye size={12} color="#2563eb"/></button>
                      <button style={{ width:26, height:26, borderRadius:6, background:dark?"#1e293b":"#f1f5f9", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Edit size={12} color={th.muted}/></button>
                      <button style={{ width:26, height:26, borderRadius:6, background:dark?"#2d0a0a":"#fee2e2", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Flag size={12} color="#dc2626"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

// ─── SUPPORT TICKETS PAGE ─────────────────────────────────────────────────────
function SupportTicketsPage({ dark }) {
  const th = dark ? T.dark : T.light;
  const [filter, setFilter] = useState("All");
  const [activeTicket, setActiveTicket] = useState(null);
  const [reply, setReply] = useState("");

  const filtered = filter === "All" ? tickets : tickets.filter(t => t.status === filter);
  const priorityColor = { High:"#dc2626", Medium:"#d97706", Low:"#16a34a" };

  return (
    <main style={{ flex:1, display:"flex", overflow:"hidden" }}>
      {/* Ticket list */}
      <div style={{ width:360, flexShrink:0, borderRight:`1px solid ${th.border}`, display:"flex", flexDirection:"column", background:th.surface }}>
        <div style={{ padding:"16px 18px", borderBottom:`1px solid ${th.border}` }}>
          <h2 style={{ fontSize:16, fontWeight:700, color:th.text, margin:"0 0 12px" }}>Support Tickets</h2>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {["All","Open","In Progress","Escalated","Resolved"].map(s=>(
              <button key={s} onClick={()=>setFilter(s)} style={{ fontSize:11, padding:"4px 10px", borderRadius:6, border:`1px solid ${filter===s?"#dc2626":th.border}`, background:filter===s?"#dc2626":th.inputBg, color:filter===s?"#fff":th.muted, cursor:"pointer", fontWeight:filter===s?600:400 }}>{s}</button>
            ))}
          </div>
        </div>
        <div style={{ flex:1, overflowY:"auto" }}>
          {filtered.map((t,i)=>(
            <div key={i} onClick={()=>setActiveTicket(t)} style={{ padding:"14px 18px", borderBottom:`1px solid ${th.border}`, cursor:"pointer", background:activeTicket?.id===t.id?(dark?"#0f172a":"#f8fafc"):"transparent", borderLeft:`3px solid ${activeTicket?.id===t.id?"#dc2626":"transparent"}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                <span style={{ fontSize:10, fontWeight:700, color:th.muted }}>{t.id}</span>
                <div style={{ display:"flex", gap:5 }}>
                  <span style={{ fontSize:9, fontWeight:700, padding:"2px 6px", borderRadius:4, background:priorityColor[t.priority]+"20", color:priorityColor[t.priority] }}>{t.priority}</span>
                  <StatusPill status={t.status}/>
                </div>
              </div>
              <p style={{ fontSize:13, fontWeight:600, color:th.text, margin:"0 0 4px", lineHeight:1.4 }}>{t.subject}</p>
              <p style={{ fontSize:11, color:th.muted, margin:0 }}>{t.lender} · {t.created}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ticket detail */}
      {activeTicket ? (
        <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"16px 24px", background:th.surface, borderBottom:`1px solid ${th.border}`, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                <span style={{ fontSize:12, fontWeight:700, color:th.muted }}>{activeTicket.id}</span>
                <StatusPill status={activeTicket.status}/>
                <span style={{ fontSize:10, fontWeight:700, padding:"2px 6px", borderRadius:4, background:priorityColor[activeTicket.priority]+"20", color:priorityColor[activeTicket.priority] }}>{activeTicket.priority} Priority</span>
              </div>
              <h2 style={{ fontSize:16, fontWeight:700, color:th.text, margin:"0 0 4px" }}>{activeTicket.subject}</h2>
              <p style={{ fontSize:12, color:th.muted, margin:0 }}>{activeTicket.lender} · {activeTicket.created} · Assigned: <strong>{activeTicket.assigned}</strong></p>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <select style={{ padding:"7px 12px", borderRadius:8, border:`1px solid ${th.border}`, background:th.inputBg, color:th.text, fontSize:13, cursor:"pointer" }}>
                {["Open","In Progress","Escalated","Resolved"].map(s=><option key={s} selected={activeTicket.status===s}>{s}</option>)}
              </select>
              <button style={{ padding:"7px 14px", borderRadius:8, border:"none", background:"#dc2626", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>Escalate</button>
            </div>
          </div>

          {/* Conversation */}
          <div style={{ flex:1, overflowY:"auto", padding:24, background:dark?"#020617":"#f8fafc" }}>
            {[
              { from:"lender", name:activeTicket.lender, text:"We noticed that our field agents are not showing up on the map view even though they are actively using the app and have GPS enabled. This is causing issues with monitoring verifications.", time:"2 hours ago" },
              { from:"admin",  name:"Adaeze O. — Support", text:"Thank you for reporting this. We've identified a potential issue with the agent GPS sync on Android 14 devices. Can you confirm which Android version your agents are using? We'll push a patch within 4 hours.", time:"1 hour ago" },
              { from:"lender", name:activeTicket.lender, text:"Most agents are on Android 13 and 14. We have 6 agents affected out of 8 total.", time:"45 min ago" },
            ].map((m,i)=>(
              <div key={i} style={{ marginBottom:20 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <div style={{ width:30, height:30, borderRadius:"50%", background:m.from==="admin"?"linear-gradient(135deg,#dc2626,#b91c1c)":"linear-gradient(135deg,#1B5E20,#2E7D32)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:10, fontWeight:700 }}>
                    {m.name.split(" ").map(w=>w[0]).join("").slice(0,2)}
                  </div>
                  <div>
                    <p style={{ fontSize:13, fontWeight:700, color:th.text, margin:0 }}>{m.name}</p>
                    <p style={{ fontSize:11, color:th.muted, margin:0 }}>{m.time}</p>
                  </div>
                  {m.from==="admin" && <span style={{ fontSize:9, fontWeight:700, background:"#fee2e2", color:"#dc2626", padding:"1px 7px", borderRadius:8 }}>ADMIN</span>}
                </div>
                <div style={{ marginLeft:38, background:th.surface, border:`1px solid ${th.border}`, borderRadius:12, padding:14 }}>
                  <p style={{ fontSize:13, color:th.text, margin:0, lineHeight:1.6 }}>{m.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding:"14px 24px", background:th.surface, borderTop:`1px solid ${th.border}` }}>
            <textarea value={reply} onChange={e=>setReply(e.target.value)} placeholder="Type your reply..." style={{ width:"100%", background:th.inputBg, border:`1px solid ${th.border}`, borderRadius:10, padding:"10px 14px", fontSize:13, color:th.text, outline:"none", resize:"none", minHeight:72, boxSizing:"border-box", marginBottom:10 }}/>
            <div style={{ display:"flex", gap:10 }}>
              <button style={{ flex:1, padding:"9px", borderRadius:8, border:`1px solid ${th.border}`, background:"none", color:th.muted, fontSize:13, cursor:"pointer" }}>Save as Internal Note</button>
              <button style={{ flex:2, padding:"9px", borderRadius:8, border:"none", background:"#dc2626", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>Send Reply →</button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12 }}>
          <span style={{ fontSize:40 }}>🎫</span>
          <p style={{ fontSize:14, color:th.muted }}>Select a ticket to view the conversation</p>
        </div>
      )}
    </main>
  );
}

// ─── FEATURE FLAGS PAGE ───────────────────────────────────────────────────────
function FeatureFlagsPage({ dark }) {
  const th = dark ? T.dark : T.light;
  const [flags, setFlags] = useState(featureFlags);
  const [saved, setSaved] = useState(false);

  const toggle = (i) => setFlags(f => f.map((fl,idx) => idx===i ? {...fl, enabled:!fl.enabled} : fl));
  const save = () => { setSaved(true); setTimeout(()=>setSaved(false), 2000); };

  return (
    <main style={{ flex:1, padding:24, overflowY:"auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:th.text, margin:"0 0 4px" }}>Feature Flags</h1>
          <p style={{ fontSize:13, color:th.muted, margin:0 }}>Control platform features globally or per lender account</p>
        </div>
        <button onClick={save} style={{ padding:"9px 20px", borderRadius:9, border:"none", background:saved?"#16a34a":"#dc2626", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>
          {saved?"✓ Saved!":"Save Changes"}
        </button>
      </div>

      <div style={{ background:th.surface, border:`1px solid ${th.border}`, borderRadius:16, overflow:"hidden", marginBottom:20 }}>
        <div style={{ padding:"14px 20px", borderBottom:`1px solid ${th.border}`, background:dark?"#0f172a":"#f8fafc" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 200px 120px 80px", gap:16 }}>
            {["Feature","Available On Plan","Status","Toggle"].map(h=>(
              <span key={h} style={{ fontSize:11, fontWeight:600, color:th.muted, textTransform:"uppercase", letterSpacing:"0.06em" }}>{h}</span>
            ))}
          </div>
        </div>
        {flags.map((f,i)=>(
          <div key={i} style={{ padding:"16px 20px", borderBottom:i<flags.length-1?`1px solid ${th.border}`:"none", display:"grid", gridTemplateColumns:"1fr 200px 120px 80px", gap:16, alignItems:"center" }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                <p style={{ fontSize:13, fontWeight:600, color:th.text, margin:0 }}>{f.name}</p>
                {f.beta && <span style={{ fontSize:9, fontWeight:700, background:"#ede9fe", color:"#7c3aed", padding:"1px 6px", borderRadius:4 }}>BETA</span>}
              </div>
              <p style={{ fontSize:12, color:th.muted, margin:0 }}>{f.desc}</p>
            </div>
            <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
              {f.plans.map(p=><PlanBadge key={p} plan={p}/>)}
            </div>
            <StatusPill status={f.enabled?"Operational":"—"}/>
            <div onClick={()=>toggle(i)} style={{ width:44, height:24, borderRadius:12, background:f.enabled?"#1B5E20":"#374151", cursor:"pointer", position:"relative", transition:"background 0.2s", border:`2px solid ${f.enabled?"#16a34a":"#4b5563"}` }}>
              <div style={{ width:16, height:16, borderRadius:"50%", background:"#fff", position:"absolute", top:2, left:f.enabled?23:2, transition:"left 0.2s" }}/>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background:dark?"#0f172a":"#fef9c3", border:"1px solid #fde68a", borderRadius:14, padding:16 }}>
        <p style={{ fontSize:13, fontWeight:700, color:"#d97706", margin:"0 0 6px" }}>⚠️ Per-Account Overrides</p>
        <p style={{ fontSize:13, color:th.muted, margin:0 }}>The flags above are global defaults. To override flags for a specific lender account, go to <strong>Lender Accounts</strong> → select an account → Feature Flags tab.</p>
      </div>
    </main>
  );
}

// ─── SYSTEM HEALTH PAGE ───────────────────────────────────────────────────────
function SystemHealthPage({ dark }) {
  const th = dark ? T.dark : T.light;
  const uptimeData = [
    {h:"00:00",api:100,db:100,sms:98},{h:"04:00",api:100,db:100,sms:95},{h:"08:00",api:99,db:100,sms:99},{h:"12:00",api:100,db:100,sms:97},{h:"16:00",api:100,db:100,sms:98},{h:"20:00",api:100,db:100,sms:100},
  ];
  return (
    <main style={{ flex:1, padding:24, overflowY:"auto" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:22, fontWeight:800, color:th.text, margin:"0 0 4px" }}>System Health</h1>
        <p style={{ fontSize:13, color:th.muted, margin:0 }}>Real-time status of all AgroTrack infrastructure components</p>
      </div>

      {/* Overall status banner */}
      <div style={{ background:dark?"#0a2010":"#dcfce7", border:"1px solid #bbf7d0", borderRadius:14, padding:"14px 20px", marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:12, height:12, borderRadius:"50%", background:"#16a34a", boxShadow:"0 0 0 4px #16a34a30" }}/>
        <p style={{ fontSize:14, fontWeight:700, color:"#16a34a", margin:0 }}>7 of 8 systems fully operational — SMS service experiencing minor delays</p>
      </div>

      {/* Service cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        {systemHealth.map(({ name, status, uptime, latency, icon }) => (
          <div key={name} style={{ background:th.surface, border:`1px solid ${status==="Degraded"?"#fde68a":th.border}`, borderRadius:14, padding:18 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
              <span style={{ fontSize:28 }}>{icon}</span>
              <StatusPill status={status}/>
            </div>
            <p style={{ fontSize:14, fontWeight:700, color:th.text, margin:"0 0 8px" }}>{name}</p>
            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:11, color:th.muted }}>Uptime (30d)</span>
                <span style={{ fontSize:12, fontWeight:700, color:status==="Degraded"?"#d97706":"#16a34a" }}>{uptime}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:11, color:th.muted }}>Avg Latency</span>
                <span style={{ fontSize:12, fontWeight:600, color:th.text }}>{latency}</span>
              </div>
            </div>
            <div style={{ marginTop:10, height:4, borderRadius:4, background:dark?"#1e293b":"#e2e8f0", overflow:"hidden" }}>
              <div style={{ width:`${parseFloat(uptime)}%`, height:"100%", borderRadius:4, background:status==="Degraded"?"#f59e0b":"#16a34a" }}/>
            </div>
          </div>
        ))}
      </div>

      {/* Uptime chart */}
      <div style={{ background:th.surface, border:`1px solid ${th.border}`, borderRadius:16, padding:20 }}>
        <h3 style={{ fontSize:14, fontWeight:700, color:th.text, margin:"0 0 4px" }}>Service Availability — Last 24 Hours</h3>
        <p style={{ fontSize:12, color:th.muted, margin:"0 0 16px" }}>% availability per hour</p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={uptimeData}>
            <CartesianGrid strokeDasharray="3 3" stroke={dark?"#1e293b":"#f0f0f0"}/>
            <XAxis dataKey="h" tick={{ fontSize:11, fill:th.muted }} axisLine={false} tickLine={false}/>
            <YAxis domain={[90,101]} tick={{ fontSize:11, fill:th.muted }} axisLine={false} tickLine={false} unit="%"/>
            <Tooltip contentStyle={{ background:th.surface, border:`1px solid ${th.border}`, borderRadius:10, fontSize:12 }} formatter={v=>[`${v}%`]}/>
            <Line type="monotone" dataKey="api"  stroke="#1B5E20" strokeWidth={2} dot={false} name="API Gateway"/>
            <Line type="monotone" dataKey="db"   stroke="#2563eb" strokeWidth={2} dot={false} name="Database"/>
            <Line type="monotone" dataKey="sms"  stroke="#f59e0b" strokeWidth={2} dot={false} name="SMS Service"/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}

// ─── PLACEHOLDER PAGE ─────────────────────────────────────────────────────────
function PlaceholderPage({ dark, label }) {
  const th = dark ? T.dark : T.light;
  return (
    <main style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12 }}>
      <span style={{ fontSize:40 }}>⚙️</span>
      <h2 style={{ fontSize:18, fontWeight:700, color:th.text, margin:0 }}>{label}</h2>
      <p style={{ fontSize:13, color:th.muted }}>Coming in the next build</p>
    </main>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function AgroTrackAdmin() {
  const [dark, setDark]     = useState(false);
  const [sideOpen, setSide] = useState(true);
  const [nav, setNav]       = useState("Overview");
  const th = dark ? T.dark : T.light;

  const renderPage = () => {
    if (nav==="Overview")          return <OverviewPage       dark={dark}/>;
    if (nav==="Lender Accounts")   return <LenderAccountsPage dark={dark}/>;
    if (nav==="Support Tickets")   return <SupportTicketsPage dark={dark}/>;
    if (nav==="Feature Flags")     return <FeatureFlagsPage   dark={dark}/>;
    if (nav==="System Health")     return <SystemHealthPage   dark={dark}/>;
    return <PlaceholderPage dark={dark} label={nav}/>;
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", background:th.bg, fontFamily:"'Inter',system-ui,sans-serif", transition:"background 0.3s" }}>
      <AdminSidebar dark={dark} open={sideOpen} nav={nav} setNav={setNav}/>

      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        {/* Topbar */}
        <header style={{ height:60, display:"flex", alignItems:"center", padding:"0 24px", gap:14, background:th.surface, borderBottom:`1px solid ${th.border}`, position:"sticky", top:0, zIndex:10 }}>
          <button onClick={()=>setSide(!sideOpen)} style={{ background:"none", border:"none", cursor:"pointer", color:th.muted }}><Menu size={20}/></button>
          <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, maxWidth:320, background:th.inputBg, border:`1px solid ${th.border}`, borderRadius:10, padding:"7px 12px" }}>
            <Search size={14} color={th.muted}/>
            <input style={{ background:"none", border:"none", outline:"none", fontSize:13, flex:1, color:th.text }} placeholder="Search lenders, tickets, features..."/>
          </div>
          <div style={{ display:"flex", gap:10, marginLeft:"auto", alignItems:"center" }}>
            {/* Alert badge */}
            <div style={{ display:"flex", alignItems:"center", gap:6, background:dark?"#2d0a0a":"#fee2e2", border:"1px solid #fca5a5", borderRadius:20, padding:"5px 12px" }}>
              <AlertCircle size={13} color="#dc2626"/>
              <span style={{ fontSize:12, fontWeight:700, color:"#dc2626" }}>1 degraded service</span>
            </div>
            <button onClick={()=>setDark(!dark)} style={{ width:36, height:36, borderRadius:10, border:`1px solid ${th.border}`, background:dark?"#374151":"#fef9c3", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              {dark ? <Sun size={15} color="#fbbf24"/> : <Moon size={15} color="#854d0e"/>}
            </button>
            <div style={{ position:"relative" }}>
              <button style={{ width:36, height:36, borderRadius:10, border:`1px solid ${th.border}`, background:dark?"#374151":"#eff6ff", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                <Bell size={15} color={dark?"#9ca3af":"#2563eb"}/>
              </button>
              <span style={{ position:"absolute", top:-3, right:-3, width:16, height:16, background:"#dc2626", borderRadius:"50%", color:"#fff", fontSize:9, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700 }}>4</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 12px", background:dark?"#0f172a":"#f1f5f9", border:`1px solid ${th.border}`, borderRadius:10 }}>
              <div style={{ width:24, height:24, borderRadius:"50%", background:"linear-gradient(135deg,#dc2626,#b91c1c)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:10, fontWeight:700 }}>SA</div>
              <span style={{ fontSize:13, fontWeight:600, color:th.text }}>Super Admin</span>
            </div>
          </div>
        </header>

        {renderPage()}
      </div>
    </div>
  );
}
