import api from "./axiosInstance";
import { Committee, Participant, PaginatedResponse } from "@/types";

export interface FetchOptions {
    page?: number;
    limit?: number;
    include_inactive?: boolean;
}

export async function getCommittees(options: FetchOptions = {}): Promise<Committee[]> {
    const params = {
        page: options.page || 1,
        limit: options.limit || 10,
        include_inactive: options.include_inactive ?? false,
    };

    const { data } = await api.get<Committee[] | PaginatedResponse<Committee>>("/committees", { params });
    
    if (Array.isArray(data)) {
        return data;
    }
    
    if (data && "data" in data && Array.isArray(data.data)) {
        return data.data;
    }

    return [];
}

export async function getMembers(options: FetchOptions = {}): Promise<Participant[]> {
    const params = {
        page: options.page || 1,
        limit: options.limit || 10,
        include_inactive: options.include_inactive ?? false,
    };

    const { data } = await api.get<Participant[] | PaginatedResponse<Participant>>("/members", { params });
    
    if (Array.isArray(data)) {
        return data;
    }
    
    if (data && "data" in data && Array.isArray(data.data)) {
        return data.data;
    }

    return [];
}
