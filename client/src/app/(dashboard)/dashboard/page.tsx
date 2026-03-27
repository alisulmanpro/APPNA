"use client";

import Link from "next/link";
import {
    Users,
    Building2,
    Calendar,
    CheckCircle2,
    TrendingUp,
    Clock,
    ArrowRight
} from "lucide-react";
import { useMembers } from "@/lib/hooks/useMembers";
import { useCommittees } from "@/lib/hooks/useCommittees";
import { useMeetings } from "@/lib/hooks/useMeetings";
import MeetingCard from "@/components/meetings/MeetingCard";
import { StatsCardSkeleton, MeetingCardSkeleton } from "@/components/shared/LoadingSkeleton";
import { useAuthStore } from "@/lib/store/authStore";
import { Meeting } from "@/types";

export default function DashboardOverview() {
    const { user } = useAuthStore();
    const { data: membersRes, isLoading: membersLoading } = useMembers({ limit: 1 });
    const { data: committeesRes, isLoading: committeesLoading } = useCommittees(1, 1);
    const { data: meetings = [], isLoading: meetingsLoading } = useMeetings();

    const today = new Date();

    const upcomingMeetings = [...meetings]
        .filter((m) => m.status === "scheduled" && new Date(m.scheduled_at) >= today)
        .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
        .slice(0, 4);

    const stats = [
        {
            label: "Total Members",
            value: membersRes?.pagination?.total || 0,
            icon: Users,
            color: "text-primary",
            bg: "bg-primary/10",
            loading: membersLoading
        },
        {
            label: "Active Committees",
            value: committeesRes?.pagination?.total || 0,
            icon: Building2,
            color: "text-secondary",
            bg: "bg-secondary/10",
            loading: committeesLoading
        },
        {
            label: "Upcoming Meetings",
            value: meetings.filter(m => m.status === "scheduled").length || 0,
            icon: Clock,
            color: "text-warning",
            bg: "bg-warning/10",
            loading: meetingsLoading
        },
        {
            label: "Completed AI Summaries",
            value: meetings.filter(m => m.status === "completed" && m.ai_summary).length || 0,
            icon: CheckCircle2,
            color: "text-success",
            bg: "bg-success/10",
            loading: meetingsLoading
        }
    ];

    return (
        <div className="space-y-8">
            {/* Header section with gradient and personalized greeting */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-blue-800 p-8 text-primary-content shadow-lg">
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium mb-2 border border-white/20">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                            System Operational
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                            Welcome back, {user?.first_name || "Doctor"}!
                        </h1>
                        <p className="text-primary-content/80 max-w-lg text-sm md:text-base leading-relaxed">
                            Here is an overview of the APPNA ecosystem today. You have {upcomingMeetings.length} meetings scheduled for the upcoming week.
                        </p>
                    </div>
                    <Link href="/meetings/schedule" className="btn bg-white text-primary border-none hover:bg-base-200 shadow-xl self-start md:self-end">
                        <Calendar size={18} />
                        Schedule Meeting
                    </Link>
                </div>

                {/* Decorative background vectors */}
                <div className="absolute top-0 right-0 -mr-16 -mt-24 opacity-20 pointer-events-none">
                    <svg width="404" height="404" fill="none" viewBox="0 0 404 404"><defs><pattern id="85737c0e-0916-41d7-917f-596dc7edfa27" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="4" height="4" fill="currentColor"></rect></pattern></defs><rect width="404" height="404" fill="url(#85737c0e-0916-41d7-917f-596dc7edfa27)"></rect></svg>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {stats.map((stat, i) => (
                    stat.loading ? (
                        <StatsCardSkeleton key={i} />
                    ) : (
                        <div key={i} className="card bg-base-100 border border-base-200 shadow-sm card-hover p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-base-content/60 mb-1">{stat.label}</p>
                                    <h3 className="text-3xl font-bold tracking-tight text-base-content">{stat.value}</h3>
                                </div>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg}`}>
                                    <stat.icon size={24} className={stat.color} />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-xs text-base-content/50 gap-1.5 font-medium">
                                <TrendingUp size={14} className="text-success" />
                                <span className="text-success">Live API</span>
                                <span>updated just now</span>
                            </div>
                        </div>
                    )
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upcoming Meetings Panel */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
                            <Calendar className="text-primary" size={20} />
                            Your Agenda
                        </h2>
                        <Link href="/meetings" className="btn btn-ghost btn-sm text-primary hover:bg-primary/10 transition-colors">
                            View All <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="bg-base-100 border border-base-200 rounded-2xl shadow-sm p-4 md:p-6 space-y-4">
                        {meetingsLoading ? (
                            Array.from({ length: 3 }).map((_, i) => <MeetingCardSkeleton key={i} />)
                        ) : upcomingMeetings.length === 0 ? (
                            <div className="text-center py-12 px-4 rounded-xl border border-dashed border-base-300 bg-base-50">
                                <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Calendar size={24} className="text-base-content/40" />
                                </div>
                                <h3 className="text-base font-bold text-base-content mb-1">No upcoming meetings</h3>
                                <p className="text-sm text-base-content/60 max-w-sm mx-auto mb-4">You have a clear schedule. Take a break or schedule a new committee sync.</p>
                                <Link href="/meetings/schedule" className="btn btn-primary btn-sm">
                                    Schedule Sync
                                </Link>
                            </div>
                        ) : (
                            upcomingMeetings.map((m: Meeting) => <MeetingCard key={m.id} meeting={m} />)
                        )}
                    </div>
                </div>

                {/* Quick Actions & Recent Activity */}
                <div className="space-y-6">
                    <div className="bg-base-100 border border-base-200 rounded-2xl shadow-sm p-6">
                        <h2 className="text-sm font-bold text-base-content uppercase tracking-wider mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <Link href="/members" className="btn btn-outline btn-sm h-14 border-base-300 hover:bg-base-200/50 hover:text-base-content hover:border-primary/30 flex flex-col justify-center items-center gap-1 font-medium transition-all">
                                <Users size={16} className="text-primary" />
                                <span className="text-xs">Members</span>
                            </Link>
                            <Link href="/committees" className="btn btn-outline btn-sm h-14 border-base-300 hover:bg-base-200/50 hover:text-base-content hover:border-secondary/30 flex flex-col justify-center items-center gap-1 font-medium transition-all">
                                <Building2 size={16} className="text-secondary" />
                                <span className="text-xs">Committees</span>
                            </Link>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-base-200/50 to-base-100 border border-base-200 rounded-2xl shadow-sm p-6 text-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CheckCircle2 size={24} className="text-primary" />
                        </div>
                        <h3 className="font-bold text-base-content mb-1">Platform Status</h3>
                        <p className="text-xs text-base-content/60 mb-4">All systems operational. AI Transcription core is active.</p>
                        <div className="badge badge-success badge-sm gap-1 uppercase tracking-widest text-[10px] font-bold py-3 px-3">
                            <span className="w-1.5 h-1.5 bg-success-content rounded-full animate-pulse"></span>
                            Online
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
