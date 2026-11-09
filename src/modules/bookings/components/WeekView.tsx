import { useState } from 'react';
import type { CSSProperties, MouseEvent, PointerEvent } from 'react';
import { BookingEvent } from './BookingEvent';
import { resolveScheduleTime } from '../utils/businessHours';
import { dateKey, formatMinutes } from '../../../shared/utils/formatDate';
import type { CalendarSchedule } from '../interfaces/booking.interface';
import type { PositionedBookingDay } from '../interfaces/calendarBookings.interface';

interface WeekViewProps {
    view: 'day' | 'week';
    days: PositionedBookingDay[];
    timeSlots: CalendarSchedule['slots'];
    scheduleStart: number;
    scheduleEnd: number;
    scheduleDurationHours: number;
    /** Abre el formulario con la fecha y el rango horario del clic. */
    onSelectSlot: (date: string, startTime: string, endTime: string) => void;
}

interface CursorState {
    x: number;
    y: number;
    time: string;
    date: string;
    placeAbove: boolean;
}

const formatCursorDate = (date: Date): string => {
    const label = date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
    return label.charAt(0).toUpperCase() + label.slice(1);
};

/**
 * Una columna de día. El cursor es estado local de la columna para que mover el
 * mouse no re-renderice la página completa: solo se repinta la columna activa.
 */
const WeekDayColumn = ({
    day,
    timeSlots,
    scheduleStart,
    scheduleEnd,
    onSelectSlot,
}: {
    day: PositionedBookingDay;
    timeSlots: CalendarSchedule['slots'];
    scheduleStart: number;
    scheduleEnd: number;
    onSelectSlot: WeekViewProps['onSelectSlot'];
}) => {
    const [cursor, setCursor] = useState<CursorState | null>(null);

    const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        if (!rect.height) return;

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const minutes = resolveScheduleTime(scheduleStart, scheduleEnd, y / rect.height);

        setCursor({
            x,
            y,
            time: formatMinutes(minutes),
            date: formatCursorDate(day.date),
            placeAbove: y > 72,
        });
    };

    // Un clic en el fondo de la columna crea una reserva con la fecha y la hora
    // bajo el puntero. Las reservas y los huecos cerrados no abren el form.
    const handleClick = (event: MouseEvent<HTMLDivElement>) => {
        if ((event.target as HTMLElement).closest('.calendar_booking, .closed_period')) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (!rect.height) return;

        const minutes = resolveScheduleTime(
            scheduleStart,
            scheduleEnd,
            (event.clientY - rect.top) / rect.height,
        );
        const start = Math.min(minutes, Math.max(scheduleStart, scheduleEnd - 15));
        if (start >= scheduleEnd) return;
        const end = Math.min(start + 60, scheduleEnd);
        onSelectSlot(dateKey(day.date), formatMinutes(start), end >= 1440 ? '00:00' : formatMinutes(end));
    };

    return (
        <div
            className={`day_column${cursor ? ' is_cursor_active' : ''}`}
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setCursor(null)}
            onClick={handleClick}
        >
            {timeSlots.map((slot) => (
                <div key={slot.start} className="hour_slot" data-start-time={slot.label} aria-hidden="true" />
            ))}
            {day.closedRanges.map((range) => (
                <div
                    key={range.start}
                    className="closed_period"
                    style={{ top: `${range.top}%`, height: `${range.height}%` }}
                    role="img"
                    aria-label={`${day.weekday}: ${range.label}`}
                    title={range.label}
                />
            ))}
            {day.bookings.map((item) => (
                <BookingEvent
                    key={item.booking.bookingId}
                    booking={item.booking}
                    style={{
                        top: `${item.top}%`,
                        height: `calc(${item.height}% - 2px)`,
                        left: `calc(${item.left}% + 2px)`,
                        width: `calc(${item.width}% - 4px)`,
                    }}
                />
            ))}

            {cursor && (
                <>
                    <span
                        className="calendar_cursor_point"
                        style={{ left: cursor.x, top: cursor.y }}
                        aria-hidden="true"
                    />
                    <div
                        className="calendar_cursor"
                        style={{
                            left: cursor.x,
                            top: cursor.y,
                            transform: cursor.placeAbove
                                ? 'translate(-50%, calc(-100% - 22px))'
                                : 'translate(-50%, 22px)',
                        }}
                        aria-hidden="true"
                    >
                        <strong>{cursor.time}</strong>
                        <span>{cursor.date}</span>
                    </div>
                </>
            )}
        </div>
    );
};

/**
 * Vista de día/semana. La hora se resuelve con la posición vertical (eje de
 * horarios) y la fecha con la columna bajo el puntero (eje horizontal).
 */
export const WeekView = ({
    view,
    days,
    timeSlots,
    scheduleStart,
    scheduleEnd,
    scheduleDurationHours,
    onSelectSlot,
}: WeekViewProps) => (
    <div className="calendar_timegrid" style={{
        '--booking-hour-count': scheduleDurationHours,
        '--booking-time-rows': timeSlots.map((slot) => `${slot.end - slot.start}fr`).join(' '),
    } as CSSProperties}>
        <div className={`timegrid_head ${view === 'day' ? 'is_day' : 'is_week'}`}>
            <span />
            {days.map((day) => (
                <div key={day.key} className={`day_head${day.isToday ? ' today' : ''}`}>
                    <span>{day.weekday}</span>
                    <strong className='center'>{day.dayNumber}</strong>
                </div>
            ))}
        </div>
        <div className="timegrid_body">
            <div className={`timegrid_content ${view === 'day' ? 'is_day' : 'is_week'}`}>
                <div className="time_labels">
                    {timeSlots.map((slot, index) => (
                        <div className="time_box" key={slot.start}>
                            {index > 0 && <span>{slot.label}</span>}
                        </div>
                    ))}
                </div>
                {days.map((day) => (
                    <WeekDayColumn
                        key={day.key}
                        day={day}
                        timeSlots={timeSlots}
                        scheduleStart={scheduleStart}
                        scheduleEnd={scheduleEnd}
                        onSelectSlot={onSelectSlot}
                    />
                ))}
            </div>
        </div>
    </div>
);
