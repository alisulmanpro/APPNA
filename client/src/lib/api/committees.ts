import api from "./axiosInstance";
import {
    Committee,
    CommitteeCreate,
    CommitteeUpdate,
    CommitteeMemberEntry,
    PaginatedResponse,
} from "@/types";

export async function listCommittees(page = 1, limit = 50) {
    const { data } = await api.get<PaginatedResponse<Committee>>("/committees", {
        params: { page, limit },
    });
    return data;
}

export async function getCommittee(id: string): Promise<Committee> {
    const { data } = await api.get<Committee>(`/committees/${id}`);
    return data;
}

export async function createCommittee(payload: CommitteeCreate): Promise<Committee> {
    const { data } = await api.post<Committee>("/committees", payload);
    return data;
}

export async function updateCommittee(id: string, payload: CommitteeUpdate): Promise<Committee> {
    const { data } = await api.patch<Committee>(`/committees/${id}`, payload);
    return data;
}

export async function deleteCommittee(id: string): Promise<void> {
    await api.delete(`/committees/${id}`);
}

export async function assignChair(committeeId: string, userId: string): Promise<Committee> {
    const { data } = await api.patch<Committee>(`/committees/${committeeId}/chair`, {
        chair_id: userId,
    });
    return data;
}

export async function addCommitteeMember(
    committeeId: string,
    userId: string
): Promise<CommitteeMemberEntry> {
    const { data } = await api.post<CommitteeMemberEntry>(
        `/committees/${committeeId}/members`,
        { user_id: userId }
    );
    return data;
}

export async function removeCommitteeMember(
    committeeId: string,
    userId: string
): Promise<void> {
    await api.delete(`/committees/${committeeId}/members/${userId}`);
}

export async function getCommitteeActivity(committeeId: string) {
    const { data } = await api.get(`/committees/${committeeId}/activity`);
    return data;
}
