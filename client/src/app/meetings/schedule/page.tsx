"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock, MapPin, FileText, Clock, Users, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { createMeetingSchema, CreateMeetingFormValues } from "@/lib/validations/meetingSchema";
import PageHeader from "@/components/layout/PageHeader";
import ParticipantBadge from "@/components/meetings/ParticipantBadge";
import { useCreateMeeting, useAddParticipants } from "@/lib/hooks/useMeetings";
import { useCommittees, useMembers } from "@/lib/hooks/useOrganization";
import { useState } from "react";
import { Participant } from "@/types";

const DURATION_OPTIONS = [
    { value: 15, label: "15 minutes" },
    { value: 30, label: "30 minutes" },
    { value: 45, label: "45 minutes" },
    { value: 60, label: "1 hour" },
    { value: 90, label: "1.5 hours" },
    { value: 120, label: "2 hours" },
    { value: 180, label: "3 hours" },
    { value: 240, label: "4 hours" },
];

export default function ScheduleMeetingPage() {
    const router = useRouter();
    const [selectedParticipants, setSelectedParticipants] = useState<Participant[]>([]);

    // ── Real API mutations ─────────────────────────────────────────────────────
    const { mutate: createMeeting, isPending: isCreating } = useCreateMeeting();
    const { mutate: addParticipants, isPending: isAddingParticipants } = useAddParticipants();

    const isPending = isCreating || isAddingParticipants;

    // ── Real API queries ───────────────────────────────────────────────────────
    const { data: committees = [] } = useCommittees({ limit: 100 });
    const { data: members = [] } = useMembers({ limit: 100 });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateMeetingFormValues>({
        resolver: zodResolver(createMeetingSchema),
        defaultValues: {
            duration_minutes: 60,
            description: "",
            location: "",
        },
    });

    const addParticipant = (id: string) => {
        const p = members.find((p) => p.id === id);
        if (p && !selectedParticipants.find((sp) => sp.id === p.id)) {
            setSelectedParticipants((prev) => [...prev, p]);
        }
    };

    const removeParticipant = (id: string) => {
        setSelectedParticipants((prev) => prev.filter((p) => p.id !== id));
    };

    const onSubmit = (values: CreateMeetingFormValues) => {
        createMeeting(
            {
                title: values.title,
                description: values.description || null,
                location: values.location || null,
                scheduled_at: new Date(values.scheduled_at).toISOString(),
                duration_minutes: values.duration_minutes,
                committee_id: values.committee_id || null,
                scheduled_by_id: values.scheduled_by_id || null,
            },
            {
                onSuccess: (newMeeting) => {
                    // If we have participants, add them after creating the meeting
                    if (selectedParticipants.length > 0) {
                        addParticipants(
                            {
                                id: newMeeting.id,
                                payload: {
                                    participant_ids: selectedParticipants.map((p) => p.id),
                                },
                            },
                            {
                                onSuccess: () => {
                                    router.push("/meetings");
                                },
                            }
                        );
                    } else {
                        router.push("/meetings");
                    }
                },
            }
        );
    };

    return (
        <div className="max-w-2xl mx-auto">
            <PageHeader
                title="Schedule Meeting"
                subtitle="Set up a new committee meeting"
                action={
                    <Link href="/meetings" className="btn btn-ghost btn-sm gap-2">
                        <ChevronLeft size={14} />
                        Back
                    </Link>
                }
            />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Info */}
                <div className="card bg-base-100 border border-base-300 p-6">
                    <h2 className="text-sm font-semibold text-base-content mb-4 flex items-center gap-2">
                        <FileText size={15} className="text-primary" />
                        Meeting Details
                    </h2>
                    <div className="space-y-4">
                        {/* Title */}
                        <div className="form-control">
                            <label className="label py-1">
                                <span className="label-text font-medium text-sm">
                                    Meeting Title <span className="text-error">*</span>
                                </span>
                            </label>
                            <input
                                {...register("title")}
                                type="text"
                                placeholder="e.g. Executive Board Monthly Review"
                                className={`input input-bordered input-sm w-full ${errors.title ? "input-error" : ""}`}
                            />
                            {errors.title && (
                                <label className="label py-1">
                                    <span className="label-text-alt text-error">{errors.title.message}</span>
                                </label>
                            )}
                        </div>

                        {/* Description */}
                        <div className="form-control">
                            <label className="label py-1">
                                <span className="label-text font-medium text-sm">Description</span>
                            </label>
                            <textarea
                                {...register("description")}
                                placeholder="Brief agenda or purpose of the meeting…"
                                className="textarea textarea-bordered textarea-sm w-full h-24 resize-none"
                            />
                        </div>

                        {/* Location */}
                        <div className="form-control">
                            <label className="label py-1">
                                <span className="label-text font-medium text-sm flex items-center gap-1">
                                    <MapPin size={12} />
                                    Location
                                </span>
                            </label>
                            <input
                                {...register("location")}
                                type="text"
                                placeholder="e.g. APPNA HQ Room 204, or Virtual — Zoom"
                                className="input input-bordered input-sm w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Schedule */}
                <div className="card bg-base-100 border border-base-300 p-6">
                    <h2 className="text-sm font-semibold text-base-content mb-4 flex items-center gap-2">
                        <CalendarClock size={15} className="text-primary" />
                        Schedule
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Date & Time */}
                        <div className="form-control">
                            <label className="label py-1">
                                <span className="label-text font-medium text-sm">
                                    Date & Time <span className="text-error">*</span>
                                </span>
                            </label>
                            <input
                                {...register("scheduled_at")}
                                type="datetime-local"
                                className={`input input-bordered input-sm w-full ${errors.scheduled_at ? "input-error" : ""}`}
                            />
                            {errors.scheduled_at && (
                                <label className="label py-1">
                                    <span className="label-text-alt text-error">{errors.scheduled_at.message}</span>
                                </label>
                            )}
                        </div>

                        {/* Duration */}
                        <div className="form-control">
                            <label className="label py-1">
                                <span className="label-text font-medium text-sm flex items-center gap-1">
                                    <Clock size={12} />
                                    Duration <span className="text-error">*</span>
                                </span>
                            </label>
                            <select
                                {...register("duration_minutes", { valueAsNumber: true })}
                                className={`select select-bordered select-sm w-full ${errors.duration_minutes ? "select-error" : ""}`}
                            >
                                {DURATION_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Committee */}
                        <div className="form-control sm:col-span-2">
                            <label className="label py-1">
                                <span className="label-text font-medium text-sm">Committee</span>
                            </label>
                            <select
                                {...register("committee_id")}
                                className="select select-bordered select-sm w-full"
                            >
                                <option value="">— Select a committee (optional)</option>
                                {committees.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Participants */}
                <div className="card bg-base-100 border border-base-300 p-6">
                    <h2 className="text-sm font-semibold text-base-content mb-4 flex items-center gap-2">
                        <Users size={15} className="text-primary" />
                        Participants
                    </h2>
                    <div className="form-control mb-4">
                        <label className="label py-1">
                            <span className="label-text font-medium text-sm">Add Participant</span>
                        </label>
                        <select
                            className="select select-bordered select-sm w-full"
                            defaultValue=""
                            onChange={(e) => {
                                if (e.target.value) {
                                    addParticipant(e.target.value);
                                    e.target.value = "";
                                }
                            }}
                        >
                            <option value="">— Select a member to add</option>
                            {members
                                .filter((p) => !selectedParticipants.find((sp) => sp.id === p.id))
                                .map((p) => {
                                    const fullName = p.first_name && p.last_name
                                        ? `${p.first_name} ${p.last_name}`
                                        : p.name || p.first_name || p.last_name || "Unknown Member";
                                    return (
                                        <option key={p.id} value={p.id}>
                                            {fullName}
                                        </option>
                                    );
                                })}
                        </select>
                    </div>
                    {selectedParticipants.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {selectedParticipants.map((p) => (
                                <ParticipantBadge key={p.id} participant={p} removable onRemove={removeParticipant} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-base-content/40 italic">No participants added yet.</p>
                    )}
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-3 pb-6">
                    <Link href="/meetings" className="btn btn-ghost btn-sm">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="btn btn-primary btn-sm gap-2 min-w-[150px]"
                    >
                        {isPending ? (
                            <>
                                <span className="loading loading-spinner loading-xs" />
                                Scheduling…
                            </>
                        ) : (
                            <>
                                <CalendarClock size={14} />
                                Schedule Meeting
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
