import { CalendarDays, Check, ChevronRight, Moon, Plus, Search, Sun } from 'lucide-react';
import './prueba.css';

const colorGroups = [
    {
        title: 'Marca y acento',
        colors: ['primary', 'primary-dark', 'primary-light', 'primary-border', 'primary-text', 'accent', 'accent-dark', 'accent-light'],
    },
    {
        title: 'Fondos y superficies',
        colors: ['color-bg', 'surface', 'surface-muted', 'input-bg', 'gray-light', 'gray-medium', 'gray-dark', 'border'],
    },
    {
        title: 'Texto y controles',
        colors: ['text', 'text-soft', 'text-muted', 'text-white', 'secondary', 'secondary-dark', 'secondary-light', 'secondary-text', 'focus-ring', 'focus-border', 'disabled-bg', 'disabled-text', 'disabled-border'],
    },
    {
        title: 'Estados',
        colors: ['success', 'success-dark', 'success-light', 'danger', 'danger-dark', 'danger-light', 'warning', 'warning-dark', 'warning-light', 'info', 'info-dark', 'info-light'],
    },
] as const;

const statuses = [
    { label: 'Confirmada', tone: 'success' },
    { label: 'Pendiente', tone: 'warning' },
    { label: 'Cancelada', tone: 'danger' },
    { label: 'Información', tone: 'info' },
] as const;

function ThemePreview({ mode }: { mode: 'light' | 'dark' }) {
    const isDark = mode === 'dark';

    return (
        <section className="palette-panel" data-theme={mode} aria-label={`Vista de tema ${isDark ? 'oscuro' : 'claro'}`}>
            <div className="palette-panel__heading">
                <span className="palette-panel__mode-icon" aria-hidden="true">
                    {isDark ? <Moon size={19} /> : <Sun size={19} />}
                </span>
                <div>
                    <span className="palette-eyebrow">Vista previa</span>
                    <h2>Modo {isDark ? 'oscuro' : 'claro'}</h2>
                </div>
                <span className="palette-panel__theme-label">data-theme="{mode}"</span>
            </div>

            <div className="palette-demo">
                <div className="palette-demo__top">
                    <div>
                        <span className="palette-eyebrow">Panel de reservas</span>
                        <h3>Tu espacio, a tu manera.</h3>
                        <p>Una muestra de cómo conviven superficies, textos y acciones.</p>
                    </div>
                    <div className="palette-demo__icon" aria-hidden="true"><CalendarDays size={23} /></div>
                </div>

                <div className="palette-demo__stats">
                    <div><span>Reservas hoy</span><strong>24</strong><small>+12% esta semana</small></div>
                    <div><span>Espacios activos</span><strong>08</strong><small>Todos disponibles</small></div>
                </div>

                <div className="palette-demo__search">
                    <Search size={16} aria-hidden="true" />
                    <span>Buscar una reserva...</span>
                    <kbd>⌘ K</kbd>
                </div>

                <div className="palette-demo__booking">
                    <span className="palette-demo__booking-icon"><CalendarDays size={18} /></span>
                    <div><strong>Cancha principal</strong><small>Hoy · 18:00 – 19:00</small></div>
                    <span className="palette-demo__booking-check"><Check size={15} /></span>
                </div>

                <div className="palette-demo__actions">
                    <button type="button" className="palette-button palette-button--primary"><Plus size={15} /> Nueva reserva</button>
                    <button type="button" className="palette-button palette-button--secondary">Ver agenda <ChevronRight size={15} /></button>
                </div>
            </div>

            <div className="palette-states" aria-label="Colores de estado">
                {statuses.map(({ label, tone }) => <span key={tone} className={`palette-state palette-state--${tone}`}>{label}</span>)}
            </div>

            <div className="palette-catalog">
                <div className="palette-catalog__intro">
                    <h3>Tokens de color</h3>
                    <span>Definidos en colors.css</span>
                </div>
                {colorGroups.map(({ title, colors }) => (
                    <div className="palette-group" key={title}>
                        <h4>{title}</h4>
                        <div className="palette-group__grid">
                            {colors.map((color) => (
                                <div className="palette-swatch" key={color}>
                                    <span className="palette-swatch__sample" style={{ backgroundColor: `var(--${color})` }} />
                                    <code>--{color}</code>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

const PagePrueba = () => (
    <div className="palette-page">
        <header className="palette-page__header">
            <div>
                <span className="palette-eyebrow">Sistema visual · Booking Sport</span>
                <h1>Paleta de colores</h1>
                <p>La misma pantalla en los dos temas, con los tokens reales de la aplicación.</p>
            </div>
            <span className="palette-page__file">shared/styles/colors.css</span>
        </header>
        <div className="palette-page__split">
            <ThemePreview mode="light" />
            <ThemePreview mode="dark" />
        </div>
    </div>
);

export default PagePrueba;
