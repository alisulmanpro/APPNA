// ─── Card Skeleton ────────────────────────────────────────────────────────────

export function CardSkeleton() {
    return (
        <div className="card bg-base-100 border border-base-300 p-5 animate-pulse">
            <div className="h-4 bg-base-300 rounded w-1/3 mb-3"></div>
            <div className="h-8 bg-base-300 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-base-300 rounded w-2/3"></div>
        </div>
    );
}

// ─── Table Row Skeleton ───────────────────────────────────────────────────────

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
    return (
        <tr className="animate-pulse">
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="py-4 px-4">
                    <div className="h-4 bg-base-300 rounded w-3/4"></div>
                </td>
            ))}
        </tr>
    );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
    return (
        <>
            {Array.from({ length: rows }).map((_, i) => (
                <TableRowSkeleton key={i} cols={cols} />
            ))}
        </>
    );
}

// ─── Stats Card Skeleton ──────────────────────────────────────────────────────

export function StatsCardSkeleton() {
    return (
        <div className="card bg-base-100 border border-base-300 p-5 animate-pulse">
            <div className="flex items-center justify-between mb-4">
                <div className="h-3 bg-base-300 rounded w-24"></div>
                <div className="w-8 h-8 bg-base-300 rounded-lg"></div>
            </div>
            <div className="h-8 bg-base-300 rounded w-16 mb-1"></div>
            <div className="h-3 bg-base-300 rounded w-32"></div>
        </div>
    );
}

// ─── Meeting Card Skeleton ────────────────────────────────────────────────────

export function MeetingCardSkeleton() {
    return (
        <div className="card bg-base-100 border border-base-300 p-4 animate-pulse">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-base-300 rounded-lg flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-base-300 rounded w-3/4"></div>
                    <div className="h-3 bg-base-300 rounded w-1/2"></div>
                    <div className="h-3 bg-base-300 rounded w-1/3"></div>
                </div>
                <div className="h-5 bg-base-300 rounded-full w-20"></div>
            </div>
        </div>
    );
}
