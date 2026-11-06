import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, LoaderCircle, RotateCw } from 'lucide-react';
import useCalendar from '../hooks/useCalendar';
import '../styles/Sidebar.css';

/**
 * Sidebar del calendario de reservas: marca, mini calendario y selectores de
 * sucursal y espacio. Lee el estado global con `useCalendar`, sin props.
 */
export const Sidebar = () => {
    const {
        company, branches, spaces, selectedBranch, selectedSpace,
        isTreeLoading, treeError, retry, selectBranch, selectSpace,
        monthLabel, monthDays, monthCells, goPrevMonth, goNextMonth, selectDay, returnTo,
    } = useCalendar();

    return (
        <aside className="booking_calendar_sidebar">
            <div className="booking_calendar_brand">
                <span className="booking_calendar_brand_icon"><CalendarDays size={19} /></span>
                <div>
                    <strong>Reservas</strong>
                    <span>{company?.name ?? (isTreeLoading ? 'Cargando sucursales…' : 'Sin sucursal')}</span>
                </div>
            </div>

            <section className="booking_calendar_mini" aria-label="Mini calendario">
                <div className="booking_calendar_mini_head">
                    <h2>{monthLabel}</h2>
                    <div className="booking_calendar_mini_nav">
                        <button type="button" onClick={goPrevMonth} aria-label="Mes anterior"><ChevronLeft size={15} /></button>
                        <button type="button" onClick={goNextMonth} aria-label="Mes siguiente"><ChevronRight size={15} /></button>
                    </div>
                </div>
                <div className="booking_calendar_mini_week" aria-hidden="true">
                    {monthDays.map((day) => <span key={day}>{day.slice(0, 1)}</span>)}
                </div>
                <div className="booking_calendar_mini_grid">
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

            <section className="booking_calendar_side_section" aria-labelledby="booking-branches-title">
                <div className="booking_calendar_side_head">
                    <h2 id="booking-branches-title">Sucursales</h2>
                    <span>{isTreeLoading ? '…' : branches.length}</span>
                </div>
                <div className="booking_calendar_side_list">
                    {isTreeLoading ? (
                        <p className="booking_calendar_side_feedback" role="status">
                            <span className="booking_calendar_side_feedback_row">
                                <LoaderCircle size={14} className="is_spinning" /> Cargando sucursales…
                            </span>
                        </p>
                    ) : treeError ? (
                        <div className="booking_calendar_side_feedback" role="alert">
                            <span className="booking_calendar_side_feedback_row">
                                <AlertCircle size={14} /> {treeError}
                            </span>
                            <button type="button" className="booking_calendar_side_retry" onClick={retry}>
                                <RotateCw size={13} /> Reintentar
                            </button>
                        </div>
                    ) : branches.length ? branches.map((branch) => (
                        <button
                            key={branch.publicId}
                            type="button"
                            className={`booking_calendar_side_item${branch.publicId === selectedBranch?.publicId ? ' active' : ''}`}
                            onClick={() => selectBranch(branch.publicId)}
                            aria-pressed={branch.publicId === selectedBranch?.publicId}
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
                    <span>{isTreeLoading ? '…' : spaces.length}</span>
                </div>
                <div className="booking_calendar_side_list">
                    {isTreeLoading ? (
                        <p className="booking_calendar_side_empty">Esperando las sucursales…</p>
                    ) : spaces.length ? spaces.map((space) => (
                        <button
                            key={space.publicId}
                            type="button"
                            className={`booking_calendar_side_item booking_calendar_space_item${space.publicId === selectedSpace?.publicId ? ' active' : ''}`}
                            onClick={() => selectSpace(space.publicId)}
                            aria-pressed={space.publicId === selectedSpace?.publicId}
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
};

export default Sidebar;
