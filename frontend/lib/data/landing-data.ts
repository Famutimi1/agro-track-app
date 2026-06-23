export const stats = [
  { value: "₦4.2B+", label: "Loans Tracked", icon: "💰" },
  { value: "23,450", label: "Farmers Verified", icon: "👨‍🌾" },
  { value: "12", label: "States Active", icon: "🗺️" },
  { value: "87%", label: "Repayment Rate", icon: "📈" },
];

export const features = [
  { icon: "🗺️", title: "Real-Time Portfolio Map", desc: "See exactly where every loan is on an interactive map of Nigeria. No more guessing where your money went.", color: "#16a34a", bg: "#dcfce7", darkBg: "#0a2010" },
  { icon: "🔐", title: "Layered Disbursement", desc: "Release funds in tranches tied to verified farm activity. Reduces diversion and misuse of agricultural loans by up to 67%.", color: "#2563eb", bg: "#dbeafe", darkBg: "#0d1a30" },
  { icon: "📊", title: "FarmScore Credit Engine", desc: "The first agricultural credit score built for Nigerian smallholders. Portable, transparent, and accepted by major banks.", color: "#7c3aed", bg: "#ede9fe", darkBg: "#1a0d30" },
  { icon: "👨‍🌾", title: "Field Agent Network", desc: "Deploy verified agents to register farmers in remote areas. GPS-tagged farm boundaries, photo verification, offline sync.", color: "#d97706", bg: "#fef3c7", darkBg: "#2d1a00" },
  { icon: "📱", title: "USSD & WhatsApp Access", desc: "Every farmer — even without a smartphone — can check balance, submit reports, and make repayments via USSD.", color: "#0891b2", bg: "#e0f2fe", darkBg: "#0a2030" },
  { icon: "🤖", title: "AI-Powered Risk Analysis", desc: "Predict defaults before they happen. Satellite crop monitoring, weather risk overlays, and FarmScore analytics in one place.", color: "#be185d", bg: "#fce7f3", darkBg: "#2d0a1a" },
];

export const steps = [
  { num: "01", who: "Lender", icon: "🏛️", title: "Create a Program", desc: "Set up a loan or grant with eligibility criteria, disbursement layers, and documentation requirements in minutes." },
  { num: "02", who: "Farmer", icon: "👨‍🌾", title: "Register & Apply", desc: "Farmers register via app, USSD, or field agent. BVN/NIN verified. Farm GPS-mapped. Application in one tap." },
  { num: "03", who: "Agent", icon: "✅", title: "Verify on the Ground", desc: "Field agents visit farms, confirm identity, map boundaries, and submit photo reports — even offline." },
  { num: "04", who: "Platform", icon: "💰", title: "Disburse in Layers", desc: "Funds release in tranches only when farmers prove previous disbursement was used correctly." },
  { num: "05", who: "Platform", icon: "📈", title: "Track & Score", desc: "Repayments, farm reports and performance build each farmer's FarmScore — a portable credit identity." },
];

export const testimonials = [
  { name: "Dr. Emeka Okonkwo", role: "Director, CBN Anchor Borrowers Programme", text: "AgroTrack gave us visibility we never had before. We could see exactly where our disbursements were going — down to the GPS coordinate of each farm.", stars: 5 },
  { name: "Hajiya Aisha Musa", role: "Program Officer, NIRSAL", text: "The layered disbursement feature alone has reduced fund diversion by over 60% in our pilot. It's now a non-negotiable requirement for all grant programs.", stars: 5 },
  { name: "Tunde Adeyemi", role: "Head of Agri-Finance, Union Bank", text: "FarmScore has transformed how we assess agricultural borrowers. We can now lend confidently to farmers who previously had no credit history at all.", stars: 5 },
];

export const pricing = [
  { plan: "Starter", price: "₦250K", period: "/mo", desc: "For NGOs and state agencies piloting agricultural lending", hot: false, features: ["500 borrowers", "3 programs", "Lender dashboard", "Email + SMS alerts", "FarmScore basic", "CSV export"] },
  { plan: "Growth", price: "₦750K", period: "/mo", desc: "For banks and ministries managing active loan portfolios", hot: true, features: ["5,000 borrowers", "Unlimited programs", "Full geospatial map", "Field agent management", "FarmScore API", "WhatsApp integration", "Priority support"] },
  { plan: "Enterprise", price: "Custom", period: "", desc: "For CBN, NIRSAL, and national-scale programs", hot: false, features: ["Unlimited borrowers", "White-label option", "Custom integrations", "Dedicated manager", "Satellite monitoring", "Full audit trail", "On-site training"] },
];

export const markets = [
  { flag: "🇳🇬", country: "Nigeria", status: "Launched", color: "#16a34a" },
  { flag: "🇬🇭", country: "Ghana", status: "Q1 2026", color: "#2563eb" },
  { flag: "🇰🇪", country: "Kenya", status: "Q2 2026", color: "#7c3aed" },
  { flag: "🇹🇿", country: "Tanzania", status: "Q3 2026", color: "#d97706" },
  { flag: "🇮🇳", country: "India", status: "2027", color: "#0891b2" },
  { flag: "🌎", country: "Latin America", status: "2027", color: "#be185d" },
];
