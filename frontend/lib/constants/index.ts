export * from "./states";
export * from "./lgas";
export * from "./banks";
export * from "./crops";

export const PHONE_REGEX = /^(\+234|0)[789][01]\d{8}$/;

export const BVN_REGEX = /^\d{11}$/;

export const NIN_REGEX = /^\d{11}$/;

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "ha", name: "Hausa" },
  { code: "yo", name: "Yoruba" },
  { code: "ig", name: "Igbo" },
];

export const IRRIGATION_TYPES = [
  { value: "rainfed", label: "Rainfed" },
  { value: "drip", label: "Drip Irrigation" },
  { value: "sprinkler", label: "Sprinkler" },
  { value: "flood", label: "Flood/Surface" },
  { value: "manual", label: "Manual Watering" },
  { value: "center_pivot", label: "Center Pivot" },
];

export const SOIL_TYPES = [
  { value: "sandy", label: "Sandy" },
  { value: "clay", label: "Clay" },
  { value: "loamy", label: "Loamy" },
  { value: "silt", label: "Silt" },
  { value: "peat", label: "Peat" },
  { value: "chalky", label: "Chalky" },
];

export const FARM_SIZE_RANGES = [
  { value: "micro", label: "Micro (< 1 ha)", min: 0, max: 1 },
  { value: "small", label: "Small (1-5 ha)", min: 1, max: 5 },
  { value: "medium", label: "Medium (5-20 ha)", min: 5, max: 20 },
  { value: "large", label: "Large (20-100 ha)", min: 20, max: 100 },
  { value: "commercial", label: "Commercial (> 100 ha)", min: 100, max: Infinity },
];

export const GUARANTOR_RELATIONS = [
  { value: "spouse", label: "Spouse" },
  { value: "parent", label: "Parent" },
  { value: "sibling", label: "Sibling" },
  { value: "child", label: "Child" },
  { value: "relative", label: "Other Relative" },
  { value: "friend", label: "Friend" },
  { value: "employer", label: "Employer" },
  { value: "colleague", label: "Colleague" },
  { value: "community_leader", label: "Community Leader" },
];

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("234")) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith("0")) {
    return `+234${cleaned.slice(1)}`;
  }
  return `+234${cleaned}`;
}

export function validateBVN(bvn: string): boolean {
  return BVN_REGEX.test(bvn);
}

export function validateNIN(nin: string): boolean {
  return NIN_REGEX.test(nin);
}

export function validatePhone(phone: string): boolean {
  return PHONE_REGEX.test(phone);
}
