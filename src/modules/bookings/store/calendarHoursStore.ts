import { create } from 'zustand';
import BusinessHourService from '../../companys/service/bussinesHourService';
import { handleApiError } from '../../../shared/utils/errorHandler';
import type { CalendarHoursState } from '../interfaces/booking.interface';

// Identifica cada carga, incluso al cambiar de A → B → A o reintentar el mismo espacio.
let requestVersion = 0;

export const useCalendarHoursStore = create<CalendarHoursState>((set, get) => ({
    spacePublicId: null,
    hours: [],
    status: 'idle',
    error: null,
    loadHours: async (spacePublicId, force = false) => {
        const state = get();
        if (spacePublicId === null) {
            if (state.spacePublicId === null && state.status === 'idle') return;
            requestVersion += 1;
            set({ spacePublicId: null, hours: [], status: 'idle', error: null });
            return;
        }
        // Página y Sidebar usan el mismo hook: una única petición para ambos.
        if (!force && state.spacePublicId === spacePublicId && (state.status === 'loading' || state.status === 'ready')) return;

        const version = ++requestVersion;
        set({ spacePublicId, hours: [], status: 'loading', error: null });
        try {
            const hours = await BusinessHourService.list(spacePublicId);
            if (version !== requestVersion) return;
            set({ hours, status: 'ready' });
        } catch (error) {
            if (version !== requestVersion) return;
            set({ hours: [], status: 'error', error: handleApiError(error) });
        }
    },
}));
