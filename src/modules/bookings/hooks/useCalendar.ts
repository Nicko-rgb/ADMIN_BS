import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { dateKey, formatMonthYear } from '../../../shared/utils/formatDate';
import { useCalendarStore } from '../store/calendarStore';
import { useCalendarHoursStore } from '../store/calendarHoursStore';
import { buildCalendarSchedule, CALENDAR_WEEKDAYS } from '../utils/businessHours';
import { useBooking } from './useBooking';
import { positionDayBookings, visibleBookingRange } from '../utils/calendarBookings';
import { WEEKDAYS_SHORT, buildMonthCells, buildPeriodLabel, buildVisibleDays, buildWeekDays } from '../utils/calendar';
import type { CompanyTreeBranch, CompanyTreeCompany, CompanyTreeSpace } from '../../companys/interfaces/company.interface';

const EMPTY_COMPANIES: CompanyTreeCompany[] = [];
const EMPTY_BRANCHES: CompanyTreeBranch[] = [];
const EMPTY_SPACES: CompanyTreeSpace[] = [];

/**
 * Calendario de reservas: el árbol público (empresa → sucursales → espacios
 * con apertura/cierre y `access`) es la única fuente de datos. La grilla y la
 * selección se derivan del estado global de la store.
 */
const useCalendar = () => {
    const { sucursalPublicId } = useParams<{ sucursalPublicId: string }>();
    const navigate = useNavigate();

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

    // Si la sucursal pedida ya está en el árbol cargado (mismo tenant), el
    // árbol no está viejo aunque `requestedSucursal` todavía no se actualice.
    const treeHasRequestedBranch = !!sucursalPublicId
        && (tree?.companies?.some((item) => item.sucursales?.some((branch) => branch.publicId === sucursalPublicId)) ?? false);

    // Mientras la respuesta de otra sucursal está en vuelo no se muestra el árbol viejo.
    const isStaleTree = !!sucursalPublicId
        && requestedSucursal !== sucursalPublicId
        && !treeHasRequestedBranch;
    const currentCompanies = isStaleTree ? EMPTY_COMPANIES : (tree?.companies ?? EMPTY_COMPANIES);
    const isTreeLoading = treeStatus === 'idle' || treeStatus === 'loading' || isStaleTree;

    // El árbol trae todas las empresas del tenant; la sucursal de la URL decide
    // con cuál se trabaja y las hermanas quedan fuera de la vista.
    const company = useMemo(
        () => currentCompanies.find((item) => item.sucursales?.some((branch) => branch.publicId === sucursalPublicId)) ?? null,
        [currentCompanies, sucursalPublicId],
    );
    const allBranches = company?.sucursales ?? EMPTY_BRANCHES;

    // El `access` de cada nodo lo calcula el backend en esta misma respuesta
    // (`hasCompanyScope` sobre los company_ids del token), así que es la fuente
    // fresca. No se vuelve a comparar contra el contexto guardado en el login:
    // eso duplicaba la regla y podía quedar desactualizado.
    const branches = useMemo(
        () => allBranches.filter((branch) => branch.access),
        [allBranches],
    );

    const urlBranch = sucursalPublicId
        ? allBranches.find((branch) => branch.publicId === sucursalPublicId) ?? null
        : null;

    // La sucursal de la URL no se reemplaza por otra: o se abre, o se explica.
    const accessError = !isTreeLoading && !!urlBranch && !urlBranch.access
        ? 'No tienes acceso a esta sucursal.'
        : null;
    // Hay sucursal en la URL pero ninguna empresa del árbol la contiene.
    const branchNotFoundError = !isTreeLoading && !!sucursalPublicId && !urlBranch
        ? 'La sucursal no pertenece a ninguna de tus empresas.'
        : null;
    const treeError = accessError ?? branchNotFoundError ?? storeTreeError;

    // La sucursal de la URL manda; si no hay sucursal en la URL se cae a la
    // selección guardada y, por último, a la primera accesible.
    const selectedBranch = useMemo(() => {
        if (!company || accessError) return null;
        const wanted = sucursalPublicId ?? branchId;
        return branches.find((branch) => branch.publicId === wanted)
            ?? branches.find((branch) => branch.publicId === branchId)
            ?? branches[0]
            ?? null;
    }, [company, accessError, branches, sucursalPublicId, branchId]);

    // Los espacios heredan el acceso de la sucursal en el backend; se respeta.
    const spaces = useMemo(
        () => (selectedBranch?.spaces ?? EMPTY_SPACES).filter((space) => space.access),
        [selectedBranch],
    );

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

    const todayKey = dateKey(new Date());
    const weekDays = useMemo(() => buildWeekDays(viewDate, todayKey), [viewDate, todayKey]);
    const baseDays = useMemo(() => buildVisibleDays(view, viewDate, weekDays, todayKey), [view, viewDate, weekDays, todayKey]);
    const monthCells = useMemo(() => buildMonthCells(viewDate, todayKey), [viewDate, todayKey]);
    const bookingRange = useMemo(
        () => visibleBookingRange(view, baseDays, monthCells),
        [view, baseDays, monthCells],
    );
    const {
        bookingsByDate,
        ranges: bookingRanges,
        count: bookingsCount,
        isBookingsLoading,
        error: bookingsError,
        reloadBookings,
    } = useBooking(selectedSpaceId, bookingRange);

    useEffect(() => {
        void loadHours(selectedSpaceId);
    }, [loadHours, selectedSpaceId]);

    const hoursMatchSpace = selectedSpaceId !== null && hoursSpaceId === selectedSpaceId;
    const isHoursLoading = selectedSpaceId !== null && (!hoursMatchSpace || hoursStatus === 'idle' || hoursStatus === 'loading');
    // La grilla va de apertura a cierre de la sucursal; sin ventana ni horarios
    // se usa un rango fallback para que el calendario siempre se muestre.
    const schedule = useMemo(() => buildCalendarSchedule(
        hoursMatchSpace && hoursStatus === 'ready' ? hours : [],
        {
            openingTime: selectedBranch?.openTime ?? null,
            closingTime: selectedBranch?.closeTime ?? null,
        },
        bookingRanges,
    ), [hours, hoursMatchSpace, hoursStatus, selectedBranch, bookingRanges]);
    const retryHours = useCallback(() => { void loadHours(selectedSpaceId, true); }, [loadHours, selectedSpaceId]);

    const visibleDays = useMemo(
        () => baseDays.map((day) => ({
            ...day,
            closedRanges: schedule.closedByDay[CALENDAR_WEEKDAYS[day.date.getDay()]] ?? [],
            bookings: positionDayBookings(bookingsByDate[day.key] ?? [], schedule),
        })),
        [baseDays, schedule, bookingsByDate],
    );
    const monthLabel = useMemo(() => formatMonthYear(viewDate), [viewDate]);
    const periodLabel = useMemo(
        () => buildPeriodLabel(view, viewDate, weekDays),
        [view, viewDate, weekDays],
    );

    // La grilla siempre tiene eje (fallback 08:00–22:00) y siempre genera filas,
    // así que los avisos no pueden mirar `scheduleStart`/`timeSlots`: se evalúa la
    // data real — ventana de la sucursal y bloques habilitados del espacio.
    const hasSpaces = spaces.length > 0;
    const hasBranchWindow = !!selectedBranch?.openTime && !!selectedBranch?.closeTime;
    const hasSpaceHours = selectedSpaceId !== null
        && hoursMatchSpace
        && hoursStatus === 'ready'
        && hours.some((hour) => !hour.isClosed);

    // Flujo de la página: árbol → horarios → reservas. Se muestra una sola etapa
    // a la vez: el primer error (con su reintento) o, si no hay errores, el
    // mensaje de la etapa pendiente más temprana. Los textos de error ya vienen
    // resueltos por `handleApiError`, acá no se interpretan.
    const hoursErrorCurrent = hoursMatchSpace ? hoursError : null;
    const errorMessage = treeError ?? hoursErrorCurrent ?? bookingsError;
    const errorRetry = treeError ? retry : hoursErrorCurrent ? retryHours : reloadBookings;
    const loadingMessage = errorMessage
        ? null
        : isTreeLoading
            ? 'Cargando empresas y sucursales…'
            : isHoursLoading
                ? 'Cargando horarios…'
                : isBookingsLoading
                    ? 'Cargando reservas…'
                    : null;

    // Cambiar de sucursal navega a la URL de esa sucursal: el enlace queda
    // compartible y atrás/adelante funcionan. El store se sincroniza con la URL.
    const selectBranch = useCallback((publicId: string) => {
        if (publicId !== sucursalPublicId) {
            navigate(`/bookings/branch/${encodeURIComponent(publicId)}`);
        }
    }, [navigate, sucursalPublicId]);

    return {
        company,
        selectedBranch,
        selectedSpace,
        isTreeLoading,
        treeError,
        loadingMessage,
        errorMessage,
        errorRetry,
        selectBranch,
        selectSpace,
        view,
        setView,
        viewDate,
        monthLabel,
        periodLabel,
        visibleDays,
        monthDays: WEEKDAYS_SHORT,
        monthCells,
        timeSlots: schedule.slots,
        scheduleStart: schedule.start,
        scheduleEnd: schedule.end,
        scheduleDurationHours: (schedule.end - schedule.start) / 60,
        hasBranchWindow,
        hasSpaces,
        hasSpaceHours,
        bookingsByDate,
        bookingsCount,
        reloadBookings,
        goPrev,
        goNext,
        goPrevMonth,
        goNextMonth,
        goToday,
        selectDay,
    };
};

export default useCalendar;
