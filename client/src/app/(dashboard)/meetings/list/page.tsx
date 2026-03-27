"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    ColumnDef,
    SortingState,
    flexRender,
} from "@tanstack/react-table";
import {
    Search,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Filter,
    X,
    RefreshCw,
} from "lucide-react";
import { useMeetings } from "@/lib/hooks/useMeetings";
import { Meeting, MeetingStatus } from "@/types";
import { formatDate, formatTime, formatDuration } from "@/lib/utils";
import StatusBadge from "@/components/shared/StatusBadge";
import PageHeader from "@/components/layout/PageHeader";
import Pagination from "@/components/shared/Pagination";
import EmptyState from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import Link from "next/link";

const columns: ColumnDef<Meeting>[] = [
    {
        accessorKey: "title",
        header: "Meeting Title",
        cell: ({ row }) => (
            <div>
                <p className="font-medium text-base-content text-sm truncate max-w-[220px]">
                    {row.original.title}
                </p>
                {row.original.committee_name && (
                    <p className="text-xs text-base-content/40 mt-0.5">{row.original.committee_name}</p>
                )}
            </div>
        ),
    },
    {
        accessorKey: "scheduled_at",
        header: "Date & Time",
        cell: ({ getValue }) => {
            const iso = getValue() as string;
            return (
                <div>
                    <p className="text-sm text-base-content">{formatDate(iso)}</p>
                    <p className="text-xs text-base-content/40 mt-0.5">{formatTime(iso)}</p>
                </div>
            );
        },
    },
    {
        accessorKey: "duration_minutes",
        header: "Duration",
        cell: ({ getValue }) => (
            <span className="text-sm text-base-content/70">
                {formatDuration(getValue() as number)}
            </span>
        ),
    },
    {
        accessorKey: "location",
        header: "Location",
        cell: ({ getValue }) => (
            <span className="text-sm text-base-content/70 truncate max-w-[150px] block">
                {(getValue() as string) || "—"}
            </span>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => <StatusBadge status={getValue() as MeetingStatus} />,
    },
    {
        id: "participants",
        header: "Participants",
        cell: ({ row }) => {
            const count = row.original.participants?.length ?? 0;
            return (
                <span className="text-sm text-base-content/70">
                    {count} {count === 1 ? "person" : "people"}
                </span>
            );
        },
    },
];

const STATUS_OPTIONS: { value: "all" | MeetingStatus; label: string }[] = [
    { value: "all", label: "All Status" },
    { value: "scheduled", label: "Scheduled" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
];

export default function Page() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | MeetingStatus>("all");
    const [sorting, setSorting] = useState<SortingState>([{ id: "scheduled_at", desc: true }]);

    // Fetch from real API — pass status filter server-side if backend supports it
    const { data: meetings = [], isLoading, isError, refetch } = useMeetings(
        statusFilter !== "all" ? { status: statusFilter } : undefined
    );

    // Client-side text search
    const filtered = useMemo(() => {
        if (!search) return meetings;
        const q = search.toLowerCase();
        return meetings.filter(
            (m) =>
                m.title.toLowerCase().includes(q) ||
                (m.committee_name?.toLowerCase() || "").includes(q) ||
                (m.location?.toLowerCase() || "").includes(q)
        );
    }, [meetings, search]);

    const table = useReactTable({
        data: filtered,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize: 10 } },
    });

    const { pageIndex } = table.getState().pagination;
    const totalPages = table.getPageCount();
    const hasFilters = !!search || statusFilter !== "all";

    return (
        <div>
            <PageHeader
                title="All Meetings"
                subtitle={isLoading ? "Loading…" : `${filtered.length} meeting${filtered.length !== 1 ? "s" : ""} found`}
                action={
                    <div className="flex items-center gap-2">
                        <button
                            className="btn btn-ghost btn-sm btn-square"
                            onClick={() => refetch()}
                            aria-label="Refresh"
                        >
                            <RefreshCw size={15} />
                        </button>
                        <Link href="/meetings/schedule" className="btn btn-primary btn-sm gap-2">
                            + Schedule Meeting
                        </Link>
                    </div>
                }
            />

            {/* Error state */}
            {isError && (
                <div className="alert alert-error mb-4 text-sm">
                    Failed to load meetings. Make sure the API server is running and accessible.
                    <button className="btn btn-sm btn-ghost ml-2" onClick={() => refetch()}>
                        Retry
                    </button>
                </div>
            )}

            {/* Filter Bar */}
            <div className="card bg-base-100 border border-base-300 p-4 mb-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <label className="input input-bordered input-sm flex items-center gap-2 flex-1">
                        <Search size={14} className="text-base-content/40" />
                        <input
                            type="text"
                            placeholder="Search meetings, committees, locations…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="grow bg-transparent outline-none text-sm"
                        />
                        {search && (
                            <button onClick={() => setSearch("")} aria-label="Clear search">
                                <X size={13} className="text-base-content/40 hover:text-base-content" />
                            </button>
                        )}
                    </label>

                    <div className="flex items-center gap-2">
                        <Filter size={14} className="text-base-content/40 flex-shrink-0" />
                        <select
                            className="select select-bordered select-sm"
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value as "all" | MeetingStatus);
                                table.setPageIndex(0);
                            }}
                        >
                            {STATUS_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>

                    {hasFilters && (
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => { setSearch(""); setStatusFilter("all"); }}
                        >
                            <X size={13} /> Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="card bg-base-100 border border-base-300 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table table-sm">
                        <thead className="bg-base-200">
                            {table.getHeaderGroups().map((hg) => (
                                <tr key={hg.id}>
                                    {hg.headers.map((header) => {
                                        const canSort = header.column.getCanSort();
                                        const sorted = header.column.getIsSorted();
                                        return (
                                            <th
                                                key={header.id}
                                                onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                                                className={`text-xs font-semibold text-base-content/60 uppercase tracking-wide ${canSort ? "cursor-pointer hover:text-base-content select-none" : ""
                                                    }`}
                                            >
                                                <span className="flex items-center gap-1">
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {canSort && (
                                                        <span className="opacity-40">
                                                            {sorted === "asc" ? (
                                                                <ArrowUp size={12} />
                                                            ) : sorted === "desc" ? (
                                                                <ArrowDown size={12} />
                                                            ) : (
                                                                <ArrowUpDown size={12} />
                                                            )}
                                                        </span>
                                                    )}
                                                </span>
                                            </th>
                                        );
                                    })}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <TableSkeleton rows={6} cols={6} />
                            ) : table.getRowModel().rows.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length}>
                                        <EmptyState
                                            title="No meetings found"
                                            description="Try adjusting your search or filters."
                                        />
                                    </td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="hover cursor-pointer"
                                        onClick={() => router.push(`/meetings/${row.original.id}`)}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="py-3 text-sm">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-base-300">
                        <p className="text-xs text-base-content/50">
                            Page {pageIndex + 1} of {totalPages} · {filtered.length} results
                        </p>
                        <Pagination
                            currentPage={pageIndex + 1}
                            totalPages={totalPages}
                            onPageChange={(p) => table.setPageIndex(p - 1)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
