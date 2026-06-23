import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentsApi } from "../api";

export const documentKeys = {
  all: ["documents"] as const,
  lists: () => [...documentKeys.all, "list"] as const,
  list: (ownerType: string, ownerId: string) => [...documentKeys.lists(), ownerType, ownerId] as const,
  details: () => [...documentKeys.all, "detail"] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
};

export function useDocuments(ownerType: string, ownerId: string) {
  return useQuery({
    queryKey: documentKeys.list(ownerType, ownerId),
    queryFn: () => documentsApi.list(ownerType, ownerId),
    enabled: !!ownerType && !!ownerId,
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => documentsApi.getById(id),
    enabled: !!id,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      ownerType: "USER" | "APPLICATION" | "LOAN" | "BORROWER";
      ownerId: string;
      type: string;
      file: File;
    }) => {
      const { file, ...data } = params;

      // Get presigned upload URL
      const { uploadUrl, documentId } = await documentsApi.getUploadUrl({
        ...data,
        name: file.name,
        mimeType: file.type,
        size: file.size,
      });

      // Upload file to S3
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      // Confirm upload
      return documentsApi.confirmUpload(documentId);
    },
    onSuccess: (_, { ownerType, ownerId }) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.list(ownerType, ownerId) });
    },
  });
}

export function useVerifyDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentsApi.verify(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(id) });
    },
  });
}

export function useRejectDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, rejectionNote }: { id: string; rejectionNote: string }) =>
      documentsApi.reject(id, rejectionNote),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(id) });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
  });
}

export function useDocumentDownloadUrl(id: string) {
  return useQuery({
    queryKey: [...documentKeys.detail(id), "download"],
    queryFn: () => documentsApi.getDownloadUrl(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // URLs valid for 5 minutes
  });
}
