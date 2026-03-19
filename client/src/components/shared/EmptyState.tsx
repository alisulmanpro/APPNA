import { ReactNode } from "react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-base-200 flex items-center justify-center mb-4">
                {icon || <Inbox size={28} className="text-base-content/30" />}
            </div>
            <h3 className="text-base font-semibold text-base-content mb-1">{title}</h3>
            {description && (
                <p className="text-sm text-base-content/50 max-w-xs mb-4">{description}</p>
            )}
            {action && <div className="mt-2">{action}</div>}
        </div>
    );
}
