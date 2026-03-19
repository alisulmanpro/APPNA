"use client";

import { useState } from "react";
import { Sparkles, Copy, Check } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface AISummaryCardProps {
    summary: string;
}

export default function AISummaryCard({ summary }: AISummaryCardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        const success = await copyToClipboard(summary);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="relative rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-5 overflow-hidden">
            {/* Decorative glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-16 translate-x-16 pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Sparkles size={14} className="text-primary" />
                    </div>
                    <div>
                        <span className="text-sm font-semibold text-primary">AI Summary</span>
                        <span className="ml-2 badge badge-primary badge-xs opacity-70">Beta</span>
                    </div>
                </div>

                {/* Copy button */}
                <button
                    onClick={handleCopy}
                    className="btn btn-ghost btn-xs gap-1.5 text-base-content/60 hover:text-primary"
                    aria-label="Copy summary"
                >
                    {copied ? (
                        <>
                            <Check size={13} className="text-success" />
                            <span className="text-success">Copied</span>
                        </>
                    ) : (
                        <>
                            <Copy size={13} />
                            Copy
                        </>
                    )}
                </button>
            </div>

            {/* Summary text */}
            <p className="text-sm text-base-content/80 leading-relaxed relative z-10">
                {summary}
            </p>

            {/* Footer note */}
            <p className="text-xs text-base-content/40 mt-4 flex items-center gap-1">
                <Sparkles size={10} />
                Generated automatically from meeting transcript using AI
            </p>
        </div>
    );
}
