import type { ReactNode } from 'react';
import type { CompanyBranchTree, CompanyTreeBranch, CompanyTreeSpace } from '../../companys/interfaces/company.interface';

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

/** Respuesta remota del árbol, atada a la clave de la petición que la originó. */
export interface BookingCalendarRemoteTree {
    key: string;
    tree: CompanyBranchTree | null;
    error: string | null;
}

/* ── Props de componentes del calendario ──────────────────────────────────── */

export interface BookingTimeGridProps {
    view: BookingCalendarView;
    days: BookingCalendarDay[];
    slots: string[];
    spaceName: string | null;
}

export interface BookingMonthGridProps {
    monthDays: string[];
    cells: BookingCalendarMonthCell[];
    onSelect: (date: Date) => void;
}

export interface BookingStateCardProps {
    icon: ReactNode;
    title: string;
    message: string;
    children?: ReactNode;
}

/* ── Sidebar ──────────────────────────────────────────────────────────────── */

export interface BookingMiniCalendarProps {
    monthLabel: string;
    monthDays: string[];
    cells: BookingCalendarMonthCell[];
    onPrev: () => void;
    onNext: () => void;
    onSelect: (date: Date) => void;
}

export interface BookingSidebarProps {
    companyName: string | null;
    branches: CompanyTreeBranch[];
    spaces: CompanyTreeSpace[];
    selectedBranchId: string | null;
    selectedSpaceId: string | null;
    onSelectBranch: (publicId: string) => void;
    onSelectSpace: (publicId: string) => void;
    returnTo: string;
    monthLabel: string;
    monthDays: string[];
    monthCells: BookingCalendarMonthCell[];
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onSelectDay: (date: Date) => void;
}
