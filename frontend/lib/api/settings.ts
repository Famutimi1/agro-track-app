import { api, ApiResponse } from "./client";

export interface LenderOrganization {
  id: string;
  name: string;
  type: string;
  cacNumber?: string;
  plan: "STARTER" | "GROWTH" | "ENTERPRISE";
  status: string;
  verified: boolean;
  email: string;
  phone?: string;
  address?: string;
  state?: string;
  website?: string;
  logoUrl?: string;
  totalDisbursed: number;
  totalRecovered: number;
  defaultRate: number;
  activeBorrowers: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    programs: number;
    users: number;
    cooperatives: number;
  };
}

export interface TeamMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl?: string;
  phone?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface NotificationSettings {
  newApplication: { email: boolean; sms: boolean; inApp: boolean };
  applicationApproved: { email: boolean; sms: boolean; inApp: boolean };
  disbursementReleased: { email: boolean; sms: boolean; inApp: boolean };
  repaymentReceived: { email: boolean; sms: boolean; inApp: boolean };
  paymentOverdue: { email: boolean; sms: boolean; inApp: boolean };
  farmReportSubmitted: { email: boolean; sms: boolean; inApp: boolean };
  agentVerificationComplete: { email: boolean; sms: boolean; inApp: boolean };
  frequency: "INSTANT" | "DAILY_DIGEST" | "WEEKLY_SUMMARY";
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

export interface DisbursementRules {
  requireLayeredDisbursement: boolean;
  requireAgentVerification: boolean;
  autoApproveAboveScore: number | null;
  maxProcessingDays: number;
  defaultReportInterval: "WEEKLY" | "BIWEEKLY" | "MONTHLY";
}

export interface ApiKey {
  id: string;
  name: string;
  key?: string;
  scopes: string[];
  createdAt: string;
}

export interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface BillingInfo {
  currentPlan: string;
  usage: {
    borrowers: number;
    programs: number;
    teamMembers: number;
    apiCalls: number;
  };
  limits: {
    borrowers: number;
    programs: number;
    teamMembers: number;
  };
  nextBillingDate: string;
  invoices: Array<{
    id: string;
    date: string;
    amount: number;
    status: string;
    downloadUrl?: string;
  }>;
}

export interface Integrations {
  paystack: { connected: boolean; configurable: boolean };
  whatsapp: { connected: boolean; configurable: boolean };
  termii: { connected: boolean; configurable: boolean };
  googleMaps: { connected: boolean; configurable: boolean };
  nibssBvn: { connected: boolean; configurable: boolean; managedByPlatform?: boolean };
  nimcNin: { connected: boolean; configurable: boolean; managedByPlatform?: boolean };
  farmScoreApi: { enabled: boolean; configurable: boolean };
}

export const settingsApi = {
  // Organization
  getOrganization: async () => {
    const res = await api.get<ApiResponse<LenderOrganization>>("/lenders/organization");
    return res.data.data;
  },

  updateOrganization: async (data: Partial<{
    name: string;
    email: string;
    phone: string;
    address: string;
    state: string;
    website: string;
    logoUrl: string;
  }>) => {
    const res = await api.patch<ApiResponse<LenderOrganization>>("/lenders/organization", data);
    return res.data.data;
  },

  // Team
  getTeamMembers: async () => {
    const res = await api.get<ApiResponse<TeamMember[]>>("/lenders/team");
    return res.data.data;
  },

  inviteTeamMember: async (data: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  }) => {
    const res = await api.post<ApiResponse<TeamMember>>("/lenders/team", data);
    return res.data.data;
  },

  updateTeamMember: async (memberId: string, data: { role?: string; firstName?: string; lastName?: string }) => {
    const res = await api.patch<ApiResponse<TeamMember>>(`/lenders/team/${memberId}`, data);
    return res.data.data;
  },

  removeTeamMember: async (memberId: string) => {
    await api.delete(`/lenders/team/${memberId}`);
  },

  // Notification Settings
  getNotificationSettings: async () => {
    const res = await api.get<ApiResponse<NotificationSettings>>("/lenders/notification-settings");
    return res.data.data;
  },

  updateNotificationSettings: async (settings: Partial<NotificationSettings>) => {
    const res = await api.patch<ApiResponse<NotificationSettings>>("/lenders/notification-settings", settings);
    return res.data.data;
  },

  // Disbursement Rules
  getDisbursementRules: async () => {
    const res = await api.get<ApiResponse<DisbursementRules>>("/lenders/disbursement-rules");
    return res.data.data;
  },

  updateDisbursementRules: async (rules: Partial<DisbursementRules>) => {
    const res = await api.patch<ApiResponse<DisbursementRules>>("/lenders/disbursement-rules", rules);
    return res.data.data;
  },

  // API Keys
  getApiKeys: async () => {
    const res = await api.get<ApiResponse<ApiKey[]>>("/lenders/api-keys");
    return res.data.data;
  },

  createApiKey: async (data: { name: string; scopes?: string[] }) => {
    const res = await api.post<ApiResponse<ApiKey>>("/lenders/api-keys", data);
    return res.data.data;
  },

  revokeApiKey: async (keyId: string) => {
    await api.delete(`/lenders/api-keys/${keyId}`);
  },

  // Sessions
  getSessions: async () => {
    const res = await api.get<ApiResponse<Session[]>>("/lenders/sessions");
    return res.data.data;
  },

  revokeSession: async (sessionId: string) => {
    await api.delete(`/lenders/sessions/${sessionId}`);
  },

  // Billing
  getBillingInfo: async () => {
    const res = await api.get<ApiResponse<BillingInfo>>("/lenders/billing");
    return res.data.data;
  },

  // Integrations
  getIntegrations: async () => {
    const res = await api.get<ApiResponse<Integrations>>("/lenders/integrations");
    return res.data.data;
  },

  updateIntegration: async (integration: string, config: Record<string, any>) => {
    await api.patch(`/lenders/integrations/${integration}`, config);
  },
};

export const ROLES = [
  { value: "LENDER_ADMIN", label: "Admin", description: "Full access to all features" },
  { value: "LENDER_MANAGER", label: "Manager", description: "Can manage programs, applications, and team" },
  { value: "LENDER_ANALYST", label: "Analyst", description: "Read-only access with reports" },
  { value: "LENDER_VIEWER", label: "Viewer", description: "Read-only access" },
];

export const PLANS = [
  {
    value: "STARTER",
    label: "Starter",
    price: "N50,000/mo",
    features: ["Up to 500 borrowers", "3 loan programs", "5 team members", "Email support"],
  },
  {
    value: "GROWTH",
    label: "Growth",
    price: "N150,000/mo",
    features: ["Up to 5,000 borrowers", "10 loan programs", "20 team members", "Priority support", "API access"],
  },
  {
    value: "ENTERPRISE",
    label: "Enterprise",
    price: "Custom",
    features: ["Unlimited borrowers", "Unlimited programs", "Unlimited team", "Dedicated support", "Custom integrations"],
  },
];
