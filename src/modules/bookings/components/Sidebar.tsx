import { Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import type { BookingMiniCalendarProps, BookingSidebarProps } from '../interfaces/booking.interface';
import '../styles/Sidebar.css';

/**
 * Mini calendario mensual de la sidebar: navegación de mes y selección de día.
 * Vive acá porque su única responsabilidad es acompañar al sidebar del calendario.
 */
const MiniCalendar = ({ monthLabel, monthDays, cells, onPrev, onNext, onSelect }: BookingMiniCalendarProps) => (
    <section className="booking_calendar_mini" aria-label="Mini calendario">
        <div className="booking_calendar_mini_head">
            <h2>{monthLabel}</h2>
            <div className="booking_calendar_mini_nav">
                <button type="button" onClick={onPrev} aria-label="Mes anterior"><ChevronLeft size={15} /></button>
                <button type="button" onClick={onNext} aria-label="Mes siguiente"><ChevronRight size={15} /></button>
            </div>
        </div>
        <div className="booking_calendar_mini_week" aria-hidden="true">
            {monthDays.map((day) => <span key={day}>{day.slice(0, 1)}</span>)}
        </div>
        <div className="booking_calendar_mini_grid">
            {cells.map((cell) => (
                <button
                    key={cell.key}
                    type="button"
                    className={`booking_calendar_mini_day${cell.inMonth ? '' : ' out'}${cell.isToday ? ' today' : ''}${cell.isSelected ? ' selected' : ''}`}
                    onClick={() => onSelect(cell.date)}
                    aria-label={cell.date.toLocaleDateString('es-ES', { dateStyle: 'full' })}
                    aria-current={cell.isToday ? 'date' : undefined}
                >
                    {cell.dayNumber}
                </button>
            ))}
        </div>
    </section>
);

/**
 * Sidebar del calendario de reservas: marca, mini calendario y selectores de
 * sucursal y espacio deportivo. Recibe la selección y los callbacks del hook
 * para mantenerse como componente puramente presentacional.
 */
export const Sidebar = ({
    companyName,
    branches,
    spaces,
    selectedBranchId,
    selectedSpaceId,
    onSelectBranch,
    onSelectSpace,
    returnTo,
    monthLabel,
    monthDays,
    monthCells,
    onPrevMonth,
    onNextMonth,
    onSelectDay,
}: BookingSidebarProps) => (
    <aside className="booking_calendar_sidebar">
        <div className="booking_calendar_brand">
            <span className="booking_calendar_brand_icon"><CalendarDays size={19} /></span>
            <div>
                <strong>Reservas</strong>
                <span>{companyName ?? 'Selecciona una sucursal'}</span>
            </div>
        </div>

        <MiniCalendar
            monthLabel={monthLabel}
            monthDays={monthDays}
            cells={monthCells}
            onPrev={onPrevMonth}
            onNext={onNextMonth}
            onSelect={onSelectDay}
        />

        <section className="booking_calendar_side_section" aria-labelledby="booking-branches-title">
            <div className="booking_calendar_side_head">
                <h2 id="booking-branches-title">Sucursales</h2>
                <span>{branches.length}</span>
            </div>
            <div className="booking_calendar_side_list">
                {branches.length ? branches.map((branch) => (
                    <button
                        key={branch.publicId}
                        type="button"
                        className={`booking_calendar_side_item${branch.publicId === selectedBranchId ? ' active' : ''}`}
                        onClick={() => onSelectBranch(branch.publicId)}
                        aria-pressed={branch.publicId === selectedBranchId}
                    >
                        <span className="booking_calendar_branch_dot" aria-hidden="true" />
                        <span className="booking_calendar_side_name">{branch.name}</span>
                        <span className="booking_calendar_side_count">{branch.spaces.length}</span>
                    </button>
                )) : <p className="booking_calendar_side_empty">Sin sucursales disponibles.</p>}
            </div>
        </section>

        <section className="booking_calendar_side_section" aria-labelledby="booking-spaces-title">
            <div className="booking_calendar_side_head">
                <h2 id="booking-spaces-title">Espacios</h2>
                <span>{spaces.length}</span>
            </div>
            <div className="booking_calendar_side_list">
                {spaces.length ? spaces.map((space) => (
                    <button
                        key={space.publicId}
                        type="button"
                        className={`booking_calendar_side_item booking_calendar_space_item${space.publicId === selectedSpaceId ? ' active' : ''}`}
                        onClick={() => onSelectSpace(space.publicId)}
                        aria-pressed={space.publicId === selectedSpaceId}
                    >
                        <span className="booking_calendar_space_dot" aria-hidden="true" />
                        <span className="booking_calendar_side_name">{space.name}</span>
                    </button>
                )) : <p className="booking_calendar_side_empty">Esta sucursal todavía no tiene espacios deportivos.</p>}
            </div>
        </section>

        <Link className="booking_calendar_back" to={returnTo}>
            <ArrowLeft size={15} /> Volver a reservas
        </Link>
    </aside>
);

export default Sidebar;
