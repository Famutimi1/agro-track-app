export const platformMetrics = [
  { label: "Total Lender Accounts", value: "247", sub: "Active on platform", trend: "+12 this month", up: true, icon: "🏛️", grad: "linear-gradient(135deg,#1B5E20,#2E7D32)" },
  { label: "Total Farmers", value: "87,340", sub: "Registered borrowers", trend: "+2,341 this month", up: true, icon: "👨‍🌾", grad: "linear-gradient(135deg,#1565C0,#1976D2)" },
  { label: "Total Loans Disbursed", value: "₦18.4B", sub: "Across all programs", trend: "+₦2.1B vs last mo", up: true, icon: "💰", grad: "linear-gradient(135deg,#6A1B9A,#7B1FA2)" },
  { label: "Platform Revenue", value: "₦142M", sub: "This month", trend: "+18% vs last mo", up: true, icon: "📈", grad: "linear-gradient(135deg,#B45309,#D97706)" },
  { label: "Active Programs", value: "1,240", sub: "Across all lenders", trend: "+89 this month", up: true, icon: "🎯", grad: "linear-gradient(135deg,#0891b2,#0e7490)" },
  { label: "Default Rate", value: "7.8%", sub: "Platform-wide avg", trend: "-0.4% vs last mo", up: true, icon: "⚠️", grad: "linear-gradient(135deg,#B71C1C,#C62828)" },
];

export const growthData = [
  { m: "Jan", lenders: 180, farmers: 52000, revenue: 98 },
  { m: "Feb", lenders: 192, farmers: 58000, revenue: 108 },
  { m: "Mar", lenders: 205, farmers: 63000, revenue: 115 },
  { m: "Apr", lenders: 214, farmers: 69000, revenue: 122 },
  { m: "May", lenders: 228, farmers: 75000, revenue: 131 },
  { m: "Jun", lenders: 247, farmers: 87340, revenue: 142 },
];

export const revenueBreakdown = [
  { name: "SaaS Subscriptions", value: 68, color: "#1B5E20" },
  { name: "Transaction Fees", value: 22, color: "#F9A825" },
  { name: "FarmScore API", value: 6, color: "#2563eb" },
  { name: "White-Label", value: 4, color: "#7c3aed" },
];

export const lenderAccounts = [
  { id: "LND-001", name: "Federal Ministry of Agriculture", type: "Federal Government", plan: "Enterprise", status: "Active", farmers: 23450, disbursed: "₦4.25B", revenue: "₦18.2M", joined: "Jan 2024", nextBilling: "Jul 1", flags: 0 },
  { id: "LND-002", name: "Central Bank of Nigeria (ABP)", type: "Federal Government", plan: "Enterprise", status: "Active", farmers: 31200, disbursed: "₦8.10B", revenue: "₦24.5M", joined: "Nov 2023", nextBilling: "Jul 1", flags: 0 },
  { id: "LND-003", name: "NIRSAL", type: "Development Finance", plan: "Enterprise", status: "Active", farmers: 8340, disbursed: "₦1.80B", revenue: "₦12.0M", joined: "Feb 2024", nextBilling: "Jul 1", flags: 0 },
  { id: "LND-004", name: "Ekiti State Ministry of Agric", type: "State Government", plan: "Growth", status: "Active", farmers: 1240, disbursed: "₦180M", revenue: "₦750K", joined: "Apr 2024", nextBilling: "Jul 5", flags: 1 },
  { id: "LND-005", name: "Union Bank Agri-Finance Desk", type: "Commercial Bank", plan: "Growth", status: "Active", farmers: 4320, disbursed: "₦920M", revenue: "₦2.1M", joined: "Mar 2024", nextBilling: "Jul 3", flags: 0 },
  { id: "LND-006", name: "USAID Feed the Future Nigeria", type: "International NGO", plan: "Growth", status: "Active", farmers: 5610, disbursed: "₦1.10B", revenue: "₦750K", joined: "Dec 2023", nextBilling: "Jul 1", flags: 0 },
  { id: "LND-007", name: "Kebbi State Government", type: "State Government", plan: "Growth", status: "Suspended", farmers: 980, disbursed: "₦280M", revenue: "₦750K", joined: "Jan 2024", nextBilling: "—", flags: 3 },
  { id: "LND-008", name: "Savannah Agri MFB", type: "Microfinance Bank", plan: "Starter", status: "Trial", farmers: 124, disbursed: "₦18M", revenue: "₦0", joined: "Jun 2024", nextBilling: "Jul 15", flags: 0 },
  { id: "LND-009", name: "GIZ Nigeria Agriculture Program", type: "International NGO", plan: "Growth", status: "Active", farmers: 2180, disbursed: "₦420M", revenue: "₦750K", joined: "Feb 2024", nextBilling: "Jul 2", flags: 0 },
  { id: "LND-010", name: "North-West State Agric Fund", type: "State Government", plan: "Starter", status: "Pending", farmers: 0, disbursed: "₦0", revenue: "₦0", joined: "Jun 2024", nextBilling: "—", flags: 0 },
];

export const tickets = [
  { id: "TKT-2401", lender: "Ekiti State Ministry", subject: "Field agents not appearing on map", priority: "High", status: "Open", created: "2 hrs ago", assigned: "Adaeze O." },
  { id: "TKT-2399", lender: "Union Bank", subject: "FarmScore API returning 429 errors", priority: "High", status: "In Progress", created: "5 hrs ago", assigned: "Emeka C." },
  { id: "TKT-2397", lender: "NIRSAL", subject: "WhatsApp notifications delayed by 4hr", priority: "Medium", status: "In Progress", created: "1 day ago", assigned: "Bello M." },
  { id: "TKT-2395", lender: "Savannah MFB", subject: "Cannot upload org logo > 500KB", priority: "Low", status: "Open", created: "2 days ago", assigned: "Unassigned" },
  { id: "TKT-2392", lender: "USAID Nigeria", subject: "Export to PDF missing columns", priority: "Medium", status: "Resolved", created: "3 days ago", assigned: "Ngozi E." },
  { id: "TKT-2388", lender: "Kebbi State Govt", subject: "Account suspended — billing dispute", priority: "High", status: "Escalated", created: "4 days ago", assigned: "Ibrahim S." },
];

export const featureFlags = [
  { name: "Satellite Crop Monitoring (NDVI)", desc: "Enables satellite imagery layer on map view", beta: true, plans: ["Enterprise"], enabled: true },
  { name: "AI Default Prediction Engine", desc: "ML-powered default risk scoring", beta: true, plans: ["Enterprise", "Growth"], enabled: true },
  { name: "WhatsApp Bot Integration", desc: "Two-way WhatsApp messaging for borrowers", beta: false, plans: ["Enterprise", "Growth"], enabled: true },
  { name: "Cooperative Group Loans", desc: "Multi-member cooperative loan applications", beta: true, plans: ["Enterprise", "Growth", "Starter"], enabled: true },
  { name: "In-Kind (Produce) Repayments", desc: "Allow repayment via harvested produce", beta: false, plans: ["Enterprise", "Growth"], enabled: true },
  { name: "USSD Self-Registration", desc: "Farmers register via *737*99# USSD code", beta: false, plans: ["Enterprise", "Growth", "Starter"], enabled: true },
  { name: "FarmScore API External Access", desc: "Third-party banks query FarmScore via API", beta: false, plans: ["Enterprise"], enabled: false },
  { name: "Bulk SMS Broadcast", desc: "Send SMS to all borrowers in a program", beta: false, plans: ["Enterprise", "Growth"], enabled: true },
  { name: "Multi-Currency Support", desc: "GHS, KES, USD support for global expansion", beta: true, plans: ["Enterprise"], enabled: false },
  { name: "Auto-Approve High FarmScore", desc: "Auto-approve borrowers scoring 750+", beta: true, plans: ["Enterprise", "Growth"], enabled: false },
];

export const systemHealth = [
  { name: "API Gateway", status: "Operational", uptime: "99.98%", latency: "42ms", icon: "🌐" },
  { name: "Database Cluster", status: "Operational", uptime: "99.99%", latency: "8ms", icon: "🗄️" },
  { name: "File Storage (S3)", status: "Operational", uptime: "100%", latency: "120ms", icon: "☁️" },
  { name: "SMS Service", status: "Degraded", uptime: "98.2%", latency: "1.2s", icon: "📱" },
  { name: "WhatsApp API", status: "Operational", uptime: "99.7%", latency: "380ms", icon: "💬" },
  { name: "FarmScore Engine", status: "Operational", uptime: "99.95%", latency: "210ms", icon: "📊" },
  { name: "Map / Geospatial", status: "Operational", uptime: "99.9%", latency: "95ms", icon: "🗺️" },
  { name: "USSD Gateway", status: "Operational", uptime: "99.6%", latency: "650ms", icon: "📲" },
];
