import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { borrowersApi, BorrowersQuery } from "../api";

export const borrowerKeys = {
  all: ["borrowers"] as const,
  lists: () => [...borrowerKeys.all, "list"] as const,
  list: (query: BorrowersQuery) => [...borrowerKeys.lists(), query] as const,
  details: () => [...borrowerKeys.all, "detail"] as const,
  detail: (id: string) => [...borrowerKeys.details(), id] as const,
  me: () => [...borrowerKeys.all, "me"] as const,
};

export function useBorrowers(query: BorrowersQuery = {}) {
  return useQuery({
    queryKey: borrowerKeys.list(query),
    queryFn: () => borrowersApi.list(query),
  });
}

export function useBorrower(id: string) {
  return useQuery({
    queryKey: borrowerKeys.detail(id),
    queryFn: () => borrowersApi.getById(id),
    enabled: !!id,
  });
}

export function useMyBorrowerProfile() {
  return useQuery({
    queryKey: borrowerKeys.me(),
    queryFn: () => borrowersApi.getMyProfile(),
  });
}

export function useUpdateMyBorrowerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof borrowersApi.updateMyProfile>[0]) =>
      borrowersApi.updateMyProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: borrowerKeys.me() });
    },
  });
}
