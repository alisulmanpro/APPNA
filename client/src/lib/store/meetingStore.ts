import { create } from "zustand";
import { MeetingStatus, MeetingFilters } from "@/types";

interface MeetingUIState {
    // Modal states
    isScheduleModalOpen: boolean;
    isCancelModalOpen: boolean;
    selectedMeetingId: string | null;

    // Filter state
    filters: MeetingFilters;

    // Actions
    openScheduleModal: () => void;
    closeScheduleModal: () => void;
    openCancelModal: (meetingId: string) => void;
    closeCancelModal: () => void;
    setFilter: (key: keyof MeetingFilters, value: string | number | MeetingStatus | undefined) => void;
    resetFilters: () => void;
}

const defaultFilters: MeetingFilters = {
    status: "all",
    search: "",
    page: 1,
    page_size: 10,
};

export const useMeetingStore = create<MeetingUIState>((set) => ({
    // Modal states
    isScheduleModalOpen: false,
    isCancelModalOpen: false,
    selectedMeetingId: null,

    // Filter state
    filters: defaultFilters,

    // Actions
    openScheduleModal: () => set({ isScheduleModalOpen: true }),
    closeScheduleModal: () => set({ isScheduleModalOpen: false }),

    openCancelModal: (meetingId) =>
        set({ isCancelModalOpen: true, selectedMeetingId: meetingId }),
    closeCancelModal: () =>
        set({ isCancelModalOpen: false, selectedMeetingId: null }),

    setFilter: (key, value) =>
        set((state) => ({
            filters: { ...state.filters, [key]: value, page: 1 },
        })),

    resetFilters: () => set({ filters: defaultFilters }),
}));
