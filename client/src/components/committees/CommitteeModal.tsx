"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Committee } from "@/types";
import { useCreateCommittee, useUpdateCommittee } from "@/lib/hooks/useCommittees";
import Modal, { closeModal } from "@/components/shared/Modal";
import { useMembers } from "@/lib/hooks/useMembers";

const committeeSchema = z.object({
    name: z.string().min(2, "Committee name is required"),
    description: z.string().optional(),
    chair_id: z.string().optional().nullable(),
    is_active: z.boolean().default(true),
});

type CommitteeFormValues = z.infer<typeof committeeSchema>;

interface CommitteeModalProps {
    committee: Committee | null;
}

export default function CommitteeModal({ committee }: CommitteeModalProps) {
    const isEditing = !!committee;
    const createMutation = useCreateCommittee();
    const updateMutation = useUpdateCommittee();
    const { data: membersRes } = useMembers({ limit: 1000 }); // Fetch all members for dropdown (in real app, use async select)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CommitteeFormValues>({
        resolver: zodResolver(committeeSchema) as any,
        defaultValues: {
            name: "",
            description: "",
            chair_id: null,
            is_active: true,
        },
    });

    useEffect(() => {
        if (committee) {
            reset({
                name: committee.name,
                description: committee.description || "",
                chair_id: committee.chair_id || "",
                is_active: committee.is_active,
            });
        } else {
            reset({
                name: "",
                description: "",
                chair_id: "",
                is_active: true,
            });
        }
    }, [committee, reset]);

    const onSubmit = (data: CommitteeFormValues) => {
        // Convert empty string back to null/undefined for API
        if (data.chair_id === "") {
            data.chair_id = null;
        }

        if (isEditing) {
            updateMutation.mutate(
                { id: committee.id, payload: data },
                { onSuccess: () => closeModal("committee-modal") }
            );
        } else {
            createMutation.mutate(
                data as any,
                {
                    onSuccess: () => {
                        closeModal("committee-modal");
                        reset();
                    }
                }
            );
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <Modal id="committee-modal" title={isEditing ? "Edit Committee" : "Create Committee"} size="md">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                <div>
                    <label className="label text-xs font-semibold uppercase tracking-wider text-base-content/70 pb-1">Committee Name</label>
                    <input
                        {...register("name")}
                        className="input input-bordered w-full bg-base-50 focus:bg-white focus:border-secondary transition-all"
                        placeholder="e.g. Finance & Audit"
                    />
                    {errors.name && <p className="text-error text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div>
                    <label className="label text-xs font-semibold uppercase tracking-wider text-base-content/70 pb-1">Description (Optional)</label>
                    <textarea
                        {...register("description")}
                        className="textarea textarea-bordered w-full bg-base-50 focus:bg-white focus:border-secondary transition-all h-24 resize-none"
                        placeholder="What is the primary objective of this committee?"
                    />
                </div>

                <div>
                    <label className="label text-xs font-semibold uppercase tracking-wider text-base-content/70 pb-1">Chairperson (Optional)</label>
                    <select
                        {...register("chair_id")}
                        className="select select-bordered w-full bg-base-50 focus:bg-white focus:border-secondary transition-all"
                    >
                        <option value="">Unassigned</option>
                        {membersRes?.data?.map(member => (
                            <option key={member.id} value={member.id}>
                                {member.first_name} {member.last_name} ({member.email})
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-base-content/50 mt-1.5 line-clamp-1">You can map additional members from the Committee Details page.</p>
                </div>

                {isEditing && (
                    <div className="p-4 bg-base-200/50 rounded-xl border border-base-200">
                        <label className="cursor-pointer flex items-center justify-between">
                            <div>
                                <span className="text-sm font-semibold">Active Status</span>
                                <p className="text-xs text-base-content/60 mt-0.5">Disabling will archive this committee context from reports.</p>
                            </div>
                            <input
                                type="checkbox"
                                {...register("is_active")}
                                className="toggle toggle-success"
                            />
                        </label>
                    </div>
                )}

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-base-200">
                    <button
                        type="button"
                        className="btn btn-ghost px-6"
                        onClick={() => closeModal("committee-modal")}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-secondary shadow-lg shadow-secondary/20 px-6 font-semibold"
                        disabled={isPending}
                    >
                        {isPending ? <span className="loading loading-spinner" /> : (isEditing ? "Update Info" : "Form Committee")}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
