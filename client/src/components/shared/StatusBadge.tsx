import { MeetingStatus } from "@/types";
import { getStatusColor, getStatusLabel } from "@/lib/utils";

interface StatusBadgeProps {
    status: MeetingStatus;
    size?: "xs" | "sm" | "md";
}

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
    return (
        <span className={`badge ${getStatusColor(status)} badge-${size} font-medium capitalize`}>
            {getStatusLabel(status)}
        </span>
    );
}
