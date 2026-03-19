"use client";

import { X } from "lucide-react";
import { Participant } from "@/types";
import { getInitials } from "@/lib/utils";

interface ParticipantBadgeProps {
    participant: Participant;
    onRemove?: (id: string) => void;
    removable?: boolean;
}

export default function ParticipantBadge({
    participant,
    onRemove,
    removable = false,
}: ParticipantBadgeProps) {
    return (
        <div className="flex items-center gap-1.5 bg-base-200 border border-base-300 rounded-full pl-1.5 pr-2 py-1 group">
            {/* Mini avatar */}
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-primary-content text-[9px] font-bold">
                    {getInitials(participant.name)}
                </span>
            </div>

            {/* Name */}
            <span className="text-xs font-medium text-base-content">{participant.name}</span>

            {/* Role */}
            {participant.role && (
                <span className="text-xs text-base-content/40">·</span>
            )}
            {participant.role && (
                <span className="text-xs text-base-content/50">{participant.role}</span>
            )}

            {/* Remove button */}
            {removable && onRemove && (
                <button
                    type="button"
                    onClick={() => onRemove(participant.id)}
                    className="ml-0.5 w-4 h-4 rounded-full flex items-center justify-center text-base-content/40 hover:text-error hover:bg-error/10 transition-colors"
                    aria-label={`Remove ${participant.name}`}
                >
                    <X size={10} />
                </button>
            )}
        </div>
    );
}
