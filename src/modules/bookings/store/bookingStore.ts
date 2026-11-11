import { create } from 'zustand';
import BookingService from '../service/bookingService';
import { handleApiError } from '../../../shared/utils/errorHandler';
import type { BookingDateRange, BookingStoreState } from '../interfaces/booking.interface';

/** Identifica la petición vigente: espacio + rango visible. */
export const bookingRangeKey = (spacePublicId: string | null, range: BookingDateRange): string =>
    `${spacePublicId ?? ''}|${range.start_date}|${range.end_date}`;

// Fuera del estado para no re-renderizar por cambios de control de la petición.
let requestVersion = 0;
let activeRequest: { spacePublicId: string; range: BookingDateRange } | null = null;
let activeController: AbortController | null = null;

const resetRequest = () => {
    requestVersion += 1;
    activeController?.abort();
    activeController = null;
    activeRequest = null;
};

/**
 * Reservas del espacio y rango visibles. Es la fuente de verdad del calendario;
 * la agrupación y el posicionamiento (slots) se derivan en `useBooking`.
 * Las acciones `upsertBooking`/`removeBooking` dejan lista la actualización
 * puntual para un futuro canal en tiempo real.
 */
export const useBookingStore = create<BookingStoreState>((set, get) => ({
    spacePublicId: null,
    rangeKey: null,
    bookings: [],
    status: 'idle',
    error: null,

    loadBookings: async (spacePublicId, range, options) => {
        if (!spacePublicId) {
            const state = get();
            if (state.spacePublicId === null && state.status === 'idle') return;
            resetRequest();
            set({ spacePublicId: null, rangeKey: null, bookings: [], status: 'idle', error: null });
            return;
        }

        const key = bookingRangeKey(spacePublicId, range);
        const state = get();
        if (!options?.force && state.rangeKey === key && (state.status === 'loading' || state.status === 'ready')) return;

        resetRequest();
        const version = ++requestVersion;
        const controller = new AbortController();
        activeController = controller;
        activeRequest = { spacePublicId, range: { ...range } };

        // Nunca se muestran reservas del espacio/rango anterior durante la carga.
        set({ spacePublicId, rangeKey: key, bookings: [], status: 'loading', error: null });

        try {
            const bookings = await BookingService.listByRange(spacePublicId, range, controller.signal);
            if (version !== requestVersion) return;
            set({ bookings, status: 'ready', error: null });
        } catch (error) {
            if (version !== requestVersion) return;
            set({ bookings: [], status: 'error', error: handleApiError(error) });
        }
    },

    reloadBookings: async () => {
        if (!activeRequest) return;
        await get().loadBookings(activeRequest.spacePublicId, activeRequest.range, { force: true });
    },

    upsertBooking: (booking) => {
        // Un evento en tiempo real solo afecta al rango que se está mostrando.
        if (!activeRequest) return;
        if (booking.bookingDate < activeRequest.range.start_date || booking.bookingDate > activeRequest.range.end_date) return;
        set((state) => ({
            bookings: state.bookings.some((item) => item.bookingId === booking.bookingId)
                ? state.bookings.map((item) => (item.bookingId === booking.bookingId ? booking : item))
                : [...state.bookings, booking],
        }));
    },

    removeBooking: (bookingId) => set((state) => ({
        bookings: state.bookings.filter((item) => item.bookingId !== bookingId),
    })),
}));
