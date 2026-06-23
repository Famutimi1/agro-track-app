import { useState } from "react";
import {
  LayoutDashboard, Sprout, Users, Banknote, RefreshCw,
  UserCheck, BarChart2, Map, MessageSquare, Settings,
  Bell, Search, Moon, Sun, Menu, Leaf,
  Plus, Calendar, ArrowRight, X, Check,
  Building2, Globe, Lock, Unlock,
  Info, Eye, Pencil, Copy, MoreHorizontal,
  Zap, Target, Award, Wheat, Download,
  CheckCircle, AlertTriangle, Filter, Flag,
  ArrowUpRight, ArrowDownRight, CircleDollarSign,
  Wallet, ShieldAlert, TrendingUp, ClipboardList,
  Star, Phone, MapPin, Banknote as BanknoteIcon,
  ChevronLeft, ChevronRight, RefreshCw as Refresh,
  Layers, FileText, DollarSign
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

// ─── SHARED DATA ────────────────────────────────────────────────────────────

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Sprout,          label: "Loan Programs" },
  { icon: Users,           label: "Borrowers" },
  { icon: Banknote,        label: "Disbursements" },
  { icon: RefreshCw,       label: "Repayments" },
  { icon: UserCheck,       label: "Field Agents" },
  { icon: Users,           label: "Cooperatives" },
  { icon: BarChart2,       label: "Reports" },
  { icon: Map,             label: "Map View" },
  { icon: MessageSquare,   label: "Messages" },
  { icon: Settings,        label: "Settings" },
];

const programs = [
  { id:1, name:"CBN Rice Farmers Support Fund 2025",      lender:"Central Bank of Nigeria",           type:"Loan",   status:"Active", totalPool:2000, disbursed:850,  borrowers:2340, states:8,  interest:9,  repayRate:87,  cropTypes:["Rice"],                   deadline:"Dec 2025", color:"#16a34a", bgLight:"#dcfce7", layers:3, icon:Wheat    },
  { id:2, name:"NIRSAL Cassava Value Chain Grant",         lender:"NIRSAL",                            type:"Grant",  status:"Active", totalPool:500,  disbursed:312,  borrowers:1180, states:5,  interest:0,  repayRate:100, cropTypes:["Cassava","Yam"],          deadline:"Sep 2025", color:"#7c3aed", bgLight:"#ede9fe", layers:2, icon:Globe    },
  { id:3, name:"Bank of Agriculture Smallholder Maize",   lender:"Bank of Agriculture",               type:"Loan",   status:"Active", totalPool:1200, disbursed:540,  borrowers:3420, states:6,  interest:12, repayRate:74,  cropTypes:["Maize","Sorghum"],        deadline:"Nov 2025", color:"#2563eb", bgLight:"#dbeafe", layers:2, icon:Building2},
  { id:4, name:"Ekiti State Youth Agro Fund",             lender:"Ekiti State Ministry of Agriculture",type:"Hybrid", status:"Draft",  totalPool:150,  disbursed:0,    borrowers:0,    states:1,  interest:5,  repayRate:0,   cropTypes:["Cocoa","Cashew","Yam"],   deadline:"Jan 2026", color:"#d97706", bgLight:"#fef3c7", layers:3, icon:Award    },
  { id:5, name:"USAID Feed the Future — Vegetable Belt",  lender:"USAID / GIZ Partnership",           type:"Grant",  status:"Closed", totalPool:800,  disbursed:800,  borrowers:4210, states:10, interest:0,  repayRate:100, cropTypes:["Tomato","Pepper"],        deadline:"Mar 2025", color:"#6b7280", bgLight:"#f3f4f6", layers:1, icon:Target   },
  { id:6, name:"Kebbi Rice Irrigation Scheme 2025",       lender:"Kebbi State Government",            type:"Loan",   status:"Active", totalPool:600,  disbursed:280,  borrowers:980,  states:1,  interest:7,  repayRate:91,  cropTypes:["Rice","Wheat"],           deadline:"Feb 2026", color:"#0891b2", bgLight:"#e0f2fe", layers:3, icon:Zap      },
];

const borrowers = [
  { id:"FMR-0012", name:"Adaeze Okonkwo",   state:"Anambra", lga:"Onitsha",    crop:"Cassava",  loan:"₦450,000",  disbursed:"₦270,000", repaid:"₦135,000", score:742, status:"Active",    gender:"F", phone:"0803 xxx xxxx", farm:"2.4 ha", program:"NIRSAL Cassava", joined:"Jan 2025", layers:[true,true,false],  lastReport:"2 days ago" },
  { id:"FMR-0034", name:"Bello Musa",        state:"Kebbi",   lga:"Birnin Kebbi",crop:"Rice",    loan:"₦850,000",  disbursed:"₦850,000", repaid:"₦510,000", score:815, status:"Active",    gender:"M", phone:"0706 xxx xxxx", farm:"5.1 ha", program:"CBN Rice Fund",  joined:"Feb 2025", layers:[true,true,true],   lastReport:"1 day ago"  },
  { id:"FMR-0078", name:"Grace Adeleke",     state:"Oyo",     lga:"Ibadan North",crop:"Cassava", loan:"₦200,000",  disbursed:"₦120,000", repaid:"₦40,000",  score:510, status:"At Risk",   gender:"F", phone:"0901 xxx xxxx", farm:"1.2 ha", program:"NIRSAL Cassava", joined:"Mar 2025", layers:[true,false,false], lastReport:"22 days ago"},
  { id:"FMR-0091", name:"Emeka Chukwu",      state:"Anambra", lga:"Awka",        crop:"Yam",     loan:"₦300,000",  disbursed:"₦300,000", repaid:"₦0",       score:420, status:"Defaulting",gender:"M", phone:"0812 xxx xxxx", farm:"1.8 ha", program:"BOA Smallholder",joined:"Dec 2024", layers:[true,true,false],  lastReport:"47 days ago"},
  { id:"FMR-0105", name:"Hajiya Fatima",     state:"Kano",    lga:"Fagge",       crop:"Rice",    loan:"₦600,000",  disbursed:"₦600,000", repaid:"₦600,000", score:890, status:"Completed", gender:"F", phone:"0705 xxx xxxx", farm:"3.8 ha", program:"CBN Rice Fund",  joined:"Nov 2024", layers:[true,true,true],   lastReport:"5 days ago" },
  { id:"FMR-0143", name:"Sule Danjuma",      state:"Kogi",    lga:"Lokoja",      crop:"Maize",   loan:"₦500,000",  disbursed:"₦300,000", repaid:"₦0",       score:390, status:"Defaulting",gender:"M", phone:"0813 xxx xxxx", farm:"2.1 ha", program:"BOA Smallholder",joined:"Jan 2025", layers:[true,false,false], lastReport:"31 days ago"},
  { id:"FMR-0167", name:"Ngozi Eze",         state:"Imo",     lga:"Owerri",      crop:"Vegetables",loan:"₦150,000",disbursed:"₦90,000",  repaid:"₦45,000",  score:678, status:"Active",    gender:"F", phone:"0803 xxx xxxx", farm:"0.8 ha", program:"USAID Vegetable",joined:"Feb 2025", layers:[true,true,false],  lastReport:"4 days ago" },
  { id:"FMR-0189", name:"Musa Garba",        state:"Kebbi",   lga:"Argungu",     crop:"Rice",    loan:"₦750,000",  disbursed:"₦450,000", repaid:"₦0",       score:445, status:"At Risk",   gender:"M", phone:"0907 xxx xxxx", farm:"4.2 ha", program:"Kebbi Irrigation",joined:"Mar 2025", layers:[true,true,false],  lastReport:"18 days ago"},
  { id:"FMR-0201", name:"Amina Ibrahim",     state:"Kaduna",  lga:"Kaduna South",crop:"Maize",   loan:"₦380,000",  disbursed:"₦380,000", repaid:"₦190,000", score:721, status:"Active",    gender:"F", phone:"0706 xxx xxxx", farm:"2.9 ha", program:"BOA Smallholder",joined:"Jan 2025", layers:[true,true,true],   lastReport:"3 days ago" },
  { id:"FMR-0224", name:"Tunde Fashola",     state:"Ekiti",   lga:"Ado-Ekiti",   crop:"Cocoa",   loan:"₦250,000",  disbursed:"₦150,000", repaid:"₦75,000",  score:658, status:"Active",    gender:"M", phone:"0815 xxx xxxx", farm:"1.5 ha", program:"Ekiti Youth Fund",joined:"Apr 2025", layers:[true,false,false], lastReport:"6 days ago" },
];

const cropColors = {
  Rice:       { bg:"#dcfce7", color:"#166534" }, Cassava:   { bg:"#fef3c7", color:"#854d0e" },
  Maize:      { bg:"#dbeafe", color:"#1e40af" }, Yam:       { bg:"#fed7aa", color:"#9a3412" },
  Cocoa:      { bg:"#d1fae5", color:"#065f46" }, Cashew:    { bg:"#fce7f3", color:"#9d174d" },
  Tomato:     { bg:"#fee2e2", color:"#991b1b" }, Pepper:    { bg:"#fef9c3", color:"#713f12" },
  Vegetables: { bg:"#d1fae5", color:"#065f46" }, Sorghum:   { bg:"#ede9fe", color:"#5b21b6" },
  Wheat:      { bg:"#e0f2fe", color:"#0c4a6e" },
};

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────

function Sidebar({ dark, sidebarOpen, activeNav, setActiveNav }) {
  return (
    <aside style={{ width: sidebarOpen ? 232 : 64, flexShrink:0, background: dark?"#0f1923":"#1B5E20", borderRight:`1px solid ${dark?"#1f2937":"#145214"}`, display:"flex", flexDirection:"column", transition:"width 0.25s", overflow:"hidden", minHeight:"100vh" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"20px 16px", borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ width:32, height:32, background:"#F9A825", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <Leaf size={16} color="#1B5E20" />
        </div>
        {sidebarOpen && <span style={{ color:"#fff", fontWeight:700, fontSize:18, letterSpacing:"-0.3px", whiteSpace:"nowrap" }}>AgroTrack</span>}
      </div>
      <nav style={{ flex:1, padding:"12px 8px", display:"flex", flexDirection:"column", gap:2 }}>
        {navItems.map(({ icon:Icon, label }) => (
          <button key={label} onClick={() => setActiveNav(label)} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, background: activeNav===label?"#F9A825":"transparent", color: activeNav===label?"#1B5E20":"rgba(255,255,255,0.65)", fontWeight: activeNav===label?600:400, fontSize:13, border:"none", cursor:"pointer", textAlign:"left", width:"100%", whiteSpace:"nowrap" }}>
            <Icon size={17} style={{ flexShrink:0 }} />
            {sidebarOpen && <span>{label}</span>}
          </button>
        ))}
      </nav>
      {sidebarOpen && (
        <div style={{ padding:"12px 16px", borderTop:"1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:"#F9A825", display:"flex", alignItems:"center", justifyContent:"center", color:"#1B5E20", fontWeight:700, fontSize:12, flexShrink:0 }}>FM</div>
            <div>
              <p style={{ color:"#fff", fontSize:12, fontWeight:600, margin:0, whiteSpace:"nowrap" }}>Fed. Min. of Agriculture</p>
              <p style={{ color:"rgba(255,255,255,0.45)", fontSize:11, margin:0 }}>Admin Account</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function Topbar({ dark, setDark, sidebarOpen, setSidebarOpen, placeholder, onNew, newLabel }) {
  const borderC = dark?"#374151":"#e5e7eb";
  const textC   = dark?"#f9fafb":"#111827";
  const surface = dark?"#1f2937":"#ffffff";
  return (
    <header style={{ height:64, display:"flex", alignItems:"center", padding:"0 24px", gap:16, background:surface, borderBottom:`1px solid ${borderC}`, position:"sticky", top:0, zIndex:10 }}>
      <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background:"none", border:"none", cursor:"pointer", color: dark?"#9ca3af":"#6b7280", padding:4 }}>
        <Menu size={20} />
      </button>
      <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, maxWidth:360, background: dark?"#374151":"#f0fdf4", border:`1px solid ${dark?"#4b5563":"#bbf7d0"}`, borderRadius:10, padding:"8px 12px" }}>
        <Search size={15} color={dark?"#9ca3af":"#4ade80"} />
        <input style={{ background:"none", border:"none", outline:"none", fontSize:13, flex:1, color:textC }} placeholder={placeholder||"Search..."} />
      </div>
      <div style={{ display:"flex", gap:10, marginLeft:"auto" }}>
        <button onClick={() => setDark(!dark)} style={{ width:36, height:36, borderRadius:10, border:`1px solid ${borderC}`, background: dark?"#374151":"#fef9c3", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
          {dark ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} color="#854d0e" />}
        </button>
        <div style={{ position:"relative" }}>
          <button style={{ width:36, height:36, borderRadius:10, border:`1px solid ${borderC}`, background: dark?"#374151":"#eff6ff", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <Bell size={15} color={dark?"#9ca3af":"#2563eb"} />
          </button>
          <span style={{ position:"absolute", top:-4, right:-4, width:16, height:16, background:"#ef4444", borderRadius:"50%", color:"#fff", fontSize:10, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700 }}>5</span>
        </div>
        {onNew && (
          <button onClick={onNew} style={{ background:"#F9A825", color:"#1B5E20", fontWeight:600, fontSize:13, padding:"8px 16px", borderRadius:10, border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
            <Plus size={15} /> {newLabel||"New"}
          </button>
        )}
      </div>
    </header>
  );
}

// ─── DASHBOARD PAGE ──────────────────────────────────────────────────────────

const disbursementData = [
  { month:"Jul", disbursed:320, repaid:180 }, { month:"Aug", disbursed:410, repaid:220 },
  { month:"Sep", disbursed:380, repaid:260 }, { month:"Oct", disbursed:520, repaid:310 },
  { month:"Nov", disbursed:490, repaid:350 }, { month:"Dec", disbursed:610, repaid:390 },
  { month:"Jan", disbursed:580, repaid:420 }, { month:"Feb", disbursed:720, repaid:480 },
  { month:"Mar", disbursed:690, repaid:510 }, { month:"Apr", disbursed:840, repaid:590 },
  { month:"May", disbursed:780, repaid:620 }, { month:"Jun", disbursed:920, repaid:680 },
];
const stateData = [
  { state:"Benue",rate:91 },{ state:"Ekiti",rate:87 },{ state:"Oyo",rate:83 },
  { state:"Kebbi",rate:79 },{ state:"Niger",rate:76 },{ state:"Kaduna",rate:74 },
  { state:"Taraba",rate:71 },{ state:"Kogi",rate:68 },
];
const cropPie = [
  { name:"Rice",value:34,color:"#16a34a" },{ name:"Cassava",value:22,color:"#f59e0b" },
  { name:"Maize",value:18,color:"#3b82f6" },{ name:"Yam",value:14,color:"#f97316" },
  { name:"Other",value:12,color:"#8b5cf6" },
];
const activities = [
  { text:"Adaeze Okonkwo approved for ₦450,000",    time:"2 min ago",  bg:"#dcfce7", color:"#16a34a", Icon:CheckCircle  },
  { text:"Bello Musa repaid ₦85,000 — Layer 2",     time:"14 min ago", bg:"#dbeafe", color:"#2563eb", Icon:Banknote     },
  { text:"12 borrowers missed June report deadline", time:"1 hr ago",   bg:"#fef3c7", color:"#d97706", Icon:AlertTriangle},
  { text:"Taraba Rice Program disbursed ₦12.3M",    time:"2 hr ago",   bg:"#dcfce7", color:"#16a34a", Icon:CheckCircle  },
  { text:"Emeka Chukwu — 3rd missed repayment",     time:"3 hr ago",   bg:"#fee2e2", color:"#dc2626", Icon:AlertTriangle},
  { text:"Hajiya Fatima cleared full balance",       time:"5 hr ago",   bg:"#dcfce7", color:"#16a34a", Icon:CheckCircle  },
];
const kpiCards = [
  { title:"Total Disbursed",  value:"₦4.25B", sub:"vs last quarter", trend:"up",   trendVal:"+18%", Icon:CircleDollarSign, grad:"linear-gradient(135deg,#1B5E20,#2E7D32)" },
  { title:"Total Repaid",     value:"₦1.89B", sub:"vs last quarter", trend:"up",   trendVal:"+22%", Icon:Wallet,           grad:"linear-gradient(135deg,#1565C0,#1976D2)" },
  { title:"Active Borrowers", value:"23,450", sub:"this month",      trend:"up",   trendVal:"+340", Icon:Users,            grad:"linear-gradient(135deg,#6A1B9A,#7B1FA2)" },
  { title:"Default Rate",     value:"8.3%",   sub:"vs 9.1% last qtr",trend:"up",   trendVal:"-0.8%",Icon:ShieldAlert,      grad:"linear-gradient(135deg,#B71C1C,#C62828)" },
  { title:"Pending Apps",     value:"1,247",  sub:"need review",     trend:"down",  trendVal:"+89",  Icon:ClipboardList,    grad:"linear-gradient(135deg,#E65100,#F57C00)" },
  { title:"Active Programs",  value:"7",      sub:"across 12 states",trend:"up",   trendVal:"+2",   Icon:TrendingUp,       grad:"linear-gradient(135deg,#00695C,#00796B)" },
];
const atRisk = [
  { name:"Emeka Chukwu", state:"Anambra", crop:"Yam",    overdue:"₦65,000",  days:47, score:420 },
  { name:"Sule Danjuma", state:"Kogi",    crop:"Maize",  overdue:"₦120,000", days:31, score:390 },
  { name:"Grace Adeleke",state:"Oyo",     crop:"Cassava",overdue:"₦38,000",  days:22, score:510 },
  { name:"Musa Garba",   state:"Kebbi",   crop:"Rice",   overdue:"₦95,000",  days:18, score:445 },
];

function DashboardPage({ dark }) {
  const surface = dark?"#1f2937":"#ffffff";
  const borderC = dark?"#374151":"#e5e7eb";
  const textC   = dark?"#f9fafb":"#111827";
  const mutedC  = dark?"#9ca3af":"#6b7280";
  const card    = { background:surface, border:`1px solid ${borderC}`, borderRadius:16, padding:20 };

  return (
    <main style={{ flex:1, padding:24, overflowY:"auto" }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:textC, margin:"0 0 4px" }}>Good morning, Federal Ministry 👋</h1>
        <p style={{ fontSize:13, color:mutedC, margin:0 }}>Friday, 13 June 2025 — Here's your portfolio at a glance</p>
      </div>

      {/* KPI cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:14, marginBottom:20 }}>
        {kpiCards.map((c,i) => {
          const Icon = c.Icon;
          return (
            <div key={i} style={{ background: dark?"#1a2020":c.grad, border: dark?`1px solid ${borderC}`:"none", borderRadius:16, padding:20, position:"relative", overflow:"hidden", boxShadow: dark?"none":"0 4px 20px rgba(0,0,0,0.15)" }}>
              <div style={{ position:"absolute", top:-10, right:-10, width:70, height:70, borderRadius:"50%", background:"rgba(255,255,255,0.1)" }} />
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                <p style={{ fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em", color: dark?"#9ca3af":"rgba(255,255,255,0.75)", margin:0 }}>{c.title}</p>
                <div style={{ width:28, height:28, borderRadius:7, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Icon size={14} color={dark?"#d1d5db":"#fff"} />
                </div>
              </div>
              <p style={{ fontSize:24, fontWeight:700, color: dark?"#f9fafb":"#fff", margin:"0 0 6px" }}>{c.value}</p>
              <div style={{ display:"flex", alignItems:"center", gap:3 }}>
                {c.trend==="up" ? <ArrowUpRight size={12} color={dark?"#4ade80":"rgba(255,255,255,0.9)"} /> : <ArrowDownRight size={12} color={dark?"#f87171":"rgba(255,255,255,0.7)"} />}
                <span style={{ fontSize:11, fontWeight:600, color: dark?"#4ade80":"rgba(255,255,255,0.95)" }}>{c.trendVal}</span>
                <span style={{ fontSize:11, color: dark?"#6b7280":"rgba(255,255,255,0.65)" }}>{c.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Line + Pie */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:14, marginBottom:14 }}>
        <div style={card}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
            <div>
              <h3 style={{ fontSize:14, fontWeight:600, color:textC, margin:"0 0 2px" }}>Disbursement vs Repayment</h3>
              <p style={{ fontSize:12, color:mutedC, margin:0 }}>Last 12 months (₦ millions)</p>
            </div>
            <div style={{ display:"flex", gap:14, fontSize:12 }}>
              {[["#1B5E20","Disbursed"],["#F9A825","Repaid"]].map(([col,lbl]) => (
                <span key={lbl} style={{ display:"flex", alignItems:"center", gap:5, color:mutedC }}>
                  <span style={{ width:10, height:10, borderRadius:"50%", background:col, display:"inline-block" }} />{lbl}
                </span>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={disbursementData}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark?"#374151":"#f0f0f0"} />
              <XAxis dataKey="month" tick={{ fontSize:11, fill:dark?"#9CA3AF":"#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:dark?"#9CA3AF":"#6B7280" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background:dark?"#1F2937":"#fff", border:"none", borderRadius:10, fontSize:12 }} />
              <Line type="monotone" dataKey="disbursed" stroke="#1B5E20" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="repaid" stroke="#F9A825" strokeWidth={2.5} dot={false} strokeDasharray="5 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={card}>
          <h3 style={{ fontSize:14, fontWeight:600, color:textC, margin:"0 0 2px" }}>Portfolio by Crop</h3>
          <p style={{ fontSize:12, color:mutedC, margin:"0 0 10px" }}>By total loan value</p>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={cropPie} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {cropPie.map((e,i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background:dark?"#1F2937":"#fff", border:"none", borderRadius:8, fontSize:12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", flexDirection:"column", gap:6, marginTop:8 }}>
            {cropPie.map(c => (
              <div key={c.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ width:10, height:10, borderRadius:"50%", background:c.color, display:"inline-block" }} />
                  <span style={{ fontSize:12, color:mutedC }}>{c.name}</span>
                </div>
                <span style={{ fontSize:12, fontWeight:600, color:textC }}>{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar + Activity */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:14, marginBottom:14 }}>
        <div style={card}>
          <h3 style={{ fontSize:14, fontWeight:600, color:textC, margin:"0 0 4px" }}>Repayment Rate by State</h3>
          <p style={{ fontSize:12, color:mutedC, margin:"0 0 14px" }}>% of on-time repayments</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stateData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark?"#374151":"#f3f4f6"} vertical={false} />
              <XAxis dataKey="state" tick={{ fontSize:11, fill:dark?"#9CA3AF":"#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis domain={[60,100]} tick={{ fontSize:11, fill:dark?"#9CA3AF":"#6B7280" }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip contentStyle={{ background:dark?"#1F2937":"#fff", border:"none", borderRadius:10, fontSize:12 }} formatter={v=>[`${v}%`,"Repayment"]} />
              <Bar dataKey="rate" radius={[6,6,0,0]}>
                {stateData.map((e,i) => <Cell key={i} fill={e.rate>=85?"#16a34a":e.rate>=75?"#2563eb":"#f59e0b"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={card}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <h3 style={{ fontSize:14, fontWeight:600, color:textC, margin:0 }}>Recent Activity</h3>
            <button style={{ fontSize:12, color:"#16a34a", fontWeight:500, background:"none", border:"none", cursor:"pointer" }}>View all</button>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {activities.map((a,i) => {
              const Icon = a.Icon;
              return (
                <div key={i} style={{ display:"flex", gap:10 }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:a.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Icon size={14} color={a.color} />
                  </div>
                  <div>
                    <p style={{ fontSize:12, lineHeight:1.4, color:textC, margin:"0 0 2px" }}>{a.text}</p>
                    <p style={{ fontSize:11, color:mutedC, margin:0 }}>{a.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* At-risk table */}
      <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:16, overflow:"hidden" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px", borderBottom:`1px solid ${borderC}` }}>
          <div>
            <h3 style={{ fontSize:14, fontWeight:600, color:textC, margin:"0 0 2px" }}>Borrowers Needing Attention</h3>
            <p style={{ fontSize:12, color:mutedC, margin:0 }}>Overdue repayments or missing farm reports</p>
          </div>
          <button style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, padding:"6px 12px", borderRadius:8, border:`1px solid ${borderC}`, background: dark?"#374151":"#f0fdf4", color:mutedC, cursor:"pointer" }}>
            <Download size={12} /> Export
          </button>
        </div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ background: dark?"#111827":"#f0fdf4" }}>
                {["Borrower","State","Crop","Overdue","Days Late","FarmScore","Action"].map(h => (
                  <th key={h} style={{ textAlign:"left", padding:"10px 20px", fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", color:mutedC, borderBottom:`1px solid ${borderC}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {atRisk.map((b,i) => (
                <tr key={i} style={{ borderBottom:`1px solid ${borderC}` }}>
                  <td style={{ padding:"12px 20px", color:textC, fontWeight:500 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:30, height:30, borderRadius:"50%", background: dark?"#1B5E20":"#dcfce7", display:"flex", alignItems:"center", justifyContent:"center", color:"#16a34a", fontSize:11, fontWeight:700 }}>
                        {b.name.split(" ").map(n=>n[0]).join("")}
                      </div>
                      {b.name}
                    </div>
                  </td>
                  <td style={{ padding:"12px 20px", color:mutedC }}>{b.state}</td>
                  <td style={{ padding:"12px 20px", color:mutedC }}>{b.crop}</td>
                  <td style={{ padding:"12px 20px", color:"#ef4444", fontWeight:600 }}>{b.overdue}</td>
                  <td style={{ padding:"12px 20px" }}>
                    <span style={{ fontSize:12, fontWeight:600, padding:"3px 8px", borderRadius:6, background: b.days>40?"#fee2e2":b.days>20?"#fef3c7":"#fef9c3", color: b.days>40?"#dc2626":b.days>20?"#d97706":"#854d0e" }}>{b.days}d</span>
                  </td>
                  <td style={{ padding:"12px 20px" }}>
                    <span style={{ fontSize:12, fontWeight:700, padding:"3px 8px", borderRadius:6, background: b.score<450?"#fee2e2":"#fef3c7", color: b.score<450?"#dc2626":"#d97706" }}>{b.score}</span>
                  </td>
                  <td style={{ padding:"12px 20px" }}>
                    <div style={{ display:"flex", gap:6 }}>
                      {[{Icon:Eye,bg:"#eff6ff",col:"#2563eb"},{Icon:MessageSquare,bg:"#f0fdf4",col:"#16a34a"},{Icon:Flag,bg:"#fee2e2",col:"#dc2626"}].map(({Icon,bg,col},idx) => (
                        <button key={idx} style={{ width:28, height:28, borderRadius:7, background: dark?"#1f2937":bg, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <Icon size={13} color={col} />
                        </button>
                      ))}
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

// ─── LOAN PROGRAMS PAGE ───────────────────────────────────────────────────────

const STEPS = ["Basic Info","Eligibility","Loan Terms","Disbursement","Documents","Review"];
const nigerianStates = ["Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Benue","Cross River","Delta","Ekiti","Enugu","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara","FCT"];
const cropOptions = ["Rice","Cassava","Maize","Yam","Cocoa","Cashew","Sorghum","Wheat","Tomato","Pepper","Oil Palm","Groundnut","Soybean","Cotton","Other"];

function CreateProgramModal({ dark, onClose }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name:"", description:"", totalFund:"", type:"Loan", states:[], crops:[], minAge:"18", maxAge:"65", gender:"All", cooperative:"Optional", minLoan:"", maxLoan:"", interest:"", duration:"12", grace:"1", disbursementType:"Layered", layers:[{ name:"Land Preparation",percent:"30",trigger:"Loan Approval",proof:"Farm photos + GPS" },{ name:"Planting & Inputs",percent:"40",trigger:"Layer 1 report submitted",proof:"Input receipts + farm photos" },{ name:"Crop Maintenance",percent:"30",trigger:"Crop growth confirmed",proof:"Agent visit + growth photos" }], docs:{ bvn:true,nin:true,farmPhotos:true,cooperative:false,bankStatement:false,titleDoc:false }, deadline:"" });
  const borderC=dark?"#374151":"#e5e7eb"; const textC=dark?"#f9fafb":"#111827"; const mutedC=dark?"#9ca3af":"#6b7280"; const inputBg=dark?"#374151":"#f9fafb"; const bgC=dark?"#1f2937":"#ffffff";
  const inp = { background:inputBg, border:`1px solid ${borderC}`, borderRadius:8, padding:"9px 12px", fontSize:13, color:textC, width:"100%", outline:"none", boxSizing:"border-box" };
  const toggle = (field, val) => setForm(f=>({ ...f, [field]: f[field].includes(val)?f[field].filter(v=>v!==val):[...f[field],val] }));

  const renderStep = () => {
    if (step===0) return (
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <div><label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase" }}>Program Name *</label><input style={inp} placeholder="e.g. CBN Rice Farmers Support Fund 2025" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
        <div><label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase" }}>Description</label><textarea style={{...inp,minHeight:70,resize:"vertical"}} placeholder="Who is this program for?" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /></div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div><label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase" }}>Total Fund (₦M) *</label><input style={inp} type="number" placeholder="e.g. 500" value={form.totalFund} onChange={e=>setForm({...form,totalFund:e.target.value})} /></div>
          <div><label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase" }}>Program Type *</label><select style={inp} value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option>Loan</option><option>Grant</option><option>Hybrid</option></select></div>
        </div>
        <div><label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase" }}>Application Deadline</label><input style={inp} type="date" value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})} /></div>
      </div>
    );
    if (step===1) return (
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        <div><label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:8, textTransform:"uppercase" }}>Target States</label><div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>{nigerianStates.map(s=><button key={s} onClick={()=>toggle("states",s)} style={{ fontSize:11, padding:"4px 10px", borderRadius:20, cursor:"pointer", border:`1px solid ${form.states.includes(s)?"#16a34a":borderC}`, background:form.states.includes(s)?"#dcfce7":inputBg, color:form.states.includes(s)?"#15803d":mutedC, fontWeight:form.states.includes(s)?600:400 }}>{s}</button>)}</div></div>
        <div><label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:8, textTransform:"uppercase" }}>Eligible Crops</label><div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>{cropOptions.map(c=><button key={c} onClick={()=>toggle("crops",c)} style={{ fontSize:11, padding:"4px 10px", borderRadius:20, cursor:"pointer", border:`1px solid ${form.crops.includes(c)?"#2563eb":borderC}`, background:form.crops.includes(c)?"#dbeafe":inputBg, color:form.crops.includes(c)?"#1d4ed8":mutedC, fontWeight:form.crops.includes(c)?600:400 }}>{c}</button>)}</div></div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div><label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase" }}>Min Age</label><input style={inp} type="number" value={form.minAge} onChange={e=>setForm({...form,minAge:e.target.value})} /></div>
          <div><label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase" }}>Max Age</label><input style={inp} type="number" value={form.maxAge} onChange={e=>setForm({...form,maxAge:e.target.value})} /></div>
          <div><label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase" }}>Gender Focus</label><select style={inp} value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})}><option>All</option><option>Female only</option><option>Male only</option><option>Youth (18-35)</option></select></div>
          <div><label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase" }}>Cooperative</label><select style={inp} value={form.cooperative} onChange={e=>setForm({...form,cooperative:e.target.value})}><option>Optional</option><option>Required</option><option>Not required</option></select></div>
        </div>
      </div>
    );
    if (step===2) return (
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div><label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase" }}>Min Loan (₦)</label><input style={inp} type="number" placeholder="50,000" value={form.minLoan} onChange={e=>setForm({...form,minLoan:e.target.value})} /></div>
          <div><label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase" }}>Max Loan (₦)</label><input style={inp} type="number" placeholder="2,000,000" value={form.maxLoan} onChange={e=>setForm({...form,maxLoan:e.target.value})} /></div>
          <div><label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase" }}>Interest Rate % p.a.</label><input style={inp} type="number" placeholder={form.type==="Grant"?"0":"9"} value={form.interest} onChange={e=>setForm({...form,interest:e.target.value})} /></div>
          <div><label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase" }}>Repayment (months)</label><select style={inp} value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})}>{[3,6,9,12,18,24,36].map(m=><option key={m} value={m}>{m} months</option>)}</select></div>
          <div><label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase" }}>Grace Period</label><select style={inp} value={form.grace} onChange={e=>setForm({...form,grace:e.target.value})}>{[0,1,2,3,6].map(m=><option key={m} value={m}>{m} month{m!==1?"s":""}</option>)}</select></div>
          <div><label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase" }}>Disbursement Type</label><select style={inp} value={form.disbursementType} onChange={e=>setForm({...form,disbursementType:e.target.value})}><option>Layered</option><option>Lump Sum</option><option>In-Kind</option></select></div>
        </div>
      </div>
    );
    if (step===3) return (
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        <div style={{ padding:12, background: dark?"#0f1a30":"#eff6ff", border:"1px solid #bfdbfe", borderRadius:10 }}><p style={{ fontSize:12, color:"#2563eb", fontWeight:600, margin:"0 0 3px" }}>Why layered disbursement?</p><p style={{ fontSize:11, color:mutedC, margin:0 }}>Releasing funds in tranches tied to verified farm activity dramatically reduces diversion.</p></div>
        {form.layers.map((layer,i) => {
          const lc=[{bg:"#dcfce7",tc:"#16a34a"},{bg:"#dbeafe",tc:"#2563eb"},{bg:"#fef3c7",tc:"#d97706"}][i]||{bg:"#f3f4f6",tc:"#6b7280"};
          return (
            <div key={i} style={{ border:`1px solid ${borderC}`, borderRadius:12, padding:14 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                <div style={{ width:24, height:24, borderRadius:"50%", background:lc.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:lc.tc }}>{i+1}</div>
                <span style={{ fontSize:13, fontWeight:600, color:textC }}>Layer {i+1}</span>
                <span style={{ marginLeft:"auto", fontSize:12, fontWeight:700, color:lc.tc }}>{layer.percent}%</span>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 80px", gap:10, marginBottom:8 }}>
                <div><label style={{ fontSize:10, color:mutedC, display:"block", marginBottom:4, textTransform:"uppercase" }}>Name</label><input style={inp} value={layer.name} onChange={e=>{const l=[...form.layers];l[i]={...l[i],name:e.target.value};setForm({...form,layers:l});}} /></div>
                <div><label style={{ fontSize:10, color:mutedC, display:"block", marginBottom:4, textTransform:"uppercase" }}>%</label><input style={inp} type="number" value={layer.percent} onChange={e=>{const l=[...form.layers];l[i]={...l[i],percent:e.target.value};setForm({...form,layers:l});}} /></div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div><label style={{ fontSize:10, color:mutedC, display:"block", marginBottom:4, textTransform:"uppercase" }}>Trigger</label><input style={inp} value={layer.trigger} onChange={e=>{const l=[...form.layers];l[i]={...l[i],trigger:e.target.value};setForm({...form,layers:l});}} /></div>
                <div><label style={{ fontSize:10, color:mutedC, display:"block", marginBottom:4, textTransform:"uppercase" }}>Required Proof</label><input style={inp} value={layer.proof} onChange={e=>{const l=[...form.layers];l[i]={...l[i],proof:e.target.value};setForm({...form,layers:l});}} /></div>
              </div>
            </div>
          );
        })}
        <button onClick={()=>setForm({...form,layers:[...form.layers,{name:"",percent:"",trigger:"",proof:""}]})} style={{ border:`1px dashed ${borderC}`, borderRadius:10, padding:10, background:"none", color:mutedC, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}><Plus size={14} /> Add layer</button>
      </div>
    );
    if (step===4) {
      const docList=[{key:"bvn",label:"BVN Verification",desc:"Bank Verification Number",required:true},{key:"nin",label:"NIN Verification",desc:"National Identification Number",required:true},{key:"farmPhotos",label:"Farm Photos",desc:"Min 3 geotagged photos",required:false},{key:"cooperative",label:"Cooperative Letter",desc:"Membership letter",required:false},{key:"bankStatement",label:"Bank Statement",desc:"Last 3 months",required:false},{key:"titleDoc",label:"Land/Title Document",desc:"C of O or community letter",required:false}];
      return (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {docList.map(({key,label,desc,required})=>(
            <div key={key} onClick={()=>!required&&setForm({...form,docs:{...form.docs,[key]:!form.docs[key]}})} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"12px 14px", border:`1px solid ${form.docs[key]?"#bbf7d0":borderC}`, borderRadius:10, background: form.docs[key]?(dark?"#0a2010":"#f0fdf4"):inputBg, cursor:required?"default":"pointer" }}>
              <div style={{ width:20, height:20, borderRadius:5, border:`2px solid ${form.docs[key]?"#16a34a":borderC}`, background:form.docs[key]?"#16a34a":"none", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>{form.docs[key]&&<Check size={12} color="#fff" />}</div>
              <div><div style={{ display:"flex", alignItems:"center", gap:6 }}><span style={{ fontSize:13, fontWeight:600, color:textC }}>{label}</span>{required&&<span style={{ fontSize:10, background:"#fee2e2", color:"#dc2626", padding:"1px 6px", borderRadius:4, fontWeight:600 }}>REQUIRED</span>}</div><p style={{ fontSize:11, color:mutedC, margin:"2px 0 0" }}>{desc}</p></div>
            </div>
          ))}
        </div>
      );
    }
    if (step===5) return (
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        <div style={{ background: dark?"#0a2010":"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:12, padding:16 }}>
          <p style={{ fontSize:11, fontWeight:700, color:"#16a34a", margin:"0 0 12px", textTransform:"uppercase" }}>Program Summary</p>
          {[["Name",form.name||"—"],["Type",form.type],["Total Fund",form.totalFund?`₦${Number(form.totalFund).toLocaleString()}M`:"—"],["States",form.states.length>0?form.states.slice(0,3).join(", ")+(form.states.length>3?` +${form.states.length-3}`:""):"—"],["Crops",form.crops.slice(0,3).join(", ")||"—"],["Loan Range",form.minLoan&&form.maxLoan?`₦${Number(form.minLoan).toLocaleString()} – ₦${Number(form.maxLoan).toLocaleString()}`:"—"],["Interest",form.interest?`${form.interest}% p.a.`:form.type==="Grant"?"0% (Grant)":"—"],["Duration",`${form.duration} months`],["Layers",`${form.layers.length} tranches`]].map(([k,v])=>(
            <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:`1px solid ${borderC}` }}>
              <span style={{ fontSize:12, color:mutedC }}>{k}</span><span style={{ fontSize:12, fontWeight:600, color:textC, textAlign:"right", maxWidth:220 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <button style={{ padding:11, borderRadius:10, border:`1px solid ${borderC}`, background:"none", color:mutedC, fontSize:13, cursor:"pointer" }}>Save as Draft</button>
          <button style={{ padding:11, borderRadius:10, border:"none", background:"#1B5E20", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>🚀 Publish Program</button>
        </div>
      </div>
    );
    return null;
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:bgC, borderRadius:20, width:"100%", maxWidth:560, maxHeight:"88vh", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 25px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ padding:"20px 24px 16px", borderBottom:`1px solid ${borderC}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div><h2 style={{ fontSize:16, fontWeight:700, color:textC, margin:0 }}>Create New Program</h2><p style={{ fontSize:12, color:mutedC, margin:"2px 0 0" }}>Step {step+1} of {STEPS.length} — {STEPS[step]}</p></div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, border:`1px solid ${borderC}`, background:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:mutedC }}><X size={15} /></button>
        </div>
        <div style={{ padding:"14px 24px", borderBottom:`1px solid ${borderC}` }}>
          <div style={{ display:"flex", gap:4 }}>
            {STEPS.map((s,i)=>(
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4, cursor:i<step?"pointer":"default" }} onClick={()=>i<step&&setStep(i)}>
                <div style={{ width:"100%", height:4, borderRadius:4, background: i<step?"#16a34a":i===step?"#1B5E20":borderC }} />
                <span style={{ fontSize:10, color:i===step?"#1B5E20":mutedC, fontWeight:i===step?600:400, whiteSpace:"nowrap" }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"20px 24px" }}>{renderStep()}</div>
        <div style={{ padding:"14px 24px", borderTop:`1px solid ${borderC}`, display:"flex", gap:10 }}>
          {step>0&&<button onClick={()=>setStep(step-1)} style={{ flex:1, padding:10, borderRadius:10, border:`1px solid ${borderC}`, background:"none", color:mutedC, fontSize:13, cursor:"pointer" }}>← Back</button>}
          {step<STEPS.length-1&&<button onClick={()=>setStep(step+1)} style={{ flex:2, padding:10, borderRadius:10, border:"none", background:"#1B5E20", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>Continue <ArrowRight size={14} /></button>}
        </div>
      </div>
    </div>
  );
}

function ProgramCard({ prog, dark }) {
  const borderC=dark?"#374151":"#e5e7eb"; const textC=dark?"#f9fafb":"#111827"; const mutedC=dark?"#9ca3af":"#6b7280"; const surface=dark?"#1f2937":"#ffffff";
  const pct=Math.round((prog.disbursed/prog.totalPool)*100);
  const Icon=prog.icon;
  const statusMap={Active:{bg:"#dcfce7",color:"#16a34a"},Draft:{bg:"#fef3c7",color:"#d97706"},Closed:{bg:dark?"#374151":"#f3f4f6",color:mutedC}};
  const typeMap={Loan:{bg:"#dbeafe",color:"#1d4ed8"},Grant:{bg:"#ede9fe",color:"#7c3aed"},Hybrid:{bg:"#fce7f3",color:"#be185d"}};
  const st=statusMap[prog.status]||statusMap.Active; const ty=typeMap[prog.type]||typeMap.Loan;
  return (
    <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:16, overflow:"hidden", boxShadow: dark?"none":"0 2px 10px rgba(0,0,0,0.05)" }}>
      <div style={{ height:4, background:prog.color }} />
      <div style={{ padding:"18px 20px" }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:14 }}>
          <div style={{ width:40, height:40, borderRadius:10, background:prog.bgLight, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Icon size={20} color={prog.color} /></div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", gap:6, marginBottom:5, flexWrap:"wrap" }}>
              <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:4, background:st.bg, color:st.color }}>{prog.status==="Active"?"● ":""}{prog.status.toUpperCase()}</span>
              <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:4, background:ty.bg, color:ty.color }}>{prog.type.toUpperCase()}</span>
            </div>
            <h3 style={{ fontSize:13, fontWeight:700, color:textC, margin:"0 0 2px", lineHeight:1.3 }}>{prog.name}</h3>
            <p style={{ fontSize:11, color:mutedC, margin:0 }}>{prog.lender}</p>
          </div>
          <button style={{ width:28, height:28, borderRadius:7, border:`1px solid ${borderC}`, background:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:mutedC, flexShrink:0 }}><MoreHorizontal size={14} /></button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6, marginBottom:14 }}>
          {[{l:"Borrowers",v:prog.borrowers.toLocaleString(),c:prog.color},{l:"States",v:prog.states,c:"#6b7280"},{l:"Interest",v:prog.type==="Grant"?"0%":`${prog.interest}%`,c:prog.type==="Grant"?"#7c3aed":"#2563eb"},{l:"Repay",v:prog.status==="Draft"?"—":`${prog.repayRate}%`,c:prog.repayRate>=85?"#16a34a":prog.repayRate>=70?"#d97706":"#dc2626"}].map(({l,v,c})=>(
            <div key={l} style={{ textAlign:"center", padding:"8px 4px", background: dark?"#111827":"#f9fafb", borderRadius:8 }}>
              <p style={{ fontSize:14, fontWeight:700, color:c, margin:"0 0 2px" }}>{v}</p>
              <p style={{ fontSize:10, color:mutedC, margin:0 }}>{l}</p>
            </div>
          ))}
        </div>
        <div style={{ marginBottom:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
            <span style={{ fontSize:11, color:mutedC }}>Fund utilisation</span>
            <span style={{ fontSize:11, fontWeight:700, color:textC }}>₦{prog.disbursed}M / ₦{prog.totalPool}M ({pct}%)</span>
          </div>
          <div style={{ height:6, borderRadius:6, background: dark?"#374151":"#e5e7eb", overflow:"hidden" }}><div style={{ width:`${pct}%`, height:"100%", borderRadius:6, background: pct===100?"#6b7280":prog.color }} /></div>
        </div>
        <div style={{ display:"flex", gap:4, marginBottom:14 }}>
          {Array.from({length:prog.layers}).map((_,i)=>{
            const rel=prog.status!=="Draft"&&(i===0||(i===1&&pct>30));
            return <div key={i} style={{ flex:1, display:"flex", alignItems:"center", gap:4, padding:"5px 7px", borderRadius:6, background: rel?(dark?"#0a2010":"#dcfce7"):(dark?"#111827":"#f3f4f6") }}>{rel?<Unlock size={10} color="#16a34a" />:<Lock size={10} color={mutedC} />}<span style={{ fontSize:10, color:rel?"#16a34a":mutedC, fontWeight:500 }}>L{i+1}</span></div>;
          })}
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:14 }}>
          {prog.cropTypes.map(c=>{const cc=cropColors[c]||{bg:"#f3f4f6",color:"#6b7280"};return <span key={c} style={{ fontSize:10, fontWeight:600, padding:"2px 7px", borderRadius:4, background:cc.bg, color:cc.color }}>{c}</span>;})}
          <span style={{ marginLeft:"auto", fontSize:10, color:mutedC, display:"flex", alignItems:"center", gap:3 }}><Calendar size={10} /> {prog.deadline}</span>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button style={{ flex:1, padding:8, borderRadius:8, border:`1px solid ${prog.color}`, background:"none", color:prog.color, fontSize:12, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}><Eye size={13} /> View</button>
          <button style={{ flex:1, padding:8, borderRadius:8, border:"none", background: prog.status==="Closed"?(dark?"#374151":"#f3f4f6"):prog.color, color: prog.status==="Closed"?mutedC:"#fff", fontSize:12, fontWeight:600, cursor: prog.status==="Closed"?"default":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
            {prog.status==="Draft"?<><Pencil size={13}/> Edit</>:prog.status==="Closed"?<><Copy size={13}/> Duplicate</>:<><BarChart2 size={13}/> Manage</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function LoanProgramsPage({ dark }) {
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [search, setSearch] = useState("");
  const surface=dark?"#1f2937":"#ffffff"; const borderC=dark?"#374151":"#e5e7eb"; const textC=dark?"#f9fafb":"#111827"; const mutedC=dark?"#9ca3af":"#6b7280";
  const filtered=programs.filter(p=>(filterStatus==="All"||p.status===filterStatus)&&(filterType==="All"||p.type===filterType)&&(p.name.toLowerCase().includes(search.toLowerCase())||p.lender.toLowerCase().includes(search.toLowerCase())));
  const stats=[{l:"Total Programs",v:programs.length,c:"#1B5E20",bg:"#dcfce7"},{l:"Active",v:programs.filter(p=>p.status==="Active").length,c:"#16a34a",bg:"#f0fdf4"},{l:"Total Pool",v:"₦5.25B",c:"#2563eb",bg:"#dbeafe"},{l:"Disbursed",v:"₦2.78B",c:"#7c3aed",bg:"#ede9fe"}];
  return (
    <main style={{ flex:1, padding:24, overflowY:"auto" }}>
      {showModal&&<CreateProgramModal dark={dark} onClose={()=>setShowModal(false)} />}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
        <div><h1 style={{ fontSize:22, fontWeight:700, color:textC, margin:"0 0 4px" }}>Loan Programs</h1><p style={{ fontSize:13, color:mutedC, margin:0 }}>Manage all active and upcoming funding programs</p></div>
        <div style={{ display:"flex", gap:10 }}>
          <button style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, padding:"8px 14px", borderRadius:8, border:`1px solid ${borderC}`, background:surface, color:mutedC, cursor:"pointer" }}><Download size={13} /> Export</button>
          <button onClick={()=>setShowModal(true)} style={{ background:"#F9A825", color:"#1B5E20", fontWeight:600, fontSize:13, padding:"8px 16px", borderRadius:10, border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><Plus size={15} /> New Program</button>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        {stats.map(({l,v,c,bg:sbg})=>(
          <div key={l} style={{ background: dark?"#1f2937":sbg, border:`1px solid ${dark?"#374151":"transparent"}`, borderRadius:12, padding:"14px 16px" }}>
            <p style={{ fontSize:22, fontWeight:700, color: dark?"#f9fafb":c, margin:"0 0 3px" }}>{v}</p>
            <p style={{ fontSize:12, color:mutedC, margin:0 }}>{l}</p>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, flexWrap:"wrap" }}>
        <div style={{ display:"flex", gap:6 }}>
          {["All","Active","Draft","Closed"].map(s=><button key={s} onClick={()=>setFilterStatus(s)} style={{ fontSize:12, padding:"6px 14px", borderRadius:8, border:`1px solid ${filterStatus===s?"#1B5E20":borderC}`, background: filterStatus===s?"#1B5E20":surface, color: filterStatus===s?"#fff":mutedC, fontWeight: filterStatus===s?600:400, cursor:"pointer" }}>{s}</button>)}
        </div>
        <div style={{ width:1, height:24, background:borderC }} />
        <div style={{ display:"flex", gap:6 }}>
          {["All","Loan","Grant","Hybrid"].map(t=><button key={t} onClick={()=>setFilterType(t)} style={{ fontSize:12, padding:"6px 14px", borderRadius:8, border:`1px solid ${filterType===t?"#7c3aed":borderC}`, background: filterType===t?"#7c3aed":surface, color: filterType===t?"#fff":mutedC, fontWeight: filterType===t?600:400, cursor:"pointer" }}>{t}</button>)}
        </div>
        <span style={{ marginLeft:"auto", fontSize:12, color:mutedC }}>{filtered.length} program{filtered.length!==1?"s":""}</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:16 }}>
        {filtered.map(prog=><ProgramCard key={prog.id} prog={prog} dark={dark} />)}
        <button onClick={()=>setShowModal(true)} style={{ border:`2px dashed ${borderC}`, borderRadius:16, padding:"40px 24px", background:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, minHeight:200 }}>
          <div style={{ width:44, height:44, borderRadius:12, background: dark?"#374151":"#f0fdf4", display:"flex", alignItems:"center", justifyContent:"center" }}><Plus size={22} color={mutedC} /></div>
          <div style={{ textAlign:"center" }}><p style={{ fontSize:13, fontWeight:600, color:textC, margin:"0 0 4px" }}>Create New Program</p><p style={{ fontSize:12, color:mutedC, margin:0 }}>Set up a loan or grant program</p></div>
        </button>
      </div>
    </main>
  );
}

// ─── BORROWERS PAGE ───────────────────────────────────────────────────────────

const statusStyles = {
  Active:      { bg:"#dcfce7", color:"#16a34a" },
  "At Risk":   { bg:"#fef3c7", color:"#d97706" },
  Defaulting:  { bg:"#fee2e2", color:"#dc2626" },
  Completed:   { bg:"#dbeafe", color:"#2563eb" },
};

function ScoreRing({ score, size=64 }) {
  const r = (size/2)-6; const circ = 2*Math.PI*r; const pct = score/850;
  const col = score>=750?"#16a34a":score>=600?"#2563eb":score>=450?"#d97706":"#dc2626";
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={5} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={5} strokeDasharray={circ} strokeDashoffset={circ*(1-pct)} strokeLinecap="round" />
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column" }}>
        <span style={{ fontSize:size>50?13:10, fontWeight:700, color:col, lineHeight:1 }}>{score}</span>
      </div>
    </div>
  );
}

function BorrowerDetail({ borrower, dark, onBack }) {
  const [tab, setTab] = useState("Overview");
  const surface=dark?"#1f2937":"#ffffff"; const borderC=dark?"#374151":"#e5e7eb"; const textC=dark?"#f9fafb":"#111827"; const mutedC=dark?"#9ca3af":"#6b7280"; const bgPage=dark?"#111827":"#f0fdf4";
  const st = statusStyles[borrower.status]||statusStyles.Active;
  const scoreCol = borrower.score>=750?"#16a34a":borrower.score>=600?"#2563eb":borrower.score>=450?"#d97706":"#dc2626";
  const tabs=["Overview","Loan History","Farm Reports","Documents","Messages"];
  const scoreBreakdown=[{l:"Identity Verification",v:95},{l:"Repayment History",v: borrower.score>=700?88:borrower.score>=500?60:35},{l:"Farm Activity Reports",v: borrower.score>=700?82:borrower.score>=500?55:28},{l:"Loan Utilisation",v: borrower.score>=700?79:borrower.score>=500?58:40},{l:"Farming Experience",v:70}];

  return (
    <main style={{ flex:1, overflowY:"auto", background:bgPage }}>
      {/* Back bar */}
      <div style={{ padding:"16px 24px", background:surface, borderBottom:`1px solid ${borderC}`, display:"flex", alignItems:"center", gap:10 }}>
        <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", color:mutedC, fontSize:13 }}><ChevronLeft size={16} /> Back to Borrowers</button>
        <span style={{ color:borderC }}>|</span>
        <span style={{ fontSize:13, color:mutedC }}>{borrower.id}</span>
      </div>

      {/* Hero */}
      <div style={{ margin:24, background:surface, border:`1px solid ${borderC}`, borderRadius:16, overflow:"hidden" }}>
        <div style={{ height:6, background: scoreCol }} />
        <div style={{ padding:"20px 24px", display:"flex", alignItems:"flex-start", gap:20, flexWrap:"wrap" }}>
          <div style={{ width:56, height:56, borderRadius:"50%", background: dark?"#1B5E20":"#dcfce7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, fontWeight:700, color:"#16a34a", flexShrink:0 }}>
            {borrower.name.split(" ").map(n=>n[0]).join("")}
          </div>
          <div style={{ flex:1, minWidth:200 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom:4 }}>
              <h2 style={{ fontSize:18, fontWeight:700, color:textC, margin:0 }}>{borrower.name}</h2>
              <span style={{ fontSize:11, fontWeight:700, padding:"3px 8px", borderRadius:5, background:st.bg, color:st.color }}>● {borrower.status.toUpperCase()}</span>
            </div>
            <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
              {[{Icon:MapPin,v:`${borrower.lga}, ${borrower.state}`},{Icon:Phone,v:borrower.phone},{Icon:Sprout,v:borrower.crop},{Icon:FileText,v:borrower.program}].map(({Icon,v},i)=>(
                <span key={i} style={{ fontSize:12, color:mutedC, display:"flex", alignItems:"center", gap:4 }}><Icon size={12} />{v}</span>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
            <ScoreRing score={borrower.score} size={72} />
            <span style={{ fontSize:10, color:mutedC, fontWeight:600, textTransform:"uppercase" }}>FarmScore</span>
            <span style={{ fontSize:11, fontWeight:700, color:scoreCol }}>
              {borrower.score>=750?"Platinum":borrower.score>=650?"Gold":borrower.score>=500?"Silver":"Bronze"}
            </span>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", borderTop:`1px solid ${borderC}` }}>
          {[{l:"Loan Amount",v:borrower.loan,c:textC},{l:"Disbursed",v:borrower.disbursed,c:"#2563eb"},{l:"Repaid",v:borrower.repaid,c:"#16a34a"},{l:"Farm Size",v:borrower.farm,c:textC},{l:"Joined",v:borrower.joined,c:textC},{l:"Last Report",v:borrower.lastReport,c: borrower.lastReport.includes("day")&&parseInt(borrower.lastReport)>14?"#dc2626":mutedC}].map(({l,v,c})=>(
            <div key={l} style={{ padding:"12px 20px", borderRight:`1px solid ${borderC}` }}>
              <p style={{ fontSize:12, color:mutedC, margin:"0 0 3px" }}>{l}</p>
              <p style={{ fontSize:14, fontWeight:600, color:c, margin:0 }}>{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginInline:24 }}>
        <div style={{ display:"flex", gap:2, borderBottom:`1px solid ${borderC}`, marginBottom:20 }}>
          {tabs.map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{ padding:"10px 16px", fontSize:13, fontWeight: tab===t?600:400, color: tab===t?"#1B5E20":mutedC, background:"none", border:"none", borderBottom: tab===t?"2px solid #1B5E20":"2px solid transparent", cursor:"pointer", marginBottom:-1 }}>{t}</button>
          ))}
        </div>

        {tab==="Overview" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24 }}>
            {/* KYC card */}
            <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:14, padding:18 }}>
              <h4 style={{ fontSize:13, fontWeight:600, color:textC, margin:"0 0 14px" }}>KYC Verification</h4>
              {[{l:"BVN",v:"✓ Verified",c:"#16a34a"},{l:"NIN",v:"✓ Verified",c:"#16a34a"},{l:"Phone",v:borrower.phone,c:textC},{l:"Gender",v:borrower.gender==="F"?"Female":"Male",c:textC},{l:"State",v:borrower.state,c:textC},{l:"LGA",v:borrower.lga,c:textC}].map(({l,v,c})=>(
                <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${borderC}` }}>
                  <span style={{ fontSize:12, color:mutedC }}>{l}</span>
                  <span style={{ fontSize:12, fontWeight:600, color:c }}>{v}</span>
                </div>
              ))}
            </div>

            {/* FarmScore breakdown */}
            <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:14, padding:18 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                <h4 style={{ fontSize:13, fontWeight:600, color:textC, margin:0 }}>FarmScore Breakdown</h4>
                <span style={{ fontSize:22, fontWeight:800, color:scoreCol }}>{borrower.score}</span>
              </div>
              {scoreBreakdown.map(({l,v})=>(
                <div key={l} style={{ marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:11, color:mutedC }}>{l}</span>
                    <span style={{ fontSize:11, fontWeight:600, color:textC }}>{v}/100</span>
                  </div>
                  <div style={{ height:5, borderRadius:5, background: dark?"#374151":"#e5e7eb", overflow:"hidden" }}>
                    <div style={{ width:`${v}%`, height:"100%", borderRadius:5, background: v>=80?"#16a34a":v>=60?"#2563eb":"#d97706" }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Disbursement layers */}
            <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:14, padding:18 }}>
              <h4 style={{ fontSize:13, fontWeight:600, color:textC, margin:"0 0 14px" }}>Disbursement Layers</h4>
              {borrower.layers.map((released,i)=>(
                <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:`1px solid ${borderC}` }}>
                  <div style={{ width:32, height:32, borderRadius:8, background: released?(dark?"#0a2010":"#dcfce7"):(dark?"#374151":"#f3f4f6"), display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {released?<Unlock size={14} color="#16a34a" />:<Lock size={14} color={mutedC} />}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:13, fontWeight:600, color:textC, margin:0 }}>Layer {i+1} — {["Land Preparation","Planting & Inputs","Crop Maintenance"][i]}</p>
                    <p style={{ fontSize:11, color:mutedC, margin:"2px 0 0" }}>{released?"Released & confirmed":"Pending verification"}</p>
                  </div>
                  <span style={{ fontSize:11, fontWeight:600, padding:"3px 8px", borderRadius:6, background: released?"#dcfce7":"#f3f4f6", color: released?"#16a34a":mutedC }}>{released?"✓ Done":"Locked"}</span>
                </div>
              ))}
            </div>

            {/* Farm info */}
            <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:14, padding:18 }}>
              <h4 style={{ fontSize:13, fontWeight:600, color:textC, margin:"0 0 14px" }}>Farm Information</h4>
              {[{l:"Crop Type",v:borrower.crop},{l:"Farm Size",v:borrower.farm},{l:"Program",v:borrower.program},{l:"Agent Verified",v:"Yes — Apr 2025"},{l:"GPS Mapped",v:"✓ Recorded"},{l:"Last Farm Report",v:borrower.lastReport}].map(({l,v})=>(
                <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${borderC}` }}>
                  <span style={{ fontSize:12, color:mutedC }}>{l}</span>
                  <span style={{ fontSize:12, fontWeight:600, color:textC }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="Farm Reports" && (
          <div style={{ marginBottom:24 }}>
            {[{month:"May 2025",stage:"Flowering",challenge:"None",photos:4,score:"+12 pts"},{month:"Apr 2025",stage:"Growing",challenge:"Pest pressure",photos:3,score:"+8 pts"},{month:"Mar 2025",stage:"Planting",challenge:"None",photos:5,score:"+15 pts"}].map((r,i)=>(
              <div key={i} style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:14, padding:18, marginBottom:12 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:"#dcfce7", display:"flex", alignItems:"center", justifyContent:"center" }}><Sprout size={18} color="#16a34a" /></div>
                    <div><p style={{ fontSize:13, fontWeight:600, color:textC, margin:0 }}>{r.month} Report</p><p style={{ fontSize:11, color:mutedC, margin:0 }}>Crop stage: {r.stage}</p></div>
                  </div>
                  <span style={{ fontSize:12, fontWeight:700, color:"#16a34a", background:"#dcfce7", padding:"4px 10px", borderRadius:8 }}>{r.score}</span>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  {[{l:"Photos",v:`${r.photos} uploaded`},{l:"Challenge",v:r.challenge},{l:"Status",v:"Verified ✓"}].map(({l,v})=>(
                    <div key={l} style={{ flex:1, background: dark?"#111827":"#f9fafb", borderRadius:8, padding:"8px 10px" }}>
                      <p style={{ fontSize:10, color:mutedC, margin:"0 0 2px", textTransform:"uppercase" }}>{l}</p>
                      <p style={{ fontSize:12, fontWeight:600, color:textC, margin:0 }}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==="Messages" && (
          <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:14, overflow:"hidden", marginBottom:24 }}>
            <div style={{ padding:"14px 18px", borderBottom:`1px solid ${borderC}` }}>
              <h4 style={{ fontSize:13, fontWeight:600, color:textC, margin:0 }}>Messages with {borrower.name}</h4>
            </div>
            <div style={{ padding:18, display:"flex", flexDirection:"column", gap:12, minHeight:200 }}>
              {[{from:"lender",msg:"Your Layer 2 disbursement of ₦135,000 has been processed.",time:"2 days ago"},{from:"borrower",msg:"Thank you! I have purchased the seedlings and fertilizer.",time:"2 days ago"},{from:"lender",msg:"Great. Please submit your planting photos within 7 days.",time:"1 day ago"}].map((m,i)=>(
                <div key={i} style={{ display:"flex", justifyContent: m.from==="lender"?"flex-start":"flex-end" }}>
                  <div style={{ maxWidth:"70%", padding:"10px 14px", borderRadius: m.from==="lender"?"4px 14px 14px 14px":"14px 4px 14px 14px", background: m.from==="lender"?(dark?"#1B5E20":"#dcfce7"):(dark?"#374151":"#f3f4f6") }}>
                    <p style={{ fontSize:13, color:textC, margin:"0 0 4px" }}>{m.msg}</p>
                    <p style={{ fontSize:10, color:mutedC, margin:0 }}>{m.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding:"12px 18px", borderTop:`1px solid ${borderC}`, display:"flex", gap:10 }}>
              <input style={{ flex:1, background: dark?"#374151":"#f9fafb", border:`1px solid ${borderC}`, borderRadius:10, padding:"10px 14px", fontSize:13, color:textC, outline:"none" }} placeholder="Type a message..." />
              <button style={{ padding:"10px 18px", background:"#1B5E20", color:"#fff", border:"none", borderRadius:10, fontSize:13, fontWeight:600, cursor:"pointer" }}>Send</button>
            </div>
          </div>
        )}

        {(tab==="Loan History"||tab==="Documents") && (
          <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:14, padding:40, textAlign:"center", marginBottom:24 }}>
            <p style={{ fontSize:14, color:mutedC }}>No {tab.toLowerCase()} to display yet.</p>
          </div>
        )}
      </div>
    </main>
  );
}

function BorrowersPage({ dark }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const surface=dark?"#1f2937":"#ffffff"; const borderC=dark?"#374151":"#e5e7eb"; const textC=dark?"#f9fafb":"#111827"; const mutedC=dark?"#9ca3af":"#6b7280";
  const filtered=borrowers.filter(b=>(filterStatus==="All"||b.status===filterStatus)&&(b.name.toLowerCase().includes(search.toLowerCase())||b.state.toLowerCase().includes(search.toLowerCase())||b.crop.toLowerCase().includes(search.toLowerCase())));

  if (selectedBorrower) return <BorrowerDetail borrower={selectedBorrower} dark={dark} onBack={()=>setSelectedBorrower(null)} />;

  const summaryStats=[
    {l:"Total Borrowers",v:borrowers.length,c:"#1B5E20",bg:"#dcfce7"},
    {l:"Active",v:borrowers.filter(b=>b.status==="Active").length,c:"#16a34a",bg:"#f0fdf4"},
    {l:"At Risk",v:borrowers.filter(b=>b.status==="At Risk").length,c:"#d97706",bg:"#fef3c7"},
    {l:"Defaulting",v:borrowers.filter(b=>b.status==="Defaulting").length,c:"#dc2626",bg:"#fee2e2"},
  ];

  return (
    <main style={{ flex:1, padding:24, overflowY:"auto" }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
        <div><h1 style={{ fontSize:22, fontWeight:700, color:textC, margin:"0 0 4px" }}>Borrowers</h1><p style={{ fontSize:13, color:mutedC, margin:0 }}>All registered farmers and their loan status</p></div>
        <button style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, padding:"8px 14px", borderRadius:8, border:`1px solid ${borderC}`, background:surface, color:mutedC, cursor:"pointer" }}><Download size={13} /> Export CSV</button>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        {summaryStats.map(({l,v,c,bg:sbg})=>(
          <div key={l} style={{ background: dark?"#1f2937":sbg, border:`1px solid ${dark?"#374151":"transparent"}`, borderRadius:12, padding:"14px 16px" }}>
            <p style={{ fontSize:22, fontWeight:700, color: dark?"#f9fafb":c, margin:"0 0 3px" }}>{v}</p>
            <p style={{ fontSize:12, color:mutedC, margin:0 }}>{l}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, maxWidth:320, background: dark?"#374151":"#f0fdf4", border:`1px solid ${dark?"#4b5563":"#bbf7d0"}`, borderRadius:10, padding:"8px 12px" }}>
          <Search size={14} color={dark?"#9ca3af":"#4ade80"} />
          <input value={search} onChange={e=>setSearch(e.target.value)} style={{ background:"none", border:"none", outline:"none", fontSize:13, flex:1, color:textC }} placeholder="Search by name, state, crop..." />
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {["All","Active","At Risk","Defaulting","Completed"].map(s=>(
            <button key={s} onClick={()=>setFilterStatus(s)} style={{ fontSize:12, padding:"6px 12px", borderRadius:8, border:`1px solid ${filterStatus===s?"#1B5E20":borderC}`, background: filterStatus===s?"#1B5E20":surface, color: filterStatus===s?"#fff":mutedC, fontWeight: filterStatus===s?600:400, cursor:"pointer" }}>{s}</button>
          ))}
        </div>
        <span style={{ marginLeft:"auto", fontSize:12, color:mutedC }}>{filtered.length} borrowers</span>
      </div>

      {/* Table */}
      <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:16, overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ background: dark?"#111827":"#f0fdf4" }}>
                {["Borrower","ID","State","Crop","Loan","Disbursed","Repaid","FarmScore","Status","Last Report","Actions"].map(h=>(
                  <th key={h} style={{ textAlign:"left", padding:"10px 16px", fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", color:mutedC, borderBottom:`1px solid ${borderC}`, whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b,i)=>{
                const st=statusStyles[b.status]||statusStyles.Active;
                const scoreCol=b.score>=750?"#16a34a":b.score>=600?"#2563eb":b.score>=450?"#d97706":"#dc2626";
                const cc=cropColors[b.crop]||{bg:"#f3f4f6",color:"#6b7280"};
                return (
                  <tr key={i} style={{ borderBottom:`1px solid ${borderC}`, cursor:"pointer" }} onClick={()=>setSelectedBorrower(b)}>
                    <td style={{ padding:"12px 16px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:32, height:32, borderRadius:"50%", background: dark?"#1B5E20":"#dcfce7", display:"flex", alignItems:"center", justifyContent:"center", color:"#16a34a", fontSize:11, fontWeight:700, flexShrink:0 }}>
                          {b.name.split(" ").map(n=>n[0]).join("")}
                        </div>
                        <span style={{ fontWeight:600, color:textC, whiteSpace:"nowrap" }}>{b.name}</span>
                      </div>
                    </td>
                    <td style={{ padding:"12px 16px", color:mutedC, fontSize:11 }}>{b.id}</td>
                    <td style={{ padding:"12px 16px", color:mutedC }}>{b.state}</td>
                    <td style={{ padding:"12px 16px" }}><span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:4, background:cc.bg, color:cc.color }}>{b.crop}</span></td>
                    <td style={{ padding:"12px 16px", fontWeight:600, color:textC }}>{b.loan}</td>
                    <td style={{ padding:"12px 16px", color:"#2563eb", fontWeight:500 }}>{b.disbursed}</td>
                    <td style={{ padding:"12px 16px", color:"#16a34a", fontWeight:500 }}>{b.repaid}</td>
                    <td style={{ padding:"12px 16px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <ScoreRing score={b.score} size={32} />
                        <span style={{ fontSize:12, fontWeight:700, color:scoreCol }}>{b.score}</span>
                      </div>
                    </td>
                    <td style={{ padding:"12px 16px" }}><span style={{ fontSize:11, fontWeight:700, padding:"3px 8px", borderRadius:6, background:st.bg, color:st.color }}>{b.status}</span></td>
                    <td style={{ padding:"12px 16px", color: b.lastReport.includes("day")&&parseInt(b.lastReport)>14?"#dc2626":mutedC, fontSize:12 }}>{b.lastReport}</td>
                    <td style={{ padding:"12px 16px" }}>
                      <div style={{ display:"flex", gap:5 }} onClick={e=>e.stopPropagation()}>
                        {[{Icon:Eye,bg:"#eff6ff",col:"#2563eb"},{Icon:MessageSquare,bg:"#f0fdf4",col:"#16a34a"},{Icon:Flag,bg:"#fee2e2",col:"#dc2626"}].map(({Icon,bg,col},idx)=>(
                          <button key={idx} style={{ width:26, height:26, borderRadius:6, background: dark?"#1f2937":bg, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <Icon size={12} color={col} />
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding:"12px 20px", borderTop:`1px solid ${borderC}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontSize:12, color:mutedC }}>Showing {filtered.length} of {borrowers.length} borrowers</span>
          <div style={{ display:"flex", gap:6 }}>
            {["← Prev","1","2","3","Next →"].map((p,i)=>(
              <button key={i} style={{ padding:"4px 10px", borderRadius:6, border:`1px solid ${borderC}`, background: p==="1"?"#1B5E20":surface, color: p==="1"?"#fff":mutedC, fontSize:12, cursor:"pointer" }}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

// ─── DISBURSEMENTS PAGE ───────────────────────────────────────────────────────

const disbursements = [
  { id:"DSB-001", borrower:"Bello Musa",    program:"CBN Rice Fund",      layer:2, amount:"₦340,000", submitted:"2 days ago",  proofDocs:3, status:"Pending",  state:"Kebbi",   score:815, daysWaiting:2  },
  { id:"DSB-002", borrower:"Amina Ibrahim", program:"BOA Smallholder",    layer:3, amount:"₦152,000", submitted:"4 days ago",  proofDocs:2, status:"Pending",  state:"Kaduna",  score:721, daysWaiting:4  },
  { id:"DSB-003", borrower:"Ngozi Eze",     program:"USAID Vegetable",    layer:2, amount:"₦60,000",  submitted:"1 day ago",   proofDocs:4, status:"Pending",  state:"Imo",     score:678, daysWaiting:1  },
  { id:"DSB-004", borrower:"Tunde Fashola", program:"Ekiti Youth Fund",   layer:1, amount:"₦75,000",  submitted:"6 days ago",  proofDocs:2, status:"Approved", state:"Ekiti",   score:658, daysWaiting:0  },
  { id:"DSB-005", borrower:"Hajiya Fatima", program:"CBN Rice Fund",      layer:3, amount:"₦200,000", submitted:"3 days ago",  proofDocs:5, status:"Approved", state:"Kano",    score:890, daysWaiting:0  },
  { id:"DSB-006", borrower:"Adaeze Okonkwo",program:"NIRSAL Cassava",     layer:1, amount:"₦135,000", submitted:"Today",       proofDocs:3, status:"Pending",  state:"Anambra", score:742, daysWaiting:0  },
  { id:"DSB-007", borrower:"Musa Garba",    program:"Kebbi Irrigation",   layer:2, amount:"₦225,000", submitted:"8 days ago",  proofDocs:1, status:"Rejected", state:"Kebbi",   score:445, daysWaiting:0  },
];

const disbHistogram = [
  {month:"Jan",amount:320},{month:"Feb",amount:480},{month:"Mar",amount:390},
  {month:"Apr",amount:620},{month:"May",amount:540},{month:"Jun",amount:780},
];

function DisbursementsPage({ dark }) {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState([]);
  const surface=dark?"#1f2937":"#ffffff"; const borderC=dark?"#374151":"#e5e7eb";
  const textC=dark?"#f9fafb":"#111827"; const mutedC=dark?"#9ca3af":"#6b7280";
  const bg=dark?"#111827":"#f0fdf4";

  const statusMap={ Pending:{bg:"#fef3c7",color:"#d97706"}, Approved:{bg:"#dcfce7",color:"#16a34a"}, Rejected:{bg:"#fee2e2",color:"#dc2626"} };
  const filtered = filter==="All" ? disbursements : disbursements.filter(d=>d.status===filter);

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s,id]);

  const topStats = [
    {l:"Pending Approval",   v:`₦${(0.762).toFixed(2)}M`, v2:"6 disbursements", col:"#d97706", bg:"linear-gradient(135deg,#F57C00,#FB8C00)"},
    {l:"Approved Today",     v:"₦450,000",                 v2:"2 disbursements", col:"#16a34a", bg:"linear-gradient(135deg,#2E7D32,#388E3C)"},
    {l:"Released This Month",v:"₦3.12M",                   v2:"28 disbursements",col:"#2563eb", bg:"linear-gradient(135deg,#1565C0,#1976D2)"},
    {l:"Avg Processing Time",v:"2.4 days",                 v2:"target: <3 days", col:"#7c3aed", bg:"linear-gradient(135deg,#6A1B9A,#7B1FA2)"},
  ];

  return (
    <main style={{ flex:1, padding:24, overflowY:"auto" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:textC, margin:"0 0 4px" }}>Disbursements</h1>
        <p style={{ fontSize:13, color:mutedC, margin:0 }}>Review and approve layered loan disbursements</p>
      </div>

      {/* Top stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        {topStats.map(({l,v,v2,bg:grad},i)=>(
          <div key={i} style={{ background: dark?"#1f2937":grad, border: dark?`1px solid ${borderC}`:"none", borderRadius:16, padding:20, boxShadow: dark?"none":"0 4px 18px rgba(0,0,0,0.13)", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:-12, right:-12, width:60, height:60, borderRadius:"50%", background:"rgba(255,255,255,0.12)" }}/>
            <p style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.07em", color: dark?"#9ca3af":"rgba(255,255,255,0.75)", margin:"0 0 8px" }}>{l}</p>
            <p style={{ fontSize:22, fontWeight:700, color: dark?"#f9fafb":"#fff", margin:"0 0 4px" }}>{v}</p>
            <p style={{ fontSize:12, color: dark?"#6b7280":"rgba(255,255,255,0.65)", margin:0 }}>{v2}</p>
          </div>
        ))}
      </div>

      {/* Chart + layer breakdown */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:14, marginBottom:20 }}>
        <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:16, padding:20 }}>
          <h3 style={{ fontSize:14, fontWeight:600, color:textC, margin:"0 0 4px" }}>Monthly Disbursements (₦ millions)</h3>
          <p style={{ fontSize:12, color:mutedC, margin:"0 0 16px" }}>Total released per month</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={disbHistogram} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark?"#374151":"#f3f4f6"} vertical={false}/>
              <XAxis dataKey="month" tick={{ fontSize:11, fill:dark?"#9CA3AF":"#6B7280" }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:11, fill:dark?"#9CA3AF":"#6B7280" }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background:dark?"#1F2937":"#fff", border:"none", borderRadius:10, fontSize:12 }} formatter={v=>[`₦${v}M`,"Disbursed"]}/>
              <Bar dataKey="amount" radius={[6,6,0,0]}>
                {disbHistogram.map((_,i)=><Cell key={i} fill={i===5?"#F9A825":"#1B5E20"}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:16, padding:20 }}>
          <h3 style={{ fontSize:14, fontWeight:600, color:textC, margin:"0 0 16px" }}>By Layer</h3>
          {[{l:"Layer 1 — Land Prep",v:42,col:"#16a34a"},{l:"Layer 2 — Planting",v:35,col:"#2563eb"},{l:"Layer 3 — Maintenance",v:23,col:"#7c3aed"}].map(({l,v,col})=>(
            <div key={l} style={{ marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <span style={{ fontSize:12, color:mutedC }}>{l}</span>
                <span style={{ fontSize:12, fontWeight:600, color:textC }}>{v}%</span>
              </div>
              <div style={{ height:8, borderRadius:8, background: dark?"#374151":"#e5e7eb" }}>
                <div style={{ width:`${v}%`, height:"100%", borderRadius:8, background:col }}/>
              </div>
            </div>
          ))}
          <div style={{ marginTop:20, padding:14, background: dark?"#0a2010":"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:10 }}>
            <p style={{ fontSize:12, fontWeight:600, color:"#16a34a", margin:"0 0 3px" }}>Diversion Prevention</p>
            <p style={{ fontSize:11, color:mutedC, margin:0 }}>Layered disbursement has reduced fund diversion by an estimated 67% vs lump-sum programs.</p>
          </div>
        </div>
      </div>

      {/* Bulk actions bar */}
      {selected.length>0 && (
        <div style={{ background:"#1B5E20", borderRadius:12, padding:"12px 20px", marginBottom:14, display:"flex", alignItems:"center", gap:14 }}>
          <span style={{ color:"#fff", fontWeight:600, fontSize:13 }}>{selected.length} selected</span>
          <button style={{ background:"#F9A825", color:"#1B5E20", border:"none", borderRadius:8, padding:"6px 16px", fontWeight:600, fontSize:13, cursor:"pointer" }}>✓ Approve All</button>
          <button style={{ background:"rgba(255,255,255,0.15)", color:"#fff", border:"none", borderRadius:8, padding:"6px 16px", fontSize:13, cursor:"pointer" }}>✗ Reject All</button>
          <button onClick={()=>setSelected([])} style={{ marginLeft:"auto", background:"none", border:"none", color:"rgba(255,255,255,0.7)", cursor:"pointer" }}><X size={16}/></button>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        {["All","Pending","Approved","Rejected"].map(s=>(
          <button key={s} onClick={()=>setFilter(s)} style={{ fontSize:12, padding:"6px 14px", borderRadius:8, border:`1px solid ${filter===s?"#1B5E20":borderC}`, background: filter===s?"#1B5E20":surface, color: filter===s?"#fff":mutedC, fontWeight: filter===s?600:400, cursor:"pointer" }}>{s} {s==="Pending"?`(${disbursements.filter(d=>d.status==="Pending").length})`:""}</button>
        ))}
        <span style={{ marginLeft:"auto", fontSize:12, color:mutedC, alignSelf:"center" }}>{filtered.length} records</span>
      </div>

      {/* Table */}
      <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:16, overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ background: dark?"#111827":"#f0fdf4" }}>
                <th style={{ width:40, padding:"10px 16px", borderBottom:`1px solid ${borderC}` }}>
                  <input type="checkbox" onChange={e=>setSelected(e.target.checked?filtered.map(d=>d.id):[])} />
                </th>
                {["Borrower","Program","Layer","Amount","Proof Docs","Days Waiting","FarmScore","Status","Action"].map(h=>(
                  <th key={h} style={{ textAlign:"left", padding:"10px 16px", fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", color:mutedC, borderBottom:`1px solid ${borderC}`, whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d,i)=>{
                const st=statusMap[d.status]||statusMap.Pending;
                const scoreCol=d.score>=750?"#16a34a":d.score>=600?"#2563eb":d.score>=450?"#d97706":"#dc2626";
                const layerColors=[{bg:"#dcfce7",c:"#16a34a"},{bg:"#dbeafe",c:"#2563eb"},{bg:"#ede9fe",c:"#7c3aed"}];
                const lc=layerColors[d.layer-1]||layerColors[0];
                return (
                  <tr key={i} style={{ borderBottom:`1px solid ${borderC}` }}>
                    <td style={{ padding:"12px 16px" }}><input type="checkbox" checked={selected.includes(d.id)} onChange={()=>toggleSelect(d.id)}/></td>
                    <td style={{ padding:"12px 16px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:32, height:32, borderRadius:"50%", background: dark?"#1B5E20":"#dcfce7", display:"flex", alignItems:"center", justifyContent:"center", color:"#16a34a", fontSize:11, fontWeight:700, flexShrink:0 }}>
                          {d.borrower.split(" ").map(n=>n[0]).join("")}
                        </div>
                        <div>
                          <p style={{ fontSize:13, fontWeight:600, color:textC, margin:0 }}>{d.borrower}</p>
                          <p style={{ fontSize:11, color:mutedC, margin:0 }}>{d.state}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:"12px 16px", color:mutedC, fontSize:12 }}>{d.program}</td>
                    <td style={{ padding:"12px 16px" }}>
                      <span style={{ fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:5, background:lc.bg, color:lc.c }}>Layer {d.layer}</span>
                    </td>
                    <td style={{ padding:"12px 16px", fontWeight:700, color:textC, fontSize:14 }}>{d.amount}</td>
                    <td style={{ padding:"12px 16px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <div style={{ display:"flex", gap:3 }}>
                          {Array.from({length:d.proofDocs}).map((_,pi)=>(
                            <div key={pi} style={{ width:8, height:24, borderRadius:3, background:"#1B5E20", opacity:0.7+pi*0.1 }}/>
                          ))}
                        </div>
                        <span style={{ fontSize:12, color:mutedC }}>{d.proofDocs} docs</span>
                      </div>
                    </td>
                    <td style={{ padding:"12px 16px" }}>
                      {d.status==="Pending" ? (
                        <span style={{ fontSize:12, fontWeight:600, padding:"3px 8px", borderRadius:6, background: d.daysWaiting>5?"#fee2e2":d.daysWaiting>2?"#fef3c7":"#dcfce7", color: d.daysWaiting>5?"#dc2626":d.daysWaiting>2?"#d97706":"#16a34a" }}>
                          {d.daysWaiting===0?"Today":`${d.daysWaiting}d`}
                        </span>
                      ) : <span style={{ color:mutedC, fontSize:12 }}>—</span>}
                    </td>
                    <td style={{ padding:"12px 16px" }}>
                      <span style={{ fontSize:12, fontWeight:700, padding:"3px 8px", borderRadius:6, background: d.score>=700?"#dcfce7":d.score>=500?"#fef3c7":"#fee2e2", color: d.score>=700?"#16a34a":d.score>=500?"#d97706":"#dc2626" }}>{d.score}</span>
                    </td>
                    <td style={{ padding:"12px 16px" }}>
                      <span style={{ fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:6, background:st.bg, color:st.color }}>{d.status}</span>
                    </td>
                    <td style={{ padding:"12px 16px" }}>
                      {d.status==="Pending" ? (
                        <div style={{ display:"flex", gap:6 }}>
                          <button style={{ padding:"5px 12px", borderRadius:7, border:"none", background:"#dcfce7", color:"#16a34a", fontSize:12, fontWeight:600, cursor:"pointer" }}>✓ Approve</button>
                          <button style={{ padding:"5px 10px", borderRadius:7, border:"none", background:"#fee2e2", color:"#dc2626", fontSize:12, fontWeight:600, cursor:"pointer" }}>✗</button>
                        </div>
                      ) : (
                        <button style={{ padding:"5px 12px", borderRadius:7, border:`1px solid ${borderC}`, background:"none", color:mutedC, fontSize:12, cursor:"pointer" }}><Eye size={13}/></button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

// ─── FIELD AGENTS PAGE ────────────────────────────────────────────────────────

const agents = [
  { id:"AGT-001", name:"Ibrahim Salisu",   state:"Kebbi",   lga:"Birnin Kebbi", zone:"North-West", verified:47, visits:23, registered:52, earnings:"₦158,000", rating:4.8, status:"Active",   phone:"0803xxx", joined:"Jan 2025", pending:3  },
  { id:"AGT-002", name:"Chioma Okafor",    state:"Anambra", lga:"Onitsha",      zone:"South-East", verified:38, visits:19, registered:41, earnings:"₦122,000", rating:4.6, status:"Active",   phone:"0706xxx", joined:"Feb 2025", pending:1  },
  { id:"AGT-003", name:"Yusuf Abdullahi",  state:"Kaduna",  lga:"Kaduna North", zone:"North-West", verified:29, visits:14, registered:33, earnings:"₦96,000",  rating:4.3, status:"Active",   phone:"0812xxx", joined:"Mar 2025", pending:5  },
  { id:"AGT-004", name:"Blessing Okonkwo", state:"Benue",   lga:"Makurdi",      zone:"North-Central",verified:55,visits:31,registered:61, earnings:"₦188,000", rating:4.9, status:"Active",   phone:"0901xxx", joined:"Dec 2024", pending:0  },
  { id:"AGT-005", name:"Amadu Bello",      state:"Kogi",    lga:"Lokoja",       zone:"North-Central",verified:12,visits:6, registered:14, earnings:"₦38,000",  rating:3.7, status:"Review",   phone:"0815xxx", joined:"Apr 2025", pending:2  },
  { id:"AGT-006", name:"Funke Adeyemi",    state:"Ekiti",   lga:"Ado-Ekiti",    zone:"South-West", verified:31, visits:18, registered:35, earnings:"₦104,000", rating:4.5, status:"Active",   phone:"0705xxx", joined:"Jan 2025", pending:1  },
];

const agentTasks = [
  { type:"verification",  borrower:"Musa Garba",     location:"Argungu, Kebbi",  due:"Today",     priority:"high"   },
  { type:"registration",  borrower:"New farmer x3",  location:"Birnin Kebbi",    due:"Tomorrow",  priority:"medium" },
  { type:"monitoring",    borrower:"Bello Musa",      location:"Birnin Kebbi",    due:"This week", priority:"low"    },
  { type:"verification",  borrower:"Aisha Mohammed",  location:"Argungu, Kebbi",  due:"Today",     priority:"high"   },
];

function StarRating({ rating }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:3 }}>
      {[1,2,3,4,5].map(s=>(
        <Star key={s} size={11} fill={s<=Math.round(rating)?"#F9A825":"none"} color={s<=Math.round(rating)?"#F9A825":"#d1d5db"} />
      ))}
      <span style={{ fontSize:11, fontWeight:600, color:"#d97706", marginLeft:2 }}>{rating}</span>
    </div>
  );
}

function FieldAgentsPage({ dark }) {
  const [activeAgent, setActiveAgent] = useState(null);
  const surface=dark?"#1f2937":"#ffffff"; const borderC=dark?"#374151":"#e5e7eb";
  const textC=dark?"#f9fafb":"#111827"; const mutedC=dark?"#9ca3af":"#6b7280";

  const topStats=[
    {l:"Total Agents",  v:agents.length,                                             grad:"linear-gradient(135deg,#1B5E20,#2E7D32)"},
    {l:"Active",        v:agents.filter(a=>a.status==="Active").length,               grad:"linear-gradient(135deg,#1565C0,#1976D2)"},
    {l:"Farmers Verified", v:agents.reduce((s,a)=>s+a.verified,0),                   grad:"linear-gradient(135deg,#6A1B9A,#7B1FA2)"},
    {l:"Total Paid Out",v:"₦706,000",                                                 grad:"linear-gradient(135deg,#E65100,#F57C00)"},
  ];

  const statusMap={ Active:{bg:"#dcfce7",color:"#16a34a"}, Review:{bg:"#fef3c7",color:"#d97706"}, Inactive:{bg:"#f3f4f6",color:"#6b7280"} };
  const taskColors={ high:{bg:"#fee2e2",color:"#dc2626"}, medium:{bg:"#fef3c7",color:"#d97706"}, low:{bg:"#dcfce7",color:"#16a34a"} };
  const taskIcons={ verification:UserCheck, registration:Users, monitoring:Eye };

  if (activeAgent) {
    const a = activeAgent;
    const st = statusMap[a.status]||statusMap.Active;
    return (
      <main style={{ flex:1, overflowY:"auto" }}>
        <div style={{ padding:"16px 24px", background:surface, borderBottom:`1px solid ${borderC}`, display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={()=>setActiveAgent(null)} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", color:mutedC, fontSize:13 }}><ChevronLeft size={16}/> Back to Agents</button>
          <span style={{ color:borderC }}>|</span>
          <span style={{ fontSize:13, color:mutedC }}>{a.id}</span>
        </div>
        <div style={{ padding:24 }}>
          {/* Agent hero */}
          <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:16, padding:"20px 24px", marginBottom:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:16 }}>
              <div style={{ width:56, height:56, borderRadius:"50%", background:"linear-gradient(135deg,#1B5E20,#2E7D32)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:18 }}>
                {a.name.split(" ").map(n=>n[0]).join("")}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                  <h2 style={{ fontSize:18, fontWeight:700, color:textC, margin:0 }}>{a.name}</h2>
                  <span style={{ fontSize:11, fontWeight:700, padding:"3px 8px", borderRadius:5, background:st.bg, color:st.color }}>● {a.status}</span>
                </div>
                <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                  {[{Icon:MapPin,v:`${a.lga}, ${a.state}`},{Icon:Phone,v:a.phone},{Icon:Calendar,v:`Joined ${a.joined}`}].map(({Icon,v},i)=>(
                    <span key={i} style={{ fontSize:12, color:mutedC, display:"flex", alignItems:"center", gap:4 }}><Icon size={12}/>{v}</span>
                  ))}
                </div>
              </div>
              <div style={{ textAlign:"center" }}>
                <StarRating rating={a.rating} />
                <p style={{ fontSize:11, color:mutedC, margin:"4px 0 0" }}>Performance rating</p>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", borderTop:`1px solid ${borderC}` }}>
              {[{l:"Farmers Registered",v:a.registered},{l:"Farms Verified",v:a.verified},{l:"Monitoring Visits",v:a.visits},{l:"Total Earned",v:a.earnings}].map(({l,v})=>(
                <div key={l} style={{ padding:"12px 16px", borderRight:`1px solid ${borderC}` }}>
                  <p style={{ fontSize:18, fontWeight:700, color:textC, margin:"0 0 3px" }}>{v}</p>
                  <p style={{ fontSize:12, color:mutedC, margin:0 }}>{l}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {/* Tasks */}
            <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:14, padding:18 }}>
              <h4 style={{ fontSize:13, fontWeight:600, color:textC, margin:"0 0 14px" }}>Assigned Tasks ({agentTasks.length})</h4>
              {agentTasks.map((t,i)=>{
                const Icon=taskIcons[t.type]||Eye;
                const tc=taskColors[t.priority]||taskColors.low;
                return (
                  <div key={i} style={{ display:"flex", gap:12, padding:"10px 0", borderBottom:`1px solid ${borderC}` }}>
                    <div style={{ width:34, height:34, borderRadius:9, background: dark?"#1f2937":tc.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Icon size={16} color={tc.color}/></div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:13, fontWeight:600, color:textC, margin:"0 0 2px" }}>{t.borrower}</p>
                      <p style={{ fontSize:11, color:mutedC, margin:0 }}>{t.location} · Due: {t.due}</p>
                    </div>
                    <span style={{ fontSize:10, fontWeight:700, padding:"3px 7px", borderRadius:5, background:tc.bg, color:tc.color, alignSelf:"center" }}>{t.priority.toUpperCase()}</span>
                  </div>
                );
              })}
            </div>

            {/* Earnings breakdown */}
            <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:14, padding:18 }}>
              <h4 style={{ fontSize:13, fontWeight:600, color:textC, margin:"0 0 14px" }}>Earnings Breakdown</h4>
              {[
                {l:`${a.registered} Registrations × ₦1,500`, v:`₦${(a.registered*1500).toLocaleString()}`, col:"#16a34a"},
                {l:`${a.verified} Verifications × ₦1,000`,   v:`₦${(a.verified*1000).toLocaleString()}`,   col:"#2563eb"},
                {l:`${a.visits} Monitoring visits × ₦500`,   v:`₦${(a.visits*500).toLocaleString()}`,     col:"#7c3aed"},
              ].map(({l,v,col})=>(
                <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid ${borderC}` }}>
                  <span style={{ fontSize:12, color:mutedC }}>{l}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:col }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop:12, padding:"12px 14px", background: dark?"#0a2010":"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontSize:13, fontWeight:600, color:textC }}>Total Earned</span>
                  <span style={{ fontSize:16, fontWeight:700, color:"#16a34a" }}>{a.earnings}</span>
                </div>
                {a.pending>0 && <p style={{ fontSize:11, color:"#d97706", margin:"6px 0 0" }}>+{a.pending} payments pending approval</p>}
              </div>
              <button style={{ width:"100%", marginTop:12, padding:"10px", borderRadius:10, border:"none", background:"#1B5E20", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                💰 Process Payout
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ flex:1, padding:24, overflowY:"auto" }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
        <div><h1 style={{ fontSize:22, fontWeight:700, color:textC, margin:"0 0 4px" }}>Field Agents</h1><p style={{ fontSize:13, color:mutedC, margin:0 }}>Manage your on-ground verification network</p></div>
        <button style={{ background:"#F9A825", color:"#1B5E20", fontWeight:600, fontSize:13, padding:"8px 16px", borderRadius:10, border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><Plus size={15}/> Recruit Agent</button>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        {topStats.map(({l,v,grad},i)=>(
          <div key={i} style={{ background: dark?"#1f2937":grad, border: dark?`1px solid ${borderC}`:"none", borderRadius:16, padding:20, boxShadow: dark?"none":"0 4px 18px rgba(0,0,0,0.13)", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:-12, right:-12, width:60, height:60, borderRadius:"50%", background:"rgba(255,255,255,0.12)" }}/>
            <p style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.07em", color: dark?"#9ca3af":"rgba(255,255,255,0.75)", margin:"0 0 8px" }}>{l}</p>
            <p style={{ fontSize:22, fontWeight:700, color: dark?"#f9fafb":"#fff", margin:0 }}>{v}</p>
          </div>
        ))}
      </div>

      {/* Agent cards grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:14 }}>
        {agents.map((a,i)=>{
          const st=statusMap[a.status]||statusMap.Active;
          return (
            <div key={i} onClick={()=>setActiveAgent(a)} style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:16, padding:18, cursor:"pointer", transition:"box-shadow 0.15s", boxShadow: dark?"none":"0 2px 8px rgba(0,0,0,0.05)" }}
              onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 20px rgba(27,94,32,0.15)"}
              onMouseLeave={e=>e.currentTarget.style.boxShadow= dark?"none":"0 2px 8px rgba(0,0,0,0.05)"}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                <div style={{ width:44, height:44, borderRadius:"50%", background:"linear-gradient(135deg,#1B5E20,#2E7D32)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:15, flexShrink:0 }}>
                  {a.name.split(" ").map(n=>n[0]).join("")}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:3 }}>
                    <p style={{ fontSize:13, fontWeight:700, color:textC, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.name}</p>
                    <span style={{ fontSize:10, fontWeight:700, padding:"2px 6px", borderRadius:4, background:st.bg, color:st.color, flexShrink:0 }}>{a.status}</span>
                  </div>
                  <p style={{ fontSize:11, color:mutedC, margin:0 }}>{a.lga}, {a.state} · {a.zone}</p>
                </div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6, marginBottom:14 }}>
                {[{l:"Registered",v:a.registered,col:"#1B5E20"},{l:"Verified",v:a.verified,col:"#2563eb"},{l:"Visits",v:a.visits,col:"#7c3aed"}].map(({l,v,col})=>(
                  <div key={l} style={{ textAlign:"center", padding:"8px 4px", background: dark?"#111827":"#f9fafb", borderRadius:8 }}>
                    <p style={{ fontSize:15, fontWeight:700, color:col, margin:"0 0 2px" }}>{v}</p>
                    <p style={{ fontSize:10, color:mutedC, margin:0 }}>{l}</p>
                  </div>
                ))}
              </div>

              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                <StarRating rating={a.rating} />
                <span style={{ fontSize:13, fontWeight:700, color:"#16a34a" }}>{a.earnings}</span>
              </div>

              {a.pending>0 && (
                <div style={{ padding:"7px 12px", background: dark?"#2d1a00":"#fef3c7", border:"1px solid #fde68a", borderRadius:8, marginBottom:12 }}>
                  <p style={{ fontSize:11, color:"#d97706", fontWeight:600, margin:0 }}>⏳ {a.pending} task{a.pending>1?"s":""} pending today</p>
                </div>
              )}

              <div style={{ display:"flex", gap:8 }}>
                <button style={{ flex:1, padding:"7px", borderRadius:8, border:`1px solid ${borderC}`, background:"none", color:mutedC, fontSize:12, cursor:"pointer" }}>Message</button>
                <button style={{ flex:1, padding:"7px", borderRadius:8, border:"none", background:"#1B5E20", color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer" }}>View Profile</button>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

// ─── REPAYMENTS PAGE ──────────────────────────────────────────────────────────

const repayments = [
  { id:"RPY-001", borrower:"Hajiya Fatima",   program:"CBN Rice Fund",    amount:"₦200,000", due:"Jun 01",  paid:"Jun 01",  status:"On Time",  method:"Bank Transfer", streak:6, score:890 },
  { id:"RPY-002", borrower:"Bello Musa",      program:"CBN Rice Fund",    amount:"₦85,000",  due:"Jun 05",  paid:"Jun 04",  status:"Early",    method:"Mobile Money",  streak:5, score:815 },
  { id:"RPY-003", borrower:"Amina Ibrahim",   program:"BOA Smallholder",  amount:"₦63,333",  due:"Jun 10",  paid:"Jun 10",  status:"On Time",  method:"USSD",          streak:3, score:721 },
  { id:"RPY-004", borrower:"Adaeze Okonkwo",  program:"NIRSAL Cassava",   amount:"₦45,000",  due:"Jun 08",  paid:"Jun 15",  status:"Late",     method:"Bank Transfer", streak:1, score:742 },
  { id:"RPY-005", borrower:"Ngozi Eze",       program:"USAID Vegetable",  amount:"₦22,500",  due:"Jun 12",  paid:"—",       status:"Overdue",  method:"—",             streak:0, score:678 },
  { id:"RPY-006", borrower:"Emeka Chukwu",    program:"BOA Smallholder",  amount:"₦50,000",  due:"May 15",  paid:"—",       status:"Defaulted",method:"—",             streak:0, score:420 },
  { id:"RPY-007", borrower:"Tunde Fashola",   program:"Ekiti Youth Fund", amount:"₦12,500",  due:"Jun 13",  paid:"Jun 13",  status:"On Time",  method:"Bank Transfer", streak:2, score:658 },
  { id:"RPY-008", borrower:"Musa Garba",      program:"Kebbi Irrigation", amount:"₦93,750",  due:"Jun 07",  paid:"—",       status:"Overdue",  method:"—",             streak:0, score:445 },
];

const repayTrend = [
  {month:"Jan",onTime:78,late:14,defaulted:8},{month:"Feb",onTime:81,late:12,defaulted:7},
  {month:"Mar",onTime:79,late:13,defaulted:8},{month:"Apr",onTime:84,late:11,defaulted:5},
  {month:"May",onTime:87,late:9, defaulted:4},{month:"Jun",onTime:89,late:8, defaulted:3},
];

function RepaymentsPage({ dark }) {
  const [filter, setFilter] = useState("All");
  const surface=dark?"#1f2937":"#ffffff"; const borderC=dark?"#374151":"#e5e7eb";
  const textC=dark?"#f9fafb":"#111827"; const mutedC=dark?"#9ca3af":"#6b7280";

  const statusMap={
    "On Time": {bg:"#dcfce7",color:"#16a34a"},
    "Early":   {bg:"#dbeafe",color:"#2563eb"},
    "Late":    {bg:"#fef3c7",color:"#d97706"},
    "Overdue": {bg:"#fee2e2",color:"#dc2626"},
    "Defaulted":{bg:"#fce7f3",color:"#be185d"},
  };
  const methodIcons={"Bank Transfer":"🏦","Mobile Money":"📱","USSD":"📲","—":"—"};
  const filtered = filter==="All" ? repayments : repayments.filter(r=>r.status===filter);

  const topStats=[
    {l:"Collected This Month", v:"₦1.24M",  v2:"18 payments",    grad:"linear-gradient(135deg,#1B5E20,#2E7D32)"},
    {l:"On-Time Rate",         v:"87.3%",   v2:"+2.1% vs May",   grad:"linear-gradient(135deg,#1565C0,#1976D2)"},
    {l:"Overdue Balance",      v:"₦248,750",v2:"3 borrowers",    grad:"linear-gradient(135deg,#B71C1C,#C62828)"},
    {l:"Average Streak",       v:"2.8 mo",  v2:"across active",  grad:"linear-gradient(135deg,#E65100,#F57C00)"},
  ];

  return (
    <main style={{ flex:1, padding:24, overflowY:"auto" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:textC, margin:"0 0 4px" }}>Repayments</h1>
        <p style={{ fontSize:13, color:mutedC, margin:0 }}>Track all loan repayments, streaks and overdue accounts</p>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        {topStats.map(({l,v,v2,grad},i)=>(
          <div key={i} style={{ background:dark?"#1f2937":grad, border:dark?`1px solid ${borderC}`:"none", borderRadius:16, padding:20, boxShadow:dark?"none":"0 4px 18px rgba(0,0,0,0.13)", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:-12, right:-12, width:60, height:60, borderRadius:"50%", background:"rgba(255,255,255,0.12)" }}/>
            <p style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.07em", color:dark?"#9ca3af":"rgba(255,255,255,0.75)", margin:"0 0 8px" }}>{l}</p>
            <p style={{ fontSize:22, fontWeight:700, color:dark?"#f9fafb":"#fff", margin:"0 0 4px" }}>{v}</p>
            <p style={{ fontSize:12, color:dark?"#6b7280":"rgba(255,255,255,0.65)", margin:0 }}>{v2}</p>
          </div>
        ))}
      </div>

      {/* Trend chart */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:14, marginBottom:20 }}>
        <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:16, padding:20 }}>
          <h3 style={{ fontSize:14, fontWeight:600, color:textC, margin:"0 0 4px" }}>Repayment Rate Trend</h3>
          <p style={{ fontSize:12, color:mutedC, margin:"0 0 16px" }}>% breakdown by outcome per month</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={repayTrend} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark?"#374151":"#f3f4f6"} vertical={false}/>
              <XAxis dataKey="month" tick={{ fontSize:11, fill:dark?"#9CA3AF":"#6B7280" }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:11, fill:dark?"#9CA3AF":"#6B7280" }} axisLine={false} tickLine={false} unit="%"/>
              <Tooltip contentStyle={{ background:dark?"#1F2937":"#fff", border:"none", borderRadius:10, fontSize:12 }} formatter={v=>[`${v}%`]}/>
              <Bar dataKey="onTime"   stackId="a" fill="#16a34a" radius={[0,0,0,0]} name="On Time"/>
              <Bar dataKey="late"     stackId="a" fill="#f59e0b" name="Late"/>
              <Bar dataKey="defaulted" stackId="a" fill="#ef4444" radius={[4,4,0,0]} name="Defaulted"/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Method breakdown */}
        <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:16, padding:20 }}>
          <h3 style={{ fontSize:14, fontWeight:600, color:textC, margin:"0 0 16px" }}>Payment Methods</h3>
          {[{m:"Bank Transfer",pct:48,col:"#1B5E20"},{m:"Mobile Money",pct:31,col:"#2563eb"},{m:"USSD",pct:14,col:"#7c3aed"},{m:"In-Kind (Produce)",pct:7,col:"#f59e0b"}].map(({m,pct,col})=>(
            <div key={m} style={{ marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <span style={{ fontSize:12, color:mutedC }}>{m}</span>
                <span style={{ fontSize:12, fontWeight:700, color:textC }}>{pct}%</span>
              </div>
              <div style={{ height:7, borderRadius:7, background:dark?"#374151":"#e5e7eb" }}>
                <div style={{ width:`${pct}%`, height:"100%", borderRadius:7, background:col }}/>
              </div>
            </div>
          ))}
          <div style={{ marginTop:16, padding:"10px 14px", background:dark?"#0a1020":"#eff6ff", border:"1px solid #bfdbfe", borderRadius:10 }}>
            <p style={{ fontSize:12, color:"#2563eb", fontWeight:600, margin:"0 0 3px" }}>💡 USSD drives rural repayment</p>
            <p style={{ fontSize:11, color:mutedC, margin:0 }}>14% of repayments come from farmers without smartphones — USSD access is critical.</p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
        {["All","On Time","Early","Late","Overdue","Defaulted"].map(s=>{
          const count = s==="All" ? repayments.length : repayments.filter(r=>r.status===s).length;
          return (
            <button key={s} onClick={()=>setFilter(s)} style={{ fontSize:12, padding:"6px 14px", borderRadius:8, border:`1px solid ${filter===s?"#1B5E20":borderC}`, background:filter===s?"#1B5E20":surface, color:filter===s?"#fff":mutedC, fontWeight:filter===s?600:400, cursor:"pointer" }}>
              {s} ({count})
            </button>
          );
        })}
        <span style={{ marginLeft:"auto", fontSize:12, color:mutedC, alignSelf:"center" }}>{filtered.length} records</span>
      </div>

      {/* Table */}
      <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:16, overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ background:dark?"#111827":"#f0fdf4" }}>
                {["Borrower","Program","Amount","Due Date","Paid Date","Method","Streak 🔥","Status","Action"].map(h=>(
                  <th key={h} style={{ textAlign:"left", padding:"10px 16px", fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", color:mutedC, borderBottom:`1px solid ${borderC}`, whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r,i)=>{
                const st=statusMap[r.status]||statusMap["On Time"];
                return (
                  <tr key={i} style={{ borderBottom:`1px solid ${borderC}` }}>
                    <td style={{ padding:"12px 16px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:32, height:32, borderRadius:"50%", background:dark?"#1B5E20":"#dcfce7", display:"flex", alignItems:"center", justifyContent:"center", color:"#16a34a", fontSize:11, fontWeight:700, flexShrink:0 }}>
                          {r.borrower.split(" ").map(n=>n[0]).join("")}
                        </div>
                        <span style={{ fontWeight:600, color:textC, whiteSpace:"nowrap" }}>{r.borrower}</span>
                      </div>
                    </td>
                    <td style={{ padding:"12px 16px", color:mutedC, fontSize:12 }}>{r.program}</td>
                    <td style={{ padding:"12px 16px", fontWeight:700, color:textC }}>{r.amount}</td>
                    <td style={{ padding:"12px 16px", color:mutedC }}>{r.due}</td>
                    <td style={{ padding:"12px 16px", color:r.paid==="—"?"#dc2626":mutedC }}>{r.paid}</td>
                    <td style={{ padding:"12px 16px", color:mutedC, fontSize:13 }}>{methodIcons[r.method]} {r.method}</td>
                    <td style={{ padding:"12px 16px" }}>
                      {r.streak>0 ? (
                        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                          <span style={{ fontSize:14 }}>🔥</span>
                          <span style={{ fontSize:13, fontWeight:700, color:"#f59e0b" }}>{r.streak} mo</span>
                        </div>
                      ) : <span style={{ color:mutedC, fontSize:12 }}>—</span>}
                    </td>
                    <td style={{ padding:"12px 16px" }}>
                      <span style={{ fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:6, background:st.bg, color:st.color }}>{r.status}</span>
                    </td>
                    <td style={{ padding:"12px 16px" }}>
                      <div style={{ display:"flex", gap:6 }}>
                        <button style={{ padding:"5px 10px", borderRadius:7, border:`1px solid ${borderC}`, background:"none", color:mutedC, fontSize:12, cursor:"pointer" }}>View</button>
                        {(r.status==="Overdue"||r.status==="Defaulted") && (
                          <button style={{ padding:"5px 10px", borderRadius:7, border:"none", background:"#fee2e2", color:"#dc2626", fontSize:12, fontWeight:600, cursor:"pointer" }}>Remind</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

// ─── REPORTS PAGE ─────────────────────────────────────────────────────────────

const reportCards = [
  { title:"Portfolio Performance",  desc:"Full breakdown of loan disbursement, repayment rates, and default analysis across all programs", icon:"📊", color:"#1B5E20", bg:"#dcfce7" },
  { title:"State-by-State Report",  desc:"Compare repayment rates, borrower counts, and default clusters across all 37 states", icon:"🗺️", color:"#2563eb", bg:"#dbeafe" },
  { title:"Crop Type Analysis",     desc:"How different crop types perform in terms of repayment, yield reporting, and fund utilisation", icon:"🌾", color:"#d97706", bg:"#fef3c7" },
  { title:"Gender & Demographics",  desc:"Breakdown by gender, age group, and cooperative membership across your borrower portfolio", icon:"👥", color:"#7c3aed", bg:"#ede9fe" },
  { title:"Default Risk Report",    desc:"Predictive analysis of high-risk borrowers based on FarmScore and repayment behaviour", icon:"⚠️", color:"#dc2626", bg:"#fee2e2" },
  { title:"Impact Report",          desc:"Jobs created, hectares farmed, estimated yield, and economic output from funded programs", icon:"🌱", color:"#0891b2", bg:"#e0f2fe" },
  { title:"Field Agent Activity",   desc:"Verification completion rates, agent performance rankings and geographic coverage", icon:"👨‍💼", color:"#be185d", bg:"#fce7f3" },
  { title:"Audit Export",           desc:"Full immutable audit trail of every approval, disbursement, and repayment for compliance", icon:"📋", color:"#374151", bg:"#f3f4f6" },
];

const impactData = [
  {metric:"Farmers Funded",       value:"23,450", icon:"👨‍🌾", change:"+18%"},
  {metric:"Hectares Farmed",      value:"41,200",  icon:"🌾",  change:"+22%"},
  {metric:"Jobs Created",         value:"8,900",   icon:"💼",  change:"+14%"},
  {metric:"Estimated Yield (MT)", value:"187,400", icon:"📦",  change:"+31%"},
];

const portfolioBreakdown = [
  {label:"Performing",  value:76, color:"#16a34a"},
  {label:"Watch List",  value:14, color:"#f59e0b"},
  {label:"Defaulting",  value:8,  color:"#ef4444"},
  {label:"Completed",   value:2,  color:"#2563eb"},
];

function ReportsPage({ dark }) {
  const [generating, setGenerating] = useState(null);
  const surface=dark?"#1f2937":"#ffffff"; const borderC=dark?"#374151":"#e5e7eb";
  const textC=dark?"#f9fafb":"#111827"; const mutedC=dark?"#9ca3af":"#6b7280";

  const handleGenerate = (title) => {
    setGenerating(title);
    setTimeout(()=>setGenerating(null), 2000);
  };

  return (
    <main style={{ flex:1, padding:24, overflowY:"auto" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:textC, margin:"0 0 4px" }}>Reports & Analytics</h1>
        <p style={{ fontSize:13, color:mutedC, margin:0 }}>Generate, export and schedule reports for donors, government and internal use</p>
      </div>

      {/* Impact metrics */}
      <div style={{ background:dark?"#0a2010":"linear-gradient(135deg,#1B5E20,#2E7D32)", borderRadius:18, padding:"20px 24px", marginBottom:20, boxShadow:dark?"none":"0 6px 24px rgba(27,94,32,0.25)" }}>
        <p style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.7)", textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 16px" }}>🌍 Total Program Impact — June 2025</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
          {impactData.map(({metric,value,icon,change})=>(
            <div key={metric} style={{ textAlign:"center" }}>
              <p style={{ fontSize:28, margin:"0 0 4px" }}>{icon}</p>
              <p style={{ fontSize:22, fontWeight:800, color:"#fff", margin:"0 0 3px" }}>{value}</p>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.7)", margin:"0 0 4px" }}>{metric}</p>
              <span style={{ fontSize:11, fontWeight:600, background:"rgba(255,255,255,0.2)", color:"#fff", padding:"2px 8px", borderRadius:12 }}>{change}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:14, marginBottom:20 }}>
        <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:16, padding:20 }}>
          <h3 style={{ fontSize:14, fontWeight:600, color:textC, margin:"0 0 4px" }}>Portfolio Health Over Time</h3>
          <p style={{ fontSize:12, color:mutedC, margin:"0 0 16px" }}>Monthly repayment performance (% of borrowers)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={repayTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark?"#374151":"#f0f0f0"}/>
              <XAxis dataKey="month" tick={{ fontSize:11, fill:dark?"#9CA3AF":"#6B7280" }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:11, fill:dark?"#9CA3AF":"#6B7280" }} axisLine={false} tickLine={false} unit="%"/>
              <Tooltip contentStyle={{ background:dark?"#1F2937":"#fff", border:"none", borderRadius:10, fontSize:12 }} formatter={v=>[`${v}%`]}/>
              <Line type="monotone" dataKey="onTime"    stroke="#16a34a" strokeWidth={2.5} dot={false} name="On Time"/>
              <Line type="monotone" dataKey="late"      stroke="#f59e0b" strokeWidth={2}   dot={false} name="Late"/>
              <Line type="monotone" dataKey="defaulted" stroke="#ef4444" strokeWidth={2}   dot={false} name="Defaulted"/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Portfolio breakdown donut */}
        <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:16, padding:20 }}>
          <h3 style={{ fontSize:14, fontWeight:600, color:textC, margin:"0 0 4px" }}>Portfolio Status</h3>
          <p style={{ fontSize:12, color:mutedC, margin:"0 0 12px" }}>Current borrower classification</p>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={portfolioBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={3} dataKey="value">
                {portfolioBreakdown.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip contentStyle={{ background:dark?"#1F2937":"#fff", border:"none", borderRadius:8, fontSize:12 }} formatter={v=>[`${v}%`]}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", flexDirection:"column", gap:7, marginTop:8 }}>
            {portfolioBreakdown.map(({label,value,color})=>(
              <div key={label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <span style={{ width:10, height:10, borderRadius:"50%", background:color, display:"inline-block" }}/>
                  <span style={{ fontSize:12, color:mutedC }}>{label}</span>
                </div>
                <span style={{ fontSize:12, fontWeight:700, color:textC }}>{value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report cards */}
      <div style={{ marginBottom:12 }}>
        <h3 style={{ fontSize:15, fontWeight:600, color:textC, margin:"0 0 14px" }}>Generate Reports</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12 }}>
          {reportCards.map(({title,desc,icon,color,bg:rbg})=>(
            <div key={title} style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:14, padding:18, display:"flex", flexDirection:"column", gap:12 }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:dark?"#1f2937":rbg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{icon}</div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:textC, margin:"0 0 4px" }}>{title}</p>
                  <p style={{ fontSize:11, color:mutedC, margin:0, lineHeight:1.5 }}>{desc}</p>
                </div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button style={{ flex:1, padding:"7px", borderRadius:8, border:`1px solid ${borderC}`, background:"none", color:mutedC, fontSize:12, cursor:"pointer" }}>Preview</button>
                <button
                  onClick={()=>handleGenerate(title)}
                  style={{ flex:1, padding:"7px", borderRadius:8, border:"none", background:generating===title?"#f3f4f6":color, color:generating===title?mutedC:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.2s" }}>
                  {generating===title?"⏳ Generating...":"⬇ Export PDF"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

// ─── MAP VIEW PAGE ────────────────────────────────────────────────────────────

const mapBorrowers = [
  { name:"Bello Musa",      state:"Kebbi",   lat:12.45, lng:4.19,  status:"active",    score:815, crop:"Rice",    amount:"₦850K" },
  { name:"Hajiya Fatima",   state:"Kano",    lat:12.00, lng:8.52,  status:"completed", score:890, crop:"Rice",    amount:"₦600K" },
  { name:"Amina Ibrahim",   state:"Kaduna",  lat:10.52, lng:7.44,  status:"active",    score:721, crop:"Maize",   amount:"₦380K" },
  { name:"Grace Adeleke",   state:"Oyo",     lat:7.38,  lng:3.93,  status:"atrisk",    score:510, crop:"Cassava", amount:"₦200K" },
  { name:"Adaeze Okonkwo",  state:"Anambra", lat:6.21,  lng:7.07,  status:"active",    score:742, crop:"Cassava", amount:"₦450K" },
  { name:"Emeka Chukwu",    state:"Anambra", lat:6.10,  lng:7.20,  status:"default",   score:420, crop:"Yam",     amount:"₦300K" },
  { name:"Tunde Fashola",   state:"Ekiti",   lat:7.62,  lng:5.22,  status:"active",    score:658, crop:"Cocoa",   amount:"₦250K" },
  { name:"Musa Garba",      state:"Kebbi",   lat:12.28, lng:4.30,  status:"atrisk",    score:445, crop:"Rice",    amount:"₦750K" },
  { name:"Ngozi Eze",       state:"Imo",     lat:5.49,  lng:7.02,  status:"active",    score:678, crop:"Vegetables",amount:"₦150K"},
  { name:"Sule Danjuma",    state:"Kogi",    lat:7.80,  lng:6.74,  status:"default",   score:390, crop:"Maize",   amount:"₦500K" },
  { name:"Ibrahim Salisu",  state:"Kebbi",   lat:12.50, lng:4.50,  status:"active",    score:780, crop:"Rice",    amount:"₦400K" },
  { name:"Funke Adeyemi",   state:"Ekiti",   lat:7.70,  lng:5.30,  status:"active",    score:710, crop:"Cocoa",   amount:"₦300K" },
];

function MapViewPage({ dark }) {
  const [selectedDot, setSelectedDot]   = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [hoveredDot, setHoveredDot]     = useState(null);
  const surface=dark?"#1f2937":"#ffffff"; const borderC=dark?"#374151":"#e5e7eb";
  const textC=dark?"#f9fafb":"#111827"; const mutedC=dark?"#9ca3af":"#6b7280";
  const mapBg=dark?"#1a2535":"#e8f5e9";

  const dotColors={ active:"#16a34a", atrisk:"#f59e0b", default:"#ef4444", completed:"#2563eb" };
  const dotLabels={ active:"Active", atrisk:"At Risk", default:"Defaulting", completed:"Completed" };

  // Nigeria bounding box approx: lat 4–14, lng 3–15
  const toX = (lng) => ((lng-3)/(15-3))*100;
  const toY = (lat) => ((14-lat)/(14-4))*100;

  const filtered = filterStatus==="all" ? mapBorrowers : mapBorrowers.filter(b=>b.status===filterStatus);

  const statCounts = {
    active:    mapBorrowers.filter(b=>b.status==="active").length,
    atrisk:    mapBorrowers.filter(b=>b.status==="atrisk").length,
    default:   mapBorrowers.filter(b=>b.status==="default").length,
    completed: mapBorrowers.filter(b=>b.status==="completed").length,
  };

  return (
    <main style={{ flex:1, padding:24, overflowY:"auto" }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:textC, margin:"0 0 4px" }}>Map View</h1>
          <p style={{ fontSize:13, color:mutedC, margin:0 }}>See exactly where your loans are — geographically</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {Object.entries(dotColors).map(([k,col])=>(
            <button key={k} onClick={()=>setFilterStatus(filterStatus===k?"all":k)} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, padding:"6px 12px", borderRadius:8, border:`2px solid ${filterStatus===k?col:borderC}`, background:filterStatus===k?(dark?"#1f2937":col+"22"):surface, color:filterStatus===k?col:mutedC, fontWeight:filterStatus===k?600:400, cursor:"pointer" }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:col, display:"inline-block" }}/>{dotLabels[k]} ({statCounts[k]})
            </button>
          ))}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:16 }}>
        {/* Map canvas */}
        <div style={{ background:mapBg, border:`1px solid ${borderC}`, borderRadius:18, overflow:"hidden", position:"relative", minHeight:520 }}>
          {/* Map header */}
          <div style={{ padding:"12px 18px", background:dark?"rgba(0,0,0,0.3)":"rgba(255,255,255,0.8)", backdropFilter:"blur(4px)", borderBottom:`1px solid ${borderC}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontSize:13, fontWeight:600, color:textC }}>🇳🇬 Nigeria — {filtered.length} borrowers shown</span>
            <div style={{ display:"flex", gap:12 }}>
              {Object.entries(dotColors).map(([k,col])=>(
                <span key={k} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:mutedC }}>
                  <span style={{ width:8, height:8, borderRadius:"50%", background:col, display:"inline-block" }}/>{dotLabels[k]}
                </span>
              ))}
            </div>
          </div>

          {/* SVG Nigeria outline + dots */}
          <div style={{ position:"relative", width:"100%", height:460 }}>
            {/* Background grid */}
            <svg width="100%" height="100%" style={{ position:"absolute", inset:0, opacity:0.15 }}>
              {[...Array(10)].map((_,i)=>(
                <g key={i}>
                  <line x1={`${i*10}%`} y1="0" x2={`${i*10}%`} y2="100%" stroke={dark?"#fff":"#1B5E20"} strokeWidth="0.5"/>
                  <line x1="0" y1={`${i*10}%`} x2="100%" y2={`${i*10}%`} stroke={dark?"#fff":"#1B5E20"} strokeWidth="0.5"/>
                </g>
              ))}
            </svg>

            {/* State regions - simplified colored zones */}
            {[
              {label:"NORTH WEST",  x:"20%", y:"15%", col:dark?"rgba(255,255,255,0.04)":"rgba(27,94,32,0.06)"},
              {label:"NORTH EAST",  x:"60%", y:"12%", col:dark?"rgba(255,255,255,0.04)":"rgba(27,94,32,0.06)"},
              {label:"NORTH CENTRAL",x:"38%",y:"32%", col:dark?"rgba(255,255,255,0.04)":"rgba(27,94,32,0.06)"},
              {label:"SOUTH WEST",  x:"16%", y:"62%", col:dark?"rgba(255,255,255,0.04)":"rgba(27,94,32,0.06)"},
              {label:"SOUTH EAST",  x:"60%", y:"68%", col:dark?"rgba(255,255,255,0.04)":"rgba(27,94,32,0.06)"},
              {label:"SOUTH SOUTH", x:"42%", y:"80%", col:dark?"rgba(255,255,255,0.04)":"rgba(27,94,32,0.06)"},
            ].map(({label,x,y,col})=>(
              <div key={label} style={{ position:"absolute", left:x, top:y, padding:"4px 10px", background:col, borderRadius:6, fontSize:10, fontWeight:600, color:dark?"rgba(255,255,255,0.3)":"rgba(27,94,32,0.4)", letterSpacing:"0.06em", pointerEvents:"none" }}>{label}</div>
            ))}

            {/* Borrower dots */}
            {filtered.map((b,i)=>{
              const x = toX(b.lng);
              const y = toY(b.lat);
              const col = dotColors[b.status];
              const isHovered = hoveredDot===i;
              const isSelected = selectedDot===i;
              return (
                <div key={i}
                  onClick={()=>setSelectedDot(selectedDot===i?null:i)}
                  onMouseEnter={()=>setHoveredDot(i)}
                  onMouseLeave={()=>setHoveredDot(null)}
                  style={{ position:"absolute", left:`${x}%`, top:`${y}%`, transform:"translate(-50%,-50%)", cursor:"pointer", zIndex: isSelected||isHovered?10:1 }}>
                  {/* Pulse ring */}
                  {(isSelected||isHovered) && (
                    <div style={{ position:"absolute", inset:-8, borderRadius:"50%", border:`2px solid ${col}`, opacity:0.4 }}/>
                  )}
                  <div style={{ width: isSelected?18:14, height: isSelected?18:14, borderRadius:"50%", background:col, border:"2px solid #fff", boxShadow:`0 2px 8px ${col}60`, transition:"all 0.15s" }}/>
                  {/* Tooltip */}
                  {isHovered && !isSelected && (
                    <div style={{ position:"absolute", bottom:"calc(100% + 8px)", left:"50%", transform:"translateX(-50%)", background:dark?"#1f2937":"#fff", border:`1px solid ${borderC}`, borderRadius:8, padding:"6px 10px", whiteSpace:"nowrap", boxShadow:"0 4px 16px rgba(0,0,0,0.15)", zIndex:20 }}>
                      <p style={{ fontSize:12, fontWeight:700, color:textC, margin:0 }}>{b.name}</p>
                      <p style={{ fontSize:11, color:mutedC, margin:0 }}>{b.state} · {b.crop}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Side panel */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {/* Summary stats */}
          <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:14, padding:18 }}>
            <h4 style={{ fontSize:13, fontWeight:600, color:textC, margin:"0 0 14px" }}>Geographic Summary</h4>
            {Object.entries(statCounts).map(([k,v])=>(
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${borderC}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ width:10, height:10, borderRadius:"50%", background:dotColors[k], display:"inline-block" }}/>
                  <span style={{ fontSize:12, color:mutedC }}>{dotLabels[k]}</span>
                </div>
                <span style={{ fontSize:13, fontWeight:700, color:textC }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Selected borrower card */}
          {selectedDot!==null && (()=>{
            const b = filtered[selectedDot];
            if (!b) return null;
            const col = dotColors[b.status];
            const scoreCol = b.score>=750?"#16a34a":b.score>=600?"#2563eb":b.score>=450?"#d97706":"#dc2626";
            return (
              <div style={{ background:surface, border:`2px solid ${col}`, borderRadius:14, padding:18 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                  <h4 style={{ fontSize:13, fontWeight:700, color:textC, margin:0 }}>{b.name}</h4>
                  <button onClick={()=>setSelectedDot(null)} style={{ background:"none", border:"none", cursor:"pointer", color:mutedC }}><X size={14}/></button>
                </div>
                {[{l:"State",v:b.state},{l:"Crop",v:b.crop},{l:"Loan",v:b.amount},{l:"FarmScore",v:b.score}].map(({l,v})=>(
                  <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${borderC}` }}>
                    <span style={{ fontSize:12, color:mutedC }}>{l}</span>
                    <span style={{ fontSize:12, fontWeight:700, color:l==="FarmScore"?scoreCol:textC }}>{v}</span>
                  </div>
                ))}
                <div style={{ marginTop:12, padding:"8px 12px", background:col+"18", border:`1px solid ${col}40`, borderRadius:8 }}>
                  <span style={{ fontSize:12, fontWeight:600, color:col }}>● {dotLabels[b.status]}</span>
                </div>
              </div>
            );
          })()}

          {/* Top states */}
          <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:14, padding:18 }}>
            <h4 style={{ fontSize:13, fontWeight:600, color:textC, margin:"0 0 12px" }}>Borrowers by State</h4>
            {Object.entries(mapBorrowers.reduce((acc,b)=>{ acc[b.state]=(acc[b.state]||0)+1; return acc; },{}))
              .sort((a,b)=>b[1]-a[1]).slice(0,5)
              .map(([state,count])=>(
                <div key={state} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                  <span style={{ fontSize:12, color:mutedC, width:70 }}>{state}</span>
                  <div style={{ flex:1, height:6, borderRadius:6, background:dark?"#374151":"#e5e7eb" }}>
                    <div style={{ width:`${(count/mapBorrowers.length)*100}%`, height:"100%", borderRadius:6, background:"#1B5E20" }}/>
                  </div>
                  <span style={{ fontSize:12, fontWeight:700, color:textC }}>{count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </main>
  );
}

// ─── MESSAGES PAGE ────────────────────────────────────────────────────────────

const conversations = [
  { id:1,  name:"Bello Musa",      avatar:"BM", program:"CBN Rice Fund",    last:"Thank you! I will repay on Friday.", time:"2 min ago",   unread:0, online:true  },
  { id:2,  name:"Adaeze Okonkwo",  avatar:"AO", program:"NIRSAL Cassava",   last:"When will Layer 2 be released?",    time:"14 min ago",  unread:2, online:true  },
  { id:3,  name:"Grace Adeleke",   avatar:"GA", program:"NIRSAL Cassava",   last:"I had issues with my farm this mo.", time:"1 hr ago",    unread:0, online:false },
  { id:4,  name:"Hajiya Fatima",   avatar:"HF", program:"CBN Rice Fund",    last:"Payment completed. Thank you!",     time:"3 hr ago",    unread:0, online:false },
  { id:5,  name:"All Borrowers",   avatar:"📢", program:"Broadcast",        last:"Reminder: June repayments due soon.", time:"Today",      unread:0, online:false, isBroadcast:true },
  { id:6,  name:"Emeka Chukwu",    avatar:"EC", program:"BOA Smallholder",  last:"I need more time to repay please.",  time:"Yesterday",  unread:1, online:false },
  { id:7,  name:"Tunde Fashola",   avatar:"TF", program:"Ekiti Youth Fund", last:"My farm is looking great this month!","time":"2 days ago",unread:0,online:false},
];

const chatMessages = {
  2: [
    { from:"borrower", text:"Good morning. My Layer 1 disbursement was received. Thank you!", time:"9:14 AM" },
    { from:"lender",   text:"Good morning Adaeze. Glad it came through. Please submit your Layer 1 farm report with photos.", time:"9:18 AM" },
    { from:"borrower", text:"I have uploaded 4 photos of the farm. Please check.", time:"10:02 AM" },
    { from:"lender",   text:"Photos received and verified. When will Layer 2 be released?", time:"10:15 AM" },
    { from:"borrower", text:"When will Layer 2 be released?", time:"10:17 AM" },
  ],
  1: [
    { from:"lender",   text:"Hello Bello. Your June repayment of ₦85,000 is due on June 5th.", time:"Yesterday 9:00 AM" },
    { from:"borrower", text:"Good morning. I will pay by Friday. My harvest came in well this month.", time:"Yesterday 11:30 AM" },
    { from:"lender",   text:"Great to hear. We will keep the account updated.", time:"Yesterday 11:45 AM" },
    { from:"borrower", text:"Thank you! I will repay on Friday.", time:"2 min ago" },
  ],
};

function MessagesPage({ dark }) {
  const [activeConv, setActiveConv] = useState(conversations[1]);
  const [newMsg, setNewMsg]         = useState("");
  const [messages, setMessages]     = useState(chatMessages);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastText, setBroadcastText] = useState("");

  const surface=dark?"#1f2937":"#ffffff"; const borderC=dark?"#374151":"#e5e7eb";
  const textC=dark?"#f9fafb":"#111827"; const mutedC=dark?"#9ca3af":"#6b7280";
  const inputBg=dark?"#374151":"#f9fafb";

  const sendMessage = () => {
    if (!newMsg.trim()) return;
    const key = activeConv.id;
    const updated = { ...messages, [key]: [...(messages[key]||[]), { from:"lender", text:newMsg, time:"Just now" }] };
    setMessages(updated);
    setNewMsg("");
  };

  const msgs = messages[activeConv.id] || [{ from:"system", text:"No messages yet in this conversation.", time:"" }];

  return (
    <main style={{ flex:1, display:"flex", overflow:"hidden" }}>
      {/* Broadcast modal */}
      {showBroadcast && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:50, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:surface, borderRadius:18, padding:24, width:480, boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
              <h3 style={{ fontSize:16, fontWeight:700, color:textC, margin:0 }}>📢 Broadcast Message</h3>
              <button onClick={()=>setShowBroadcast(false)} style={{ background:"none", border:"none", cursor:"pointer", color:mutedC }}><X size={16}/></button>
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase" }}>Send To</label>
              <select style={{ width:"100%", padding:"9px 12px", background:inputBg, border:`1px solid ${borderC}`, borderRadius:8, fontSize:13, color:textC, outline:"none" }}>
                <option>All Active Borrowers (23,450)</option>
                <option>Overdue Borrowers (3)</option>
                <option>CBN Rice Fund Borrowers (2,340)</option>
                <option>Kebbi State Borrowers (980)</option>
              </select>
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase" }}>Message</label>
              <textarea value={broadcastText} onChange={e=>setBroadcastText(e.target.value)} placeholder="Type your broadcast message here..." style={{ width:"100%", minHeight:100, padding:"9px 12px", background:inputBg, border:`1px solid ${borderC}`, borderRadius:8, fontSize:13, color:textC, outline:"none", resize:"vertical", boxSizing:"border-box" }}/>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:mutedC, cursor:"pointer" }}>
                <input type="checkbox" /> Also send as SMS
              </label>
              <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:mutedC, cursor:"pointer" }}>
                <input type="checkbox" /> Also send as WhatsApp
              </label>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:16 }}>
              <button onClick={()=>setShowBroadcast(false)} style={{ flex:1, padding:10, borderRadius:10, border:`1px solid ${borderC}`, background:"none", color:mutedC, fontSize:13, cursor:"pointer" }}>Cancel</button>
              <button onClick={()=>setShowBroadcast(false)} style={{ flex:2, padding:10, borderRadius:10, border:"none", background:"#1B5E20", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>📢 Send Broadcast</button>
            </div>
          </div>
        </div>
      )}

      {/* Conversation list */}
      <div style={{ width:300, flexShrink:0, borderRight:`1px solid ${borderC}`, display:"flex", flexDirection:"column", background:surface }}>
        <div style={{ padding:"16px 18px", borderBottom:`1px solid ${borderC}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:textC, margin:0 }}>Messages</h3>
            <button onClick={()=>setShowBroadcast(true)} style={{ fontSize:11, fontWeight:600, padding:"5px 10px", borderRadius:7, border:"none", background:"#F9A825", color:"#1B5E20", cursor:"pointer" }}>📢 Broadcast</button>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:inputBg, border:`1px solid ${borderC}`, borderRadius:9, padding:"7px 10px" }}>
            <Search size={13} color={mutedC}/><input style={{ background:"none", border:"none", outline:"none", fontSize:12, flex:1, color:textC }} placeholder="Search conversations..."/>
          </div>
        </div>
        <div style={{ flex:1, overflowY:"auto" }}>
          {conversations.map(conv=>(
            <div key={conv.id} onClick={()=>setActiveConv(conv)}
              style={{ padding:"14px 18px", borderBottom:`1px solid ${borderC}`, cursor:"pointer", background: activeConv.id===conv.id?(dark?"#0a2010":"#f0fdf4"):"transparent", borderLeft: activeConv.id===conv.id?"3px solid #1B5E20":"3px solid transparent" }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                <div style={{ position:"relative", flexShrink:0 }}>
                  <div style={{ width:38, height:38, borderRadius:"50%", background:conv.isBroadcast?"#F9A825":(dark?"#1B5E20":"#dcfce7"), display:"flex", alignItems:"center", justifyContent:"center", fontSize:conv.isBroadcast?18:12, fontWeight:700, color:conv.isBroadcast?"#1B5E20":"#16a34a" }}>{conv.avatar}</div>
                  {conv.online && <div style={{ position:"absolute", bottom:0, right:0, width:10, height:10, borderRadius:"50%", background:"#16a34a", border:"2px solid #fff" }}/>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                    <span style={{ fontSize:13, fontWeight:600, color:textC }}>{conv.name}</span>
                    <span style={{ fontSize:10, color:mutedC }}>{conv.time}</span>
                  </div>
                  <p style={{ fontSize:11, color:mutedC, margin:"0 0 3px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{conv.last}</p>
                  <span style={{ fontSize:10, color:"#1B5E20", fontWeight:500 }}>{conv.program}</span>
                </div>
                {conv.unread>0 && (
                  <div style={{ width:18, height:18, borderRadius:"50%", background:"#ef4444", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span style={{ fontSize:10, fontWeight:700, color:"#fff" }}>{conv.unread}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat window */}
      <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
        {/* Chat header */}
        <div style={{ padding:"14px 20px", borderBottom:`1px solid ${borderC}`, background:surface, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:"50%", background:activeConv.isBroadcast?"#F9A825":"#dcfce7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:activeConv.isBroadcast?18:12, fontWeight:700, color:activeConv.isBroadcast?"#1B5E20":"#16a34a" }}>{activeConv.avatar}</div>
            <div>
              <p style={{ fontSize:14, fontWeight:700, color:textC, margin:0 }}>{activeConv.name}</p>
              <p style={{ fontSize:11, color:mutedC, margin:0 }}>{activeConv.program}{activeConv.online?" · 🟢 Online":""}</p>
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button style={{ padding:"6px 12px", borderRadius:8, border:`1px solid ${borderC}`, background:"none", color:mutedC, fontSize:12, cursor:"pointer" }}>📋 View Profile</button>
            <button style={{ padding:"6px 12px", borderRadius:8, border:`1px solid ${borderC}`, background:"none", color:"#dc2626", fontSize:12, cursor:"pointer" }}>🚩 Flag</button>
          </div>
        </div>

        {/* Messages area */}
        <div style={{ flex:1, overflowY:"auto", padding:20, display:"flex", flexDirection:"column", gap:12, background:dark?"#111827":"#f8fffe" }}>
          {msgs.map((m,i)=>(
            <div key={i} style={{ display:"flex", justifyContent:m.from==="lender"?"flex-end":"flex-start" }}>
              {m.from==="system" ? (
                <div style={{ textAlign:"center", color:mutedC, fontSize:12, width:"100%" }}>{m.text}</div>
              ) : (
                <div style={{ maxWidth:"68%", display:"flex", flexDirection:"column", gap:3, alignItems:m.from==="lender"?"flex-end":"flex-start" }}>
                  <div style={{ padding:"10px 14px", borderRadius:m.from==="lender"?"18px 4px 18px 18px":"4px 18px 18px 18px", background:m.from==="lender"?(dark?"#1B5E20":"#1B5E20"):(dark?"#374151":"#ffffff"), boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }}>
                    <p style={{ fontSize:13, color:m.from==="lender"?"#fff":textC, margin:0, lineHeight:1.5 }}>{m.text}</p>
                  </div>
                  <span style={{ fontSize:10, color:mutedC }}>{m.time}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input area */}
        <div style={{ padding:"14px 20px", borderTop:`1px solid ${borderC}`, background:surface, display:"flex", gap:10, alignItems:"flex-end" }}>
          <div style={{ flex:1, background:inputBg, border:`1px solid ${borderC}`, borderRadius:12, padding:"10px 14px", display:"flex", alignItems:"center", gap:10 }}>
            <input value={newMsg} onChange={e=>setNewMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()} style={{ flex:1, background:"none", border:"none", outline:"none", fontSize:13, color:textC }} placeholder="Type a message or use a template..."/>
            <div style={{ display:"flex", gap:6 }}>
              <button style={{ fontSize:16, background:"none", border:"none", cursor:"pointer" }}>📎</button>
              <button style={{ fontSize:16, background:"none", border:"none", cursor:"pointer" }}>😊</button>
            </div>
          </div>
          <button onClick={sendMessage} style={{ width:44, height:44, borderRadius:12, background:"#1B5E20", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <ArrowRight size={18} color="#fff"/>
          </button>
        </div>

        {/* Quick templates */}
        <div style={{ padding:"8px 20px 14px", borderTop:`1px solid ${borderC}`, background:surface }}>
          <p style={{ fontSize:10, color:mutedC, margin:"0 0 7px", fontWeight:600, textTransform:"uppercase" }}>Quick Templates</p>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {["⏰ Repayment Reminder","✅ Disbursement Processed","📸 Submit Farm Report","⚠️ Overdue Warning","🎉 Congratulations"].map(t=>(
              <button key={t} onClick={()=>setNewMsg(t)} style={{ fontSize:11, padding:"4px 10px", borderRadius:20, border:`1px solid ${borderC}`, background:inputBg, color:mutedC, cursor:"pointer" }}>{t}</button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

// ─── SETTINGS PAGE ───────────────────────────────────────────────────────────

function Toggle({ on, onToggle }) {
  return (
    <div onClick={onToggle} style={{ width:44, height:24, borderRadius:12, background:on?"#1B5E20":"#d1d5db", cursor:"pointer", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
      <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:on?23:3, transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }}/>
    </div>
  );
}

function SettingsPage({ dark, setDark }) {
  const [activeTab, setActiveTab] = useState("Organization");
  const [saved, setSaved]         = useState(false);
  const [toggles, setToggles]     = useState({
    darkMode:dark, emailAlerts:true, smsAlerts:true, whatsappAlerts:true,
    repaymentReminders:true, defaultAlerts:true, weeklyReport:false,
    monthlyReport:true, twoFactor:true, auditLog:true, apiAccess:false,
    autoApprove:false, requireAgentVerify:true, layeredDisbursement:true,
  });
  const [orgForm, setOrgForm] = useState({
    orgName:"Federal Ministry of Agriculture", email:"admin@fmard.gov.ng",
    phone:"+234 803 000 0000", address:"Area 11, Garki, Abuja, FCT", country:"Nigeria",
    regNumber:"FMARD/2024/001", website:"www.fmard.gov.ng",
  });

  const surface=dark?"#1f2937":"#ffffff"; const borderC=dark?"#374151":"#e5e7eb";
  const textC=dark?"#f9fafb":"#111827"; const mutedC=dark?"#9ca3af":"#6b7280";
  const inputBg=dark?"#374151":"#f9fafb"; const bgPage=dark?"#111827":"#f0fdf4";

  const inp = { background:inputBg, border:`1px solid ${borderC}`, borderRadius:9, padding:"10px 14px", fontSize:13, color:textC, width:"100%", outline:"none", boxSizing:"border-box" };

  const tabs = ["Organization","Notifications","Disbursement Rules","Security","Integrations","Billing"];

  const tabIcons = { Organization:"🏛️", Notifications:"🔔", "Disbursement Rules":"💳", Security:"🔐", Integrations:"🔌", Billing:"💰" };

  const handleSave = () => { setSaved(true); setTimeout(()=>setSaved(false), 2500); };

  const ToggleRow = ({ label, desc, k }) => (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 0", borderBottom:`1px solid ${borderC}` }}>
      <div style={{ flex:1, paddingRight:20 }}>
        <p style={{ fontSize:13, fontWeight:600, color:textC, margin:"0 0 2px" }}>{label}</p>
        <p style={{ fontSize:12, color:mutedC, margin:0 }}>{desc}</p>
      </div>
      <Toggle on={toggles[k]} onToggle={()=>{ if(k==="darkMode") setDark(!toggles[k]); setToggles(t=>({...t,[k]:!t[k]})); }}/>
    </div>
  );

  const SectionCard = ({ title, children }) => (
    <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:16, padding:"20px 24px", marginBottom:16 }}>
      <h3 style={{ fontSize:14, fontWeight:700, color:textC, margin:"0 0 16px", paddingBottom:12, borderBottom:`1px solid ${borderC}` }}>{title}</h3>
      {children}
    </div>
  );

  const renderTab = () => {
    if (activeTab==="Organization") return (
      <div>
        <SectionCard title="Organization Profile">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            {[
              ["orgName","Organization Name"],["email","Admin Email"],
              ["phone","Phone Number"],["regNumber","Registration Number"],
              ["address","Address"],["website","Website"],
            ].map(([k,lbl])=>(
              <div key={k} style={{ gridColumn: k==="address"?"1 / -1":"auto" }}>
                <label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em" }}>{lbl}</label>
                <input style={inp} value={orgForm[k]} onChange={e=>setOrgForm({...orgForm,[k]:e.target.value})}/>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Organization Logo & Branding">
          <div style={{ display:"flex", alignItems:"center", gap:20 }}>
            <div style={{ width:72, height:72, borderRadius:18, background:"linear-gradient(135deg,#1B5E20,#2E7D32)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Leaf size={32} color="#F9A825"/>
            </div>
            <div>
              <p style={{ fontSize:13, fontWeight:600, color:textC, margin:"0 0 4px" }}>Current Logo</p>
              <p style={{ fontSize:12, color:mutedC, margin:"0 0 12px" }}>PNG or SVG, minimum 200×200px, max 2MB</p>
              <div style={{ display:"flex", gap:8 }}>
                <button style={{ padding:"7px 16px", borderRadius:8, border:`1px solid ${borderC}`, background:inputBg, color:textC, fontSize:12, cursor:"pointer" }}>Upload New Logo</button>
                <button style={{ padding:"7px 16px", borderRadius:8, border:"1px solid #fee2e2", background:"none", color:"#dc2626", fontSize:12, cursor:"pointer" }}>Remove</button>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Platform Access & User Roles">
          <div style={{ marginBottom:14 }}>
            {[
              {name:"Chukwuemeka Obi",  role:"Super Admin",  email:"c.obi@fmard.gov.ng",    avatar:"CO", status:"Active"},
              {name:"Ngozi Williams",    role:"Program Manager",email:"n.williams@fmard.gov.ng",avatar:"NW",status:"Active"},
              {name:"Ibrahim Sani",      role:"Field Supervisor",email:"i.sani@fmard.gov.ng", avatar:"IS", status:"Active"},
              {name:"Aisha Musa",        role:"Analyst",       email:"a.musa@fmard.gov.ng",   avatar:"AM", status:"Inactive"},
            ].map((u,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:`1px solid ${borderC}` }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:dark?"#1B5E20":"#dcfce7", display:"flex", alignItems:"center", justifyContent:"center", color:"#16a34a", fontSize:11, fontWeight:700, flexShrink:0 }}>{u.avatar}</div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:13, fontWeight:600, color:textC, margin:0 }}>{u.name}</p>
                  <p style={{ fontSize:11, color:mutedC, margin:0 }}>{u.email}</p>
                </div>
                <span style={{ fontSize:11, fontWeight:600, padding:"3px 9px", borderRadius:5, background:u.status==="Active"?"#dcfce7":"#f3f4f6", color:u.status==="Active"?"#16a34a":"#6b7280" }}>{u.status}</span>
                <select style={{ ...inp, width:"auto", padding:"5px 10px", fontSize:12 }} defaultValue={u.role}>
                  <option>Super Admin</option><option>Program Manager</option><option>Field Supervisor</option><option>Analyst</option><option>Viewer</option>
                </select>
              </div>
            ))}
          </div>
          <button style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:9, border:`1px dashed ${borderC}`, background:"none", color:mutedC, fontSize:13, cursor:"pointer" }}>
            <Plus size={14}/> Invite Team Member
          </button>
        </SectionCard>
      </div>
    );

    if (activeTab==="Notifications") return (
      <div>
        <SectionCard title="Appearance">
          <ToggleRow label="Dark Mode" desc="Switch between light and dark interface" k="darkMode"/>
        </SectionCard>
        <SectionCard title="Alert Channels">
          <ToggleRow label="Email Alerts" desc="Receive critical alerts via email" k="emailAlerts"/>
          <ToggleRow label="SMS Alerts" desc="Receive repayment and default alerts via SMS" k="smsAlerts"/>
          <ToggleRow label="WhatsApp Alerts" desc="Receive updates via WhatsApp Business" k="whatsappAlerts"/>
        </SectionCard>
        <SectionCard title="Event Triggers">
          <ToggleRow label="Repayment Reminders" desc="Auto-send reminders 3 days before due date" k="repaymentReminders"/>
          <ToggleRow label="Default Alerts" desc="Instant alert when a borrower misses a payment" k="defaultAlerts"/>
          <ToggleRow label="Weekly Summary Report" desc="Receive portfolio summary every Monday morning" k="weeklyReport"/>
          <ToggleRow label="Monthly Report" desc="Full monthly analytics report via email" k="monthlyReport"/>
        </SectionCard>
      </div>
    );

    if (activeTab==="Disbursement Rules") return (
      <div>
        <SectionCard title="Global Disbursement Settings">
          <ToggleRow label="Require Layered Disbursement" desc="All new programs must use tranche-based disbursement" k="layeredDisbursement"/>
          <ToggleRow label="Require Agent Verification" desc="Field agent must verify farm before Layer 2 releases" k="requireAgentVerify"/>
          <ToggleRow label="Auto-Approve Low-Risk Borrowers" desc="Automatically approve FarmScore 750+ borrowers without manual review" k="autoApprove"/>
          <div style={{ padding:"14px 0", borderBottom:`1px solid ${borderC}` }}>
            <p style={{ fontSize:13, fontWeight:600, color:textC, margin:"0 0 6px" }}>Minimum FarmScore for Auto-Approve</p>
            <input style={{...inp, width:120}} type="number" defaultValue={750}/>
          </div>
          <div style={{ padding:"14px 0", borderBottom:`1px solid ${borderC}` }}>
            <p style={{ fontSize:13, fontWeight:600, color:textC, margin:"0 0 6px" }}>Maximum Days to Approve Disbursement Request</p>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <input style={{...inp, width:80}} type="number" defaultValue={5}/>
              <span style={{ fontSize:13, color:mutedC }}>days (after proof documents submitted)</span>
            </div>
          </div>
          <div style={{ padding:"14px 0" }}>
            <p style={{ fontSize:13, fontWeight:600, color:textC, margin:"0 0 6px" }}>Farm Report Interval</p>
            <select style={{...inp, width:220}}>
              <option>Monthly (recommended)</option>
              <option>Bi-weekly</option>
              <option>Weekly</option>
            </select>
          </div>
        </SectionCard>

        <SectionCard title="Default Disbursement Layer Template">
          <p style={{ fontSize:12, color:mutedC, margin:"0 0 14px" }}>This template is pre-filled when creating new programs. You can override it per program.</p>
          {[
            {l:"Layer 1 — Land Preparation", pct:"30%", trigger:"Loan Approval"},
            {l:"Layer 2 — Planting & Inputs", pct:"40%", trigger:"Layer 1 report verified"},
            {l:"Layer 3 — Crop Maintenance",  pct:"30%", trigger:"Crop growth confirmed"},
          ].map(({l,pct,trigger},i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:`1px solid ${borderC}` }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:["#dcfce7","#dbeafe","#fef3c7"][i], display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:["#16a34a","#2563eb","#d97706"][i] }}>{i+1}</div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:13, fontWeight:600, color:textC, margin:"0 0 2px" }}>{l}</p>
                <p style={{ fontSize:11, color:mutedC, margin:0 }}>Trigger: {trigger}</p>
              </div>
              <span style={{ fontSize:13, fontWeight:700, color:textC, background:inputBg, padding:"4px 12px", borderRadius:7 }}>{pct}</span>
            </div>
          ))}
        </SectionCard>
      </div>
    );

    if (activeTab==="Security") return (
      <div>
        <SectionCard title="Authentication">
          <ToggleRow label="Two-Factor Authentication (2FA)" desc="Require 2FA for all admin logins — strongly recommended" k="twoFactor"/>
          <ToggleRow label="Audit Log" desc="Keep a full immutable log of all admin actions" k="auditLog"/>
          <div style={{ padding:"14px 0", borderBottom:`1px solid ${borderC}` }}>
            <p style={{ fontSize:13, fontWeight:600, color:textC, margin:"0 0 6px" }}>Session Timeout</p>
            <select style={{...inp, width:200}}>
              <option>30 minutes</option><option>1 hour</option><option>4 hours</option><option>8 hours</option>
            </select>
          </div>
        </SectionCard>

        <SectionCard title="Change Password">
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {["Current Password","New Password","Confirm New Password"].map(lbl=>(
              <div key={lbl}>
                <label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase" }}>{lbl}</label>
                <input style={inp} type="password" placeholder="••••••••"/>
              </div>
            ))}
            <button style={{ padding:"10px 20px", width:"fit-content", borderRadius:9, border:"none", background:"#1B5E20", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>Update Password</button>
          </div>
        </SectionCard>

        <SectionCard title="Active Sessions">
          {[{device:"Chrome on Windows",ip:"102.89.xx.xx",location:"Abuja, Nigeria",time:"Current session"},{device:"Safari on iPhone",ip:"197.210.xx.xx",location:"Lagos, Nigeria",time:"2 hours ago"}].map((s,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderBottom:`1px solid ${borderC}` }}>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:textC, margin:"0 0 2px" }}>{s.device}</p>
                <p style={{ fontSize:11, color:mutedC, margin:0 }}>{s.ip} · {s.location} · {s.time}</p>
              </div>
              {s.time==="Current session" ? (
                <span style={{ fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:5, background:"#dcfce7", color:"#16a34a" }}>● This device</span>
              ) : (
                <button style={{ fontSize:12, padding:"5px 12px", borderRadius:7, border:"1px solid #fee2e2", background:"none", color:"#dc2626", cursor:"pointer" }}>Revoke</button>
              )}
            </div>
          ))}
        </SectionCard>
      </div>
    );

    if (activeTab==="Integrations") return (
      <div>
        <ToggleRow label="API Access" desc="Enable REST API access for external systems (banks, partners)" k="apiAccess"/>
        <div style={{ height:12 }}/>
        {[
          {name:"Paystack",         desc:"Collect repayments and disburse loans via Paystack",       status:"Connected",    logo:"💳", color:"#1B5E20"},
          {name:"Flutterwave",      desc:"Alternative payment gateway for disbursement and collection",status:"Not Connected",logo:"🌊", color:"#6b7280"},
          {name:"Termii (SMS)",     desc:"Nigerian SMS provider for repayment reminders",            status:"Connected",    logo:"📱", color:"#1B5E20"},
          {name:"WhatsApp Business",desc:"Send loan updates and reminders via WhatsApp",             status:"Connected",    logo:"💬", color:"#1B5E20"},
          {name:"Google Maps API",  desc:"Farm boundary mapping and geolocation features",           status:"Connected",    logo:"🗺️", color:"#1B5E20"},
          {name:"NIBSS (BVN)",      desc:"Verify borrower identity using BVN lookup",               status:"Connected",    logo:"🏦", color:"#1B5E20"},
          {name:"NIN API (NIMC)",   desc:"National Identity Number verification service",           status:"Not Connected", logo:"🪪", color:"#6b7280"},
          {name:"AWS S3",           desc:"Cloud storage for farm photos and documents",             status:"Connected",    logo:"☁️", color:"#1B5E20"},
        ].map(({name,desc,status,logo,color})=>(
          <div key={name} style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:14, padding:"16px 18px", marginBottom:10, display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:dark?"#374151":"#f3f4f6", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{logo}</div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:14, fontWeight:700, color:textC, margin:"0 0 3px" }}>{name}</p>
              <p style={{ fontSize:12, color:mutedC, margin:0 }}>{desc}</p>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:6, background:status==="Connected"?"#dcfce7":"#f3f4f6", color:status==="Connected"?"#16a34a":"#6b7280" }}>
                {status==="Connected"?"✓ Connected":"Not Connected"}
              </span>
              <button style={{ padding:"6px 14px", borderRadius:8, border:`1px solid ${borderC}`, background:inputBg, color:textC, fontSize:12, cursor:"pointer" }}>
                {status==="Connected"?"Configure":"Connect"}
              </button>
            </div>
          </div>
        ))}
      </div>
    );

    if (activeTab==="Billing") return (
      <div>
        <SectionCard title="Current Plan">
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px", background:"linear-gradient(135deg,#1B5E20,#2E7D32)", borderRadius:12, marginBottom:16 }}>
            <div>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.7)", margin:"0 0 4px", fontWeight:600, textTransform:"uppercase" }}>Current Plan</p>
              <p style={{ fontSize:22, fontWeight:800, color:"#F9A825", margin:"0 0 4px" }}>Enterprise</p>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.8)", margin:0 }}>Unlimited programs · 50,000 borrowers · Full API access</p>
            </div>
            <div style={{ textAlign:"right" }}>
              <p style={{ fontSize:28, fontWeight:800, color:"#fff", margin:"0 0 4px" }}>₦2.5M<span style={{ fontSize:14, fontWeight:400 }}>/mo</span></p>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.7)", margin:0 }}>Renews Aug 1, 2025</p>
            </div>
          </div>
          {[
            {f:"Active Loan Programs",v:"7 / Unlimited"},
            {f:"Registered Borrowers",v:"23,450 / 50,000"},
            {f:"Field Agents",        v:"6 / Unlimited"},
            {f:"API Calls This Month",v:"12,340 / Unlimited"},
            {f:"Storage Used",        v:"4.2 GB / 100 GB"},
          ].map(({f,v})=>(
            <div key={f} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid ${borderC}` }}>
              <span style={{ fontSize:13, color:mutedC }}>{f}</span>
              <span style={{ fontSize:13, fontWeight:600, color:textC }}>{v}</span>
            </div>
          ))}
        </SectionCard>

        <SectionCard title="Billing History">
          {[
            {date:"Jul 1, 2025",  desc:"Enterprise Monthly", amount:"₦2,500,000", status:"Upcoming"},
            {date:"Jun 1, 2025",  desc:"Enterprise Monthly", amount:"₦2,500,000", status:"Paid"},
            {date:"May 1, 2025",  desc:"Enterprise Monthly", amount:"₦2,500,000", status:"Paid"},
            {date:"Apr 1, 2025",  desc:"Enterprise Monthly", amount:"₦2,500,000", status:"Paid"},
          ].map(({date,desc,amount,status})=>(
            <div key={date} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 0", borderBottom:`1px solid ${borderC}` }}>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:textC, margin:"0 0 2px" }}>{desc}</p>
                <p style={{ fontSize:11, color:mutedC, margin:0 }}>{date}</p>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:13, fontWeight:700, color:textC }}>{amount}</span>
                <span style={{ fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:5, background:status==="Paid"?"#dcfce7":"#fef3c7", color:status==="Paid"?"#16a34a":"#d97706" }}>{status}</span>
                {status==="Paid" && <button style={{ fontSize:12, padding:"4px 10px", borderRadius:7, border:`1px solid ${borderC}`, background:"none", color:mutedC, cursor:"pointer" }}>Receipt</button>}
              </div>
            </div>
          ))}
        </SectionCard>
      </div>
    );

    return null;
  };

  return (
    <main style={{ flex:1, overflowY:"auto", background:bgPage }}>
      <div style={{ padding:"24px 24px 0" }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:textC, margin:"0 0 4px" }}>Settings</h1>
        <p style={{ fontSize:13, color:mutedC, margin:0 }}>Manage your organization profile, preferences and integrations</p>
      </div>

      <div style={{ display:"flex", gap:0, padding:24 }}>
        {/* Left tab list */}
        <div style={{ width:220, flexShrink:0, marginRight:24 }}>
          <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:16, overflow:"hidden" }}>
            {tabs.map(t=>(
              <button key={t} onClick={()=>setActiveTab(t)} style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"13px 16px", background: activeTab===t?(dark?"#0a2010":"#f0fdf4"):"transparent", borderLeft: activeTab===t?"3px solid #1B5E20":"3px solid transparent", color: activeTab===t?"#1B5E20":mutedC, fontWeight: activeTab===t?700:400, fontSize:13, border:"none", borderBottom:`1px solid ${borderC}`, cursor:"pointer", textAlign:"left" }}>
                <span>{tabIcons[t]}</span>{t}
              </button>
            ))}
          </div>
        </div>

        {/* Right content */}
        <div style={{ flex:1, minWidth:0 }}>
          {renderTab()}

          {/* Save bar */}
          {activeTab!=="Billing" && (
            <div style={{ display:"flex", alignItems:"center", gap:12, marginTop:4 }}>
              <button onClick={handleSave} style={{ padding:"10px 28px", borderRadius:10, border:"none", background:"#1B5E20", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                {saved?"✓ Saved!":"Save Changes"}
              </button>
              <button style={{ padding:"10px 20px", borderRadius:10, border:`1px solid ${borderC}`, background:"none", color:mutedC, fontSize:13, cursor:"pointer" }}>Discard</button>
              {saved && <span style={{ fontSize:12, color:"#16a34a", fontWeight:600 }}>Changes saved successfully</span>}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}


// ─── COOPERATIVES PAGE ────────────────────────────────────────────────────────

const cooperativesData = [
  {
    id:"COOP-001", name:"Benue Rice Farmers Cooperative Society", state:"Benue", lga:"Makurdi",
    members:124, activeLoans:3, totalDisbursed:"₦42M", repayRate:91, groupScore:768,
    status:"Active", chair:"Emmanuel Tersoo", phone:"0803xxx", formed:"Jan 2023",
    cropFocus:"Rice", program:"CBN Rice Fund",
    members_data:[
      {name:"Emmanuel Tersoo",  role:"Chairman",   score:810, contribution:"₦50,000", loanAmt:"₦450,000", repaid:"₦270,000", status:"Active"},
      {name:"Ngozi Adeyemi",    role:"Secretary",  score:780, contribution:"₦50,000", loanAmt:"₦380,000", repaid:"₦228,000", status:"Active"},
      {name:"Bello Ibrahim",    role:"Treasurer",  score:740, contribution:"₦50,000", loanAmt:"₦420,000", repaid:"₦252,000", status:"Active"},
      {name:"Fatima Usman",     role:"Member",     score:695, contribution:"₦50,000", loanAmt:"₦300,000", repaid:"₦180,000", status:"Active"},
      {name:"Chukwuemeka Obi",  role:"Member",     score:620, contribution:"₦50,000", loanAmt:"₦280,000", repaid:"₦112,000", status:"At Risk"},
      {name:"Amina Garba",      role:"Member",     score:590, contribution:"₦50,000", loanAmt:"₦250,000", repaid:"₦0",       status:"Defaulting"},
    ],
    contributions:[
      {month:"Jan",amount:300000},{month:"Feb",amount:300000},{month:"Mar",amount:300000},
      {month:"Apr",amount:300000},{month:"May",amount:300000},{month:"Jun",amount:300000},
    ],
    groupLoanHistory:[
      {name:"Group Loan 2023 Season 1",amount:"₦12M",disbursed:"₦12M",repaid:"₦12M",status:"Completed"},
      {name:"Group Loan 2024 Season 1",amount:"₦18M",disbursed:"₦18M",repaid:"₦14M",status:"Active"},
      {name:"Group Loan 2024 Season 2",amount:"₦12M",disbursed:"₦12M",repaid:"₦6M", status:"Active"},
    ],
  },
  {
    id:"COOP-002", name:"Kebbi Women Rice Cooperative",          state:"Kebbi",  lga:"Birnin Kebbi",
    members:87,  activeLoans:2, totalDisbursed:"₦28M", repayRate:96, groupScore:812,
    status:"Active", chair:"Hajiya Aisha Musa", phone:"0706xxx", formed:"Mar 2022",
    cropFocus:"Rice", program:"Kebbi Irrigation Scheme",
    members_data:[
      {name:"Hajiya Aisha Musa", role:"Chairman",  score:890, contribution:"₦30,000", loanAmt:"₦320,000", repaid:"₦320,000",status:"Completed"},
      {name:"Zainab Dantata",    role:"Secretary", score:845, contribution:"₦30,000", loanAmt:"₦280,000", repaid:"₦224,000",status:"Active"},
      {name:"Falmata Garba",     role:"Treasurer", score:810, contribution:"₦30,000", loanAmt:"₦300,000", repaid:"₦210,000",status:"Active"},
    ],
    contributions:[
      {month:"Jan",amount:174000},{month:"Feb",amount:174000},{month:"Mar",amount:174000},
      {month:"Apr",amount:174000},{month:"May",amount:174000},{month:"Jun",amount:174000},
    ],
    groupLoanHistory:[
      {name:"Group Loan 2022",amount:"₦8M", disbursed:"₦8M", repaid:"₦8M", status:"Completed"},
      {name:"Group Loan 2023",amount:"₦12M",disbursed:"₦12M",repaid:"₦12M",status:"Completed"},
      {name:"Group Loan 2024",amount:"₦8M", disbursed:"₦8M", repaid:"₦5.6M",status:"Active"},
    ],
  },
  {
    id:"COOP-003", name:"Ekiti Cocoa & Cashew Farmers Union",    state:"Ekiti",  lga:"Ado-Ekiti",
    members:56,  activeLoans:1, totalDisbursed:"₦8M",  repayRate:78, groupScore:641,
    status:"Watch",  chair:"Tunde Fashola", phone:"0815xxx", formed:"Sep 2023",
    cropFocus:"Cocoa", program:"Ekiti Youth Agro Fund",
    members_data:[
      {name:"Tunde Fashola",    role:"Chairman",  score:720, contribution:"₦20,000", loanAmt:"₦200,000", repaid:"₦120,000",status:"Active"},
      {name:"Sade Ogunleye",    role:"Secretary", score:680, contribution:"₦20,000", loanAmt:"₦180,000", repaid:"₦72,000", status:"Active"},
      {name:"Kolade Adeyemi",   role:"Member",    score:540, contribution:"₦20,000", loanAmt:"₦150,000", repaid:"₦30,000", status:"At Risk"},
    ],
    contributions:[
      {month:"Jan",amount:112000},{month:"Feb",amount:112000},{month:"Mar",amount:56000},
      {month:"Apr",amount:112000},{month:"May",amount:112000},{month:"Jun",amount:56000},
    ],
    groupLoanHistory:[
      {name:"Group Loan 2024",amount:"₦8M",disbursed:"₦5M",repaid:"₦2.2M",status:"Active"},
    ],
  },
  {
    id:"COOP-004", name:"Kaduna Maize Producers Association",    state:"Kaduna", lga:"Kaduna South",
    members:203, activeLoans:4, totalDisbursed:"₦67M", repayRate:88, groupScore:741,
    status:"Active", chair:"Alhaji Musa Sani", phone:"0813xxx", formed:"Jun 2021",
    cropFocus:"Maize", program:"BOA Smallholder Maize",
    members_data:[
      {name:"Alhaji Musa Sani", role:"Chairman",  score:810, contribution:"₦40,000", loanAmt:"₦500,000", repaid:"₦400,000",status:"Active"},
      {name:"Grace Danjuma",    role:"Secretary", score:760, contribution:"₦40,000", loanAmt:"₦380,000", repaid:"₦304,000",status:"Active"},
      {name:"Ibrahim Yakubu",   role:"Member",    score:690, contribution:"₦40,000", loanAmt:"₦320,000", repaid:"₦192,000",status:"Active"},
      {name:"Sule Mohammed",    role:"Member",    score:530, contribution:"₦40,000", loanAmt:"₦280,000", repaid:"₦0",      status:"Defaulting"},
    ],
    contributions:[
      {month:"Jan",amount:812000},{month:"Feb",amount:812000},{month:"Mar",amount:812000},
      {month:"Apr",amount:812000},{month:"May",amount:406000},{month:"Jun",amount:812000},
    ],
    groupLoanHistory:[
      {name:"Group Loan 2021",amount:"₦10M",disbursed:"₦10M",repaid:"₦10M",status:"Completed"},
      {name:"Group Loan 2022",amount:"₦18M",disbursed:"₦18M",repaid:"₦18M",status:"Completed"},
      {name:"Group Loan 2023",amount:"₦24M",disbursed:"₦24M",repaid:"₦20M",status:"Completed"},
      {name:"Group Loan 2024",amount:"₦15M",disbursed:"₦15M",repaid:"₦10M",status:"Active"},
    ],
  },
];

const scoreColor = s => s>=750?"#16a34a":s>=600?"#2563eb":s>=450?"#d97706":"#dc2626";
const scoreLabel = s => s>=750?"Platinum":s>=650?"Gold":s>=500?"Silver":"Bronze";

function CoopScoreRing({ score, size=64 }) {
  const r=(size/2)-7; const circ=2*Math.PI*r; const pct=score/850;
  const col=scoreColor(score);
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={6}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={circ*(1-pct)} strokeLinecap="round"/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column" }}>
        <span style={{ fontSize:size>50?14:10, fontWeight:800, color:col, lineHeight:1 }}>{score}</span>
        {size>50 && <span style={{ fontSize:8, color:"rgba(255,255,255,0.5)", marginTop:1 }}>{scoreLabel(score)}</span>}
      </div>
    </div>
  );
}

function CoopDetail({ coop, dark, onBack }) {
  const [tab, setTab] = useState("Overview");
  const [showGroupLoan, setShowGroupLoan] = useState(false);
  const [glStep, setGlStep] = useState(0);
  const [glForm, setGlForm] = useState({ amount:"", purpose:"", duration:"12", repayMode:"Individual" });

  const surface = dark?"#1f2937":"#ffffff";
  const borderC = dark?"#374151":"#e5e7eb";
  const textC   = dark?"#f9fafb":"#111827";
  const mutedC  = dark?"#9ca3af":"#6b7280";
  const bg      = dark?"#111827":"#f0fdf4";
  const inputBg = dark?"#374151":"#f9fafb";
  const inp     = { width:"100%", background:inputBg, border:`1px solid ${borderC}`, borderRadius:10, padding:"10px 14px", fontSize:13, color:textC, outline:"none", boxSizing:"border-box" };

  const statusSt = { Active:{bg:"#dcfce7",color:"#16a34a"}, "At Risk":{bg:"#fef3c7",color:"#d97706"}, Defaulting:{bg:"#fee2e2",color:"#dc2626"}, Completed:{bg:"#dbeafe",color:"#2563eb"} };

  const tabs = ["Overview","Members","Contributions","Group Loans","Reports"];

  const glSteps = ["Loan Details","Member Allocation","Review & Submit","Decision"];

  return (
    <main style={{ flex:1, overflowY:"auto", background:bg }}>
      {/* Group Loan Modal */}
      {showGroupLoan && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:surface, borderRadius:20, width:"100%", maxWidth:540, maxHeight:"88vh", display:"flex", flexDirection:"column", boxShadow:"0 25px 60px rgba(0,0,0,0.3)", overflow:"hidden" }}>
            <div style={{ padding:"20px 24px", borderBottom:`1px solid ${borderC}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <h2 style={{ fontSize:16, fontWeight:700, color:textC, margin:0 }}>New Group Loan Application</h2>
                <p style={{ fontSize:12, color:mutedC, margin:"2px 0 0" }}>Step {glStep+1} of {glSteps.length} — {glSteps[glStep]}</p>
              </div>
              <button onClick={()=>setShowGroupLoan(false)} style={{ background:"none", border:"none", cursor:"pointer", color:mutedC, fontSize:20 }}>×</button>
            </div>
            {/* Step bar */}
            <div style={{ padding:"12px 24px", borderBottom:`1px solid ${borderC}`, display:"flex", gap:4 }}>
              {glSteps.map((s,i)=>(
                <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                  <div style={{ width:"100%", height:4, borderRadius:4, background:i<=glStep?"#1B5E20":borderC }}/>
                  <span style={{ fontSize:9, color:i===glStep?"#1B5E20":mutedC, fontWeight:i===glStep?700:400, whiteSpace:"nowrap" }}>{s}</span>
                </div>
              ))}
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:"20px 24px" }}>

              {glStep===0 && (
                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  <div style={{ background:dark?"#0a2010":"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:12, padding:"12px 16px", marginBottom:4 }}>
                    <p style={{ fontSize:13, fontWeight:700, color:"#16a34a", margin:"0 0 4px" }}>Cooperative Group Score: {coop.groupScore}</p>
                    <p style={{ fontSize:12, color:mutedC, margin:0 }}>This score determines your maximum eligible group loan amount and interest rate.</p>
                  </div>
                  <div>
                    <label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase" }}>Total Group Loan Amount (₦) *</label>
                    <input style={inp} type="number" placeholder="e.g. 5,000,000" value={glForm.amount} onChange={e=>setGlForm({...glForm,amount:e.target.value})}/>
                    <p style={{ fontSize:11, color:mutedC, margin:"4px 0 0" }}>Based on your Group Score, you qualify for up to ₦{(coop.groupScore/850*20).toFixed(0)}M</p>
                  </div>
                  <div>
                    <label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase" }}>Purpose</label>
                    <select style={inp} value={glForm.purpose} onChange={e=>setGlForm({...glForm,purpose:e.target.value})}>
                      <option value="">Select purpose...</option>
                      {["Shared Land Preparation","Bulk Input Purchase","Shared Equipment","Irrigation Infrastructure","Collective Storage"].map(p=><option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    <div>
                      <label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase" }}>Duration</label>
                      <select style={inp} value={glForm.duration} onChange={e=>setGlForm({...glForm,duration:e.target.value})}>
                        {[6,9,12,18,24].map(m=><option key={m} value={m}>{m} months</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase" }}>Repayment Mode</label>
                      <select style={inp} value={glForm.repayMode} onChange={e=>setGlForm({...glForm,repayMode:e.target.value})}>
                        <option>Individual (each member repays own share)</option>
                        <option>Collective (group repays as one)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {glStep===1 && (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <p style={{ fontSize:13, color:mutedC, margin:"0 0 8px" }}>Review how the loan will be allocated among members based on their individual FarmScore:</p>
                  <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:12, overflow:"hidden" }}>
                    <div style={{ background:dark?"#111827":"#f0fdf4", padding:"10px 14px", display:"grid", gridTemplateColumns:"1fr 80px 100px 80px", gap:10 }}>
                      {["Member","Score","Allocation","Share"].map(h=>(
                        <span key={h} style={{ fontSize:10, fontWeight:600, color:mutedC, textTransform:"uppercase" }}>{h}</span>
                      ))}
                    </div>
                    {coop.members_data.map((m,i)=>{
                      const share = Math.round((m.score / coop.members_data.reduce((a,x)=>a+x.score,0))*100);
                      const alloc = glForm.amount ? Math.round(Number(glForm.amount)*share/100).toLocaleString() : "—";
                      const col = scoreColor(m.score);
                      return (
                        <div key={i} style={{ padding:"10px 14px", borderTop:`1px solid ${borderC}`, display:"grid", gridTemplateColumns:"1fr 80px 100px 80px", gap:10, alignItems:"center" }}>
                          <div>
                            <p style={{ fontSize:13, fontWeight:600, color:textC, margin:"0 0 2px" }}>{m.name}</p>
                            <span style={{ fontSize:10, fontWeight:600, padding:"1px 6px", borderRadius:4, background:dark?"#1f2937":"#f3f4f6", color:mutedC }}>{m.role}</span>
                          </div>
                          <span style={{ fontSize:12, fontWeight:700, color:col }}>{m.score}</span>
                          <span style={{ fontSize:13, fontWeight:600, color:textC }}>₦{alloc}</span>
                          <span style={{ fontSize:12, color:mutedC }}>{share}%</span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ background:dark?"#0d1a30":"#eff6ff", border:"1px solid #bfdbfe", borderRadius:10, padding:"10px 14px" }}>
                    <p style={{ fontSize:12, color:"#2563eb", fontWeight:600, margin:0 }}>💡 Allocation is weighted by FarmScore — higher-scoring members get proportionally more, reducing default risk.</p>
                  </div>
                </div>
              )}

              {glStep===2 && (
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <div style={{ background:dark?"#0a2010":"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:12, padding:16 }}>
                    <p style={{ fontSize:12, fontWeight:700, color:"#16a34a", margin:"0 0 12px", textTransform:"uppercase" }}>Group Loan Summary</p>
                    {[
                      ["Cooperative", coop.name],
                      ["Group Score", `${coop.groupScore} — ${scoreLabel(coop.groupScore)}`],
                      ["Total Amount", glForm.amount ? `₦${Number(glForm.amount).toLocaleString()}` : "—"],
                      ["Purpose", glForm.purpose||"—"],
                      ["Duration", `${glForm.duration} months`],
                      ["Repayment", glForm.repayMode],
                      ["Members", coop.members_data.length],
                      ["Program", coop.program],
                    ].map(([k,v])=>(
                      <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:`1px solid ${borderC}` }}>
                        <span style={{ fontSize:12, color:mutedC }}>{k}</span>
                        <span style={{ fontSize:12, fontWeight:600, color:textC, textAlign:"right", maxWidth:240 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background:dark?"#1a1a00":"#fefce8", border:"1px solid #fde68a", borderRadius:10, padding:"10px 14px" }}>
                    <p style={{ fontSize:12, color:"#d97706", margin:0 }}>⚠️ All {coop.members_data.length} members must digitally consent before disbursement. Consent requests will be sent via SMS.</p>
                  </div>
                </div>
              )}

              {glStep===3 && (
                <div style={{ textAlign:"center", padding:"20px 0" }}>
                  <div style={{ width:72, height:72, borderRadius:"50%", background:"linear-gradient(135deg,#1B5E20,#2E7D32)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
                    <CheckCircle size={36} color="#F9A825"/>
                  </div>
                  <h3 style={{ fontSize:18, fontWeight:800, color:textC, margin:"0 0 8px" }}>Application Submitted!</h3>
                  <p style={{ fontSize:13, color:mutedC, margin:"0 0 6px" }}>Ref: GL-{coop.id}-{Date.now().toString().slice(-4)}</p>
                  <p style={{ fontSize:13, color:mutedC, margin:"0 0 24px", lineHeight:1.6 }}>
                    SMS consent requests sent to all {coop.members_data.length} members. Disbursement will begin within 48 hours of full consent.
                  </p>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {coop.members_data.slice(0,3).map((m,i)=>(
                      <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", background:dark?"#111827":"#f9fafb", borderRadius:10, border:`1px solid ${borderC}` }}>
                        <span style={{ fontSize:13, color:textC }}>{m.name}</span>
                        <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:5, background:"#fef3c7", color:"#d97706" }}>Awaiting Consent</span>
                      </div>
                    ))}
                    {coop.members_data.length>3 && <p style={{ fontSize:12, color:mutedC }}>+{coop.members_data.length-3} more members notified</p>}
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding:"14px 24px", borderTop:`1px solid ${borderC}`, display:"flex", gap:10 }}>
              {glStep>0 && glStep<3 && (
                <button onClick={()=>setGlStep(s=>s-1)} style={{ flex:1, padding:"11px", borderRadius:10, border:`1px solid ${borderC}`, background:"none", color:mutedC, fontSize:13, cursor:"pointer" }}>← Back</button>
              )}
              {glStep<3 && (
                <button onClick={()=>setGlStep(s=>s+1)} style={{ flex:2, padding:"11px", borderRadius:10, border:"none", background:"#1B5E20", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                  {glStep===2?"🚀 Submit Application":"Continue →"}
                </button>
              )}
              {glStep===3 && (
                <button onClick={()=>{setShowGroupLoan(false);setGlStep(0);}} style={{ flex:1, padding:"11px", borderRadius:10, border:"none", background:"#1B5E20", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>Done</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Back bar */}
      <div style={{ padding:"14px 24px", background:surface, borderBottom:`1px solid ${borderC}`, display:"flex", alignItems:"center", gap:10 }}>
        <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", color:mutedC, fontSize:13 }}>
          ← Back to Cooperatives
        </button>
        <span style={{ color:borderC }}>|</span>
        <span style={{ fontSize:13, color:mutedC }}>{coop.id}</span>
      </div>

      {/* Hero card */}
      <div style={{ margin:24, background:surface, border:`1px solid ${borderC}`, borderRadius:16, overflow:"hidden" }}>
        <div style={{ height:5, background:"linear-gradient(90deg,#1B5E20,#F9A825)" }}/>
        <div style={{ padding:"20px 24px", display:"flex", alignItems:"flex-start", gap:20, flexWrap:"wrap" }}>
          <div style={{ width:56, height:56, borderRadius:16, background:"linear-gradient(135deg,#1B5E20,#2E7D32)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>🤝</div>
          <div style={{ flex:1, minWidth:200 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom:6 }}>
              <h2 style={{ fontSize:18, fontWeight:800, color:textC, margin:0 }}>{coop.name}</h2>
              <span style={{ fontSize:11, fontWeight:700, padding:"3px 8px", borderRadius:5, background:coop.status==="Active"?"#dcfce7":"#fef3c7", color:coop.status==="Active"?"#16a34a":"#d97706" }}>
                ● {coop.status.toUpperCase()}
              </span>
            </div>
            <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
              {[{Icon:MapPin,v:`${coop.lga}, ${coop.state}`},{Icon:Users,v:`${coop.members} members`},{Icon:Sprout,v:coop.cropFocus},{Icon:Calendar,v:`Est. ${coop.formed}`}].map(({Icon,v},i)=>(
                <span key={i} style={{ fontSize:12, color:mutedC, display:"flex", alignItems:"center", gap:4 }}><Icon size={12}/>{v}</span>
              ))}
            </div>
          </div>
          {/* Group Score ring */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
            <CoopScoreRing score={coop.groupScore} size={80}/>
            <span style={{ fontSize:10, color:mutedC, fontWeight:600, textTransform:"uppercase" }}>Group Score</span>
          </div>
          <button onClick={()=>setShowGroupLoan(true)} style={{ padding:"10px 20px", borderRadius:10, border:"none", background:"#1B5E20", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", alignSelf:"flex-start" }}>
            + Apply for Group Loan
          </button>
        </div>

        {/* Quick stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", borderTop:`1px solid ${borderC}` }}>
          {[
            {l:"Members",         v:coop.members},
            {l:"Active Loans",    v:coop.activeLoans},
            {l:"Total Disbursed", v:coop.totalDisbursed},
            {l:"Repayment Rate",  v:`${coop.repayRate}%`},
            {l:"Chair",           v:coop.chair},
          ].map(({l,v})=>(
            <div key={l} style={{ padding:"12px 20px", borderRight:`1px solid ${borderC}` }}>
              <p style={{ fontSize:12, color:mutedC, margin:"0 0 3px" }}>{l}</p>
              <p style={{ fontSize:14, fontWeight:700, color:textC, margin:0 }}>{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginInline:24 }}>
        <div style={{ display:"flex", gap:2, borderBottom:`1px solid ${borderC}`, marginBottom:20 }}>
          {tabs.map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{ padding:"10px 16px", fontSize:13, fontWeight:tab===t?600:400, color:tab===t?"#1B5E20":mutedC, background:"none", border:"none", borderBottom:tab===t?"2px solid #1B5E20":"2px solid transparent", cursor:"pointer", marginBottom:-1 }}>{t}</button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab==="Overview" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24 }}>
            {/* Group Score breakdown */}
            <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:14, padding:18 }}>
              <h4 style={{ fontSize:13, fontWeight:700, color:textC, margin:"0 0 14px" }}>Group FarmScore Breakdown</h4>
              <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:16 }}>
                <CoopScoreRing score={coop.groupScore} size={72}/>
                <div>
                  <p style={{ fontSize:28, fontWeight:900, color:scoreColor(coop.groupScore), margin:"0 0 4px" }}>{coop.groupScore}</p>
                  <span style={{ background:"#F9A825", color:"#1B5E20", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20 }}>
                    🏆 {scoreLabel(coop.groupScore)} Cooperative
                  </span>
                </div>
              </div>
              <p style={{ fontSize:12, color:mutedC, margin:"0 0 10px" }}>Score = 70% avg member score + 20% repayment history + 10% reporting consistency</p>
              {[
                {l:"Average Member FarmScore", v:Math.round(coop.members_data.reduce((a,m)=>a+m.score,0)/coop.members_data.length), max:850},
                {l:"Group Repayment Rate",      v:coop.repayRate,  max:100},
                {l:"Report Submission Rate",    v:87,              max:100},
                {l:"Membership Stability",      v:94,              max:100},
              ].map(({l,v,max})=>{
                const pct = Math.round(v/max*100);
                const col = pct>=80?"#16a34a":pct>=60?"#2563eb":"#d97706";
                return (
                  <div key={l} style={{ marginBottom:10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{ fontSize:11, color:mutedC }}>{l}</span>
                      <span style={{ fontSize:11, fontWeight:700, color:textC }}>{v}{max===100?"%":""}</span>
                    </div>
                    <div style={{ height:5, borderRadius:5, background:dark?"#374151":"#e5e7eb" }}>
                      <div style={{ width:`${pct}%`, height:"100%", borderRadius:5, background:col }}/>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Loan history summary */}
            <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:14, padding:18 }}>
              <h4 style={{ fontSize:13, fontWeight:700, color:textC, margin:"0 0 14px" }}>Group Loan History</h4>
              {coop.groupLoanHistory.map((l,i)=>{
                const st = statusSt[l.status]||statusSt.Active;
                const pct = l.amount===l.disbursed ? Math.round(parseInt(l.repaid.replace(/[₦M]/g,""))/parseInt(l.disbursed.replace(/[₦M]/g,""))*100) : 0;
                return (
                  <div key={i} style={{ marginBottom:14, paddingBottom:14, borderBottom:i<coop.groupLoanHistory.length-1?`1px solid ${borderC}`:"none" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <div>
                        <p style={{ fontSize:13, fontWeight:600, color:textC, margin:"0 0 2px" }}>{l.name}</p>
                        <p style={{ fontSize:11, color:mutedC, margin:0 }}>Disbursed {l.disbursed} · Repaid {l.repaid}</p>
                      </div>
                      <span style={{ fontSize:11, fontWeight:700, padding:"3px 8px", borderRadius:5, background:st.bg, color:st.color }}>{l.status}</span>
                    </div>
                    {l.status!=="Completed" && (
                      <div style={{ height:5, borderRadius:5, background:dark?"#374151":"#e5e7eb" }}>
                        <div style={{ width:`${pct}%`, height:"100%", borderRadius:5, background:"#1B5E20" }}/>
                      </div>
                    )}
                  </div>
                );
              })}
              <button onClick={()=>setShowGroupLoan(true)} style={{ width:"100%", padding:"10px", borderRadius:10, border:"none", background:"#1B5E20", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                + Apply for New Group Loan
              </button>
            </div>
          </div>
        )}

        {/* MEMBERS */}
        {tab==="Members" && (
          <div style={{ marginBottom:24 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <p style={{ fontSize:14, fontWeight:700, color:textC, margin:0 }}>All Members ({coop.members_data.length} shown)</p>
              <button style={{ padding:"7px 14px", borderRadius:8, border:"none", background:"#1B5E20", color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer" }}>+ Add Member</button>
            </div>
            <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:14, overflow:"hidden" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr style={{ background:dark?"#111827":"#f0fdf4" }}>
                    {["Member","Role","FarmScore","Contribution","Loan Amount","Repaid","Status"].map(h=>(
                      <th key={h} style={{ textAlign:"left", padding:"10px 16px", fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", color:mutedC, borderBottom:`1px solid ${borderC}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {coop.members_data.map((m,i)=>{
                    const st = statusSt[m.status]||statusSt.Active;
                    const col = scoreColor(m.score);
                    return (
                      <tr key={i} style={{ borderBottom:`1px solid ${borderC}` }}>
                        <td style={{ padding:"12px 16px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <div style={{ width:32, height:32, borderRadius:"50%", background:dark?"#1B5E20":"#dcfce7", display:"flex", alignItems:"center", justifyContent:"center", color:"#16a34a", fontSize:11, fontWeight:700, flexShrink:0 }}>
                              {m.name.split(" ").map(n=>n[0]).join("")}
                            </div>
                            <span style={{ fontWeight:600, color:textC }}>{m.name}</span>
                          </div>
                        </td>
                        <td style={{ padding:"12px 16px" }}>
                          <span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:4, background:m.role==="Chairman"?"#fef3c7":dark?"#1f2937":"#f3f4f6", color:m.role==="Chairman"?"#d97706":mutedC }}>{m.role}</span>
                        </td>
                        <td style={{ padding:"12px 16px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <CoopScoreRing score={m.score} size={32}/>
                            <span style={{ fontSize:13, fontWeight:700, color:col }}>{m.score}</span>
                          </div>
                        </td>
                        <td style={{ padding:"12px 16px", color:"#16a34a", fontWeight:600 }}>{m.contribution}</td>
                        <td style={{ padding:"12px 16px", fontWeight:600, color:textC }}>{m.loanAmt}</td>
                        <td style={{ padding:"12px 16px", color:"#2563eb" }}>{m.repaid}</td>
                        <td style={{ padding:"12px 16px" }}>
                          <span style={{ fontSize:11, fontWeight:700, padding:"3px 8px", borderRadius:6, background:st.bg, color:st.color }}>{m.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Member score distribution */}
            <div style={{ marginTop:16, background:surface, border:`1px solid ${borderC}`, borderRadius:14, padding:18 }}>
              <h4 style={{ fontSize:13, fontWeight:700, color:textC, margin:"0 0 14px" }}>Member Score Distribution</h4>
              <div style={{ display:"flex", gap:8 }}>
                {[{l:"Platinum (750+)",v:coop.members_data.filter(m=>m.score>=750).length,col:"#16a34a",bg:dark?"#0a2010":"#dcfce7"},
                  {l:"Gold (650–749)",  v:coop.members_data.filter(m=>m.score>=650&&m.score<750).length,col:"#F9A825",bg:dark?"#2d1a00":"#fef3c7"},
                  {l:"Silver (500–649)",v:coop.members_data.filter(m=>m.score>=500&&m.score<650).length,col:"#2563eb",bg:dark?"#0d1a30":"#dbeafe"},
                  {l:"Bronze (<500)",   v:coop.members_data.filter(m=>m.score<500).length,             col:"#dc2626",bg:dark?"#2d0a0a":"#fee2e2"},
                ].map(({l,v,col,bg})=>(
                  <div key={l} style={{ flex:1, textAlign:"center", padding:"14px 10px", background:bg, borderRadius:12 }}>
                    <p style={{ fontSize:22, fontWeight:800, color:col, margin:"0 0 4px" }}>{v}</p>
                    <p style={{ fontSize:11, color:mutedC, margin:0 }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CONTRIBUTIONS */}
        {tab==="Contributions" && (
          <div style={{ marginBottom:24 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
              <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:14, padding:18 }}>
                <h4 style={{ fontSize:13, fontWeight:700, color:textC, margin:"0 0 14px" }}>Monthly Contributions (₦)</h4>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={coop.contributions} barSize={24}>
                    <CartesianGrid strokeDasharray="3 3" stroke={dark?"#374151":"#f3f4f6"} vertical={false}/>
                    <XAxis dataKey="month" tick={{ fontSize:11, fill:mutedC }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fontSize:11, fill:mutedC }} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={{ background:surface, border:`1px solid ${borderC}`, borderRadius:10, fontSize:12 }} formatter={v=>[`₦${v.toLocaleString()}`]}/>
                    <Bar dataKey="amount" fill="#1B5E20" radius={[5,5,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:14, padding:18 }}>
                <h4 style={{ fontSize:13, fontWeight:700, color:textC, margin:"0 0 14px" }}>Contribution Summary</h4>
                {[
                  {l:"Per Member Monthly",   v:coop.members_data[0]?.contribution||"—"},
                  {l:"Total Contributions",  v:`₦${(coop.members*50000).toLocaleString()}`},
                  {l:"Savings Pool",         v:`₦${(coop.members*50000*0.3).toLocaleString()}`},
                  {l:"Loan Guarantee Fund",  v:`₦${(coop.members*50000*0.2).toLocaleString()}`},
                  {l:"Members in Arrears",   v:coop.members_data.filter(m=>m.status!=="Active"&&m.status!=="Completed").length},
                ].map(({l,v})=>(
                  <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${borderC}` }}>
                    <span style={{ fontSize:12, color:mutedC }}>{l}</span>
                    <span style={{ fontSize:13, fontWeight:600, color:textC }}>{v}</span>
                  </div>
                ))}
                <button style={{ width:"100%", marginTop:14, padding:"9px", borderRadius:9, border:"none", background:"#F9A825", color:"#1B5E20", fontSize:13, fontWeight:600, cursor:"pointer" }}>📥 Collect Monthly Contributions</button>
              </div>
            </div>

            {/* Per-member contribution tracker */}
            <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:14, padding:18 }}>
              <h4 style={{ fontSize:13, fontWeight:700, color:textC, margin:"0 0 14px" }}>Per-Member Contribution Status — June 2025</h4>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {coop.members_data.map((m,i)=>{
                  const paid = m.status!=="Defaulting";
                  return (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:dark?"#111827":"#f9fafb", borderRadius:10, border:`1px solid ${paid?"#bbf7d0":borderC}` }}>
                      <div style={{ width:32, height:32, borderRadius:"50%", background:dark?"#1B5E20":"#dcfce7", display:"flex", alignItems:"center", justifyContent:"center", color:"#16a34a", fontSize:11, fontWeight:700 }}>
                        {m.name.split(" ").map(n=>n[0]).join("")}
                      </div>
                      <span style={{ flex:1, fontSize:13, fontWeight:600, color:textC }}>{m.name}</span>
                      <span style={{ fontSize:12, color:mutedC }}>{m.contribution}</span>
                      <span style={{ fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:6, background:paid?"#dcfce7":"#fee2e2", color:paid?"#16a34a":"#dc2626" }}>
                        {paid?"✓ Paid":"Unpaid"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* GROUP LOANS */}
        {tab==="Group Loans" && (
          <div style={{ marginBottom:24 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <p style={{ fontSize:14, fontWeight:700, color:textC, margin:0 }}>Group Loan Applications</p>
              <button onClick={()=>setShowGroupLoan(true)} style={{ padding:"8px 16px", borderRadius:9, border:"none", background:"#1B5E20", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>+ New Group Loan</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {coop.groupLoanHistory.map((l,i)=>{
                const st = statusSt[l.status]||statusSt.Active;
                const amtNum  = parseFloat(l.amount.replace(/[₦M,]/g,""));
                const repNum  = parseFloat(l.repaid.replace(/[₦M,]/g,""));
                const pct = Math.round(repNum/amtNum*100);
                return (
                  <div key={i} style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:14, padding:20 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                      <div>
                        <h4 style={{ fontSize:14, fontWeight:700, color:textC, margin:"0 0 4px" }}>{l.name}</h4>
                        <div style={{ display:"flex", gap:10 }}>
                          <span style={{ fontSize:12, color:mutedC }}>Amount: <strong style={{ color:textC }}>{l.amount}</strong></span>
                          <span style={{ fontSize:12, color:mutedC }}>Disbursed: <strong style={{ color:"#2563eb" }}>{l.disbursed}</strong></span>
                          <span style={{ fontSize:12, color:mutedC }}>Repaid: <strong style={{ color:"#16a34a" }}>{l.repaid}</strong></span>
                        </div>
                      </div>
                      <span style={{ fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:6, background:st.bg, color:st.color }}>{l.status}</span>
                    </div>
                    {l.status!=="Completed" && (
                      <div>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                          <span style={{ fontSize:12, color:mutedC }}>Repayment progress</span>
                          <span style={{ fontSize:12, fontWeight:700, color:"#16a34a" }}>{pct}%</span>
                        </div>
                        <div style={{ height:8, borderRadius:8, background:dark?"#374151":"#e5e7eb", overflow:"hidden" }}>
                          <div style={{ width:`${pct}%`, height:"100%", borderRadius:8, background:"linear-gradient(90deg,#1B5E20,#16a34a)" }}/>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Group loan explainer */}
            <div style={{ marginTop:16, background:dark?"#0d1a30":"#eff6ff", border:"1px solid #bfdbfe", borderRadius:14, padding:18 }}>
              <p style={{ fontSize:13, fontWeight:700, color:"#2563eb", margin:"0 0 10px" }}>💡 How Group Loans Work</p>
              {[
                "The cooperative applies as a single entity — the group's FarmScore determines eligibility",
                "Loan amount is split among members weighted by individual FarmScore",
                "All members must digitally consent before disbursement begins",
                "If one member defaults, the Loan Guarantee Fund covers up to 20% of shortfall",
                "Successful group repayment boosts every member's individual FarmScore by +10 pts",
              ].map((t,i)=>(
                <div key={i} style={{ display:"flex", gap:8, marginBottom:7 }}>
                  <span style={{ color:"#2563eb", fontWeight:700, flexShrink:0 }}>{i+1}.</span>
                  <span style={{ fontSize:12, color:mutedC }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REPORTS */}
        {tab==="Reports" && (
          <div style={{ marginBottom:24 }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
              {[
                {title:"Member Performance Report",     desc:"FarmScore trends, repayment rates and loan history per member",          icon:"👥", col:"#1B5E20", bg:dark?"#0a2010":"#dcfce7"},
                {title:"Contribution Tracker Export",   desc:"Monthly contribution records with member-level breakdown",               icon:"💰", col:"#2563eb", bg:dark?"#0d1a30":"#dbeafe"},
                {title:"Group Score Certificate",       desc:"Official Group FarmScore certificate for external lender applications",  icon:"🏆", col:"#d97706", bg:dark?"#2d1a00":"#fef3c7"},
                {title:"Loan Portfolio Summary",        desc:"All group loans — disbursed, repaid, outstanding balances",             icon:"📊", col:"#7c3aed", bg:dark?"#1a0d30":"#ede9fe"},
                {title:"Defaulters Report",             desc:"Members in arrears with intervention recommendations",                   icon:"⚠️", col:"#dc2626", bg:dark?"#2d0a0a":"#fee2e2"},
                {title:"Audit Trail Export",            desc:"Full immutable log of all cooperative decisions and transactions",       icon:"📋", col:"#374151", bg:dark?"#1f2937":"#f3f4f6"},
              ].map(({title,desc,icon,col,bg})=>(
                <div key={title} style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:14, padding:18 }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:dark?bg+"80":bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, marginBottom:14 }}>{icon}</div>
                  <p style={{ fontSize:13, fontWeight:700, color:textC, margin:"0 0 6px" }}>{title}</p>
                  <p style={{ fontSize:12, color:mutedC, margin:"0 0 14px", lineHeight:1.5 }}>{desc}</p>
                  <button style={{ width:"100%", padding:"8px", borderRadius:8, border:"none", background:col, color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer" }}>⬇ Export PDF</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function CooperativesPage({ dark }) {
  const [view, setView]       = useState("list"); // "list" | "detail" | "register"
  const [selected, setSelected] = useState(null);
  const [regStep, setRegStep] = useState(0);
  const [filter, setFilter]   = useState("All");
  const [regForm, setRegForm] = useState({ name:"", state:"", lga:"", cropFocus:"", chair:"", phone:"", email:"", regNumber:"", members:["","",""], savingsPerMember:"" });

  const surface = dark?"#1f2937":"#ffffff";
  const borderC = dark?"#374151":"#e5e7eb";
  const textC   = dark?"#f9fafb":"#111827";
  const mutedC  = dark?"#9ca3af":"#6b7280";
  const bg      = dark?"#111827":"#f0fdf4";
  const inputBg = dark?"#374151":"#f9fafb";
  const inp     = { width:"100%", background:inputBg, border:`1px solid ${borderC}`, borderRadius:10, padding:"10px 14px", fontSize:13, color:textC, outline:"none", boxSizing:"border-box" };

  const cropOptions = ["Rice","Cassava","Maize","Yam","Cocoa","Cashew","Tomato","Oil Palm","Soybean","Mixed"];
  const nigerianStates = ["Abia","Adamawa","Anambra","Bauchi","Benue","Delta","Ekiti","Enugu","FCT","Gombe","Imo","Kaduna","Kano","Kebbi","Kogi","Kwara","Lagos","Niger","Ogun","Oyo","Plateau","Rivers","Sokoto","Taraba","Others"];
  const regSteps = ["Basic Info","Leadership","Members & Savings","Review"];

  const filtered = cooperativesData.filter(c => filter==="All" || c.status===filter);

  if (view==="detail" && selected) {
    return <CoopDetail coop={selected} dark={dark} onBack={()=>{ setView("list"); setSelected(null); }}/>;
  }

  if (view==="register") {
    return (
      <main style={{ flex:1, padding:24, overflowY:"auto" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
          <button onClick={()=>{ setView("list"); setRegStep(0); }} style={{ background:"none", border:"none", cursor:"pointer", color:mutedC, fontSize:13, display:"flex", alignItems:"center", gap:5 }}>← Back</button>
          <h1 style={{ fontSize:18, fontWeight:800, color:textC, margin:0 }}>Register New Cooperative</h1>
        </div>

        {/* Step bar */}
        <div style={{ display:"flex", gap:4, marginBottom:24, maxWidth:600 }}>
          {regSteps.map((s,i)=>(
            <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4, cursor:i<regStep?"pointer":"default" }} onClick={()=>i<regStep&&setRegStep(i)}>
              <div style={{ width:"100%", height:4, borderRadius:4, background:i<regStep?"#16a34a":i===regStep?"#1B5E20":borderC }}/>
              <span style={{ fontSize:10, color:i===regStep?"#1B5E20":mutedC, fontWeight:i===regStep?700:400 }}>{s}</span>
            </div>
          ))}
        </div>

        <div style={{ maxWidth:600 }}>
          {regStep===0 && (
            <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:16, padding:24, display:"flex", flexDirection:"column", gap:14 }}>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase" }}>Cooperative Name *</label>
                <input style={inp} placeholder="e.g. Benue Rice Farmers Cooperative Society" value={regForm.name} onChange={e=>setRegForm({...regForm,name:e.target.value})}/>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase" }}>State *</label>
                  <select style={inp} value={regForm.state} onChange={e=>setRegForm({...regForm,state:e.target.value})}>
                    <option value="">Select...</option>{nigerianStates.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase" }}>LGA *</label>
                  <input style={inp} placeholder="e.g. Makurdi" value={regForm.lga} onChange={e=>setRegForm({...regForm,lga:e.target.value})}/>
                </div>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase" }}>Primary Crop Focus</label>
                <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                  {cropOptions.map(c=>(
                    <button key={c} onClick={()=>setRegForm({...regForm,cropFocus:c})} style={{ fontSize:12, padding:"5px 12px", borderRadius:20, border:`1px solid ${regForm.cropFocus===c?"#1B5E20":borderC}`, background:regForm.cropFocus===c?(dark?"#0a2010":"#dcfce7"):inputBg, color:regForm.cropFocus===c?"#16a34a":mutedC, cursor:"pointer", fontWeight:regForm.cropFocus===c?600:400 }}>{c}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase" }}>CAC Registration Number (optional)</label>
                <input style={inp} placeholder="e.g. RC/2024/12345" value={regForm.regNumber} onChange={e=>setRegForm({...regForm,regNumber:e.target.value})}/>
              </div>
            </div>
          )}

          {regStep===1 && (
            <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:16, padding:24, display:"flex", flexDirection:"column", gap:14 }}>
              <div style={{ background:dark?"#0d1a30":"#eff6ff", border:"1px solid #bfdbfe", borderRadius:10, padding:"10px 14px" }}>
                <p style={{ fontSize:12, color:"#2563eb", margin:0 }}>The chairperson becomes the primary account holder. All group loan applications require their digital signature.</p>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase" }}>Chairperson Full Name *</label>
                <input style={inp} placeholder="e.g. Emmanuel Tersoo" value={regForm.chair} onChange={e=>setRegForm({...regForm,chair:e.target.value})}/>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase" }}>Chair Phone *</label>
                  <input style={inp} placeholder="+234 803 000 0000" value={regForm.phone} onChange={e=>setRegForm({...regForm,phone:e.target.value})}/>
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase" }}>Chair Email (optional)</label>
                  <input style={inp} placeholder="chair@email.com" value={regForm.email} onChange={e=>setRegForm({...regForm,email:e.target.value})}/>
                </div>
              </div>
              <div style={{ background:dark?"#0a2010":"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:10, padding:"10px 14px" }}>
                <p style={{ fontSize:12, color:"#16a34a", fontWeight:600, margin:"0 0 3px" }}>BVN Verification Required</p>
                <p style={{ fontSize:11, color:mutedC, margin:0 }}>The chairperson's BVN will be verified automatically when they accept the invitation SMS.</p>
              </div>
            </div>
          )}

          {regStep===2 && (
            <div style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:16, padding:24, display:"flex", flexDirection:"column", gap:14 }}>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:8, textTransform:"uppercase" }}>Founding Members (phone numbers)</label>
                <p style={{ fontSize:12, color:mutedC, margin:"0 0 10px" }}>Add at least 3 members. They'll receive an SMS invitation to join the cooperative.</p>
                {regForm.members.map((m,i)=>(
                  <div key={i} style={{ display:"flex", gap:8, marginBottom:8 }}>
                    <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#1B5E20,#2E7D32)", display:"flex", alignItems:"center", justifyContent:"center", color:"#F9A825", fontSize:11, fontWeight:700, flexShrink:0, marginTop:3 }}>{i+1}</div>
                    <input style={inp} placeholder={`Member ${i+1} phone number`} value={m} onChange={e=>{const ms=[...regForm.members];ms[i]=e.target.value;setRegForm({...regForm,members:ms});}}/>
                    {i>=3 && <button onClick={()=>setRegForm({...regForm,members:regForm.members.filter((_,j)=>j!==i)})} style={{ padding:"0 10px", borderRadius:8, border:"none", background:"#fee2e2", color:"#dc2626", cursor:"pointer" }}>×</button>}
                  </div>
                ))}
                <button onClick={()=>setRegForm({...regForm,members:[...regForm.members,""]})} style={{ border:`1px dashed ${borderC}`, borderRadius:9, padding:"8px 14px", background:"none", color:mutedC, fontSize:13, cursor:"pointer" }}>
                  + Add another member
                </button>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:mutedC, display:"block", marginBottom:5, textTransform:"uppercase" }}>Monthly Savings per Member (₦)</label>
                <input style={inp} type="number" placeholder="e.g. 5,000" value={regForm.savingsPerMember} onChange={e=>setRegForm({...regForm,savingsPerMember:e.target.value})}/>
                <p style={{ fontSize:11, color:mutedC, margin:"4px 0 0" }}>Regular savings build your group's Loan Guarantee Fund and improve your Group FarmScore.</p>
              </div>
            </div>
          )}

          {regStep===3 && (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div style={{ background:dark?"#0a2010":"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:16, padding:20 }}>
                <p style={{ fontSize:12, fontWeight:700, color:"#16a34a", margin:"0 0 14px", textTransform:"uppercase" }}>Cooperative Summary</p>
                {[
                  ["Name",        regForm.name||"—"],
                  ["Location",    regForm.state&&regForm.lga?`${regForm.lga}, ${regForm.state}`:"—"],
                  ["Crop Focus",  regForm.cropFocus||"—"],
                  ["Chairperson", regForm.chair||"—"],
                  ["Phone",       regForm.phone||"—"],
                  ["Members",     `${regForm.members.filter(m=>m).length} founding members`],
                  ["Monthly Savings", regForm.savingsPerMember?`₦${Number(regForm.savingsPerMember).toLocaleString()} per member`:"—"],
                  ["Starting Group Score", "500 (Silver) — grows as members repay"],
                ].map(([k,v])=>(
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${borderC}` }}>
                    <span style={{ fontSize:12, color:mutedC }}>{k}</span>
                    <span style={{ fontSize:12, fontWeight:600, color:textC, textAlign:"right" }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ background:dark?"#1a1a00":"#fefce8", border:"1px solid #fde68a", borderRadius:10, padding:"10px 14px" }}>
                <p style={{ fontSize:12, color:"#d97706", margin:0 }}>⚠️ All founding members will receive an SMS to verify their identity and consent to cooperative membership before registration is complete.</p>
              </div>
            </div>
          )}

          <div style={{ display:"flex", gap:10, marginTop:16 }}>
            {regStep>0 && <button onClick={()=>setRegStep(s=>s-1)} style={{ flex:1, padding:"11px", borderRadius:10, border:`1px solid ${borderC}`, background:"none", color:mutedC, fontSize:14, cursor:"pointer" }}>← Back</button>}
            {regStep<3 && <button onClick={()=>setRegStep(s=>s+1)} style={{ flex:2, padding:"11px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#1B5E20,#2E7D32)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>Continue →</button>}
            {regStep===3 && <button onClick={()=>{ setView("list"); setRegStep(0); }} style={{ flex:2, padding:"11px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#1B5E20,#2E7D32)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>🤝 Register Cooperative</button>}
          </div>
        </div>
      </main>
    );
  }

  // LIST VIEW
  const summaryStats = [
    {l:"Total Cooperatives",   v:cooperativesData.length,                                              c:"#1B5E20", bg:dark?"#1f2937":"#dcfce7"},
    {l:"Total Members",        v:cooperativesData.reduce((a,c)=>a+c.members,0).toLocaleString(),       c:"#2563eb", bg:dark?"#1f2937":"#dbeafe"},
    {l:"Total Group Loans",    v:`₦${(cooperativesData.reduce((a,c)=>a+parseInt(c.totalDisbursed.replace(/[₦M]/g,"")),0))}M`, c:"#7c3aed",bg:dark?"#1f2937":"#ede9fe"},
    {l:"Avg Group Score",      v:Math.round(cooperativesData.reduce((a,c)=>a+c.groupScore,0)/cooperativesData.length), c:"#d97706", bg:dark?"#1f2937":"#fef3c7"},
  ];

  return (
    <main style={{ flex:1, padding:24, overflowY:"auto" }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:textC, margin:"0 0 4px" }}>Cooperatives</h1>
          <p style={{ fontSize:13, color:mutedC, margin:0 }}>Manage farmer cooperatives, group loans and collective FarmScores</p>
        </div>
        <button onClick={()=>setView("register")} style={{ padding:"9px 18px", borderRadius:10, border:"none", background:"#1B5E20", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
          <Plus size={15}/> Register Cooperative
        </button>
      </div>

      {/* Summary stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        {summaryStats.map(({l,v,c,bg})=>(
          <div key={l} style={{ background:dark?"#1f2937":bg, border:`1px solid ${dark?"#374151":"transparent"}`, borderRadius:12, padding:"14px 16px" }}>
            <p style={{ fontSize:22, fontWeight:700, color:dark?"#f9fafb":c, margin:"0 0 3px" }}>{v}</p>
            <p style={{ fontSize:12, color:mutedC, margin:0 }}>{l}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {["All","Active","Watch"].map(s=>(
          <button key={s} onClick={()=>setFilter(s)} style={{ fontSize:12, padding:"6px 14px", borderRadius:8, border:`1px solid ${filter===s?"#1B5E20":borderC}`, background:filter===s?"#1B5E20":surface, color:filter===s?"#fff":mutedC, fontWeight:filter===s?600:400, cursor:"pointer" }}>{s}</button>
        ))}
        <span style={{ marginLeft:"auto", fontSize:12, color:mutedC, alignSelf:"center" }}>{filtered.length} cooperatives</span>
      </div>

      {/* Cooperative cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))", gap:16 }}>
        {filtered.map((coop,i)=>{
          const sc = scoreColor(coop.groupScore);
          return (
            <div key={i} onClick={()=>{ setSelected(coop); setView("detail"); }} style={{ background:surface, border:`1px solid ${borderC}`, borderRadius:16, overflow:"hidden", cursor:"pointer", boxShadow:dark?"none":"0 2px 10px rgba(0,0,0,0.05)", transition:"box-shadow 0.15s" }}
              onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 20px rgba(27,94,32,0.15)"}
              onMouseLeave={e=>e.currentTarget.style.boxShadow=dark?"none":"0 2px 10px rgba(0,0,0,0.05)"}>
              <div style={{ height:4, background:`linear-gradient(90deg,${sc},#F9A825)` }}/>
              <div style={{ padding:"18px 20px" }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:14 }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:dark?"#0a2010":"#dcfce7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>🤝</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", gap:6, marginBottom:4 }}>
                      <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:4, background:coop.status==="Active"?"#dcfce7":"#fef3c7", color:coop.status==="Active"?"#16a34a":"#d97706" }}>{coop.status.toUpperCase()}</span>
                    </div>
                    <h3 style={{ fontSize:13, fontWeight:700, color:textC, margin:"0 0 2px", lineHeight:1.3 }}>{coop.name}</h3>
                    <p style={{ fontSize:11, color:mutedC, margin:0 }}>{coop.lga}, {coop.state} · {coop.cropFocus}</p>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, flexShrink:0 }}>
                    <CoopScoreRing score={coop.groupScore} size={52}/>
                    <span style={{ fontSize:9, color:mutedC, textTransform:"uppercase", fontWeight:600 }}>Group Score</span>
                  </div>
                </div>

                {/* Stats row */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6, marginBottom:14 }}>
                  {[{l:"Members",v:coop.members,c:"#1B5E20"},{l:"Loans",v:coop.activeLoans,c:"#2563eb"},{l:"Disbursed",v:coop.totalDisbursed,c:"#7c3aed"},{l:"Repay Rate",v:`${coop.repayRate}%`,c:coop.repayRate>=85?"#16a34a":coop.repayRate>=70?"#d97706":"#dc2626"}].map(({l,v,c})=>(
                    <div key={l} style={{ textAlign:"center", padding:"8px 4px", background:dark?"#111827":"#f9fafb", borderRadius:8 }}>
                      <p style={{ fontSize:14, fontWeight:700, color:c, margin:"0 0 2px" }}>{v}</p>
                      <p style={{ fontSize:9, color:mutedC, margin:0 }}>{l}</p>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:11, color:mutedC }}>Group repayment rate</span>
                    <span style={{ fontSize:11, fontWeight:700, color:sc }}>{coop.repayRate}%</span>
                  </div>
                  <div style={{ height:5, borderRadius:5, background:dark?"#374151":"#e5e7eb" }}>
                    <div style={{ width:`${coop.repayRate}%`, height:"100%", borderRadius:5, background:`linear-gradient(90deg,${sc},#F9A825)` }}/>
                  </div>
                </div>

                <div style={{ display:"flex", gap:8 }}>
                  <button style={{ flex:1, padding:"8px", borderRadius:8, border:`1px solid ${borderC}`, background:"none", color:mutedC, fontSize:12, cursor:"pointer" }}>View Details</button>
                  <button style={{ flex:1, padding:"8px", borderRadius:8, border:"none", background:"#1B5E20", color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer" }}>Group Loan →</button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Register new card */}
        <button onClick={()=>setView("register")} style={{ border:`2px dashed ${borderC}`, borderRadius:16, padding:"40px 24px", background:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, minHeight:200 }}
          onMouseEnter={e=>{ e.currentTarget.style.borderColor="#16a34a"; e.currentTarget.style.background=dark?"#0a2010":"#f0fdf4"; }}
          onMouseLeave={e=>{ e.currentTarget.style.borderColor=borderC; e.currentTarget.style.background="none"; }}>
          <div style={{ width:44, height:44, borderRadius:12, background:dark?"#374151":"#f0fdf4", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>🤝</div>
          <div style={{ textAlign:"center" }}>
            <p style={{ fontSize:13, fontWeight:600, color:textC, margin:"0 0 4px" }}>Register New Cooperative</p>
            <p style={{ fontSize:12, color:mutedC, margin:0 }}>Add a farmer cooperative to the platform</p>
          </div>
        </button>
      </div>
    </main>
  );
}
// ─── ROOT APP ────────────────────────────────────────────────────────────────

export default function AgroTrackApp() {
  const [dark, setDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState("Dashboard");

  const bg = dark?"#111827":"#f0fdf4";

  const renderPage = () => {
    if (activeNav==="Dashboard")      return <DashboardPage dark={dark} />;
    if (activeNav==="Loan Programs")  return <LoanProgramsPage dark={dark} />;
    if (activeNav==="Borrowers")      return <BorrowersPage dark={dark} />;
    if (activeNav==="Disbursements")  return <DisbursementsPage dark={dark} />;
    if (activeNav==="Field Agents")   return <FieldAgentsPage dark={dark} />;
    if (activeNav==="Repayments")     return <RepaymentsPage dark={dark} />;
    if (activeNav==="Cooperatives")   return <CooperativesPage dark={dark} />;
    if (activeNav==="Reports")        return <ReportsPage dark={dark} />;
    if (activeNav==="Map View")       return <MapViewPage dark={dark} />;
    if (activeNav==="Messages")       return <MessagesPage dark={dark} />;
    if (activeNav==="Settings")       return <SettingsPage dark={dark} setDark={setDark} />;
    return (
      <main style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12 }}>
        <p style={{ fontSize:22 }}>⚙️</p>
        <p style={{ fontSize:16, fontWeight:600, color:dark?"#f9fafb":"#111827" }}>{activeNav}</p>
        <p style={{ fontSize:13, color:dark?"#9ca3af":"#6b7280" }}>Coming soon</p>
      </main>
    );
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", background:bg, fontFamily:"'Inter',system-ui,sans-serif", transition:"background 0.3s" }}>
      <Sidebar dark={dark} sidebarOpen={sidebarOpen} activeNav={activeNav} setActiveNav={setActiveNav} />
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        <Topbar
          dark={dark} setDark={setDark}
          sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}
          placeholder={
            activeNav==="Borrowers"     ? "Search borrowers..."    :
            activeNav==="Loan Programs" ? "Search programs..."     :
            activeNav==="Field Agents"  ? "Search agents..."       :
            activeNav==="Messages"      ? "Search conversations..."  :
            activeNav==="Map View"      ? "Search locations..."    :
            "Search AgroTrack..."
          }
        />
        {renderPage()}
      </div>
    </div>
  );
}
