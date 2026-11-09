import type { PaginatedResponse } from '../../../shared/interfaces/pagination.interface';
import type { BookingData } from '../interfaces/createBooking.interface';

/** Una carga del calendario solo se publica cuando todas las páginas han llegado. */
export const loadBookingPages = async (
    fetchPage: (page: number) => Promise<PaginatedResponse<BookingData>>,
    signal?: AbortSignal,
): Promise<BookingData[]> => {
    const bookings = new Map<number, BookingData>();
    let page = 1;
    let totalPages: number;
    do {
        signal?.throwIfAborted();
        const result = await fetchPage(page);
        signal?.throwIfAborted();
        for (const booking of result.data) bookings.set(booking.bookingId, booking);
        totalPages = result.pagination.totalPages;
        page += 1;
    } while (page <= totalPages);
    return [...bookings.values()];
};
