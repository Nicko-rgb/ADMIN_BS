import {
    addDays,
    dateKey,
    formatLongDate,
    formatMonthYear,
    formatShortDate,
    startOfMonth,
    startOfWeek,
} from '../../../shared/utils/formatDate';
import type {
    BookingCalendarDay,
    BookingCalendarMonthCell,
    BookingCalendarView,
} from '../interfaces/booking.interface';

export const WEEKDAYS_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const TIME_SLOTS = Array.from({ length: 16 }, (_, index) => `${String(index + 7).padStart(2, '0')}:00`);

export const buildCalendarDay = (date: Date, todayKey: string): BookingCalendarDay => ({
    date,
    key: dateKey(date),
    dayNumber: date.getDate(),
    weekday: WEEKDAYS_SHORT[(date.getDay() + 6) % 7],
    isToday: dateKey(date) === todayKey,
});

export const buildWeekDays = (viewDate: Date, todayKey: string): BookingCalendarDay[] => {
    const start = startOfWeek(viewDate);
    return Array.from({ length: 7 }, (_, index) => buildCalendarDay(addDays(start, index), todayKey));
};

export const buildVisibleDays = (
    view: BookingCalendarView,
    viewDate: Date,
    weekDays: BookingCalendarDay[],
    todayKey: string,
): BookingCalendarDay[] => (view === 'day' ? [buildCalendarDay(viewDate, todayKey)] : weekDays);

export const buildMonthCells = (viewDate: Date, todayKey: string): BookingCalendarMonthCell[] => {
    const start = startOfWeek(startOfMonth(viewDate));

    return Array.from({ length: 42 }, (_, index) => {
        const date = addDays(start, index);
        return {
            ...buildCalendarDay(date, todayKey),
            inMonth: date.getMonth() === viewDate.getMonth(),
            isSelected: dateKey(date) === dateKey(viewDate),
        };
    });
};

export const buildPeriodLabel = (
    view: BookingCalendarView,
    viewDate: Date,
    weekDays: BookingCalendarDay[],
): string => {
    if (view === 'month') return formatMonthYear(viewDate);
    if (view === 'day') return formatLongDate(viewDate);
    return `${formatShortDate(weekDays[0].date)} – ${formatShortDate(weekDays[6].date)}`;
};
