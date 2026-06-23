export interface Crop {
  id: string;
  name: string;
  category: "cereal" | "legume" | "tuber" | "vegetable" | "fruit" | "cash_crop" | "oil_seed";
  growingSeasons: string[];
  avgCycleDays: number;
}

export const NIGERIAN_CROPS: Crop[] = [
  // Cereals
  { id: "maize", name: "Maize (Corn)", category: "cereal", growingSeasons: ["March-July", "August-November"], avgCycleDays: 90 },
  { id: "rice", name: "Rice", category: "cereal", growingSeasons: ["June-October", "November-March"], avgCycleDays: 120 },
  { id: "sorghum", name: "Sorghum (Guinea Corn)", category: "cereal", growingSeasons: ["June-October"], avgCycleDays: 120 },
  { id: "millet", name: "Millet", category: "cereal", growingSeasons: ["June-September"], avgCycleDays: 90 },
  { id: "wheat", name: "Wheat", category: "cereal", growingSeasons: ["November-March"], avgCycleDays: 120 },

  // Legumes
  { id: "cowpea", name: "Cowpea (Beans)", category: "legume", growingSeasons: ["June-September", "October-January"], avgCycleDays: 70 },
  { id: "groundnut", name: "Groundnut (Peanut)", category: "legume", growingSeasons: ["May-September"], avgCycleDays: 120 },
  { id: "soybean", name: "Soybean", category: "legume", growingSeasons: ["June-October"], avgCycleDays: 100 },
  { id: "bambara", name: "Bambara Nut", category: "legume", growingSeasons: ["June-October"], avgCycleDays: 150 },

  // Tubers
  { id: "cassava", name: "Cassava", category: "tuber", growingSeasons: ["April-May", "September-October"], avgCycleDays: 270 },
  { id: "yam", name: "Yam", category: "tuber", growingSeasons: ["March-April"], avgCycleDays: 240 },
  { id: "cocoyam", name: "Cocoyam", category: "tuber", growingSeasons: ["March-May"], avgCycleDays: 270 },
  { id: "potato_sweet", name: "Sweet Potato", category: "tuber", growingSeasons: ["April-June", "September-November"], avgCycleDays: 120 },
  { id: "potato_irish", name: "Irish Potato", category: "tuber", growingSeasons: ["October-March"], avgCycleDays: 100 },

  // Vegetables
  { id: "tomato", name: "Tomato", category: "vegetable", growingSeasons: ["October-February", "April-July"], avgCycleDays: 75 },
  { id: "pepper", name: "Pepper (Chili/Bell)", category: "vegetable", growingSeasons: ["Year-round"], avgCycleDays: 90 },
  { id: "onion", name: "Onion", category: "vegetable", growingSeasons: ["October-February"], avgCycleDays: 120 },
  { id: "okra", name: "Okra", category: "vegetable", growingSeasons: ["March-July", "August-November"], avgCycleDays: 60 },
  { id: "spinach", name: "Spinach (Efo)", category: "vegetable", growingSeasons: ["Year-round"], avgCycleDays: 45 },
  { id: "cabbage", name: "Cabbage", category: "vegetable", growingSeasons: ["October-February"], avgCycleDays: 90 },
  { id: "carrot", name: "Carrot", category: "vegetable", growingSeasons: ["October-February"], avgCycleDays: 80 },
  { id: "lettuce", name: "Lettuce", category: "vegetable", growingSeasons: ["October-February"], avgCycleDays: 60 },

  // Fruits
  { id: "banana", name: "Banana/Plantain", category: "fruit", growingSeasons: ["Year-round"], avgCycleDays: 365 },
  { id: "orange", name: "Orange", category: "fruit", growingSeasons: ["Year-round"], avgCycleDays: 730 },
  { id: "mango", name: "Mango", category: "fruit", growingSeasons: ["Year-round"], avgCycleDays: 1095 },
  { id: "pineapple", name: "Pineapple", category: "fruit", growingSeasons: ["Year-round"], avgCycleDays: 540 },
  { id: "watermelon", name: "Watermelon", category: "fruit", growingSeasons: ["October-March"], avgCycleDays: 90 },
  { id: "pawpaw", name: "Pawpaw (Papaya)", category: "fruit", growingSeasons: ["Year-round"], avgCycleDays: 365 },

  // Cash Crops
  { id: "cocoa", name: "Cocoa", category: "cash_crop", growingSeasons: ["Year-round"], avgCycleDays: 1825 },
  { id: "cotton", name: "Cotton", category: "cash_crop", growingSeasons: ["June-November"], avgCycleDays: 180 },
  { id: "rubber", name: "Rubber", category: "cash_crop", growingSeasons: ["Year-round"], avgCycleDays: 2555 },
  { id: "sugarcane", name: "Sugarcane", category: "cash_crop", growingSeasons: ["April-October"], avgCycleDays: 365 },
  { id: "tobacco", name: "Tobacco", category: "cash_crop", growingSeasons: ["August-December"], avgCycleDays: 120 },
  { id: "ginger", name: "Ginger", category: "cash_crop", growingSeasons: ["April-May"], avgCycleDays: 270 },

  // Oil Seeds
  { id: "palm_oil", name: "Oil Palm", category: "oil_seed", growingSeasons: ["Year-round"], avgCycleDays: 1460 },
  { id: "sesame", name: "Sesame (Beniseed)", category: "oil_seed", growingSeasons: ["June-October"], avgCycleDays: 100 },
  { id: "sunflower", name: "Sunflower", category: "oil_seed", growingSeasons: ["August-December"], avgCycleDays: 100 },
  { id: "shea", name: "Shea Nut", category: "oil_seed", growingSeasons: ["Year-round"], avgCycleDays: 5475 },
];

export const CROP_OPTIONS = NIGERIAN_CROPS.map((c) => ({
  value: c.id,
  label: c.name,
}));

export const CROP_CATEGORIES = [
  { value: "cereal", label: "Cereals" },
  { value: "legume", label: "Legumes" },
  { value: "tuber", label: "Tubers" },
  { value: "vegetable", label: "Vegetables" },
  { value: "fruit", label: "Fruits" },
  { value: "cash_crop", label: "Cash Crops" },
  { value: "oil_seed", label: "Oil Seeds" },
];

export function getCropById(id: string): Crop | undefined {
  return NIGERIAN_CROPS.find((c) => c.id === id);
}

export function getCropsByCategory(category: Crop["category"]): Crop[] {
  return NIGERIAN_CROPS.filter((c) => c.category === category);
}

export function getCropName(id: string): string {
  return getCropById(id)?.name || id;
}
