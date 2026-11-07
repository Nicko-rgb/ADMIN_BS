import { AlertCircle, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Dumbbell, LoaderCircle, Store } from 'lucide-react';
import { BookingSelect } from './BookingSelect';
import type { BookingSidebarProps } from '../interfaces/booking.interface';
import '../styles/Sidebar.css';

/**
 * Sidebar del calendario de reservas: marca, mini calendario y selectores de
 * sucursal y espacio. Recibe datos y callbacks desde la página para mantenerse
 * como componente presentacional y no duplicar el estado del calendario.
 */
export const Sidebar = ({
    companyName,
    branches,
    spaces,
    selectedBranchId,
    selectedSpaceId,
    isTreeLoading,
    treeError,
    onSelectBranch,
    onSelectSpace,
    monthLabel,
    monthDays,
    monthCells,
    onPrevMonth,
    onNextMonth,
    onSelectDay,
}: BookingSidebarProps) => {
    return (
        <aside className="calendar_sidebar">
            <div className="brand">
                <span className="brand_icon"><CalendarDays size={19} /></span>
                <div>
                    <strong>Reservas</strong>
                    <span>{companyName ?? (isTreeLoading ? 'Cargando sucursales…' : 'Sin sucursal')}</span>
                </div>
            </div>

            <section className="calendar_mini" aria-label="Mini calendario">
                <div className="mini_head">
                    <h2>{monthLabel}</h2>
                    <div className="mini_nav">
                        <button type="button" onClick={onPrevMonth} aria-label="Mes anterior"><ChevronLeft size={15} /></button>
                        <button type="button" onClick={onNextMonth} aria-label="Mes siguiente"><ChevronRight size={15} /></button>
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
                            onClick={() => onSelectDay(cell.date)}
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
                            value={selectedBranchId ?? undefined}
                            emptyMessage="Sin sucursales disponibles"
                            onChange={onSelectBranch}
                        />
                        <BookingSelect
                            key={selectedBranchId ?? 'no-branch'}
                            label="Espacio deportivo"
                            icon={Dumbbell}
                            options={spaces}
                            value={selectedSpaceId ?? undefined}
                            emptyMessage="Sin espacios disponibles"
                            onChange={onSelectSpace}
                        />
                    </>
                )}
            </section>

            {/* Legends */}
            <details className="booking_legend">
                <summary>
                    <span>Leyendas</span>
                    <ChevronDown size={16} aria-hidden="true" />
                </summary>
                <ul className="booking_legend_items">
                    <li>
                        <span className="booking_legend_swatch is_closed" aria-hidden="true" />
                        <span>Fuera de horario</span>
                    </li>
                </ul>
            </details>
        </aside>
    );
};

export default Sidebar;
