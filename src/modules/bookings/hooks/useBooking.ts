import { useCallback, useEffect, useMemo } from 'react';
import { bookingRangeKey, useBookingStore } from '../store/bookingStore';
import { bookingTimeRange, groupBookingsByDate } from '../utils/calendarBookings';
import type { BookingDateRange } from '../interfaces/booking.interface';
import type { BookingData } from '../interfaces/createBooking.interface';

const EMPTY_BOOKINGS: BookingData[] = [];

/**
 * Reservas del rango visible: dispara la carga en `bookingStore` y deriva los
 * bloques que consume la grilla (agrupados por fecha y rangos de minutos).
 */
export const useBooking = (spacePublicId: string | null, range: BookingDateRange) => {
    const { start_date, end_date } = range;
    const key = bookingRangeKey(spacePublicId, { start_date, end_date });

    const storeSpaceId = useBookingStore((state) => state.spacePublicId);
    const storeRangeKey = useBookingStore((state) => state.rangeKey);
    const storeBookings = useBookingStore((state) => state.bookings);
    const status = useBookingStore((state) => state.status);
    const storeError = useBookingStore((state) => state.error);
    const loadBookings = useBookingStore((state) => state.loadBookings);
    const reload = useBookingStore((state) => state.reloadBookings);

    useEffect(() => {
        void loadBookings(spacePublicId, { start_date, end_date });
    }, [loadBookings, spacePublicId, start_date, end_date]);

    // Solo se exponen datos de la petición vigente; el resto se considera carga.
    const isCurrent = spacePublicId !== null && storeSpaceId === spacePublicId && storeRangeKey === key;
    const bookings = isCurrent ? storeBookings : EMPTY_BOOKINGS;
    const isBookingsLoading = spacePublicId !== null && (!isCurrent || status === 'idle' || status === 'loading');
    const error = isCurrent && status === 'error' ? storeError : null;

    const bookingsByDate = useMemo(() => groupBookingsByDate(bookings), [bookings]);
    const ranges = useMemo(() => bookings.map(bookingTimeRange), [bookings]);
    const reloadBookings = useCallback(() => { void reload(); }, [reload]);

    return {
        bookings,
        bookingsByDate,
        ranges,
        count: bookings.length,
        isBookingsLoading,
        error,
        reloadBookings,
    };
};
