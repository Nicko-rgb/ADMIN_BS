import {
    AlertCircle, Building2, Calendar, CalendarPlus, ChevronLeft, ChevronRight,
    Dumbbell, LoaderCircle, Plus, RefreshCw, Store,
    TimerOff,
} from 'lucide-react';
import { useState } from 'react';
import { usePageHeader } from '../../../shared/store/headerStore';
import { usePermission } from '../../../shared/hooks/usePermission';
import toast from '../../../shared/utils/toast';
import { BookingDetail } from '../components/BookingDetail';
import { CreateBooking } from '../components/CreateBooking';
import { MonthView } from '../components/MonthView';
import { Sidebar } from '../components/Sidebar';
import { WeekView } from '../components/WeekView';
import useCalendar from '../hooks/useCalendar';
import type { BookingCalendarViewOption } from '../interfaces/booking.interface';
import type { BookingData, CreateBookingContext } from '../interfaces/createBooking.interface';
import '../styles/bookingColors.css';
import '../styles/Bookings.css';

const VIEW_OPTIONS: BookingCalendarViewOption[] = [
    { value: 'day', label: 'Día' },
    { value: 'week', label: 'Semana' },
    { value: 'month', label: 'Mes' },
];

/**
 * Página del calendario de reservas. Todo lo que muestra sale del árbol público
 * de la sucursal (empresa → sucursales → espacios, con `access` y ventana
 * horaria); no se consulta el contexto de empresas del login.
 */
const Bookings = () => {
    const [createBookingContext, setCreateBookingContext] = useState<CreateBookingContext | null>(null);
    // Reserva abierta en el detalle (estado de cobro + registrar el saldo).
    const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
    const can = usePermission();
    const hasBookingPermissions = ['booking.create', 'booking.view', 'booking.confirm', 'payment.create', 'user.client_manage']
        .every((permission) => can(permission));
    const {
        company, selectedBranch, selectedSpace,
        isTreeLoading, treeError, selectBranch, selectSpace,
        view, setView, periodLabel, visibleDays, monthDays, monthCells, timeSlots,
        scheduleDurationHours, scheduleStart, scheduleEnd,
        hasBranchWindow, hasSpaces, hasSpaceHours,
        loadingMessage, errorMessage, errorRetry,
        bookingsByDate, bookingsCount, reloadBookings,
        goPrev, goNext, goToday, monthLabel, goPrevMonth, goNextMonth, selectDay,
    } = useCalendar();

    // Motivo por el que no se puede abrir "Nueva reserva", en orden de
    // dependencia: permisos → carga/error → sucursal → espacios → horarios.
    // Se devuelve el primero para mostrar un único mensaje en el toast.
    const bookingBlocker = (): { message: string; kind: 'info' | 'warning' | 'error' | 'loading' } | null => {
        if (!hasBookingPermissions) return { message: 'No tienes permisos para registrar reservas.', kind: 'error' };
        if (loadingMessage) return { message: loadingMessage, kind: 'loading' };
        if (errorMessage) return { message: errorMessage, kind: 'error' };
        if (!selectedBranch) return { message: 'No hay una sucursal seleccionada.', kind: 'warning' };
        if (!hasSpaces) return { message: 'La sucursal no tiene espacios disponibles.', kind: 'warning' };
        if (!hasBranchWindow) return { message: 'La sucursal no tiene horario configurado', kind: 'warning' };
        if (!hasSpaceHours) return { message: 'Sin bloques de horarios configurados.', kind: 'warning' };
        return null;
    };

    // `initialDate` vacío = formulario limpio (botón "Nueva reserva"). Un clic
    // en la grilla pasa fecha y rango horario ya resueltos. Si falta algo, el
    // toast lo explica y el modal no se abre.
    const openCreateBooking = (initialDate = '', initialStartTime = '', initialEndTime = '') => {
        const blocker = bookingBlocker();
        if (blocker) {
            toast[blocker.kind](blocker.message);
            return;
        }
        if (!selectedSpace || !selectedBranch) return;
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
        documentTitle: 'Calendario de Reservas',
        breadcrumbs: [
            { label: 'Reservas', path: '/bookings' },
            { label: isTreeLoading ? 'Cargando...' : company?.name || '-' },
        ],
        extra: <div className='header_global_extra'>
            <button type="button" className="booking_calendar_add_button" aria-label="Agregar reserva" onClick={() => openCreateBooking()}>
                <Plus size={17} />
            </button>
        </div>
    });

    return (
        <div className='booking_calendar'>
            <Sidebar
                company={company}
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
                            >
                                <CalendarPlus size={16} /> Nueva reserva
                            </button>
                        </div>
                    </aside>

                    <aside className="toolbar_bottom">
                        <div className="context_chips" aria-busy={!!loadingMessage}>
                            {errorMessage ? (
                                <div className="context_placeholder is_error" role="alert">
                                    <AlertCircle size={15} aria-hidden="true" />
                                    <span>{errorMessage}</span>
                                    <button type="button" className="context_retry" onClick={errorRetry}>
                                        <RefreshCw size={13} aria-hidden="true" /> Reintentar
                                    </button>
                                </div>
                            ) : loadingMessage ? (
                                <div className="context_placeholder" role="status">
                                    <LoaderCircle size={15} className="context_spinner" aria-hidden="true" />
                                    <span>{loadingMessage}</span>
                                </div>
                            ) : (
                                <>
                                    {company && (
                                        <span className="chips"><Building2 size={15} />{company.name}</span>
                                    )}
                                    {selectedBranch && (
                                        <span className="chips"><Store size={15} />{selectedBranch.name}</span>
                                    )}
                                    {selectedSpace && (
                                        <span className="chips"><Dumbbell size={15} />{selectedSpace.name}</span>
                                    )}
                                    {selectedBranch && !hasSpaces && (
                                        <span className="chips is_warning"><AlertCircle size={15} />Sin espacios</span>
                                    )}
                                    {selectedBranch && !hasBranchWindow && (
                                        <span className="chips is_warning"><TimerOff size={15} />Sin horario</span>
                                    )}
                                    {selectedSpace && !hasSpaceHours && (
                                        <span className="chips is_warning"><TimerOff size={15} />Sin bloques</span>
                                    )}
                                    <span className={`chips count_bookings`} role="status">
                                        <Calendar size={15} /> {bookingsCount === 0 ? '0 reservas' : `${bookingsCount} ${bookingsCount === 1 ? 'reserva' : 'reservas'}`}
                                    </span>
                                </>
                            )}
                        </div>
                    </aside>
                </header>

                <main className="calendar_box" aria-busy={!!loadingMessage}>
                    {view === 'month' ? (
                        <MonthView
                            monthDays={monthDays}
                            monthCells={monthCells}
                            bookingsByDate={bookingsByDate}
                            onSelectDay={selectDay}
                            onSelectBooking={setSelectedBooking}
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
                            onSelectBooking={setSelectedBooking}
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

            {selectedBooking && (
                <BookingDetail
                    booking={selectedBooking}
                    spaceName={selectedSpace?.name ?? ''}
                    branchName={selectedBranch?.name ?? ''}
                    onClose={() => setSelectedBooking(null)}
                />
            )}
        </div>
    );
};

export default Bookings;
