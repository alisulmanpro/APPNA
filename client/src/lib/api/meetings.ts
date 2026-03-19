import api from "./axiosInstance";
import {
    Meeting,
    CreateMeetingPayload,
    UpdateMeetingPayload,
    MeetingFilters,
    AddParticipantsPayload,
    PaginatedResponse,
} from "@/types";

// ─── GET Meetings ─────────────────────────────────────────────────────────────

export async function getMeetings(filters?: MeetingFilters): Promise<Meeting[]> {
    const params: Record<string, string | number> = {};
    if (filters?.status && filters.status !== "all") params.status = filters.status;
    if (filters?.committee_id) params.committee_id = filters.committee_id;
    if (filters?.search) params.search = filters.search;
    if (filters?.date_from) params.date_from = filters.date_from;
    if (filters?.date_to) params.date_to = filters.date_to;
    if (filters?.page) params.page = filters.page;
    if (filters?.page_size) params.page_size = filters.page_size;

    const { data } = await api.get<Meeting[] | PaginatedResponse<Meeting>>("/meetings", { params });
    
    // Handle both direct array and paginated response
    if (Array.isArray(data)) {
        return data;
    }
    
    if (data && "data" in data && Array.isArray(data.data)) {
        return data.data;
    }

    return [];
}

export async function getMeetingById(id: string): Promise<Meeting> {
    const { data } = await api.get<Meeting>(`/meetings/${id}`);
    return data;
}

// ─── CREATE Meeting ───────────────────────────────────────────────────────────

export async function createMeeting(payload: CreateMeetingPayload): Promise<Meeting> {
    const { data } = await api.post<Meeting>("/meetings", payload);
    return data;
}

// ─── UPDATE Meeting ───────────────────────────────────────────────────────────

export async function updateMeeting(
    id: string,
    payload: UpdateMeetingPayload
): Promise<Meeting> {
    const { data } = await api.patch<Meeting>(`/meetings/${id}`, payload);
    return data;
}

// ─── CANCEL Meeting ───────────────────────────────────────────────────────────

export async function cancelMeeting(id: string, reason: string): Promise<Meeting> {
    const { data } = await api.patch<Meeting>(`/meetings/${id}/cancel`, { reason });
    return data;
}

// ─── PARTICIPANTS ─────────────────────────────────────────────────────────────

export async function addParticipants(
    id: string,
    payload: AddParticipantsPayload
): Promise<Meeting> {
    const { data } = await api.post<Meeting>(`/meetings/${id}/participants`, payload);
    return data;
}

// ─── TRANSCRIPT ───────────────────────────────────────────────────────────────

export async function updateTranscript(
    id: string,
    transcript: string
): Promise<Meeting> {
    const { data } = await api.patch<Meeting>(`/meetings/${id}/transcript`, {
        transcript,
    });
    return data;
}

// ─── MINUTES ─────────────────────────────────────────────────────────────────

export async function updateMinutes(id: string, minutes: string): Promise<Meeting> {
    const { data } = await api.patch<Meeting>(`/meetings/${id}/minutes`, { minutes });
    return data;
}

// ─── DOCUMENTS ───────────────────────────────────────────────────────────────

export async function attachDocuments(
    id: string,
    formData: FormData
): Promise<Meeting> {
    const { data } = await api.post<Meeting>(`/meetings/${id}/documents`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
}
