import { format, formatDistanceToNow, isToday, isTomorrow, parseISO } from "date-fns";
import { MeetingStatus } from "@/types";

// ─── Date Formatting ──────────────────────────────────────────────────────────

export function formatDate(iso: string): string {
    try {
        return format(parseISO(iso), "MMM d, yyyy");
    } catch {
        return iso;
    }
}

export function formatDateTime(iso: string): string {
    try {
        return format(parseISO(iso), "MMM d, yyyy 'at' h:mm a");
    } catch {
        return iso;
    }
}

export function formatTime(iso: string): string {
    try {
        return format(parseISO(iso), "h:mm a");
    } catch {
        return iso;
    }
}

export function formatRelative(iso: string): string {
    try {
        const date = parseISO(iso);
        if (isToday(date)) return `Today at ${format(date, "h:mm a")}`;
        if (isTomorrow(date)) return `Tomorrow at ${format(date, "h:mm a")}`;
        return formatDistanceToNow(date, { addSuffix: true });
    } catch {
        return iso;
    }
}

export function formatDateInput(iso: string): string {
    try {
        return format(parseISO(iso), "yyyy-MM-dd'T'HH:mm");
    } catch {
        return iso;
    }
}

// ─── Duration Formatting ──────────────────────────────────────────────────────

export function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// ─── Avatar / Name Helpers ────────────────────────────────────────────────────

export function getInitials(name?: string): string {
    if (!name) return "??";
    return name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase() || "??";
}

// ─── Status Helpers ───────────────────────────────────────────────────────────

export function getStatusColor(status: MeetingStatus): string {
    if (!status) return "badge-ghost";
    switch (status) {
        case "scheduled":
            return "badge-info";
        case "completed":
            return "badge-success";
        case "cancelled":
            return "badge-error";
        default:
            return "badge-ghost";
    }
}

export function getStatusLabel(status: MeetingStatus): string {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
}

// ─── File Size Formatting ─────────────────────────────────────────────────────

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Clipboard ────────────────────────────────────────────────────────────────

export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}

// ─── Debounce ────────────────────────────────────────────────────────────────

export function debounce<T extends (...args: unknown[]) => unknown>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}
