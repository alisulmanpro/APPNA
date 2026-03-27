import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    listCommittees,
    getCommittee,
    createCommittee,
    updateCommittee,
    deleteCommittee,
    assignChair,
    addCommitteeMember,
    removeCommitteeMember,
} from "@/lib/api/committees";
import { CommitteeCreate, CommitteeUpdate } from "@/types";

export const COMMITTEES_KEY = "committees";

export function useCommittees(page = 1, limit = 50) {
    return useQuery({
        queryKey: [COMMITTEES_KEY, page, limit],
        queryFn: () => listCommittees(page, limit),
        staleTime: 30_000,
    });
}

export function useCommittee(id: string) {
    return useQuery({
        queryKey: [COMMITTEES_KEY, id],
        queryFn: () => getCommittee(id),
        enabled: !!id,
    });
}

export function useCreateCommittee() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CommitteeCreate) => createCommittee(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [COMMITTEES_KEY] });
            toast.success("Committee created");
        },
        onError: (err: Error) => toast.error(err.message),
    });
}

export function useUpdateCommittee() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: CommitteeUpdate }) =>
            updateCommittee(id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [COMMITTEES_KEY] });
            toast.success("Committee updated");
        },
        onError: (err: Error) => toast.error(err.message),
    });
}

export function useDeleteCommittee() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteCommittee(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [COMMITTEES_KEY] });
            toast.success("Committee deleted");
        },
        onError: (err: Error) => toast.error(err.message),
    });
}

export function useAssignChair() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ committeeId, userId }: { committeeId: string; userId: string }) =>
            assignChair(committeeId, userId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [COMMITTEES_KEY] });
            toast.success("Chair assigned");
        },
        onError: (err: Error) => toast.error(err.message),
    });
}

export function useAddCommitteeMember() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ committeeId, userId }: { committeeId: string; userId: string }) =>
            addCommitteeMember(committeeId, userId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [COMMITTEES_KEY] });
            toast.success("Member added to committee");
        },
        onError: (err: Error) => toast.error(err.message),
    });
}

export function useRemoveCommitteeMember() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ committeeId, userId }: { committeeId: string; userId: string }) =>
            removeCommitteeMember(committeeId, userId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [COMMITTEES_KEY] });
            toast.success("Member removed from committee");
        },
        onError: (err: Error) => toast.error(err.message),
    });
}
