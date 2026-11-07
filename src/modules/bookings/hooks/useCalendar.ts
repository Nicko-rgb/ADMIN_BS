import { useCallback, useEffect, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useCompanyContextStore, useSessionStore } from '../../../shared/store/sessionStore';
import { dateKey, formatMonthYear } from '../../../shared/utils/formatDate';
import { useCalendarStore } from '../store/calendarStore';
import {
    TIME_SLOTS,
    WEEKDAYS_SHORT,
    buildMonthCells,
    buildPeriodLabel,
    buildVisibleDays,
    buildWeekDays,
} from '../utils/calendar';
import type { CompanyBranchTree, CompanyTreeBranch, CompanyTreeSpace } from '../../companys/interfaces/company.interface';
import type { ContextCompany } from '../../../shared/interfaces/session.interface';

const EMPTY_BRANCHES: CompanyTreeBranch[] = [];
const EMPTY_SPACES: CompanyTreeSpace[] = [];

// Horario temporal de la vista semanal; se reemplazará por el de la sucursal.
const OPENING_HOUR = 10;
const CLOSING_HOUR = 22;

/**
 * Para usuarios con asignación a empresa/sucursal el árbol ya viene en el
 * contexto de sesión; solo se copian los nodos con `access === true`.
 */
const treeFromContext = (companies: ContextCompany[], sucursalPublicId: string): CompanyBranchTree | null => {
    const company = companies.find((item) =>
        item.access && item.sucursales.some((branch) => branch.publicId === sucursalPublicId && branch.access));

    if (!company) return null;

    return {
        company: { publicId: company.publicId, name: company.name },
        branches: company.sucursales
            .filter((branch) => branch.access)
            .map((branch) => ({
                publicId: branch.publicId,
                name: branch.name,
                spaces: branch.spaces
                    .filter((space) => space.access)
                    .map((space) => ({ publicId: space.publicId, name: space.name })),
            })),
    };
};

const resolveReturnTo = (state: unknown): string => {
    const returnTo = (state as { returnTo?: unknown } | null)?.returnTo;
    return typeof returnTo === 'string' && (returnTo === '/bookings' || returnTo.startsWith('/bookings?'))
        ? returnTo
        : '/bookings';
};

/**
 * Calendario de reservas: sincroniza el árbol de sucursales/espacios con el
 * origen que corresponda (endpoint para system, contexto de sesión para el
 * resto) y deriva la grilla de días desde el estado global de la store.
 */
const useCalendar = () => {
    const { sucursalPublicId } = useParams<{ sucursalPublicId: string }>();
    const location = useLocation();
    const scopeLevel = useSessionStore((state) => state.scopeLevel);
    const companies = useCompanyContextStore((state) => state.companies);
    const isSystem = scopeLevel === 1;

    const tree = useCalendarStore((state) => state.tree);
    const treeStatus = useCalendarStore((state) => state.treeStatus);
    const treeError = useCalendarStore((state) => state.treeError);
    const requestedSucursal = useCalendarStore((state) => state.requestedSucursal);
    const branchId = useCalendarStore((state) => state.branchId);
    const spaceId = useCalendarStore((state) => state.spaceId);
    const view = useCalendarStore((state) => state.view);
    const viewDate = useCalendarStore((state) => state.viewDate);
    const loadTree = useCalendarStore((state) => state.loadTree);
    const setTree = useCalendarStore((state) => state.setTree);
    const selectBranch = useCalendarStore((state) => state.selectBranch);
    const selectSpace = useCalendarStore((state) => state.selectSpace);
    const setView = useCalendarStore((state) => state.setView);
    const selectDay = useCalendarStore((state) => state.selectDay);
    const goPrev = useCalendarStore((state) => state.goPrev);
    const goNext = useCalendarStore((state) => state.goNext);
    const goPrevMonth = useCalendarStore((state) => state.goPrevMonth);
    const goNextMonth = useCalendarStore((state) => state.goNextMonth);
    const goToday = useCalendarStore((state) => state.goToday);

    const syncTree = useCallback(() => {
        if (!sucursalPublicId) {
            setTree(null, 'Sucursal no encontrada.');
            return;
        }

        if (isSystem) {
            void loadTree(sucursalPublicId);
            return;
        }

        const contextTree = treeFromContext(companies, sucursalPublicId);
        setTree(contextTree, contextTree ? null : 'No tenés acceso a esta sucursal.');
    }, [sucursalPublicId, isSystem, companies, loadTree, setTree]);

    useEffect(() => {
        syncTree();
    }, [syncTree]);

    const retry = useCallback(() => {
        if (!sucursalPublicId) return;

        if (isSystem) {
            void loadTree(sucursalPublicId, { force: true });
            return;
        }

        const contextTree = treeFromContext(companies, sucursalPublicId);
        setTree(contextTree, contextTree ? null : 'No tenés acceso a esta sucursal.');
    }, [sucursalPublicId, isSystem, companies, loadTree, setTree]);

    // Mientras la respuesta de otra sucursal está en vuelo no se muestra el árbol viejo.
    const isStaleTree = isSystem && !!sucursalPublicId && requestedSucursal !== sucursalPublicId;
    const currentTree = isStaleTree ? null : tree;
    const isTreeLoading = treeStatus === 'idle' || treeStatus === 'loading' || isStaleTree;

    const company = currentTree?.company ?? null;
    const branches = currentTree?.branches ?? EMPTY_BRANCHES;

    // Sin selección explícita válida se usa la primera sucursal disponible.
    const selectedBranch = useMemo(() => {
        if (!currentTree) return null;
        return currentTree.branches.find((branch) => branch.publicId === branchId)
            ?? currentTree.branches[0]
            ?? null;
    }, [currentTree, branchId]);

    const spaces = selectedBranch?.spaces ?? EMPTY_SPACES;
    const selectedSpace = useMemo(
        () => spaces.find((space) => space.publicId === spaceId) ?? spaces[0] ?? null,
        [spaces, spaceId],
    );

    const todayKey = dateKey(new Date());
    const weekDays = useMemo(() => buildWeekDays(viewDate, todayKey), [viewDate, todayKey]);
    const visibleDays = useMemo(
        () => buildVisibleDays(view, viewDate, weekDays, todayKey),
        [view, viewDate, weekDays, todayKey],
    );
    const monthCells = useMemo(() => buildMonthCells(viewDate, todayKey), [viewDate, todayKey]);
    const monthLabel = useMemo(() => formatMonthYear(viewDate), [viewDate]);
    const periodLabel = useMemo(
        () => buildPeriodLabel(view, viewDate, weekDays),
        [view, viewDate, weekDays],
    );
    const returnTo = useMemo(() => resolveReturnTo(location.state), [location.state]);
    const timeSlots = useMemo(() => view === 'week'
        ? Array.from({ length: CLOSING_HOUR - OPENING_HOUR }, (_, index) =>
            `${String(OPENING_HOUR + index).padStart(2, '0')}:00`)
        : TIME_SLOTS, [view]);

    return {
        company,
        branches,
        selectedBranch,
        spaces,
        selectedSpace,
        isTreeLoading,
        treeError,
        retry,
        selectBranch,
        selectSpace,
        view,
        setView,
        viewDate,
        monthLabel,
        periodLabel,
        weekDays,
        visibleDays,
        monthDays: WEEKDAYS_SHORT,
        monthCells,
        timeSlots,
        goPrev,
        goNext,
        goPrevMonth,
        goNextMonth,
        goToday,
        selectDay,
        returnTo,
    };
};

export default useCalendar;
