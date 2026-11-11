import type { CSSProperties } from 'react';
import type { BookingData } from '../interfaces/createBooking.interface';
import { BOOKING_STATUS_LABELS } from '../utils/calendarBookings';
import '../styles/BookingEvent.css';

interface BookingEventProps {
    booking: BookingData;
    compact?: boolean;
    style?: CSSProperties;
}

/** Tarjeta de una reserva dentro de la grilla o del mes. */
export const BookingEvent = ({ booking, compact = false, style }: BookingEventProps) => {
    const name = [booking.client?.firstName, booking.client?.lastName].filter(Boolean).join(' ') || 'Sin nombre';
    const hours = `${booking.startTime}–${booking.endTime}`;
    const status = BOOKING_STATUS_LABELS[booking.status];
    const amount = `${booking.payment?.currency ?? ''} ${booking.totalAmount}`.trim();
    const description = `${booking.bookingDate}, ${hours}. ${name}. ${status}. ${amount}`;

    return (
        <article
            className={`calendar_booking status_${booking.status.toLowerCase()}${compact ? ' is_compact' : ''}`}
            style={style}
            title={description}
            aria-label={description}
            tabIndex={0}
        >
            <span className="calendar_booking_time">{compact ? booking.startTime : hours}</span>
            <strong className="calendar_booking_name">{name}</strong>
            {!compact && <span className="calendar_booking_status">{status} · {amount}</span>}
        </article>
    );
};
