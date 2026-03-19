// ─── Meeting Types ────────────────────────────────────────────────────────────

export type MeetingStatus = "scheduled" | "completed" | "cancelled";

export interface Meeting {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  scheduled_at: string; // ISO datetime
  duration_minutes: number;
  status: MeetingStatus;
  committee_id: string | null;
  committee_name?: string | null;
  scheduled_by_id: string | null;
  scheduled_by_name?: string | null;
  ai_summary: string | null;
  minutes: string | null;
  transcript: string | null;
  participants?: Participant[];
  documents?: MeetingDocument[];
  created_at: string;
  cancelled_reason?: string | null;
}

export interface CreateMeetingPayload {
  title: string;
  description: string | null;
  location: string | null;
  scheduled_at: string;
  duration_minutes: number;
  committee_id: string | null;
  scheduled_by_id: string | null;
}

export interface UpdateMeetingPayload {
  title?: string;
  description?: string | null;
  location?: string | null;
  scheduled_at?: string;
  duration_minutes?: number;
  committee_id?: string | null;
}

export interface CancelMeetingPayload {
  reason: string;
}

// ─── Participant Types ────────────────────────────────────────────────────────

export interface Participant {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  role?: string;
  avatar_url?: string | null;
}

export interface AddParticipantsPayload {
  participant_ids: string[];
}

// ─── Document Types ───────────────────────────────────────────────────────────

export interface MeetingDocument {
  id: string;
  name: string;
  url: string;
  size_bytes?: number;
  uploaded_at: string;
}

// ─── Committee Types ──────────────────────────────────────────────────────────

export interface Committee {
  id: string;
  name: string;
  description?: string | null;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface MeetingFilters {
  status?: MeetingStatus | "all";
  committee_id?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}

// ─── Stats Types ──────────────────────────────────────────────────────────────

export interface MeetingStats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
}
