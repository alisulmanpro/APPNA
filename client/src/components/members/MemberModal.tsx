"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Member, UserRole } from "@/types";
import { useCreateMember, useUpdateMember } from "@/lib/hooks/useMembers";
import Modal, { closeModal } from "@/components/shared/Modal";

const memberSchema = z.object({
    first_name: z.string().min(2, "First name is required"),
    last_name: z.string().min(2, "Last name is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal('')),
    phone: z.string().optional(),
    location: z.string().optional(),
    role: z.enum(["president", "admin", "committee_chair", "member"] as const),
    is_active: z.boolean().default(true),
});

type MemberFormValues = z.infer<typeof memberSchema>;

interface MemberModalProps {
    member: Member | null;
}

export default function MemberModal({ member }: MemberModalProps) {
    const isEditing = !!member;
    const createMutation = useCreateMember();
    const updateMutation = useUpdateMember();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<MemberFormValues>({
        resolver: zodResolver(memberSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            email: "",
            password: "",
            phone: "",
            location: "",
            role: "member",
            is_active: true,
        },
    });

    useEffect(() => {
        if (member) {
            reset({
                first_name: member.first_name,
                last_name: member.last_name,
                email: member.email,
                phone: member.phone || "",
                location: member.location || "",
                role: member.role,
                is_active: member.is_active,
                password: "", // Don't populate password on edit unless they want to change it
            });
        } else {
            reset({
                first_name: "",
                last_name: "",
                email: "",
                password: "",
                phone: "",
                location: "",
                role: "member",
                is_active: true,
            });
        }
    }, [member, reset]);

    const onSubmit = (data: MemberFormValues) => {
        if (isEditing) {
            // Remove password from payload if not provided
            const payload = { ...data };
            if (!payload.password) delete payload.password;

            updateMutation.mutate(
                { id: member.id, payload },
                { onSuccess: () => closeModal("member-modal") }
            );
        } else {
            // Password is required for creation, zod handles if it's missing but let's be safe
            if (!data.password) {
                data.password = "TempPass123!"; // Fallback, though UI should enforce it
            }
            createMutation.mutate(
                data as any,
                {
                    onSuccess: () => {
                        closeModal("member-modal");
                        reset();
                    }
                }
            );
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <Modal id="member-modal" title={isEditing ? "Edit Member" : "Add New Member"} size="lg">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label text-xs font-medium pb-1">First Name</label>
                        <input
                            {...register("first_name")}
                            className="input input-bordered input-sm w-full bg-base-50"
                        />
                        {errors.first_name && <p className="text-error text-xs mt-1">{errors.first_name.message}</p>}
                    </div>
                    <div>
                        <label className="label text-xs font-medium pb-1">Last Name</label>
                        <input
                            {...register("last_name")}
                            className="input input-bordered input-sm w-full bg-base-50"
                        />
                        {errors.last_name && <p className="text-error text-xs mt-1">{errors.last_name.message}</p>}
                    </div>
                </div>

                <div>
                    <label className="label text-xs font-medium pb-1">Email Address</label>
                    <input
                        {...register("email")}
                        type="email"
                        className="input input-bordered input-sm w-full bg-base-50"
                        disabled={isEditing}
                    />
                    {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
                    {isEditing && <p className="text-xs text-base-content/50 mt-1">Email cannot be changed.</p>}
                </div>

                {!isEditing && (
                    <div>
                        <label className="label text-xs font-medium pb-1">Temporary Password</label>
                        <input
                            {...register("password")}
                            type="password"
                            className="input input-bordered input-sm w-full bg-base-50"
                        />
                        {errors.password && <p className="text-error text-xs mt-1">{errors.password.message}</p>}
                        <p className="text-xs text-warning mt-1">Required for new accounts. User can change this later.</p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label text-xs font-medium pb-1">Phone (Optional)</label>
                        <input
                            {...register("phone")}
                            className="input input-bordered input-sm w-full bg-base-50"
                        />
                    </div>
                    <div>
                        <label className="label text-xs font-medium pb-1">Location (Optional)</label>
                        <input
                            {...register("location")}
                            className="input input-bordered input-sm w-full bg-base-50"
                            placeholder="e.g. New York, NY"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-base-200 pt-4 mt-2">
                    <div>
                        <label className="label text-xs font-medium pb-1">Platform Role</label>
                        <select
                            {...register("role")}
                            className="select select-bordered select-sm w-full bg-base-50"
                        >
                            <option value="member">Member</option>
                            <option value="committee_chair">Committee Chair</option>
                            <option value="admin">Admin</option>
                            <option value="president">President</option>
                        </select>
                    </div>

                    {isEditing && (
                        <div className="flex flex-col justify-center">
                            <label className="label text-xs font-medium pb-1">Account Status</label>
                            <label className="cursor-pointer flex items-center gap-2 mt-1">
                                <input
                                    type="checkbox"
                                    {...register("is_active")}
                                    className="toggle toggle-success toggle-sm"
                                />
                                <span className="text-sm font-medium">Active Account</span>
                            </label>
                        </div>
                    )}
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-base-200">
                    <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => closeModal("member-modal")}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary btn-sm shadow-sm"
                        disabled={isPending}
                    >
                        {isPending ? <span className="loading loading-spinner loading-xs" /> : (isEditing ? "Save Changes" : "Create Member")}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
