import { api, ApiResponse } from "./client";

export interface Document {
  id: string;
  ownerId: string;
  ownerType: "USER" | "APPLICATION" | "LOAN" | "BORROWER";
  type: string;
  name: string;
  mimeType: string;
  size: number;
  url: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionNote?: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  documentId: string;
  key: string;
  expiresAt: string;
}

export const documentsApi = {
  getUploadUrl: async (data: {
    ownerType: "USER" | "APPLICATION" | "LOAN" | "BORROWER";
    ownerId: string;
    type: string;
    name: string;
    mimeType: string;
    size: number;
  }) => {
    const res = await api.post<ApiResponse<UploadUrlResponse>>("/documents/upload-url", data);
    return res.data.data;
  },

  confirmUpload: async (documentId: string) => {
    const res = await api.patch<ApiResponse<Document>>(`/documents/${documentId}/confirm`);
    return res.data.data;
  },

  list: async (ownerType: string, ownerId: string) => {
    const res = await api.get<ApiResponse<Document[]>>("/documents", {
      params: { ownerType, ownerId },
    });
    return res.data.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Document>>(`/documents/${id}`);
    return res.data.data;
  },

  verify: async (id: string) => {
    const res = await api.patch<ApiResponse<Document>>(`/documents/${id}/verify`);
    return res.data.data;
  },

  reject: async (id: string, rejectionNote: string) => {
    const res = await api.patch<ApiResponse<Document>>(`/documents/${id}/reject`, { rejectionNote });
    return res.data.data;
  },

  delete: async (id: string) => {
    await api.delete(`/documents/${id}`);
  },

  getDownloadUrl: async (id: string) => {
    const res = await api.get<ApiResponse<{ url: string; expiresAt: string }>>(`/documents/${id}/download`);
    return res.data.data;
  },
};
