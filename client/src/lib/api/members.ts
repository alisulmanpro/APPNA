import api from "./axiosInstance";
import {
    Member,
    MemberCreate,
    MemberUpdate,
    MemberFilters,
    PaginatedResponse,
} from "@/types";

export async function listMembers(filters?: MemberFilters) {
    const params: Record<string, string | number | boolean> = {};
    if (filters?.page) params.page = filters.page;
    if (filters?.limit) params.limit = filters.limit;
    if (filters?.is_active !== undefined) params.include_inactive = !filters.is_active;

    const { data } = await api.get<PaginatedResponse<Member>>("/members", { params });
    return data;
}

export async function getMember(id: string): Promise<Member> {
    const { data } = await api.get<Member>(`/members/${id}`);
    return data;
}

export async function createMember(payload: MemberCreate): Promise<Member> {
    const { data } = await api.post<Member>("/members", payload);
    return data;
}

export async function updateMember(id: string, payload: MemberUpdate): Promise<Member> {
    const { data } = await api.patch<Member>(`/members/${id}`, payload);
    return data;
}

export async function deleteMember(id: string): Promise<void> {
    await api.delete(`/members/${id}`);
}

export async function searchMembers(query: string): Promise<Member[]> {
    const { data } = await api.get<Member[]>("/members/search", { params: { q: query } });
    return data;
}

export async function filterMembers(filters: MemberFilters) {
    const { data } = await api.get<PaginatedResponse<Member>>("/members/filter", {
        params: filters,
    });
    return data;
}

export async function exportMembers(): Promise<Blob> {
    const { data } = await api.get("/members/export", { responseType: "blob" });
    return data;
}
