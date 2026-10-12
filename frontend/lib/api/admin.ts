import { api, ApiResponse, PaginatedResponse } from "./client";

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  lenderOrg?: { id: string; name: string } | null;
}

export interface AdminUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: "active" | "inactive";
}

export interface PlatformStats {
  totalUsers: number;
  totalLenders: number;
  totalBorrowers: number;
  totalLoans: number;
  totalDisbursed: number;
  totalRepaid: number;
}

export interface AdminLenderAccount {
  id: string;
  name: string;
  type: string;
  plan: string;
  status: string;
  email: string;
  totalDisbursed: string | number;
  totalRecovered: string | number;
  defaultRate: number;
  activeBorrowers: number;
  createdAt: string;
  _count?: { programs: number; users: number };
}

export interface AdminLendersQuery {
  page?: number;
  limit?: number;
  search?: string;
  plan?: string;
  status?: string;
}

export interface AdminTicketMessage {
  id: string;
  ticketId: string;
  authorId: string;
  body: string;
  isStaff: boolean;
  createdAt: string;
  author?: { firstName: string; lastName: string; role: string } | null;
}

export interface AdminTicket {
  id: string;
  subject: string;
  description?: string | null;
  priority: string;
  status: string;
  resolvedAt?: string | null;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
  messages?: AdminTicketMessage[];
}

export interface AdminTicketsQuery {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
}

export interface AdminDocument {
  id: string;
  type: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number | null;
  mimeType?: string | null;
  status: string;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  rejectionReason?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  user?: { firstName: string; lastName: string; email: string } | null;
  borrower?: {
    farmerId: string;
    user: { firstName: string; lastName: string; email: string };
  } | null;
}

export interface AdminDocumentsQuery {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
}

export interface AdminTransaction {
  id: string;
  reference: string;
  type: string;
  status: string;
  amount: string | number;
  currency: string;
  provider?: string | null;
  providerRef?: string | null;
  loanId?: string | null;
  borrowerId?: string | null;
  failureReason?: string | null;
  processedAt?: string | null;
  createdAt: string;
}

export interface AdminTransactionsQuery {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  search?: string;
}

export interface TransactionSummary {
  [status: string]: { count: number; amount: number };
}

export interface AdminBroadcast {
  id: string;
  subject?: string | null;
  content: string;
  audience: { type: "ALL" | "ROLE"; roles?: string[] };
  channels: string[];
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  status: string;
  scheduledAt?: string | null;
  sentAt?: string | null;
  createdBy: string;
  createdAt: string;
}

export interface AdminBroadcastsQuery {
  page?: number;
  limit?: number;
  status?: string;
}

export interface CreateBroadcastRequest {
  subject?: string;
  content: string;
  audience: { type: "ALL" | "ROLE"; roles?: string[] };
  channels?: string[];
}

export interface AdminMessageTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  channels: string[];
  variables: string[];
  isSystem: boolean;
  createdAt: string;
}

export interface CreateTemplateRequest {
  name: string;
  category: string;
  content: string;
  channels?: string[];
}

export interface AdminWebhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  lastTriggered?: string | null;
  failCount: number;
  createdAt: string;
  secret?: string;
}

export interface AdminApiKey {
  id: string;
  name: string;
  key?: string;
  prefix: string;
  permissions: string[];
  lastUsedAt?: string | null;
  expiresAt?: string | null;
  active: boolean;
  createdAt: string;
}

export interface AdminFeatureFlag {
  id: string;
  key: string;
  description?: string | null;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId?: string | null;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  user?: { firstName: string; lastName: string; email: string; role: string } | null;
}

export interface AdminAuditLogQuery {
  page?: number;
  limit?: number;
  action?: string;
  resource?: string;
}

export interface GrowthPoint {
  m: string;
  lenders: number;
  farmers: number;
  loans: number;
  revenue: number;
}

export interface RevenueStats {
  mrr: number;
  arr: number;
  totalCollected: number;
  totalDisbursed: number;
  breakdown: { name: string; value: number }[];
  planDistribution: { name: string; value: number }[];
}

export interface AdminSubscription {
  id: string;
  lenderOrgId: string;
  lenderName: string;
  plan: string;
  status: string;
  amount: number;
  currency: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  canceledAt: string | null;
  createdAt: string;
}

export interface AdminSubscriptionsQuery {
  status?: string;
  plan?: string;
  page?: number;
  limit?: number;
}

export interface AdminInvoicePayment {
  id: string;
  amount: number;
  currency: string;
  method: string;
  reference: string | null;
  paidAt: string;
}

export interface AdminInvoiceLineItem {
  description: string;
  amount: number;
  quantity: number;
}

export interface AdminInvoice {
  id: string;
  number: string;
  lenderOrgId: string;
  lenderName: string;
  amount: number;
  currency: string;
  status: string;
  issuedAt: string;
  dueAt: string;
  paidAt: string | null;
  paymentCount: number;
}

export interface AdminInvoiceDetail extends Omit<AdminInvoice, "paymentCount"> {
  subscriptionId: string | null;
  lineItems: AdminInvoiceLineItem[];
  createdAt: string;
  payments: AdminInvoicePayment[];
}

export interface AdminInvoicesQuery {
  status?: string;
  lenderOrgId?: string;
  page?: number;
  limit?: number;
}

export interface RecordPaymentRequest {
  amount: number;
  method: string;
  reference?: string;
}

export interface SystemHealth {
  overall: "Operational" | "Degraded" | "Down";
  services: {
    name: string;
    status: "Operational" | "Degraded" | "Down" | "Not Configured";
    latency: string;
    detail?: string;
  }[];
  uptimeSeconds: number;
  timestamp: string;
}

export interface PlatformSettings {
  platformName: string;
  supportEmail: string;
  defaultCurrency: string;
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  emailNotifications: boolean;
  apiRateLimiting: boolean;
  debugMode: boolean;
}

export const adminApi = {
  getStats: async () => {
    const res = await api.get<ApiResponse<PlatformStats>>("/admin/stats");
    return res.data.data;
  },

  getLenders: async (query: AdminLendersQuery = {}) => {
    const res = await api.get<PaginatedResponse<AdminLenderAccount>>("/admin/lenders", { params: query });
    return res.data;
  },

  getTickets: async (query: AdminTicketsQuery = {}) => {
    const res = await api.get<PaginatedResponse<AdminTicket>>("/admin/tickets", { params: query });
    return res.data;
  },

  getFeatureFlags: async () => {
    const res = await api.get<ApiResponse<AdminFeatureFlag[]>>("/admin/feature-flags");
    return res.data.data;
  },

  toggleFeatureFlag: async (id: string) => {
    const res = await api.patch<ApiResponse<AdminFeatureFlag>>(`/admin/feature-flags/${id}/toggle`);
    return res.data.data;
  },

  getAuditLog: async (query: AdminAuditLogQuery = {}) => {
    const res = await api.get<PaginatedResponse<AdminAuditLog>>("/admin/audit-log", { params: query });
    return res.data;
  },

  getGrowthAnalytics: async (months = 6) => {
    const res = await api.get<ApiResponse<GrowthPoint[]>>("/admin/analytics/growth", { params: { months } });
    return res.data.data;
  },

  getRevenueStats: async () => {
    const res = await api.get<ApiResponse<RevenueStats>>("/admin/analytics/revenue");
    return res.data.data;
  },

  getSystemHealth: async () => {
    const res = await api.get<ApiResponse<SystemHealth>>("/admin/system-health");
    return res.data.data;
  },

  getSettings: async () => {
    const res = await api.get<ApiResponse<PlatformSettings>>("/admin/settings");
    return res.data.data;
  },

  updateSettings: async (patch: Partial<PlatformSettings>) => {
    const res = await api.patch<ApiResponse<PlatformSettings>>("/admin/settings", patch);
    return res.data.data;
  },

  getUsers: async (query: AdminUsersQuery = {}) => {
    const res = await api.get<PaginatedResponse<AdminUser>>("/admin/users", { params: query });
    return res.data;
  },

  changeUserRole: async (userId: string, role: string) => {
    const res = await api.patch<ApiResponse<AdminUser>>(`/admin/users/${userId}/role`, { role });
    return res.data.data;
  },

  setUserStatus: async (userId: string, isActive: boolean) => {
    const res = await api.patch<ApiResponse<AdminUser>>(`/admin/users/${userId}/status`, { isActive });
    return res.data.data;
  },

  updateTicket: async (ticketId: string, status: string) => {
    const res = await api.patch<ApiResponse<AdminTicket>>(`/admin/tickets/${ticketId}`, { status });
    return res.data.data;
  },

  getTicket: async (ticketId: string) => {
    const res = await api.get<ApiResponse<AdminTicket>>(`/admin/tickets/${ticketId}`);
    return res.data.data;
  },

  replyTicket: async (ticketId: string, body: string) => {
    const res = await api.post<ApiResponse<AdminTicket>>(`/admin/tickets/${ticketId}/reply`, { body });
    return res.data.data;
  },

  getDocuments: async (query: AdminDocumentsQuery = {}) => {
    const res = await api.get<PaginatedResponse<AdminDocument>>("/admin/documents", { params: query });
    return res.data;
  },

  verifyDocument: async (documentId: string, decision: "APPROVED" | "REJECTED", reason?: string) => {
    const res = await api.patch<ApiResponse<AdminDocument>>(`/admin/documents/${documentId}/verify`, { decision, reason });
    return res.data.data;
  },

  getTransactions: async (query: AdminTransactionsQuery = {}) => {
    const res = await api.get<PaginatedResponse<AdminTransaction> & { summary: TransactionSummary }>(
      "/admin/transactions",
      { params: query }
    );
    return res.data;
  },

  getBroadcasts: async (query: AdminBroadcastsQuery = {}) => {
    const res = await api.get<PaginatedResponse<AdminBroadcast>>("/admin/broadcasts", { params: query });
    return res.data;
  },

  createBroadcast: async (payload: CreateBroadcastRequest) => {
    const res = await api.post<ApiResponse<AdminBroadcast>>("/admin/broadcasts", payload);
    return res.data.data;
  },

  sendBroadcast: async (id: string) => {
    const res = await api.post<ApiResponse<AdminBroadcast>>(`/admin/broadcasts/${id}/send`);
    return res.data.data;
  },

  deleteBroadcast: async (id: string) => {
    await api.delete(`/admin/broadcasts/${id}`);
  },

  getTemplates: async () => {
    const res = await api.get<ApiResponse<AdminMessageTemplate[]>>("/admin/templates");
    return res.data.data;
  },

  createTemplate: async (payload: CreateTemplateRequest) => {
    const res = await api.post<ApiResponse<AdminMessageTemplate>>("/admin/templates", payload);
    return res.data.data;
  },

  deleteTemplate: async (id: string) => {
    await api.delete(`/admin/templates/${id}`);
  },

  getWebhooks: async () => {
    const res = await api.get<ApiResponse<AdminWebhook[]>>("/admin/webhooks");
    return res.data.data;
  },

  createWebhook: async (payload: { url: string; events: string[] }) => {
    const res = await api.post<ApiResponse<AdminWebhook>>("/admin/webhooks", payload);
    return res.data.data;
  },

  toggleWebhook: async (id: string) => {
    const res = await api.patch<ApiResponse<AdminWebhook>>(`/admin/webhooks/${id}/toggle`);
    return res.data.data;
  },

  deleteWebhook: async (id: string) => {
    await api.delete(`/admin/webhooks/${id}`);
  },

  getApiKeys: async () => {
    const res = await api.get<ApiResponse<AdminApiKey[]>>("/admin/api-keys");
    return res.data.data;
  },

  createApiKey: async (payload: { name: string; permissions?: string[] }) => {
    const res = await api.post<ApiResponse<AdminApiKey>>("/admin/api-keys", payload);
    return res.data.data;
  },

  revokeApiKey: async (id: string) => {
    await api.delete(`/admin/api-keys/${id}`);
  },

  setLenderStatus: async (lenderId: string, status: string) => {
    const res = await api.patch<ApiResponse<AdminLenderAccount>>(`/admin/lenders/${lenderId}/status`, { status });
    return res.data.data;
  },

  changeLenderPlan: async (lenderId: string, plan: string) => {
    const res = await api.patch<ApiResponse<AdminLenderAccount>>(`/admin/lenders/${lenderId}/plan`, { plan });
    return res.data.data;
  },

  // ── Billing ──
  getSubscriptions: async (query: AdminSubscriptionsQuery = {}) => {
    const res = await api.get<PaginatedResponse<AdminSubscription>>("/admin/billing/subscriptions", { params: query });
    return res.data;
  },

  seedSubscriptions: async () => {
    const res = await api.post<ApiResponse<{ created: number }>>("/admin/billing/subscriptions/seed");
    return res.data.data;
  },

  getInvoices: async (query: AdminInvoicesQuery = {}) => {
    const res = await api.get<PaginatedResponse<AdminInvoice>>("/admin/billing/invoices", { params: query });
    return res.data;
  },

  getInvoice: async (id: string) => {
    const res = await api.get<ApiResponse<AdminInvoiceDetail>>(`/admin/billing/invoices/${id}`);
    return res.data.data;
  },

  generateInvoices: async () => {
    const res = await api.post<ApiResponse<{ created: number }>>("/admin/billing/invoices/generate");
    return res.data.data;
  },

  recordPayment: async (invoiceId: string, payload: RecordPaymentRequest) => {
    const res = await api.post<ApiResponse<AdminInvoiceDetail>>(`/admin/billing/invoices/${invoiceId}/payments`, payload);
    return res.data.data;
  },

  voidInvoice: async (invoiceId: string) => {
    const res = await api.post<ApiResponse<AdminInvoiceDetail>>(`/admin/billing/invoices/${invoiceId}/void`);
    return res.data.data;
  },
};

export const ASSIGNABLE_ROLES = [
  { value: "SUPER_ADMIN", label: "Super Admin", description: "Full platform control" },
  { value: "LENDER_ADMIN", label: "Lender Admin", description: "Full access within a lender org" },
  { value: "LENDER_MANAGER", label: "Lender Manager", description: "Manage programs, applications, team" },
  { value: "LENDER_ANALYST", label: "Lender Analyst", description: "Reports & read access" },
  { value: "LENDER_VIEWER", label: "Lender Viewer", description: "Read-only access" },
  { value: "BORROWER", label: "Borrower", description: "Loan applicant" },
  { value: "FIELD_AGENT", label: "Field Agent", description: "On-the-ground verification" },
  { value: "FIELD_SUPERVISOR", label: "Field Supervisor", description: "Oversees field agents" },
  { value: "COOP_CHAIR", label: "Cooperative Chair", description: "Leads a cooperative" },
];

export const TICKET_STATUSES = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

export const LENDER_STATUSES = [
  { value: "PENDING", label: "Pending" },
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "DEACTIVATED", label: "Deactivated" },
];

export const LENDER_PLANS = [
  { value: "STARTER", label: "Starter" },
  { value: "GROWTH", label: "Growth" },
  { value: "ENTERPRISE", label: "Enterprise" },
];

export const DOCUMENT_STATUSES = [
  { value: "PENDING", label: "Pending" },
  { value: "VERIFIED", label: "Verified" },
  { value: "FAILED", label: "Rejected" },
  { value: "EXPIRED", label: "Expired" },
];

export const DOCUMENT_TYPES = [
  { value: "ID_CARD", label: "ID Card" },
  { value: "BVN_SLIP", label: "BVN Slip" },
  { value: "UTILITY_BILL", label: "Utility Bill" },
  { value: "FARM_PHOTO", label: "Farm Photo" },
  { value: "LAND_TITLE", label: "Land Title" },
  { value: "BANK_STATEMENT", label: "Bank Statement" },
  { value: "COOPERATIVE_CERT", label: "Cooperative Cert" },
  { value: "OTHER", label: "Other" },
];

export const TRANSACTION_TYPES = [
  { value: "DISBURSEMENT", label: "Disbursement" },
  { value: "REPAYMENT", label: "Repayment" },
  { value: "REFUND", label: "Refund" },
  { value: "FEE", label: "Fee" },
];

export const TRANSACTION_STATUSES = [
  { value: "PENDING", label: "Pending" },
  { value: "SUCCESS", label: "Success" },
  { value: "FAILED", label: "Failed" },
  { value: "REVERSED", label: "Reversed" },
];

// Audience role groups for platform announcements.
export const BROADCAST_AUDIENCE_ROLES = [
  { value: "BORROWER", label: "Borrowers" },
  { value: "LENDER_ADMIN", label: "Lender Admins" },
  { value: "LENDER_MANAGER", label: "Lender Managers" },
  { value: "LENDER_ANALYST", label: "Lender Analysts" },
  { value: "LENDER_VIEWER", label: "Lender Viewers" },
  { value: "FIELD_AGENT", label: "Field Agents" },
  { value: "FIELD_SUPERVISOR", label: "Field Supervisors" },
  { value: "COOP_CHAIR", label: "Cooperative Chairs" },
];

export const BROADCAST_CHANNELS = [
  { value: "IN_APP", label: "In-App" },
  { value: "EMAIL", label: "Email" },
  { value: "SMS", label: "SMS" },
  { value: "WHATSAPP", label: "WhatsApp" },
];

export const WEBHOOK_EVENTS = [
  { value: "loan.disbursed", label: "Loan Disbursed" },
  { value: "loan.repaid", label: "Loan Repaid" },
  { value: "application.submitted", label: "Application Submitted" },
  { value: "application.approved", label: "Application Approved" },
  { value: "application.rejected", label: "Application Rejected" },
  { value: "transaction.completed", label: "Transaction Completed" },
  { value: "transaction.failed", label: "Transaction Failed" },
  { value: "user.registered", label: "User Registered" },
];

export const API_KEY_PERMISSIONS = [
  { value: "read", label: "Read" },
  { value: "write", label: "Write" },
  { value: "admin", label: "Admin" },
];

export const INVOICE_STATUSES = [
  { value: "DRAFT", label: "Draft" },
  { value: "OPEN", label: "Open" },
  { value: "PAID", label: "Paid" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "VOID", label: "Void" },
];

export const SUBSCRIPTION_STATUSES = [
  { value: "ACTIVE", label: "Active" },
  { value: "PAST_DUE", label: "Past Due" },
  { value: "TRIALING", label: "Trialing" },
  { value: "CANCELED", label: "Canceled" },
];

export const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "card", label: "Card" },
  { value: "cash", label: "Cash" },
  { value: "manual", label: "Manual / Offline" },
];
