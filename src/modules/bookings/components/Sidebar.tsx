import { AlertCircle, CalendarDays, ChevronLeft, ChevronRight, Dumbbell, LoaderCircle, Store } from 'lucide-react';
import useCalendar from '../hooks/useCalendar';
import { BookingSelect } from './BookingSelect';
import '../styles/Sidebar.css';

/**
 * Sidebar del calendario de reservas: marca, mini calendario y selectores de
 * sucursal y espacio. Lee el estado global con `useCalendar`, sin props.
 */
export const Sidebar = () => {
    const {
        company, branches, spaces, selectedBranch, selectedSpace,
        isTreeLoading, treeError, selectBranch, selectSpace,
        monthLabel, monthDays, monthCells, goPrevMonth, goNextMonth, selectDay,
    } = useCalendar();

    return (
        <aside className="calendar_sidebar">
            <div className="brand">
                <span className="brand_icon"><CalendarDays size={19} /></span>
                <div>
                    <strong>Reservas</strong>
                    <span>{company?.name ?? (isTreeLoading ? 'Cargando sucursales…' : 'Sin sucursal')}</span>
                </div>
            </div>

            <section className="calendar_mini" aria-label="Mini calendario">
                <div className="mini_head">
                    <h2>{monthLabel}</h2>
                    <div className="mini_nav">
                        <button type="button" onClick={goPrevMonth} aria-label="Mes anterior"><ChevronLeft size={15} /></button>
                        <button type="button" onClick={goNextMonth} aria-label="Mes siguiente"><ChevronRight size={15} /></button>
                    </div>
                </div>
                <div className="mini_week" aria-hidden="true">
                    {monthDays.map((day) => <span key={day}>{day.slice(0, 1)}</span>)}
                </div>
                <div className="mini_grid">
                    {monthCells.map((cell) => (
                        <button
                            key={cell.key}
                            type="button"
                            className={`booking_calendar_mini_day${cell.inMonth ? '' : ' out'}${cell.isToday ? ' today' : ''}${cell.isSelected ? ' selected' : ''}`}
                            onClick={() => selectDay(cell.date)}
                            aria-label={cell.date.toLocaleDateString('es-ES', { dateStyle: 'full' })}
                            aria-current={cell.isToday ? 'date' : undefined}
                        >
                            {cell.dayNumber}
                        </button>
                    ))}
                </div>
            </section>

            <section className="selectors_tree" aria-label="Sucursal y espacio">
                {isTreeLoading ? (
                    <div className="loading" role="status">
                        <LoaderCircle size={18} className="is_spinning" aria-hidden="true" />
                        <span>Cargando datos...</span>
                    </div>
                ) : treeError ? (
                    <div className="side_feedback" role="alert">
                        <AlertCircle size={14} aria-hidden="true" /> {treeError || 'Error al cargar datos'}
                    </div>
                ) : (
                    <>
                        <BookingSelect
                            label="Sucursal"
                            icon={Store}
                            options={branches}
                            value={selectedBranch?.publicId}
                            emptyMessage="Sin sucursales disponibles"
                            onChange={selectBranch}
                        />
                        <BookingSelect
                            key={selectedBranch?.publicId ?? 'no-branch'}
                            label="Espacio deportivo"
                            icon={Dumbbell}
                            options={spaces}
                            value={selectedSpace?.publicId}
                            emptyMessage="Sin espacios disponibles"
                            onChange={selectSpace}
                        />
                    </>
                )}
            </section>
        </aside>
    );
};

export default Sidebar;
