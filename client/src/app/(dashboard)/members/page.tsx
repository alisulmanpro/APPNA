"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Download, MoreHorizontal, FileText } from "lucide-react";
import { useMembers, useDeleteMember } from "@/lib/hooks/useMembers";
import { DataTable } from "@/components/shared/DataTable";
import MemberModal from "@/components/members/MemberModal";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { openModal } from "@/components/shared/Modal";
import { Member, UserRole } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/utils";

export default function MembersPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [memberToDelete, setMemberToDelete] = useState<string | null>(null);

    const { data, isLoading } = useMembers({
        page,
        limit: 10,
        search: search || undefined,
        role: roleFilter
    });
    const deleteMutation = useDeleteMember();

    const handleEdit = (member: Member) => {
        setSelectedMember(member);
        openModal("member-modal");
    };

    const handleDelete = () => {
        if (memberToDelete) {
            deleteMutation.mutate(memberToDelete, {
                onSuccess: () => {
                    setMemberToDelete(null);
                    const modal = document.getElementById("delete-member-modal") as HTMLDialogElement;
                    modal?.close();
                }
            });
        }
    };

    const columns: ColumnDef<Member>[] = [
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => {
                const m = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                            <div className="bg-base-200 text-base-content rounded-full w-8 h-8">
                                <span className="text-xs font-bold">{m.first_name.charAt(0)}{m.last_name.charAt(0)}</span>
                            </div>
                        </div>
                        <div>
                            <div className="font-semibold text-base-content">{m.first_name} {m.last_name}</div>
                            <div className="text-xs opacity-70">{m.email}</div>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => {
                const role = row.getValue("role") as string;
                return (
                    <span className="badge badge-sm badge-ghost capitalize">
                        {role.replace("_", " ")}
                    </span>
                );
            },
        },
        {
            accessorKey: "location",
            header: "Location",
            cell: ({ row }) => row.getValue("location") || "-",
        },
        {
            accessorKey: "is_active",
            header: "Status",
            cell: ({ row }) => {
                const isActive = row.getValue("is_active") as boolean;
                return (
                    <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-success' : 'bg-error'}`}></span>
                        <span className="text-xs font-medium">{isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: "created_at",
            header: "Joined",
            cell: ({ row }) => formatDate(row.getValue("created_at") || new Date().toISOString()),
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const m = row.original;
                return (
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-xs btn-square">
                            <MoreHorizontal size={14} />
                        </div>
                        <ul tabIndex={0} className="dropdown-content z-10 menu p-2 shadow-lg bg-base-100 rounded-box w-40 border border-base-200">
                            <li><Link href={`/members/${m.id}`}><FileText size={14} /> View Profile</Link></li>
                            <li><button onClick={() => handleEdit(m)}>Edit Details</button></li>
                            <li>
                                <button
                                    className="text-error"
                                    onClick={() => {
                                        setMemberToDelete(m.id);
                                        const modal = document.getElementById("delete-member-modal") as HTMLDialogElement;
                                        modal?.showModal();
                                    }}
                                >
                                    Remove
                                </button>
                            </li>
                        </ul>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-base-content tracking-tight">Members Directory</h1>
                    <p className="text-sm text-base-content/60 mt-1">Manage all {data?.pagination?.total || 0} APPNA members and their roles.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="btn btn-outline btn-sm shadow-sm gap-2">
                        <Download size={14} /> Export CSV
                    </button>
                    <button
                        className="btn btn-primary btn-sm shadow-sm shadow-primary/20 gap-2"
                        onClick={() => {
                            setSelectedMember(null);
                            openModal("member-modal");
                        }}
                    >
                        <Plus size={16} /> Add Member
                    </button>
                </div>
            </div>

            {/* Filters Row */}
            <div className="bg-base-100 p-4 rounded-xl border border-base-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={16} />
                    <input
                        type="text"
                        placeholder="Search members by name or email..."
                        className="input input-sm input-bordered w-full pl-9 bg-base-50"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="flex items-center gap-2 text-sm text-base-content/60 font-medium">
                        <Filter size={14} /> Filter by Role:
                    </div>
                    <select
                        className="select select-sm select-bordered bg-base-50 min-w-32"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value as UserRole | "all")}
                    >
                        <option value="all">All Roles</option>
                        <option value="president">President</option>
                        <option value="admin">Admin</option>
                        <option value="committee_chair">Committee Chair</option>
                        <option value="member">Member</option>
                    </select>
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={data?.data || []}
                isLoading={isLoading}
                pageCount={data?.pagination?.total_pages}
                currentPage={page}
                onPaginationChange={setPage}
            />

            {/* Modals */}
            <MemberModal member={selectedMember} />

            <ConfirmDialog
                id="delete-member-modal"
                title="Remove Member"
                message="Are you sure you want to remove this member? This action cannot be undone and will remove them from all assigned committees."
                confirmLabel="Remove"
                onConfirm={handleDelete}
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
