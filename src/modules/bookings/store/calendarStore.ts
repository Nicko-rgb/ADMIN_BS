import { create } from 'zustand';
import CompanyService from '../../companys/service/companyService';
import { handleApiError } from '../../../shared/utils/errorHandler';
import { addDays, addMonths } from '../../../shared/utils/formatDate';
import type { CalendarStoreState } from '../interfaces/booking.interface';

/**
 * Estado global del calendario de reservas. Vive fuera de React para compartir
 * árbol, selección y navegación entre la página y sus componentes sin depender
 * de la jerarquía. Los datos derivados se calculan en `useCalendar`.
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
        // La sucursal pedida ya está en el árbol cargado (mismo tenant):
        // cambiar de sucursal no debe volver a pedir el árbol completo.
        const treeHasBranch = state.tree?.companies?.some((company) =>
            company.sucursales?.some((branch) => branch.publicId === sucursalPublicId)) ?? false;

        // Deduplica montajes simultáneos y visitas repetidas.
        if (!options?.force) {
            if (isSameRequest && (state.treeStatus === 'loading' || state.treeStatus === 'ready')) return;
            if (treeHasBranch) {
                set({ requestedSucursal: sucursalPublicId });
                return;
            }
        }

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

    // Árbol inyectado sin endpoint — sólo se usa para estados locales (sin URL).
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
