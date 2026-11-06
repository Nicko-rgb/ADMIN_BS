import { AlertCircle, Building2, CalendarPlus, ChevronLeft, ChevronRight, Clock, MapPin, Plus, RefreshCw } from 'lucide-react';
import { usePageHeader } from '../../../shared/store/headerStore';
import { Sidebar } from '../components/Sidebar';
import useCalendar from '../hooks/useCalendar';
import type { BookingCalendarViewOption } from '../interfaces/booking.interface';
import '../styles/bookingColors.css';
import '../styles/Bookings.css';

const VIEW_OPTIONS: BookingCalendarViewOption[] = [
    { value: 'day', label: 'Día' },
    { value: 'week', label: 'Semana' },
    { value: 'month', label: 'Mes' },
];

/* ── Página ───────────────────────────────────────────────────────────────── */

const Bookings = () => {
    const {
        company, selectedBranch, selectedSpace,
        isTreeLoading, treeError, retry,
        view, setView, periodLabel, visibleDays, monthDays, monthCells, timeSlots,
        goPrev, goNext, goToday, selectDay,
    } = useCalendar();

    usePageHeader({ visible: false });

    return (
        <main className="booking_calendar_page">
            <div className="booking_calendar_shell">
                <Sidebar />

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
                            <Building2 size={14} /> {company?.name ?? (isTreeLoading ? 'Cargando empresa…' : 'Sin empresa')}
                        </span>
                        <span className="booking_calendar_chip">
                            <MapPin size={14} /> {selectedBranch?.name ?? (isTreeLoading ? 'Cargando sucursal…' : 'Sin sucursal')}
                        </span>
                        <span className="booking_calendar_chip accent">
                            <Plus size={14} /> {selectedSpace?.name ?? (isTreeLoading ? 'Cargando espacio…' : 'Sin espacio seleccionado')}
                        </span>

                        {treeError && (
                            <div className="booking_calendar_inline_error" role="alert">
                                <AlertCircle size={14} />
                                <span>{treeError}</span>
                                <button type="button" onClick={retry}>
                                    <RefreshCw size={13} /> Reintentar
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="booking_calendar_view">
                        {view === 'month' ? (
                            <div className="booking_calendar_month_view">
                                <div className="booking_calendar_month_weekdays" aria-hidden="true">
                                    {monthDays.map((day) => <span key={day}>{day}</span>)}
                                </div>
                                <div className="booking_calendar_month_days">
                                    {monthCells.map((cell) => (
                                        <button
                                            key={cell.key}
                                            type="button"
                                            className={`booking_calendar_month_day${cell.inMonth ? '' : ' out'}${cell.isToday ? ' today' : ''}${cell.isSelected ? ' selected' : ''}`}
                                            onClick={() => selectDay(cell.date)}
                                            aria-label={cell.date.toLocaleDateString('es-ES', { dateStyle: 'full' })}
                                            aria-current={cell.isToday ? 'date' : undefined}
                                        >
                                            <span className="booking_calendar_month_num">{cell.dayNumber}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="booking_calendar_timegrid">
                                <div className={`booking_calendar_timegrid_head ${view === 'day' ? 'is_day' : 'is_week'}`}>
                                    <span />
                                    {visibleDays.map((day) => (
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
                                                {timeSlots.map((slot) => <span key={slot}>{slot}</span>)}
                                            </div>
                                            {visibleDays.map((day) => (
                                                <div key={day.key} className="booking_calendar_day_column" aria-hidden="true" />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="booking_calendar_timegrid_empty">
                                        <div className="booking_calendar_timegrid_empty_card">
                                            <Clock size={20} />
                                            <strong>Sin reservas por ahora</strong>
                                            <p>
                                                {isTreeLoading
                                                    ? 'Cargando sucursales y espacios deportivos…'
                                                    : selectedSpace
                                                        ? `Aún no hay reservas para ${selectedSpace.name} en este período.`
                                                        : 'Selecciona un espacio deportivo para empezar a ver su agenda.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Bookings;
