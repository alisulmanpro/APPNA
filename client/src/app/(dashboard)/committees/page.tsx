"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Users, Building2, MoreHorizontal, FileText, CalendarDays } from "lucide-react";
import { useCommittees, useDeleteCommittee } from "@/lib/hooks/useCommittees";
import { DataTable } from "@/components/shared/DataTable";
import CommitteeModal from "@/components/committees/CommitteeModal";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { openModal } from "@/components/shared/Modal";
import { Committee } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/utils";

export default function CommitteesPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(null);
    const [committeeToDelete, setCommitteeToDelete] = useState<string | null>(null);

    const { data, isLoading } = useCommittees(page, 10);
    const deleteMutation = useDeleteCommittee();

    const handleEdit = (committee: Committee) => {
        setSelectedCommittee(committee);
        openModal("committee-modal");
    };

    const handleDelete = () => {
        if (committeeToDelete) {
            deleteMutation.mutate(committeeToDelete, {
                onSuccess: () => {
                    setCommitteeToDelete(null);
                    const modal = document.getElementById("delete-committee-modal") as HTMLDialogElement;
                    modal?.close();
                }
            });
        }
    };

    const columns: ColumnDef<Committee>[] = [
        {
            accessorKey: "name",
            header: "Committee Name",
            cell: ({ row }) => {
                const c = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20 shrink-0 shadow-sm">
                            <Building2 size={20} />
                        </div>
                        <div>
                            <div className="font-semibold text-base-content leading-tight hover:text-primary transition-colors cursor-pointer">
                                <Link href={`/committees/${c.id}`}>{c.name}</Link>
                            </div>
                            <div className="text-xs text-base-content/60 max-w-xs truncate" title={c.description || ""}>
                                {c.description || "No description provided"}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "chair_id",
            header: "Chairperson",
            cell: ({ row }) => {
                const chairId = row.getValue("chair_id") as string | undefined;
                return chairId ? (
                    <div className="flex items-center gap-2">
                        <div className="avatar placeholder">
                            <div className="bg-primary/20 text-primary-content rounded-full w-6 h-6 border border-primary/30">
                                <span className="text-[10px] font-bold">CH</span>
                            </div>
                        </div>
                        <span className="text-sm font-medium">Assigned</span>
                    </div>
                ) : (
                    <span className="text-sm text-base-content/40 italic">Vaccant</span>
                );
            },
        },
        {
            accessorKey: "members",
            header: "Size",
            cell: ({ row }) => {
                // We're stubbing member count unless the API provides it.
                // Depending on the backend schema, we'll fall back safely.
                const members = (row.original as any).members || [];
                return (
                    <div className="flex items-center gap-1.5 text-base-content/70">
                        <Users size={16} />
                        <span className="text-sm font-medium">{members.length} members</span>
                    </div>
                );
            },
        },
        {
            accessorKey: "is_active",
            header: "Status",
            cell: ({ row }) => {
                const isActive = row.getValue("is_active") as boolean;
                return (
                    <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-success' : 'bg-base-300'}`}></span>
                        <span className="text-xs font-medium">{isActive ? 'Active' : 'Archived'}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: "created_at",
            header: "Formed On",
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5 text-base-content/70">
                    <CalendarDays size={14} />
                    <span className="text-sm">{formatDate(row.getValue("created_at") || new Date().toISOString())}</span>
                </div>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const c = row.original;
                return (
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-xs btn-square">
                            <MoreHorizontal size={14} />
                        </div>
                        <ul tabIndex={0} className="dropdown-content z-10 menu p-2 shadow-lg bg-base-100 rounded-box w-44 border border-base-200">
                            <li><Link href={`/committees/${c.id}`}><FileText size={14} /> Manage Committee</Link></li>
                            <li><button onClick={() => handleEdit(c)}>Edit Details</button></li>
                            <li>
                                <button
                                    className="text-error mt-1 border-t border-base-200 rounded-none pt-2"
                                    onClick={() => {
                                        setCommitteeToDelete(c.id);
                                        const modal = document.getElementById("delete-committee-modal") as HTMLDialogElement;
                                        modal?.showModal();
                                    }}
                                >
                                    Disband Committee
                                </button>
                            </li>
                        </ul>
                    </div>
                );
            },
        },
    ];

    // Simple client-side search simulation since API doesn't have a specific `searchCommittees` yet (assumed list endpoint pagination)
    const filteredData = data?.data?.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
    ) || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-base-100 to-base-200 p-6 rounded-3xl border border-base-200 shadow-sm">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-widest mb-3">
                        <Building2 size={14} /> {data?.pagination?.total || 0} Committees
                    </div>
                    <h1 className="text-3xl font-bold text-base-content tracking-tight mb-2">Committees</h1>
                    <p className="text-sm text-base-content/70 max-w-lg">
                        Manage organizational branches, special task forces, assign chairpersons, and oversee all associated decision-making groups.
                    </p>
                </div>
                <div className="flex shrink-0">
                    <button
                        className="btn btn-primary shadow-lg shadow-primary/20 gap-2 px-6 rounded-full"
                        onClick={() => {
                            setSelectedCommittee(null);
                            openModal("committee-modal");
                        }}
                    >
                        <Plus size={18} /> New Committee
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 py-2">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40" size={18} />
                    <input
                        type="text"
                        placeholder="Search committees by name..."
                        className="input input-sm h-11 input-bordered w-full pl-11 bg-base-100 rounded-xl shadow-sm border-base-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all font-medium"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="bg-base-100 rounded-2xl shadow-sm border border-base-200 overflow-hidden">
                <DataTable
                    columns={columns}
                    data={filteredData}
                    isLoading={isLoading}
                    pageCount={data?.pagination?.total_pages}
                    currentPage={page}
                    onPaginationChange={setPage}
                />
            </div>

            {/* Modals */}
            <CommitteeModal committee={selectedCommittee} />

            <ConfirmDialog
                id="delete-committee-modal"
                title="Disband Committee"
                message="Are you sure you want to delete this committee? This action cannot be undone and will orphan all meetings and members associated solely with it."
                confirmLabel="Disband"
                onConfirm={handleDelete}
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
