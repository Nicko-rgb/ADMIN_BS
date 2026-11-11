import type { CompanyBranchTree, CompanyTreeCompany } from '../../companys/interfaces/company.interface';
import type { BusinessHourData, HourDay } from '../../companys/interfaces/bussinesHour.interfece';
import type { BookingData } from './createBooking.interface';

/* ── Calendario ───────────────────────────────────────────────────────────── */

export type BookingCalendarView = 'day' | 'week' | 'month';

/** Rango de fechas locales (YYYY-MM-DD) que cubre la vista actual. */
export interface BookingDateRange {
    start_date: string;
    end_date: string;
}

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

/* ── Estado de los stores ─────────────────────────────────────────────────── */

export type CalendarLoadStatus = 'idle' | 'loading' | 'ready' | 'error';
export type CalendarTreeStatus = CalendarLoadStatus;

export interface CalendarStoreState {
    /** Árbol del tenant (todas las empresas, hermanas incluidas) que contiene la sucursal activa. */
    tree: CompanyBranchTree | null;
    treeStatus: CalendarTreeStatus;
    treeError: string | null;
    /** Última sucursal solicitada, para descartar respuestas viejas. */
    requestedSucursal: string | null;

    /** Selección explícita del usuario; null = usar la primera sucursal disponible. */
    branchId: string | null;
    spaceId: string | null;

    view: BookingCalendarView;
    viewDate: Date;

    loadTree: (sucursalPublicId: string, options?: { force?: boolean }) => Promise<void>;
    setTree: (tree: CompanyBranchTree | null, error?: string | null) => void;
    selectBranch: (publicId: string) => void;
    selectSpace: (publicId: string) => void;
    setView: (view: BookingCalendarView) => void;
    selectDay: (date: Date) => void;
    goPrev: () => void;
    goNext: () => void;
    goPrevMonth: () => void;
    goNextMonth: () => void;
    goToday: () => void;
}

export interface CalendarHoursState {
    spacePublicId: string | null;
    hours: BusinessHourData[];
    status: CalendarLoadStatus;
    error: string | null;
    loadHours: (spacePublicId: string | null, force?: boolean) => Promise<void>;
}

export interface BookingStoreState {
    /** Espacio y rango de la última petición de reservas iniciada. */
    spacePublicId: string | null;
    rangeKey: string | null;
    bookings: BookingData[];
    status: CalendarLoadStatus;
    error: string | null;

    loadBookings: (
        spacePublicId: string | null,
        range: BookingDateRange,
        options?: { force?: boolean },
    ) => Promise<void>;
    reloadBookings: () => Promise<void>;
    /** Actualización puntual preparada para un futuro canal en tiempo real. */
    upsertBooking: (booking: BookingData) => void;
    removeBooking: (bookingId: number) => void;
}

/* ── Grilla de horarios ───────────────────────────────────────────────────── */

export interface TimeRange {
    start: number;
    end: number;
}

export interface CalendarClosedRange extends TimeRange {
    top: number;
    height: number;
    label: string;
}

export interface CalendarSchedule {
    start: number;
    end: number;
    slots: (TimeRange & { label: string })[];
    closedByDay: Record<HourDay, CalendarClosedRange[]>;
}

/** Ventana operativa de la sucursal — eje de la grilla cuando está configurada. */
export interface CalendarBranchWindow {
    openingTime: string | null;
    closingTime: string | null;
}

/* ── Props de componentes ─────────────────────────────────────────────────── */

export interface BookingSidebarProps {
    company: CompanyTreeCompany | null;
    selectedBranchId: string | null;
    selectedSpaceId: string | null;
    isTreeLoading: boolean;
    treeError: string | null;
    onSelectBranch: (publicId: string) => void;
    onSelectSpace: (publicId: string) => void;
    monthLabel: string;
    monthDays: string[];
    monthCells: BookingCalendarMonthCell[];
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onSelectDay: (date: Date) => void;
}
