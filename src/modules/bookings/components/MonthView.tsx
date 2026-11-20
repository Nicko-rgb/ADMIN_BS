import { BookingEvent } from './BookingEvent';
import type { BookingCalendarMonthCell } from '../interfaces/booking.interface';
import type { BookingData } from '../interfaces/createBooking.interface';

interface MonthViewProps {
    monthDays: string[];
    monthCells: BookingCalendarMonthCell[];
    bookingsByDate: Record<string, BookingData[]>;
    onSelectDay: (date: Date) => void;
    /** Abre el detalle (y los cobros) de una reserva. */
    onSelectBooking: (booking: BookingData) => void;
}

/** Vista mensual: celdas del mes con una tarjeta compacta por reserva. */
export const MonthView = ({ monthDays, monthCells, bookingsByDate, onSelectDay, onSelectBooking }: MonthViewProps) => (
    <div className="month_view">
        <div className="month_weekdays" aria-hidden="true">
            {monthDays.map((day) => <span key={day}>{day}</span>)}
        </div>
        <div className="month_days">
            {monthCells.map((cell) => (
                <div
                    key={cell.key}
                    className={`month_day${cell.inMonth ? '' : ' out'}${cell.isToday ? ' today' : ''}${cell.isSelected ? ' selected' : ''}`}
                    onClick={() => onSelectDay(cell.date)}
                    aria-label={cell.date.toLocaleDateString('es-ES', { dateStyle: 'full' })}
                    aria-current={cell.isToday ? 'date' : undefined}
                >
                    <span className="month_num">{cell.dayNumber}</span>
                    <div className="month_bookings">
                        {(bookingsByDate[cell.key] ?? []).map((booking) => (
                            <BookingEvent key={booking.bookingId} booking={booking} compact onSelect={onSelectBooking} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);
