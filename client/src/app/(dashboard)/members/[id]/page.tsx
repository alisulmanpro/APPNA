"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    CalendarDays,
    Building2,
    Calendar,
    Clock,
    Award
} from "lucide-react";
import { useMember } from "@/lib/hooks/useMembers";
import { formatDate } from "@/lib/utils";
import MemberModal from "@/components/members/MemberModal";
import { openModal } from "@/components/shared/Modal";

export default function MemberDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    // React 19 / Next 15 pattern for unwrapping params
    const resolvedParams = use(params);
    const { data: member, isLoading } = useMember(resolvedParams.id);

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <span className="loading loading-spinner text-primary loading-lg"></span>
            </div>
        );
    }

    if (!member) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-base-content mb-2">Member Not Found</h2>
                <p className="text-base-content/60 mb-6">The member profile you're looking for does not exist or has been removed.</p>
                <Link href="/members" className="btn btn-primary">Back to Directory</Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            {/* Navigation */}
            <div>
                <Link href="/members" className="btn btn-ghost btn-sm px-2 gap-2 text-base-content/60 hover:text-base-content mb-4 -ml-2">
                    <ArrowLeft size={16} /> Back to Directory
                </Link>
            </div>

            {/* Profile Header Card */}
            <div className="bg-base-100 rounded-3xl border border-base-200 overflow-hidden shadow-sm">
                {/* Cover Banner */}
                <div className="h-32 bg-gradient-to-r from-primary/80 to-blue-800/80 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                </div>

                <div className="px-6 sm:px-10 pb-8 relative">
                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-12 mb-6">
                        {/* Avatar */}
                        <div className="avatar">
                            <div className="w-24 h-24 rounded-2xl bg-base-100 p-1 shadow-lg ring-1 ring-base-200">
                                <div className="w-full h-full rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                    <span className="text-3xl font-bold">{member.first_name.charAt(0)}{member.last_name.charAt(0)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="flex-1 min-w-0 pt-2 sm:pt-0">
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-base-content">
                                    {member.first_name} {member.last_name}
                                </h1>
                                {member.is_active ? (
                                    <span className="badge badge-success badge-sm gap-1 uppercase tracking-widest text-[10px] font-bold">
                                        Active
                                    </span>
                                ) : (
                                    <span className="badge badge-error badge-sm gap-1 uppercase tracking-widest text-[10px] font-bold">
                                        Inactive
                                    </span>
                                )}
                            </div>
                            <p className="text-sm font-medium text-base-content/60 capitalize flex items-center gap-2">
                                <Award size={16} className="text-primary" /> {member.role.replace("_", " ")}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex shrink-0 gap-3 mt-4 sm:mt-0 w-full sm:w-auto">
                            <button
                                className="btn btn-primary shadow-lg shadow-primary/20 btn-block sm:btn-wide flex-1"
                                onClick={() => openModal("member-modal")}
                            >
                                Edit Profile
                            </button>
                        </div>
                    </div>

                    {/* Contact details grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-base-200/60">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-base-200 flex items-center justify-center text-base-content/60 shrink-0">
                                <Mail size={16} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-0.5">Contact Email</p>
                                <p className="text-sm font-medium text-base-content truncate">{member.email}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-base-200 flex items-center justify-center text-base-content/60 shrink-0">
                                <Phone size={16} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-0.5">Phone Number</p>
                                <p className="text-sm font-medium text-base-content truncate">{member.phone || "Not provided"}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-base-200 flex items-center justify-center text-base-content/60 shrink-0">
                                <MapPin size={16} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-0.5">Location</p>
                                <p className="text-sm font-medium text-base-content truncate">{member.location || "Not assigned"}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-base-200 flex items-center justify-center text-base-content/60 shrink-0">
                                <CalendarDays size={16} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-0.5">Member Since</p>
                                <p className="text-sm font-medium text-base-content truncate">
                                    {member.created_at ? formatDate(member.created_at) : "Unknown"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Grid: Committees & Meetings Data */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Committees Panel */}
                <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm p-6 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-base-content flex items-center gap-2">
                            <Building2 className="text-secondary" size={20} /> Active Committees
                        </h3>
                        <span className="badge badge-secondary badge-sm">Beta API</span>
                    </div>

                    <div className="flex-1 flex flex-col justify-center items-center py-10 px-4 text-center border-2 border-dashed border-base-200 rounded-xl bg-base-50/50">
                        <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center mb-3 text-base-content/40">
                            <Building2 size={24} />
                        </div>
                        <h4 className="text-sm font-bold text-base-content mb-1">No Committee Data</h4>
                        <p className="text-xs text-base-content/60 max-w-[250px]">
                            Committees mapping for individual members will be implemented in the next API update.
                        </p>
                    </div>
                </div>

                {/* Meetings Panel */}
                <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm p-6 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-base-content flex items-center gap-2">
                            <Calendar className="text-warning" size={20} /> Recent Meetings
                        </h3>
                        <span className="text-xs font-medium text-base-content/50">Last 30 days</span>
                    </div>

                    <div className="flex-1 flex flex-col justify-center items-center py-10 px-4 text-center border-2 border-dashed border-base-200 rounded-xl bg-base-50/50">
                        <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center mb-3 text-base-content/40">
                            <Clock size={24} />
                        </div>
                        <h4 className="text-sm font-bold text-base-content mb-1">Meeting History Hidden</h4>
                        <p className="text-xs text-base-content/60 max-w-[250px]">
                            Attendance tracking and AI meeting involvement metrics are currently analyzing data.
                        </p>
                    </div>
                </div>
            </div>

            <MemberModal member={member} />
        </div>
    );
}
