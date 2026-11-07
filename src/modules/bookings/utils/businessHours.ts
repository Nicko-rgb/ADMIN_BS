import type { BusinessHourData, HourDay } from '../../companys/interfaces/bussinesHour.interfece';
import type { CalendarBranchWindow, CalendarSchedule, TimeRange } from '../interfaces/booking.interface';

export const CALENDAR_WEEKDAYS: HourDay[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

const toMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

// Cierre a medianoche: '00:00' y '24:00' son el mismo instante (fin del día).
const toClosingMinutes = (time: string): number => (time.slice(0, 5) === '00:00' ? 1440 : toMinutes(time));

const formatTime = (minutes: number): string =>
    `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/**
 * Eje de la grilla: si la sucursal tiene ventana operativa configurada se usa
 * apertura/cierre; si no, el rango que cubren los bloques del espacio.
 * Los horarios del espacio ya se validan contra la ventana al guardarse, pero
 * se protege data vieja que pueda quedar fuera.
 */
const resolveAxis = (
    branchWindow: CalendarBranchWindow | null | undefined,
    businessStart: number,
    businessEnd: number,
): TimeRange => {
    const opening = branchWindow?.openingTime ? toMinutes(branchWindow.openingTime) : null;
    const closing = branchWindow?.closingTime ? toClosingMinutes(branchWindow.closingTime) : null;

    const hasWindow = opening !== null
        && closing !== null
        && Number.isFinite(opening)
        && Number.isFinite(closing)
        && opening >= 0
        && closing <= 1440
        && opening < closing;

    return hasWindow ? { start: opening, end: closing } : { start: businessStart, end: businessEnd };
};

/** Escala común de la semana y huecos por día, usando solo bloques habilitados. */
export const buildCalendarSchedule = (
    hours: BusinessHourData[],
    branchWindow?: CalendarBranchWindow | null,
): CalendarSchedule | null => {
    const active = hours.filter((hour) => !hour.isClosed).map((hour) => ({
        day: hour.dayOfWeek,
        start: toMinutes(hour.startTime),
        // Compatibilidad con cierres a medianoche expresados como 00:00.
        end: hour.endTime.slice(0, 5) === '00:00' ? 1440 : toMinutes(hour.endTime),
    })).filter((hour) => CALENDAR_WEEKDAYS.includes(hour.day)
        && Number.isFinite(hour.start) && Number.isFinite(hour.end)
        && hour.start >= 0 && hour.end <= 1440 && hour.start < hour.end);

    if (!active.length) return null;

    const businessStart = Math.min(...active.map((hour) => hour.start));
    const businessEnd = Math.max(...active.map((hour) => hour.end));
    const { start, end } = resolveAxis(branchWindow, businessStart, businessEnd);

    // Bloques recortados a la ventana operativa de la sucursal.
    const ranges = active
        .map((hour) => ({ ...hour, start: Math.max(hour.start, start), end: Math.min(hour.end, end) }))
        .filter((hour) => hour.start < hour.end);

    const slots: CalendarSchedule['slots'] = [];
    // Conserva los minutos reales de apertura/cierre; las filas parciales son proporcionales.
    for (let cursor = start; cursor < end;) {
        const next = Math.min((Math.floor(cursor / 60) + 1) * 60, end);
        slots.push({ start: cursor, end: next, label: formatTime(cursor) });
        cursor = next;
    }

    const closedByDay = {} as CalendarSchedule['closedByDay'];
    for (const day of CALENDAR_WEEKDAYS) {
        const dayRanges = ranges.filter((hour) => hour.day === day).sort((a, b) => a.start - b.start);
        const closed: TimeRange[] = [];
        let cursor = start;
        for (const range of dayRanges) {
            if (range.start > cursor) closed.push({ start: cursor, end: range.start });
            cursor = Math.max(cursor, range.end);
        }
        if (cursor < end) closed.push({ start: cursor, end });
        closedByDay[day] = closed.map((range) => ({
            ...range,
            top: (range.start - start) / (end - start) * 100,
            height: (range.end - range.start) / (end - start) * 100,
            label: `No disponible: ${formatTime(range.start)}–${formatTime(range.end)}`,
        }));
    }

    return { start, end, slots, closedByDay };
};
