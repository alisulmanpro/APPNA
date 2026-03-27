import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    listMembers,
    getMember,
    createMember,
    updateMember,
    deleteMember,
} from "@/lib/api/members";
import { MemberCreate, MemberUpdate, MemberFilters } from "@/types";

export const MEMBERS_KEY = "members";

export function useMembers(filters?: MemberFilters) {
    return useQuery({
        queryKey: [MEMBERS_KEY, filters],
        queryFn: () => listMembers(filters),
        staleTime: 30_000,
    });
}

export function useMember(id: string) {
    return useQuery({
        queryKey: [MEMBERS_KEY, id],
        queryFn: () => getMember(id),
        enabled: !!id,
    });
}

export function useCreateMember() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: MemberCreate) => createMember(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [MEMBERS_KEY] });
            toast.success("Member added successfully");
        },
        onError: (err: Error) => toast.error(err.message),
    });
}

export function useUpdateMember() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: MemberUpdate }) =>
            updateMember(id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [MEMBERS_KEY] });
            toast.success("Member updated");
        },
        onError: (err: Error) => toast.error(err.message),
    });
}

export function useDeleteMember() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteMember(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [MEMBERS_KEY] });
            toast.success("Member removed");
        },
        onError: (err: Error) => toast.error(err.message),
    });
}
