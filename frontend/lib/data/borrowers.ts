export const borrowers = [
  { id: "FMR-0012", name: "Adaeze Okonkwo", state: "Anambra", lga: "Onitsha", crop: "Cassava", loan: "₦450,000", disbursed: "₦270,000", repaid: "₦135,000", score: 742, status: "Active", gender: "F", phone: "0803 xxx xxxx", farm: "2.4 ha", program: "NIRSAL Cassava", joined: "Jan 2025", layers: [true, true, false], lastReport: "2 days ago" },
  { id: "FMR-0034", name: "Bello Musa", state: "Kebbi", lga: "Birnin Kebbi", crop: "Rice", loan: "₦850,000", disbursed: "₦850,000", repaid: "₦510,000", score: 815, status: "Active", gender: "M", phone: "0706 xxx xxxx", farm: "5.1 ha", program: "CBN Rice Fund", joined: "Feb 2025", layers: [true, true, true], lastReport: "1 day ago" },
  { id: "FMR-0078", name: "Grace Adeleke", state: "Oyo", lga: "Ibadan North", crop: "Cassava", loan: "₦200,000", disbursed: "₦120,000", repaid: "₦40,000", score: 510, status: "At Risk", gender: "F", phone: "0901 xxx xxxx", farm: "1.2 ha", program: "NIRSAL Cassava", joined: "Mar 2025", layers: [true, false, false], lastReport: "22 days ago" },
  { id: "FMR-0091", name: "Emeka Chukwu", state: "Anambra", lga: "Awka", crop: "Yam", loan: "₦300,000", disbursed: "₦300,000", repaid: "₦0", score: 420, status: "Defaulting", gender: "M", phone: "0812 xxx xxxx", farm: "1.8 ha", program: "BOA Smallholder", joined: "Dec 2024", layers: [true, true, false], lastReport: "47 days ago" },
  { id: "FMR-0105", name: "Hajiya Fatima", state: "Kano", lga: "Fagge", crop: "Rice", loan: "₦600,000", disbursed: "₦600,000", repaid: "₦600,000", score: 890, status: "Completed", gender: "F", phone: "0705 xxx xxxx", farm: "3.8 ha", program: "CBN Rice Fund", joined: "Nov 2024", layers: [true, true, true], lastReport: "5 days ago" },
  { id: "FMR-0143", name: "Sule Danjuma", state: "Kogi", lga: "Lokoja", crop: "Maize", loan: "₦500,000", disbursed: "₦300,000", repaid: "₦0", score: 390, status: "Defaulting", gender: "M", phone: "0813 xxx xxxx", farm: "2.1 ha", program: "BOA Smallholder", joined: "Jan 2025", layers: [true, false, false], lastReport: "31 days ago" },
  { id: "FMR-0167", name: "Ngozi Eze", state: "Imo", lga: "Owerri", crop: "Vegetables", loan: "₦150,000", disbursed: "₦90,000", repaid: "₦45,000", score: 678, status: "Active", gender: "F", phone: "0803 xxx xxxx", farm: "0.8 ha", program: "USAID Vegetable", joined: "Feb 2025", layers: [true, true, false], lastReport: "4 days ago" },
  { id: "FMR-0189", name: "Musa Garba", state: "Kebbi", lga: "Argungu", crop: "Rice", loan: "₦750,000", disbursed: "₦450,000", repaid: "₦0", score: 445, status: "At Risk", gender: "M", phone: "0907 xxx xxxx", farm: "4.2 ha", program: "Kebbi Irrigation", joined: "Mar 2025", layers: [true, true, false], lastReport: "18 days ago" },
  { id: "FMR-0201", name: "Amina Ibrahim", state: "Kaduna", lga: "Kaduna South", crop: "Maize", loan: "₦380,000", disbursed: "₦380,000", repaid: "₦190,000", score: 721, status: "Active", gender: "F", phone: "0706 xxx xxxx", farm: "2.9 ha", program: "BOA Smallholder", joined: "Jan 2025", layers: [true, true, true], lastReport: "3 days ago" },
  { id: "FMR-0224", name: "Tunde Fashola", state: "Ekiti", lga: "Ado-Ekiti", crop: "Cocoa", loan: "₦250,000", disbursed: "₦150,000", repaid: "₦75,000", score: 658, status: "Active", gender: "M", phone: "0815 xxx xxxx", farm: "1.5 ha", program: "Ekiti Youth Fund", joined: "Apr 2025", layers: [true, false, false], lastReport: "6 days ago" },
];

export const cropColors: Record<string, { bg: string; color: string }> = {
  Rice: { bg: "#dcfce7", color: "#166534" },
  Cassava: { bg: "#fef3c7", color: "#854d0e" },
  Maize: { bg: "#dbeafe", color: "#1e40af" },
  Yam: { bg: "#fed7aa", color: "#9a3412" },
  Cocoa: { bg: "#d1fae5", color: "#065f46" },
  Cashew: { bg: "#fce7f3", color: "#9d174d" },
  Tomato: { bg: "#fee2e2", color: "#991b1b" },
  Pepper: { bg: "#fef9c3", color: "#713f12" },
  Vegetables: { bg: "#d1fae5", color: "#065f46" },
  Sorghum: { bg: "#ede9fe", color: "#5b21b6" },
  Wheat: { bg: "#e0f2fe", color: "#0c4a6e" },
};
