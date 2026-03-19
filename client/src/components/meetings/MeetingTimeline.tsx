import { CheckCircle, Circle, XCircle, Calendar } from "lucide-react";
import { Meeting } from "@/types";
import { formatDateTime } from "@/lib/utils";

interface MeetingTimelineProps {
    meeting: Meeting;
}

export default function MeetingTimeline({ meeting }: MeetingTimelineProps) {
    const events = [
        {
            label: "Meeting Created",
            time: meeting.created_at,
            icon: Calendar,
            color: "text-base-content/40",
            bg: "bg-base-200",
            active: true,
        },
        {
            label: "Meeting Scheduled",
            time: meeting.scheduled_at,
            icon: Circle,
            color: "text-info",
            bg: "bg-info/10",
            active: meeting.status !== "cancelled",
        },
        {
            label:
                meeting.status === "cancelled"
                    ? `Meeting Cancelled${meeting.cancelled_reason ? ` — ${meeting.cancelled_reason}` : ""}`
                    : "Meeting Completed",
            time: meeting.status !== "scheduled" ? meeting.scheduled_at : null,
            icon: meeting.status === "cancelled" ? XCircle : CheckCircle,
            color:
                meeting.status === "cancelled"
                    ? "text-error"
                    : meeting.status === "completed"
                        ? "text-success"
                        : "text-base-content/20",
            bg:
                meeting.status === "cancelled"
                    ? "bg-error/10"
                    : meeting.status === "completed"
                        ? "bg-success/10"
                        : "bg-base-200",
            active: meeting.status !== "scheduled",
        },
    ];

    return (
        <div className="space-y-0">
            {events.map((event, i) => {
                const Icon = event.icon;
                return (
                    <div key={i} className="flex items-start gap-3">
                        {/* Icon column */}
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-8 h-8 rounded-full ${event.bg} flex items-center justify-center flex-shrink-0`}
                            >
                                <Icon size={15} className={event.color} />
                            </div>
                            {i < events.length - 1 && (
                                <div className="w-px h-8 bg-base-300 my-0.5" />
                            )}
                        </div>

                        {/* Content */}
                        <div className="pt-1.5 pb-2 flex-1">
                            <p
                                className={`text-sm font-medium ${event.active ? "text-base-content" : "text-base-content/30"
                                    }`}
                            >
                                {event.label}
                            </p>
                            {event.time && (
                                <p className="text-xs text-base-content/40 mt-0.5">
                                    {formatDateTime(event.time)}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
