"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    FileText,
    Sparkles,
    Paperclip,
    Edit,
    Ban,
    ChevronLeft,
    Activity,
    Download,
    RefreshCw,
} from "lucide-react";
import Link from "next/link";
import {
    useMeeting,
    useCancelMeeting,
    useUpdateMinutes,
    useUpdateTranscript,
} from "@/lib/hooks/useMeetings";
import StatusBadge from "@/components/shared/StatusBadge";
import Avatar from "@/components/shared/Avatar";
import ParticipantBadge from "@/components/meetings/ParticipantBadge";
import TranscriptUploader from "@/components/meetings/TranscriptUploader";
import AISummaryCard from "@/components/meetings/AISummaryCard";
import MeetingTimeline from "@/components/meetings/MeetingTimeline";
import ConfirmModal from "@/components/shared/ConfirmModal";
import EmptyState from "@/components/shared/EmptyState";
import { MeetingCardSkeleton, CardSkeleton } from "@/components/shared/LoadingSkeleton";
import { formatDate, formatDateTime, formatDuration, formatFileSize } from "@/lib/utils";

// ─── Section Wrapper ──────────────────────────────────────────────────────────
function Section({
    title,
    icon: Icon,
    children,
    className = "",
}: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`card bg-base-100 border border-base-300 p-6 ${className}`}>
            <h2 className="text-sm font-semibold text-base-content mb-4 flex items-center gap-2">
                <Icon size={15} className="text-primary" />
                {title}
            </h2>
            {children}
        </div>
    );
}

export default function MeetingDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    // ── Real API: fetch meeting ────────────────────────────────────────────────
    const { data: meeting, isLoading, isError, refetch } = useMeeting(id);

    // ── Real API: mutations ───────────────────────────────────────────────────
    const { mutate: cancelMeeting, isPending: isCancelling } = useCancelMeeting();
    const { mutate: saveMinutes, isPending: isSavingMinutes } = useUpdateMinutes();
    const { mutate: saveTranscript, isPending: isSavingTranscript } = useUpdateTranscript();

    // ── Local UI state ────────────────────────────────────────────────────────
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [localMinutes, setLocalMinutes] = useState<string | null>(null);
    const [isEditingMinutes, setIsEditingMinutes] = useState(false);

    // ── Loading state ─────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="space-y-6">
                <CardSkeleton />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {Array.from({ length: 3 }).map((_, i) => <MeetingCardSkeleton key={i} />)}
                    </div>
                    <div className="space-y-6">
                        <MeetingCardSkeleton />
                    </div>
                </div>
            </div>
        );
    }

    // ── Error / not found ─────────────────────────────────────────────────────
    if (isError || !meeting) {
        return (
            <div className="flex items-center justify-center h-64">
                <EmptyState
                    title="Meeting not found"
                    description="This meeting does not exist or could not be loaded from the server."
                    action={
                        <div className="flex gap-2">
                            <button className="btn btn-ghost btn-sm gap-2" onClick={() => refetch()}>
                                <RefreshCw size={14} /> Retry
                            </button>
                            <Link href="/meetings" className="btn btn-primary btn-sm">Back to Dashboard</Link>
                        </div>
                    }
                />
            </div>
        );
    }

    // ── Active minutes value (local edit takes priority) ──────────────────────
    const minutesValue = localMinutes !== null ? localMinutes : (meeting.minutes || "");

    const handleCancelMeeting = () => {
        if (!cancelReason.trim()) return;
        cancelMeeting(
            { id: meeting.id, reason: cancelReason },
            {
                onSuccess: () => {
                    setIsCancelModalOpen(false);
                    router.push("/meetings");
                },
            }
        );
    };

    const handleSaveMinutes = () => {
        saveMinutes(
            { id: meeting.id, minutes: minutesValue },
            { onSuccess: () => setIsEditingMinutes(false) }
        );
    };

    const handleSaveTranscript = (transcript: string) => {
        saveTranscript({ id: meeting.id, transcript });
    };

    return (
        <div>
            {/* Back nav */}
            <Link href="/meetings/list" className="btn btn-ghost btn-sm gap-2 mb-4 -ml-1">
                <ChevronLeft size={14} />
                All Meetings
            </Link>

            {/* ── Header ── */}
            <div className="card bg-base-100 border border-base-300 p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <StatusBadge status={meeting.status} size="md" />
                            {meeting.committee_name && (
                                <span className="badge badge-ghost badge-sm">{meeting.committee_name}</span>
                            )}
                        </div>
                        <h1 className="text-2xl font-bold text-base-content mb-3">{meeting.title}</h1>
                        {meeting.description && (
                            <p className="text-sm text-base-content/60 leading-relaxed mb-4">
                                {meeting.description}
                            </p>
                        )}
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-base-content/60">
                            <span className="flex items-center gap-1.5">
                                <Calendar size={14} className="text-primary" />
                                {formatDate(meeting.scheduled_at)}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock size={14} className="text-primary" />
                                {formatDateTime(meeting.scheduled_at).split(" at ")[1]} ·{" "}
                                {formatDuration(meeting.duration_minutes)}
                            </span>
                            {meeting.location && (
                                <span className="flex items-center gap-1.5">
                                    <MapPin size={14} className="text-primary" />
                                    {meeting.location}
                                </span>
                            )}
                            {meeting.scheduled_by_name && (
                                <span className="flex items-center gap-1.5">
                                    <Avatar name={meeting.scheduled_by_name} size="xs" />
                                    Scheduled by {meeting.scheduled_by_name}
                                </span>
                            )}
                        </div>
                    </div>

                    {meeting.status === "scheduled" && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button className="btn btn-ghost btn-sm gap-1.5">
                                <Edit size={14} />
                                Edit
                            </button>
                            <button
                                className="btn btn-error btn-sm btn-outline gap-1.5"
                                onClick={() => setIsCancelModalOpen(true)}
                            >
                                <Ban size={14} />
                                Cancel Meeting
                            </button>
                        </div>
                    )}
                </div>

                {meeting.status === "cancelled" && meeting.cancelled_reason && (
                    <div className="mt-4 p-3 rounded-xl bg-error/10 border border-error/20">
                        <p className="text-xs text-error font-medium mb-0.5">Cancellation Reason</p>
                        <p className="text-sm text-base-content/70">{meeting.cancelled_reason}</p>
                    </div>
                )}
            </div>

            {/* ── Main Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* AI Summary */}
                    {meeting.ai_summary && (
                        <Section title="AI Summary" icon={Sparkles}>
                            <AISummaryCard summary={meeting.ai_summary} />
                        </Section>
                    )}

                    {/* Participants */}
                    <Section title={`Participants (${meeting.participants?.length ?? 0})`} icon={Users}>
                        {meeting.participants && meeting.participants.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {meeting.participants.map((p) => (
                                    <ParticipantBadge key={p.id} participant={p} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-base-content/40 italic">No participants added.</p>
                        )}
                    </Section>

                    {/* Minutes */}
                    <Section title="Meeting Minutes" icon={FileText}>
                        {!isEditingMinutes && meeting.minutes ? (
                            <div>
                                <pre className="text-sm text-base-content/80 whitespace-pre-wrap bg-base-200 rounded-xl p-4 border border-base-300 max-h-72 overflow-y-auto font-sans leading-relaxed">
                                    {minutesValue}
                                </pre>
                                <button
                                    className="btn btn-ghost btn-xs mt-3"
                                    onClick={() => { setLocalMinutes(meeting.minutes || ""); setIsEditingMinutes(true); }}
                                >
                                    Edit Minutes
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <textarea
                                    value={minutesValue}
                                    onChange={(e) => setLocalMinutes(e.target.value)}
                                    placeholder="Enter meeting minutes here…"
                                    className="textarea textarea-bordered w-full h-44 text-sm resize-none focus:outline-none focus:border-primary"
                                />
                                <div className="flex gap-2">
                                    <button
                                        className="btn btn-primary btn-sm gap-2"
                                        onClick={handleSaveMinutes}
                                        disabled={!minutesValue.trim() || isSavingMinutes}
                                    >
                                        {isSavingMinutes && <span className="loading loading-spinner loading-xs" />}
                                        Save Minutes
                                    </button>
                                    {meeting.minutes && (
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => { setLocalMinutes(null); setIsEditingMinutes(false); }}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </Section>

                    {/* Transcript */}
                    <Section title="Meeting Transcript" icon={FileText}>
                        <TranscriptUploader
                            meetingId={meeting.id}
                            transcript={meeting.transcript}
                            onSave={handleSaveTranscript}
                            isSaving={isSavingTranscript}
                        />
                    </Section>

                    {/* Attached Documents */}
                    <Section title={`Attached Documents (${meeting.documents?.length ?? 0})`} icon={Paperclip}>
                        {meeting.documents && meeting.documents.length > 0 ? (
                            <div className="space-y-2">
                                {meeting.documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="flex items-center justify-between p-3 rounded-xl bg-base-200 border border-base-300 group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Paperclip size={13} className="text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-base-content">{doc.name}</p>
                                                {doc.size_bytes && (
                                                    <p className="text-xs text-base-content/40">{formatFileSize(doc.size_bytes)}</p>
                                                )}
                                            </div>
                                        </div>
                                        <a
                                            href={doc.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="btn btn-ghost btn-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Download size={13} />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-base-content/40 italic">No documents attached.</p>
                        )}
                    </Section>
                </div>

                {/* Right sidebar */}
                <div className="space-y-6">
                    <Section title="Meeting Timeline" icon={Activity}>
                        <MeetingTimeline meeting={meeting} />
                    </Section>

                    <Section title="Meeting Info" icon={Calendar}>
                        <dl className="space-y-3 text-sm">
                            <div>
                                <dt className="text-xs text-base-content/40 mb-0.5">Committee</dt>
                                <dd className="font-medium text-base-content">{meeting.committee_name || "—"}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-base-content/40 mb-0.5">Scheduled At</dt>
                                <dd className="font-medium text-base-content">{formatDateTime(meeting.scheduled_at)}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-base-content/40 mb-0.5">Duration</dt>
                                <dd className="font-medium text-base-content">{formatDuration(meeting.duration_minutes)}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-base-content/40 mb-0.5">Created</dt>
                                <dd className="font-medium text-base-content">{formatDate(meeting.created_at)}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-base-content/40 mb-0.5">Transcript</dt>
                                <dd>
                                    <span className={`badge badge-xs ${meeting.transcript ? "badge-success" : "badge-ghost"}`}>
                                        {meeting.transcript ? "Available" : "Not uploaded"}
                                    </span>
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-base-content/40 mb-0.5">AI Summary</dt>
                                <dd>
                                    <span className={`badge badge-xs ${meeting.ai_summary ? "badge-primary" : "badge-ghost"}`}>
                                        {meeting.ai_summary ? "Generated" : "Pending"}
                                    </span>
                                </dd>
                            </div>
                        </dl>
                    </Section>
                </div>
            </div>

            {/* ── Cancel Confirm Modal ── */}
            <ConfirmModal
                isOpen={isCancelModalOpen}
                onClose={() => { setIsCancelModalOpen(false); setCancelReason(""); }}
                onConfirm={handleCancelMeeting}
                title="Cancel Meeting?"
                description="This action cannot be undone. Please provide a reason for cancellation."
                confirmLabel="Cancel Meeting"
                confirmVariant="btn-error"
                isLoading={isCancelling}
            >
                <div className="form-control">
                    <label className="label py-1">
                        <span className="label-text text-sm font-medium">Reason</span>
                    </label>
                    <textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="e.g. Key stakeholders unavailable…"
                        className="textarea textarea-bordered textarea-sm h-24 resize-none text-sm"
                    />
                </div>
            </ConfirmModal>
        </div>
    );
}
