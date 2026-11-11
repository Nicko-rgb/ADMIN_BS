import type { BusinessHourData, HourDay } from '../../companys/interfaces/bussinesHour.interfece';
import type { CalendarBranchWindow, CalendarSchedule, TimeRange } from '../interfaces/booking.interface';
import { formatMinutes, toClosingMinutes, toMinutes } from '../../../shared/utils/formatDate';

export const CALENDAR_WEEKDAYS: HourDay[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

/** Convierte la posición vertical del puntero (0 = inicio, 1 = fin) en una hora del eje. */
export const resolveScheduleTime = (start: number, end: number, ratio: number, step = 15): number => {
    if (end <= start) return start;
    const bounded = Math.min(Math.max(ratio, 0), 1);
    const snapped = Math.round((start + bounded * (end - start)) / step) * step;
    return Math.min(Math.max(snapped, start), end);
};

const FALLBACK_START = 8 * 60;
const FALLBACK_END = 22 * 60;

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

/**
 * Escala común de la semana y huecos por día, usando solo bloques habilitados.
 *
 * Siempre devuelve una grilla: si el espacio no tiene horarios (o falló su
 * carga) se usa la ventana de la sucursal o un rango por defecto (08:00–22:00)
 * para que el calendario se pueda mostrar vacío en vez de bloquear la vista.
 * En ese caso no se pintan huecos de "no disponible" porque no hay horarios
 * contra los que comparar.
 */
export const buildCalendarSchedule = (
    hours: BusinessHourData[],
    branchWindow?: CalendarBranchWindow | null,
    bookingRanges: TimeRange[] = [],
): CalendarSchedule => {
    const active = hours.filter((hour) => !hour.isClosed).map((hour) => ({
        day: hour.dayOfWeek,
        start: toMinutes(hour.startTime),
        // Compatibilidad con cierres a medianoche expresados como 00:00.
        end: toClosingMinutes(hour.endTime),
    })).filter((hour) => CALENDAR_WEEKDAYS.includes(hour.day)
        && Number.isFinite(hour.start) && Number.isFinite(hour.end)
        && hour.start >= 0 && hour.end <= 1440 && hour.start < hour.end);

    const validBookings = bookingRanges.filter((range) => Number.isFinite(range.start) && Number.isFinite(range.end)
        && range.start >= 0 && range.end <= 1440 && range.start < range.end);
    const hasHours = active.length > 0;
    // Con registros de horario (aunque estén todos cerrados) sí se pintan los
    // huecos "no disponible"; sin registros se muestra la grilla fallback limpia.
    const paintClosed = hours.length > 0;

    const businessStart = hasHours
        ? Math.min(...active.map((hour) => hour.start), ...validBookings.map((range) => range.start))
        : Math.min(FALLBACK_START, ...validBookings.map((range) => range.start));
    const businessEnd = hasHours
        ? Math.max(...active.map((hour) => hour.end), ...validBookings.map((range) => range.end))
        : Math.max(FALLBACK_END, ...validBookings.map((range) => range.end));
    const axis = resolveAxis(branchWindow, businessStart, businessEnd);
    // Una reserva existente sigue siendo visible aunque luego cambien o cierren los horarios.
    const start = Math.min(axis.start, ...validBookings.map((range) => range.start));
    const end = Math.max(axis.end, ...validBookings.map((range) => range.end));

    // Bloques recortados a la ventana operativa de la sucursal.
    const ranges = active
        .map((hour) => ({ ...hour, start: Math.max(hour.start, start), end: Math.min(hour.end, end) }))
        .filter((hour) => hour.start < hour.end);

    const slots: CalendarSchedule['slots'] = [];
    // Conserva los minutos reales de apertura/cierre; las filas parciales son proporcionales.
    for (let cursor = start; cursor < end;) {
        const next = Math.min((Math.floor(cursor / 60) + 1) * 60, end);
        slots.push({ start: cursor, end: next, label: formatMinutes(cursor) });
        cursor = next;
    }

    const closedByDay = {} as CalendarSchedule['closedByDay'];
    for (const day of CALENDAR_WEEKDAYS) {
        const dayRanges = hasHours ? ranges.filter((hour) => hour.day === day).sort((a, b) => a.start - b.start) : [];
        const closed: TimeRange[] = [];
        let cursor = start;
        for (const range of dayRanges) {
            if (range.start > cursor) closed.push({ start: cursor, end: range.start });
            cursor = Math.max(cursor, range.end);
        }
        if (paintClosed && cursor < end) closed.push({ start: cursor, end });
        closedByDay[day] = closed.map((range) => ({
            ...range,
            top: (range.start - start) / (end - start) * 100,
            height: (range.end - range.start) / (end - start) * 100,
            label: `No disponible: ${formatMinutes(range.start)}–${formatMinutes(range.end)}`,
        }));
    }

    return { start, end, slots, closedByDay };
};
