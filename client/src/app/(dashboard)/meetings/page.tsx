"use client";

import Link from "next/link";
import {
    Calendar,
    CheckCircle,
    XCircle,
    LayoutDashboard,
    Plus,
    TrendingUp,
    RefreshCw,
} from "lucide-react";
import { useMeetings } from "@/lib/hooks/useMeetings";
import MeetingCard from "@/components/meetings/MeetingCard";
import EmptyState from "@/components/shared/EmptyState";
import PageHeader from "@/components/layout/PageHeader";
import { MeetingCardSkeleton, StatsCardSkeleton } from "@/components/shared/LoadingSkeleton";
import { formatDate } from "@/lib/utils";
import { Meeting } from "@/types";

const statsConfig = [
    {
        key: "total" as const,
        label: "Total Meetings",
        icon: LayoutDashboard,
        color: "text-base-content",
        bg: "bg-base-200",
        trend: "All time",
    },
    {
        key: "scheduled" as const,
        label: "Scheduled",
        icon: Calendar,
        color: "text-info",
        bg: "bg-info/10",
        trend: "Upcoming",
    },
    {
        key: "completed" as const,
        label: "Completed",
        icon: CheckCircle,
        color: "text-success",
        bg: "bg-success/10",
        trend: "This quarter",
    },
    {
        key: "cancelled" as const,
        label: "Cancelled",
        icon: XCircle,
        color: "text-error",
        bg: "bg-error/10",
        trend: "This month",
    },
];

export default function MeetingsDashboard() {
    const { data: meetings = [], isLoading, isError, refetch } = useMeetings();

    const today = new Date();

    const stats = {
        total: meetings.length,
        scheduled: meetings.filter((m) => m.status === "scheduled").length,
        completed: meetings.filter((m) => m.status === "completed").length,
        cancelled: meetings.filter((m) => m.status === "cancelled").length,
    };

    const upcoming = [...meetings]
        .filter((m) => m.status === "scheduled" && new Date(m.scheduled_at) >= today)
        .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
        .slice(0, 5);

    const recent = [...meetings]
        .filter((m) => m.status === "completed")
        .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())
        .slice(0, 5);

    if (isError) {
        return (
            <EmptyState
                title="Failed to load meetings"
                description="Could not connect to the API. Make sure the server is running and accessible."
                action={
                    <button className="btn btn-primary btn-sm gap-2" onClick={() => refetch()}>
                        <RefreshCw size={14} /> Retry
                    </button>
                }
            />
        );
    }

    return (
        <div>
            <PageHeader
                title="Meetings Dashboard"
                subtitle={`Welcome back — ${formatDate(new Date().toISOString())}`}
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
                            <Plus size={16} />
                            Schedule Meeting
                        </Link>
                    </div>
                }
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {isLoading
                    ? Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
                    : statsConfig.map(({ key, label, icon: Icon, color, bg, trend }) => (
                        <div key={key} className="card bg-base-100 border border-base-300 p-5 card-hover">
                            <div className="flex items-start justify-between mb-4">
                                <p className="text-xs font-medium text-base-content/50 uppercase tracking-wide">
                                    {label}
                                </p>
                                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                                    <Icon size={15} className={color} />
                                </div>
                            </div>
                            <div className="flex items-end justify-between">
                                <span className="text-3xl font-bold text-base-content">{stats[key]}</span>
                                <span className="flex items-center gap-1 text-xs text-base-content/40">
                                    <TrendingUp size={10} />
                                    {trend}
                                </span>
                            </div>
                        </div>
                    ))}
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Meetings */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-base font-semibold text-base-content flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-info inline-block" />
                            Upcoming Meetings
                        </h2>
                        <Link href="/meetings/list" className="text-xs text-primary hover:underline font-medium">
                            View all
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => <MeetingCardSkeleton key={i} />)}
                        </div>
                    ) : upcoming.length === 0 ? (
                        <EmptyState
                            title="No upcoming meetings"
                            description="Schedule a meeting to get started."
                            action={
                                <Link href="/meetings/schedule" className="btn btn-primary btn-sm gap-1">
                                    <Plus size={14} /> Schedule
                                </Link>
                            }
                        />
                    ) : (
                        <div className="space-y-3">
                            {upcoming.map((m: Meeting) => <MeetingCard key={m.id} meeting={m} />)}
                        </div>
                    )}
                </div>

                {/* Recent Meetings */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-base font-semibold text-base-content flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-success inline-block" />
                            Recent Meetings
                        </h2>
                        <Link href="/meetings/list" className="text-xs text-primary hover:underline font-medium">
                            View all
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 2 }).map((_, i) => <MeetingCardSkeleton key={i} />)}
                        </div>
                    ) : recent.length === 0 ? (
                        <EmptyState
                            title="No completed meetings"
                            description="Completed meetings will appear here."
                        />
                    ) : (
                        <div className="space-y-3">
                            {recent.map((m: Meeting) => <MeetingCard key={m.id} meeting={m} />)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
