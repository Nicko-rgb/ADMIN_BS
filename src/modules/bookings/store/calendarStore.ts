import { create } from 'zustand';
import CompanyService from '../../companys/service/companyService';
import { handleApiError } from '../../../shared/utils/errorHandler';
import { addDays, addMonths } from '../../../shared/utils/formatDate';
import type { CompanyBranchTree } from '../../companys/interfaces/company.interface';
import type { BookingCalendarView } from '../interfaces/booking.interface';

export type CalendarTreeStatus = 'idle' | 'loading' | 'ready' | 'error';

interface CalendarStoreState {
    /** Árbol empresa → sucursales → espacios de la sucursal activa. */
    tree: CompanyBranchTree | null;
    treeStatus: CalendarTreeStatus;
    treeError: string | null;
    /** Última sucursal solicitada, para descartar respuestas viejas. */
    requestedSucursal: string | null;

    /** Selección explícita del usuario; null = usar la sucursal de la URL. */
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

/**
 * Estado global del calendario de reservas. Vive fuera de React para que la
 * página y el sidebar compartan árbol, selección y navegación sin props.
 * Los datos derivados (días, celdas, etiquetas) se calculan en `useCalendar`.
 */
export const useCalendarStore = create<CalendarStoreState>((set, get) => ({
    tree: null,
    treeStatus: 'idle',
    treeError: null,
    requestedSucursal: null,

    branchId: null,
    spaceId: null,

    view: 'week',
    viewDate: new Date(),

    loadTree: async (sucursalPublicId, options) => {
        const state = get();
        const isSameRequest = state.requestedSucursal === sucursalPublicId;

        // Deduplica montajes simultáneos (página + sidebar) y visitas repetidas.
        if (!options?.force && isSameRequest && (state.treeStatus === 'loading' || state.treeStatus === 'ready')) return;

        set({
            requestedSucursal: sucursalPublicId,
            tree: isSameRequest ? state.tree : null,
            treeStatus: 'loading',
            treeError: null,
        });

        try {
            const tree = await CompanyService.getBranchTree(sucursalPublicId);
            if (get().requestedSucursal !== sucursalPublicId) return;
            set({ tree, treeStatus: 'ready', treeError: null });
        } catch (error) {
            if (get().requestedSucursal !== sucursalPublicId) return;
            set({ tree: null, treeStatus: 'error', treeError: handleApiError(error) });
        }
    },

    // Camino sin endpoint: el árbol sale del contexto de sesión.
    setTree: (tree, error = null) => set({
        tree,
        treeStatus: error ? 'error' : 'ready',
        treeError: error,
        requestedSucursal: null,
    }),

    selectBranch: (publicId) => set({ branchId: publicId, spaceId: null }),
    selectSpace: (publicId) => set({ spaceId: publicId }),
    setView: (view) => set({ view }),
    selectDay: (date) => set({ viewDate: date }),

    goPrev: () => set((state) => ({
        viewDate: state.view === 'month'
            ? addMonths(state.viewDate, -1)
            : addDays(state.viewDate, state.view === 'day' ? -1 : -7),
    })),
    goNext: () => set((state) => ({
        viewDate: state.view === 'month'
            ? addMonths(state.viewDate, 1)
            : addDays(state.viewDate, state.view === 'day' ? 1 : 7),
    })),
    goPrevMonth: () => set((state) => ({ viewDate: addMonths(state.viewDate, -1) })),
    goNextMonth: () => set((state) => ({ viewDate: addMonths(state.viewDate, 1) })),
    goToday: () => set({ viewDate: new Date() }),
}));
