import type { BookingCalendarDay, CalendarClosedRange } from './booking.interface';
import type { BookingData } from './createBooking.interface';

export interface PositionedBooking {
    booking: BookingData;
    top: number;
    height: number;
    left: number;
    width: number;
}

/** Día listo para pintar en la grilla: huecos cerrados y reservas posicionadas. */
export interface PositionedBookingDay extends BookingCalendarDay {
    closedRanges: CalendarClosedRange[];
    bookings: PositionedBooking[];
}
