import { AlertCircle, Building2, CalendarPlus, ChevronLeft, ChevronRight, Dumbbell, LoaderCircle, Plus, RefreshCw, Store } from 'lucide-react';
import type { CSSProperties } from 'react';
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

    usePageHeader({
        visible: true,
        title: 'Hola',
        showCard: false,
        breadcrumbs: [
            { label: 'Reservas', path: '/bookings' },
            { label: isTreeLoading ? 'Cargando...' : company?.name || '-'  },
        ],
        extra: <div className='header_global_extra'>
            <button type="button" className="booking_calendar_add_button" aria-label="Agregar reserva">
                <Plus size={17} />
            </button>
        </div>
    });

    return (
        <div className={`booking_calendar${view === 'week' ? ' is_week' : ''}`}>

            {/* Sidebar */}
            <Sidebar />

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
                                title="Disponible cuando esté listo el endpoint de creación de reservas"
                            >
                                <CalendarPlus size={16} /> Nueva reserva
                            </button>
                        </div>
                    </aside>

                    <aside className="toolbar_bottom">
                        <div className="context_chips" aria-busy={isTreeLoading}>
                            {isTreeLoading ? (
                                <div className="context_placeholder" role="status">
                                    <LoaderCircle size={15} className="context_spinner" aria-hidden="true" />
                                    <span>Cargando empresa, sucursal y espacio…</span>
                                </div>
                            ) : (
                                <>
                                    <span className="chips"><Building2 size={15} /> {company?.name}</span>
                                    <span className="chips"><Store size={15} /> {selectedBranch?.name}</span>
                                    <span className="chips accent"><Dumbbell size={15} /> {selectedSpace?.name}</span>
                                </>
                            )}
                        </div>

                        {treeError && (
                            <div className="inline_error" role="alert">
                                <AlertCircle size={14} />
                                <span>{treeError}</span>
                                <button type="button" onClick={retry}>
                                    <RefreshCw size={13} /> Reintentar
                                </button>
                            </div>
                        )}
                    </aside>
                </header>

                <main className="calendar_box">
                    {view === 'month' ? (
                        <div className="month_view">
                            <div className="month_weekdays" aria-hidden="true">
                                {monthDays.map((day) => <span key={day}>{day}</span>)}
                            </div>
                            <div className="month_days">
                                {monthCells.map((cell) => (
                                    <div
                                        key={cell.key}
                                        className={`month_day${cell.inMonth ? '' : ' out'}${cell.isToday ? ' today' : ''}${cell.isSelected ? ' selected' : ''}`}
                                        onClick={() => selectDay(cell.date)}
                                        aria-label={cell.date.toLocaleDateString('es-ES', { dateStyle: 'full' })}
                                        aria-current={cell.isToday ? 'date' : undefined}
                                    >
                                        <span className="month_num">{cell.dayNumber}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="calendar_timegrid" style={{ '--booking-hour-count': timeSlots.length } as CSSProperties}>
                            <div className={`timegrid_head ${view === 'day' ? 'is_day' : 'is_week'}`}>
                                <span />
                                {visibleDays.map((day) => (
                                    <div key={day.key} className={`day_head${day.isToday ? ' today' : ''}`}>
                                        <span>{day.weekday}</span>
                                        <strong className='center'>{day.dayNumber}</strong>
                                    </div>
                                ))}
                            </div>
                            <div className="timegrid_body">
                                <div className={`timegrid_content ${view === 'day' ? 'is_day' : 'is_week'}`}>
                                    <div className="time_labels">
                                        {timeSlots.map((slot, index) => (
                                            <div className="time_box" key={slot}>
                                                {(view !== 'week' || index > 0) && <span>{slot}</span>}
                                            </div>
                                        ))}
                                    </div>
                                    {visibleDays.map((day) => (
                                        <div key={day.key} className="day_column" aria-hidden="true">
                                            {timeSlots.map((slot) => <div key={slot} className="hour_slot" data-start-time={slot} />)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Bookings;
