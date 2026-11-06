import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import CompanyService from '../../companys/service/companyService';
import { useCompanyContextStore, useSessionStore } from '../../../shared/store/sessionStore';
import { handleApiError } from '../../../shared/utils/errorHandler';
import type { CompanyBranchTree } from '../../companys/interfaces/company.interface';
import type { ContextCompany } from '../../../shared/interfaces/session.interface';
import type {
    BookingCalendarDay,
    BookingCalendarMonthCell,
    BookingCalendarRemoteTree,
    BookingCalendarView,
} from '../interfaces/booking.interface';

const WEEKDAYS_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const TIME_SLOTS = Array.from({ length: 16 }, (_, index) => `${String(index + 7).padStart(2, '0')}:00`);

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, days: number) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
};

const addMonths = (date: Date, months: number) => new Date(date.getFullYear(), date.getMonth() + months, 1);

const startOfWeek = (date: Date) => {
    const base = startOfDay(date);
    return addDays(base, -((base.getDay() + 6) % 7));
};

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const dateKey = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
};

const formatMonthLabel = (date: Date) => {
    const label = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
};

const buildDay = (date: Date, todayKey: string): BookingCalendarDay => ({
    date,
    key: dateKey(date),
    dayNumber: date.getDate(),
    weekday: WEEKDAYS_SHORT[(date.getDay() + 6) % 7],
    isToday: dateKey(date) === todayKey,
});

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

/**
 * Estado y datos del calendario de reservas: árbol de sucursales/espacios,
 * selección activa y navegación de fechas. El JSX queda únicamente en Bookings.tsx.
 */
const useBookingCalendar = (sucursalPublicId?: string) => {
    const scopeLevel = useSessionStore((state) => state.scopeLevel);
    const companies = useCompanyContextStore((state) => state.companies);
    const location = useLocation();
    const isSystem = scopeLevel === 1;

    // System: el endpoint resuelve la empresa de la sucursal pedida y devuelve
    // todas sus sucursales y espacios. Se guarda la respuesta junto a la clave
    // de la petición para derivar `isLoading` sin tocar estado dentro del effect.
    const [remote, setRemote] = useState<BookingCalendarRemoteTree | null>(null);
    const [reloadToken, setReloadToken] = useState(0);
    const requestKey = `${sucursalPublicId ?? ''}#${reloadToken}`;

    useEffect(() => {
        if (!isSystem || !sucursalPublicId) return;

        let active = true;
        CompanyService.getBranchTree(sucursalPublicId)
            .then((data) => { if (active) setRemote({ key: requestKey, tree: data, error: null }); })
            .catch((err) => {
                if (active) setRemote({ key: requestKey, tree: null, error: handleApiError(err) });
            });

        return () => { active = false; };
    }, [isSystem, sucursalPublicId, reloadToken, requestKey]);

    // Resto de usuarios: se usa el árbol de la sesión, sin llamar al endpoint.
    const contextTree = useMemo(
        () => (!isSystem && sucursalPublicId ? treeFromContext(companies, sucursalPublicId) : null),
        [isSystem, companies, sucursalPublicId],
    );

    const isRemotePending = isSystem && !!sucursalPublicId && remote?.key !== requestKey;
    const tree = isSystem ? (isRemotePending ? null : remote?.tree ?? null) : contextTree;
    const isLoading = isRemotePending;
    const error = !sucursalPublicId
        ? 'Sucursal no encontrada.'
        : isSystem
            ? (isRemotePending ? null : remote?.error ?? null)
            : contextTree ? null : 'No tenés acceso a esta sucursal.';

    // La selección explícita del usuario manda; si el nodo ya no existe se cae
    // a la sucursal de la URL y luego a la primera visible.
    const [branchSelection, setBranchSelection] = useState<string | null>(null);
    const [spaceSelection, setSpaceSelection] = useState<string | null>(null);

    const selectedBranch = useMemo(() => {
        if (!tree) return null;
        return tree.branches.find((branch) => branch.publicId === branchSelection)
            ?? tree.branches.find((branch) => branch.publicId === sucursalPublicId)
            ?? tree.branches[0]
            ?? null;
    }, [tree, branchSelection, sucursalPublicId]);

    const spaces = useMemo(() => selectedBranch?.spaces ?? [], [selectedBranch]);
    const selectedSpace = useMemo(
        () => spaces.find((space) => space.publicId === spaceSelection) ?? spaces[0] ?? null,
        [spaces, spaceSelection],
    );

    const [view, setView] = useState<BookingCalendarView>('week');
    const [viewDate, setViewDate] = useState(() => new Date());

    const goPrev = useCallback(() => {
        setViewDate((current) => view === 'month' ? addMonths(current, -1) : addDays(current, view === 'day' ? -1 : -7));
    }, [view]);

    const goNext = useCallback(() => {
        setViewDate((current) => view === 'month' ? addMonths(current, 1) : addDays(current, view === 'day' ? 1 : 7));
    }, [view]);

    const goPrevMonth = useCallback(() => setViewDate((current) => addMonths(current, -1)), []);
    const goNextMonth = useCallback(() => setViewDate((current) => addMonths(current, 1)), []);
    const goToday = useCallback(() => setViewDate(new Date()), []);
    const selectDay = useCallback((date: Date) => setViewDate(date), []);

    const todayKey = dateKey(new Date());

    const weekDays = useMemo(() => {
        const start = startOfWeek(viewDate);
        return Array.from({ length: 7 }, (_, index) => buildDay(addDays(start, index), todayKey));
    }, [viewDate, todayKey]);

    const visibleDays = useMemo(() => {
        if (view === 'day') return [buildDay(viewDate, todayKey)];
        return weekDays;
    }, [view, viewDate, weekDays, todayKey]);

    const monthCells = useMemo<BookingCalendarMonthCell[]>(() => {
        const start = startOfWeek(startOfMonth(viewDate));
        return Array.from({ length: 42 }, (_, index) => {
            const date = addDays(start, index);
            return {
                ...buildDay(date, todayKey),
                inMonth: date.getMonth() === viewDate.getMonth(),
                isSelected: dateKey(date) === dateKey(viewDate),
            };
        });
    }, [viewDate, todayKey]);

    const selectBranch = useCallback((publicId: string) => {
        setBranchSelection(publicId);
        setSpaceSelection(null);
    }, []);

    const selectSpace = useCallback((publicId: string) => setSpaceSelection(publicId), []);

    const retry = useCallback(() => setReloadToken((token) => token + 1), []);

    const state = location.state as { returnTo?: unknown } | null;
    const returnTo = typeof state?.returnTo === 'string'
        && (state.returnTo === '/bookings' || state.returnTo.startsWith('/bookings?'))
        ? state.returnTo
        : '/bookings';

    return {
        isSystem,
        company: tree?.company ?? null,
        branches: tree?.branches ?? [],
        selectedBranch,
        spaces,
        selectedSpace,
        selectBranch,
        selectSpace,
        isLoading,
        error,
        retry,
        returnTo,
        view,
        setView,
        viewDate,
        monthLabel: formatMonthLabel(viewDate),
        weekDays,
        visibleDays,
        monthDays: WEEKDAYS_SHORT,
        monthCells,
        timeSlots: TIME_SLOTS,
        goPrev,
        goNext,
        goPrevMonth,
        goNextMonth,
        goToday,
        selectDay,
    };
};

export default useBookingCalendar;
