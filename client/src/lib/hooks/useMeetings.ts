import {
    useQuery,
    useMutation,
    useQueryClient,
    UseQueryResult,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
    getMeetings,
    getMeetingById,
    createMeeting,
    updateMeeting,
    cancelMeeting,
    addParticipants,
    updateTranscript,
    updateMinutes,
} from "@/lib/api/meetings";
import {
    Meeting,
    CreateMeetingPayload,
    UpdateMeetingPayload,
    MeetingFilters,
    AddParticipantsPayload,
} from "@/types";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const meetingKeys = {
    all: ["meetings"] as const,
    lists: () => [...meetingKeys.all, "list"] as const,
    list: (filters: MeetingFilters) => [...meetingKeys.lists(), filters] as const,
    details: () => [...meetingKeys.all, "detail"] as const,
    detail: (id: string) => [...meetingKeys.details(), id] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useMeetings(
    filters?: MeetingFilters
): UseQueryResult<Meeting[], Error> {
    return useQuery({
        queryKey: meetingKeys.list(filters ?? {}),
        queryFn: () => getMeetings(filters),
    });
}

export function useMeeting(id: string): UseQueryResult<Meeting, Error> {
    return useQuery({
        queryKey: meetingKeys.detail(id),
        queryFn: () => getMeetingById(id),
        enabled: !!id,
    });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateMeeting() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateMeetingPayload) => createMeeting(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: meetingKeys.lists() });
            toast.success("Meeting scheduled successfully!");
        },
        onError: (err: Error) => {
            toast.error(err.message || "Failed to schedule meeting");
        },
    });
}

export function useUpdateMeeting() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateMeetingPayload }) =>
            updateMeeting(id, payload),
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: meetingKeys.lists() });
            qc.setQueryData(meetingKeys.detail(data.id), data);
            toast.success("Meeting updated successfully!");
        },
        onError: (err: Error) => {
            toast.error(err.message || "Failed to update meeting");
        },
    });
}

export function useCancelMeeting() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            cancelMeeting(id, reason),
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: meetingKeys.lists() });
            qc.setQueryData(meetingKeys.detail(data.id), data);
            toast.success("Meeting cancelled.");
        },
        onError: (err: Error) => {
            toast.error(err.message || "Failed to cancel meeting");
        },
    });
}

export function useAddParticipants() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: AddParticipantsPayload }) =>
            addParticipants(id, payload),
        onSuccess: (data) => {
            qc.setQueryData(meetingKeys.detail(data.id), data);
            toast.success("Participants added!");
        },
        onError: (err: Error) => {
            toast.error(err.message || "Failed to add participants");
        },
    });
}

export function useUpdateTranscript() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, transcript }: { id: string; transcript: string }) =>
            updateTranscript(id, transcript),
        onSuccess: (data) => {
            qc.setQueryData(meetingKeys.detail(data.id), data);
            toast.success("Transcript saved!");
        },
        onError: (err: Error) => {
            toast.error(err.message || "Failed to save transcript");
        },
    });
}

export function useUpdateMinutes() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, minutes }: { id: string; minutes: string }) =>
            updateMinutes(id, minutes),
        onSuccess: (data) => {
            qc.setQueryData(meetingKeys.detail(data.id), data);
            toast.success("Minutes saved!");
        },
        onError: (err: Error) => {
            toast.error(err.message || "Failed to save minutes");
        },
    });
}
