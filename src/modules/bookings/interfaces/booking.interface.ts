/* ── Calendario ───────────────────────────────────────────────────────────── */

export type BookingCalendarView = 'day' | 'week' | 'month';

export interface BookingCalendarViewOption {
    value: BookingCalendarView;
    label: string;
}

export interface BookingCalendarDay {
    date: Date;
    key: string;
    dayNumber: number;
    weekday: string;
    isToday: boolean;
}

export interface BookingCalendarMonthCell extends BookingCalendarDay {
    inMonth: boolean;
    isSelected: boolean;
}
