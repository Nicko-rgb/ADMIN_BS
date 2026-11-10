import { useState } from 'react';
import {
    AlertCircle, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight,
    Dumbbell, LoaderCircle, Store,
} from 'lucide-react';
import type { BookingSidebarProps } from '../interfaces/booking.interface';
import '../styles/Sidebar.css';

/**
 * Sidebar del calendario: marca, mini calendario y selectores. Recibe la
 * empresa ya capturada del árbol y deriva sus sucursales accesibles y los
 * espacios de la sucursal seleccionada.
 */
export const Sidebar = ({
    company,
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
    const [branchOpen, setBranchOpen] = useState(false);
    const [spaceOpen, setSpaceOpen] = useState(false);

    const branches = (company?.sucursales ?? []).filter((branch) => branch.access);
    const selectedBranch = branches.find((branch) => branch.publicId === selectedBranchId) ?? null;
    const spaces = (selectedBranch?.spaces ?? []).filter((space) => space.access);
    const selectedSpace = spaces.find((space) => space.publicId === selectedSpaceId) ?? null;

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
                        <div className="booking_select">
                            <div className="booking_select_label">
                                <span className="booking_select_label_text">
                                    <Store size={14} aria-hidden="true" /> Sucursal
                                </span>
                                <span aria-hidden="true">{branches.length}</span>
                            </div>
                            <button
                                type="button"
                                className="booking_select_trigger"
                                aria-label={`Sucursal: ${selectedBranch?.name ?? 'Sin sucursales disponibles'}`}
                                aria-haspopup="listbox"
                                aria-expanded={branchOpen}
                                disabled={!branches.length}
                                onClick={() => { setBranchOpen(!branchOpen); setSpaceOpen(false); }}
                            >
                                <span className="booking_select_value" title={selectedBranch?.name}>
                                    {selectedBranch?.name ?? 'Sin sucursales disponibles'}
                                </span>
                                <ChevronDown size={15} className="booking_select_arrow" aria-hidden="true" />
                            </button>
                            {branchOpen && branches.length > 0 && (
                                <>
                                    <button type="button" className="booking_select_backdrop" aria-label="Cerrar" onClick={() => setBranchOpen(false)} />
                                    <div className="booking_select_menu" role="listbox">
                                        {branches.map((branch) => (
                                            <button
                                                key={branch.publicId}
                                                type="button"
                                                role="option"
                                                aria-selected={branch.publicId === selectedBranchId}
                                                className="booking_select_option"
                                                onClick={() => { onSelectBranch(branch.publicId); setBranchOpen(false); }}
                                            >
                                                <span>{branch.name}</span>
                                                {branch.publicId === selectedBranchId && <Check size={14} aria-hidden="true" />}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="booking_select">
                            <div className="booking_select_label">
                                <span className="booking_select_label_text">
                                    <Dumbbell size={14} aria-hidden="true" /> Espacio deportivo
                                </span>
                                <span aria-hidden="true">{spaces.length}</span>
                            </div>
                            <button
                                type="button"
                                className="booking_select_trigger"
                                aria-label={`Espacio deportivo: ${selectedSpace?.name ?? 'Sin espacios disponibles'}`}
                                aria-haspopup="listbox"
                                aria-expanded={spaceOpen}
                                disabled={!spaces.length}
                                onClick={() => { setSpaceOpen(!spaceOpen); setBranchOpen(false); }}
                            >
                                <span className="booking_select_value" title={selectedSpace?.name}>
                                    {selectedSpace?.name ?? 'Sin espacios disponibles'}
                                </span>
                                <ChevronDown size={15} className="booking_select_arrow" aria-hidden="true" />
                            </button>
                            {spaceOpen && spaces.length > 0 && (
                                <>
                                    <button type="button" className="booking_select_backdrop" aria-label="Cerrar" onClick={() => setSpaceOpen(false)} />
                                    <div className="booking_select_menu" role="listbox">
                                        {spaces.map((space) => (
                                            <button
                                                key={space.publicId}
                                                type="button"
                                                role="option"
                                                aria-selected={space.publicId === selectedSpaceId}
                                                className="booking_select_option"
                                                onClick={() => { onSelectSpace(space.publicId); setSpaceOpen(false); }}
                                            >
                                                <span>{space.name}</span>
                                                {space.publicId === selectedSpaceId && <Check size={14} aria-hidden="true" />}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}
            </section>

            {/* Legends */}
            <section className="booking_legend" aria-label="Leyendas">
                <h3>Leyendas</h3>
                <ul className="booking_legend_items">
                    <li>
                        <span className="booking_legend_swatch is_closed" aria-hidden="true" />
                        <span>Fuera de horario</span>
                    </li>
                </ul>
            </section>
        </aside>
    );
};

export default Sidebar;
