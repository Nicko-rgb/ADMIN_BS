import type { CSSProperties, KeyboardEvent, MouseEvent } from 'react';
import type { BookingData } from '../interfaces/createBooking.interface';
import { BOOKING_STATUS_LABELS } from '../utils/calendarBookings';
import { PAYMENT_STATE_LABELS, formatMoney } from '../utils/bookingPaymentForm';
import '../styles/BookingEvent.css';

interface BookingEventProps {
    booking: BookingData;
    compact?: boolean;
    style?: CSSProperties;
    /** Abre el detalle de la reserva (cobros incluidos). */
    onSelect?: (booking: BookingData) => void;
}

/** Tarjeta de una reserva dentro de la grilla o del mes. */
export const BookingEvent = ({ booking, compact = false, style, onSelect }: BookingEventProps) => {
    const name = [booking.client?.firstName, booking.client?.lastName].filter(Boolean).join(' ') || 'Sin nombre';
    const hours = `${booking.startTime}–${booking.endTime}`;
    const status = BOOKING_STATUS_LABELS[booking.status];
    const { currency, pendingAmount, status: paymentState } = booking.paymentSummary;
    const amount = formatMoney(booking.totalAmount, currency);
    const pending = paymentState === 'PAID' ? null : formatMoney(pendingAmount, currency);
    const description = `${booking.bookingDate}, ${hours}. ${name}. ${status}. ${amount}. ${PAYMENT_STATE_LABELS[paymentState]}${pending ? `, debe ${pending}` : ''}`;

    // Clic dentro de la columna/celda: no debe abrir también el alta ni cambiar de día.
    const select = (event: MouseEvent | KeyboardEvent) => {
        if (!onSelect) return;
        event.stopPropagation();
        onSelect(booking);
    };

    return (
        <article
            className={`calendar_booking status_${booking.status.toLowerCase()} payment_${paymentState.toLowerCase()}${compact ? ' is_compact' : ''}${onSelect ? ' is_selectable' : ''}`}
            style={style}
            title={description}
            aria-label={description}
            tabIndex={0}
            role={onSelect ? 'button' : undefined}
            onClick={select}
            onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(event); } }}
        >
            <span className="calendar_booking_time">{compact ? booking.startTime : hours}</span>
            <strong className="calendar_booking_name">{name}</strong>
            {!compact && <span className="calendar_booking_status">{status} · {amount}</span>}
            {!compact && pending && <span className="calendar_booking_pending">Debe {pending}</span>}
        </article>
    );
};
