import { Link, useParams } from 'react-router-dom';
import {
    AlertCircle,
    ArrowLeft,
    Building2,
    CalendarPlus,
    ChevronLeft,
    ChevronRight,
    Clock,
    MapPin,
    Plus,
    RefreshCw,
} from 'lucide-react';
import { usePageHeader } from '../../../shared/store/headerStore';
import { Sidebar } from '../components/Sidebar';
import useBookingCalendar from '../hooks/useBookingCalendar';
import type {
    BookingCalendarViewOption,
    BookingMonthGridProps,
    BookingStateCardProps,
    BookingTimeGridProps,
} from '../interfaces/booking.interface';
import '../styles/bookingColors.css';
import '../styles/Bookings.css';

const VIEW_OPTIONS: BookingCalendarViewOption[] = [
    { value: 'day', label: 'Día' },
    { value: 'week', label: 'Semana' },
    { value: 'month', label: 'Mes' },
];

const shortDate = (date: Date) => date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
const longDate = (date: Date) => date.toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
});

/* ── Vistas del calendario ────────────────────────────────────────────────── */

const TimeGrid = ({ view, days, slots, spaceName }: BookingTimeGridProps) => (
    <div className="booking_calendar_timegrid">
        <div className={`booking_calendar_timegrid_head ${view === 'day' ? 'is_day' : 'is_week'}`}>
            <span />
            {days.map((day) => (
                <div key={day.key} className={`booking_calendar_day_head${day.isToday ? ' today' : ''}`}>
                    <span>{day.weekday}</span>
                    <strong>{day.dayNumber}</strong>
                </div>
            ))}
        </div>
        <div className="booking_calendar_timegrid_body">
            <div className="booking_calendar_timegrid_scroll">
                <div className={`booking_calendar_timegrid_content ${view === 'day' ? 'is_day' : 'is_week'}`}>
                    <div className="booking_calendar_time_labels">
                        {slots.map((slot) => <span key={slot}>{slot}</span>)}
                    </div>
                    {days.map((day) => (
                        <div key={day.key} className="booking_calendar_day_column" aria-hidden="true" />
                    ))}
                </div>
            </div>
            <div className="booking_calendar_timegrid_empty">
                <div className="booking_calendar_timegrid_empty_card">
                    <Clock size={20} />
                    <strong>Sin reservas por ahora</strong>
                    <p>
                        {spaceName
                            ? `Aún no hay reservas para ${spaceName} en este período.`
                            : 'Selecciona un espacio deportivo para empezar a ver su agenda.'}
                    </p>
                </div>
            </div>
        </div>
    </div>
);

const MonthGrid = ({ monthDays, cells, onSelect }: BookingMonthGridProps) => (
    <div className="booking_calendar_month_view">
        <div className="booking_calendar_month_weekdays" aria-hidden="true">
            {monthDays.map((day) => <span key={day}>{day}</span>)}
        </div>
        <div className="booking_calendar_month_days">
            {cells.map((cell) => (
                <button
                    key={cell.key}
                    type="button"
                    className={`booking_calendar_month_day${cell.inMonth ? '' : ' out'}${cell.isToday ? ' today' : ''}${cell.isSelected ? ' selected' : ''}`}
                    onClick={() => onSelect(cell.date)}
                    aria-label={cell.date.toLocaleDateString('es-ES', { dateStyle: 'full' })}
                    aria-current={cell.isToday ? 'date' : undefined}
                >
                    <span className="booking_calendar_month_num">{cell.dayNumber}</span>
                </button>
            ))}
        </div>
    </div>
);

/* ── Estados ──────────────────────────────────────────────────────────────── */

const StateCard = ({ icon, title, message, children }: BookingStateCardProps) => (
    <div className="booking_calendar_state">
        <div className="booking_calendar_state_card" role="status">
            <span className="booking_calendar_state_icon">{icon}</span>
            <h1>{title}</h1>
            <p>{message}</p>
            {children}
        </div>
    </div>
);

/* ── Página ───────────────────────────────────────────────────────────────── */

const Bookings = () => {
    const { sucursalPublicId } = useParams<{ sucursalPublicId: string }>();
    const calendar = useBookingCalendar(sucursalPublicId);

    usePageHeader({ visible: false });

    const {
        company, branches, selectedBranch, spaces, selectedSpace,
        selectBranch, selectSpace, isLoading, error, retry, returnTo,
        view, setView, viewDate, monthLabel, weekDays, visibleDays,
        monthDays, monthCells, timeSlots, goPrev, goNext, goPrevMonth,
        goNextMonth, goToday, selectDay,
    } = calendar;

    const periodLabel = view === 'month'
        ? monthLabel
        : view === 'day'
            ? longDate(viewDate)
            : `${shortDate(weekDays[0].date)} – ${shortDate(weekDays[6].date)}`;

    if (isLoading) {
        return (
            <main className="booking_calendar_page">
                <StateCard icon={<span className="booking_calendar_loader" />} title="Cargando calendario" message="Estamos preparando tus sucursales y espacios deportivos." />
            </main>
        );
    }

    if (error || !company) {
        return (
            <main className="booking_calendar_page">
                <StateCard
                    icon={<AlertCircle size={22} />}
                    title="No pudimos abrir el calendario"
                    message={error ?? 'No encontramos la sucursal solicitada.'}
                >
                    <div className="booking_calendar_state_actions">
                        <button type="button" className="booking_calendar_retry_button" onClick={retry}>
                            <RefreshCw size={15} /> Reintentar
                        </button>
                        <Link className="booking_calendar_link_button" to={returnTo}>
                            <ArrowLeft size={15} /> Volver a reservas
                        </Link>
                    </div>
                </StateCard>
            </main>
        );
    }

    return (
        <main className="booking_calendar_page">
            <div className="booking_calendar_shell">
                <Sidebar
                    companyName={company.name}
                    branches={branches}
                    spaces={spaces}
                    selectedBranchId={selectedBranch?.publicId ?? null}
                    selectedSpaceId={selectedSpace?.publicId ?? null}
                    onSelectBranch={selectBranch}
                    onSelectSpace={selectSpace}
                    returnTo={returnTo}
                    monthLabel={monthLabel}
                    monthDays={monthDays}
                    monthCells={monthCells}
                    onPrevMonth={goPrevMonth}
                    onNextMonth={goNextMonth}
                    onSelectDay={selectDay}
                />

                <section className="booking_calendar_main">
                    <header className="booking_calendar_toolbar">
                        <div className="booking_calendar_period">
                            <button type="button" className="booking_calendar_nav_button" onClick={goPrev} aria-label="Período anterior">
                                <ChevronLeft size={17} />
                            </button>
                            <button type="button" className="booking_calendar_nav_button" onClick={goNext} aria-label="Período siguiente">
                                <ChevronRight size={17} />
                            </button>
                            <h1>{periodLabel}</h1>
                            <button type="button" className="booking_calendar_today_button" onClick={goToday}>Hoy</button>
                        </div>

                        <div className="booking_calendar_actions">
                            <div className="booking_calendar_views" role="group" aria-label="Vista del calendario">
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
                                className="booking_calendar_new_button"
                                disabled
                                title="Disponible cuando esté listo el endpoint de creación de reservas"
                            >
                                <CalendarPlus size={16} /> Nueva reserva
                            </button>
                        </div>
                    </header>

                    <div className="booking_calendar_selection">
                        <span className="booking_calendar_chip">
                            <Building2 size={14} /> {company.name}
                        </span>
                        <span className="booking_calendar_chip">
                            <MapPin size={14} /> {selectedBranch?.name ?? 'Sin sucursal'}
                        </span>
                        <span className="booking_calendar_chip accent">
                            <Plus size={14} /> {selectedSpace?.name ?? 'Sin espacio seleccionado'}
                        </span>
                    </div>

                    <div className="booking_calendar_view">
                        {view === 'month' ? (
                            <MonthGrid monthDays={monthDays} cells={monthCells} onSelect={selectDay} />
                        ) : (
                            <TimeGrid
                                view={view}
                                days={visibleDays}
                                slots={timeSlots}
                                spaceName={selectedSpace?.name ?? null}
                            />
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Bookings;
