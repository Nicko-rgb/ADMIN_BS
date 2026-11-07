import { useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCompanyContextStore, useSessionStore } from '../../../shared/store/sessionStore';
import { dateKey, formatMonthYear } from '../../../shared/utils/formatDate';
import { useCalendarStore } from '../store/calendarStore';
import { useCalendarHoursStore } from '../store/calendarHoursStore';
import { buildCalendarSchedule, CALENDAR_WEEKDAYS } from '../utils/businessHours';
import {
    WEEKDAYS_SHORT,
    buildMonthCells,
    buildPeriodLabel,
    buildVisibleDays,
    buildWeekDays,
} from '../utils/calendar';
import type { CompanyTreeBranch, CompanyTreeSpace } from '../../companys/interfaces/company.interface';

const EMPTY_BRANCHES: CompanyTreeBranch[] = [];
const EMPTY_SPACES: CompanyTreeSpace[] = [];

const resolveReturnTo = (state: unknown): string => {
    const returnTo = (state as { returnTo?: unknown } | null)?.returnTo;
    return typeof returnTo === 'string' && (returnTo === '/bookings' || returnTo.startsWith('/bookings?'))
        ? returnTo
        : '/bookings';
};

/**
 * Calendario de reservas: el árbol público (empresa → sucursales → espacios
 * con apertura/cierre) es la única fuente de datos; el contexto de sesión solo
 * limita qué sucursales y espacios puede elegir cada usuario. La grilla se
 * deriva del estado global de la store.
 */
const useCalendar = () => {
    const { sucursalPublicId } = useParams<{ sucursalPublicId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const scopeLevel = useSessionStore((state) => state.scopeLevel);
    const companies = useCompanyContextStore((state) => state.companies);
    const isSystem = scopeLevel === 1;

    const tree = useCalendarStore((state) => state.tree);
    const treeStatus = useCalendarStore((state) => state.treeStatus);
    const storeTreeError = useCalendarStore((state) => state.treeError);
    const requestedSucursal = useCalendarStore((state) => state.requestedSucursal);
    const branchId = useCalendarStore((state) => state.branchId);
    const spaceId = useCalendarStore((state) => state.spaceId);
    const view = useCalendarStore((state) => state.view);
    const viewDate = useCalendarStore((state) => state.viewDate);
    const loadTree = useCalendarStore((state) => state.loadTree);
    const setTree = useCalendarStore((state) => state.setTree);
    const storeSelectBranch = useCalendarStore((state) => state.selectBranch);
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

        void loadTree(sucursalPublicId);
    }, [sucursalPublicId, loadTree, setTree]);

    useEffect(() => {
        syncTree();
    }, [syncTree]);

    // La URL es la fuente de verdad de la sucursal: al entrar por un enlace,
    // volver con atrás/adelante o cambiar de sucursal, el store se alinea.
    // Se lee el estado con `getState` para no reaccionar al `branchId` que el
    // propio selector actualiza antes de que el router refleje la nueva URL.
    useEffect(() => {
        if (!sucursalPublicId) return;
        if (useCalendarStore.getState().branchId === sucursalPublicId) return;
        storeSelectBranch(sucursalPublicId);
    }, [sucursalPublicId, storeSelectBranch]);

    const retry = useCallback(() => {
        if (!sucursalPublicId) return;
        void loadTree(sucursalPublicId, { force: true });
    }, [sucursalPublicId, loadTree]);

    // Si la sucursal pedida ya está en el árbol cargado (misma empresa), el
    // árbol no está viejo aunque `requestedSucursal` todavía no se actualice.
    const treeHasRequestedBranch = !!sucursalPublicId
        && (tree?.branches.some((branch) => branch.publicId === sucursalPublicId) ?? false);

    // Mientras la respuesta de otra sucursal está en vuelo no se muestra el árbol viejo.
    const isStaleTree = !!sucursalPublicId
        && requestedSucursal !== sucursalPublicId
        && !treeHasRequestedBranch;
    const currentTree = isStaleTree ? null : tree;
    const isTreeLoading = treeStatus === 'idle' || treeStatus === 'loading' || isStaleTree;

    const company = currentTree?.company ?? null;
    const allBranches = currentTree?.branches ?? EMPTY_BRANCHES;

    // El contexto de sesión solo decide qué puede elegir cada usuario; el árbol
    // público aporta nombres, espacios y la ventana horaria de cada sucursal.
    // `system` (scopeLevel 1) no tiene membresías y puede elegir todo.
    const access = useMemo(() => {
        if (isSystem) return null;

        const branches = new Set<string>();
        const spacesByBranch = new Map<string, Set<string>>();

        for (const companyContext of companies) {
            if (!companyContext.access) continue;
            for (const branch of companyContext.sucursales) {
                if (!branch.access) continue;
                branches.add(branch.publicId);
                spacesByBranch.set(
                    branch.publicId,
                    new Set(branch.spaces.filter((space) => space.access).map((space) => space.publicId)),
                );
            }
        }

        return { branches, spacesByBranch };
    }, [companies, isSystem]);

    const branches = useMemo(
        () => (access ? allBranches.filter((branch) => access.branches.has(branch.publicId)) : allBranches),
        [access, allBranches],
    );

    // Una sucursal de la URL que no está en el contexto del usuario no se
    // reemplaza por otra: se muestra el error de acceso.
    const hasUrlBranchAccess = !access || !sucursalPublicId || access.branches.has(sucursalPublicId);
    const accessError = !hasUrlBranchAccess && !isTreeLoading
        ? 'No tenés acceso a esta sucursal.'
        : null;
    const treeError = accessError ?? storeTreeError;

    // La sucursal de la URL manda; si no existe en el árbol se cae a la
    // selección guardada y, por último, a la primera disponible.
    const selectedBranch = useMemo(() => {
        if (!currentTree || !hasUrlBranchAccess) return null;
        const wanted = sucursalPublicId ?? branchId;
        return branches.find((branch) => branch.publicId === wanted)
            ?? branches.find((branch) => branch.publicId === branchId)
            ?? branches[0]
            ?? null;
    }, [currentTree, hasUrlBranchAccess, branches, sucursalPublicId, branchId]);

    const branchSpaces = selectedBranch?.spaces ?? EMPTY_SPACES;
    const spaces = useMemo(() => {
        if (!access || !selectedBranch) return branchSpaces;
        const allowed = access.spacesByBranch.get(selectedBranch.publicId);
        return branchSpaces.filter((space) => allowed?.has(space.publicId));
    }, [access, branchSpaces, selectedBranch]);

    const selectedSpace = useMemo(
        () => spaces.find((space) => space.publicId === spaceId) ?? spaces[0] ?? null,
        [spaces, spaceId],
    );

    const hours = useCalendarHoursStore((state) => state.hours);
    const hoursSpaceId = useCalendarHoursStore((state) => state.spacePublicId);
    const hoursStatus = useCalendarHoursStore((state) => state.status);
    const hoursError = useCalendarHoursStore((state) => state.error);
    const loadHours = useCalendarHoursStore((state) => state.loadHours);
    const selectedSpaceId = !isTreeLoading && !treeError ? selectedSpace?.publicId ?? null : null;

    useEffect(() => {
        void loadHours(selectedSpaceId);
    }, [loadHours, selectedSpaceId]);

    const hoursMatchSpace = selectedSpaceId !== null && hoursSpaceId === selectedSpaceId;
    const isHoursLoading = selectedSpaceId !== null && (!hoursMatchSpace || hoursStatus === 'idle' || hoursStatus === 'loading');
    // La grilla va de apertura a cierre de la sucursal; sin ventana configurada
    // se mantiene el rango que cubren los horarios del espacio.
    const schedule = useMemo(() => hoursMatchSpace && hoursStatus === 'ready'
        ? buildCalendarSchedule(hours, {
            openingTime: selectedBranch?.openingTime ?? null,
            closingTime: selectedBranch?.closingTime ?? null,
        })
        : null, [hours, hoursMatchSpace, hoursStatus, selectedBranch]);
    const hasConfiguredHours = hoursMatchSpace && hoursStatus === 'ready' && hours.length > 0;
    const retryHours = useCallback(() => { void loadHours(selectedSpaceId, true); }, [loadHours, selectedSpaceId]);

    const todayKey = dateKey(new Date());
    const weekDays = useMemo(() => buildWeekDays(viewDate, todayKey), [viewDate, todayKey]);
    const visibleDays = useMemo(
        () => buildVisibleDays(view, viewDate, weekDays, todayKey).map((day) => ({
            ...day,
            closedRanges: schedule?.closedByDay[CALENDAR_WEEKDAYS[day.date.getDay()]] ?? [],
        })),
        [view, viewDate, weekDays, todayKey, schedule],
    );
    const monthCells = useMemo(() => buildMonthCells(viewDate, todayKey), [viewDate, todayKey]);
    const monthLabel = useMemo(() => formatMonthYear(viewDate), [viewDate]);
    const periodLabel = useMemo(
        () => buildPeriodLabel(view, viewDate, weekDays),
        [view, viewDate, weekDays],
    );
    const returnTo = useMemo(() => resolveReturnTo(location.state), [location.state]);

    // Cambiar de sucursal navega a la URL de esa sucursal: el enlace queda
    // compartible y atrás/adelante funcionan. El store se sincroniza con la URL.
    const selectBranch = useCallback((publicId: string) => {
        if (publicId !== sucursalPublicId) {
            navigate(`/bookings/branch/${encodeURIComponent(publicId)}`);
        }
    }, [navigate, sucursalPublicId]);

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
        timeSlots: schedule?.slots ?? [],
        scheduleDurationHours: schedule ? (schedule.end - schedule.start) / 60 : 0,
        hasConfiguredHours,
        isHoursLoading,
        hoursError: hoursMatchSpace ? hoursError : null,
        retryHours,
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
