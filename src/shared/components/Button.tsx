import type { ButtonHTMLAttributes, ComponentType, CSSProperties } from 'react';
import '../styles/Button.css';

/** Tamaños disponibles — cada uno define su propio padding/font-size/radius. */
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

/** Colores con nombre ya definidos en el sistema de diseño (`shared/styles/colors.css`). */
type ButtonColorName = 'primary' | 'secondary' | 'danger';

/** Nombre de color del sistema, o un hex propio (ej. `'#2c9d75'`) para casos puntuales fuera de la paleta. */
type ButtonColor = ButtonColorName | `#${string}`;

const NAMED_COLORS: readonly ButtonColorName[] = ['primary', 'secondary', 'danger'];
const isNamedColor = (color: ButtonColor): color is ButtonColorName =>
    (NAMED_COLORS as readonly string[]).includes(color);

const ICON_SIZE_BY_SIZE: Record<ButtonSize, number> = { xs: 14, sm: 16, md: 18, lg: 20 };

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
    /** Texto visible dentro del botón. */
    text: string;
    /**
     * Color del botón.
     * - `'primary'` (default) — verde de marca, `var(--primary)`.
     * - `'secondary'` — contorno neutro, `var(--border-strong)`.
     * - `'danger'` — rojo, `var(--danger)`.
     * - Hex propio, ej. `'#2c9d75'` — para un color puntual fuera de la paleta. Texto queda blanco en este caso.
     * @default 'primary'
     */
    color?: ButtonColor;
    /**
     * Tamaño del botón.
     * - `'xs'` — compacto, ej. acciones dentro de una fila de tabla.
     * - `'sm'` / `'md'` (default) / `'lg'` — escala normal de formularios y toolbars.
     */
    size?: ButtonSize;
    /** Ícono opcional a renderizar junto al texto — se oculta mientras `loading` está en `true`. */
    icon?: ComponentType<{ size?: number; className?: string }>;
    /**
     * De qué lado del texto va el ícono.
     * @default 'right'
     */
    iconPosition?: 'left' | 'right';
    /**
     * Reemplaza el ícono por un spinner y deshabilita el botón mientras está en `true`.
     * @default false
     */
    loading?: boolean;
}

/**
 * Botón único reutilizable para toda la app — color `primary` por defecto
 * (o `secondary`/`danger`/hex propio), 4 tamaños (`xs`/`sm`/`md`/`lg`),
 * ícono opcional a cualquier lado y estado de carga con spinner.
 */
export const Button = ({
    text,
    color = 'primary',
    size = 'md',
    icon: Icon,
    iconPosition = 'right',
    loading = false,
    disabled = false,
    type = 'button',
    className = '',
    style,
    ...rest
}: ButtonProps) => {
    const named = isNamedColor(color);

    // Color con nombre → clase fija del sistema. Hex propio → variable CSS
    // (--btn-custom-color), único caso donde el componente toca `style`.
    const colorClassName = named ? `btn_app_${color}` : 'btn_app_custom';
    const colorStyle = named ? style : ({ ...style, '--btn-custom-color': color } as CSSProperties);

    return (
        <button
            type={type}
            className={`btn_app ${colorClassName} btn_app_${size} ${iconPosition === 'left' ? 'icon_left' : ''} ${className}`.trim()}
            style={colorStyle}
            disabled={disabled || loading}
            {...rest}
        >
            {Icon && !loading && <Icon size={ICON_SIZE_BY_SIZE[size]} className="app-button__icon" />}
            {loading && <span className="app-button__loader" />}
            {text && <span className="app-button__text">{text}</span>}
        </button>
    );
};

export default Button;
