export interface Bank {
  code: string;
  name: string;
  slug: string;
}

export const NIGERIAN_BANKS: Bank[] = [
  { code: "044", name: "Access Bank", slug: "access-bank" },
  { code: "063", name: "Access Bank (Diamond)", slug: "access-bank-diamond" },
  { code: "035A", name: "ALAT by WEMA", slug: "alat-by-wema" },
  { code: "401", name: "ASO Savings and Loans", slug: "aso-savings" },
  { code: "023", name: "Citibank Nigeria", slug: "citibank-nigeria" },
  { code: "050", name: "Ecobank Nigeria", slug: "ecobank-nigeria" },
  { code: "562", name: "Ekondo Microfinance Bank", slug: "ekondo-mfb" },
  { code: "070", name: "Fidelity Bank", slug: "fidelity-bank" },
  { code: "011", name: "First Bank of Nigeria", slug: "first-bank" },
  { code: "214", name: "First City Monument Bank", slug: "fcmb" },
  { code: "058", name: "Guaranty Trust Bank", slug: "gtbank" },
  { code: "030", name: "Heritage Bank", slug: "heritage-bank" },
  { code: "301", name: "Jaiz Bank", slug: "jaiz-bank" },
  { code: "082", name: "Keystone Bank", slug: "keystone-bank" },
  { code: "50211", name: "Kuda Bank", slug: "kuda-bank" },
  { code: "565", name: "One Finance", slug: "one-finance" },
  { code: "526", name: "Parallex Bank", slug: "parallex-bank" },
  { code: "101", name: "Providus Bank", slug: "providus-bank" },
  { code: "076", name: "Polaris Bank", slug: "polaris-bank" },
  { code: "221", name: "Stanbic IBTC Bank", slug: "stanbic-ibtc" },
  { code: "068", name: "Standard Chartered Bank", slug: "standard-chartered" },
  { code: "232", name: "Sterling Bank", slug: "sterling-bank" },
  { code: "100", name: "Suntrust Bank", slug: "suntrust-bank" },
  { code: "102", name: "Titan Trust Bank", slug: "titan-trust" },
  { code: "032", name: "Union Bank of Nigeria", slug: "union-bank" },
  { code: "033", name: "United Bank For Africa", slug: "uba" },
  { code: "215", name: "Unity Bank", slug: "unity-bank" },
  { code: "566", name: "VFD Microfinance Bank", slug: "vfd-mfb" },
  { code: "035", name: "Wema Bank", slug: "wema-bank" },
  { code: "057", name: "Zenith Bank", slug: "zenith-bank" },
  { code: "304", name: "Stanbic Mobile Money", slug: "stanbic-mobile" },
  { code: "327", name: "Paga", slug: "paga" },
  { code: "305", name: "Paycom", slug: "paycom" },
  { code: "999991", name: "PalmPay", slug: "palmpay" },
  { code: "999992", name: "OPay", slug: "opay" },
  { code: "50515", name: "Moniepoint MFB", slug: "moniepoint" },
  { code: "999998", name: "Carbon", slug: "carbon" },
];

export const BANK_OPTIONS = NIGERIAN_BANKS.map((b) => ({
  value: b.code,
  label: b.name,
}));

export function getBankByCode(code: string): Bank | undefined {
  return NIGERIAN_BANKS.find((b) => b.code === code);
}

export function getBankBySlug(slug: string): Bank | undefined {
  return NIGERIAN_BANKS.find((b) => b.slug === slug);
}

export function getBankName(code: string): string {
  return getBankByCode(code)?.name || code;
}
