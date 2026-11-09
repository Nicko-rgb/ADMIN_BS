import {
    AlertCircle, Building2, Calendar, CalendarPlus, ChevronLeft, ChevronRight,
    Dumbbell, LoaderCircle, Plus, RefreshCw, Store,
} from 'lucide-react';
import { useState } from 'react';
import { usePageHeader } from '../../../shared/store/headerStore';
import { usePermission } from '../../../shared/hooks/usePermission';
import { CreateBooking } from '../components/CreateBooking';
import { MonthView } from '../components/MonthView';
import { Sidebar } from '../components/Sidebar';
import { WeekView } from '../components/WeekView';
import useCalendar from '../hooks/useCalendar';
import type { BookingCalendarViewOption, CalendarNotice } from '../interfaces/booking.interface';
import type { CreateBookingContext } from '../interfaces/createBooking.interface';
import '../styles/bookingColors.css';
import '../styles/Bookings.css';

const VIEW_OPTIONS: BookingCalendarViewOption[] = [
    { value: 'day', label: 'Día' },
    { value: 'week', label: 'Semana' },
    { value: 'month', label: 'Mes' },
];

/**
 * Página del calendario de reservas. Solo orquesta: los datos viven en los
 * stores, los hooks derivan la grilla y los componentes se encargan del render.
 */
const Bookings = () => {
    const [createBookingContext, setCreateBookingContext] = useState<CreateBookingContext | null>(null);
    const can = usePermission();
    const hasBookingPermissions = ['booking.create', 'booking.view', 'booking.confirm', 'payment.create', 'user.client_manage']
        .every((permission) => can(permission));
    const {
        company, branches, spaces, selectedBranch, selectedSpace,
        isTreeLoading, treeError, retry, selectBranch, selectSpace,
        view, setView, periodLabel, visibleDays, monthDays, monthCells, timeSlots,
        scheduleDurationHours, scheduleStart, scheduleEnd, isHoursLoading, hoursError, retryHours,
        bookingsByDate, bookingsCount, isBookingsLoading, bookingsError, reloadBookings,
        goPrev, goNext, goToday, monthLabel, goPrevMonth, goNextMonth, selectDay,
    } = useCalendar();

    const canCreateBooking = hasBookingPermissions && !isTreeLoading && !!selectedSpace;

    // Estado global del calendario, en orden de dependencia: árbol → horarios →
    // reservas. Abajo se muestra un loading a la vez y todos los errores.
    const notices: CalendarNotice[] = [
        { key: 'tree', label: 'Empresa y sucursal', loading: isTreeLoading, loadingText: 'Cargando árbol…', error: treeError, retry },
        { key: 'hours', label: 'Horarios', loading: isHoursLoading, loadingText: 'Cargando horarios…', error: hoursError, retry: retryHours },
        { key: 'bookings', label: 'Reservas', loading: isBookingsLoading, loadingText: 'Cargando reservas…', error: bookingsError, retry: reloadBookings },
    ];
    const noticeErrors = notices.filter((notice) => notice.error);
    const activeLoading = notices.find((notice) => notice.loading);
    const hasNotices = noticeErrors.length > 0 || !!activeLoading;
    const companyName = company?.name ?? null;
    const branchName = selectedBranch?.name ?? null;
    const spaceName = selectedSpace?.name ?? null;

    // `initialDate` vacío = formulario limpio (botón "Nueva reserva"). Un clic
    // en la grilla pasa fecha y rango horario ya resueltos.
    const openCreateBooking = (initialDate = '', initialStartTime = '', initialEndTime = '') => {
        if (!canCreateBooking || !selectedSpace || !selectedBranch) return;
        setCreateBookingContext({
            spacePublicId: selectedSpace.publicId,
            spaceName: selectedSpace.name,
            branchName: selectedBranch.name,
            initialDate: initialDate || undefined,
            initialStartTime: initialStartTime || undefined,
            initialEndTime: initialEndTime || undefined,
        });
    };

    

    usePageHeader({
        visible: true,
        title: 'Hola',
        showCard: false,
        breadcrumbs: [
            { label: 'Reservas', path: '/bookings' },
            { label: isTreeLoading ? 'Cargando...' : company?.name || '-' },
        ],
        extra: <div className='header_global_extra'>
            <button type="button" className="booking_calendar_add_button" aria-label="Agregar reserva" onClick={() => openCreateBooking()} disabled={!canCreateBooking}>
                <Plus size={17} />
            </button>
        </div>
    });

    return (
        <div className='booking_calendar'>
            <Sidebar
                companyName={companyName}
                branches={branches}
                spaces={spaces}
                selectedBranchId={selectedBranch?.publicId ?? null}
                selectedSpaceId={selectedSpace?.publicId ?? null}
                isTreeLoading={isTreeLoading}
                treeError={treeError}
                onSelectBranch={selectBranch}
                onSelectSpace={selectSpace}
                monthLabel={monthLabel}
                monthDays={monthDays}
                monthCells={monthCells}
                onPrevMonth={goPrevMonth}
                onNextMonth={goNextMonth}
                onSelectDay={selectDay}
            />

            <div className="calendar_main">
                <header className="toolbar">
                    <aside className='toolbar_top'>
                        <div className="period">
                            <button type="button" className="nav_button" onClick={goPrev} aria-label="Período anterior">
                                <ChevronLeft size={17} />
                            </button>
                            <button type="button" className="nav_button" onClick={goNext} aria-label="Período siguiente">
                                <ChevronRight size={17} />
                            </button>
                            <h1>{periodLabel}</h1>
                            <button type="button" className="today_button" onClick={goToday}>Hoy</button>
                        </div>

                        <div className="actions_right">
                            <div className="btns_views" role="group" aria-label="Vistas del calendario">
                                {VIEW_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className={view === option.value ? 'active' : ''}
                                        onClick={() => setView(option.value)}
                                        aria-pressed={view === option.value}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                            <button
                                type="button"
                                className="new_booking"
                                onClick={() => openCreateBooking()}
                                disabled={!canCreateBooking}
                            >
                                <CalendarPlus size={16} /> Nueva reserva
                            </button>
                        </div>
                    </aside>

                    <aside className="toolbar_bottom">
                        <div className="context_chips" aria-busy={notices.some((notice) => notice.loading)}>
                            {hasNotices ? (
                                <div className="context_notices" role="status" aria-live="polite">
                                    {noticeErrors.map((notice) => (
                                        <div key={notice.key} className="context_placeholder is_error" role="alert">
                                            <AlertCircle size={15} aria-hidden="true" />
                                            <strong>{notice.label}:</strong>
                                            <span>{notice.error}</span>
                                            <button type="button" className="context_retry" onClick={notice.retry}>
                                                <RefreshCw size={13} aria-hidden="true" /> Reintentar
                                            </button>
                                        </div>
                                    ))}
                                    {activeLoading && (
                                        <div className="context_placeholder" role="status">
                                            <LoaderCircle size={15} className="context_spinner" aria-hidden="true" />
                                            <span>{activeLoading.loadingText}</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <span className={`chips ${companyName ?? 'not_fount'}`}><Building2 size={15} /> {companyName ?? 'Sin empresa'}</span>
                                    <span className={`chips ${branchName ?? 'not_fount'}`}><Store size={15} /> {branchName ?? 'Sin sucursal'}</span>
                                    <span className={`chips ${spaceName ?? 'not_fount'}`}><Dumbbell size={15} /> {spaceName ?? 'Sin espacio'}</span>
                                    <span className={`chips count_bookings`} role="status">
                                        <Calendar size={15} /> {bookingsCount === 0 ? '0 reservas' : `${bookingsCount} ${bookingsCount === 1 ? 'reserva' : 'reservas'}`}
                                    </span>
                                </>
                            )}
                        </div>
                    </aside>
                </header>

                <main className="calendar_box" aria-busy={isTreeLoading || isBookingsLoading || isHoursLoading}>
                    {view === 'month' ? (
                        <MonthView
                            monthDays={monthDays}
                            monthCells={monthCells}
                            bookingsByDate={bookingsByDate}
                            onSelectDay={selectDay}
                        />
                    ) : (
                        <WeekView
                            view={view === 'day' ? 'day' : 'week'}
                            days={visibleDays}
                            timeSlots={timeSlots}
                            scheduleStart={scheduleStart}
                            scheduleEnd={scheduleEnd}
                            scheduleDurationHours={scheduleDurationHours}
                            onSelectSlot={openCreateBooking}
                        />
                    )}
                </main>
            </div>

            {createBookingContext && (
                <CreateBooking
                    {...createBookingContext}
                    onClose={() => setCreateBookingContext(null)}
                    onCreated={reloadBookings}
                />
            )}
        </div>
    );
};

export default Bookings;
