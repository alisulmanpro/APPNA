"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Building2,
    Users,
    Calendar,
    Settings,
    UserPlus,
    X,
    Shield
} from "lucide-react";
import { useCommittee, useRemoveCommitteeMember } from "@/lib/hooks/useCommittees";
import { useMembers } from "@/lib/hooks/useMembers";
import { formatDate } from "@/lib/utils";
import CommitteeModal from "@/components/committees/CommitteeModal";
import { openModal } from "@/components/shared/Modal";
import { Member } from "@/types";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

export default function CommitteeDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = use(params);
    const { data: committee, isLoading: committeeLoading } = useCommittee(resolvedParams.id);
    const { data: allMembersRes } = useMembers({ limit: 1000 }); // Needed to map chair_id to name
    const removeMemberMutation = useRemoveCommitteeMember();

    const [memberToRemove, setMemberToRemove] = useState<{ id: string, name: string } | null>(null);

    if (committeeLoading) {
        return (
            <div className="flex justify-center py-20">
                <span className="loading loading-spinner text-secondary loading-lg"></span>
            </div>
        );
    }

    if (!committee) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-base-content mb-2">Committee Not Found</h2>
                <p className="text-base-content/60 mb-6">This committee may have been disbanded or the URL is incorrect.</p>
                <Link href="/committees" className="btn btn-secondary">Back to Committees</Link>
            </div>
        );
    }

    // Attempt to resolve Chairperson details
    const chairperson = committee.chair_id
        ? allMembersRes?.data?.find(m => m.id === committee.chair_id)
        : null;

    // We'll stub committee members if API doesn't return them directly nested
    const committeeMembers = (committee as any).members as Member[] || [];
    // Example stub if empty: 
    // const stubMembers = allMembersRes?.data?.slice(0, 3) || [];

    const handleRemoveMember = () => {
        if (memberToRemove) {
            removeMemberMutation.mutate(
                { committeeId: committee.id, userId: memberToRemove.id },
                {
                    onSuccess: () => {
                        setMemberToRemove(null);
                        const modal = document.getElementById("remove-member-modal") as HTMLDialogElement;
                        modal?.close();
                    }
                }
            );
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-10">
            {/* Nav */}
            <div>
                <Link href="/committees" className="btn btn-ghost btn-sm px-2 gap-2 text-base-content/60 hover:text-base-content mb-2 -ml-2">
                    <ArrowLeft size={16} /> Committee Directory
                </Link>
            </div>

            {/* Header Section */}
            <div className="bg-base-100 rounded-3xl border border-base-200 overflow-hidden shadow-sm">
                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-start justify-between">
                    <div className="flex flex-col sm:flex-row gap-5 items-start">
                        <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20 shrink-0 shadow-inner">
                            <Building2 size={32} />
                        </div>
                        <div className="pt-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-base-content">
                                    {committee.name}
                                </h1>
                                {committee.is_active ? (
                                    <span className="badge badge-success badge-sm badge-outline gap-1 font-bold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-success"></span> Active
                                    </span>
                                ) : (
                                    <span className="badge badge-ghost badge-sm font-bold">Archived</span>
                                )}
                            </div>
                            <p className="text-base-content/70 max-w-2xl text-sm leading-relaxed mb-4">
                                {committee.description || "No description provided for this organizational group."}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-wider text-base-content/50">
                                <span className="flex items-center gap-1.5">
                                    <Calendar size={14} /> Created {formatDate(committee.created_at || new Date().toISOString())}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Users size={14} /> {committeeMembers.length} Members
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="shrink-0">
                        <button
                            className="btn btn-outline btn-sm shadow-sm font-semibold"
                            onClick={() => openModal("committee-modal")}
                        >
                            <Settings size={14} /> Manage Settings
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Leadership & Members */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Chairperson Card */}
                    <div className="bg-gradient-to-br from-base-100 to-indigo-50/30 rounded-2xl border border-base-200 p-6 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Shield size={64} className="text-indigo-600" />
                        </div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-base-content/50 mb-4 flex items-center gap-2">
                            <Shield size={16} className="text-indigo-500" /> Current Chairperson
                        </h2>

                        {chairperson ? (
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="avatar">
                                    <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl shadow-inner border border-indigo-200">
                                        {chairperson.first_name.charAt(0)}{chairperson.last_name.charAt(0)}
                                    </div>
                                </div>
                                <div>
                                    <Link href={`/members/${chairperson.id}`} className="text-lg font-bold text-base-content hover:text-indigo-600 transition-colors">
                                        {chairperson.first_name} {chairperson.last_name}
                                    </Link>
                                    <p className="text-sm text-base-content/60">{chairperson.email}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-14 h-14 rounded-full bg-base-200 border-2 border-dashed border-base-300 flex items-center justify-center text-base-content/30">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <p className="text-base font-bold text-base-content">Not Assigned</p>
                                    <button
                                        className="text-xs text-secondary font-bold uppercase tracking-wider hover:underline"
                                        onClick={() => openModal("committee-modal")}
                                    >
                                        Assign Chair Now
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Roster Panel */}
                    <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-base-200 flex items-center justify-between bg-base-50/50">
                            <h2 className="text-base font-bold text-base-content flex items-center gap-2">
                                <Users size={18} className="text-base-content/50" /> Committee Roster
                            </h2>
                            <button className="btn btn-sm btn-ghost text-secondary hover:bg-secondary/10">
                                <UserPlus size={16} /> Add Member
                            </button>
                        </div>

                        {committeeMembers.length === 0 ? (
                            <div className="p-8 text-center text-base-content/60">
                                <Users size={32} className="mx-auto mb-3 opacity-20" />
                                <p className="text-sm font-medium">No members have been assigned to this committee yet.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-base-200">
                                {committeeMembers.map(m => (
                                    <li key={m.id} className="p-4 flex items-center justify-between hover:bg-base-50/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="avatar placeholder skeleton w-8 h-8 rounded-full shrink-0"></div>
                                            <div>
                                                <Link href={`/members/${m.id}`} className="font-semibold text-sm text-base-content hover:underline">
                                                    {m.first_name} {m.last_name}
                                                </Link>
                                                <p className="text-xs text-base-content/50">{m.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            className="btn btn-ghost btn-xs btn-square text-error/70 hover:text-error hover:bg-error/10"
                                            title="Remove member"
                                            onClick={() => {
                                                setMemberToRemove({ id: m.id, name: `${m.first_name} ${m.last_name}` });
                                                const modal = document.getElementById("remove-member-modal") as HTMLDialogElement;
                                                modal?.showModal();
                                            }}
                                        >
                                            <X size={14} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Right Column: Associated Meetings */}
                <div className="space-y-6">
                    <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm p-5 h-full min-h-[400px]">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-base font-bold text-base-content flex items-center gap-2">
                                <Calendar size={18} className="text-warning" /> Meeting History
                            </h2>
                            <Link href="/meetings/schedule" className="btn btn-xs btn-ghost text-primary">Schedule New</Link>
                        </div>

                        <div className="flex flex-col items-center justify-center text-center h-[250px] border-2 border-dashed border-base-200 rounded-xl bg-base-50/30 px-6">
                            <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center mb-3 text-base-content/40">
                                <Calendar size={20} />
                            </div>
                            <h4 className="text-sm font-bold text-base-content mb-1">No Recent Meetings</h4>
                            <p className="text-xs text-base-content/50">
                                There are no active meetings scheduled for this committee. Check the global <Link href="/meetings" className="link link-primary">Meetings</Link> tab.
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            <CommitteeModal committee={committee} />

            <ConfirmDialog
                id="remove-member-modal"
                title="Remove Member"
                message={`Are you sure you want to remove ${memberToRemove?.name} from this committee?`}
                confirmLabel="Remove"
                onConfirm={handleRemoveMember}
                isLoading={removeMemberMutation.isPending}
            />
        </div>
    );
}
