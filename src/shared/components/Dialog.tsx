import { useEffect, useState } from 'react';
import type { AnimationEvent, ComponentType } from 'react';
import { X, Info, CircleAlert, CircleCheck } from 'lucide-react';
import { Button } from './Button';
import '../styles/Dialog.css';

/**
 * Variantes del diálogo — cada una define el color (token) del ícono y de la
 * acción principal:
 * - `primary` — confirmación normal, verde de marca (`--primary`).
 * - `danger`  — acción destructiva, rojo (`--danger`).
 * - `info`    — aviso informativo, azul (`--info`).
 */
type DialogVariant = 'primary' | 'danger' | 'info';

interface DialogAction {
    label: string;
    onClick: () => void;
    icon?: DialogIcon;
}

interface DialogProps {
    isOpen: boolean;
    /** Bloquea cierre y acciones mientras se procesa la confirmación. */
    isLoading?: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    /** Variante del diálogo — primary (default), danger o info. */
    variant?: DialogVariant;
    primaryAction: DialogAction;
    secondaryAction?: DialogAction;
}

type DialogIcon = ComponentType<{ size?: number; className?: string }>;

const VARIANT_ICON: Record<DialogVariant, DialogIcon> = {
    primary: CircleCheck,
    danger: CircleAlert,
    info: Info,
};

const VARIANT_BUTTON_COLOR: Record<DialogVariant, 'primary' | 'danger' | 'info'> = {
    primary: 'primary',
    danger: 'danger',
    info: 'info',
};

/**
 * Diálogo de confirmación genérico: ícono con el color de la variante, título,
 * descripción y hasta dos acciones en el pie (la principal a la derecha).
 */
export const Dialog = ({ isOpen, isLoading = false, onClose, title, description, variant = 'primary', primaryAction, secondaryAction }: DialogProps) => {
    // Sigue montado hasta que termina la animación de salida (ignora las de los hijos).
    const [isRendered, setIsRendered] = useState(isOpen);

    if (isOpen && !isRendered) setIsRendered(true);

    const isClosing = isRendered && !isOpen;

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isLoading) onClose();
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, isLoading, onClose]);

    useEffect(() => {
        if (!isRendered) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = previousOverflow; };
    }, [isRendered]);

    // Desmonta al terminar la animación de salida del overlay.
    const handleAnimationEnd = (e: AnimationEvent<HTMLDivElement>) => {
        if (isClosing && e.target === e.currentTarget) setIsRendered(false);
    };

    if (!isRendered) return null;

    const Icon = VARIANT_ICON[variant];

    return (
        <div className={`dialog_overlay ${isClosing ? 'is_closing' : ''}`} onAnimationEnd={handleAnimationEnd}>
            <div className={`dialog_container dialog_${variant}`} role="alertdialog" aria-modal="true" aria-label={title} aria-busy={isLoading}>
                <header className="dialog_header">
                    <h2 className="dialog_title">
                        <span className="dialog_icon">
                            <Icon size={16} />
                        </span>
                        {title}
                    </h2>
                    <button type="button" className="dialog_close_btn" disabled={isLoading} onClick={onClose} aria-label="Cerrar">
                        <X size={18} />
                    </button>
                </header>

                {description && (
                    <div className="dialog_body">
                        <p className="dialog_description">{description}</p>
                    </div>
                )}

                <footer className="dialog_footer">
                    {secondaryAction && (
                        <Button text={secondaryAction.label} color="secondary" disabled={isLoading} onClick={secondaryAction.onClick} />
                    )}
                    <Button text={primaryAction.label} icon={primaryAction.icon} color={VARIANT_BUTTON_COLOR[variant]} loading={isLoading} onClick={primaryAction.onClick} />
                </footer>
            </div>
        </div>
    );
};

export default Dialog;
