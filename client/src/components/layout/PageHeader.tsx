import { ReactNode } from "react";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    action?: ReactNode;
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
                <h1 className="text-2xl font-bold text-base-content">{title}</h1>
                {subtitle && (
                    <p className="text-sm text-base-content/60 mt-0.5">{subtitle}</p>
                )}
            </div>
            {action && <div className="flex items-center gap-2 flex-shrink-0">{action}</div>}
        </div>
    );
}
