// ─── Auth Types ───────────────────────────────────────────────────────────────

export type UserRole = "president" | "admin" | "committee_chair" | "member";

export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
}

// ─── Member Types ─────────────────────────────────────────────────────────────

export interface Member {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  location: string | null;
  bio?: string | null;
  role: UserRole;
  is_active: boolean;
  is_email_verified: boolean;
  profile_picture_url?: string | null;
  created_at?: string;
}

export interface MemberCreate {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  location?: string | null;
  bio?: string | null;
  role?: UserRole;
}

export interface MemberUpdate {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string | null;
  location?: string | null;
  bio?: string | null;
  role?: UserRole;
  is_active?: boolean;
}

// ─── Committee Types ──────────────────────────────────────────────────────────

export interface Committee {
  id: string;
  name: string;
  description?: string | null;
  is_active?: boolean;
  chair_id?: string | null;
  chair?: Member | null;
  created_at?: string;
  member_count?: number;
}

export interface CommitteeMemberEntry {
  id: string;
  committee_id: string;
  user_id: string;
  joined_at: string;
  user?: Member;
}

export interface CommitteeCreate {
  name: string;
  description?: string | null;
  chair_id?: string | null;
}

export interface CommitteeUpdate {
  name?: string;
  description?: string | null;
  chair_id?: string | null;
  is_active?: boolean;
}

// ─── Meeting Types ────────────────────────────────────────────────────────────

export type MeetingStatus = "scheduled" | "completed" | "cancelled";

export interface Meeting {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  scheduled_at: string;
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

// ─── API Response Types ───────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
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

export interface MemberFilters {
  search?: string;
  role?: UserRole | "all";
  is_active?: boolean;
  location?: string;
  page?: number;
  limit?: number;
}

// ─── Stats Types ──────────────────────────────────────────────────────────────

export interface MeetingStats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
}

export interface DashboardStats {
  totalMembers: number;
  totalCommittees: number;
  upcomingMeetings: number;
  completedMeetings: number;
}
