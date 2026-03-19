"use client";

import Link from "next/link";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Meeting } from "@/types";
import { formatDate, formatTime, formatDuration } from "@/lib/utils";
import StatusBadge from "@/components/shared/StatusBadge";

interface MeetingCardProps {
    meeting: Meeting;
}

export default function MeetingCard({ meeting }: MeetingCardProps) {
    return (
        <Link href={`/meetings/${meeting.id}`}>
            <div className="card bg-base-100 border border-base-300 p-4 hover:border-primary/30 hover:shadow-md transition-all duration-200 cursor-pointer group card-hover">
                <div className="flex items-start gap-3">
                    {/* Date Block */}
                    <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary/10 flex flex-col items-center justify-center">
                        <span className="text-xs font-bold text-primary leading-tight">
                            {new Date(meeting.scheduled_at).toLocaleDateString("en-US", { month: "short" })}
                        </span>
                        <span className="text-lg font-bold text-primary leading-tight">
                            {new Date(meeting.scheduled_at).getDate()}
                        </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-base-content group-hover:text-primary transition-colors truncate">
                                {meeting.title}
                            </h3>
                            <StatusBadge status={meeting.status} size="xs" />
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-base-content/50">
                            <span className="flex items-center gap-1">
                                <Clock size={11} />
                                {formatTime(meeting.scheduled_at)} · {formatDuration(meeting.duration_minutes)}
                            </span>
                            {meeting.location && (
                                <span className="flex items-center gap-1 truncate max-w-[140px]">
                                    <MapPin size={11} />
                                    {meeting.location}
                                </span>
                            )}
                            {meeting.committee_name && (
                                <span className="flex items-center gap-1">
                                    <Calendar size={11} />
                                    {meeting.committee_name}
                                </span>
                            )}
                            {meeting.participants && meeting.participants.length > 0 && (
                                <span className="flex items-center gap-1">
                                    <Users size={11} />
                                    {meeting.participants.length} participants
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
