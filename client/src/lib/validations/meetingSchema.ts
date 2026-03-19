import { z } from "zod";

// ─── Create Meeting Schema ────────────────────────────────────────────────────

export const createMeetingSchema = z.object({
    title: z
        .string()
        .min(3, "Title must be at least 3 characters")
        .max(200, "Title cannot exceed 200 characters"),
    description: z.string().max(1000, "Description cannot exceed 1000 characters").optional().or(z.literal("")),
    location: z.string().max(200, "Location cannot exceed 200 characters").optional().or(z.literal("")),
    scheduled_at: z.string().min(1, "Please select a date and time"),
    duration_minutes: z
        .number()
        .min(15, "Minimum duration is 15 minutes")
        .max(480, "Maximum duration is 8 hours"),
    committee_id: z.string().optional().or(z.literal("")),
    scheduled_by_id: z.string().optional().or(z.literal("")),
});

export type CreateMeetingFormValues = z.infer<typeof createMeetingSchema>;

// ─── Cancel Meeting Schema ────────────────────────────────────────────────────

export const cancelMeetingSchema = z.object({
    reason: z
        .string()
        .min(5, "Please provide a reason (minimum 5 characters)")
        .max(500, "Reason cannot exceed 500 characters"),
});

export type CancelMeetingFormValues = z.infer<typeof cancelMeetingSchema>;

// ─── Update Meeting Schema ────────────────────────────────────────────────────

export const updateMeetingSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").optional(),
    description: z.string().max(1000).optional().or(z.literal("")),
    location: z.string().max(200).optional().or(z.literal("")),
    scheduled_at: z.string().optional(),
    duration_minutes: z.number().min(15).max(480).optional(),
    committee_id: z.string().optional().or(z.literal("")),
});

export type UpdateMeetingFormValues = z.infer<typeof updateMeetingSchema>;
