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
    MessageSquare,
    Building2
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
import { clsx } from "clsx";

type TabType = "overview" | "transcript" | "minutes" | "participants" | "documents";

export default function MeetingDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const { data: meeting, isLoading, isError, refetch } = useMeeting(id);

    const { mutate: cancelMeeting, isPending: isCancelling } = useCancelMeeting();
    const { mutate: saveMinutes, isPending: isSavingMinutes } = useUpdateMinutes();
    const { mutate: saveTranscript, isPending: isSavingTranscript } = useUpdateTranscript();

    const [activeTab, setActiveTab] = useState<TabType>("overview");
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [localMinutes, setLocalMinutes] = useState<string | null>(null);
    const [isEditingMinutes, setIsEditingMinutes] = useState(false);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <CardSkeleton />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {Array.from({ length: 2 }).map((_, i) => <MeetingCardSkeleton key={i} />)}
                    </div>
                    <div className="space-y-6">
                        <MeetingCardSkeleton />
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !meeting) {
        return (
            <div className="flex items-center justify-center py-20">
                <EmptyState
                    title="Meeting not found"
                    description="This meeting does not exist or could not be loaded."
                    action={
                        <div className="flex gap-2">
                            <button className="btn btn-ghost btn-sm gap-2" onClick={() => refetch()}>
                                <RefreshCw size={14} /> Retry
                            </button>
                            <Link href="/meetings" className="btn btn-primary btn-sm">Dashboard</Link>
                        </div>
                    }
                />
            </div>
        );
    }

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

    const tabs = [
        { id: "overview", label: "Overview", icon: Sparkles },
        { id: "transcript", label: "Transcript", icon: MessageSquare },
        { id: "minutes", label: "Minutes", icon: FileText },
        { id: "participants", label: `Participants (${meeting.participants?.length ?? 0})`, icon: Users },
        { id: "documents", label: `Docs (${meeting.documents?.length ?? 0})`, icon: Paperclip },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            <Link href="/meetings/list" className="btn btn-ghost btn-sm gap-2 mb-2 -ml-2 text-base-content/60">
                <ChevronLeft size={16} /> All Meetings
            </Link>

            {/* ── Header Card ── */}
            <div className="bg-base-100 rounded-3xl border border-base-200 overflow-hidden shadow-sm">
                <div className="h-20 bg-linear-to-r from-warning/10 via-warning/5 to-base-100 relative">
                    <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-warning/20 to-transparent"></div>
                </div>

                <div className="px-6 md:px-8 pb-8 pt-4">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                                <StatusBadge status={meeting.status} size="md" />
                                {meeting.committee_name && (
                                    <span className="badge badge-primary badge-outline font-semibold gap-1.5 border-primary/30">
                                        <Building2 size={12} /> {meeting.committee_name}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl font-extrabold text-base-content mb-3 tracking-tight">{meeting.title}</h1>
                            <p className="text-base-content/70 leading-relaxed max-w-3xl mb-5">
                                {meeting.description || "No description provided for this meeting."}
                            </p>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-base-content/60 bg-base-50 w-full sm:w-fit py-2.5 px-5 rounded-2xl border border-base-200 shadow-sm">
                                <span className="flex items-center gap-2">
                                    <Calendar size={16} className="text-primary" />
                                    {formatDate(meeting.scheduled_at)}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Clock size={16} className="text-primary" />
                                    {formatDateTime(meeting.scheduled_at).split(" at ")[1]} ({formatDuration(meeting.duration_minutes)})
                                </span>
                                {meeting.location && (
                                    <span className="flex items-center gap-2">
                                        <MapPin size={16} className="text-primary" />
                                        {meeting.location}
                                    </span>
                                )}
                            </div>
                        </div>

                        {meeting.status === "scheduled" && (
                            <div className="flex gap-2 shrink-0 md:mt-2">
                                <button className="btn btn-outline btn-sm shadow-sm gap-2">
                                    <Edit size={14} /> Edit Details
                                </button>
                                <button
                                    className="btn btn-error btn-sm btn-outline shadow-sm gap-2"
                                    onClick={() => setIsCancelModalOpen(true)}
                                >
                                    <Ban size={14} /> Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {meeting.status === "cancelled" && meeting.cancelled_reason && (
                <div className="alert alert-error shadow-sm rounded-2xl text-sm font-medium border-error/20">
                    <Ban size={18} />
                    <span><strong>Cancelled:</strong> {meeting.cancelled_reason}</span>
                </div>
            )}

            {/* ── Main Layout (Tabs + Sidebar) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── Left Column (Tabs Content) ── */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tabs Navigation */}
                    <div className="flex overflow-x-auto hide-scrollbar bg-base-100 p-1.5 rounded-2xl border border-base-200 shadow-sm gap-1">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as TabType)}
                                    className={clsx(
                                        "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                                        isActive
                                            ? "bg-primary text-primary-content shadow-md shadow-primary/20"
                                            : "text-base-content/60 hover:text-base-content hover:bg-base-200/50"
                                    )}
                                >
                                    <Icon size={16} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Panels */}
                    <div className="bg-base-100 rounded-3xl border border-base-200 shadow-sm overflow-hidden min-h-[400px]">

                        {activeTab === "overview" && (
                            <div className="p-6 md:p-8">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-base-content">
                                    <Sparkles className="text-primary" /> AI Intelligence Summary
                                </h2>
                                {meeting.ai_summary ? (
                                    <AISummaryCard summary={meeting.ai_summary} />
                                ) : (
                                    <div className="text-center py-16 px-4 bg-base-50/50 rounded-2xl border-2 border-dashed border-base-200">
                                        <Sparkles size={32} className="mx-auto text-base-content/20 mb-4" />
                                        <h3 className="text-base font-bold text-base-content mb-2">No AI Summary Yet</h3>
                                        <p className="text-sm text-base-content/60 max-w-sm mx-auto mb-6">
                                            Upload a meeting transcript to automatically generate an intelligent summary, key decisions, and action items.
                                        </p>
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => setActiveTab("transcript")}
                                        >
                                            Upload Transcript
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "transcript" && (
                            <div className="p-6 md:p-8 flex flex-col h-full">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-base-content">
                                    <MessageSquare className="text-primary" /> Meeting Transcript
                                </h2>
                                <div className="flex-1">
                                    <TranscriptUploader
                                        meetingId={meeting.id}
                                        transcript={meeting.transcript}
                                        onSave={handleSaveTranscript}
                                        isSaving={isSavingTranscript}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === "minutes" && (
                            <div className="p-6 md:p-8 h-full flex flex-col">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold flex items-center gap-2 text-base-content">
                                        <FileText className="text-primary" /> Official Minutes
                                    </h2>
                                    {!isEditingMinutes && meeting.minutes && (
                                        <button
                                            className="btn btn-ghost btn-sm gap-2"
                                            onClick={() => { setLocalMinutes(meeting.minutes || ""); setIsEditingMinutes(true); }}
                                        >
                                            <Edit size={14} /> Edit
                                        </button>
                                    )}
                                </div>

                                {!isEditingMinutes && meeting.minutes ? (
                                    <div className="bg-base-50 rounded-2xl p-6 border border-base-200">
                                        <pre className="text-sm text-base-content/80 whitespace-pre-wrap font-sans leading-relaxed">
                                            {minutesValue}
                                        </pre>
                                    </div>
                                ) : (
                                    <div className="space-y-4 flex-1 flex flex-col">
                                        <textarea
                                            value={minutesValue}
                                            onChange={(e) => setLocalMinutes(e.target.value)}
                                            placeholder="Document the official proceedings, votes, and motions here..."
                                            className="textarea textarea-bordered w-full flex-1 min-h-[300px] text-sm resize-none focus:outline-none focus:border-primary shadow-inner bg-base-50 transition-colors focus:bg-white"
                                        />
                                        <div className="flex justify-end gap-3 pt-2">
                                            {meeting.minutes && (
                                                <button
                                                    className="btn btn-ghost"
                                                    onClick={() => { setLocalMinutes(null); setIsEditingMinutes(false); }}
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            <button
                                                className="btn btn-primary shadow-lg shadow-primary/20 px-8"
                                                onClick={handleSaveMinutes}
                                                disabled={!minutesValue.trim() || isSavingMinutes}
                                            >
                                                {isSavingMinutes ? <span className="loading loading-spinner" /> : "Save Official Minutes"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "participants" && (
                            <div className="p-6 md:p-8">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-base-content">
                                    <Users className="text-primary" /> Attendees Roster
                                </h2>
                                {meeting.participants && meeting.participants.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {meeting.participants.map((p) => (
                                            <ParticipantBadge key={p.id} participant={p} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16 px-4 bg-base-50/50 rounded-2xl border-2 border-dashed border-base-200">
                                        <Users size={32} className="mx-auto text-base-content/20 mb-4" />
                                        <p className="text-sm font-medium text-base-content/60">No participants recorded yet.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "documents" && (
                            <div className="p-6 md:p-8">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-base-content">
                                    <Paperclip className="text-primary" /> Attached Files
                                </h2>
                                {meeting.documents && meeting.documents.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {meeting.documents.map((doc) => (
                                            <div
                                                key={doc.id}
                                                className="flex items-center justify-between p-4 rounded-2xl bg-base-50 border border-base-200 group hover:border-primary/50 transition-colors shadow-sm"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                        <FileText size={18} className="text-primary" />
                                                    </div>
                                                    <div className="min-w-0 pr-2">
                                                        <p className="text-sm font-bold text-base-content truncate">{doc.name}</p>
                                                        {doc.size_bytes && (
                                                            <p className="text-xs text-base-content/50 font-medium">{formatFileSize(doc.size_bytes)}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="btn btn-primary btn-sm btn-square rounded-lg shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Download size={16} />
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16 px-4 bg-base-50/50 rounded-2xl border-2 border-dashed border-base-200">
                                        <Paperclip size={32} className="mx-auto text-base-content/20 mb-4" />
                                        <p className="text-sm font-medium text-base-content/60 mb-4">No documents attached to this meeting.</p>
                                        <button className="btn btn-outline btn-sm">Upload File</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right Column (Sidebar Data) ── */}
                <div className="space-y-6">
                    <div className="bg-base-100 rounded-3xl border border-base-200 shadow-sm p-6 overflow-hidden relative">
                        {/* Decorative corner */}
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>

                        <h2 className="text-lg font-bold text-base-content mb-6 flex items-center gap-2 relative z-10">
                            <Activity className="text-primary" size={20} /> Timeline Activity
                        </h2>
                        <div className="relative z-10">
                            <MeetingTimeline meeting={meeting} />
                        </div>
                    </div>

                    <div className="bg-base-100 rounded-3xl border border-base-200 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-base-content mb-6 flex items-center gap-2">
                            <Calendar className="text-primary" size={20} /> Organizer details
                        </h2>

                        {meeting.scheduled_by_name ? (
                            <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-base-50 border border-base-200">
                                <Avatar name={meeting.scheduled_by_name} size="md" />
                                <div>
                                    <p className="text-sm font-bold text-base-content">{meeting.scheduled_by_name}</p>
                                    <p className="text-xs text-base-content/50">Meeting Organizer</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-base-content/50 italic mb-4">No organizer specified.</p>
                        )}

                        <div className="space-y-4 pt-4 border-t border-base-200">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-base-content/40 mb-1">Created Record</p>
                                <p className="text-sm font-medium text-base-content">{formatDate(meeting.created_at)}</p>
                            </div>
                            {meeting.created_at && (
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-base-content/40 mb-1">Last Modified</p>
                                    <p className="text-sm font-medium text-base-content">{formatDate(meeting.created_at)}</p>
                                </div>
                            )}
                        </div>
                    </div>
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
                        <span className="label-text text-sm font-semibold">Cancellation Reason</span>
                    </label>
                    <textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="e.g. Key stakeholders unavailable…"
                        className="textarea textarea-bordered text-sm h-24 resize-none bg-base-50 focus:bg-white transition-colors"
                    />
                </div>
            </ConfirmModal>
        </div>
    );
}
