import { useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { CircleCheck, CircleOff, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { EntityStatus } from '../interfaces/sucursal.interface';
import '../styles/StatusSwitch.css';

export type { EntityStatus };

const OPTIONS: { value: EntityStatus; label: string; icon: LucideIcon }[] = [
    { value: 'ACTIVE', label: 'Activo', icon: CircleCheck },
    { value: 'MAINTENANCE', label: 'Mantenimiento', icon: Wrench },
    { value: 'INACTIVE', label: 'Inactivo', icon: CircleOff },
];

interface StatusSwitchProps {
    /** Estado actual. */
    value: EntityStatus;
    /** Se dispara con el nuevo estado al mover el interruptor. */
    onChange: (status: EntityStatus) => void;
    /** Bloquea la interacción. */
    disabled?: boolean;
}

/**
 * Interruptor de estado de 3 posiciones — ACTIVO (izquierda), MANTENIMIENTO
 * (medio) e INACTIVO (derecha). El control deslizante se mueve a la posición
 * elegida y toma el color semántico del estado.
 *
 * Se usa igual en sucursal y espacio: el valor es el status crudo del backend
 * (`ACTIVE` | `MAINTENANCE` | `INACTIVE`).
 */
export const StatusSwitch = ({ value, onChange, disabled = false }: StatusSwitchProps) => {
    const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const selectedIndex = Math.max(0, OPTIONS.findIndex((option) => option.value === value));

    /** Selecciona la opción y le pasa el foco. */
    const select = (index: number) => {
        const option = OPTIONS[index];
        if (!option || disabled) return;
        onChange(option.value);
        optionRefs.current[index]?.focus();
    };

    // Un switch se mueve con las flechas, como un radiogroup real.
    const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
        const last = OPTIONS.length - 1;
        let next: number | null = null;

        if (e.key === 'ArrowRight') next = index === last ? 0 : index + 1;
        else if (e.key === 'ArrowLeft') next = index === 0 ? last : index - 1;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = last;

        if (next === null) return;
        e.preventDefault();
        select(next);
    };

    return (
        <div className="status_switch" role='radiogroup'>
            {/* Control deslizante — se posiciona con el índice del estado. */}
            <span className={`status_switch_thumb is_${value.toLowerCase()}`} style={{ transform: `translateX(${selectedIndex * 100}%)` }} />

            {OPTIONS.map((option, index) => (
                <button
                    key={option.value}
                    ref={(el) => { optionRefs.current[index] = el; }}
                    type="button"
                    role="radio"
                    aria-checked={option.value === value}
                    disabled={disabled}
                    className={`status_switch_option is_${option.value.toLowerCase()}${option.value === value ? ' is_selected' : ''}`}
                    onClick={() => onChange(option.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                >
                    <option.icon size={14} strokeWidth={2.5} />
                    <span>{option.label}</span>
                </button>
            ))}
        </div>
    );
};

export default StatusSwitch;
