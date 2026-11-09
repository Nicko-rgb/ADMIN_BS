import type { BookingData } from '../interfaces/createBooking.interface';
import type { BookingCalendarView, BookingDateRange, TimeRange } from '../interfaces/booking.interface';
import type { PositionedBooking } from '../interfaces/calendarBookings.interface';
import { toClosingMinutes, toMinutes } from '../../../shared/utils/formatDate';

/** Las claves de las celdas ya son fechas locales YYYY-MM-DD; no convertirlas a UTC. */
export const visibleBookingRange = (
    view: BookingCalendarView,
    days: { key: string }[],
    month: { key: string }[],
): BookingDateRange => {
    const cells = view === 'month' ? month : days;
    return { start_date: cells[0].key, end_date: cells[cells.length - 1].key };
};

export const bookingTimeRange = (booking: BookingData): TimeRange => ({
    start: toMinutes(booking.startTime),
    end: toClosingMinutes(booking.endTime),
});

export const groupBookingsByDate = (bookings: BookingData[]): Record<string, BookingData[]> => {
    const groups: Record<string, BookingData[]> = {};
    for (const booking of bookings) (groups[booking.bookingDate] ??= []).push(booking);
    for (const group of Object.values(groups)) {
        group.sort((a, b) => a.startTime.localeCompare(b.startTime) || a.bookingId - b.bookingId);
    }
    return groups;
};

/** Los estados históricos pueden solaparse: cada grupo comparte el ancho en columnas. */
export const positionDayBookings = (bookings: BookingData[], axis: TimeRange): PositionedBooking[] => {
    const duration = axis.end - axis.start;
    if (duration <= 0) return [];
    const intervals = bookings.map((booking) => {
        const range = bookingTimeRange(booking);
        return { booking, start: Math.max(axis.start, range.start), end: Math.min(axis.end, range.end) };
    }).filter((row) => row.start < row.end)
        .sort((a, b) => a.start - b.start || b.end - a.end || a.booking.bookingId - b.booking.bookingId);

    const result: PositionedBooking[] = [];
    let group: (typeof intervals[number] & { lane: number })[] = [];
    let laneEnds: number[] = [];
    let groupEnd = -1;
    const flush = () => {
        const width = 100 / laneEnds.length;
        for (const row of group) result.push({
            booking: row.booking,
            top: (row.start - axis.start) / duration * 100,
            height: (row.end - row.start) / duration * 100,
            left: row.lane * width, width,
        });
        group = [];
        laneEnds = [];
    };

    for (const row of intervals) {
        if (row.start >= groupEnd) flush();
        let lane = laneEnds.findIndex((end) => end <= row.start);
        if (lane === -1) lane = laneEnds.length;
        laneEnds[lane] = row.end;
        group.push({ ...row, lane });
        groupEnd = Math.max(groupEnd, row.end);
    }
    flush();
    return result;
};

export const BOOKING_STATUS_LABELS: Record<BookingData['status'], string> = {
    PENDING: 'Pendiente', CONFIRMED: 'Confirmada', COMPLETED: 'Completada',
    CANCELED: 'Cancelada', REJECTED: 'Rechazada', NO_SHOW: 'No asistió',
};
