import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getCommittees, getMembers, FetchOptions } from "@/lib/api/organization";
import { Committee, Participant } from "@/types";

export const organizationKeys = {
    all: ["organization"] as const,
    committees: (options: FetchOptions) => [...organizationKeys.all, "committees", options] as const,
    members: (options: FetchOptions) => [...organizationKeys.all, "members", options] as const,
};

export function useCommittees(options: FetchOptions = {}): UseQueryResult<Committee[], Error> {
    return useQuery({
        queryKey: organizationKeys.committees(options),
        queryFn: () => getCommittees(options),
    });
}

export function useMembers(options: FetchOptions = {}): UseQueryResult<Participant[], Error> {
    return useQuery({
        queryKey: organizationKeys.members(options),
        queryFn: () => getMembers(options),
    });
}
